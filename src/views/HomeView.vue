<template>
  <div class="home" style="text-align: center;">
    <div class="content">
      <div class="main">
        <div class="tableInfo">
          <div class="charts">
            <CasePie></CasePie>
          </div>
          <div class="tableA">
            <label>执行状态总览</label>
            <CaseTable></CaseTable>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import CasePie from '../components/CasePie'
import { formatDate, getStatus } from '@/utils/common'
import { mapState } from 'vuex'
export default {
  name: 'homePage',
  components: { CasePie },
  data() {
    return {
      caseId: '',
      caseInfo: [],
      pieInfo: []
    }
  },
  created(){
    this.$store.dispatch('caseM/getCaseList')
  },
  methods: {

  }
}
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: row;
}

.content {
  display: flex;
}

.main {

  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}


.main>>>label {
  display: block;
  font-size: 50px;
  padding-bottom: 20px;
  margin-top: 40px;
  align-content: center;
  margin-left: 0%;
}


.main>>>.tableInfo {
  width: 100%;
}

.main>>>.userCase {
  /* width: 30%; */
  /* background-color: pink; */
}

.el-button {
  margin-top: 20px;
}

.charts {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin-bottom: 30px;
}
</style>

