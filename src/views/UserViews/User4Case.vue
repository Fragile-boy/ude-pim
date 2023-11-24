<template>
    <div><!-- 面包屑导航区域 -->
        <div>
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>个人中心</el-breadcrumb-item>
                <el-breadcrumb-item>执行任务</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <el-card>
            <!-- 申请区域 -->
            <el-row :gutter="20">
                <el-col :span="2" :offset="20">
                    <el-button type="success" icon="el-icon-plus" @click="initApplyCaseSub()">申请子流程</el-button>
                </el-col>

                <el-col :span="2">
                    <el-button type="primary" icon="el-icon-plus" @click="applyTaskVisible = true">申请任务</el-button>
                </el-col>
            </el-row>
            <h2>执行专案</h2>
            <!-- 执行任务的详情 -->
            <el-table :data="userInfo" @cell-dblclick="handleDoubleClick">
                <el-table-column label="进度" width="260">
                    <template slot-scope="scope">
                        <el-progress :stroke-width="24" :percentage="scope.row.percentage"
                            :status="'leftDelay' in scope.row ? scope.row.leftDelay >= 0 ? 'warning' : scope.row.finishedOwnWork ? 'primary' : 'exception' : 'success'"></el-progress>
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
                        <el-tooltip class="item" effect="dark" content="申请延期" placement="left"
                            v-if="!scope.row.delayChecking">
                            <el-button size="mini" type="warning" icon="el-icon-timer" round
                                @click="openDelayApply(scope.row)"></el-button>
                        </el-tooltip>
                        <el-tooltip class="item" effect="dark" content="审核中" placement="left" v-else>
                            <el-button size="mini" type="primary" icon="el-icon-timer" round></el-button>
                        </el-tooltip>
                        <el-tooltip class="item" effect="dark" content="完结" placement="right"
                            v-if="!scope.row.finishChecking">
                            <el-button size="mini" type="success" icon="el-icon-success" round
                                @click="tryFinish(scope.row)"></el-button>
                        </el-tooltip>
                        <el-tooltip class="item" effect="dark" content="完结审核中" placement="top" v-else>
                            <el-button size="mini" type="primary" icon="el-icon-success" round></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 中止专案显示区域 -->
        <el-card style="margin-top: 5px;" v-if="exceptionList.length > 0">
            <h2>中止专案</h2>
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
                        <el-tooltip class="item" effect="dark" content="开始执行" placement="top">
                            <el-button size="mini" type="success" icon="el-icon-success" round
                                @click="tryStart(scope.row)"></el-button>
                        </el-tooltip>

                        <el-tooltip class="item" effect="dark" content="专案详情" placement="top">
                            <el-button size="mini" type="primary" icon="el-icon-s-promotion" round
                                @click="openCaseDetail(scope.row)"></el-button>
                        </el-tooltip>

                    </template>
                </el-table-column>

            </el-table>
        </el-card>

        <br>
        <el-card class="gantt-chart">
            <div id="ganttChart" style="width: 100%; height: 500px;"></div>
        </el-card>

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


        <el-dialog title="申请延期" :visible.sync="applyDelayVisible" width="30%" @close="closeApplyDelay">
            <el-form ref="applyDelayFormRef" :rules="delayRules" :model="delayApplyObject" label-width="110px" class="form">
                <el-form-item label="申请类型">
                    <el-input :value="delayApplyObject.type === 0 ? '专案类' : delayApplyObject.type === 1 ? '临时事务' : '技术研究'"
                        disabled></el-input>
                </el-form-item>

                <el-form-item label="描述">
                    <el-input v-model="delayApplyObject.description" disabled></el-input>
                </el-form-item>

                <el-form-item label="延期类型" prop="delayType">
                    <el-select v-model="delayApplyObject.delayType" placeholder="请选择延期类型">
                        <el-option v-for="item in ['外界因素延期', '人为因素延期']" :key="item" :label="item" :value="item">
                        </el-option>
                    </el-select>
                </el-form-item>

                <el-form-item label="原因描述:" prop="applyReason">
                    <el-input autosize type="textarea" v-model="delayApplyObject.applyReason"
                        placeholder="请输入延期原因描述"></el-input>
                </el-form-item>

                <el-form-item label="申请天数" prop="applyDays">
                    <el-input type="number" v-model.number="delayApplyObject.applyDays" placeholder="请输入要申请的天数"
                        @input="computePresetTime"></el-input>
                </el-form-item>

                <el-form-item label="预计完成时间" v-if="delayApplyObject.presetFinishTime">
                    <el-input :value="delayApplyObject.presetFinishTime" disabled></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="applyDelayVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitDelayApply()">确 定</el-button>
            </span>
        </el-dialog>


        <el-dialog title="多负责人确认" width="30%" :visible.sync="updateDescriptionVisible" @close="closeDescriptionForm">
            <h2>请简述自己负责的工作及持续时间</h2>
            <br>
            <el-form label-width="90px" ref="descriptionFormRef" class="form">
                <el-form-item v-for="item in directors" :label="item.name" :key="item.id">
                    <el-input v-model="item.description" placeholder="例：CCD调试，累计执行15个工作日"
                        :disabled="item.userId !== user.id"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="updateDescriptionVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitDirectorJobDescription()">确 定</el-button>
            </span>
        </el-dialog>

        <el-dialog title="申请参与专案子流程" :visible.sync="applyCaseSubVisible" width="40%"
            @close="$refs.applyCaseSubFormRef.resetFields()">
            <el-form ref="applyCaseSubFormRef" :rules="applyCaseSubRules" :model="applyCaseSubUser" label-width="100px">
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="专案名称" prop="caseId">
                            <el-select v-model="applyCaseSubUser.caseId" placeholder="请选择" @change="getUnfinishedSubList()">
                                <el-option v-for="item in unFinishedCaseList" :key="item.id" :label="item.name"
                                    :value="item.id">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>

                    <el-col :span="12">
                        <el-form-item label="子流程名称" prop="caseSubId">
                            <el-select v-model="applyCaseSubUser.caseSubId" placeholder="请选择" @change="flushCaseSubId">
                                <el-option v-for="item in unfinishedSubList" :key="item.id" :label="item.subName"
                                    :value="item.id">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="工作描述" prop="description">
                    <el-input v-model="applyCaseSubUser.description" placeholder="请概要输入工作内容"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="applyCaseSubVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitApplyCaseSub()">确 定</el-button>
            </span>
        </el-dialog>

        <el-dialog title="申请任务" :visible.sync="applyTaskVisible" width="30%" @close="$refs.applyTaskFormRef.resetFields()">
            <el-form ref="applyTaskFormRef" :rules="applyTaskRules" :model="applyTask" label-width="80px">
                <el-form-item label="任务类型" prop="type">
                    <el-select v-model="applyTask.type" placeholder="请选择任务类型">
                        <el-option v-for="item in [{ label: '技术研究', value: 2 }, { label: '临时事务', value: 1 }]"
                            :key="item.value" :label="item.label" :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="任务描述" prop="description">
                    <el-input type="textarea" placeholder="请输入任务描述" v-model="applyTask.description"></el-input>
                </el-form-item>
                <el-form-item label="预估时间" prop="planDays">
                    <el-input type="number" placeholder="请输入预估完成时间（天）" v-model.number="applyTask.planDays"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="applyTaskVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitApplyTask()">确 定</el-button>
            </span>
        </el-dialog>

        <el-dialog title="选择完结日期" :visible.sync="selectFinishTimeVisible" width="30%">
            <el-date-picker v-model="curTask.applyTime" type="date" placeholder="选择完结日期" value-format="yyyy-MM-dd HH:mm:ss"
                @input="changeTime">
            </el-date-picker>
            <span slot="footer" class="dialog-footer">
                <el-button @click="selectFinishTimeVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitFinish()">确 定</el-button>
            </span>
        </el-dialog>

        <el-dialog title="选择开始日期" :visible.sync="selectStartTimeVisible" width="30%">
            <el-date-picker v-model="curInterruptTask.startTime" type="date" placeholder="选择开始日期"
                value-format="yyyy-MM-dd HH:mm:ss" @input="changeTime">
            </el-date-picker>
            <span slot="footer" class="dialog-footer">
                <el-button @click="selectStartTimeVisible = false">取 消</el-button>
                <el-button type="primary" @click="launch()">确 定</el-button>
            </span>
        </el-dialog>

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
    </div>
</template>

<script>
import { mapState } from 'vuex'
import { timeSub, timeAdd, formatDate, format4back } from '@/utils/common'
import { unFinishedCaseList } from '@/api/case'
import { unfinishedSubList, startOrFinish } from '@/api/caseSub'
import { taskList, recentTaskList, recentHalfYear, getExceptionList } from '@/api/task'
import { saveApply,getDelayById } from '@/api/caseDelayApply'
import { getFinishListByUserId, saveFinishApply } from '@/api/caseFinishApply'
import { countUser, updateDescription } from '@/api/caseSubUser'
import { saveApplyCaseSub } from '@/api/applyCaseSub'
import { saveApplyTask } from '@/api/applyTask'

export default {
    name: 'case4me',
    data() {
        var checkDays = (rule, value, callback) => {
            if (value <= 0 || value > 90)
                callback(new Error("申请天数必须在1-90之间"))
            callback()
        }
        var checkPlandays = (rule, value, callback) => {
            if (value === null || value === '')
                callback(new Error("申请天数不能为空"))
            if (value < 1)
                callback(new Error("申请天数必须大于1"))
            callback()
        }
        return {
            userInfo: [],
            applyDelayVisible: false,
            delayApplyObject: {},
            delayRules: {
                applyReason: [
                    { required: true, message: '必须输入延期原因', trigger: 'blur' }
                ],
                applyDays: [
                    { required: true, message: '必须输入要延期的天数', trigger: 'blur' },
                    { validator: checkDays, trigger: 'blur' }
                ],
                delayType: [
                    { required: true, message: '请选择延期类型', trigger: 'change' }
                ]
            },
            applyCaseSubRules: {
                caseId: [
                    { required: true, message: '请选择专案', trigger: 'change' }
                ],
                caseSubId: [
                    { required: true, message: "请选择子流程", trigger: 'blur' }
                ],
                description: [
                    { required: true, message: '请填写工作内容描述', trigger: 'blur' }
                ]
            },
            applyTaskRules: {
                type: [
                    { required: true, message: '请选择任务类型', trigger: 'blur' }
                ],
                description: [
                    { required: true, message: '请填写任务内容描述', trigger: 'blur' }
                ],
                planDays: [
                    { required: true, message: '申请天数不能为空', trigger: 'blur' },
                    { validator: checkPlandays, trigger: 'blur' }
                ]
            },
            //完结的时候确认工作内容
            updateDescriptionVisible: false,
            directors: [],
            // 申请子流程表单显示
            applyCaseSubVisible: false,
            //申请子流程表单的数据
            applyCaseSubUser: {},
            //所有未完成的专案列表
            unFinishedCaseList: [],
            //所有未完成的子流程列表
            unfinishedSubList: [],
            //专案研究显示
            applyTaskVisible: false,
            applyTask: {},
            //当前申请完结的任务
            curTask: {},
            //完结选择时间弹窗
            selectFinishTimeVisible: false,
            //当前用户的所有延期申请信息
            delayApplyList: [],
            //当前用户的所有完结申请信息
            finishApplyList: [],
            //当前用户所有未开始的任务
            exceptionList: [],
            //选择中止专案阶段的开始时间
            selectStartTimeVisible: false,
            //当前申请开始的专案任务
            curInterruptTask: {},
            // 甘特图
            gantt: null,
            // 延期列表
            delayList: [],
            // 抽屉
            delayDrawer: false
        }
    },
    async created() {
        // 获取申请的列表
        // this.getDelayApplyList()
        // this.getFinishApplyList()
        await this.getTaskByUserId()
        this.initGantt()
        this.getUnfinishedCaseList()
        this.getExceptionList()
    },
    mounted() {
        this.initPie()
        this.initBur()

        this.applyCaseSubVisible = this.$route.query.applyCaseSubVisible
        this.applyTaskVisible = this.$route.query.applyTaskVisible
    },
    computed: {
        ...mapState(['user'])
    },
    methods: {
        // 获取当前用户的中断未开始的任务
        async getExceptionList() {
            const res = await getExceptionList(this.user.id)
            if (res.code === 200) {
                this.exceptionList = res.data
                this.exceptionList.forEach(item => {
                    item.lastFinishTime = formatDate(item.lastFinishTime)
                    item.interruptDays = timeSub(item.lastFinishTime, new Date()) - 1
                })
            } else {
                this.$message.error(res.msg)
            }
        },
        async getDelayApplyList() {
            const res = await getDelayListByUserId(this.user.id)
            if (res.code === 200) {
                this.delayApplyList = res.data
            } else {
                this.$message.error(res.msg)
            }
        },
        async getFinishApplyList() {
            const res = await getFinishListByUserId(this.user.id)
            if (res.code === 200) {
                this.finishApplyList = res.data
            } else {
                this.$message.error(res.msg)
            }
        },
        async getTaskByUserId() {
            const res = await taskList(this.user.id)
            this.userInfo = res.data

            for (var i = 0; i < this.userInfo.length; i++) {
                this.userInfo[i].executionDays = timeSub(this.userInfo[i].startTime, new Date())
                var presetTime = new Date(this.userInfo[i].startTime)
                presetTime = presetTime.setDate(presetTime.getDate() + this.userInfo[i].planDays + this.userInfo[i].unforcedDays - 1)
                this.userInfo[i].presetTime = presetTime
                //分为已延误和未延误
                var today = new Date()
                var delayCount = 0
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
                    } else {
                        this.userInfo[i].percentage = (timeSub(this.userInfo[i].startTime, today) / this.userInfo[i].planDays) * 100
                        delayCount++
                    }
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
        //打开dialog时的回调函数
        openDelayApply(row) {
            this.applyDelayVisible = true
            this.delayApplyObject = { ...row }
            // 添加预计完成时间显示
            this.delayApplyObject.presetFinishTime = null
        },
        //关闭dialog时的回调函数
        closeApplyDelay() {
            this.$refs.applyDelayFormRef.resetFields()
        },
        closeDescriptionForm() {
            this.$refs.descriptionFormRef.resetFields()
        },
        submitDelayApply() {
            this.$refs.applyDelayFormRef.validate(async (valid) => {
                if (valid) {
                    this.delayApplyObject.applyId = this.user.id
                    const res = await saveApply(this.delayApplyObject)
                    if (res.code === 200) {
                        this.$message.success(res.data)
                        this.delayApplyObject = {}
                        this.applyDelayVisible = false
                        this.getTaskByUserId()
                    } else
                        this.$message.error(res.msg)
                }
            })
        },
        //尝试完结任务
        async tryFinish(row) {
            // 看是专案类还是其他类
            // 专案类就要看有几个负责人
            // 多个负责人就打开任务描述窗口
            // 单个负责人就直接申请完结
            // 其他类也直接申请完结
            if (row.type === 0) {
                const res = await countUser(row.caseSubId)
                if (res.code === 200) {
                    //不止一个
                    if (res.data.length > 1) {
                        //打开更新工作描述窗口
                        this.openUpdateDescription(res.data)
                    } else {
                        this.openSelectFinishTime(row)
                    }
                }
            } else {
                this.openSelectFinishTime(row)
            }
        },
        //打开更新工作描述窗口
        openUpdateDescription(info) {
            this.updateDescriptionVisible = true
            this.directors = info
        },
        //打开填写完结日期的窗口
        openSelectFinishTime(row) {
            this.curTask = { ...row }
            this.selectFinishTimeVisible = true
        },
        //强制更新完结时间组件
        changeTime() {
            this.$forceUpdate()
        },
        //完结任务
        async submitFinish() {
            if (this.curTask.applyTime < this.curTask.startTime) {
                this.$message.error("结束时间小于开始时间，请检查输入")
                return
            }
            this.curTask.applyId = this.user.id
            this.curTask.applyTime = format4back(this.curTask.applyTime)
            const res = await saveFinishApply(this.curTask)
            if (res.code === 200) {
                this.$message.success(res.data)
                this.selectFinishTimeVisible = false
                this.getTaskByUserId()
            } else
                this.$message.error(res.msg)
        },
        //提交各负责人的工作描述
        async submitDirectorJobDescription() {
            for (var i = 0; i < this.directors.length; i++) {
                if (this.directors[i].userId === this.user.id && (this.directors[i].description === null || this.directors[i].description === '')) {
                    this.$message.error("你对自己的工作描述为空，请检查后重新提交")
                    return
                }
                if (!('description' in this.directors[i]) || this.directors[i].description === null || this.directors[i].description === '') {
                    // 有负责人的描述为空，说明还未填写，仅更新描述，不提交完结
                    const res = await updateDescription(this.directors)
                    if (res.code === 200) {
                        this.$message.success(res.data)
                        this.updateDescriptionVisible = false
                    } else {
                        this.$message.error(res.error)
                    }
                    return
                }
            }
            // 所有人的描述都有了，则说明准备结束了
            const res = await updateDescription(this.directors)
            if (res.code === 200) {
                this.$message.success(res.data)
                this.updateDescriptionVisible = false
                setTimeout(() => this.openSelectFinishTime({ caseSubId: this.directors[0].caseSubId }), 200)

            } else {
                this.$message.error(res.error)
            }
        },
        async getUnfinishedCaseList() {
            const res = await unFinishedCaseList()
            if (res.code === 200) {
                this.unFinishedCaseList = res.data
            } else {
                this.$message.error(res.msg)
                return
            }
        },
        initApplyCaseSub() {
            this.applyCaseSubVisible = true
        },
        //专案变化的回调函数
        async getUnfinishedSubList() {
            this.applyCaseSubUser.caseSubId = null
            const res = await unfinishedSubList({ caseId: this.applyCaseSubUser.caseId, userId: this.user.id })
            if (res.code === 200) {
                this.unfinishedSubList = res.data
            } else {
                this.$message.error(res.msg)
                return
            }
        },
        // 子流程变化的回调函数
        flushCaseSubId() {
            this.$forceUpdate()
        },
        //申请子流程
        submitApplyCaseSub() {
            this.$refs.applyCaseSubFormRef.validate(async (valid) => {
                if (valid) {
                    this.applyCaseSubUser.applyId = this.user.id
                    const res = await saveApplyCaseSub(this.applyCaseSubUser)
                    if (res.code === 200) {
                        this.$message.success(res.data)
                        this.applyCaseSubVisible = false
                    } else {
                        this.$message.error(res.msg)
                    }
                }
            })
        },
        submitApplyTask() {
            this.$refs.applyTaskFormRef.validate(async (valid) => {
                if (valid) {
                    this.applyTask.applyId = this.user.id
                    const res = await saveApplyTask(this.applyTask)
                    if (res.code === 200) {
                        this.applyTaskVisible = false
                        this.$message.success(res.data)
                    } else {
                        this.$message.error(res.msg)
                    }
                }
            })

        },
        //初始化饼状图
        async initPie() {
            const res = await recentTaskList(this.user.id)
            var typePie = this.$echarts.init(document.getElementById('taskType'))
            typePie.setOption({
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
        async initBur() {
            var burInfo = this.$echarts.init(document.getElementById('taskAchieve'))
            const { data: res } = await recentHalfYear(this.user.id)
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
            burInfo.setOption({
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
        //打开中止专案详情
        openCaseDetail(row) {
            this.$router.push({
                name: '子流程详情',
                query: {
                    caseId: row.caseId,
                    caseName: row.caseName,
                }
            })
        },
        // 中止专案重启
        tryStart(row) {
            this.curInterruptTask = { ...row }
            this.selectStartTimeVisible = true
        },
        //启动阶段
        async launch() {
            const res = await startOrFinish(this.curInterruptTask)
            if (res.code === 200) {
                this.$message.success(res.data)
                //刷新界面
                this.getTaskByUserId()
                this.getExceptionList()
                this.selectStartTimeVisible = false
            }
        },
        // 计算执行时间
        computePresetTime() {
            if (this.delayApplyObject.applyDays === '') {
                this.delayApplyObject.presetFinishTime = null
                return
            }
            this.delayApplyObject.presetFinishTime = formatDate(timeAdd(this.delayApplyObject.startTime, this.delayApplyObject.planDays, this.delayApplyObject.unforcedDays, this.delayApplyObject.applyDays))
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
                fontSize: 20,
                formatter: function (params) {
                    var data = new Date(params.value)
                    if (zlevel === 1 || zlevel === 2)
                        return data.getMonth() + 1 + "/" + data.getDate()
                    return ""
                }

            }
            obj.zlevel = zlevel
            if (start) {
                obj.itemStyle = {

                    color: "#fff"

                }
            } else {
                obj.itemStyle =
                {

                    color: color,
                    borderColor: "#fff",
                    borderWidth: 2,

                }
            }
            obj.data = []
            return obj
        },
        // 初始化甘特图
        initGantt() {
            this.gantt = this.$echarts.init(document.getElementById('ganttChart'))
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
                execTime_end.data.push(new Date(timeAdd(this.userInfo[i].startTime, this.userInfo[i].executionDays)))
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
        // 监听双击事件
        handleDoubleClick(row, column) {
            if (column.label === "描述")
                this.navigateToDetailPage(row)
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
