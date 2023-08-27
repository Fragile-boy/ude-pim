<template>
  <div id="app">
    <router-view></router-view>

  </div>
</template>


<script>
import { mapMutations } from 'vuex'
export default {
  created() {
  },
  methods: {
    ...mapMutations(['setUser'])
  }
}
</script>

<style>

</style>
