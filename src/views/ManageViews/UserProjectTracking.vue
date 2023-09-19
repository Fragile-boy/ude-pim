<template>
    <div><!-- 面包屑导航区域 -->
        <div>
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>部员管理</el-breadcrumb-item>
                <el-breadcrumb-item>部员专案追踪</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <el-card>
            <!-- 申请区域 -->
            <el-row>
                <el-col :span="3" :offset="21">
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
                <el-table-column label="进度" width="260">
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
                <el-table-column prop="description" label="描述"></el-table-column>
                <el-table-column prop="startTime" label="开始时间"></el-table-column>
                <el-table-column prop="planDays" label="计划时间"></el-table-column>
                <el-table-column prop="executionDays" label="执行时间"></el-table-column>
                <el-table-column prop="unforcedDays" label="外因延期"></el-table-column>
                <el-table-column prop="applyDelay" label="人为延期"></el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <!-- 这里后面留着查看信息 -->
                        <el-button icon="el-icon-info" type="primary" size="mini" round @click="openCommentView(scope.row)"
                            v-if="scope.row.caseSubId"></el-button>
                        <el-tooltip class="item" effect="dark" content="专案详情" placement="right-start">
                            <el-button icon="el-icon-s-promotion" type="primary" size="mini" round
                                @click="openCaseDetail(scope.row)" v-if="scope.row.caseSubId">
                            </el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <br>
        <div class="charts-area">
            <el-card class="pie-chart">
                <h2>任务类别</h2><span>(近半年)</span>
                <div id="taskType" style="width: 100%; height: 300px;"></div>
            </el-card>
            <el-card class="bar-chart">
                <h2>任务达成</h2><span>(近半年)</span>
                <div id="taskAchieve" style="width: 100%; height: 300px"></div>
            </el-card>
        </div>

        <!-- 显示备注框 -->
        <el-dialog title="备注信息" :visible.sync="commitVisible" width="40%" @close="closeCommitDialog">
            <el-form ref="commitFormRef" :model="commitForm" label-width="100px">
                <!-- 子流程名称显示 -->
                <el-form-item label="专案名称">
                    <el-input v-model="commitForm.caseName" disabled></el-input>
                </el-form-item>
                <el-form-item label="流程名称">
                    <el-input v-model="commitForm.subName" disabled></el-input>
                </el-form-item>
                <!-- 备注显示区域 -->
                <el-form-item label="备注信息">
                    <el-card class="box-card">
                        <div v-for="o in commitForm.content" :key="o" class="text item">
                            {{ o }}
                        </div>
                        <label v-if="commitForm.content.length === 0">暂无备注</label>
                    </el-card>
                </el-form-item>
                <!-- 备注增加 现在的设计是，只有特定的人员去填写备注-->
                <el-form-item prop="newContent" label="增加备注" v-if="user.type === 1">
                    <el-input type="textarea" v-model="commitForm.newContent"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="submitCommitForm" v-if="user.type === 1">提交</el-button>
                <el-button @click="commitVisible = false">取 消</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { timeSub, formatDate } from '@/utils/common'
import { taskList, recentTaskList, recentHalfYear } from '@/api/task'
import { getUserList } from '@/api/user'
import { getById, saveCommit } from '@/api/caseSubCommit'
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
            typePie: null,
            barInfo: null,
            // 显示备注框
            commitVisible: false,
            commitForm: {
                content: [],
                newContent: null,
                chargeId: []
            },
        }
    },
    async mounted() {
        await this.getAllUser()
        this.curUser = this.directorOptions[0].children[0].value
        console.log(this.curUser)
        this.getTaskByUserId()
        //初始化块元素
        this.typePie = this.$echarts.init(document.getElementById('taskType'))
        this.barInfo = this.$echarts.init(document.getElementById('taskAchieve'))
        this.initPie()
        this.initBar()
    },
    computed: {
        ...mapState(['user'])
    },
    methods: {
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
                this.directorOptions[res[i].status].children.push({ value: res[i].id, label: res[i].name })
            }
        },
        handleUserChange() {
            this.getTaskByUserId()
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
            console.log(row)
            this.commitVisible = true
            var names = row.description.split("→")
            this.commitForm.caseName = names[0]
            this.commitForm.subName = names[1]
            this.commitForm.caseSubId = row.caseSubId
            // 获取专案子流程对应的所有备注
            var res = await getById(row.caseSubId)
            res = res.data
            //备注数组必须清空，否则会叠加
            this.commitForm.content = []
            for (var i = 0; i < res.length; i++) {
                this.commitForm.content.push(res[i].content)
            }
        },
        // 提交备注信息
        async submitCommitForm() {
            //判断备注信息是否为空或者内容太少
            this.$refs.commitFormRef.validate(async valid => {
                if (!valid) return;
                const commmitObj = {}
                commmitObj.caseSubId = this.commitForm.caseSubId
                commmitObj.content = this.commitForm.newContent
                commmitObj.createUser = this.user.id
                var res = await saveCommit(commmitObj)
                this.$message(res.data)
                //隐藏画面
                this.commitVisible = false
            })

        },
        closeCommitDialog() {
            //重置表单
            this.$refs.commitFormRef.resetFields()
        },
        //打开专案详情
        openCaseDetail(row){
            this.$router.push({
                name:'case-sub',
                query:{
                    caseId:row.caseId,
                    caseName:row.description.split("→")[0]
                }
            })
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
</style>
