<template>
    <div class="kpi-module">
        <!-- 时间筛选 -->
        <div class="filter-section">
            <el-date-picker v-model="selectedMonth" type="month" placeholder="选择月份" format="yyyy年MM月"
                value-format="yyyy-MM" @change="fetchKpiData">
            </el-date-picker>
        </div>

        <!-- KPI概览卡片 -->
        <div class="kpi-overview">
            <el-row :gutter="20">
                <el-col :span="3" v-for="(item, index) in kpiSummary" :key="index">
                    <el-card shadow="hover">
                        <div class="kpi-card">
                            <div class="kpi-name">{{ item.name }}</div>
                            <div class="kpi-value">{{ item.value }} <span class="kpi-unit">{{ item.unit }}</span></div>
                            <div class="kpi-progress">
                                <el-progress v-if="item.maxValue"
                                    :percentage="(item.value / item.maxValue * 100).toFixed(1)"
                                    :color="getProgressColor(item.value / item.maxValue * 100)">
                                </el-progress>
                            </div>
                            <div class="kpi-compare">
                                <span :class="item.trend > 0 ? 'up' : 'down'">
                                    <i :class="item.trend > 0 ? 'el-icon-top' : 'el-icon-bottom'"></i>
                                    {{ Math.abs(item.trend) }}%
                                </span>
                                环比
                            </div>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
        </div>

        <!-- KPI明细表格和饼图 -->
        <div class="kpi-table">
            <el-row :gutter="20">
                <el-col :span="16">
                    <el-card shadow="hover">
                        <div class="table-header">
                            <div class="table-title">个人KPI明细数据</div>
                            <el-button type="primary" size="small" @click="exportKpiData">导出数据</el-button>
                        </div>
                        <el-table :data="kpiDetails" style="width: 100%" border stripe v-loading="loading">
                            <el-table-column prop="name" label="KPI指标" width="180">
                            </el-table-column>
                            <el-table-column prop="target" label="目标值" width="120">
                            </el-table-column>
                            <el-table-column prop="actual" label="实际值" width="120">
                            </el-table-column>
                            <el-table-column prop="completion" label="达成率" width="120">
                                <template slot-scope="scope">
                                    <el-tag :type="getCompletionType(scope.row.completion)">
                                        {{ scope.row.completion }}%
                                    </el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column prop="weight" label="权重" width="120">
                            </el-table-column>
                            <el-table-column prop="score" label="得分" width="120">
                            </el-table-column>
                            <el-table-column prop="departmentAvg" label="部门平均" width="120">
                            </el-table-column>
                            <el-table-column label="操作" width="120">
                                <template slot-scope="scope">
                                    <el-button size="mini" @click="handleDetail(scope.row)">详情</el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-card>
                </el-col>
                <el-col :span="8">
                    <el-card shadow="hover">
                        <div class="chart-title">本月KPI得分组成</div>
                        <div class="chart-container">
                            <KPIPieChart :data="kpiDetails" />
                        </div>
                    </el-card>
                </el-col>
            </el-row>
        </div>

        <!-- KPI趋势图表 -->
        <div class="kpi-charts">
            <el-card shadow="hover">
                <div class="chart-title">个人KPI趋势分析</div>
                <div class="chart-container">
                    <KPITrendChart :data="trendChartData" />
                </div>
            </el-card>
        </div>
    </div>
</template>

<script>
// import * as echarts from 'echarts'
import KPITrendChart from '@/components/KpiComponents/KPITrendChart'
import KPIPieChart from '@/components/KpiComponents/KPIPieChart'

export default {
    components: {
        KPITrendChart,
        KPIPieChart
    },
    data() {
        return {
            selectedMonth: this.getPreviousMonth(), // 默认当前年月
            kpiSummary: [
                { name: '纪律得分', value: 85, unit: '分', maxValue: 100, trend: 5.2 },
                { name: '贡献得分', value: 78, unit: '分', maxValue: 100, trend: -2.1 },
                { name: '临时任务得分', value: 92, unit: '分', maxValue: 100, trend: 3.5 },
                { name: '专案阶段得分', value: 83, unit: '分', maxValue: 100, trend: 1.8 },
                { name: '专案结案得分', value: 88, unit: '分', maxValue: 100, trend: 2.3 },
                { name: '部门积分平均', value: 82, unit: '分', maxValue: 100, trend: 1.2 },
                { name: '临时任务达成率', value: 92, unit: '%', maxValue: 100, trend: 3.5 },
                { name: '专案任务达成率', value: 88, unit: '%', maxValue: 100, trend: 1.8 }
            ],
            kpiDetails: [
                {
                    id: 1,
                    name: '纪律得分',
                    target: 90,
                    actual: 85,
                    completion: 94.4,
                    weight: 20,
                    score: 17,
                    departmentAvg: 82
                },
                {
                    id: 2,
                    name: '贡献得分',
                    target: 85,
                    actual: 78,
                    completion: 91.8,
                    weight: 15,
                    score: 14,
                    departmentAvg: 75
                },
                {
                    id: 3,
                    name: '临时任务得分',
                    target: 100,
                    actual: 92,
                    completion: 92,
                    weight: 25,
                    score: 23,
                    departmentAvg: 88
                },
                {
                    id: 4,
                    name: '专案阶段得分',
                    target: 90,
                    actual: 83,
                    completion: 92.2,
                    weight: 15,
                    score: 13,
                    departmentAvg: 80
                },
                {
                    id: 5,
                    name: '专案结案得分',
                    target: 95,
                    actual: 88,
                    completion: 92.6,
                    weight: 25,
                    score: 22,
                    departmentAvg: 85
                }
            ],
            trendChartData: [
                [80, 82, 83, 85, 84, 85, 85], // 纪律得分
                [75, 76, 78, 80, 79, 78, 78], // 贡献得分
                [85, 87, 88, 90, 91, 92, 92], // 临时任务得分
                [82, 84, 85, 86, 87, 88, 88], // 专案阶段得分
                [80, 82, 84, 85, 86, 87, 88], // 专案结案得分
                [85, 87, 88, 90, 91, 92, 92], // 临时任务达成率
                [82, 84, 85, 86, 87, 88, 88]  // 专案任务达成率
            ],
            lineChart: null,
            pieChart: null,
            loading: false
        }
    },
    methods: {
        getPreviousMonth() {
            const now = new Date()
            now.setMonth(now.getMonth() - 1)
            return now.toISOString().slice(0, 7)
        },
        fetchKpiData() {
            this.loading = true
            // 模拟API请求
            setTimeout(() => {
                this.loading = false
            }, 500)
        },
        getProgressColor(percentage) {
            if (percentage >= 90) {
                return '#67C23A'
            } else if (percentage >= 80) {
                return '#E6A23C'
            } else {
                return '#F56C6C'
            }
        },
        getCompletionType(percentage) {
            if (percentage >= 100) {
                return 'success'
            } else if (percentage >= 90) {
                return 'warning'
            } else {
                return 'danger'
            }
        },
        handleDetail(row) {
            this.$message.info(`查看${row.name}详情`)
            // 实际项目中这里会打开详情对话框
        },
        exportKpiData() {
            this.$message.success('导出数据成功')
        }
    },
    mounted() {
        this.fetchKpiData()
    },
    beforeDestroy() {
        if (this.lineChart) {
            this.lineChart.dispose()
        }
        if (this.pieChart) {
            this.pieChart.dispose()
        }
    }
}
</script>

<style scoped>
.kpi-table {
    margin-bottom: 20px;
}

.chart-container {
    height: 400px;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.kpi-module {
    padding: 20px;
}

.kpi-module .filter-section {
    margin-bottom: 20px;
}

.kpi-module .kpi-overview {
    margin-bottom: 20px;
}

.kpi-module .kpi-overview .kpi-card {
    padding: 10px;
}

.kpi-module .kpi-overview .kpi-card .kpi-name {
    font-size: 14px;
    color: #606266;
    margin-bottom: 10px;
}

.kpi-module .kpi-overview .kpi-card .kpi-value {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 15px;
}

.kpi-module .kpi-overview .kpi-card .kpi-value .kpi-unit {
    font-size: 14px;
    color: #909399;
}

.kpi-module .kpi-overview .kpi-card .kpi-progress {
    margin-bottom: 10px;
}

.kpi-module .kpi-overview .kpi-card .kpi-compare {
    font-size: 12px;
    color: #909399;
}

.kpi-module .kpi-overview .kpi-card .kpi-compare .up {
    color: #67C23A;
}

.kpi-module .kpi-overview .kpi-card .kpi-compare .down {
    color: #F56C6C;
}

.kpi-module .kpi-charts {
    margin-bottom: 20px;
}

.kpi-module .kpi-charts .chart-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 15px;
}

.kpi-module .kpi-charts .chart-container {
    height: 400px;
}

.kpi-module .kpi-table .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.kpi-module .kpi-table .table-header .table-title {
    font-size: 16px;
    font-weight: bold;
}
</style>