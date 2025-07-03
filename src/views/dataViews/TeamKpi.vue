<template>
    <div class="team-kpi-container">
        <!-- 筛选区域 -->
        <div class="filter-section">
            <el-form :inline="true">
                <el-form-item label="选择月份">
                    <el-date-picker v-model="selectedMonth" type="month" placeholder="选择月份" format="yyyy年MM月"
                        value-format="yyyy-MM" @change="fetchTeamKpiData" />
                </el-form-item>
            </el-form>
        </div>

        <!-- KPI概览卡片 -->
        <div class="overview-section">
            <el-row :gutter="20">
                <el-col :span="4">
                    <el-card shadow="hover">
                        <div class="overview-card">
                            <div class="card-title">团队平均分</div>
                            <div class="card-value">{{ curMonthDepartInfo.avgScore.toFixed(2) }}</div>
                            <div class="card-compare" v-if="trendData.length > 1">
                                <span :class="avgScoreTrend > 0 ? 'up' : 'down'">
                                    <i :class="avgScoreTrend > 0 ? 'el-icon-top' : 'el-icon-bottom'"></i>
                                    {{ Math.abs(avgScoreTrend).toFixed(1) }}%
                                </span>
                                环比上月
                            </div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="4">
                    <el-card shadow="hover">
                        <div class="overview-card">
                            <el-tooltip class="item" effect="light" content="值越小，团队得分越接近，越稳定. 值越大，团队得分越分散，差异越大"
                                placement="top">
                                <div class="card-title">标准差</div>
                            </el-tooltip>
                            <div class="card-value">{{ curMonthDepartInfo.standardDeviation.toFixed(2) }}</div>
                            <div class="card-subtitle">方差: {{ curMonthDepartInfo.variance.toFixed(2) }}</div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="4">
                    <el-card shadow="hover">
                        <div class="overview-card">
                            <div class="card-title">高于平均分</div>
                            <div class="card-value">{{ curMonthDepartInfo.higherThanAverage }} 人</div>
                            <div class="card-subtitle" style="color:#7fc051">人数占比：{{
                                (curMonthDepartInfo.higherThanAverage / curMonthDepartInfo.employeeCount * 100).toFixed()
                            }}%</div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="4">
                    <el-card shadow="hover">
                        <div class="overview-card">
                            <div class="card-title">低于平均分</div>
                            <div class="card-value">{{ curMonthDepartInfo.lowerThanAverage }} 人</div>
                            <div class="card-subtitle" style="color:#e57975">人数占比：{{
                                (curMonthDepartInfo.lowerThanAverage / curMonthDepartInfo.employeeCount * 100).toFixed()
                                }}%
                            </div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="4">
                    <el-card shadow="hover">
                        <div class="overview-card">
                            <div class="card-title">最高分</div>
                            <div class="card-value">{{ curMonthDepartInfo.maxScore.toFixed(2) }}</div>
                            <div class="card-subtitle">{{ curMonthDepartInfo.topPerformer }}</div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="4">
                    <el-card shadow="hover">
                        <div class="overview-card">
                            <div class="card-title">最低分</div>
                            <div class="card-value">{{ curMonthDepartInfo.minScore.toFixed(2) }}</div>
                            <div class="card-subtitle">{{ curMonthDepartInfo.lowPerformer }}</div>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
        </div>

        <!-- 团队KPI堆叠柱状图 -->
        <div class="chart-section">
            <el-card shadow="hover">
                <div class="section-title">
                    <span>{{ selectedMonth }} 团队KPI构成</span>
                </div>
                <div class="chart-container">
                    <TeamKpiStackChart :data="chartData" :selected-month="selectedMonth"
                        :averageScore="curMonthDepartInfo.avgScore" :loading="chartLoading" />
                </div>
            </el-card>
        </div>

        <!-- 团队KPI趋势图表 -->
        <div class="trend-section">
            <el-card shadow="hover">
                <div class="section-title">团队KPI趋势分析</div>
                <div class="chart-container">
                    <TeamKpiTrendChart :data="trendData" :loading="trendLoading" />
                </div>
            </el-card>
        </div>

        <!-- 团队KPI明细表格 -->
        <div class="table-section">
            <el-card shadow="hover">
                <div class="section-title">
                    <span>团队成员KPI明细</span>
                </div>
                <div>
                    <el-form :inline="true">
                        <el-form-item label="职责筛选">
                            <el-select v-model="selectedDepartment" placeholder="全部职责" @change="filterTeamData">
                                <el-option v-for="dept in departmentOptions" :key="dept.value" :label="dept.label"
                                    :value="dept.value" />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="排序方式">
                            <el-select v-model="sortType" placeholder="默认排序" @change="sortTeamData">
                                <el-option v-for="sort in sortOptions" :key="sort.value" :label="sort.label"
                                    :value="sort.value" />
                            </el-select>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="exportTeamKpi">导出数据</el-button>
                        </el-form-item>
                    </el-form>
                </div>
                <el-table id="kpiTable" :data="filteredTeamData" border stripe style="width: 100%" v-loading="tableLoading"
                    @sort-change="handleSortChange">
                    <el-table-column prop="rank" label="排名" width="80" sortable>
                        <template slot-scope="scope">
                            <span v-if="scope.row.rank <= 3" class="top-rank">
                                <i class="el-icon-medal" :style="{ color: rankColors[scope.row.rank - 1] }"></i>
                                {{ scope.row.rank }}
                            </span>
                            <span v-else>{{ scope.row.rank }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="userName" label="姓名" width="120" sortable>
                        <template slot-scope="scope">
                            <el-tag :type="scope.row.isCurrentUser ? 'success' : ''">
                                {{ scope.row.userName }}
                                <i v-if="scope.row.isCurrentUser" class="el-icon-user"></i>
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="status" label="职位" width="150" sortable>
                        <template slot-scope="scope">
                            <el-tag effect="dark" type="primary" v-if="scope.row.status === 0">{{ '机构' }}</el-tag>
                            <el-tag effect="dark" type="success" v-else-if="scope.row.status === 1">{{ '电控' }}</el-tag>
                            <el-tag effect="dark" type="warning" v-else-if="scope.row.status === 2">{{ 'IE' }}</el-tag>
                            <el-tag effect="dark" type="info" v-else-if="scope.row.status === 3">{{ '机设' }}</el-tag>
                            <el-tag effect="dark" type="warning" v-else-if="scope.row.status === 4">{{ '助理' }}</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="totalScore" label="总分" width="120" sortable>
                        <template slot-scope="scope">
                            <span :class="getScoreClass(scope.row.totalScore)">
                                {{ scope.row.totalScore.toFixed(2) }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="disciplineScore" label="纪律得分" width="120" sortable>
                        <template slot-scope="scope">
                            <span :class="getScoreClass(scope.row.disciplineScore, 'discipline')">
                                {{ scope.row.disciplineScore }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="contributionScore" label="贡献得分" width="120" sortable>
                        <template slot-scope="scope">
                            <span :class="getScoreClass(scope.row.contributionScore, 'contribution')">
                                {{ scope.row.contributionScore }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="tempTaskScore" label="临时任务" width="120" sortable>
                        <template slot-scope="scope">
                            <span :class="getScoreClass(scope.row.tempTaskScore, 'tempTask')">
                                {{ scope.row.tempTaskScore }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="projectPhaseScore" label="项目阶段" width="120" sortable>
                        <template slot-scope="scope">
                            <span :class="getScoreClass(scope.row.projectPhaseScore, 'projectPhase')">
                                {{ scope.row.projectPhaseScore }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="projectCloseScore" label="项目结项" width="120" sortable>
                        <template slot-scope="scope">
                            <span :class="getScoreClass(scope.row.projectCloseScore, 'projectClose')">
                                {{ scope.row.projectCloseScore }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="120">
                        <template slot-scope="scope">
                            <el-button size="mini" @click="viewMemberDetail(scope.row)">详情</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <!-- <div class="pagination-wrapper">
                    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                        :current-page="currentPage" :page-sizes="[10, 20, 50, 100]" :page-size="pageSize"
                        layout="total, sizes, prev, pager, next, jumper" :total="filteredTeamData.length" />
                </div> -->
            </el-card>
        </div>

    </div>
</template>

<script>
import TeamKpiStackChart from '@/components/KpiComponents/TeamKpiStackChart'
import TeamKpiTrendChart from '@/components/KpiComponents/TeamKpiTrendChart'
// import MemberKpiDetail from '@/components/KpiComponents/MemberKpiDetail'
import { mapState } from 'vuex'
import { getTeamMonthKpi } from '@/api/kpi'
import { exportExcel } from '@/utils/exportExcel'

export default {
    components: {
        TeamKpiStackChart,
        TeamKpiTrendChart,
        // MemberKpiDetail
    },
    data() {
        return {
            selectedMonth: this.getPreviousMonth(),
            selectedDepartment: '',
            sortType: 'totalScore',
            chartType: 'score',
            // 当月的部门kpi总体数据
            curMonthDepartInfo: {
                avgScore: 0,
                maxScore: 0,
                minScore: 0,
                topPerformer: '--',
                lowPerformer: '--',
                standardDeviation: 0,
                variance: 0
            },
            // 环比上月
            avgScoreTrend: 0,
            passRate: 0,
            chartData: [],
            trendData: [],
            teamData: [],
            filteredTeamData: [],
            departmentOptions: [
                { value: '', label: '全部职责' },
                { value: 0, label: '机构' },
                { value: 1, label: '电控' },
                { value: 2, label: 'IE' },
                { value: 3, label: '机设' },
                { value: 4, label: '助理' }
            ],
            sortOptions: [
                { value: 'totalScore', label: '总分排序' },
                { value: 'status', label: '职责排序' }
            ],
            // 金银铜牌的颜色
            rankColors: ['#F56C6C', '#E6A23C', '#67C23A'],
            chartLoading: false,
            tableLoading: false,
            trendLoading: true,
            selectedMember: null
        }
    },
    computed: {
        ...mapState(['user']),
        detailDialogTitle() {
            return this.selectedMember ? `${this.selectedMember.name}的KPI详情` : '成员KPI详情'
        },
        paginatedData() {
            const start = (this.currentPage - 1) * this.pageSize
            const end = start + this.pageSize
            return this.filteredTeamData.slice(start, end)
        }
    },
    created() {
        this.fetchTeamKpiData()
    },
    methods: {
        getPreviousMonth() {
            const now = new Date()
            now.setMonth(now.getMonth() - 1)
            return now.toISOString().slice(0, 7)
        },
        async fetchTeamKpiData() {
            this.tableLoading = true
            this.chartLoading = true

            // 模拟API调用
            try {
                var year = Number(this.selectedMonth.slice(0, 4))
                var month = Number(this.selectedMonth.slice(5, 7))
                var params = {
                    year: year,
                    month: month
                }

                // 实际项目中这里应该是API调用
                const res = await getTeamMonthKpi(params)
                // 环比上月的平均分
                if(res.data.departmentAvgScoreList.length > 1)
                    this.avgScoreTrend = (res.data.departmentAvgScoreList[0].avgScore - res.data.departmentAvgScoreList[1].avgScore) / res.data.departmentAvgScoreList[1].avgScore * 100
                this.userKpiList = res.data.userKpis
                // 加工数据
                for (var i = 0; i < this.userKpiList.length; i++) {
                    this.userKpiList[i].disciplineScore = this.userKpiList[i].disciplineScore === null ? 0 : Number(this.userKpiList[i].disciplineScore.toFixed(2))
                    this.userKpiList[i].contributionScore = this.userKpiList[i].contributionScore === null ? 0 : Number(this.userKpiList[i].contributionScore.toFixed(2))
                    this.userKpiList[i].tempTaskScore = this.userKpiList[i].tempTaskScore === null ? 0 : Number(this.userKpiList[i].tempTaskScore.toFixed(2))
                    this.userKpiList[i].projectPhaseScore = this.userKpiList[i].projectPhaseScore === null ? 0 : Number(this.userKpiList[i].projectPhaseScore.toFixed(2))
                    this.userKpiList[i].projectCloseScore = this.userKpiList[i].projectCloseScore === null ? 0 : Number(this.userKpiList[i].projectCloseScore.toFixed(2))
                    this.userKpiList[i].tempTaskAvgAchievementRate = this.userKpiList[i].tempTaskAvgAchievementRate === null ? 0 : Number(this.userKpiList[i].tempTaskAvgAchievementRate.toFixed(2))
                    this.userKpiList[i].projectPhaseAvgAchievementRate = this.userKpiList[i].projectPhaseAvgAchievementRate === null ? 0 : Number(this.userKpiList[i].projectPhaseAvgAchievementRate.toFixed(2))
                }
                var data = {
                    members: this.userKpiList,
                    departInfo: res.data.departmentAvgScoreList
                }
                this.processTeamData(data)
                this.tableLoading = false
            } catch (error) {
                console.error(error)
                this.tableLoading = false
                this.chartLoading = false
            }
        },

        processTeamData(data) {
            this.teamData = data.members.map(member => ({
                ...member,
                isCurrentUser: member.id === this.user.id
            }))

            this.filteredTeamData = [...this.teamData]
            this.sortTeamData()

            // 计算团队统计数据
            this.curMonthDepartInfo = data.departInfo[0]
            this.passRate = 50

            // 准备图表数据
            this.chartData = this.prepareChartData()
            this.trendData = data.departInfo
            this.trendData.sort((a, b) => a.curDate.localeCompare(b.curDate))
        },

        prepareChartData() {
            return this.filteredTeamData.map(member => ({
                name: member.userName,
                totalScore: member.totalScore,
                disciplineScore: member.disciplineScore,
                contributionScore: member.contributionScore,
                tempTaskScore: member.tempTaskScore,
                projectPhaseScore: member.projectPhaseScore,
                projectCloseScore: member.projectCloseScore,
                tempTaskRate: member.tempTaskAvgAchievementRate,
                projectPhaseRate: member.projectPhaseAvgAchievementRate
            }))
        },

        filterTeamData() {
            if (this.selectedDepartment === '') {
                this.filteredTeamData = [...this.teamData]
            } else {
                this.filteredTeamData = this.teamData.filter(
                    member => member.status === this.selectedDepartment
                )
            }
            this.currentPage = 1
            this.sortTeamData()
            // 准备图表数据
            this.chartData = this.prepareChartData()
        },

        sortTeamData() {
            if (this.sortType === 'totalScore') {
                this.filteredTeamData.sort((a, b) => b.totalScore - a.totalScore)
            } else if (this.sortType === 'status') {
                this.filteredTeamData.sort((a, b) => a.status - b.status)
            }

            // 更新排名
            this.filteredTeamData.forEach((member, index) => {
                member.rank = index + 1
            })
        },

        handleSortChange({ column, prop, order }) {
            if (prop && order) {
                this.sortType = prop
                this.sortTeamData()
            }
        },

        updateChart() {
            this.chartLoading = true
            setTimeout(() => {
                this.chartLoading = false
            }, 300)
        },

        getScoreClass(score, type = 'total') {
            const baseClass = 'score-cell'
            const typeClass = `score-${type}`

            if (type === 'total') {
                if (score >= this.curMonthDepartInfo.avgScore) return `${baseClass} ${typeClass} score-high`
                return `${baseClass} ${typeClass} score-low`
            } else {
                const avg = this.getTypeAvgScore(type)
                if (score > avg) return `${baseClass} ${typeClass} score-higher`
                if (score < avg) return `${baseClass} ${typeClass} score-lower`
                return `${baseClass} ${typeClass} score-equal`
            }
        },

        getTypeAvgScore(type) {
            if (type === 'discipline')
                return this.curMonthDepartInfo.disciplineAvgScore
            if (type === 'contribution')
                return this.curMonthDepartInfo.contributionAvgScore
            if (type === 'tempTask')
                return this.curMonthDepartInfo.tempTaskAvgScore
            if (type === 'projectPhase')
                return this.curMonthDepartInfo.projectPhaseAvgScore
            if (type === 'projectClose')
                return this.curMonthDepartInfo.projectCloseAvgScore
        },

        viewMemberDetail(member) {
            this.$router.push({
                name: 'KPI管理',
                params: {
                    curUser: member.userId,
                    selectedMonth: this.selectedMonth
                }
            })
        },

        exportTeamKpi() {
            if(exportExcel('kpiTable', `${this.selectedMonth}新技研Kpi数据`, this))
                this.$message.success('导出团队KPI数据成功')
            else
                this.$message.error('导出团队KPI数据失败')
        },
    }
}
</script>

<style scoped>
.team-kpi-container {
    padding: 20px;
    background-color: #f5f7fa;
}

.team-kpi-container .filter-section {
    margin-bottom: 20px;
    background-color: #fff;
    padding: 20px;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.team-kpi-container .overview-section {
    margin-bottom: 20px;
}

.team-kpi-container .overview-section .overview-card {
    padding: 15px;
    text-align: center;
}

.team-kpi-container .overview-section .overview-card .card-title {
    font-size: 16px;
    color: #909399;
    margin-bottom: 10px;
}

.team-kpi-container .overview-section .overview-card .card-value {
    font-size: 28px;
    font-weight: bold;
    margin: 15px 0;
    color: #303133;
}

.team-kpi-container .overview-section .overview-card .card-subtitle {
    font-size: 14px;
    color: #606266;
    margin-top: 10px;
}

.team-kpi-container .overview-section .overview-card .card-compare {
    font-size: 14px;
    color: #909399;
}

.team-kpi-container .overview-section .overview-card .card-compare .up {
    color: #67C23A;
}

.team-kpi-container .overview-section .overview-card .card-compare .down {
    color: #F56C6C;
}

.team-kpi-container .chart-section,
.team-kpi-container .trend-section {
    margin-bottom: 20px;
}

.team-kpi-container .chart-section .section-title,
.team-kpi-container .trend-section .section-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    font-size: 16px;
    font-weight: bold;
    color: #303133;
}

.team-kpi-container .chart-section .chart-container,
.team-kpi-container .trend-section .chart-container {
    height: 600px;
}

.team-kpi-container .table-section {
    margin-bottom: 20px;
}

.team-kpi-container .table-section .section-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    font-size: 16px;
    font-weight: bold;
    color: #303133;
}

.team-kpi-container .table-section .pagination-wrapper {
    margin-top: 20px;
    text-align: right;
}

.team-kpi-container .table-section .top-rank {
    font-weight: bold;
}

.team-kpi-container .table-section .top-rank i {
    margin-right: 5px;
}

.team-kpi-container .table-section .score-cell {
    padding: 3px 6px;
    border-radius: 3px;
    display: inline-block;
}

.team-kpi-container .table-section .score-cell.score-high {
    background-color: rgba(103, 194, 58, 0.1);
    color: #67C23A;
}

.team-kpi-container .table-section .score-cell.score-medium {
    background-color: rgba(230, 162, 60, 0.1);
    color: #E6A23C;
}

.team-kpi-container .table-section .score-cell.score-low {
    background-color: rgba(245, 108, 108, 0.1);
    color: #F56C6C;
}

.team-kpi-container .table-section .score-cell.score-higher {
    background-color: rgba(103, 194, 58, 0.1);
    color: #67C23A;
}

.team-kpi-container .table-section .score-cell.score-lower {
    background-color: rgba(245, 108, 108, 0.1);
    color: #F56C6C;
}

.team-kpi-container .table-section .score-cell.score-equal {
    background-color: rgba(144, 147, 153, 0.1);
    color: #909399;
}

.el-card {
    border-radius: 4px;
}
</style>
