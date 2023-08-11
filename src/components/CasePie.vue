<template>
  <div class="pieInfo">
    <div id="pieChart" style="width: 600px; height: 600px;"></div>
  </div>
</template>
  
<script>

export default {
  props: {
    info: Array
  },
  mounted() {
    this.renderPieChart();
  },
  watch: {
    info: {
      immediate: true,
      handler() {
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
      var uniqueStatus = [...new Set(this.info.map(item => item.status))];
      uniqueStatus.sort()


      // 先根据状态属性数字获得计数值和含义
      const counts = uniqueStatus.map(name => {
        const value = countByStatus[name]
        if (name === 0)
          name = "正在执行"
        else if (name === 1)
          name = "正常完成"
        else if (name === 2)
          name = "已延误"
        else if (name === 3)
          name = "延误完成"
        else if (name === 4)
          name = "未开始"
        return { name, value }
      });
      // 然后再对数字转含义
      uniqueStatus = uniqueStatus.map(status => {
        if (status === 0)
          return "正在执行"
        else if (status === 1)
          return "正常完成"
        else if (status === 2)
          return "已延误"
        else if (status === 3)
          return "延误完成"
        else if (status === 4)
          return "未开始"
      })

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
          itemWidth: 80,
          itemHeight: 30
        },
        series: [
          {
            name: '执行状态',
            type: 'pie',
            // radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center',
            },
            // 依次是 蓝 绿 黄  红 ['#53a8ff','#42b983','#ffc107','#dc3545'],
            itemStyle: {
              normal: {
                color: function (params) {
                  if (params.data.name === "正在执行")
                    return '#53a8ff'
                  if (params.data.name === "正常完成")
                    return '#42b983'
                  if (params.data.name === "已延误")
                    return '#dc3545'
                  if (params.data.name === "延误完成")
                    return '#ffc107'
                  if (params.data.name === "未开始")
                    return '#eeeeee'
                }
              }
            },
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
.pieInfo {
  margin-top: 30px;
  margin-left: 30px;
}
</style>
  