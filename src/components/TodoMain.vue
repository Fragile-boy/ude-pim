<template>
  <!-- 列表区域 -->
  <section class="main">
    <ul v-for="(task, index) in demandList" :key="task.id">
      <li>
        {{ index + 1 }} . {{ task.name }}
        <i class="el-icon-delete" @click="delDemand(task.id)"></i>
      </li>
    </ul>
  </section>
</template>

<script>
export default {
  props: {
    demandList: {
      type: Array,
    },
  },
  methods: {
    delDemand(id) {
      this.$emit("delDemand", id)
    }
  }
}
</script>

<style scoped>
.main {
  margin-left: 300px;
}

.main>>>li {
  margin-left: 160px;
  width: 300px;
  list-style: none;
  background-color: skyblue;
  display: flex;
  justify-content: space-between;
}

.main >>> i{
  vertical-align: middle;
}
</style>