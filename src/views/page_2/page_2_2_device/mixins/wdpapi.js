// WDP API 混入模板
import { mapState } from "vuex";
import store from "../../../../store/index";

export default {
  data() {
    return {
      // id对应方法
      toolHandlers: {
        1: null,
      },
      // id对应数据
      toolData: {
        1: {},
        2: {},
        3: {},
      },
      //类型存储
      toolTypes: {
        2: [],
        5: [],
      },

      //对象存储
      toolObjs: {
        1: [],
        2: [],
        3: [],
      },
      hasSceneInit: false, // 防止场景就绪后重复初始化
    };
  },
  computed: {
    ...mapState(["isSceneAlready"]),
  },
  watch: {
    async isSceneAlready(newVal) {
      if (newVal) {
        await this.initAfterSceneReady();
      }
    },
  },
  methods: {
    async initAfterSceneReady() {
      if (!this.isSceneAlready || this.hasSceneInit) {
        return;
      }
      this.hasSceneInit = true;
    },

  },

  // 如果前往的路由不是/page_2/2。需要调用xxx
  // [twin 待实现] 原 wdpapi 调用：splitBuildByName
  async beforeRouteLeave(to, from, next) {
    if(to.path.includes("/page_2/2")){
      next();
    } else {
      next();
    }
  },

  async mounted() {
    await this.initAfterSceneReady();
  },

  // [twin 待实现] 原 wdpapi 调用：deleteTypes
  async beforeDestroy() {
  },
};
