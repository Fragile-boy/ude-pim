<template>
    <div class="chart-container">
        <div class="chart-row">
            <div class="chart-item">
                <div class="chart-title">积分类型发生次数</div>
                <div class="chart-box" ref="pieChart" style="width: 100%; height: 400px;"></div>
            </div>
            <div class="chart-item">
                <div class="chart-title">积分类型统计</div>
                <div class="chart-box" ref="barChart" style="width: 100%; height: 400px;"></div>
            </div>
        </div>
        <div class="chart-row">
            <div class="chart-item">
                <div class="chart-title">部员积分排名</div>
                <div class="chart-box" ref="rankChart" style="width: 100%; height: 400px;"></div>
            </div>
            <div class="chart-item">
                <div class="chart-title">单日积分类型</div>
                <div class="chart-box" ref="compareChart" style="width: 100%; height: 400px;"></div>
            </div>
        </div>
    </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
    mounted() {
        this.initCharts();
    },
    methods: {
        initCharts() {
            this.pieChart = echarts.init(this.$refs.pieChart);
            this.barChart = echarts.init(this.$refs.barChart);
            this.rankChart = echarts.init(this.$refs.rankChart);
            this.compareChart = echarts.init(this.$refs.compareChart);

            window.addEventListener('resize', this.resizeCharts);
        },
        resizeCharts() {
            this.pieChart && this.pieChart.resize();
            this.barChart && this.barChart.resize();
            this.rankChart && this.rankChart.resize();
            this.compareChart && this.compareChart.resize();
        },
        // 添加更新图表数据的方法
        updateCharts(allRecords) {
            this.updatePieChart(allRecords);
            this.updateBarChart(allRecords);
            this.updateRankChart(allRecords);
            this.updateCompareChart(allRecords);
        },
        updateCharts(records) {
            this.updatePieChart(records);
            this.updateBarChart(records);
            this.updateRankChart(records);
            this.updateCompareChart(records);
        },
        updatePieChart(records) {
            const typeCount = {
                discipline: { name: '纪律积分', value: 0 },
                contribution: { name: '贡献积分', value: 0 }
            };

            records.forEach(record => {
                if (record.categoryType === 'discipline') {
                    typeCount.discipline.value++;
                } else {
                    typeCount.contribution.value++;
                }
            });

            const pieData = Object.values(typeCount).filter(item => item.value > 0);

            const option = {
                title: {
                    text: '积分类型分布',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}: {c}次 ({d}%)'
                },
                legend: {
                    orient: 'vertical',
                    left: 'left'
                },
                series: [
                    {
                        name: '积分类型',
                        type: 'pie',
                        radius: '50%',
                        data: pieData,
                        label: {
                            formatter: '{b}: {c}次'
                        },
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            };

            this.pieChart.setOption(option);
        },
        updateBarChart(records) {
            // 按类型分类统计
            const categoryByType = {
                discipline: [],
                contribution: []
            };

            // 统计每个分类的总次数
            const categoryCount = {};
            records.forEach(record => {
                const name = record.categoryName;
                categoryCount[name] = (categoryCount[name] || 0) + 1;
            });

            // 按类型分组并只添加最终计数
            records.forEach(record => {
                const name = record.categoryName;
                // 检查是否已经添加过该分类
                const existingIndex = categoryByType[record.categoryType].findIndex(item => item.name === name);
                if (existingIndex === -1) {
                    categoryByType[record.categoryType].push({
                        name,
                        count: categoryCount[name]
                    });
                }
            });

            // 合并数据，纪律在前，贡献在后
            const barData = [
                ...categoryByType.discipline,
                ...categoryByType.contribution
            ];

            const option = {
                title: {
                    text: '积分类型统计',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: '{b}: {c}次'
                },
                xAxis: {
                    type: 'category',
                    data: barData.map(item => item.name),
                    axisLabel: {
                        rotate: 30
                    }
                },
                yAxis: {
                    type: 'value',
                    name: '发生次数'
                },
                series: [
                    {
                        name: '发生次数',
                        type: 'bar',
                        data: barData.map(item => item.count),
                        itemStyle: {
                            color: function(params) {
                                return params.dataIndex < categoryByType.discipline.length 
                                    ? '#F56C6C' 
                                    : '#67C23A';
                            }
                        },
                        label: {
                            show: true,
                            position: 'top',
                            formatter: '{c}次'
                        }
                    }
                ]
            };

            this.barChart.setOption(option);
        },

        updateRankChart(records) {
            const userScore = {};
            records.forEach(record => {
                const name = record.userName;
                userScore[name] = (userScore[name] || 0) + record.scoreValue;
            });

            const sortedUsers = Object.entries(userScore)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10);

            const option = {
                title: {
                    text: '部员积分排名 (Top 10)',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                xAxis: {
                    type: 'value',
                    name: '积分'
                },
                yAxis: {
                    type: 'category',
                    data: sortedUsers.map(item => item[0]),
                    inverse: true
                },
                series: [
                    {
                        name: '积分',
                        type: 'bar',
                        data: sortedUsers.map(item => item[1]),
                        label: {
                            show: true,
                            position: 'right',
                            formatter: '{c}分'
                        },
                        itemStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                                { offset: 0, color: '#83bff6' },
                                { offset: 0.5, color: '#188df0' },
                                { offset: 1, color: '#188df0' }
                            ])
                        }
                    }
                ]
            };

            this.rankChart.setOption(option);
        },
        updateCompareChart(records) {
            const dateMap = {};

            records.forEach(record => {
                const date = record.recordDate.split(' ')[0];
                if (!dateMap[date]) {
                    dateMap[date] = {
                        discipline: 0,
                        contribution: 0
                    };
                }

                if (record.categoryType === 'discipline') {
                    dateMap[date].discipline++;
                } else {
                    dateMap[date].contribution++;
                }
            });

            const sortedDates = Object.keys(dateMap).sort();
            const disciplineData = sortedDates.map(date => dateMap[date].discipline);
            const contributionData = sortedDates.map(date => dateMap[date].contribution);

            const option = {
                title: {
                    text: '每日积分类型分布',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                legend: {
                    data: ['纪律积分', '贡献积分'],
                    left: 'right',  // 修改图例位置为左侧
                    top: 'top',    // 修改图例位置为顶部
                    orient: 'vertical'  // 设置图例垂直排列
                },
                xAxis: {
                    type: 'category',
                    data: sortedDates,
                    axisLabel: {
                        rotate: 45
                    }
                },
                yAxis: {
                    type: 'value',
                    name: '发生次数'
                },
                series: [
                    {
                        name: '纪律积分',
                        type: 'bar',
                        stack: 'total',
                        data: disciplineData,
                        itemStyle: {
                            color: '#F56C6C'
                        },
                        label: {
                            show: true,
                            position: 'inside',
                            formatter: function (params) {
                                return params.value > 0 ? params.value : '';
                            }
                        }
                    },
                    {
                        name: '贡献积分',
                        type: 'bar',
                        stack: 'total',
                        data: contributionData,
                        itemStyle: {
                            color: '#67C23A'
                        },
                        label: {
                            show: true,
                            position: 'inside',
                            formatter: function (params) {
                                return params.value > 0 ? params.value : '';
                            }
                        }
                    }
                ]
            };

            this.compareChart.setOption(option);
        }
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.resizeCharts);
        this.pieChart && this.pieChart.dispose();
        this.barChart && this.barChart.dispose();
        this.rankChart && this.rankChart.dispose();
        this.compareChart && this.compareChart.dispose();
    }
};
</script>


</script>

<style scoped>
.chart-container {
    margin-top: 30px;
}

.chart-row {
    display: flex;
    margin-bottom: 20px;
}

.chart-item {
    flex: 1;
    margin: 0 10px;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    padding: 15px;
}

.chart-title {
    text-align: center;
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 15px;
    color: #606266;
}

@media (max-width: 1200px) {
    .chart-row {
        flex-direction: column;
    }

    .chart-item {
        margin-bottom: 20px;
    }
}
</style>