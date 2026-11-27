// 国产显卡排查用的 WebGL 诊断（仅 URL 带 ?gldebug=1 时启用）：
// 记录 GPU 信息、每个帧缓冲附件的尺寸，以及“附件尺寸不一致 / 帧缓冲不完整”时的调用栈，结果挂在 window.__glDebug 并打印到控制台。
export function installGlDebug() {
  if (!/[?&]gldebug=1/.test(window.location.search + window.location.hash)) return;
  const P = WebGL2RenderingContext.prototype;
  const D = (window.__glDebug = { gpu: null, limits: null, incomplete: [], renderbuffers: 0, textures: 0 });
  const rbSize = new WeakMap();
  const texSize = new WeakMap();
  let rb = null;
  const tex = new Map();
  const wrap = (name, before) => { const original = P[name]; P[name] = function (...args) { before.call(this, args); return original.apply(this, args); }; };
  wrap("bindRenderbuffer", ([, r]) => { rb = r; });
  wrap("renderbufferStorage", ([, format, w, h]) => { if (rb) { rbSize.set(rb, { w, h, format, samples: 0 }); D.renderbuffers++; } });
  wrap("renderbufferStorageMultisample", ([, samples, format, w, h]) => { if (rb) { rbSize.set(rb, { w, h, format, samples }); D.renderbuffers++; } });
  wrap("bindTexture", ([target, t]) => { tex.set(target, t); });
  wrap("texStorage2D", ([target, levels, format, w, h]) => { const t = tex.get(target); if (t) { texSize.set(t, { w, h, format, levels }); D.textures++; } });
  wrap("texImage2D", (args) => {
    const t = tex.get(args[0]);
    if (t && args[1] === 0 && typeof args[3] === "number" && typeof args[4] === "number") texSize.set(t, { w: args[3], h: args[4], format: args[2] });
  });
  const describe = (gl, point) => {
    const type = gl.getFramebufferAttachmentParameter(gl.DRAW_FRAMEBUFFER, point, gl.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE);
    if (!type) return null;
    const obj = gl.getFramebufferAttachmentParameter(gl.DRAW_FRAMEBUFFER, point, gl.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME);
    return type === gl.RENDERBUFFER ? { kind: "renderbuffer", ...(rbSize.get(obj) || {}) } : { kind: "texture", ...(texSize.get(obj) || {}) };
  };
  const check = function (op) {
    if (D.incomplete.length >= 30) return;
    const status = this.checkFramebufferStatus(this.DRAW_FRAMEBUFFER);
    if (status === this.FRAMEBUFFER_COMPLETE) return;
    const entry = {
      op, status: "0x" + status.toString(16),
      color0: describe(this, this.COLOR_ATTACHMENT0), depth: describe(this, this.DEPTH_ATTACHMENT),
      depthStencil: describe(this, this.DEPTH_STENCIL_ATTACHMENT), viewport: Array.from(this.getParameter(this.VIEWPORT)),
      canvas: [this.canvas.width, this.canvas.height], stack: new Error().stack.split("\n").slice(2, 9).map((s) => s.trim()),
    };
    D.incomplete.push(entry);
    console.error("[gldebug] 帧缓冲不完整", JSON.stringify(entry));
  };
  for (const op of ["clear", "drawElements", "drawArrays", "drawElementsInstanced", "drawArraysInstanced", "blitFramebuffer"]) {
    const original = P[op];
    P[op] = function (...args) { check.call(this, op); return original.apply(this, args); };
  }
  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, attrs) {
    const gl = originalGetContext.call(this, type, attrs);
    if (gl && type === "webgl2" && !D.gpu) {
      const info = gl.getExtension("WEBGL_debug_renderer_info");
      D.gpu = info ? { vendor: gl.getParameter(info.UNMASKED_VENDOR_WEBGL), renderer: gl.getParameter(info.UNMASKED_RENDERER_WEBGL) } : { renderer: gl.getParameter(gl.RENDERER) };
      D.limits = {
        maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE), maxRenderbufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
        maxViewport: Array.from(gl.getParameter(gl.MAX_VIEWPORT_DIMS)), maxSamples: gl.getParameter(gl.MAX_SAMPLES),
        maxTextureUnits: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS), maxCombinedUnits: gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
        maxVertexUnits: gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS), maxFragmentUniforms: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
        maxVertexUniforms: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS), maxVaryings: gl.getParameter(gl.MAX_VARYING_VECTORS),
        extensions: gl.getSupportedExtensions(), contextAttributes: gl.getContextAttributes(),
      };
      console.warn("[gldebug] GPU", JSON.stringify(D.gpu), JSON.stringify(D.limits));
    }
    return gl;
  };
  console.warn("[gldebug] WebGL 诊断已启用：出错后在控制台执行 copy(JSON.stringify(__glDebug)) 复制结果");
}
