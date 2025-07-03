<template>
  <div ref="chart" style="width: 100%; height: 100%;"></div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  props: {
    data: {
      type: Array,
      required: true
    }
  },
  mounted() {
    this.initChart()
  },
  watch: {
    data: {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.$nextTick(() => {
            this.$refs.chart && this.updateChart();
          })
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    updateChart() {
      // 销毁并重新创建图表
      if (this.chart) {
        this.chart.dispose();
      }
      this.initChart();
    },
    initChart() {
      const chart = echarts.init(this.$refs.chart)
      // 生成横坐标数据
      const xData = this.data.map(item => item.curDate)
      // 生成纪律得分、贡献得分、临时任务得分、专案阶段得分、专案结案得分、临时任务达成率、专案任务达成率数据
      const disciplineData = this.data.map(item => item.disciplineScore === null ? 0 : item.disciplineScore)
      const contributionData = this.data.map(item => item.contributionScore === null ? 0 : item.contributionScore)
      const tempTaskData = this.data.map(item => item.tempTaskScore === null ? 0 : item.tempTaskScore)
      const projectPhaseData = this.data.map(item => item.projectPhaseScore === null ? 0 : item.projectPhaseScore)
      const projectCloseData = this.data.map(item => item.projectCloseScore === null ? 0 : item.projectCloseScore)
      const tempTaskAvgAchieveRateData = this.data.map(item => item.tempTaskAvgAchievementRate===null?0:item.tempTaskAvgAchievementRate)
      const projectPhaseAvgAchievementRateData = this.data.map(item => item.projectPhaseAvgAchievementRate===null?0:item.projectPhaseAvgAchievementRate)
      const departAvgScoreData = this.data.map(item=>item.departmentAvgScore===null?0:item.departmentAvgScore)
      chart.setOption({
        title: {
          text: '个人KPI趋势分析',
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: function (params) {
            let result = params[0].name + '<br/>';
            let total = 0;

            params.forEach(param => {
              const value = param.value;
              const formattedValue = typeof value === 'number' ? value.toFixed(2) : value;
              result += `${param.marker} ${param.seriesName}: ${formattedValue}<br/>`;
              if (param.seriesType === 'bar') {
                total += Number(value);
              }
            });

            result += `<hr style="margin:5px 0;border-top:1px dashed #ccc;"/>`;
            result += `${params[0].marker} <strong>总分: ${total.toFixed(2)}</strong>`;
            return result;
          }
        },
        legend: {
          data: ['纪律得分', '贡献得分', '临时任务得分', '专案阶段得分', '专案结案得分', '临时任务达成率', '专案任务达成率', '部门平均得分'],
          bottom: 0,
          itemWidth: 14,
          itemHeight: 10,
          textStyle: {
            fontSize: 12
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: true,
          data: xData
        },
        yAxis: [
          { type: 'value', name: '得分' },
          { type: 'value', name: '达成率(%)' }
        ],
        series: [
          {
            name: '纪律得分',
            type: 'bar',
            stack: 'score',
            barWidth: '40%',
            data: disciplineData,
            itemStyle: { color: '#FFA500' },
            label: {
              show: true,
              position: 'inside',
              formatter: function (params) {
                return params.value === 0 ? '' : params.value.toFixed(2);
              },
              fontSize: 14,
              fontWeight: 'bold',
              color: '#fff'
            }
          },
          {
            name: '贡献得分',
            type: 'bar',
            stack: 'score',
            data: contributionData,
            itemStyle: { color: '#9370DB' },
            label: {
              show: true,
              position: 'inside',
              formatter: function (params) {
                return params.value === 0 ? '' : params.value.toFixed(2);
              },
              fontSize: 14,
              fontWeight: 'bold',
              color: '#fff'
            }
          },
          {
            name: '临时任务得分',
            type: 'bar',
            stack: 'score',
            data: tempTaskData,
            itemStyle: { color: '#87CEFA' },
            label: {
              show: true,
              position: 'inside',
              formatter: function (params) {
                return params.value === 0 ? '' : params.value.toFixed(2);
              },
              fontSize: 14,
              fontWeight: 'bold',
              color: '#fff'
            }
          },
          {
            name: '专案阶段得分',
            type: 'bar',
            stack: 'score',
            data: projectPhaseData,
            itemStyle: { color: '#32CD32' },
            label: {
              show: true,
              position: 'inside',
              formatter: function (params) {
                return params.value === 0 ? '' : params.value.toFixed(2);
              },
              fontSize: 14,
              fontWeight: 'bold',
              color: '#fff'
            }
          },
          {
            name: '专案结案得分',
            type: 'bar',
            stack: 'score',
            data: projectCloseData,
            itemStyle: { color: '#1E90FF' },
            label: {
              show: true,
              position: 'inside',
              formatter: function (params) {
                return params.value === 0 ? '' : params.value.toFixed(2);
              },
              fontSize: 14,
              fontWeight: 'bold',
              color: '#fff'
            }
          },
          {
            name: '临时任务达成率',
            type: 'line',
            yAxisIndex: 1,
            data: tempTaskAvgAchieveRateData,
            itemStyle: { color: '#87CEFA' },
            symbol: 'circle',
            symbolSize: 8,
            lineStyle: { width: 3 }
          },
          {
            name: '专案任务达成率',
            type: 'line',
            yAxisIndex: 1,
            data: projectPhaseAvgAchievementRateData,
            itemStyle: { color: '#32CD32' },
            symbol: 'circle',
            symbolSize: 8,
            lineStyle: { width: 3 }
          },{
            name: '部门平均得分',
            type: 'line',
            yAxisIndex: 0,
            data: departAvgScoreData,
            itemStyle: { color: '#ae261b' },
            symbol: 'circle',
            symbolSize: 8,
            lineStyle: { width: 3 }
          }
        ]
      })
    }
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose()
    }
  }
}
</script>