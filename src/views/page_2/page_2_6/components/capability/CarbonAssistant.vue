<template>
    <div class="carbon-assistant">
        <div class="ca-center">
            <div ref="msgList" class="ca-messages">
                <div v-for="(msg, idx) in messages" :key="idx" class="ca-msg" :class="msg.role">
                    <img v-if="msg.role === 'ai'" class="ca-avatar ca-avatar-ai" :src="aiIcon" alt="ai" />
                    <div class="ca-bubble" :class="{ 'ca-bubble-thinking': msg.thinking }">
                        <span v-if="msg.thinking" class="ca-thinking-dots"><em>思考中</em><i></i><i></i><i></i></span>
                        <template v-else>
                            {{ msg.text }}
                            <!-- <span v-if="msg.source" class="ca-source">来源：{{ msg.source }}</span> -->
                        </template>
                    </div>
                    <img v-if="msg.role === 'user'" class="ca-avatar ca-avatar-user" :src="personIcon" alt="user" />
                </div>
            </div>
        </div>

        <div class="ca-input">
            <div class="ca-input-wrap">
                <input v-model="inputText" type="text" placeholder="用自然语言提问，例如：今天电费花了多少..." @keyup.enter="send" />
            </div>
            <button class="ca-send" @click="send">发送</button>
        </div>
    </div>
</template>

<script>
import { answerQuestion } from "../../data/qaKnowledge.js";

export default {
    name: "CarbonAssistant",
    props: {
        greeting: { type: String, default: "" },
        // 当前能力模块 id，仅用于检索加权，不限制可回答的范围
        moduleId: { type: String, default: "" },
        aiIcon: { type: String, default: "" },
        personIcon: { type: String, default: "" },
    },
    data() {
        return {
            inputText: "",
            messages: [],
            thinking: false,
        };
    },
    watch: {
        greeting: {
            immediate: true,
            handler() {
                this.resetMessages();
            },
        },
    },
    methods: {
        resetMessages() {
            this.messages = [{ role: "ai", text: this.greeting }];
        },
        send() {
            if (this.thinking) return;
            const text = this.inputText.trim();
            if (!text) return;
            this.pushUser(text);
            this.inputText = "";
            const hit = answerQuestion(text, this.moduleId);
            this.pushAiWithThinking(hit.text, hit.source);
        },
        pushUser(text) {
            this.messages.push({ role: "user", text });
            this.scrollBottom();
        },
        pushAiWithThinking(text, source) {
            this.thinking = true;
            this.messages.push({ role: "ai", text: "", thinking: true });
            this.scrollBottom();
            const idx = this.messages.length - 1;
            setTimeout(() => {
                this.messages.splice(idx, 1, { role: "ai", text, source: source || "" });
                this.thinking = false;
                this.scrollBottom();
            }, 700);
        },
        scrollBottom() {
            this.$nextTick(() => {
                const el = this.$refs.msgList;
                if (el) el.scrollTop = el.scrollHeight;
            });
        },
    },
};
</script>

<style lang="scss" scoped>
.carbon-assistant {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    gap: 0.6rem;
}

.ca-center {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    padding: 0.8rem 0rem 0.5rem 0.6rem;
    border-radius: px2rem(4);
    opacity: 1;
    background: rgba(56, 77, 103, 0.3);
    box-sizing: border-box;
    border: px2rem(1) solid rgba(207, 231, 255, 0.2);
}

.ca-messages {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    padding: 0rem 0.6rem 0.2rem 0.1rem;

    &::-webkit-scrollbar {
        width: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(120, 150, 200, 0.4);
        border-radius: 2px;
    }
}

.ca-msg {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;

    &.user {
        justify-content: flex-end;
    }
}

.ca-avatar {
    flex-shrink: 0;
    object-fit: contain;
}

.ca-avatar-ai {
    margin-top: 0.2rem;
    width: px2rem(18.33);
    height: px2rem(11);
}

.ca-avatar-user {
    padding: 0;
    width: px2rem(15);
    height: px2rem(15);
}

.ca-bubble {
    padding: 0 0 0 px2rem(2);
    font-size: px2rem(11);
    line-height: px2rem(18);
    color: #d7e6fb;
    font-family: var(--font-family-primary-Medium);
    border-radius: px2rem(4);
    white-space: pre-line;
    word-break: break-word;
}

.ca-bubble-thinking {
    display: flex;
    align-items: center;
    height: px2rem(18);
}

.ca-thinking-dots {
    display: inline-flex;
    align-items: center;
    gap: px2rem(3);

    em {
        margin-right: px2rem(1);
        font-style: normal;
        font-size: px2rem(10);
        line-height: px2rem(18);
        color: #d7e6fb;
        font-family: var(--font-family-primary-Medium);
    }

    i {
        display: block;
        width: px2rem(4);
        height: px2rem(4);
        border-radius: 50%;
        background: rgba(155, 248, 255, 0.7);
        animation: ca-dot-bounce 1.4s ease-in-out infinite;

        &:nth-child(2) {
            animation-delay: 0.16s;
        }

        &:nth-child(3) {
            animation-delay: 0.32s;
        }
    }
}

@keyframes ca-dot-bounce {

    0%,
    80%,
    100% {
        opacity: 0.3;
        transform: scale(0.8);
    }

    40% {
        opacity: 1;
        transform: scale(1.1);
    }
}

.ca-msg.user .ca-bubble {
    position: relative;
    padding: px2rem(3) px2rem(15);
    letter-spacing: 0.02rem;
    color: #d7e6fb;
    background: linear-gradient(106deg,
            #4ab2bb66 3%,
            #5187d866 103%);
    border-radius:
        px2rem(14) 0 px2rem(22) px2rem(14);
    box-sizing: border-box;
    white-space: pre-line;
    word-break: break-word;
    /*
     * 让文字显示在渐变边框上面
     */
    z-index: 0;
}

/*
 * 渐变边框
 */
.ca-msg.user .ca-bubble::before {
    content: "";
    position: absolute;
    inset: 0;
    /*
     * 设计稿边框颜色
     */
    background: linear-gradient(106deg,
            #6cf4ff 3%,
            #4e95ff 103%);
    border-radius:
        px2rem(14) 0 px2rem(22) px2rem(14);
    /*
     * 只显示 1px 外圈
     */
    padding: px2rem(1);
    box-sizing: border-box;
    /*
     * 把中间挖空，只留下渐变边框
     */
    -webkit-mask:
        linear-gradient(#fff 0 0) content-box,
        linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask:
        linear-gradient(#fff 0 0) content-box,
        linear-gradient(#fff 0 0);
    mask-composite: exclude;
    pointer-events: none;
    z-index: -1;
}

.ca-source {
    display: block;
    margin-top: px2rem(2);
    font-size: px2rem(9);
    line-height: px2rem(14);
    color: rgba(155, 248, 255, 0.55);
    font-family: var(--font-family-primary-Regular);
    word-break: break-all;
}

.ca-input {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    height: 1.75rem;

    .ca-input-wrap {
        position: relative;
        flex: 1;
        height: 100%;
        border-radius: px2rem(5);
        background: rgba(40, 51, 70, 0.8);
        box-sizing: border-box;
        z-index: 0;

        // 渐变边框（border-image 不支持 border-radius，圆角处会露出方形边角）
        &::before {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: px2rem(5);
            padding: px2rem(0.68);
            background: linear-gradient(96deg, #2cb2f4 0%, #529abe 19%, #529abecd 49%, #529abecc 67%, #00dafb 96%);
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask-composite: exclude;
            pointer-events: none;
            z-index: -1;
        }
    }

    input {
        position: relative;
        z-index: 1;
        width: 100%;
        height: 100%;
        padding: 0 0.7rem;
        background: transparent;
        border: none;
        color: #ffffff;
        letter-spacing: 0px;
        font-size: px2rem(11);
        font-family: var(--font-family-primary-Medium);
        outline: none;
        box-sizing: border-box;

        &::placeholder {
            color: #bcc5c985;
        }
    }

    .ca-send {
        position: relative;
        flex-shrink: 0;
        height: 100%;
        padding: 0 1rem;
        border-radius: px2rem(5);
        letter-spacing: 0em;
        z-index: 0;
        background: #263F6C;
        box-sizing: border-box;
        border: none;
        color: #fff;
        font-size: px2rem(12);
        font-family: var(--font-family-primary-Regular);
        cursor: pointer;
        transition: filter 0.2s;

        // 渐变边框（border-image 不支持 border-radius，圆角处会露出方形边角）
        &::before {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: px2rem(5);
            padding: px2rem(0.68);
            background: linear-gradient(117deg, #2cb2f4 -1%, #529abe 19%, #529abecd 49%, #529abecc 68%, #00dafb 96%);
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask-composite: exclude;
            pointer-events: none;
            z-index: -1;
        }

        &:hover {
            filter: brightness(1.15);
        }
    }
}
</style>
