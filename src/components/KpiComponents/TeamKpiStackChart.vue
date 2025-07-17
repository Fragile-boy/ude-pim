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
    selectedMonth: {
      type: String,
      required: true
    },
    averageScore: {
      type: Number,
      required: true
    },
    loading: Boolean
  },
  watch: {
    data: {
      handler: 'updateChart',
      deep: true
    },
    type: 'updateChart',
    loading: 'handleLoading'
  },
  mounted() {
    this.updateChart()
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose()
    }
  },
  methods: {
    updateChart() {
      if(this.chart){
        this.chart.dispose()
      }
      this.initChart()
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

    initChart() {
      this.chart = echarts.init(this.$refs.chart)
      if (!this.data || this.data.length === 0) return
      // 避免触发监听事件
      var temp = [...this.data]
      temp.sort((a, b) => b.totalScore - a.totalScore)
      const seriesData = this.prepareSeriesData(temp)

      const option = {
        title: {
          text: `${this.selectedMonth} 团队KPI构成`,
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: params => {
            let html = `<div style="margin-bottom: 5px; font-weight: bold">${params[0].name}</div>`
            params.forEach(item => {
              const value = item.value.toFixed(1)
              html += `
                  <div style="display: flex; align-items: center; margin: 3px 0">
                    <span style="display: inline-block; width: 10px; height: 10px; background: ${item.color}; margin-right: 5px"></span>
                    <span style="flex: 1">${item.seriesName}:</span>
                    <span style="font-weight: bold">${value}</span>
                  </div>
                `
            })
            const total = params.reduce((sum, item) => {
              return item.seriesName.includes('率')?sum:sum+ item.value
            }, 0)
            const totalValue = total.toFixed(1)
            html += `
                <div style="display: flex; align-items: center; margin-top: 5px; padding-top: 5px; border-top: 1px dashed #eee">
                  <span style="flex: 1">总分:</span>
                  <span style="font-weight: bold">${totalValue}</span>
                </div>
              `
            return html
          }
        },
        legend: {
          data: [
            '纪律得分', '贡献得分', '临时任务', '专案阶段', '专案完结', '临时任务达成率', '项目阶段达成率'
          ],
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
          data: temp.map(item => item.name),
          axisLabel: {
            interval: 0,
            rotate: 30
          }
        },
        yAxis: [
          {
            type: 'value',
            name: '得分(分)',
            nameLocation: 'middle',
            nameGap: 40
          },
          {
            type: 'value',
            name: '达成率(%)',
            nameLocation: 'middle',
            nameGap: 40,
            min: 0
          }
        ],
        series: seriesData,
        //['#3AA0FF', '#EE6666', '#73C0DE']
        color: [
           '#B8B8FF', '#90BE6D', '#F8961E', '#4CC9F0', '#3A86FF', '#91CC75', '#FAC858'
        ]
      }

      this.chart.setOption(option, true)
    },

    prepareSeriesData(data) {
      return [
        {
          name: '纪律得分',
          type: 'bar',
          stack: 'total',
          emphasis: {
            focus: 'series'
          },
          data: data.map(item => item.disciplineScore),
          label: {
            show: true,
            position: 'inside',
            formatter: function (params) {
              return params.value != 0 ? params.value.toFixed(0) : ''
            }
          },
          markLine: {
            silent: true,
            data: [{
              yAxis: this.averageScore.toFixed(1),
              name: '平均分',
              label: {
                formatter: '平均分: {c}',
                position: 'end',
                color: '#F56C6C',
                fontSize: 16
              },
              lineStyle: {
                type: 'dashed',
                color: '#F56C6C',
                width: 2
              }
            }]
          }
        },
        {
          name: '贡献得分',
          type: 'bar',
          stack: 'total',
          emphasis: {
            focus: 'series'
          },
          data: data.map(item => item.contributionScore),
          label: {
            show: true,
            position: 'inside',
            formatter: function (params) {
              return params.value != 0 ? params.value.toFixed(0) : ''
            }
          }
        },
        {
          name: '临时任务',
          type: 'bar',
          stack: 'total',
          emphasis: {
            focus: 'series'
          },
          data: data.map(item => item.tempTaskScore),
          label: {
            show: true,
            position: 'inside',
            formatter: function (params) {
              return params.value != 0 ? params.value.toFixed(0) : ''
            }
          }
        },
        {
          name: '专案阶段',
          type: 'bar',
          stack: 'total',
          emphasis: {
            focus: 'series'
          },
          data: data.map(item => item.projectPhaseScore),
          label: {
            show: true,
            position: 'inside',
            formatter: function (params) {
              return params.value != 0 ? params.value.toFixed(0) : ''
            }
          }
        },
        {
          name: '专案完结',
          type: 'bar',
          stack: 'total',
          emphasis: {
            focus: 'series'
          },
          data: data.map(item => item.projectCloseScore),
          label: {
            show: true,
            position: 'inside',
            formatter: function (params) {
              return params.value != 0 ? params.value.toFixed(0) : ''
            }
          }
        },
        {
          name: '临时任务达成率',
          type: 'line',
          yAxisIndex: 1,
          emphasis: {
            focus: 'series'
          },
          data: data.map(item => item.tempTaskRate),
          label: {
            show: true,
            position: 'inside',
            formatter: function (params) {
              return params.value.toFixed(0)
            }
          }
        },
        {
          name: '项目阶段达成率',
          type: 'line',
          yAxisIndex: 1,
          emphasis: {
            focus: 'series'
          },
          data: data.map(item => item.projectPhaseRate),
          label: {
            show: true,
            position: 'inside',
            formatter: function (params) {
              return params.value.toFixed(0)
            }
          }
        }
      ]
    }
  }
}
</script>