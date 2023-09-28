<template>
    <div class="subView">
        <!-- 面包屑导航区域 -->
        <div>
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>专案管理</el-breadcrumb-item>
                <el-breadcrumb-item :to="{ path: '/index' }">主页</el-breadcrumb-item>
                <el-breadcrumb-item>{{ caseName }}</el-breadcrumb-item>
            </el-breadcrumb>
        </div>

        <!-- 子流程详情演示区域 -->
        <el-card>
            <div class="subInfo">
                <el-page-header @back="$router.back()" :content="caseName"></el-page-header>
                <div class="table">
                    <div class="subTable">
                        <el-table :cell-style="setCellColor" :data="subInfo" stripe border
                            @cell-dblclick="handleDoubleClick">

                            <el-table-column type="expand">
                                <template slot-scope="scope">
                                    <el-row v-for="(item, index) in scope.row.chargeName" :key="item">
                                        <el-col :span="2">
                                            <el-tag class="chargeNameTag"
                                                @click="getCaseByUserId(scope.row.chargeId[index], item)">
                                                {{ item }}
                                            </el-tag>

                                        </el-col>

                                        <el-col :span="3">
                                            <el-tag v-if="scope.row.directorRate != null" type="warning"
                                                class="chargeNameTag">
                                                积分比例：{{ (scope.row.directorRate[index]).toFixed() }} %
                                            </el-tag>
                                        </el-col>

                                        <el-col :span="3">
                                            <el-tag v-if="scope.row.directorRate != null" type="warning"
                                                class="chargeNameTag">
                                                积分：{{ ((scope.row.directorRate[index] * scope.row.value * 1.0) / 100).toFixed(2)
                                                }}
                                            </el-tag>
                                        </el-col>
                                    </el-row>
                                    <el-tag v-if="scope.row.chargeId.length === 0">暂无负责人</el-tag>
                                </template>
                            </el-table-column>

                            <el-table-column prop="subName" label="子流程">
                            </el-table-column>

                            <el-table-column prop="level" label="难度">
                            </el-table-column>

                            <el-table-column prop="value" label="积分">
                            </el-table-column>

                            <el-table-column prop="startTime" label="开始时间">
                            </el-table-column>

                            <!-- 阶段目标时间：实际开始时间+预设时间 -->
                            <el-table-column prop="targetTime" label="阶段目标时间">
                            </el-table-column>

                            <!-- 目标完成时间：实际开始时间+预设时间+外界因素延期 -->
                            <el-table-column prop="standardTime" label="目标完成时间">
                            </el-table-column>

                            <!-- 理想完成时间：所有流程都正常结束的时间 -->
                            <el-table-column prop="ideaTime" label="预计完成时间">
                            </el-table-column>

                            <el-table-column prop="finishTime" label="实际结束时间">
                            </el-table-column>

                            <el-table-column prop="planDays" label="计划时间">
                            </el-table-column>

                            <el-table-column prop="executionDays" label="执行天数">
                            </el-table-column>

                            <el-table-column prop="unforcedDays" label="外界因素延期">
                            </el-table-column>

                            <el-table-column prop="applyDelay" label="人为因素延期">
                            </el-table-column>

                            <el-table-column prop="status" label="执行状态">
                                <template slot-scope="scope">
                                    <el-tag effect="dark" :type="showtype(scope.row.status)" disable-transitions>{{
                                        number2status(scope.row.status)
                                    }}</el-tag>
                                </template>

                            </el-table-column>

                            <el-table-column label="操作" width="180">
                                <template slot-scope="scope">
                                    <el-tooltip effect="dark" content="查看备注" placement="top" :enterable="false">
                                        <el-button type="info" size="mini" icon="el-icon-info" round
                                            @click="openCommentView(scope.row)"></el-button>
                                    </el-tooltip>
                                    <el-tooltip effect="dark" content="开始阶段" placement="top" :enterable="false"
                                        v-if="user.type===1&&scope.row.startTime === null">
                                        <el-button type="success" size="mini" icon="el-icon-video-play" round
                                            @click="launch(scope.row)"></el-button>
                                    </el-tooltip>
                                    <el-tooltip effect="dark" content="结束阶段" placement="top" :enterable="false"
                                        v-if="user.type===1&&scope.row.startTime !== null && scope.row.finishTime === null">
                                        <el-button type="danger" size="mini" icon="el-icon-success" round
                                            @click="finish(scope.row)"></el-button>
                                    </el-tooltip>
                                    <el-tooltip effect="dark" content="编辑阶段" placement="top" :enterable="false">
                                        <el-button v-if="user.type===1" type="primary" size="mini" icon="el-icon-edit" round
                                            @click="openEditCaseSub(scope.row)"></el-button>
                                    </el-tooltip>
                                    <el-tooltip
                                        v-if="user.type===1&&scope.row.startTime !== null && scope.row.finishTime !== null && scope.row.chargeId.length !== 0"
                                        effect="dark" content="分配比例" placement="top" :enterable="false">
                                        <el-button type="warning" size="mini" icon="el-icon-setting" round
                                            @click="initEditDirectorRate(scope.row)"></el-button>
                                    </el-tooltip>
                                </template>
                            </el-table-column>
                        </el-table>
                        <!-- 分页区域 -->

                    </div>
                    <!-- 显示负责人手头的子流程 -->
                    <el-drawer :visible.sync="drawer" :direction="direction" size="50%">
                        <div class="userCase" border>
                            <div class="chargeInfo">
                                <label class="chargeName">{{ chargeName }}</label>
                            </div>
                            <el-table :data="userInfo">
                                <el-table-column prop="caseName" label="专案名称" width="245">
                                </el-table-column>
                                <el-table-column prop="subName" label="阶段名称" width="80">
                                </el-table-column>
                                <el-table-column prop="startTime" label="开始时间" width="100">
                                </el-table-column>
                                <el-table-column prop="presetTime" label="预计完成时间" width="110">
                                </el-table-column>
                                <el-table-column prop="deadLine" label="延期/截止" width="110">
                                </el-table-column>
                                <el-table-column prop="status" label="执行状态" width="100"
                                    :filters="[{ text: '正在执行', value: '正在执行' }, { text: '已完成', value: '已完成' }, { text: '已延误', value: '已延误' }, { text: '延误完成', value: '延误完成' }]"
                                    :filter-method="filterTag" filter-placement="bottom-end">
                                    <template slot-scope="scope">
                                        <el-tag :type="showtype(scope.row.status)" disable-transitions>{{
                                            number2status(scope.row.status)
                                        }}</el-tag>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                    </el-drawer>
                    <!-- 显示外界因素延期 -->
                    <el-drawer :visible.sync="delayDrawer" :direction="direction" size="50%">
                        <el-table :data="delayList" style="width: 100%" border>
                            <el-table-column prop="caseName" label="专案" width="240">
                            </el-table-column>
                            <el-table-column prop="subName" label="阶段" width="100">
                            </el-table-column>
                            <el-table-column prop="type" label="延期类型" width="120">
                            </el-table-column>
                            <el-table-column prop="applyReason" label="延期原因">
                            </el-table-column>
                            <el-table-column prop="applyDays" label="申请天数" width="80">
                            </el-table-column>
                            <el-table-column prop="predictTime" label="预计完成时间" width="120">
                            </el-table-column>
                        </el-table>
                    </el-drawer>
                    <!-- 显示备注框 -->
                    <el-dialog title="备注信息" :visible.sync="commitVisible" width="40%" @close="closeCommitDialog">
                        <el-form ref="commitFormRef" :model="commitForm" :rules="rules" label-width="100px">
                            <!-- 子流程名称显示 -->
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
            </div>
        </el-card>

        <!-- 显示分配积分比例框 -->
        <el-dialog title="确定积分比例" :visible.sync="editDirectorRate" width="40%">
            <el-table :data="directorList" style="width: 100%">
                <el-table-column prop="name" label="姓名">
                </el-table-column>
                <el-table-column label="比例">
                    <template slot-scope="scope">
                        <el-input type="number" v-model="scope.row.value" placeholder="例：33，单位%"></el-input>
                    </template>
                </el-table-column>
                <el-table-column label="工作描述">
                    <template slot-scope="scope">
                        <el-input v-model="scope.row.description" placeholder="工作内容"></el-input>
                    </template>
                </el-table-column>
            </el-table>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDirectorRate = false">取 消</el-button>
                <el-button type="primary" @click="submitDirectorRate()">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 显示修改框 -->
        <el-dialog title="编辑子阶段" :visible.sync="editCaseSubVisible" width="50%">
            <el-form ref="editCaseSubRef" :model="curCaseSubObj" label-width="90px">
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="修改难度">
                            <el-select v-model="curCaseSubObj.level"
                                :placeholder="curCaseSubObj ? curCaseSubObj.level + '' : '请选择难度'" @change="getPlanDays()">
                                <el-option v-for="item in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]" :key="item" :label="item"
                                    :value="item">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="计划天数">
                            <el-input v-model="curCaseSubObj.planDays"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <!-- 开始时间 -->
                <el-form-item label="开始时间">
                    <el-date-picker v-model="curCaseSubObj.startTime" type="date" placeholder="开始日期">
                    </el-date-picker>
                </el-form-item>

                <!-- 结束时间 -->

                <el-form-item label="结束时间">
                    <el-date-picker v-model="curCaseSubObj.finishTime" type="date" placeholder="结束时间">
                    </el-date-picker>
                </el-form-item>

                <el-row>
                    <!-- 外界因素延期 -->
                    <el-col :span="12">
                        <el-form-item label="外界延期">
                            <el-input v-model="curCaseSubObj.unforcedDays"></el-input>
                        </el-form-item>
                    </el-col>
                    <!-- 人为因素延期 -->
                    <el-col :span="12">
                        <el-form-item label="人为延期">
                            <el-input v-model="curCaseSubObj.applyDelay"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-form-item label="负责人">
                    <el-transfer v-model="curCaseSubObj.chargeId" :data="editUser" :button-texts="['移除', '添加']"
                        :titles="['源', '目标']" :props="{ key: 'id', label: 'name' }"
                        v-if="curCaseSubObj.finishTime === null">
                    </el-transfer>
                    <div v-else>
                        <el-tag class="chargeNameTag">专案子阶段结束状态下，不可修改负责人</el-tag>
                        <div>
                            <el-tag class="chargeNameTag" type="warning" v-for="item in curCaseSubObj.chargeName"
                                :key="item">{{ item }}</el-tag>
                        </div>
                    </div>
                </el-form-item>

            </el-form>

            <span slot="footer" class="dialog-footer">
                <el-button @click="editCaseSubVisible = false">取 消</el-button>
                <el-button type="primary" @click="enableEdit()">修 改</el-button>
            </span>
        </el-dialog>

        <!-- 显示指定负责人窗口 -->
        <el-dialog title="阶段暂无负责人" :visible.sync="setDirectorVisible" width="30%">
            <el-select v-model="directors" multiple filterable placeholder="请选择负责人">
                <el-option-group v-for="group in allUser" :key="group.value" :label="group.label">
                    <el-option v-for="item in group.children" :key="item.id" :label="item.name" :value="item.id">
                    </el-option>
                </el-option-group>
            </el-select>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setDirectorVisible = false">取 消</el-button>
                <el-button type="danger" @click="launchSub(curCaseSub)">无负责人启动</el-button>
                <el-button type="primary" @click="setDirectorFn()">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { formatDate, getStatus, timeAdd, timeSub } from '@/utils/common'
import { getSubList, getSubByUserId, updateCaseSub, startOrFinish } from '@/api/caseSub'
import { mapState } from 'vuex'
import { removeDirector, countUser, setDirector, submitDirectorValue } from '@/api/caseSubUser'
import { getDelayByStatus } from '@/api/caseDelayApply'
import { getById, saveCommit } from '@/api/caseSubCommit';
import { getUserList } from '@/api/user'
import { getPresetDay } from '@/api/sub'

export default {
    data() {
        return {
            subInfo: [],
            caseName: '',
            caseId: null,
            drawer: false,
            direction: 'rtl',
            // 延期显示
            delayDrawer: false,
            delayList: [],
            //个人对应的专案子流程
            userInfo: [],
            chargeName: '負責人',
            // 显示备注框
            commitVisible: false,
            commitForm: {
                content: [],
                newContent: null,
                chargeId: []
            },
            rules: {
                newContent: [
                    {
                        required: true, message: '备注不能为空', trigger: 'blur'
                    },
                    {
                        min: 8, max: 255, message: '备注应该大于8个字符，小于255个字符', trigger: 'blur'
                    }
                ]
            },
            //显示指定负责人窗口
            setDirectorVisible: false,
            //所有可以指定的负责人
            allUser: [
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
            //穿梭框显示的科员
            editUser: [],
            //存储指定负责人的时候的id
            directors: null,
            //打开指定负责人界面的时候，标识是给哪个子流程指定
            curCaseSub: null,
            //修改专案子流程界面的显示
            editCaseSubVisible: false,
            curCaseSubObj: {},
            //显示分配子流程积分比例界面
            editDirectorRate: false,
            directorList: []
        }
    },
    computed: {
        ...mapState(['user'])
    },
    created() {
        this.caseId = this.$route.query.caseId
        this.caseName = this.$route.query.caseName
        this.getSubInfo(this.$route.query.caseId)
        //获取所有负责人
        this.getAllUser()
    },
    methods: {
        //获取子流程的信息
        async getSubInfo(caseId) {
            var res = await getSubList(caseId)
            this.subInfo = res.data
            console.log(this.subInfo)
            for (let i = 0; i < this.subInfo.length; i++) {
                this.subInfo[i].startTime = formatDate(this.subInfo[i].startTime)
                if (this.subInfo[i].startTime !== null) {
                    //阶段目标时间
                    this.subInfo[i].targetTime = timeAdd(this.subInfo[i].startTime, this.subInfo[i].planDays)
                    // 目标完成时间（计划天数+外界因素延期）
                    this.subInfo[i].standardTime = timeAdd(this.subInfo[i].startTime, this.subInfo[i].planDays, this.subInfo[i].unforcedDays)
                }
                // 预计完成时间
                if (i === 0)
                    this.subInfo[i].ideaTime = this.subInfo[i].targetTime
                else if (typeof (this.subInfo[i - 1].ideaTime) !== 'undefined') {
                    this.subInfo[i].ideaTime = timeAdd(this.subInfo[i - 1].ideaTime, this.subInfo[i].planDays)
                }
                //实际完成时间
                this.subInfo[i].finishTime = formatDate(this.subInfo[i].finishTime)
                this.subInfo[i].status = getStatus(this.subInfo[i].startTime, this.subInfo[i].standardTime, this.subInfo[i].finishTime)
                //执行天数
                if (this.subInfo[i].startTime !== null) {
                    this.subInfo[i].executionDays = timeSub(this.subInfo[i].startTime, this.subInfo[i].finishTime === null ? new Date() : this.subInfo[i].finishTime)
                    // 减去外界因素延期(原excel表中就是使用的减去外界因素延期的执行时间，所以用该值去计算积分才符合原来的数据)
                    this.subInfo[i].executionDays -= this.subInfo[i].unforcedDays === null ? 0 : this.subInfo[i].unforcedDays
                }
                //计算积分
                if (this.subInfo[i].finishTime !== null) {
                    this.subInfo[i].value = (this.subInfo[i].planDays * (this.subInfo[i].planDays * 1.0 / this.subInfo[i].executionDays) ** (2 / 3)).toFixed(2)
                    // if(this.subInfo[i].subName==='配電')
                    if (this.subInfo[i].subId === 9)
                        this.subInfo[i].value *= 2
                }
            }
        },
        //显示负责人手头的子流程
        async handleDoubleClick(row, column) {
            if (column.label === '外界因素延期') {
                this.getUnforcedDays(row)
            } else if (column.label === '人为因素延期')
                this.getApplyDelay(row)

        },
        async getUnforcedDays(row) {
            var res = await getDelayByStatus({ caseSubId: row.id, status: 1, delayType: '外界因素延期' })
            this.delayList = res.data
            this.delayList.map(item => {
                item.predictTime = formatDate(item.predictTime)
                item.type = "外界因素延期"
                item.caseName = row.caseName
                item.subName = row.subName
            })
            this.delayDrawer = true
        },
        async getApplyDelay(row) {
            var res = await getDelayByStatus({ caseSubId: row.id, status: 1, delayType: '人为因素延期' })
            this.delayList = res.data
            this.delayList.map(item => {
                item.predictTime = formatDate(item.predictTime)
                item.type = "人为因素延期"
                item.caseName = row.caseName
                item.subName = row.subName
            })
            this.delayDrawer = true
        },
        async getCaseByUserId(id, name) {
            var res = await getSubByUserId(id)
            this.userInfo = res.data
            //負責人姓名顯示
            this.chargeName = name
            for (var i = 0; i < this.userInfo.length; i++) {
                this.userInfo[i].startTime = formatDate(this.userInfo[i].startTime)
                const presetTime = new Date(this.userInfo[i].startTime)
                //要算开始当天，所以必须-1
                this.userInfo[i].presetTime = formatDate(presetTime.setDate(presetTime.getDate() + this.userInfo[i].planDays-1))
                this.userInfo[i].status = getStatus(this.userInfo[i].startTime, this.userInfo[i].presetTime, this.userInfo[i].finishTime)
                //如果是还没有完成，时间相减正常算，如果已经延期，则要-1，比如9.2截止，9.1那天还剩2天，9.3那天延期1天
                this.userInfo[i].deadLine = this.userInfo[i].status === 0 ? timeSub(new Date(),this.userInfo[i].presetTime) :timeSub(this.userInfo[i].presetTime,new Date())-1
            }
            this.drawer = true
        },
        filterTag(value, row) {
            return row.status === value;
        },
        showtype(tag) {
            if (tag === 0)
                return "primary"
            else if (tag === 1)
                return "success"
            else if (tag === 2)
                return "danger"
            else if (tag === 3)
                return "warning"
            else if (tag === 4)
                return 'info'
        },

        number2status(status) {
            if (status === 0)
                return "正在执行"
            else if (status === 1)
                return "正常完成"
            else if (status === 2)
                return "已延误"
            else if (status === 3)
                return "延误完成"
            else if (status === 4)
                return "未开始"
        },
        async openCommentView(caseSub) {
            this.commitVisible = true
            this.commitForm.subName = caseSub.subName
            this.commitForm.caseSubId = caseSub.id
            // 获取专案子流程对应的所有备注
            var res = await getById(caseSub.id)
            res = res.data
            //备注数组必须清空，否则会叠加
            this.commitForm.content = []
            for (var i = 0; i < res.length; i++) {
                this.commitForm.content.push(res[i].content)
            }
        },
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
        //移除子流程负责人
        async removeDirector(row, index) {
            if (row.finishTime !== null) {
                this.$message.error('该阶段已经结束，负责人信息不可再变更');
                return
            }
            if (row.chargeId.length === 1) {
                this.$message.warning('当前阶段仅剩一个负责人，请先增加负责人再删除')
                return
            }
            this.$confirm('此操作将移除该负责人, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                const res = await removeDirector({ userId: row.chargeId[index], caseSubId: row.id })
                if (res.code === 200) {
                    this.$message.success(res.data)
                    // 使用 splice() 方法移除被删除的负责人和对应的负责人ID
                    row.chargeName.splice(index, 1)
                    row.chargeId.splice(index, 1)

                    // 使用 $set() 方法更新 row 对象的 chargeName 和 chargeId 数组
                    this.$set(row, 'chargeName', row.chargeName)
                    this.$set(row, 'chargeId', row.chargeId)
                } else {
                    this.$message.error(res.msg)
                }
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消移除'
                });

            })
        },
        //手动点了完结阶段
        async finish(row) {

            // 多个负责人就弹出分配比例，先分配比例再结束
            if (row.chargeId.length !== 0)
                this.initEditDirectorRate(row)
            else {
                //没有负责人就直接结束
                const res = await startOrFinish({ id: row.id, finishTime: formatDate(new Date()) + " 00:00:00" })
                if (res.code === 200) {
                    this.$message.success(res.data)
                    this.getSubInfo(this.caseId)
                } else {
                    this.$message.error(res.msg)
                }
            }
        },
        //手动点了开始阶段
        async launch(row) {
            this.$confirm('此操作将开始该阶段, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                // 先获取该阶段的负责人
                var res = await countUser(row.id)
                if (res.data.length === 0) {
                    //这里给个dialog弹窗！
                    this.initSetDirector(row.id)
                } else {
                    //否则直接开始
                    this.launchSub(row.id)
                }
            }).catch((error) => {
                console.log(error)
                this.$message({
                    type: 'info',
                    message: '已取消开始'
                });

            })
        },
        //初始化负责人方法
        initSetDirector(id) {
            //指定负责人窗口
            this.setDirectorVisible = true
            //初始化负责人
            this.directors = null
            //当前选中专案阶段id
            this.curCaseSub = id
        },
        //获取所有负责人
        async getAllUser() {
            const res = await getUserList()
            if (res.code === 200) {
                this.editUser = res.data
                res.data.forEach((item) => {
                    this.allUser[item.status].children.push(item)
                })
            } else
                this.$message.error(res.msg)
        },
        //插入数据库
        async setDirectorFn() {
            const res = await setDirector({ id: this.curCaseSub, chargeId: this.directors })
            if (res.code === 200) {
                this.$message.success(res.data)
                //指定成功后要开始阶段
                this.launchSub(this.curCaseSub)
            } else
                this.$message.error(res.msg)
        },
        // 无负责人启动
        async launchSub(id) {
            //直接开始
            var res = await startOrFinish({ id: id, startTime: formatDate(new Date()) + " 00:00:00" })
            if (res.code === 200) {
                this.$message.success(res.data)
                this.setDirectorVisible = false
                this.getSubInfo(this.caseId)
            } else {
                this.$message.error(res.msg)
            }
        },
        //打开编辑专案表单
        openEditCaseSub(row) {
            this.curCaseSubObj = { ...row }
            this.editCaseSubVisible = true
        },
        //修改专案子流程表单
        async enableEdit() {
            //处理日期格式
            if (this.curCaseSubObj.startTime !== null) {
                this.curCaseSubObj.startTime = formatDate(this.curCaseSubObj.startTime) + " 00:00:00"
            }
            if (this.curCaseSubObj.finishTime !== null) {
                this.curCaseSubObj.finishTime = formatDate(this.curCaseSubObj.finishTime) + " 00:00:00"
            }
            console.log(this.curCaseSubObj)
            var res = await updateCaseSub(this.curCaseSubObj)
            if (res.code === 200) {
                this.$message.success(res.data)
                this.getSubInfo(this.caseId)
                this.editCaseSubVisible = false
            } else {
                this.$message.error(res.msg)
            }
        },
        //修改难度后同步计划天数
        async getPlanDays() {
            const res = await getPresetDay({ subId: this.curCaseSubObj.subId, level: this.curCaseSubObj.level })
            if (res.code === 200)
                this.$set(this.curCaseSubObj, 'planDays', res.data)
            else
                this.$message.error(res.msg)
        },
        //打开分配比例界面
        async initEditDirectorRate(row) {
            //获得负责人列表
            const res = await countUser(row.id)
            this.directorList = res.data
            this.curCaseSubObj = { ...row }
            this.editDirectorRate = true
        },
        //提交积分比例（插入比例数据，修改子流程完结状态）
        async submitDirectorRate() {
            //检查积分比例是否合理
            var sum = 0;
            this.directorList.forEach(item => {
                sum += +item.value
            })
            // console.log(sum)
            if (sum !== 100) {
                this.$message.error("积分总和不为100，请检查积分比例")
                return
            }
            const res = await submitDirectorValue(this.directorList)
            if (res.code === 200) {
                this.$message.success(res.data)
                this.editDirectorRate = false
                //如果没有结束，就弹框提示是否结束
                if (this.curCaseSubObj.finishTime === null) {
                    this.$confirm('此操作将完结该阶段, 是否继续?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(async () => {

                        const res = await startOrFinish({ id: this.curCaseSubObj.id, finishTime: formatDate(new Date()) + " 00:00:00" })
                        if (res.code === 200) {
                            this.$message.success(res.data)
                            this.getSubInfo(this.caseId)
                        } else {
                            this.$message.error(res.msg)
                        }

                    }).catch((error) => {
                        console.log(error)
                        this.$message({
                            type: 'info',
                            message: '已取消完结'
                        });

                    })
                } else {
                    this.getSubInfo(this.caseId)
                }
            } else
                this.$message.error(res.msg)
        },
        //设置单元格颜色
        setCellColor({ row, column, rowIndex, columnIndex }) {
            if (columnIndex === 4)
                return 'background-color:#fceadb'
            else if (columnIndex === 5)
                return 'background-color:#e1bbb8'
            else if (columnIndex === 6)
                return 'background-color:#C6DEF8'
            else if (columnIndex === 7)
                return 'background-color:#B9BFBF'
            else if (columnIndex === 8)
                return 'background-color:#B4EBB1'
        }
    }
}
</script>

<style scoped>
.el-page-header {
    margin-bottom: 10px;
}


.chargeName {
    font-size: 50px;
    color: white;
}

.chargeNameTag {
    margin: 7px;
    font-size: 20px;
}
</style>