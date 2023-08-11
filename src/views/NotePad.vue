<template>
  <div class="note">
    <PIMHeader></PIMHeader>
    <div class="container">
      <PIMAside></PIMAside>
      <!-- 主体区域 -->
      <section id="app">
        <TodoHeader @addDemand="addDemand"></TodoHeader>
        <TodoMain :demandList="demandList" @delDemand="delDemand"></TodoMain>
      </section>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import TodoHeader from '../components/TodoHeader.vue'
import TodoMain from '../components/TodoMain.vue'

export default {
  components: {
    TodoHeader,
    TodoMain
  },
  data() {
    return {
      demandList: []
    }
  },
  created() {
    this.getDemand()
  },
  methods: {
    //获取需求数据
    getDemand() {
      this.$axios.get('/demand/list')
        .then(res => {
          this.demandList = res.data.data
        })
    },
    //删除需求
    delDemand(id) {
      axios.delete('/demand', {
        data: { id }
      }).then(res => {
        this.getDemand()
      })
    },
    //添加需求
    addDemand(demandName) {
      axios.post('/demand', {
        name: demandName
      }).then(res => {
        console.log(res.data.data)
        this.getDemand()
      })
    }
  },
}
</script>

<style scoped>
.container {
  display: flex;
  /* justify-content: space-between; */
}
</style>