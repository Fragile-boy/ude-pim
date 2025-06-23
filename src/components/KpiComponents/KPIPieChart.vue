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
                    text: '本月KPI得分组成',
                    left: 'center',
                    textStyle: {
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: '#333'
                    }
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b}: {c}分 ({d}%)',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    borderColor: '#333',
                    textStyle: { color: '#fff' }
                },
                legend: {
                    orient: 'horizontal',
                    bottom: 0,
                    textStyle: { color: '#606266' },
                    data: this.data.map(item => item.name)
                },
                series: [{
                    name: 'KPI得分组成',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['50%', '50%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 6,
                        borderColor: '#fff',
                        borderWidth: 2,
                        shadowBlur: 10,
                        shadowColor: 'rgba(0, 0, 0, 0.2)'
                    },
                    label: {
                        show: true,
                        position: 'outside',
                        formatter: '{b}: {d}%',
                        fontSize: 12,
                        fontWeight: 'normal'
                    },
                    emphasis: {
                        label: { show: true, fontSize: 14, fontWeight: 'bold' },
                        itemStyle: {
                            shadowBlur: 20,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.3)'
                        }
                    },
                    labelLine: { show: true, length: 10, length2: 15 },
                    data: this.data.map((item, index) => ({
                        value: item.score,
                        name: item.name,
                        itemStyle: { color: this.getFixedColor(index) }
                    }))
                }]
            })
        },
        getFixedColor(index) {
            const colors = ['#EE6666', '#91CC75', '#FAC858', '#5470C6', '#73C0DE', '#3BA272', '#FC8452', '#9A60B4']
            return colors[index % colors.length]
        }
    },
    beforeDestroy() {
        if (this.chart) {
            this.chart.dispose()
        }
    }
}
</script>