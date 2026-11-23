import mitt from "mitt";

/**
 * 全局事件总线
 *
 * 用于「集中式回调 → 分散组件消费」的解耦：
 * 三维场景层（layout/scene.vue）只负责把 SDK 事件 emitter.emit 广播出去，
 * 各业务组件在自身生命周期内 emitter.on 订阅、beforeDestroy 时 emitter.off 取消，
 * 互不依赖。新增/删除消费方都无需改动回调注册处。
 *
 * 场景层广播的事件：
 *   entityClicked / entityDblClicked  —— SDK EntityEvent（点击空白为 null）
 *   sceneUpdated   —— 案例重新发布、场景已自动更新 { sceneId, revision, previousRevision }
 *   windowEvent    —— 三维弹窗（#/wdpWindow）内的交互 { name, ... }
 *   twinStatus     —— statusEnum.notify 的统一状态广播
 */
export const emitter = mitt();
