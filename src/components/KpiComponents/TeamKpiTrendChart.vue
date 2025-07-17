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
      },
      loading: Boolean
    },
    watch: {
      data: {
        handler(newVal){
          if(newVal&&newVal.length>0){
            this.$nextTick(() => {
              this.initChart();
            })
          }
        },
        deep: true,
        immediate: true
      },
      loading: 'handleLoading'
    },
    mounted() {
      this.initChart()
    },
    beforeDestroy() {
      if (this.chart) {
        this.chart.dispose()
      }
    },
    methods: {
      initChart() {
        if(this.chart){
          this.chart.dispose()
        }
        this.updateChart()
        window.addEventListener('resize', this.resizeChart)
      },
      
      resizeChart() {
        if (this.chart) {
          this.chart.resize()
        }
      },
      
      handleLoading(loading) {
        if (loading) {
          this.chart.showLoading()
        } else {
          this.chart.hideLoading()
        }
      },
      
      updateChart() {
        if (!this.data) return
        this.chart = echarts.init(this.$refs.chart)
        const option = {
          title: {
            text: '团队KPI趋势分析',
            left: 'center',
            textStyle: {
              fontSize: 16,
              fontWeight: 'bold'
            }
          },
          tooltip: {
            trigger: 'axis',
            formatter: params => {
              let html = `<div style="margin-bottom: 5px">${params[0].axisValue}</div>`
              params.forEach(item => {
                html += `
                  <div style="display: flex; align-items: center; margin: 3px 0">
                    <span style="display: inline-block; width: 10px; height: 10px; background: ${item.color}; margin-right: 5px"></span>
                    <span style="flex: 1">${item.seriesName}:</span>
                    <span style="font-weight: bold">${item.value.toFixed(1)}</span>
                  </div>
                `
              })
              return html
            }
          },
          legend: {
            data: ['纪律平均分', '贡献平均分', '临时任务平均分', '专案阶段平均分', '专案完结平均分', '团队平均分'],
            bottom: 10
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            top: '15%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: this.data.map(item=>item.curDate)
          },
          yAxis: {
            type: 'value',
            name: 'KPI得分'
          },
          series: [
            {
              name: '纪律平均分',
              type: 'line',
              smooth: true,
              data: this.data.map(item => item.disciplineAvgScore),
              lineStyle: {
                width: 4
              },
              symbolSize: 8
            },
            {
              name: '贡献平均分',
              type: 'line',
              smooth: true,
              data: this.data.map(item => item.contributionAvgScore),
              lineStyle: {
                width: 4
              },
              symbolSize: 8
            },
            {
              name: '临时任务平均分',
              type: 'line',
              smooth: true,
              data: this.data.map(item => item.tempTaskAvgScore),
              lineStyle: {
                width: 4
              },
              symbolSize: 8
            },
            {
              name: '专案阶段平均分',
              type: 'line',
              smooth: true,
              data: this.data.map(item => item.projectPhaseAvgScore),
              lineStyle: {
                width: 4
              },
              symbolSize: 8
            },
            {
              name: '专案完结平均分',
              type: 'line',
              smooth: true,
              data: this.data.map(item => item.projectCloseAvgScore),
              lineStyle: {
                width: 4
              },
            },
            {
              name: '团队平均分',
              type: 'line',
              smooth: true,
              data: this.data.map(item => item.avgScore),
              lineStyle: {
                width: 4
              },
            }
          ],
          color: ['#F56C6C', '#67C23A', '#409EFF', '#E6A23C', '#909399', '#e47470']
        }
        
        this.chart.setOption(option, true)
      }
    }
  }
  </script>