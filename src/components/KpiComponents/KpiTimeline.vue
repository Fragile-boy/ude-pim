<template>
  <div class="kpi-timeline">
    <el-empty description="暂无相关数据" v-if="!kpiData || kpiData.length === 0"></el-empty>
    <el-timeline v-else-if="kpiData && kpiData.length > 0">
      <el-timeline-item 
        v-for="(item, index) in kpiData" 
        :key="index"
        :timestamp="item.time"
        placement="top"
        :type="getTimelineType(item.type)"
        :color="getColor(item.type)"
        :icon="getIcon(item.type)"
      >
        <el-card :class="['kpi-card', `kpi-${item.type}`]">
          <div class="kpi-header">
            <span class="kpi-type">{{ getTypeName(item.type) }}</span>
            <span class="kpi-score" :class="getScoreClass(item.score)">{{ formatScore(item.score) }}</span>
          </div>
          <h4 class="kpi-title">{{ item.title }}</h4>
          <p class="kpi-content">{{ item.content }}</p>
          <div class="kpi-footer">
            <span class="kpi-time">{{ item.time }}</span>
          </div>
        </el-card>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<script>
export default {
  name: 'KpiTimeline',
  props: {
    kpiData: {
        type: Array,
        default: () => [],
        required: true
    }
  },
//   watch:{
//     kpiData:{
//         handler(newVal){
//             if(newVal&&newVal.length>0){
//                 this.updateChart()
//             }
//         }
//     }
//   },
  methods: {
    getTypeName(type) {
      const map = {
        discipline: '纪律扣分',
        contribution: '贡献得分',
        task: '临时任务得分',
        phase: '专案阶段得分',
        completion: '专案完结得分'
      }
      return map[type] || type
    },
    getTimelineType(type) {
      if (type === 'discipline') return 'danger'
      return 'primary'
    },
    getColor(type) {
      const colors = {
        discipline: '#ee7975',
        contribution: '#9ecb7f',
        task: '#f6da72',
        phase: '#637ad2',
        completion: '#85bedb'
      }
      return colors[type]
    },
    getIcon(type) {
      const icons = {
        discipline: 'el-icon-warning',
        contribution: 'el-icon-star-on',
        task: 'el-icon-alarm-clock',
        phase: 'el-icon-s-flag',
        completion: 'el-icon-trophy'
      }
      return icons[type]
    },
    getScoreClass(score) {
      return score > 0 ? 'positive' : 'negative'
    },
    formatScore(score) {
      return (score > 0 ? '+' : '') + score
    }
  }
}
</script>

<style scoped>
.kpi-timeline {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.kpi-card {
  margin-bottom: 15px;
  border-left: 4px solid;
}

.kpi-discipline {
  border-left-color: #ee7975;
}

.kpi-contribution {
  border-left-color: #9ecb7f;
}

.kpi-task {
  border-left-color: #f6da72;
}

.kpi-phase {
  border-left-color: #637ad2;
}

.kpi-completion {
  border-left-color: #85bedb;
}

.kpi-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.kpi-type {
  font-weight: bold;
  font-size: 14px;
}

.kpi-score {
  font-weight: bold;
  font-size: 16px;
  padding: 2px 8px;
  border-radius: 4px;
}

.kpi-score.positive {
  color: #67C23A;
  background-color: #f0f9eb;
}

.kpi-score.negative {
  color: #F56C6C;
  background-color: #fef0f0;
}

.kpi-title {
  margin: 5px 0;
  font-size: 16px;
  color: #303133;
}

.kpi-content {
  margin: 5px 0;
  font-size: 14px;
  color: #606266;
}

.kpi-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  font-size: 12px;
  color: #909399;
}

.kpi-author {
  font-style: italic;
}
</style>