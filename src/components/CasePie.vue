<template>
  <div class="pieInfo">
    <div id="pieChart" style="width: 600px; height: 400px;"></div>
    <div id="barChart" style="width: 1000px; height: 400px;"></div>
  </div>
</template>
  
<script>

export default {
  props: {
    info: Array
  },
  data() {
    return {
      pieChart: null,
      barChart: null
    }
  },
  mounted() {
    this.pieChart = this.$echarts.init(document.getElementById('pieChart'));
    this.barChart = this.$echarts.init(document.getElementById('barChart'));
    this.renderBarChart();
    this.renderPieChart()
  },
  watch: {
    info: {
      handler() {
        this.renderBarChart()
        this.renderPieChart()
      }
    }
  },
  methods: {
    renderPieChart() {
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
                  return '#C2C3C5'
              }
            },
            data: counts
          },
        ],
      };
      this.pieChart.setOption(option);
    },
    renderBarChart() {
      //1.获取到x横坐标显示的信息（如果是专案，显示完成的专案名，否则显示子流程名）
      const xData = this.info.filter(item => item.finishTime !== null).map(item => {
        //对象是专案
        if ("name" in item && item.finishTime !== null) {
          return item.name
          //对象是子流程
        } else if ("subName" in item && item.finishTime !== null)
          return item.subName
      })
      //2.获取到正常结束时间和实际结束时间
      const standardTime = []
      const finishTime = []
      this.info.forEach(item => {
        if (item.finishTime !== null) {
          if (typeof (item.standardTime) !== "undefined")
            standardTime.push(Math.ceil(new Date(item.standardTime) - new Date(item.startTime)) / (1000 * 24 * 3600))
          else
            standardTime.push(Math.ceil(new Date(item.presetTime) - new Date(item.startTime)) / (1000 * 24 * 3600))
          finishTime.push(Math.ceil(new Date(item.finishTime) - new Date(item.startTime)) / (1000 * 24 * 3600))
        }
      })
      //3.对信息进行处理插入到图表中
      const option = {
        title: {
          text: '专案耗时对比',
          x: 'center',
          y: 'bottom'
        },
        legend: {
          show: true
        },
        xAxis: {
          data: xData
        },
        yAxis: {},
        series: [
          {
            name: "正常时间",
            type: 'bar',
            data: standardTime,
            label: {
              show: true,
              position: 'top'
            }
          },
          {
            name: "完成时间",
            type: 'bar',
            data: finishTime,
            label: {
              show: true,
              position: 'top'
            }
          }
        ]
      }
      this.barChart.setOption(option)
    }
  },
};
</script>
  
<style scoped>
/* 可以添加样式 */
.pieInfo {
  margin-top: 30px;
  margin-left: 30px;
  display: flex;
}

.pieInfo #pieChart, #barChart{
  border: 1px solid grey;
  border-radius: 10px;
  margin-right: 10px;
}
</style>
  