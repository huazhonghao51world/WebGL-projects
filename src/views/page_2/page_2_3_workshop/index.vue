<template>
  <Layout :aside="true">
    <template v-slot:aside-left>
      <div class="content-left">
        <Box class="box-item" :delayTime="100" position="left">
          <template v-slot:header>
            <h1>智能仓储-车间数据1</h1>
          </template>
          <div class="box-main-content">
            
          </div>
        </Box>

        <Box class="box-item" :delayTime="200" position="left">
          <template v-slot:header>
            <h1>智能仓储-车间数据2</h1>
          </template>
          <div class="box-main-content">
            
          </div>
        </Box>
      </div>
    </template>

    <template v-slot:aside-right>
      <div class="content-right">
        <Box class="box-item" :delayTime="100" position="right">
          <template v-slot:header>
            <h1>智能仓储-车间数据3</h1>
          </template>
          <div class="box-main-content">
            
          </div>
        </Box>

        <Box class="box-item" :delayTime="200" position="right">
          <template v-slot:header>
            <h1>智能仓储-车间数据4</h1>
          </template>
          <div class="box-main-content">
            
          </div>
        </Box>
      </div>
    </template>
  </Layout>
</template>

<script>
import Layout from "@/layout/index.vue";
import Box from "@/layout/box.vue";

export default {
  name: "Page_2_3_Workshop",
  components: {
    Layout,
    Box,
  },
  data() {
    return {
      
    };
  },
  computed: {
   
  },
  async mounted() {
 
  },

  methods: {
    
  },

  async beforeDestroy() {
  
  },
};
</script>

<style lang="scss" scoped>
.box-main-content {
  height: 100%;
  width: 100%;
}

.content-left,
.content-right {
  .box-item {
    height: 48%;
    margin-bottom: 4%;
  }
}
</style>
