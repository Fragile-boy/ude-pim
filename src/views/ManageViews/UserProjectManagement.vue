<template>
    <div>
        <div>
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>部员管理</el-breadcrumb-item>
                <el-breadcrumb-item>部员专案管理</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <el-card>
            <!-- 搜索区域 -->
            <el-row :gutter="5">
                <el-col :span="3">
                    <el-select v-model="curType" placeholder="请选择任务类型" clearable @change="handleTypeChange()">
                        <el-option v-for="item in [{
                            value: 0,
                            label: '专案类'
                        }, {
                            value: 1,
                            label: '临时事务'
                        }, {
                            value: 2,
                            label: '技术研究'
                        }]" :key="item.value" :label="item.label" :value="item.value">
                        </el-option>
                    </el-select>
                </el-col>

                <el-col :span="3">
                    <el-select v-model="finishType" placeholder="完成情况" clearable>
                        <el-option v-for="item in [{
                            value: 0,
                            label: '正常'
                        }, {
                            value: 1,
                            label: '延误'
                        }]" :key="item.value" :label="item.label" :value="item.value">
                        </el-option>
                    </el-select>
                </el-col>

                <el-col :span="6">
                    <el-date-picker v-model="start_stop_time" type="daterange" align="left" unlink-panels
                        range-separator="——" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="timeOptions"
                        value-format="yyyy-MM-dd">
                    </el-date-picker>
                </el-col>

                <el-col :span="2">
                    <el-button type="primary" @click="filter()">查询</el-button>
                </el-col>

                <el-col :span="1" :offset="5">
                    <el-button type="primary" icon="el-icon-top" round @click="changeUser(-1)"></el-button>
                </el-col>

                <el-col :span="1">
                    <el-button type="primary" icon="el-icon-bottom" round @click="changeUser(1)"></el-button>
                </el-col>

                <el-col :span="3">
                    <el-select v-model="curUser" placeholder="请选择科员" @change="handleUserChange()">
                        <el-option-group v-for="group in directorOptions" :key="group.value" :label="group.label">
                            <el-option v-for="item in group.children" :key="item.value" :label="item.label"
                                :value="item.value">
                            </el-option>
                        </el-option-group>
                    </el-select>
                </el-col>
            </el-row>

            <el-table :data="showList" :default-sort="{ prop: 'finishTime', order: 'descending' }"
                @sort-change="handlesortChange" style="font-size: 18px;">
                <el-table-column label="类型">
                    <template slot-scope="scope">
                        <el-tag effect="dark" type="success" v-if="scope.row.caseSubId">专案类</el-tag>
                        <el-tag effect="dark" v-else-if="scope.row.type === 2">技术研究</el-tag>
                        <el-tag effect="dark" type="warning" v-else-if="scope.row.type === 1">临时事务</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="description" label="描述"></el-table-column>
                <el-table-column prop="startTime" sortable="custom" label="开始时间"></el-table-column>
                <el-table-column prop="finishTime" sortable label="完成时间"></el-table-column>
                <el-table-column prop="planDays" sortable label="计划时间"></el-table-column>
                <el-table-column prop="executionDays" sortable label="执行时间"></el-table-column>
                <el-table-column prop="unforcedDays" sortable label="外因延期"></el-table-column>
                <el-table-column prop="applyDelay" sortable label="人为延期"></el-table-column>
                <el-table-column prop="achievingRate" sortable label="达成率(%)"></el-table-column>
                <el-table-column label="是否延误">
                    <template slot-scope="scope">
                        <el-tag effect="dark" type="danger" v-if="scope.row.isDelay">延误</el-tag>
                        <el-tag effect="dark" type="success" v-else>正常</el-tag>
                    </template>
                </el-table-column>

            </el-table>
            <!-- 分页区域 -->
            <el-pagination style="margin-top: 10px;text-align: center;" @size-change="handleSizeChange"
                @current-change="handleCurrentChange" :current-page.sync="pageInfo.page" :page-sizes="[8, 10, 15, 20]"
                :page-size="pageInfo.pageSize" layout="total, sizes, prev, pager, next" :total="total">
            </el-pagination>

            <!-- 显示统计信息 -->
            <div class="statistics_container">
                <el-row :gutter="20">
                    <el-col :span="5">
                        <el-statistic :value="statisticsObj.executionDays" title="总执行时长"></el-statistic>
                    </el-col>
                    <el-col :span="5">
                        <el-statistic :value="statisticsObj.delayDays" title="总延误时长"></el-statistic>
                    </el-col>
                    <el-col :span="5">
                        <el-statistic :value="statisticsObj.sumTask" title="完成任务总件数"></el-statistic>
                    </el-col>
                    <el-col :span="5">
                        <el-statistic :precision="2" suffix="%" :value="statisticsObj.taskAchievingRate"
                            title="任务按期达成率"></el-statistic>
                    </el-col>
                    <el-col :span="4">
                        <el-statistic :precision="2" suffix="%" :value="statisticsObj.avgAchievingRate"
                            title="总达成率"></el-statistic>
                    </el-col>
                </el-row>
            </div>

        </el-card>
        <br>
        <!-- 显示图表信息 -->
        <div class="charts-area">
            <el-card class="pie-chart">
                <h2>任务类别</h2>
                <div id="taskType" style="width: 100%; height: 400px;"></div>
            </el-card>
            <el-card class="bar-chart">
                <h2>任务达成</h2>
                <div id="taskAchieve" style="width: 100%; height: 400px"></div>
            </el-card>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import { allFinishTask } from '@/api/task'
import { timeSub } from '@/utils/common';
import { getUserListWithAssistants } from '@/api/user'
export default {
    name: 'userStatistics',
    data() {
        return {
            // 显示的数据
            showList: [],
            // 筛选的数据
            filterList: [],
            // 查询出来的数据
            allTaskList: [],
            pageInfo: {
                page: 1,
                pageSize: 8
            },
            total: 0,
            //筛选条件
            start_stop_time: null,
            timeOptions: {
                shortcuts: [{
                    text: '最近一月',
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: '最近三个月',
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: '最近半年',
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 180);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: '最近一年',
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 365);
                        picker.$emit('pick', [start, end]);
                    }
                }]
            },
            //当前查看的类型
            curType: null,
            //完成的情况
            finishType: null,
            //统计信息
            statisticsObj: {
                executionDays: 0,
                delayDays: 0,
                //记录延误了多少件任务
                delayTask: 0,
                sumTask: 0,
                taskAchievingRate: 0,
                avgAchievingRate: 0,
            },
            //负责人的级联选择器
            directorOptions: [
                {
                    value: 0,
                    label: '机构',
                    children: []
                },
                {
                    value: 1,
                    label: '电控',
                    children: []
                },
                {
                    value: 2,
                    label: 'IE',
                    children: []
                }
            ],
            userMap: new Map(),
            curUser: null,
            curIndex: 0,
            curGroup: 0,
            barInfo: {
                'months': [],
                'finishCount': [],
                'finishDaysCount': [],
                'taskAchieveRate': [],
                'timeAchieveRate': []
            },
            pieChart: null,
            barChart: null,
        }
    },
    created() {
        var pageSize = +localStorage.getItem("pim_user_statistics_pageSize")
        this.pageInfo.pageSize = pageSize === 0 ? 8 : pageSize
    },
    async mounted() {
        await this.getAllUser()
        this.curUser = this.directorOptions[0].children[0].value
        this.barChart = this.$echarts.init(document.getElementById('taskAchieve'))
        this.pieChart = this.$echarts.init(document.getElementById('taskType'))
        await this.getFinishedTaskList()

    },
    //缓存界面路由导航进入之前
    beforeRouteEnter(to, from, next) {
        next((vm) => {
            if ('curUser' in to.query) {
                vm.curUser = to.query.curUser
                vm.getFinishedTaskList()
            }
        })
    },
    methods: {
        async getFinishedTaskList() {

            const res = await allFinishTask(this.curUser)
            if (res.code === 200) {
                this.allTaskList = res.data
                this.total = this.allTaskList.length
                this.allTaskList.forEach(s => {
                    s.executionDays = timeSub(s.startTime, s.finishTime)

                    s.achievingRate = +((s.planDays + +s.unforcedDays) * 100 / s.executionDays).toFixed()
                    s.isDelay = s.achievingRate < 100
                })
                // 保持筛选状态
                this.filter()
            } else {
                this.$message.error(res.msg)
            }
        },
        handleSizeChange(value) {
            localStorage.setItem("pim_user_statistics_pageSize", value)
            this.pageInfo.pageSize = value
            this.pageInfo.page = 1
            this.showList = this.filterList.slice((this.pageInfo.page - 1) * this.pageInfo.pageSize, this.pageInfo.page * this.pageInfo.pageSize)
        },
        handleCurrentChange(value) {
            this.pageInfo.page = value
            this.showList = this.filterList.slice((this.pageInfo.page - 1) * this.pageInfo.pageSize, this.pageInfo.page * this.pageInfo.pageSize)
        },
        handlesortChange(column) {
            if (column.order === 'ascending')
                column.order = 1
            else if (column.order === 'descending')
                column.order = -1
            else {
                column.order = -1
                column.prop = 'finishTime'
            }
            this.filterList.sort((a, b) => {
                if (a[column.prop] < b[column.prop])
                    return -1 * column.order
                else if (a[column.prop] > b[column.prop])
                    return 1 * column.order
                else return 0
            })
            this.showList = this.filterList.slice((this.pageInfo.page - 1) * this.pageInfo.pageSize, this.pageInfo.page * this.pageInfo.pageSize)
        },
        filter() {
            this.filterList = this.allTaskList
            //日期筛选
            if (this.start_stop_time !== null) {
                const start = this.start_stop_time[0]
                const end = this.start_stop_time[1]
                this.filterList = this.filterList.filter(item => item.finishTime >= start && item.finishTime <= end)
            }

            //任务类型筛选
            if (this.curType !== null && this.curType !== '') {
                if (this.curType === 0)
                    this.filterList = this.filterList.filter(i => i.caseSubId)
                else
                    this.filterList = this.filterList.filter(i => i.type === this.curType)
            }

            //完成情况筛选
            if (this.finishType !== null && this.finishType !== '') {
                this.filterList = this.filterList.filter(i => +i.isDelay === this.finishType)
            }

            // 更新图表信息
            this.initPie()
            this.initBar()

            // 重置统计信息
            this.generateStatistics(this.filterList)
            this.pageInfo.page = 1
            this.showList = this.filterList.slice((this.pageInfo.page - 1) * this.pageInfo.pageSize, this.pageInfo.page * this.pageInfo.pageSize)
            this.total = this.filterList.length
        },
        // 生成统计信息
        generateStatistics(array) {
            // 初始化统计信息，否则会累加
            this.statisticsObj.executionDays = 0
            this.statisticsObj.delayDays = 0
            this.statisticsObj.delayTask = 0
            array.forEach(s => {
                //累加执行时长
                this.statisticsObj.executionDays += s.executionDays
                if (s.isDelay) {
                    //累加延误时长
                    this.statisticsObj.delayDays += s.executionDays - (s.planDays + +s.unforcedDays)
                    this.statisticsObj.delayTask++
                }
            })

            //计算其他统计信息
            this.statisticsObj.sumTask = array.length
            this.statisticsObj.taskAchievingRate = this.statisticsObj.sumTask === 0 ? 0 : (this.statisticsObj.sumTask - this.statisticsObj.delayTask) * 100 / this.statisticsObj.sumTask
            this.statisticsObj.avgAchievingRate = this.statisticsObj.sumTask === 0 ? 0 : (this.statisticsObj.executionDays - this.statisticsObj.delayDays) * 100 / this.statisticsObj.executionDays
        },
        openCharts() {
            this.$router.push({
                name: '图表统计',
                query: {
                    allTaskList: this.filterList,
                    start_stop_time: this.start_stop_time
                }
            })
        },
        async getAllUser() {
            //获取所有科员信息
            var { data: res } = await getUserListWithAssistants()
            for (var i = 0; i < res.length; i++) {
                this.directorOptions[res[i].status].children.push({ value: res[i].id, label: res[i].name })
            }
            // 哈希表存储索引信息
            for (var i = 0; i < this.directorOptions.length; i++) {
                for (var j = 0; j < this.directorOptions[i].children.length; j++) {
                    this.userMap.set(this.directorOptions[i].children[j].value, [i, j])
                }
            }
        },
        //选中科员变化回调参数
        handleUserChange() {
            const idxArray = this.userMap.get(this.curUser)
            this.curGroup = idxArray[0]
            this.curIndex = idxArray[1]
            this.getFinishedTaskList()
        },
        //修改当前科员
        changeUser(value) {
            this.curIndex += value
            if (this.curIndex >= this.directorOptions[this.curGroup].children.length) {
                if (this.curGroup == this.directorOptions.length - 1)
                    this.curGroup = 0
                else
                    this.curGroup++
                this.curIndex = 0
            }
            if (this.curIndex < 0) {
                if (this.curGroup == 0)
                    this.curGroup = this.directorOptions.length - 1
                else
                    this.curGroup--
                this.curIndex = this.directorOptions[this.curGroup].children.length - 1
            }
            this.curUser = this.directorOptions[this.curGroup].children[this.curIndex].value

            this.getFinishedTaskList()
        },
        // 初始化饼状图
        initPie() {
            var res = [{ name: '专案类', value: 0 }, { name: '临时事务', value: 0 }, { name: '技术研究', value: 0 }]
            this.allTaskList.forEach(s => {
                if (s.caseSubId) {
                    res[0].value++
                } else if (s.type === 1)
                    res[1].value++
                else if (s.type === 2)
                    res[2].value++
            })
            this.pieChart.setOption({
                legend: {
                    orient: 'vertical',
                    left: 0,
                    top: 'bottom'
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '<h4>{b}:{c}</h4><br><h4>比例:{d}%<h4>'
                },
                series: [
                    {
                        type: 'pie',
                        stillShowZeroSum: false,
                        data: res,
                        radius: '90%',
                        itemStyle: {
                            color: function (params) {
                                if (params.data.name === "专案类")
                                    return '#67c23a'
                                else if (params.data.name === "临时事务")
                                    return '#e6a23c'
                                else if (params.data.name === "技术研究")
                                    return '#409eff'
                            }
                        },
                    },

                ]
            })
        },
        //初始化柱状图
        initBar() {
            this.handleBarInfo()
            var names = Object.keys(this.barInfo)
            names = names.filter(item => item !== 'months').map((item) => {
                if (item === 'finishCount')
                    item = '完成任务（件）'
                else if (item === 'finishDaysCount')
                    item = '完成任务时长（天）'
                else if (item === 'taskAchieveRate')
                    item = '任务达成率'
                else if (item === 'timeAchieveRate')
                    item = '时长达成率'
                return item
            })
            this.barChart.setOption({
                legend: {
                    orient: 'vertical',
                    data: names,
                    top: 'top',
                    right: 0
                },
                grid: {
                    top: '6%',       //柱状图距离父容器div顶端的距离
                    left: '2%',      //柱状图距离父容器div左端的距离
                    right: '15%',    //柱状图距离父容器div右端的距离
                    bottom: '0%',    //柱状图距离父容器div底端的距离
                    containLabel: true  //grid 区域是否包含坐标轴的刻度标签
                },
                xAxis: {
                    data: this.barInfo.months
                },
                yAxis: [
                    {
                        type: "value",
                        nameTextStyle: {
                            padding: [0, 50, -50, 200]
                        },
                        min: 0,
                        max: this.calMax(this.barInfo.finishDaysCount),
                        splitNumber: 6,
                        interval: ((this.calMax(this.barInfo.finishDaysCount) - 0) / 6).toFixed(),
                    },
                    {
                        type: "value",
                        nameTextStyle: {
                            padding: [0, 50, -50, 200]
                        },
                        min: 0,
                        max: this.calMax(this.barInfo.timeAchieveRate),
                        splitNumber: 6,
                        interval: ((this.calMax(this.barInfo.timeAchieveRate) - 0) / 6).toFixed(),
                        axisLabel: {
                            formatter: function (v) {
                                return v.toFixed(2) + '%'; //0表示小数为0位，1表示1位小数，2表示2位小数
                            }
                        }
                    }],
                tooltip: {
                    trigger: 'axis',
                    formatter: function (params) {
                        var result = params[0].axisValue + '<br/>';
                        params.forEach(function (item) {
                            if (item.seriesName.includes('率'))
                                result += item.marker + item.seriesName + ': ' + item.value + '%<br/>';
                            else
                                result += item.marker + item.seriesName + ': ' + item.value + '<br/>';
                        });
                        return result;
                    }
                },
                series: [
                    {
                        name: names[0],
                        type: 'bar',
                        data: this.barInfo.finishCount,
                        label: {
                            show: true, //开启显示
                            position: 'top', //在上方显示
                            fontSize: 20,
                        },
                    },
                    {
                        name: names[1],
                        type: 'bar',
                        data: this.barInfo.finishDaysCount,
                        label: {
                            show: true, //开启显示
                            position: 'top', //在上方显示
                            fontSize: 20,
                        },
                    },
                    {
                        name: names[2],
                        type: 'line',
                        data: this.barInfo.taskAchieveRate,
                        yAxisIndex: 1,
                        label: {
                            show: true, //开启显示
                            position: 'top', //在上方显示,
                            fontSize: 20,
                            formatter: '{c}%'
                        },
                    },
                    {
                        name: names[3],
                        type: 'line',
                        data: this.barInfo.timeAchieveRate,
                        yAxisIndex: 1,
                        label: {
                            show: true, //开启显示
                            position: 'top', //在上方显示
                            fontSize: 20,
                            formatter: '{c}%'
                        },
                    },
                ]
            })

        },
        //加工信息，获取柱状图所需的数据
        handleBarInfo() {
            // 初始化数组
            this.barInfo = {
                'months': [],
                'finishCount': [],
                'finishDaysCount': [],
                'taskAchieveRate': [],
                'timeAchieveRate': []
            }

            // 如果数据为空，直接返回
            if (this.filterList.length === 0) {
                return
            }

            var minStartTime = this.filterList.reduce((x, y) => x.finishTime < y.finishTime ? x : y)
            var maxStartTime = this.filterList.reduce((x, y) => x.finishTime > y.finishTime ? x : y)
            minStartTime = minStartTime.finishTime
            minStartTime = minStartTime.split("-").slice(0, 2)

            maxStartTime = maxStartTime.finishTime
            maxStartTime = maxStartTime.split("-").slice(0, 2)

            var startYear = +minStartTime[0]
            var startMonth = +minStartTime[1]

            var endYear = +maxStartTime[0]
            var endMonth = +maxStartTime[1]

            //循环条件
            while (startYear < endYear || (startYear === endYear && startMonth <= endMonth)) {
                var s_month = startYear + "-" + (startMonth < 10 ? '0' + startMonth++ : startMonth++)
                if (startMonth > 12) {
                    startMonth -= 12
                    startYear++
                }
                var e_month = startYear + "-" + (startMonth < 10 ? '0' + startMonth : startMonth)
                var finishCount = 0
                var finishDaysCount = 0
                var onTimeFinishCount = 0
                var planDaysCount = 0
                this.allTaskList.forEach(s => {
                    if (s.finishTime >= s_month && s.finishTime < e_month) {
                        finishCount++
                        finishDaysCount += s.executionDays
                        planDaysCount += s.planDays + s.unforcedDays
                        if (s.executionDays <= (s.planDays + s.unforcedDays))
                            onTimeFinishCount++
                    }
                })
                //插入数据
                this.barInfo.months.push(s_month)
                this.barInfo.finishCount.push(finishCount)
                this.barInfo.finishDaysCount.push(finishDaysCount)
                this.barInfo.taskAchieveRate.push(finishCount === 0 ? 0 : (onTimeFinishCount * 100.0 / finishCount).toFixed())
                this.barInfo.timeAchieveRate.push(finishDaysCount === 0 ? 0 : (planDaysCount * 100.0 / finishDaysCount).toFixed())
            }
        },
        // 获取最大值方法
        calMax(arr) {
            var max = Math.max.apply(null, arr); // 获取最大值方法
            var maxint = Math.ceil(max / 5); // 向上以5的倍数取整
            var maxval = maxint * 5 + 5; // 最终设置的最大值
            return maxval; // 输出最大值
        },
        // 获取最小值方法
        calMin(arr) {
            var min = Math.min.apply(null, arr); // 获取最小值方法
            var minint = Math.floor(min / 1); // 向下以1的倍数取整
            var minval = minint * 1 - 5; // 最终设置的最小值
            return minval; // 输出最小值
        }
    }
}
</script>

<style lang="less" scoped>
.charts-area {
    width: 100%;
    display: flex;

    .el-card,
    .pie-charts {
        width: 30%;
        margin-right: 5px;
    }

    .bar-chart {
        width: 70%;
    }
}

.el-row {
    margin-bottom: 10px;
}

.statistics_container {
    margin-top: 30px;
}
</style>