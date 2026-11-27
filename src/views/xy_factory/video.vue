<template>
  <div class="xy-video" :class="{ live: state === 'live' }">
    <video ref="video" muted autoplay playsinline></video>
    <div v-if="state !== 'live'" class="xy-video-state">
      <i v-if="state === 'connecting'" class="spin"></i>
      <span>{{ state === 'connecting' ? '正在连接视频流…' : message }}</span>
      <button v-if="state === 'error'" type="button" @click="connect">重试</button>
    </div>
    <span class="xy-video-tag"><i></i>{{ state === 'live' ? (mode === 'hls' ? 'LIVE · HLS' : 'LIVE') : 'RTSP' }}</span>
  </div>
</template>

<script>
import Hls from "hls.js/dist/hls.light.min.js";
// RTSP 视频：浏览器不能直接播放 RTSP，由流媒体网关（MediaMTX）转为 WebRTC / HLS。
// 1) WebRTC（WHEP，低延迟）：信令走页面同源代理，媒体走网关 UDP/TCP 8189；8 s 内未出画面（ICE 不通、跨网段、防火墙）即放弃；
// 2) 回退 HLS：纯 HTTP，经页面同源代理，任何能打开页面的客户端都能播放（延迟约 1–3 s）。
export default {
  name: "XYVideo",
  props: { whep: { type: String, required: true }, hls: { type: String, default: "" } },
  data: () => ({ state: "connecting", message: "", mode: "" }),
  watch: { whep() { this.connect(); } },
  mounted() { this.connect(); },
  beforeDestroy() { this.close(); },
  methods: {
    close() {
      clearTimeout(this.timer);
      if (this.pc) { this.pc.close(); this.pc = null; }
      if (this.session) fetch(this.session, { method: "DELETE" }).catch(() => {});
      this.session = null;
      if (this.hlsPlayer) { this.hlsPlayer.destroy(); this.hlsPlayer = null; }
      const video = this.$refs.video;
      if (video) { video.srcObject = null; video.removeAttribute("src"); video.load(); }
    },
    async connect() {
      this.close();
      this.state = "connecting";
      const token = (this.token = {});
      try {
        await this.playWebrtc(token);
      } catch (error) {
        if (this.token !== token) return;
        this.playHls(token, error);
      }
    },
    playWebrtc(token) {
      return new Promise((resolve, reject) => {
        const pc = new RTCPeerConnection();
        this.pc = pc;
        const video = this.$refs.video;
        this.timer = setTimeout(() => reject(new Error("WebRTC 超时")), 8000);
        pc.addTransceiver("video", { direction: "recvonly" });
        pc.ontrack = (event) => {
          if (this.token !== token) return;
          video.srcObject = event.streams[0];
          video.onplaying = () => { if (this.token === token && this.mode !== "hls") { clearTimeout(this.timer); this.mode = "webrtc"; this.state = "live"; resolve(); } };
        };
        pc.onconnectionstatechange = () => {
          if (this.token !== token) return;
          if (pc.connectionState === "failed") reject(new Error("WebRTC 连接失败"));
          if (pc.connectionState === "disconnected" && this.state === "live") this.connect();
        };
        (async () => {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          const response = await fetch(this.whep, { method: "POST", headers: { "Content-Type": "application/sdp" }, body: offer.sdp });
          if (!response.ok) throw new Error(`网关返回 ${response.status}`);
          const location = response.headers.get("Location");
          if (location) this.session = new URL(location, window.location.href).href;
          await pc.setRemoteDescription({ type: "answer", sdp: await response.text() });
        })().catch(reject);
      });
    },
    playHls(token, cause) {
      if (this.pc) { this.pc.close(); this.pc = null; }
      clearTimeout(this.timer);
      const video = this.$refs.video;
      video.srcObject = null;
      if (!this.hls) { this.fail(`视频连接失败（${cause.message}）`); return; }
      this.mode = "hls";
      const ok = () => { if (this.token === token) this.state = "live"; };
      if (Hls.isSupported()) {
        const player = new Hls({ lowLatencyMode: true, liveSyncDurationCount: 2, manifestLoadingMaxRetry: 6, manifestLoadingRetryDelay: 1500 });
        this.hlsPlayer = player;
        player.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
        player.on(Hls.Events.FRAG_BUFFERED, ok);
        player.on(Hls.Events.ERROR, (e, data) => {
          if (this.token !== token || !data.fatal) return;
          if (data.type === Hls.ErrorTypes.MEDIA_ERROR) { player.recoverMediaError(); return; }
          this.fail(`视频网关不可用（${data.details}），请确认视频服务已启动`);
        });
        player.loadSource(this.hls);
        player.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = this.hls;
        video.onplaying = ok;
        video.play().catch(() => {});
      } else {
        this.fail("浏览器不支持 HLS 播放");
      }
    },
    fail(message) { this.state = "error"; this.message = message; },
  },
};
</script>

<style scoped>
.xy-video { position:relative; aspect-ratio:16 / 9; border-radius:10px; overflow:hidden; background:#020617; border:1px solid rgba(255,255,255,.1); }
.xy-video video { display:block; width:100%; height:100%; object-fit:cover; }
.xy-video-state { position:absolute; inset:0; display:grid; place-content:center; justify-items:center; gap:8px; padding:12px; color:#94a3b8; font-size:12px; text-align:center; }
.xy-video-state button { height:26px; padding:0 12px; border:1px solid rgba(56,189,248,.4); border-radius:8px; background:rgba(56,189,248,.12); color:#e0f2fe; font-size:12px; }
.spin { width:22px; height:22px; border:2px solid rgba(56,189,248,.25); border-top-color:#38bdf8; border-radius:50%; animation:xy-spin .8s linear infinite; }
@keyframes xy-spin { to { transform:rotate(360deg); } }
.xy-video-tag { position:absolute; left:8px; bottom:8px; display:flex; align-items:center; gap:5px; padding:1px 7px; border-radius:6px; background:rgba(2,6,23,.65); color:#cbd5e1; font:10px/16px "OPPOSans-M", sans-serif; letter-spacing:.08em; }
.xy-video-tag i { width:6px; height:6px; border-radius:50%; background:#64748b; }
.xy-video.live .xy-video-tag i { background:#ef4444; box-shadow:0 0 6px #ef4444; animation:xy-blink 1.2s infinite; }
@keyframes xy-blink { 50% { opacity:.3; } }
</style>
