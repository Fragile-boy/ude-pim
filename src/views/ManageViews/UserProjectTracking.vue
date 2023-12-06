<template>
    <div><!-- 面包屑导航区域 -->
        <div>
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>部员管理</el-breadcrumb-item>
                <el-breadcrumb-item>部员专案追踪</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <el-card>
            <el-row>
                <el-col :span="2">
                    <el-button type="warning" @click="navigateToUserProjectManagerPage()">近况追踪</el-button>
                </el-col>
                <el-col :span="1" :offset="17">
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
            <br>
            <!-- 执行任务的详情 -->
            <el-table :data="userInfo" @cell-dblclick="handleDoubleClick">
                <el-table-column label="进度">
                    <template slot-scope="scope">
                        <el-progress v-if="!scope.row.pausing" :stroke-width="24" :percentage="scope.row.percentage"
                            :status="scope.row.finishedOwnWork ? 'primary' : 'leftDelay' in scope.row ? scope.row.leftDelay >= 0 ? 'warning' : 'exception' : 'success'">
                        </el-progress>
                        <el-progress v-else :stroke-width="24" :percentage="100" color="#909399" :show-text="false">
                        </el-progress>
                    </template>
                </el-table-column>
                <el-table-column prop="comment" label="备注"></el-table-column>
                <el-table-column label="类型">
                    <template slot-scope="scope">
                        <el-tag effect="dark" type="success" v-if="scope.row.type === 0">专案类</el-tag>
                        <el-tag effect="dark" v-else-if="scope.row.type === 2">技术研究</el-tag>
                        <el-tag effect="dark" type="warning" v-else-if="scope.row.type === 1">临时事务</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="description" label="描述" width="260"></el-table-column>
                <el-table-column prop="startTime" label="开始时间"></el-table-column>
                <el-table-column prop="presetTime" label="预计完成"></el-table-column>
                <el-table-column prop="pauseStart" label="暂停时间"></el-table-column>
                <el-table-column prop="planDays" label="计划时间"></el-table-column>
                <el-table-column prop="executionDays" label="执行时间"></el-table-column>
                <el-table-column prop="unforcedDays" label="外因延期"></el-table-column>
                <el-table-column prop="applyDelay" label="人为延期"></el-table-column>
                <el-table-column label="操作" width="180">
                    <template slot-scope="scope">
                        <!-- 这里后面留着查看信息 -->
                        <el-tooltip class="item" effect="dark" content="显示备注" placement="top">
                            <el-button icon="el-icon-info" type="primary" size="mini" round
                                @click="openCommentView(scope.row)" v-if="scope.row.caseSubId">
                            </el-button>
                        </el-tooltip>
                        <el-tooltip class="item" effect="dark" content="专案详情" placement="top">
                            <el-button icon="el-icon-s-promotion" type="primary" size="mini" round
                                @click="openCaseDetail(scope.row)" v-if="scope.row.caseSubId">
                            </el-button>
                        </el-tooltip>
                        <el-tooltip class="item" effect="dark" content="暂停" placement="top" v-if="user.type === 1">
                            <el-button icon="el-icon-video-pause" type="info" size="mini" round
                                @click="openPause(scope.row)" v-if="!scope.row.pausing">
                            </el-button>
                        </el-tooltip>
                        <el-tooltip class="item" effect="dark" content="重启" placement="top" v-if="user.type === 1">
                            <el-button icon="el-icon-video-play" type="success" size="mini" round
                                @click="finishPause(scope.row.pauseId)" v-if="scope.row.pausing">
                            </el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <el-card style="margin-top: 5px;" v-if="exceptionList.length > 0">
            <h2>中断专案</h2>
            <!-- 未开始的异常专案 -->
            <el-table :data="exceptionList" stripe border style="width: 100%">
                <el-table-column prop="caseName" label="专案"></el-table-column>
                <el-table-column prop="subName" label="阶段"></el-table-column>
                <el-table-column prop="level" label="难度"></el-table-column>
                <el-table-column prop="planDays" label="计划时间"></el-table-column>
                <el-table-column prop="lastFinishTime" label="上阶段完结时间"></el-table-column>
                <el-table-column prop="interruptDays" label="中断时间(天)"></el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-tooltip class="item" effect="dark" content="专案详情" placement="top">
                            <el-button size="mini" type="primary" icon="el-icon-s-promotion" round
                                @click="openCaseDetail(scope.row)"></el-button>
                        </el-tooltip>

                    </template>
                </el-table-column>

            </el-table>
        </el-card>

        <el-card v-if="commitVisible">
            <el-row>
                <el-col :span="23" v-if="user.status === 2 || user.type === 1">
                    <el-row>
                        <el-col :span="21">
                            <el-input v-model="commitForm.newContent" placeholder="请输入最新备注"
                                @keyup.enter.native="submitCommitForm"></el-input>
                        </el-col>
                        <el-col :span="1" :offset="1">
                            <el-tooltip class="item" effect="dark" content="提交备注" placement="top">
                                <el-button size="medium" type="primary" icon="el-icon-finished" round
                                    @click="submitCommitForm"></el-button>
                            </el-tooltip>
                        </el-col>
                        <el-col :span="1">
                            <el-tooltip class="item" effect="dark" content="撤回最新" placement="top">
                                <el-button size="medium" type="danger" icon="el-icon-toilet-paper" round
                                    @click="deleteCommit"></el-button>
                            </el-tooltip>
                        </el-col>
                    </el-row>
                </el-col>

                <el-col :span="1" :offset="user.status || user.type === 1 === 2 ? 0 : 23">
                    <el-button type="primary" @click="commitVisible = false" icon="el-icon-back" round
                        style="margin-bottom: 5px;"></el-button>
                </el-col>
            </el-row>
            <div class="commit_area">
                <el-card style="width: 40%; margin-right: 20px;">
                    <h2>专案：{{ commitForm.caseName }}</h2>
                    <br>
                    <br>
                    <h3>阶段：{{ commitForm.subName }}</h3>
                </el-card>

                <el-card class="box-card" style="width: 55%;">
                    <h2>备注信息</h2>
                    <ul v-show="!showAllCommit">
                        <li v-for="(o, index) in commitForm.content.slice(0, 4)" :key="o.id" class="text item">
                            <h3 :style="{ color: index < 2 ? 'red' : 'black' }">{{ o.content }}</h3>
                        </li>
                    </ul>
                    <ul v-show="showAllCommit">
                        <li v-for="(o, index) in commitForm.content" :key="o.id" class="text item">
                            <h3 :style="{ color: index < 2 ? 'red' : 'black' }">{{ o.content }}</h3>
                        </li>
                    </ul>
                    <label v-if="commitForm.content.length === 0">暂无备注</label>
                    <el-row>
                        <el-col :span="2" :offset="10">
                            <a class="viewItem" @click="showAll" v-if="!showAllCommit">展开全部</a>
                            <a class="viewItem" @click="showAll" v-else>收起</a>
                        </el-col>
                    </el-row>
                </el-card>


            </div>
        </el-card>

        <el-card class="gantt-chart">
            <div id="ganttChart" style="width: 100%; height: 500px;"></div>
        </el-card>

        <div class="charts-area" v-show="!commitVisible">

            <el-card class="pie-chart">
                <h2>任务类别</h2><span>(近半年)</span>
                <div id="taskType" style="width: 100%; height: 300px;"></div>
            </el-card>
            <el-card class="bar-chart">
                <h2>任务达成</h2><span>(近半年)</span>
                <div id="taskAchieve" style="width: 100%; height: 300px"></div>
            </el-card>
        </div>

        <el-drawer direction="ltr" :visible.sync="delayDrawer" :with-header="false" size="50%">
            <el-table :data="delayList">
                <el-table-column prop="applyReason" label="延期原因" width="550">
                </el-table-column>
                <el-table-column prop="applyDays" label="延期天数">
                </el-table-column>
                <el-table-column prop="delayType" label="延期类型">
                </el-table-column>
            </el-table>
        </el-drawer>

        <el-dialog title="暂停描述" :visible.sync="pauseVisible" width="30%">
            <el-input v-model="pauseObj.description" placeholder="描述暂停原因，后续将作为外界因素延期原因，请认真填写"></el-input>
            <span slot="footer" class="dialog-footer">
                <el-button @click="pauseVisible = false">取 消</el-button>
                <el-button type="primary" @click="startPause()">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script>
import { timeSub, formatDate, timeAdd } from '@/utils/common'
import { taskList, recentTaskList, recentHalfYear, getExceptionList } from '@/api/task'
import { getUserListWithAssistants } from '@/api/user'
import { getById, saveCommit, deleteCommit } from '@/api/caseSubCommit'
import { getDelayById } from '@/api/caseDelayApply'
import { startPause,finishPause } from '@/api/pause'
import { mapState } from 'vuex'

export default {
    name: 'caseTracking',
    data() {
        return {
            userInfo: [],
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
            curGroup: null,
            curIndex: null,
            typePie: null,
            barInfo: null,
            // 显示备注框
            commitVisible: false,
            commitForm: {
                content: [],
                newContent: this.getToday()
            },
            //当前用户所有未开始的任务
            exceptionList: [],
            // 是否显示所有备注
            showAllCommit: false,
            // 延期列表
            delayList: [],
            // 抽屉
            delayDrawer: false,
            // 暂停界面
            pauseVisible: false,
            // 暂停信息
            pauseObj: {
                description: '',
                taskId: null,
                caseSubId: null,
                target: ''
            }
        }
    },
    async mounted() {
        await this.getAllUser()
        this.curUser = this.directorOptions[0].children[0].value
        await this.getExceptionList()
        this.curGroup = 0,
            this.curIndex = 0,
            this.getTaskByUserId()
        //初始化块元素
        this.typePie = this.$echarts.init(document.getElementById('taskType'))
        this.barInfo = this.$echarts.init(document.getElementById('taskAchieve'))
        this.gantt = this.$echarts.init(document.getElementById('ganttChart'))
        setTimeout(() => {
            this.initPie()
            this.initBar()
            this.initGantt()
        }, 100)
    },
    computed: {
        ...mapState(['user'])
    },
    methods: {
        // 获取当前用户的所有未开始的任务
        async getExceptionList() {
            const res = await getExceptionList(this.curUser)
            if (res.code === 200) {
                this.exceptionList = res.data
                this.exceptionList.forEach(item => {
                    item.interruptDays = timeSub(item.lastFinishTime, new Date()) - 1
                    item.lastFinishTime = formatDate(item.lastFinishTime)
                })
            } else {
                this.$message.error(res.msg)
            }
        },
        //获取当天日期
        getToday() {
            var today = new Date();
            var month = today.getMonth() + 1;
            var day = today.getDate();
            return month + '/' + day + "："
        },
        async getTaskByUserId() {
            const res = await taskList(this.curUser)
            this.userInfo = res.data
            // console.log(this.userInfo)

            for (var i = 0; i < this.userInfo.length; i++) {
                this.userInfo[i].executionDays = timeSub(this.userInfo[i].startTime, new Date())
                this.userInfo[i].executionDays -= +this.userInfo[i].unforcedDays
                var presetTime = new Date(this.userInfo[i].startTime)
                presetTime = presetTime.setDate(presetTime.getDate() + this.userInfo[i].planDays + this.userInfo[i].unforcedDays - 1)
                this.userInfo[i].presetTime = presetTime
                // 是否暂停
                this.userInfo[i].pauseStart = this.userInfo[i].pauseStart ? formatDate(this.userInfo[i].pauseStart) : null
                //分为已延误和未延误
                var today = new Date()
                today.setHours(0, 0, 0, 0)
                //还未截止
                if (today <= this.userInfo[i].presetTime) {
                    //已经执行了多少天
                    var costDay = timeSub(this.userInfo[i].startTime, today)
                    // 已经执行了多少天/总共多少天
                    this.userInfo[i].percentage = costDay * 1.0 / (this.userInfo[i].planDays + +this.userInfo[i].unforcedDays) * 100
                } else {
                    //已经延期了多少天(这里不能算预计时间当天，所以必须要-1)
                    var delayDay = timeSub(this.userInfo[i].presetTime, today) - 1
                    //计算延误期限
                    this.userInfo[i].leftDelay = this.userInfo[i].applyDelay - delayDay

                    //判断是否在延期期限内
                    if (this.userInfo[i].leftDelay >= 0) {
                        this.userInfo[i].percentage = (delayDay / this.userInfo[i].applyDelay) * 100
                    } else
                        this.userInfo[i].percentage = (timeSub(this.userInfo[i].startTime, today) / this.userInfo[i].planDays) * 100
                }
                this.userInfo[i].presetTime = formatDate(this.userInfo[i].presetTime)
                this.userInfo[i].comment = this.percentageText(this.userInfo[i])
                if (this.userInfo[i].percentage > 100)
                    this.userInfo[i].percentage = 100
            }
            if (this.commitVisible) {
                if (this.userInfo.length === 0) {
                    this.commitForm.content = ''
                    this.commitForm.caseName = '暂无数据'
                    this.commitForm.subName = '暂无数据'
                    return
                }
                var caseSubCount = 0
                for (var i = 0; i < this.userInfo.length; i++) {
                    if (this.userInfo[i].caseSubId !== null) {
                        caseSubCount++
                        this.openCommentView(this.userInfo[i])
                        break
                    }
                }
                // 没有专案子阶段，说明全是任务
                if (caseSubCount === 0) {
                    this.commitForm.content = []
                    this.commitForm.caseName = '暂无数据'
                    this.commitForm.subName = '暂无数据'
                }
            }
        },

        percentageText(row) {
            if (row.pausing) {
                return "暂停中"
            }
            if ('leftDelay' in row) {
                if (row.leftDelay >= 0) {
                    return `延期剩余${row.leftDelay}天`
                }
                return `已延误${row.applyDelay - row.leftDelay}天`
            }
            //算上今天，剩余天数+1
            return `执行剩余${row.planDays + 1 - row.executionDays}天`
        },

        //获取所有科员信息
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
        handleUserChange() {
            const idxArray = this.userMap.get(this.curUser)
            this.curGroup = idxArray[0]
            this.curIndex = idxArray[1]
            this.updateView()
        },
        //更新界面
        async updateView() {
            await this.getTaskByUserId()
            this.getExceptionList()
            this.initPie()
            this.initBar()
            this.initGantt()
        },

        //初始化饼状图
        async initPie() {
            const res = await recentTaskList(this.curUser)
            this.typePie.setOption({
                legend: {
                    orient: 'vertical',
                    right: 0,
                    top: 'top'
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '<h4>{b}:{c}</h4><br><h4>比例:{d}%<h4>'
                },
                series: [
                    {
                        type: 'pie',
                        stillShowZeroSum: false,
                        data: res.data,
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
        async initBar() {
            const { data: res } = await recentHalfYear(this.curUser)
            var names = Object.keys(res)
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
            this.barInfo.setOption({
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
                    data: res.months
                },
                yAxis: [
                    {
                        type: "value",
                        nameTextStyle: {
                            padding: [0, 50, -50, 200]
                        },
                        min: 0,
                        max: this.calMax(res.finishDaysCount),
                        splitNumber: 6,
                        interval: ((this.calMax(res.finishDaysCount) - 0) / 6).toFixed(),
                    },
                    {
                        type: "value",
                        nameTextStyle: {
                            padding: [0, 50, -50, 200]
                        },
                        min: 0,
                        max: Math.max(this.calMax(res.timeAchieveRate), this.calMax(res.taskAchieveRate)),
                        splitNumber: 6,
                        interval: ((Math.max(this.calMax(res.timeAchieveRate), this.calMax(res.taskAchieveRate)) - 0) / 6).toFixed(),
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
                        data: res.finishCount,
                        label: {
                            show: true, //开启显示
                            position: 'top', //在上方显示
                        },
                    },
                    {
                        name: names[1],
                        type: 'bar',
                        data: res.finishDaysCount,
                    },
                    {
                        name: names[2],
                        type: 'line',
                        data: res.taskAchieveRate,
                        yAxisIndex: 1,
                    },
                    {
                        name: names[3],
                        type: 'line',
                        data: res.timeAchieveRate,
                        yAxisIndex: 1,
                    },
                ]
            })

        },
        // 初始化甘特图对象
        initGanttObj(obj, stack, start, color, zlevel, name) {
            obj.name = name
            obj.stack = stack
            obj.type = "bar";
            obj.label = {
                show: true,
                color: "#000",
                position: "right",
                fontSize: 15,
                formatter: function (params) {
                    var data = new Date(params.value)
                    if (zlevel === 1 || zlevel === 2)
                        return data.getMonth() + 1 + "-" + data.getDate()
                    return ""
                }
            }
            obj.zlevel = zlevel
            if (start) {
                obj.itemStyle = {
                    normal: {
                        color: "#fff"
                    }
                }
            } else {
                obj.itemStyle =
                {
                    normal: {
                        color: color,
                        borderColor: "#fff",
                        borderWidth: 2,
                    }
                }
            }
            obj.data = []
            return obj
        },
        // 初始化甘特图
        initGantt() {
            // 初始化y轴坐标
            var yAxis = [];
            for (let i = this.userInfo.length - 1; i >= 0; i--) {
                yAxis.push(this.userInfo[i].description)
            }
            var dataSeries = []
            // 计划时间
            var planTime_start_0 = {};
            var planTime_start_1 = {};
            var planTime_end = {};
            planTime_start_0 = this.initGanttObj(planTime_start_0, "bar0", true, "#6ED77E", 4, "开始时间")
            planTime_start_1 = this.initGanttObj(planTime_start_1, "bar1", true, "#6ED77E", 4, "开始时间")
            planTime_end = this.initGanttObj(planTime_end, "bar0", false, "#6ED77E", 3, "预计完成时间")

            // 外界因素延期
            var standardTime = {};
            standardTime = this.initGanttObj(standardTime, "bar0", false, "skyblue", 2, "目标完成时间")

            // 执行时间
            var execTime_end = {};
            execTime_end = this.initGanttObj(execTime_end, "bar1", false, "#E23D3D", 1, "当前时间")

            for (let i = this.userInfo.length - 1; i >= 0; i--) {
                planTime_start_0.data.push(new Date(this.userInfo[i].startTime))
                planTime_start_1.data.push(new Date(this.userInfo[i].startTime))
                planTime_end.data.push(new Date(timeAdd(this.userInfo[i].startTime, this.userInfo[i].planDays)))
                standardTime.data.push(new Date(timeAdd(this.userInfo[i].startTime, this.userInfo[i].planDays, this.userInfo[i].unforcedDays)))
                execTime_end.data.push(new Date())
            }


            dataSeries.push(planTime_start_0)
            dataSeries.push(planTime_start_1)
            dataSeries.push(planTime_end)
            dataSeries.push(standardTime)
            dataSeries.push(execTime_end)

            var option = {
                backgroundColor: "#fff",
                title: {
                    text: "执行甘特图",
                    padding: 20,
                    textStyle: {
                        fontSize: 17,
                        fontWeight: "bolder",
                        color: "#333"
                    },
                    subtextStyle: {
                        fontSize: 13,
                        fontWeight: "bolder"
                    }
                },
                legend: {
                    data: ['开始时间', '预计完成时间', '目标完成时间', '当前时间'],
                    align: "right",
                    right: 80,
                    top: 50
                },
                grid: {
                    containLabel: true,
                    show: false,
                    right: 130,
                    left: 40,
                    bottom: 40,
                    top: 90
                },
                xAxis: {
                    type: "time",
                    axisLabel: {
                        "show": true,
                        "interval": 0
                    }
                },
                yAxis: {
                    axisLabel: {
                        show: true,
                        interval: 0,
                    },
                    data: yAxis
                },
                tooltip: {
                    trigger: "axis",
                    formatter: function (params) {
                        var res = ''
                        var set = new Set()
                        res += params[0].axisValue + '<br/>';
                        for (var i = 0; i < params.length; i++) {
                            if (set.has(params[i].seriesName))
                                continue
                            set.add(params[i].seriesName)
                            res += '<div style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:' + params[i].color + ';"></div>' +
                                params[i].seriesName + '：' + formatDate(params[i].value) + '<br/>'
                        }
                        return res
                    }
                },
                series: dataSeries,
            }
            this.gantt.setOption(option);
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
        },
        //显示评论
        async openCommentView(row) {

            var names = row.description.split("→")
            this.commitForm.caseName = names[0]
            this.commitForm.subName = names[1]
            this.commitForm.caseSubId = row.caseSubId
            this.getAndShowCommit()
        },
        //获取并显示评论
        async getAndShowCommit() {
            // 获取专案子流程对应的所有备注
            var res = await getById(this.commitForm.caseSubId)
            res = res.data
            //备注数组必须清空，否则会叠加
            this.commitForm.content = []
            for (var i = 0; i < res.length; i++) {
                this.commitForm.content.push({ content: res[i].content, id: res[i].id })
            }
            this.commitVisible = true
        },
        // 提交备注信息
        async submitCommitForm(msg) {
            //判断备注信息是否为空或者内容太少
            if (this.commitForm.newContent === null || this.commitForm.newContent === '') {
                this.$message({
                    message: '备注内容不能为空',
                    type: 'warning'
                })
                return
            }
            const commmitObj = {}
            commmitObj.caseSubId = this.commitForm.caseSubId
            commmitObj.content = this.commitForm.newContent
            commmitObj.createUser = this.user.idw
            var res = await saveCommit(commmitObj)
            if (res.code === 200) {
                this.$message.success(res.data)
                this.initInput()
                await this.getAndShowCommit()
            } else {
                this.$message.error(res.msg)
            }
        },
        //重置输入框
        initInput() {
            this.commitForm.newContent = this.getToday()
        },
        //删除备注
        deleteCommit() {
            this.$confirm('此操作将删除最新评论, 操作不可逆，是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                const res = await deleteCommit(this.commitForm.content[0].id)
                if (res.code === 200) {
                    this.$message.success(res.data)
                    this.getAndShowCommit()
                } else
                    this.$message.error(res.msg)
            })
        },
        //打开专案详情
        openCaseDetail(row) {
            this.$router.push({
                name: '子流程详情',
                query: {
                    caseId: row.caseId,
                    caseName: 'description' in row ? row.description.split("→")[0] : row.caseName
                }
            })
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
            this.updateView()
        },
        showAll() {
            this.showAllCommit = !this.showAllCommit
        },
        // 跳转到专案统计界面
        navigateToUserProjectManagerPage() {
            this.$router.push({
                name: '部员专案统计',
                query: {
                    curUser: this.curUser
                }
            })
        },
        // 监听双击事件
        handleDoubleClick(row, column) {
            if (column.label === "描述") {
                // 子流程id不为空，跳转到详情页
                if (row.caseSubId !== null)
                    this.navigateToDetailPage(row)
                // 任务id不为空,显示任务描述
                if (row.taskId !== null)
                    this.showTaskDescription(row)
            }
            else if (column.label === "外因延期")
                this.showDelay(row, "外界因素延期")
            else if (column.label === "人为延期")
                this.showDelay(row, "人为因素延期")
        },
        // 双击跳转到详情页()
        navigateToDetailPage(row) {
            if (row.caseId !== null) {
                this.$router.push({
                    name: '子流程详情',
                    query: {
                        caseId: row.caseId,
                        caseName: row.description.split("→")[0]
                    }
                })
            }
        },
        // 显示不可抗力延期
        async showDelay(row, delayType) {
            var res = await getDelayById({ caseSubId: row.caseSubId, taskId: row.taskId, delayType: delayType })
            this.delayList = res.data
            this.delayDrawer = true
        },
        // 双击显示任务说明
        showTaskDescription(row) {
            this.commitForm.content = [{ content: row.description }]
        },
        // 打开暂停界面
        openPause(row) {
            this.pauseObj.taskId = row.taskId
            this.pauseObj.caseSubId = row.caseSubId
            this.pauseObj.target = row.description
            this.pauseVisible = true
        },
        // 开始暂停
        async startPause() {
            if (this.pauseObj.description === null || this.pauseObj.description === '') {
                this.$message.error("暂停原因不能为空")
                return
            }
            const res = await startPause(this.pauseObj)
            if (res.code === 200) {
                this.$message.success(res.data)
                this.pauseObj.description = ''
                this.pauseObj.taskId = null
                this.pauseObj.caseSubId = null
                this.pauseObj.target = null
                this.pauseVisible = false
            }
            this.getTaskByUserId()
        },
        // 停止暂停
        finishPause(pauseId) {
            this.$confirm('确定重启该任务吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                const res = await finishPause(pauseId)
                if (res.code === 200) {
                    this.$message.success(res.data)
                    this.getTaskByUserId()
                }
            })
        },
    }
}
</script>
pauseObjpauseObjpauseObj
<style lang="less" scoped>
.charts-area {
    width: 100%;
    display: flex;
    flex-wrap: wrap;

    .gantt-chart {
        width: 100%;
        margin-bottom: 5px;
    }

    .pie-chart {
        width: 29.5%;
        margin-right: 0.5%;
    }

    .bar-chart {
        width: 70%;
    }
}

.commit_area {
    display: flex;
}

.viewItem {
    color: #3DA3E2;
    text-decoration: none;
}

.viewItem:hover {
    color: #EB4056;
    text-decoration: underline;
}

.el-drawer .ltr {
    background-color: skyblue;
}
</style>
