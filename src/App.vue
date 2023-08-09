<template>
  <div id="app">
    <PIMHeader></PIMHeader>
    <div class="main">
      <PIMAside></PIMAside>
      <div class="container">
        <CaseStatus></CaseStatus>
        <CaseTable class="case-table"></CaseTable>
    </div>
    </div>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'app',
  components: {
    HelloWorld
  }
}
</script>

<style>
#app {
  /* font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale; */
  text-align: center;
  color: #2c3e50;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  height: 100%;
}

.main{
  display: flex;
}

.case-table{
  margin-top: 50px;
}

</style>
