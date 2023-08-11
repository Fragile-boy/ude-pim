<template>
  <div class="pieInfo">
    <div id="pieChart" style="width: 600px; height: 600px;"></div>
  </div>
</template>
  
<script>

export default {
  props: {
    info:Array
  },
  mounted() {
    this.renderPieChart();
  },
  watch:{
    info:{
      immediate:true,
      handler(){
        this.renderPieChart()
      }
    }
  },
  methods: {
    renderPieChart() {
      const pieChart = this.$echarts.init(document.getElementById('pieChart'));

      // 计算属性值的数量
      const countByStatus = {};
      this.info.forEach(item => {
        const status = item.status;
        countByStatus[status] = (countByStatus[status] || 0) + 1;
      });


      // 获取不重复属性数组和属性数量数组
      const uniqueStatus = [...new Set(this.info.map(item => item.status))];
      const counts = uniqueStatus.map(name => ({ name, value: countByStatus[name]}));

      const option = {
        title: {
          text: '执行状态总览',
          x: 'center',
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)',
        },
        legend: {
          orient: 'vertical',
          left: 10,
          data: uniqueStatus,
          itemWidth:80,
          itemHeight:30
        },
        series: [
          {
            name:'执行状态',
            type: 'pie',
            // radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center',
            },
            color:['#dc3545','#53a8ff','#ffc107','#42b983'],
            data: counts
          },
        ],
      };
      pieChart.setOption(option);
    },
  },
};
</script>
  
<style scoped>
/* 可以添加样式 */
  .pieInfo{
    margin-top: 30px;
    margin-left: 30px;
  }
  
</style>
  