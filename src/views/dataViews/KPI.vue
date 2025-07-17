<template>
    <div class="kpi-module">

        <!-- 时间筛选 -->
        <div class="filter-section">
            <el-form :inline="true">
                <el-form-item label="视图模式">
                    <el-radio-group v-model="viewMode" @change="fetchKpiData()">
                        <el-radio-button label="monthly">单月视图</el-radio-button>
                        <el-radio-button label="range">累计视图</el-radio-button>
                    </el-radio-group>
                </el-form-item>

                <el-form-item label="选择月份" v-if="viewMode === 'monthly'">
                    <el-date-picker v-model="selectedMonth" type="month" placeholder="选择月份" format="yyyy年MM月"
                        value-format="yyyy-MM" @change="fetchKpiData()">
                    </el-date-picker>
                </el-form-item>
                <!-- 时间范围模式下的日期范围选择 -->
                <el-form-item label="时间范围" v-else>
                    <el-date-picker v-model="dateRange" type="monthrange" range-separator="至" start-placeholder="开始月份"
                        end-placeholder="结束月份" format="yyyy年MM月" value-format="yyyy-MM" @change="fetchKpiData()" />
                </el-form-item>
                <el-form-item label="选择科员" v-if="user.type === 1">
                    <el-select v-model="curUser" placeholder="请选择科员" @change="handleUserChange()">
                        <el-option-group v-for="group in directorOptions" :key="group.value" :label="group.label">
                            <el-option v-for="item in group.children" :key="item.value" :label="item.label"
                                :value="item.value">
                            </el-option>
                        </el-option-group>
                    </el-select>
                </el-form-item>
                <el-form-item label="" v-if="user.type === 1">
                    <el-button type="primary" icon="el-icon-top" round @click="changeUser(-1)"></el-button>
                    <el-button type="primary" icon="el-icon-bottom" round @click="changeUser(1)"></el-button>
                </el-form-item>
            </el-form>

        </div>

        <!-- KPI概览卡片 -->
        <div class="kpi-overview">
            <el-row :gutter="20">
                <el-col :span="3" v-for="(item, index) in kpiSummary" :key="index">
                    <el-card shadow="hover">
                        <div class="kpi-card">
                            <div class="kpi-name">{{ item.kpiName }}</div>
                            <div class="kpi-value">{{ item.currentValue }} <span class="kpi-unit">{{ item.unit
                            }}</span>
                            </div>
                            <div class="kpi-compare">
                                <span :class="item.trend > 0 ? 'up' : 'down'">
                                    <i class="el-icon-s-data"></i>
                                </span>
                                {{ item.lastValue }}
                                <span class="kpi-unit">{{ item.unit }} 上月</span>
                            </div>
                            <div class="kpi-compare">
                                <span :class="item.trend > 0 ? 'up' : 'down'">
                                    <i :class="item.trend > 0 ? 'el-icon-top' : 'el-icon-bottom'"></i>
                                    {{ Math.abs(item.changeRate) }}%
                                </span>
                                环比
                            </div>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
        </div>

        <el-card style="width:30%" v-if="showTimeline">
            <KpiTimeline :kpi-data="timelineList"></KpiTimeline>
        </el-card>

        <!-- KPI明细表格和饼图 -->
        <div class="kpi-table">
            <el-row :gutter="20">
                <el-col :span="14">
                    <el-card shadow="hover">
                        <div class="table-header">
                            <div class="table-title">个人KPI明细数据</div>
                            <el-button type="primary" size="small" @click="toggleTimeline()">{{ !showTimeline ? '展开时间线'
                                : '收起时间线' }}</el-button>
                        </div>
                        <el-table :data="kpiSummary" style="width: 100%" border stripe v-loading="loading"
                            :cell-style="{ textAlign: 'center' }" :header-cell-style="{ textAlign: 'center' }">
                            <el-table-column prop="kpiName" label="KPI指标" width="180"></el-table-column>
                            <el-table-column prop="currentValue" label="得分" width="120">
                                <template slot-scope="scope">
                                    <span :class="{
                                        'score-highlight': true,
                                        'higher-than-avg': scope.row.currentValue > scope.row.avgValue,
                                        'lower-than-avg': scope.row.currentValue < scope.row.avgValue,
                                        'equal-to-avg': scope.row.currentValue === scope.row.avgValue
                                    }">
                                        {{ scope.row.currentValue + (scope.row.kpiName.includes('率') ? ' %' : ' 分') }}
                                    </span>
                                </template>
                            </el-table-column>
                            <el-table-column prop="rank" label="排名"></el-table-column>
                            <el-table-column prop="maxValue" label="最高分">
                                <template slot-scope="scope">
                                    {{ scope.row.maxValue.toFixed(1) }}
                                </template>
                            </el-table-column>
                            <el-table-column prop="avgValue" label="部门平均" width="120">
                            </el-table-column>
                            <el-table-column label="操作" width="120">
                                <template slot-scope="scope">
                                    <el-button size="mini" @click="showDetail(scope.row)"
                                        v-if="scope.row.type !== 'totalScore'">详情</el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-card>
                </el-col>
                <el-col :span="10">
                    <el-card shadow="hover">
                        <el-card shadow="hover">
                            <div class="chart-title">{{ viewMode === 'monthly' ? selectedMonth : (dateRange[0] + '至' +
                                dateRange[1]) }}
                                KPI得分组成</div>
                            <div class="chart-container">
                                <KPIPieChart :data="kpiScoreDetails"
                                    :cur-date="viewMode === 'monthly' ? selectedMonth : (dateRange[0] + '至' + dateRange[1])" />
                            </div>
                        </el-card>
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

        <!-- 详情弹窗 -->
        <el-dialog :title="currentDetailTitle" :visible.sync="detailVisible" width="85%">

            <!-- 纪律得分详情 -->
            <div v-if="currentDetailType === 'discipline'">
                <el-table :data="currentDetailData" border :cell-style="{ textAlign: 'center' }"
                    :header-cell-style="{ textAlign: 'center' }">
                    <el-table-column prop="categoryName" label="考核项" width="180"></el-table-column>
                    <el-table-column prop="scoreValue" label="得分" width="120">
                        <template slot-scope="scope">
                            <span :class="{
                                'score-highlight': true,
                                'lower-than-avg': true
                            }">
                                {{ scope.row.scoreValue.toFixed(1) }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="recordDate" label="记录日期" width="120">
                        <template slot-scope="scope">
                            <el-tag effect="dark" type="success">{{ scope.row.recordDate }}</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="recordedName" label="记录人" width="100">
                    </el-table-column>
                    <el-table-column prop="description" label="描述">
                    </el-table-column>
                </el-table>
            </div>

            <!-- 贡献得分详情 -->
            <div v-if="currentDetailType === 'contribution'">
                <el-table :data="currentDetailData" border :cell-style="{ textAlign: 'center' }"
                    :header-cell-style="{ textAlign: 'center' }">
                    <el-table-column prop="categoryName" label="考核项" width="180"></el-table-column>
                    <el-table-column prop="scoreValue" label="得分" width="120">
                        <template slot-scope="scope">
                            <span :class="{
                                'score-highlight': true,
                                'higher-than-avg': true
                            }">
                                {{ scope.row.scoreValue.toFixed(1) }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="recordDate" label="记录日期" width="120">
                        <template slot-scope="scope">
                            <el-tag effect="dark" type="success">{{ scope.row.recordDate }}</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="recordedName" label="记录人" width="100">
                    </el-table-column>
                    <el-table-column prop="description" label="描述">
                    </el-table-column>
                </el-table>
            </div>

            <!-- 临时任务详情 -->
            <div v-if="currentDetailType === 'tempTask' || currentDetailType === 'tempTaskAchieveRate'">
                <el-table :data="currentDetailData" border :cell-style="{ textAlign: 'center' }"
                    :header-cell-style="{ textAlign: 'center' }">
                    <el-table-column prop="type" label="任务种类" width="100">
                        <template slot-scope="scope">
                            <el-tag effect="dark" type="warning" v-if="scope.row.type === 1">临时任务</el-tag>
                            <el-tag effect="dark" type="primary" v-else-if="scope.row.type === 2">技术研究</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="description" label="任务描述" width="300"></el-table-column>
                    <el-table-column prop="startTime" label="开始时间" width="200"></el-table-column>
                    <el-table-column prop="finishTime" label="完成时间" width="200"></el-table-column>
                    <el-table-column prop="planDays" label="计划天数" width="120"></el-table-column>
                    <el-table-column prop="unforcedDays" label="外界延期" width="120"></el-table-column>
                    <el-table-column prop="executionTime" label="实际执行天数" width="120"></el-table-column>
                    <el-table-column prop="score" label="得分" width="80">
                        <template slot-scope="scope">
                            <span :class="{
                                'score-highlight': true,
                                'higher-than-avg': true
                            }">{{ scope.row.score.toFixed(1) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="achieveRate" label="达成率" width="120">
                        <template slot-scope="scope">
                            <span :class="{
                                'score-highlight': true,
                                'higher-than-avg': true
                            }">{{ scope.row.achieveRate.toFixed(1) }}%
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="userName" label="执行人"></el-table-column>
                </el-table>
            </div>

            <!-- 项目阶段详情 -->
            <div v-if="currentDetailType === 'projectPhase' || currentDetailType === 'projectPhaseAchieveRate'">
                <el-table :data="currentDetailData" border :cell-style="{ textAlign: 'center' }"
                    :header-cell-style="{ textAlign: 'center' }">
                    <el-table-column prop="caseName" label="专案" width="200"></el-table-column>
                    <el-table-column prop="subName" label="阶段" width="120"></el-table-column>
                    <el-table-column prop="startTime" label="开始时间" width="200"></el-table-column>
                    <el-table-column prop="finishTime" label="完成时间" width="200"></el-table-column>
                    <el-table-column prop="planDays" label="计划天数" width="120"></el-table-column>
                    <el-table-column prop="unforcedDays" label="外界延期" width="120"></el-table-column>
                    <el-table-column prop="executionDays" label="实际执行天数" width="120"></el-table-column>
                    <el-table-column prop="value" label="得分比例(%)" width="120">
                        <template slot-scope="scope">
                            <span :class="{
                                'score-highlight': true,
                                'higher-than-avg': true
                            }">{{ scope.row.value === null ? 0 : scope.row.value.toFixed(1) }}%
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="score" label="得分" width="120">
                        <template slot-scope="scope">
                            <span :class="{
                                'score-highlight': true,
                                'higher-than-avg': true
                            }">
                                {{ scope.row.userPoints.toFixed(1) }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="achieveRate" label="达成率" width="120">
                        <template slot-scope="scope">
                            <span :class="{
                                'score-highlight': true,
                                'higher-than-avg': true
                            }">{{ scope.row.achieveRate.toFixed(1) }}%</span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <!-- 专案结案详情 -->
            <div v-if="currentDetailType === 'projectClose'">
                <el-table :data="currentDetailData" border :cell-style="{ textAlign: 'center' }"
                    :header-cell-style="{ textAlign: 'center' }">
                    <el-table-column prop="caseName" label="专案" width="300"></el-table-column>
                    <el-table-column prop="caseFinishTime" label="结案时间" width="200"></el-table-column>
                    <el-table-column prop="totalPlanDays" label="计划时间" width="200"></el-table-column>
                    <el-table-column prop="caseCompletionPoints" label="结案分数" width="200">
                        <template slot-scope="scope">
                            <span :class="{
                                'score-highlight': true,
                                'lower-than-avg': true
                            }">{{ scope.row.caseCompletionPoints.toFixed(1) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="userType" label="身份" width="200">
                        <template slot-scope="scope">
                            <el-tag effect="dark" type="primary"
                                v-if="scope.row.userType === 'sub_member'">设计人员</el-tag>
                            <el-tag effect="dark" type="warning"
                                v-else-if="scope.row.userType === 'participant'">辅助人员</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="commissionRate" label="提成占比" width="200">
                        <template slot-scope="scope">
                            <span :class="{
                                'score-highlight': true,
                                'higher-than-avg': true
                            }">
                                {{ scope.row.commissionRate.toFixed(1) }} %
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="userFinalPoints" label="得分" width="120">
                        <template slot-scope="scope">
                            <span :class="{
                                'score-highlight': true,
                                'higher-than-avg': true
                            }">
                                {{ scope.row.userFinalPoints.toFixed(1) }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-button type="primary" @click="openReport(scope.row.caseId)">详情</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </el-dialog>

    </div>
</template>

<script>
// import * as echarts from 'echarts'
import KPITrendChart from '@/components/KpiComponents/KPITrendChart'
import KPIPieChart from '@/components/KpiComponents/KPIPieChart'
import KpiTimeline from '@/components/KpiComponents/KpiTimeline'
import { getMonthKpi, getUserMonthRangeKpi } from '@/api/kpi'
import { mapState } from 'vuex'
import { initDirectorOptions } from '@/utils/common'
import { getUserListWithAssistants } from '@/api/user'
export default {
    name: 'KPI',
    components: {
        KPITrendChart,
        KPIPieChart,
        KpiTimeline
    },
    data() {
        return {
            viewMode: 'monthly',
            dateRange: [this.getPreviousMonth(), this.getPreviousMonth()],
            selectedMonth: this.getPreviousMonth(), // 默认当前年月
            kpiSummary: [],
            kpiScoreDetails: [],
            disciplineDetails: [],
            contributionDetails: [],
            tempTaskDetails: [],
            projectPhaseDetails: [],
            projectCloseDetails: [],
            trendChartData: [],
            lineChart: null,
            pieChart: null,
            loading: false,
            detailVisible: false,
            currentDetailTitle: '',
            currentDetailType: '',
            currentDetailData: [],
            //负责人的级联选择器
            directorOptions: initDirectorOptions(),
            allUsers: [],
            curUser: null,
            timelineList: [],
            showTimeline: false
        }
    },
    computed: {
        ...mapState(['user'])
    },
    async mounted() {
        // 首次加载时获取参数
        this.initFromRouteParams(this.$route.params)
        if (this.user.type === 1) {
            await this.getAllUser()
        } else {
            this.curUser = this.user.id
        }
        this.fetchKpiData()
    },
    beforeRouteEnter(to, from, next) {
        next(vm => {
            // 这里可以访问组件实例 vm
            vm.curUser = to.params.curUser
            vm.viewMode = to.params.viewMode
            vm.dateRange = to.params.dateRange
            vm.selectedMonth = to.params.selectedMonth
            vm.fetchKpiData()
        });
    },
    beforeDestroy() {
        if (this.lineChart) {
            this.lineChart.dispose()
        }
        if (this.pieChart) {
            this.pieChart.dispose()
        }
    },
    methods: {
        toggleTimeline() {
            this.showTimeline = !this.showTimeline
        },
        initFromRouteParams(params) {
            console.log(params)
            this.curUser = params.curUser || null
            this.viewMode = params.viewMode || 'monthly'
            this.dateRange = params.dateRange || [this.getPreviousMonth(), this.getPreviousMonth()]
            this.selectedMonth = params.selectedMonth || this.getPreviousMonth()
        },
        //获取所有科员信息
        async getAllUser() {
            //获取所有科员信息
            var { data: res } = await getUserListWithAssistants()
            for (var i = 0; i < res.length; i++) {
                this.directorOptions[res[i].status].children.push({ value: res[i].id, label: res[i].name })
            }
            // 扁平化用户列表
            this.allUsers = this.directorOptions.reduce((acc, group) => {
                return acc.concat(group.children);
            }, []);
            if (this.curUser === null)
                this.curUser = this.directorOptions[0].children[0].value
        },
        handleUserChange() {
            this.fetchKpiData()
        },
        getPreviousMonth() {
            const now = new Date()
            now.setMonth(now.getMonth() - 1)
            return now.toISOString().slice(0, 7)
        },
        async fetchKpiData() {
            this.loading = true
            var res;
            if (this.viewMode === 'monthly') {
                if(this.selectedMonth === null || this.selectedMonth === ''){
                    this.$message.error("请选择要查询的月份！")
                    return
                }
                this.queryYear = this.selectedMonth.slice(0, 4)
                this.queryMonth = this.selectedMonth.slice(5, 7)
                // 检查查询日期的合理性
                if (this.selectedMonth <= "2025-03") {
                    this.$message.error("KPI数据从2025年4月开始统计！")
                    return
                }
                const params = {
                    userId: this.curUser,
                    year: Number(this.queryYear),
                    month: Number(this.queryMonth)
                }
                res = await getMonthKpi(params)
            } else {
                if (this.dateRange[0] <= '2025-03') {
                    this.$message.error("KPI数据从2025年4月开始统计！")
                    return
                }
                const params = {
                    userId: this.curUser,
                    startDate: this.dateRange[0],
                    endDate: this.dateRange[1]
                }
                res = await getUserMonthRangeKpi(params)
            }
            if (res.code === 200) {
                const data = res.data
                this.kpiSummary = data.comparisons
                this.kpiSummary.forEach(item => {
                    item.currentValue = item.currentValue === null ? 0 : item.currentValue.toFixed(1)
                    item.lastValue = item.lastValue === null ? 0 : item.lastValue.toFixed(1)
                })
                this.kpiScoreDetails = this.kpiSummary.slice(0, 5)
                this.prepareKpiDetailData(data)
                // 加载时间线列表数据
                this.getTimeLineList()
                // 趋势数据
                this.trendChartData = data.historyData

                this.loading = false
            }
        },
        prepareKpiDetailData(data) {
            this.disciplineDetails = data.currentMonth.disciplineDetails
            this.contributionDetails = data.currentMonth.contributionDetails
            this.tempTaskDetails = data.currentMonth.tempTaskDetails
            this.projectPhaseDetails = data.currentMonth.projectPhaseDetails
            this.projectCloseDetails = data.currentMonth.projectCloseDetails
            if (this.disciplineDetails !== null) {
                this.disciplineDetails.sort((a, b) => {
                    return new Date(a.recordDate) - new Date(b.recordDate)
                })
            }
            if (this.contributionDetails !== null) {
                this.contributionDetails.sort((a, b) => {
                    return new Date(a.recordDate) - new Date(b.recordDate)
                })
            }
            if (this.tempTaskDetails !== null) {
                this.tempTaskDetails.sort((a, b) => {
                    return new Date(a.finishTime) - new Date(b.finishTime)
                })
            }
            if (this.projectPhaseDetails !== null) {
                this.projectPhaseDetails.sort((a, b) => {
                    return new Date(a.finishTime) - new Date(b.finishTime)
                })
            }
            if (this.projectCloseDetails !== null) {
                this.projectCloseDetails.sort((a, b) => {
                    return new Date(a.caseFinishTime) - new Date(b.caseFinishTime)
                })
            }
        },
        getTimeLineList() {
            this.timelineList = []
            if (this.disciplineDetails) {
                this.disciplineDetails.forEach(item => {
                    var obj = {}
                    obj.type = item.categoryType
                    obj.title = item.categoryName
                    obj.content = item.description
                    obj.score = item.scoreValue
                    obj.time = item.recordDate
                    this.timelineList.push(obj)
                })
            }
            if (this.contributionDetails) {
                this.contributionDetails.forEach(item => {
                    var obj = {}
                    obj.type = item.categoryType
                    obj.title = item.categoryName
                    obj.content = item.description
                    obj.score = item.scoreValue
                    obj.time = item.recordDate
                    this.timelineList.push(obj)
                })
            }
            if (this.tempTaskDetails) {
                this.tempTaskDetails.forEach(item => {
                    var obj = {}
                    obj.type = "task"
                    obj.title = item.type === 1 ? "临时任务" : "技术研究"
                    obj.content = item.description
                    obj.score = item.score.toFixed(1)
                    obj.time = item.finishTime
                    this.timelineList.push(obj)
                })
            }
            if (this.projectPhaseDetails) {
                this.projectPhaseDetails.forEach(item => {
                    var obj = {}
                    obj.type = "phase"
                    obj.title = item.caseName
                    obj.content = item.subName
                    obj.score = item.userPoints.toFixed(1)
                    obj.time = item.finishTime
                    this.timelineList.push(obj)
                })
            }
            if (this.projectCloseDetails) {
                this.projectCloseDetails.forEach(item => {
                    var obj = {}
                    obj.type = "completion"
                    obj.title = item.caseName
                    obj.content = item.userType === 'sub_member' ? "设计人员" : "辅助人员"
                    obj.score = item.userFinalPoints.toFixed(1)
                    obj.time = item.caseFinishTime
                    this.timelineList.push(obj)
                })
            }
            this.timelineList.sort((a, b) => {
                return new Date(a.time) - new Date(b.time)
            })
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
        },
        showDetail(row) {
            if (row.type === "totalScore")
                return;
            this.currentDetailTitle = `${row.kpiName}详情`
            this.currentDetailType = row.type

            switch (row.type) {
                case 'discipline':
                    this.currentDetailData = this.disciplineDetails
                    break
                case 'contribution':
                    this.currentDetailData = this.contributionDetails
                    break
                case 'tempTask':
                    this.currentDetailData = this.tempTaskDetails
                    break
                case 'projectPhase':
                    this.currentDetailData = this.projectPhaseDetails
                    break
                case 'projectClose':
                    this.currentDetailData = this.projectCloseDetails
                    break
                case 'tempTaskAchieveRate':
                    this.currentDetailData = this.tempTaskDetails
                    break
                case 'projectPhaseAchieveRate':
                    this.currentDetailData = this.projectPhaseDetails
                    break
            }

            this.detailVisible = true
        },
        // 修改当前科员
        changeUser(step) {

            // 查找当前用户索引
            const currentIndex = this.allUsers.findIndex(user => user.value === this.curUser);

            // 计算新索引，使用模运算处理循环
            const newIndex = (currentIndex + step + this.allUsers.length) % this.allUsers.length;

            // 更新当前用户
            this.curUser = this.allUsers[newIndex].value;

            // 更新视图
            this.fetchKpiData();
        },
        openReport(caseId) {
            this.detailVisible = false
            this.$router.push({
                name: '专案报告',
                query: {
                    "caseId": caseId
                }
            })
        }
    },

}
</script>

<style scoped>
.kpi-table {
    margin-bottom: 20px;
}

.chart-container {
    height: 450px;
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
    background-color: #f5f7fa;
    padding: 20px;
    margin-bottom: 20px;
    border-radius: 4px;
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
    height: 450px;
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

.score-highlight {
    font-weight: bold;
    padding: 2px 6px;
    border-radius: 4px;
}

.higher-than-avg {
    color: #67C23A;
    background-color: rgba(103, 194, 58, 0.1);
}

.lower-than-avg {
    color: #F56C6C;
    background-color: rgba(245, 108, 108, 0.1);
}

.equal-to-avg {
    color: #909399;
    background-color: rgba(144, 147, 153, 0.1);
}
</style>