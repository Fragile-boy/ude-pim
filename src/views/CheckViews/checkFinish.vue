<template>
    <div>
        <!-- 面包屑导航区域 -->
        <div>
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>审批流程</el-breadcrumb-item>
                <el-breadcrumb-item>完结申请</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <el-card v-if="checkHistoryVisible === false">
            <div class="btns">
                <el-row>
                    <el-col :span="4" :offset="9">
                        <h1>审核完结申请</h1>
                    </el-col>
                    <el-col :span="2" :offset="9">
                        <el-button type="info" icon="el-icon-s-order" @click="openHistory()"> 历史记录 </el-button>
                    </el-col>
                </el-row>
            </div>
            <el-table :data="finishList" style="width: 100%" @cell-dblclick="handleDoubleClick"
                :cell-class-name="cellClassName" :row-class-name="rowClassName" size="small">
                <el-table-column label="类型" width="100">
                    <template slot-scope="scope">
                        <el-tag effect="dark" type="success" v-if="scope.row.caseSubId !== null && scope.row.type!==3">专案类</el-tag>
                        <el-tag effect="dark" v-else-if="scope.row.type === 2">技术研究</el-tag>
                        <el-tag effect="dark" type="warning" v-else-if="scope.row.type === 1">临时事务</el-tag>
                        <el-tag effect="dark" type="danger" v-else-if="scope.row.type === 3">微阶段</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="description" label="描述" min-width="150" show-overflow-tooltip>
                </el-table-column>
                <el-table-column label="开始时间" width="100">
                    <template slot-scope="scope">
                        {{ scope.row.startTime ? scope.row.startTime.split(' ')[0] : '-' }}
                    </template>
                </el-table-column>
                <el-table-column label="申请完结时间" width="100">
                    <template slot-scope="scope">
                        {{ scope.row.applyTime ? scope.row.applyTime.split(' ')[0] : '-' }}
                    </template>
                </el-table-column>
                <el-table-column prop="estimateValue" label="预计积分" width="80">
                </el-table-column>
                <el-table-column prop="planDays" label="计划时间" width="70">
                </el-table-column>
                <el-table-column label="工作负荷" width="70">
                    <template slot-scope="scope">
                        {{ scope.row.estimatedWorkload || '-' }}
                    </template>
                </el-table-column>
                <el-table-column prop="executionDays" label="执行时间" width="70">
                </el-table-column>
                <el-table-column prop="unforcedDays" label="外因延期" width="70">
                </el-table-column>
                <el-table-column prop="applyName" label="申请人" width="70">
                </el-table-column>
                <el-table-column label="申请创建时间" width="100">
                    <template slot-scope="scope">
                        {{ scope.row.createTime ? scope.row.createTime.split(' ')[0] : '-' }}
                    </template>
                </el-table-column>
                <el-table-column label="备注" width="60">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-info" size="mini" round @click="showCommit(scope.row)"
                            v-if="scope.row.caseSubId">备注</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="150" fixed="right">
                    <template slot-scope="scope">
                        <el-button type="success" @click="handleCheck(scope.row, 1)" size="mini" round>通过</el-button>
                        <el-button type="primary" @click="handleCheck(scope.row, 2)" size="mini" round>拒绝</el-button>
                    </template>
                </el-table-column>
            </el-table>
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
                <el-table-column label="累计时长">
                    <template slot-scope="scope">
                        <el-input v-model="scope.row.duration" type="number" placeholder="累计时长"></el-input>
                    </template>
                </el-table-column>
                <el-table-column label="获得积分">
                    <template slot-scope="scope">
                        <el-input :value="scope.row.value * 1.0 / 100 * curObj.estimateValue" disabled></el-input>
                    </template>
                </el-table-column>
            </el-table>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDirectorRate = false">取 消</el-button>
                <el-button type="primary" @click="submitDirectorRate()">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 显示审核记录的图层 -->
        <el-card v-if="checkHistoryVisible">
            <el-page-header @back="checkHistoryVisible = false" content="完结审核历史记录"></el-page-header>
            <el-table :data="checkedApplyList" style="width: 100%">
                <el-table-column label="结果">
                    <template slot-scope="scope">
                        <el-tag effect="dark" type="success" v-if="scope.row.status === 1">通过</el-tag>
                        <el-tag effect="dark" type="danger" v-else-if="scope.row.status === 2">拒绝</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="类型">
                    <template slot-scope="scope">
                        <el-tag effect="dark" type="success" v-if="scope.row.caseSubId !== null">专案类</el-tag>
                        <el-tag effect="dark" v-else-if="scope.row.type === 2">技术研究</el-tag>
                        <el-tag effect="dark" type="warning" v-else-if="scope.row.type === 1">临时事务</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="description" label="描述">
                </el-table-column>

                <el-table-column prop="rejectReason" label="拒绝原因">
                </el-table-column>
                <el-table-column prop="applyName" label="申请人">
                </el-table-column>
                <el-table-column prop="applyTime" label="申请时间">
                </el-table-column>
                <el-table-column prop="createTime" label="申请创建时间">
                </el-table-column>

                <el-table-column prop="checkName" label="审核人">
                </el-table-column>
                <el-table-column prop="checkTime" label="审核时间">
                </el-table-column>
            </el-table>
            <el-pagination style="margin-top: 10px;" @size-change="handleSizeChange"
                @current-change="handleCurrentChange" :current-page="queryInfo.page" :page-sizes="[5, 8, 10, 15]"
                :page-size="queryInfo.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>

        <!-- 显示备注框 -->
        <el-dialog title="备注信息" :visible.sync="commitVisible" width="40%">
            <el-form ref="commitFormRef" :model="commitForm" label-width="100px">
                <el-form-item label="专案">
                    <el-input v-model="commitForm.caseName" disabled></el-input>
                </el-form-item>
                <!-- 子流程名称显示 -->
                <el-form-item label="阶段">
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
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="commitVisible = false">返 回</el-button>
            </span>
        </el-dialog>

        
        <el-drawer direction="ltr" :visible.sync="delayDrawer" :with-header="false" size="50%">
            <el-table :data="delayList" style="font-size:20px">
                <el-table-column label="延期原因" width="550">
                    <template slot-scope="scope">
                        <div style="white-space: pre-line;">
                            {{ scope.row.applyReason }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="applyDays" label="延期天数">
                </el-table-column>
                <el-table-column prop="delayType" label="延期类型">
                </el-table-column>
            </el-table>
        </el-drawer>

        <el-dialog 
            title="设置微任务影响系数" 
            :visible.sync="showImpactDialog"
            width="30%">
            <div>
                <p>微阶段有效时间: {{ minTime }}天</p>
                <el-form label-width="120px">
                <el-form-item label="影响系数">
                    <el-slider 
                    v-model="tempCoefficient"
                    :min="0"
                    :max="1"
                    :step="0.05"
                    show-input
                    @input="calculateImpact">
                    </el-slider>
                </el-form-item>
                <el-form-item label="计算结果">
                    <el-input readonly :value="`${impactDays} 天`"></el-input>
                </el-form-item>
                </el-form>
            </div>
            <span slot="footer">
                <el-button @click="showImpactDialog = false">取消</el-button>
                <el-button type="primary" @click="submitCommit()">确定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { getFinishApplyList, judgeFinishApply, endHistory } from '@/api/caseFinishApply'
import { getDelayById } from '@/api/caseDelayApply'
import { mapActions, mapState } from 'vuex'
import { formatDate } from '@/utils/common'
import { countUser, submitDirectorValue } from '@/api/caseSubUser'
import { getById } from '@/api/caseSubCommit'
import { getCaseId } from '@/api/caseSub'
export default {
    data() {
        return {
            tableData: [],
            editDirectorRate: false,
            curObj: {},
            directorList: [],
            //审核记录
            checkHistoryVisible: false,
            queryInfo: {
                page: 1,
                pageSize: 5
            },
            total: 0,
            //已审核的列表
            checkedApplyList: [],
            commitVisible: false,
            commitForm: {
                caseName: '',
                subName: '',
                content: []
            },
            // 外界因素延期时间
            delayList:null,
            delayDrawer:false,
            // 微阶段影响系数
            tempCoefficient: 0.6,
            showImpactDialog: false,
            minTime: 0,
            impactDays: 0
        }
    },
    computed: {
        ...mapState(['user']),
        ...mapState('apply', ['finishList'])
    },
    created() {
        const pageSize = +localStorage.getItem("pim_check_finish_pageSize")
        this.queryInfo.pageSize = pageSize === 0 ? 5 : pageSize
        this.getFinish()
    },
    methods: {
        ...mapActions('apply', ['getFinish']),
        openImpactDialog() {
            // 2026.1.8 微阶段计算影响天数的基数从计划时间修改为工作负荷
            this.minTime = Math.min(this.curObj.estimatedWorkload, this.curObj.executionDays)
            this.impactDays = (this.minTime * this.tempCoefficient).toFixed(0)
            this.showImpactDialog = true
        },
        calculateImpact(){
            this.impactDays = Math.ceil(this.minTime * this.tempCoefficient)
        },
        //
        async submitCommit() {
            this.curObj.impactCoefficient = this.tempCoefficient
            this.curObj.impactDays = this.impactDays
            const res = await judgeFinishApply(this.curObj);
            if (res.code === 200) {
                this.$message.success(res.data);
                setTimeout(() => this.getFinish(), 500);
                this.showImpactDialog = false
            } else {
                this.$message.error(res.msg);
            }
        },
        async handleCheck(row, status) {
            row.status = status
            row.checkUser = this.user.id
            // 避免预计积分错误的时候，无法拒绝或者通过
            if (row.estimateValue === "错误！")
                row.estimateValue = null
            this.curObj = { ...row }
            console.log(this.curObj)
            //通过
            if (status === 1) {
                if(row.estimateValue===null||row.estimateValue<0){
                    this.$message.error("预计积分错误，请检查执行时间等信息是否正常！")
                    return
                }
                //意味着这是一个任务
                if (row.type !== null) {
                    // 如果是微任务(type=3)，需要额外输入影响系数
                    if (row.type === 3) {
                        this.openImpactDialog()   
                    } else {
                        // 非微任务直接确认
                        this.$confirm('您正在通过该任务的完结申请, 是否继续?', '提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'warning'
                        }).then(async () => {
                            const res = await judgeFinishApply(this.curObj);
                            if (res.code === 200) {
                                this.$message.success(res.data);
                                setTimeout(() => this.getFinish(), 500);
                            } else {
                                this.$message.error(res.msg);
                            }
                        }).catch(() => {
                            this.$message({
                                type: 'info',
                                message: '已取消操作'
                            });
                        });
                    }
                    return;
                }
                //打开界面，获取信息
                const res = await countUser(row.caseSubId)
                if (res.code !== 200) {
                    this.$message.error(res.msg)
                    return
                }
                this.directorList = res.data
                // 仅有一个负责人
                if (this.directorList.length === 1) {
                    this.directorList[0].value = 100
                    const res = await submitDirectorValue(this.directorList)
                    if (res.code !== 200) {
                        this.$message.error(res.msg)
                        return
                    }
                    // 给个提示
                    this.$message.success(res.data)
                    this.$confirm('您正在通过该阶段的完结申请, 是否继续?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(async () => {
                        const res = await judgeFinishApply(this.curObj)
                        if (res.code === 200) {
                            this.$message.success(res.data)
                            setTimeout(() => this.getFinish(), 500)
                        } else {
                            this.$message.error(res.msg)
                        }
                    }).catch(() => {
                        this.$message({
                            type: 'info',
                            message: '已取消操作'
                        });
                    });
                } else {
                    this.editDirectorRate = true
                }
            } else if (status === 2) {
                this.$prompt('请输入原因', '您正在拒绝申请', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                }).then(async ({ value }) => {
                    if (value === '' || value === null) {
                        this.$message.error("请输入拒绝原因")
                        return
                    }
                    row.status = status
                    row.checkUser = this.user.id
                    row.rejectReason = value
                    const res = await judgeFinishApply(row)
                    if (res.code === 200) {
                        this.$message.success(res.data)
                        setTimeout(() => this.getFinish(), 500)
                    } else {
                        this.$message.error(res.msg)
                    }
                }).catch(() => {
                    //如果点击取消，则什么也不做
                    return
                })
            }
        },
        //提交积分比例（插入比例数据，修改子流程完结状态）
        async submitDirectorRate() {
            const res = await submitDirectorValue(this.directorList)
            if (res.code === 200) {
                this.$message.success(res.data)
                this.editDirectorRate = false
                this.$confirm('您正在通过该阶段的完结申请, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(async () => {
                    const res = await judgeFinishApply(this.curObj)
                    if (res.code === 200) {
                        this.$message.success(res.data)
                        setTimeout(() => this.getFinish(), 500)
                    } else {
                        this.$message.error(res.msg)
                    }
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消操作'
                    });
                });
            } else {
                this.$message.error(res.msg)
                return
            }
        },
        openHistory() {
            this.checkHistoryVisible = true
            this.checkHistory()
        },
        async checkHistory() {
            const res = await endHistory(this.queryInfo)
            this.total = res.data.total
            this.checkedApplyList = res.data.records
        },
        handleSizeChange(value) {
            localStorage.setItem("pim_check_finish_pageSize", value)
            this.queryInfo.pageSize = value
            this.queryInfo.page = 1
            this.checkHistory()
        },
        handleCurrentChange(value) {
            this.queryInfo.page = value
            this.checkHistory()
        },
        openCaseSubDetail(row) {
        },
        async showCommit(row) {
            this.commitVisible = true
            var names = row.description.split("->")
            this.commitForm.caseName = names[0]
            this.commitForm.subName = names[1]
            // 获取专案子流程对应的所有备注
            var res = await getById(row.caseSubId)
            if (res.code == 200) {
                res = res.data
                //备注数组必须清空，否则会叠加
                this.commitForm.content = []
                for (var i = 0; i < res.length; i++) {
                    this.commitForm.content.push(res[i].content)
                }
            } else
                this.$message.error(res.msg)
        },
        async handleDoubleClick(row, column) {
            // 跳转子流程详情界面
            if (column.label === '描述') {
                if (row.caseSubId) {
                    var res = await getCaseId(row.caseSubId)
                    if (res.code == 200) {
                        res = res.data
                    } else {
                        this.$message.error(res.msg)
                        return
                    }
                    this.$router.push({
                        name: '子流程详情',
                        query: {
                            caseName: row.description.split("->")[0],
                            caseId: res
                        }
                    })
                }
            }else if(column.label==="外界因素延期"){
                this.showDelay(row, "外界因素延期")
            }
        },
        // 2024-6-17 显示不可抗力延期
        async showDelay(row, delayType) {
            var res = await getDelayById({ caseSubId: row.caseSubId, taskId: row.taskId, delayType: delayType })
            this.delayList = res.data
            this.delayDrawer = true
        },
        cellClassName({ row, column, rowindex, columnIndex }) {
            if(column.label==='预计积分'&&row.estimateValue==-1.0){
                return 'warning-row'
            }
            if (column.label === '申请完结时间' || column.label === '预计积分') {
                return 'heightLight'
            }
        }
    }
}
</script>

<style scoped>
.el-table>>>.heightLight {
    background: #60E5E5;
    animation: blink 0.6s linear 2;
}

@keyframes blink {
    0% {
        background: #fff;
    }

    50% {
        background: #96E8E8;
    }

    100% {
        background: #60E5E5;
    }
}

/* 红色背景 + 白色文字 */
.el-table>>>.warning-row {
  background-color: #f47c7f !important;  /* 浅红色背景 */
}
</style>