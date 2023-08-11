<template>
  <!-- 输入框 -->
  <header class="header">
    <h1>需求添加</h1>
    <div class="content">
      <el-input placeholder="请输入内容" v-model="todoName" @keyup.enter="addDemand"></el-input>
      <el-button class="add" @click="addDemand">添加需求</el-button>
    </div>
  </header>
</template>

<script>
export default {
  data() {
    return {
      todoName: ''
    }
  },
  methods: {
    addDemand(){
      if(this.todoName==="")
        alert("请输入需求描述")
      this.$emit("addDemand", this.todoName)
      this.todoName = ''
    }
  }
}
</script>

<style scoped>
.header{
  margin-left:500px;
}
.header .content{
  display: flex;
}
</style>