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
                <el-col :span="2" v-if="user.type === 0">
                    <el-button type="warning" @click="$router.push('/exception')">异常专案讨论</el-button>
                </el-col>
                <el-col :span="1" :offset="user.type === 0 ? 17 : 19">
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
            <el-table :data="userInfo">
                <el-table-column label="进度">
                    <template slot-scope="scope">
                        <el-progress :stroke-width="24" :percentage="scope.row.percentage"
                            :status="'leftDelay' in scope.row ? scope.row.leftDelay >= 0 ? 'warning' : 'exception' : 'success'"></el-progress>
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
                <el-table-column prop="planDays" label="计划时间"></el-table-column>
                <el-table-column prop="executionDays" label="执行时间"></el-table-column>
                <el-table-column prop="unforcedDays" label="外因延期"></el-table-column>
                <el-table-column prop="applyDelay" label="人为延期"></el-table-column>
                <el-table-column label="操作">
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
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <el-card style="margin-top: 5px;" v-if="exceptionList.length > 0">
            <h2>中止专案</h2>
            <!-- 未开始的异常专案 -->
            <el-table :data="exceptionList" stripe border style="width: 100%">
                <el-table-column prop="caseName" label="专案"></el-table-column>
                <el-table-column prop="subName" label="阶段"></el-table-column>
                <el-table-column prop="level" label="难度"></el-table-column>
                <el-table-column prop="planDays" label="计划时间"></el-table-column>
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

        <el-card v-if="commitVisible">
            <el-row>
                <el-col :span="23" v-if="user.status === 2 || user.type === 1">
                    <el-row>
                        <el-col :span="21">
                            <el-input v-model="commitForm.newContent" placeholder="请输入最新备注"></el-input>
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
                    <!-- <div v-for="o in commitForm.content" :key="o" class="text item">
                        {{ o }}
                    </div> -->
                    <ul>
                        <li v-for="(o, index) in commitForm.content" :key="o.id" class="text item">
                            <h3 :style="{ color: index < 2 ? 'red' : 'black' }">{{ o.content }}</h3>
                        </li>
                    </ul>
                    <label v-if="commitForm.content.length === 0">暂无备注</label>
                </el-card>


            </div>
        </el-card>
    </div>
</template>

<script>
import { timeSub, formatDate } from '@/utils/common'
import { taskList, recentTaskList, recentHalfYear,getExceptionList } from '@/api/task'
import { getUserList } from '@/api/user'
import { getById, saveCommit, deleteCommit } from '@/api/caseSubCommit'
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
                }
            ],
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
        setTimeout(() => {
            this.initPie()
            this.initBar()
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
            console.log(this.userInfo)

            for (var i = 0; i < this.userInfo.length; i++) {
                this.userInfo[i].executionDays = timeSub(this.userInfo[i].startTime, new Date())
                var presetTime = new Date(this.userInfo[i].startTime)
                presetTime = presetTime.setDate(presetTime.getDate() + this.userInfo[i].planDays + this.userInfo[i].unforcedDays - 1)
                this.userInfo[i].presetTime = presetTime
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
                }
                for (var i = 0; i < this.userInfo.length; i++) {
                    if (this.userInfo[i].caseSubId !== null) {
                        this.openCommentView(this.userInfo[i])
                        break
                    }
                }
            }
        },

        percentageText(row) {
            if ('leftDelay' in row) {
                if (row.leftDelay >= 0) {
                    return `延期剩余${row.leftDelay}天`
                }
                return `已延误${row.applyDelay - row.leftDelay}天`
            }
            //算上今天，剩余天数+1
            return `执行剩余${row.planDays + +row.unforcedDays + 1 - row.executionDays}天`
        },

        //获取所有科员信息
        async getAllUser() {
            //获取所有科员信息
            var { data: res } = await getUserList()
            console.log(res)
            for (var i = 0; i < res.length; i++) {
                if (res[i].status >= 2)
                    continue
                this.directorOptions[res[i].status].children.push({ value: res[i].id, label: res[i].name })
            }
        },
        handleUserChange() {
            var flag = false
            for (var i = 0; i < this.directorOptions.length; i++) {
                for (var j = 0; j < this.directorOptions[i].children.length; j++) {
                    if (this.directorOptions[i].children[j].value === this.curUser) {
                        this.curGroup = i
                        this.curIndex = j
                        flag = true
                        break
                    }
                }
                if (flag)
                    break
            }
            this.updateView()
        },
        //更新界面
        updateView() {
            this.getTaskByUserId()
            this.getExceptionList()
            this.initPie()
            this.initBar()
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
        async submitCommitForm() {
            //判断备注信息是否为空或者内容太少
            if (this.commitForm.newContent === null || this.commitForm.newContent.length < 10) {
                this.$message({
                    message: '备注内容不能少于10个字',
                    type: 'warning'
                })
                return
            }
            const commmitObj = {}
            commmitObj.caseSubId = this.commitForm.caseSubId
            commmitObj.content = this.commitForm.newContent
            commmitObj.createUser = this.user.id
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
                path: '/case2sub',
                query: {
                    caseId: row.caseId,
                    caseName: 'description' in row?row.description.split("→")[0]:row.caseName
                }
            })
        },
        //修改当前科员
        changeUser(value) {
            this.curIndex += value
            if (this.curIndex >= this.directorOptions[this.curGroup].children.length) {
                this.curGroup = 1 - this.curGroup
                this.curIndex = 0
            }
            if (this.curIndex < 0) {
                this.curGroup = 1 - this.curGroup
                this.curIndex = this.directorOptions[this.curGroup].children.length - 1
            }
            this.curUser = this.directorOptions[this.curGroup].children[this.curIndex].value
            this.updateView()
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

.commit_area {
    display: flex;
}
</style>
