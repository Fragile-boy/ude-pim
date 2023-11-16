<template>
  <div id="app">
    <div v-if="true||user.type===1">
      <el-button type="primary" @click="switchBackendPort" v-if="!dev" size="mini" round>切换开发环境</el-button>
      <el-button type="success" @click="switchBackendPort" v-else size="mini" round>切换测试环境</el-button>
    </div>
    <router-view>

    </router-view>
  </div>
</template>


<script>
import { mapMutations, mapState } from 'vuex'
import service from '@/plugins/service'
export default {
  data() {
    return {
      // 表示测试环境还是正式环境
      dev: false,
    }
  },
  created() {
    this.dev = localStorage.getItem("ude_pim_env_dev") === null ? false : JSON.parse(localStorage.getItem("ude_pim_env_dev"))
    if (this.dev) {
      service.defaults.baseURL = "http://192.168.1.176:8081"
    } else {
      service.defaults.baseURL = "http://192.168.1.176:8080"
    }
  },
  computed:{
    ...mapState(['user'])
  },
  methods: {
    switchBackendPort() {
      this.dev = !this.dev
      localStorage.setItem("ude_pim_env_dev", JSON.stringify(this.dev))
      location.reload()
    }
  }
}
</script>

<style></style>
