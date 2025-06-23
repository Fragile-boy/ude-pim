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
    methods: {
      initChart() {
        const chart = echarts.init(this.$refs.chart)
        chart.setOption({
          title: {
            text: '个人KPI趋势分析',
            left: 'center'
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
          },
          legend: {
            data: ['纪律得分', '贡献得分', '临时任务得分', '专案阶段得分', '专案结案得分', '临时任务达成率', '专案任务达成率'],
            bottom: 0
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
            data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月']
          },
          yAxis: [
            { type: 'value', name: '得分', min: 0, max: 100 },
            { type: 'value', name: '达成率(%)', min: 0, max: 100 }
          ],
          series: [
            {
              name: '纪律得分',
              type: 'bar',
              stack: 'score',
              barWidth: '40%',
              data: this.data[0],
              itemStyle: { color: '#409EFF' }
            },
            {
              name: '贡献得分',
              type: 'bar',
              stack: 'score',
              data: this.data[1],
              itemStyle: { color: '#67C23A' }
            },
            {
              name: '临时任务得分',
              type: 'bar',
              stack: 'score',
              data: this.data[2],
              itemStyle: { color: '#E6A23C' }
            },
            {
              name: '专案阶段得分',
              type: 'bar',
              stack: 'score',
              data: this.data[3],
              itemStyle: { color: '#F56C6C' }
            },
            {
              name: '专案结案得分',
              type: 'bar',
              stack: 'score',
              data: this.data[4],
              itemStyle: { color: '#909399' }
            },
            {
              name: '临时任务达成率',
              type: 'line',
              yAxisIndex: 1,
              data: this.data[5],
              itemStyle: { color: '#E6A23C' },
              symbol: 'circle',
              symbolSize: 8,
              lineStyle: { width: 3 }
            },
            {
              name: '专案任务达成率',
              type: 'line',
              yAxisIndex: 1,
              data: this.data[6],
              itemStyle: { color: '#F56C6C' },
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
  