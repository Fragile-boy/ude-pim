<template>
    <div class="subView" style="text-align: center;">
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
                        <el-table :data="subInfo" stripe border @cell-dblclick="handleDoubleClick">

                            <el-table-column type="expand">
                                <template slot-scope="scope">
                                    <el-row v-for="(item, index) in scope.row.chargeName" :key="item">
                                        <el-col :span="4">
                                            <el-tag class="chargeNameTag" closable @close="removeDirector(scope.row, index)"
                                                @click="getCaseByUserId(scope.row.chargeId[index], item)">
                                                {{ item }}
                                            </el-tag>
                                        </el-col>
                                    </el-row>

                                </template>
                            </el-table-column>

                            <el-table-column prop="subName" label="子流程" width="120">
                            </el-table-column>

                            <el-table-column prop="number" label="专案下序号" width="100">
                            </el-table-column>

                            <el-table-column prop="level" label="难度" width="50">
                            </el-table-column>

                            <el-table-column prop="startTime" label="开始时间" width="100">
                            </el-table-column>

                            <!-- 阶段目标时间：实际开始时间+预设时间 -->
                            <el-table-column prop="targetTime" label="阶段目标时间" width="110">
                            </el-table-column>

                            <!-- 目标完成时间：实际开始时间+预设时间+外界因素延期 -->
                            <el-table-column prop="standardTime" label="目标完成时间" width="110">
                            </el-table-column>

                            <!-- 理想完成时间：所有流程都正常结束的时间 -->
                            <el-table-column prop="ideaTime" label="预计完成时间" width="110">
                            </el-table-column>

                            <el-table-column prop="finishTime" label="实际结束时间" width="110">
                            </el-table-column>

                            <el-table-column prop="planDays" label="计划时间" width="110">
                            </el-table-column>

                            <el-table-column prop="unforcedDays" label="外界因素延期" width="110">
                            </el-table-column>

                            <el-table-column prop="applyDelay" label="人为因素延期" width="110">
                            </el-table-column>

                            <el-table-column prop="status" label="执行状态" width="100"
                                :filters="[{ text: '正在执行', value: '正在执行' }, { text: '正常完成', value: '正常完成' }, { text: '已延误', value: '已延误' }, { text: '延误完成', value: '延误完成' }]"
                                :filter-method="filterTag" filter-placement="bottom-end">
                                <template slot-scope="scope">
                                    <el-tag :type="showtype(scope.row.status)" disable-transitions>{{
                                        number2status(scope.row.status)
                                    }}</el-tag>
                                </template>

                            </el-table-column>

                            <el-table-column label="操作" width="180">
                                <template slot-scope="scope">
                                    <el-tooltip effect="dark" content="查看备注" placement="top" :enterable="false">
                                        <el-button type="info" size="mini" icon="el-icon-info" round
                                            @click="openCommitView(scope.row)"></el-button>
                                    </el-tooltip>
                                    <el-tooltip effect="dark" content="开始阶段" placement="top" :enterable="false"
                                        v-if="scope.row.startTime === null">
                                        <el-button type="success" size="mini" icon="el-icon-success" round
                                            @click="openCommitView(scope.row)"></el-button>
                                    </el-tooltip>
                                    <el-tooltip effect="dark" content="编辑阶段" placement="top" :enterable="false">
                                        <el-button type="primary" size="mini" icon="el-icon-edit" round
                                            @click="openCommitView(scope.row)"></el-button>
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
                    <el-dialog title="备注信息" :visible.sync="commitVisible" width="30%" @close="closeCommitDialog">
                        <el-form ref="commitFormRef" :model="commitForm" :rules="rules">
                            <!-- 子流程名称显示 -->
                            <el-form-item label='子流程：'>
                                <el-form-item :label="commitForm.subName"></el-form-item>
                            </el-form-item>
                            <el-form-item label="备注信息">
                            </el-form-item>
                            <!-- 备注显示区域 -->
                            <el-form-item>
                                <el-card class="box-card">
                                    <div v-for="o in commitForm.content" :key="o" class="text item">
                                        {{ o }}
                                    </div>
                                    <label v-if="commitForm.content.length === 0">暂无备注</label>
                                </el-card>
                            </el-form-item>
                            <!-- 备注增加 现在的设计是，只有特定的人员去填写备注-->
                            <el-form-item prop="newContent" label="增加备注:"
                                v-if="user.type === 1">
                                <el-input type="textarea" v-model="commitForm.newContent"></el-input>
                            </el-form-item>
                        </el-form>
                        <span slot="footer" class="dialog-footer">
                            <el-button type="primary" @click="submitCommitForm"
                                v-if="user.type === 1">提交</el-button>
                            <el-button @click="commitVisible = false">取 消</el-button>
                        </span>
                    </el-dialog>
                    <!-- 显示修改框 -->
                </div>
            </div>
        </el-card>
        <!-- <CaseSubTable :subInfo="subInfo" :caseName="caseName"></CaseSubTable> -->
    </div>
</template>

<script>
import { formatDate, getStatus, timeAdd } from '@/utils/common'
import { getSubList, getSubByUserId } from '@/api/caseSub'
import { mapState } from 'vuex'
import { removeDirector } from '@/api/caseSubUser'
import { getDelayByStatus } from '@/api/caseDelayApply'
import { getById, saveCommit } from '@/api/caseSubCommit';

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
            }
        }
    },
    computed: {
        ...mapState(['user'])
    },
    created() {
        this.caseId = this.$route.query.caseId
        this.caseName = this.$route.query.caseName
        this.getSubInfo(this.$route.query.caseId)
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
                else
                    this.subInfo[i].ideaTime = timeAdd(this.subInfo[i - 1].ideaTime, this.subInfo[i].planDays)
                //实际完成时间
                this.subInfo[i].finishTime = formatDate(this.subInfo[i].finishTime)
                this.subInfo[i].status = getStatus(this.subInfo[i].startTime, this.subInfo[i].standardTime, this.subInfo[i].finishTime)
            }
            this.pieInfo = this.subInfo
        },
        //显示负责人手头的子流程
        async handleDoubleClick(row, column) {
            if (column.label === '外界因素延期') {
                this.getUnforcedDays(row)
            } else if (column.label === '人为因素延期')
                this.getApplyDelay(row)

        },
        async getUnforcedDays(row) {
            var res = await getDelayByStatus({ caseSubId: row.id, status: 1, type: '外界因素延期' })
            this.delayList = res.data
            this.delayList.map(item => item.predictTime = formatDate(item.predictTime))
            this.delayDrawer = true
        },
        async getApplyDelay(row) {
            var res = await getDelayByStatus({ caseSubId: row.id, status: 1, type: '人为因素延期' })
            this.delayList = res.data
            this.delayList.map(item => item.predictTime = formatDate(item.predictTime))
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
                this.userInfo[i].presetTime = formatDate(presetTime.setDate(presetTime.getDate() + this.userInfo[i].planDays))
                this.userInfo[i].status = getStatus(this.userInfo[i].startTime, this.userInfo[i].presetTime, this.userInfo[i].finishTime)
                this.userInfo[i].deadLine = Math.floor(this.userInfo[i].status == 0 ? (new Date(this.userInfo[i].presetTime) - new Date().setHours(0, 0, 0, 0)) / (1000 * 3600 * 24) :
                    (new Date(new Date().setHours(0, 0, 0, 0) - new Date(this.userInfo[i].presetTime))) / (1000 * 3600 * 24))
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
        async openCommitView(caseSub) {
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