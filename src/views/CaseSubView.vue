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
        <el-card class="table">
            <el-row class="align-items-center">
                <el-col :span="6">
                    <el-page-header @back="$router.back()" :content="caseName"></el-page-header>
                </el-col>
                <el-col :span="2">
                    <span style="font-size:25px;padding-left: 17px;">专案进度</span>
                </el-col>
                <el-col :span="6">
                    <el-progress :stroke-width="26" :percentage="casePercentage" :color="caseScheduleColor"
                        define-back-color="#ebeef5" style="white-space: nowrap;">
                    </el-progress>
                </el-col>
                <el-col :span="2">
                    <span style="font-size:25px;padding-left: 17px;">时间进度</span>
                </el-col>
                <el-col :span="6">
                    <el-progress :stroke-width="26" :percentage="caseSchedulePercentage" :color="scheduleColor"
                        define-back-color="#ebeef5" style="white-space: nowrap;">
                    </el-progress>
                </el-col>
                <el-col :span="2">
                    <span style="margin-left: 30px; font-size:18px; color:#60626b"> {{ scheduleText() }}
                    </span>
                </el-col>
            </el-row>
            <div class="tableInfo">
                <el-table row-key="id" :expand-row-keys="expandRowKeys" :cell-style="setCellColor" :data="subInfo" stripe
                    border @cell-dblclick="handleDoubleClick">

                    <el-table-column type="expand">
                        <template slot-scope="scope">
                            <el-row v-for="(item, index) in scope.row.chargeName" :key="item">
                                <el-col :span="2">
                                    <el-tag class="chargeNameTag" @click="getCaseByUserId(scope.row.chargeId[index], item)">
                                        {{ item }}
                                    </el-tag>

                                </el-col>

                                <el-col :span="6">
                                    <el-tag
                                        v-if="scope.row.desc.length !== 0 && scope.row.desc[index] !== null && scope.row.desc[index] !== ''"
                                        type="warning" class="chargeNameTag">
                                        工作描述:{{ (scope.row.desc[index]) }}
                                    </el-tag>

                                </el-col>

                                <el-col :span="3">
                                    <el-tag
                                        v-if="scope.row.directorRate.length !== 0 && scope.row.directorRate[index] !== null"
                                        type="warning" class="chargeNameTag">
                                        时间占比：{{ (scope.row.directorRate[index]).toFixed() }} %
                                    </el-tag>
                                </el-col>

                                <el-col :span="3">
                                    <el-tag v-if="scope.row.directorRate.length !== 0" type="warning" class="chargeNameTag">
                                        积分：{{ ((scope.row.directorRate[index] * scope.row.value * 1.0) /
                                            100).toFixed(2)
                                        }}
                                    </el-tag>
                                </el-col>
                            </el-row>
                            <el-tag v-if="scope.row.chargeId.length === 0">暂无负责人</el-tag>
                        </template>
                    </el-table-column>

                    <el-table-column label="操作" width="180">
                        <template slot-scope="scope">
                            <el-tooltip effect="dark" content="查看备注" placement="top" :enterable="false">
                                <el-button type="info" size="mini" icon="el-icon-info" round
                                    @click="openCommentView(scope.row)"></el-button>
                            </el-tooltip>
                            <el-tooltip effect="dark" content="开始阶段" placement="top" :enterable="false"
                                v-if="(user.type === 1 || scope.row.chargeId.includes(user.id)) && scope.row.startTime === null">
                                <el-button type="success" size="mini" icon="el-icon-video-play" round
                                    @click="launch(scope.row)"></el-button>
                            </el-tooltip>
                            <el-tooltip effect="dark" content="结束阶段" placement="top" :enterable="false"
                                v-if="user.type === 1 && scope.row.startTime !== null && scope.row.finishTime === null">
                                <el-button type="danger" size="mini" icon="el-icon-success" round
                                    @click="finish(scope.row)"></el-button>
                            </el-tooltip>
                            <el-tooltip effect="dark" content="编辑阶段" placement="top" :enterable="false">
                                <el-button v-if="user.type === 1" type="primary" size="mini" icon="el-icon-edit" round
                                    @click="openEditCaseSub(scope.row)"></el-button>
                            </el-tooltip>
                            <el-tooltip
                                v-if="user.type === 1 && scope.row.startTime !== null && scope.row.finishTime !== null && scope.row.chargeId.length !== 0"
                                effect="dark" content="分配比例" placement="top" :enterable="false">
                                <el-button type="warning" size="mini" icon="el-icon-setting" round
                                    @click="initEditDirectorRate(scope.row)"></el-button>
                            </el-tooltip>
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
                            <el-tag effect="dark" type="primary" v-if="scope.row.status === 0">正在执行</el-tag>
                            <el-tag effect="dark" type="success" v-if="scope.row.status === 1">正常完成</el-tag>
                            <el-tag effect="dark" type="danger" v-if="scope.row.status === 2">已延误</el-tag>
                            <el-tag effect="dark" type="warning" v-if="scope.row.status === 3">延误完成</el-tag>
                            <el-tag effect="dark" type="info" v-if="scope.row.status === 4">未开始</el-tag>
                        </template>

                    </el-table-column>

                </el-table>
                <!-- 翻页按钮 -->
                <el-row style="margin-bottom:-20px">
                    <el-col :span="1"><el-button round type="primary" icon="el-icon-back"
                            @click="turnPage(-1)"></el-button></el-col>
                    <el-col :span="1" :offset="22"><el-button round type="primary" icon="el-icon-right"
                            @click="turnPage(1)"></el-button></el-col>
                </el-row>
            </div>


        </el-card>

        <!-- 甘特图显示区域 -->
        <el-card>
            <div id="ganttChart" style="width: 100%; height: 1000px;"></div>
        </el-card>

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
                    <el-table-column prop="status" label="执行状态">
                        <template slot-scope="scope">
                            <el-tag effect="dark" type="primary" v-if="scope.row.status === 0">正在执行</el-tag>
                            <el-tag effect="dark" type="success" v-if="scope.row.status === 1">正常完成</el-tag>
                            <el-tag effect="dark" type="danger" v-if="scope.row.status === 2">已延误</el-tag>
                            <el-tag effect="dark" type="warning" v-if="scope.row.status === 3">延误完成</el-tag>
                            <el-tag effect="dark" type="info" v-if="scope.row.status === 4">未开始</el-tag>
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
                <el-form-item prop="newContent" label="增加备注" v-if="user.type === 1 || user.status === 2">
                    <el-input type="textarea" v-model="commitForm.newContent"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="submitCommitForm"
                    v-if="user.type === 1 || user.status === 2">提交</el-button>
                <el-button @click="commitVisible = false">取 消</el-button>
            </span>
        </el-dialog>

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
                <el-table-column label="获得积分">
                    <template slot-scope="scope">
                        <el-input :value="scope.row.value * 1.0 / 100 * curCaseSubObj.value" placeholder="工作内容"
                            disabled></el-input>
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
                    <el-col :span="21">
                        <el-form-item label="外界延期">
                            <el-input disabled v-model="curCaseSubObj.unforcedDays"></el-input>
                        </el-form-item>
                    </el-col>
                    <!-- 添加外界因素延期 -->
                    <el-col :span="2" :offset="1">
                        <el-tooltip class="item" effect="dark" content="添加外界因素延期" placement="top">
                            <el-button icon="el-icon-plus" type="primary" size="medium" round
                                @click="applyDelayVisible = true, addDelayFlag = true, editDelayFlag = false"></el-button>
                        </el-tooltip>
                    </el-col>
                </el-row>

                <el-table :data="delayList" style="width: 100%;margin-bottom: 5px;" border>
                    <el-table-column prop="caseName" label="专案">
                    </el-table-column>
                    <el-table-column prop="subName" label="阶段">
                    </el-table-column>
                    <el-table-column prop="type" label="延期类型">
                    </el-table-column>
                    <el-table-column prop="applyReason" label="延期原因">
                    </el-table-column>
                    <el-table-column prop="applyDays" label="申请天数">
                    </el-table-column>
                    <el-table-column prop="predictTime" label="预计完成时间" width="120">
                    </el-table-column>
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-tooltip class="item" effect="dark" content="编辑" placement="top">
                                <el-button icon="el-icon-edit" type="primary" size="mini" round
                                    @click="editDelay(scope.row)">
                                </el-button>
                            </el-tooltip>
                            <el-tooltip class="item" effect="dark" content="删除" placement="top">
                                <el-button icon="el-icon-delete" type="danger" size="mini" round
                                    @click="deleteDelay(scope.row)">
                                </el-button>
                            </el-tooltip>
                        </template>
                    </el-table-column>
                </el-table>

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

        <!-- 管理员添加外界因素延期 -->
        <el-dialog title="申请延期" :visible.sync="applyDelayVisible" width="30%" @close="closeApplyDelay">
            <el-form ref="applyDelayFormRef" :rules="delayRules" :model="delayApplyObject" label-width="90px" class="form">
                <el-form-item label="专案">
                    <el-input :value="curCaseSubObj.caseName" disabled></el-input>
                </el-form-item>

                <el-form-item label="阶段">
                    <el-input :value="curCaseSubObj.subName" disabled></el-input>
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

                <el-form-item label="预计完成" v-if="delayApplyObject.applyDays > 0">
                    <el-input :value="presetTime" disabled></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="applyDelayVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitDelayApply()" v-if="addDelayFlag">确 定</el-button>
                <el-button type="primary" @click="updateDelayApply()" v-if="editDelayFlag">修 改</el-button>
            </span>
        </el-dialog>

        <!-- 完结阶段的时候选择日期窗口 -->
        <el-dialog title="选择完结日期" :visible.sync="pickFinishTime.pickFinishTimeVisible" width="30%">
            <el-date-picker v-model="pickFinishTime.preFinishTime" type="date" placeholder="选择完结日期"
                value-format="yyyy-MM-dd HH:mm:ss">
            </el-date-picker>
            <span slot="footer" class="dialog-footer">
                <el-button @click="pickFinishTime.pickFinishTimeVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitFinishInfo()">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 开始阶段的时候选择日期窗口 -->
        <el-dialog title="选择开始日期" :visible.sync="pickStartTime.pickStartTimeVisible" width="30%">
            <el-date-picker v-model="pickStartTime.preStartTime" type="date" placeholder="选择开始日期"
                value-format="yyyy-MM-dd HH:mm:ss">
            </el-date-picker>
            <span slot="footer" class="dialog-footer">
                <el-button @click="pickStartTime.pickStartTimeVisible = false">取 消</el-button>
                <el-button type="primary" @click="launchSub()">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { formatDate, getStatus, timeAdd, timeSub } from '@/utils/common'
import { getSubList, getSubByUserId, updateCaseSub, startOrFinish } from '@/api/caseSub'
import { mapState } from 'vuex'
import { removeDirector, countUser, setDirector, submitDirectorValue } from '@/api/caseSubUser'
import { getDelayByStatus, saveApply, updateDelay, deleteDelay } from '@/api/caseDelayApply'
import { getById, saveCommit } from '@/api/caseSubCommit';
import { getUserListWithAssistants } from '@/api/user'
import { getPresetDay } from '@/api/sub'

export default {
    data() {
        var checkDays = (rule, value, callback) => {
            if (value <= 0 || value > 15)
                callback(new Error("申请天数必须在1-15之间"))
            callback()
        }
        return {
            subInfo: [],
            caseName: '',
            caseId: null,
            // 当前专案在caseM的列表中的下标，用于切换专案
            caseIndex: null,
            // 专案计划时间和执行时间信息
            casePlanDays: 0,
            caseUnforcedDays: 0,
            caseExecutionDays: 0,
            caseFinishDays: 0,
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
                },
                {
                    value:2,
                    label:'IE',
                    children:[]
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
            directorList: [],
            //显示申请延期界面
            applyDelayVisible: false,
            //延期规则
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
            //延期信息
            delayApplyObject: {
                delayType: '外界因素延期'
            },
            addDelayFlag: false,
            editDelayFlag: false,
            //预计时间
            presetTime: '',
            //原来的申请，用于修改时确认新的预计完成时间
            oldApplyDays: '',
            // 展开行的数组
            expandRowKeys: [],
            // 选择结束时间
            pickFinishTime: {
                // 准备结束的子流程id
                preFinishCaseSubId: null,
                // 准备结束的子流程选择窗口显示
                pickFinishTimeVisible: null,
                // 准备结束的子流程选择日期
                preFinishTime: null,
            },
            // 选择开始时间
            pickStartTime: {
                // 准备结束的子流程id
                preStartCaseSubId: null,
                // 准备结束的子流程选择窗口显示
                pickStartTimeVisible: null,
                // 准备结束的子流程选择日期
                preStartTime: null,
            },
            gantt: null,
            // 进度
            casePercentage: 0,
            // 时间进度
            caseSchedulePercentage: 0,
        }
    },
    computed: {
        ...mapState(['user']),
        ...mapState('caseM', ['caseList'])
    },
    created() {
        this.caseId = this.$route.query.caseId
        this.caseName = this.$route.query.caseName

        //获取所有负责人
        this.getAllUser()
        // 获取专案在列表中的下标
        for (var i = 0; i < this.caseList.length; i++) {
            if (this.caseList[i].id === this.caseId) {
                this.caseIndex = i
                break
            }
        }
    },
    async mounted() {
        await this.getSubInfo(this.$route.query.caseId)
        this.gantt = this.$echarts.init(document.getElementById('ganttChart'))
        this.showExecutionGantt()
    },
    methods: {
        //获取子流程的信息
        async getSubInfo(caseId) {
            // 初始化统计信息
            this.caseFinishDays = 0
            this.casePlanDays = 0
            this.caseExecutionDays = 0
            this.caseUnforcedDays = 0

            var res = await getSubList(caseId)
            this.subInfo = res.data
            
            // 获取是否含有程序编写，如果含有，则配电阶段积分不乘以2(31是程序编写的subId)
            var containProgramming = false
            for (let i = 0; i < this.subInfo.length; i++) {
                if(this.subInfo[i].subId===31){
                    containProgramming = true
                    break
                }
            }

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
                    this.subInfo[i].ideaTime = timeAdd(this.subInfo[i - 1].ideaTime, this.subInfo[i].planDays, 1)
                }
                //实际完成时间
                this.subInfo[i].finishTime = formatDate(this.subInfo[i].finishTime)
                this.subInfo[i].status = getStatus(this.subInfo[i].startTime, this.subInfo[i].standardTime, this.subInfo[i].finishTime)

                // 计算执行时间
                this.casePlanDays += this.subInfo[i].planDays
                // 计算完成的阶段时间总和
                this.caseFinishDays += this.subInfo[i].finishTime === null ? 0 : this.subInfo[i].planDays
                // 计算总外界因素延期时间
                this.caseUnforcedDays += this.subInfo[i].unforcedDays === null ? 0 : this.subInfo[i].unforcedDays

                //执行天数
                if (this.subInfo[i].startTime !== null) {
                    this.subInfo[i].executionDays = timeSub(this.subInfo[i].startTime, this.subInfo[i].finishTime === null ? new Date() : this.subInfo[i].finishTime)
                    // 减去外界因素延期(原excel表中就是使用的减去外界因素延期的执行时间，所以用该值去计算积分才符合原来的数据)
                    this.subInfo[i].executionDays -= this.subInfo[i].unforcedDays === null ? 0 : this.subInfo[i].unforcedDays

                    // 计算总执行时间
                    this.caseExecutionDays += this.subInfo[i].executionDays
                }

                //计算积分
                if (this.subInfo[i].finishTime !== null && this.subInfo[i].subId !== 7) {
                    this.subInfo[i].value = (this.subInfo[i].planDays * (this.subInfo[i].planDays * 1.0 / this.subInfo[i].executionDays) ** (2 / 3)).toFixed(2)
                    // if(this.subInfo[i].subName==='配電')
                    if (!containProgramming&&this.subInfo[i].subId === 9)
                        this.subInfo[i].value *= 2
                }
            }
            this.casePercentage = Math.ceil(this.caseFinishDays * 100.0 / this.casePlanDays)
            this.caseSchedulePercentage = this.caseExecutionDays > this.casePlanDays ? 100 : parseFloat((this.caseExecutionDays * 100.0 / this.casePlanDays).toFixed())
        },
        //显示负责人手头的子流程
        async handleDoubleClick(row, column) {
            if (column.label === '外界因素延期') {
                this.getUnforcedDays(row)
                this.delayDrawer = true
            } else if (column.label === '人为因素延期')
                this.getApplyDelay(row)
            else if (column.label === '积分') {
                if (this.expandRowKeys.length === 0)
                    this.expandRowKeys = this.subInfo.map(r => r.id); // 假设数据中的每一行有唯一的id属性
                else
                    this.expandRowKeys = [];
            }

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
                this.userInfo[i].presetTime = formatDate(presetTime.setDate(presetTime.getDate() + this.userInfo[i].planDays - 1))
                this.userInfo[i].status = getStatus(this.userInfo[i].startTime, this.userInfo[i].presetTime, this.userInfo[i].finishTime)
                //如果是还没有完成，时间相减正常算，如果已经延期，则要-1，比如9.2截止，9.1那天还剩2天，9.3那天延期1天
                this.userInfo[i].deadLine = this.userInfo[i].status === 0 ? timeSub(new Date(), this.userInfo[i].presetTime) : timeSub(this.userInfo[i].presetTime, new Date()) - 1
            }
            this.drawer = true
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
        finish(row) {
            // 多个负责人就弹出分配比例，先分配比例再结束
            if (row.chargeId.length !== 0)
                this.initEditDirectorRate(row)
            else {
                //没有负责人选择日期后直接结束
                this.pickFinishTime.pickFinishTimeVisible = true
                this.pickFinishTime.preFinishCaseSubId = row.id
            }
        },
        // 提交完结
        async submitFinishInfo() {
            if (this.curCaseSubObj.startTime > this.pickFinishTime.preFinishTime) {
                this.$message.error('结束时间不能小于开始时间')
                return
            }
            const res = await startOrFinish({ id: this.pickFinishTime.preFinishCaseSubId, finishTime: this.pickFinishTime.preFinishTime })
            if (res.code === 200) {
                this.$message.success(res.data)
                this.pickFinishTime.pickFinishTimeVisible = false
                this.getSubInfo(this.caseId)
            } else {
                this.$message.error(res.msg)
            }
        },
        //手动点了开始阶段
        async launch(row) {
            this.pickStartTime.pickStartTimeVisible = true
            this.pickStartTime.preStartCaseSubId = row.id
        },
        // 启动阶段
        async launchSub() {
            //直接开始
            var res = await startOrFinish({ id: this.pickStartTime.preStartCaseSubId, startTime: this.pickStartTime.preStartTime })
            if (res.code === 200) {
                this.$message.success(res.data)
                this.pickStartTime.pickStartTimeVisible = false
                this.getSubInfo(this.caseId)
            } else {
                this.$message.error(res.msg)
            }
        },
        //获取所有负责人
        async getAllUser() {
            const res = await getUserListWithAssistants()
            if (res.code === 200) {
                this.editUser = res.data
                res.data.forEach((item) => {
                    this.allUser[item.status].children.push(item)
                })
            } else
                this.$message.error(res.msg)
        },
        //打开编辑专案表单
        openEditCaseSub(row) {
            this.curCaseSubObj = { ...row }
            this.getUnforcedDays(row)
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
            // 仅有一个负责人，则比例默认置为100
            if (this.directorList.length === 1) {
                this.directorList[0].value = 100
            }
            this.editDirectorRate = true
        },
        //提交积分比例（插入比例数据，修改子流程完结状态）
        async submitDirectorRate() {
            // 2023.10.27 泽伟哥说取消限制积分必须是100%
            // if (sum !== 100) {
            //     this.$message.error("积分总和不为100，请检查积分比例")
            //     return
            // }
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
                    }).then(() => {
                        this.pickFinishTime.pickFinishTimeVisible = true
                        this.pickFinishTime.preFinishCaseSubId = this.curCaseSubObj.id
                    })
                } else {
                    this.getSubInfo(this.caseId)
                }
            } else
                this.$message.error(res.msg)
        },
        //设置单元格颜色
        setCellColor({ row, column, rowIndex, columnIndex }) {
            if (columnIndex === 5)
                return 'background-color:#fceadb'
            else if (columnIndex === 6)
                return 'background-color:#e1bbb8'
            else if (columnIndex === 7)
                return 'background-color:#C6DEF8'
            else if (columnIndex === 8)
                return 'background-color:#B9BFBF'
            else if (columnIndex === 9)
                return 'background-color:#B4EBB1'
        },
        //关闭申请延期窗口
        closeApplyDelay() {
            this.$refs.applyDelayFormRef.resetFields()
            this.delayApplyObject = {
                delayType: '外界因素延期'
            }
            this.presetTime = '',
                this.oldApplyDays = ''
        },
        //提交延期表单
        submitDelayApply() {
            this.$refs.applyDelayFormRef.validate(async (valid) => {
                if (valid) {
                    this.delayApplyObject.applyId = this.user.id
                    this.delayApplyObject.caseSubId = this.curCaseSubObj.id
                    const res = await saveApply(this.delayApplyObject)
                    if (res.code === 200 && res.data === "添加成功") {
                        this.$message.success(res.data)
                        this.applyDelayVisible = false
                        //修改延期时间和表格，作为页面不刷新的补偿
                        this.curCaseSubObj.unforcedDays = +this.curCaseSubObj.unforcedDays + +this.delayApplyObject.applyDays
                        this.getUnforcedDays(this.curCaseSubObj)
                        //重置表单对象属性
                        this.delayApplyObject = { delayType: '外界因素延期' }
                    } else
                        this.$message.error(res.msg)
                }
            })
        },
        //修改延期表单
        updateDelayApply() {
            this.$refs.applyDelayFormRef.validate(async (valid) => {
                if (valid) {
                    this.delayApplyObject.predictTime = null
                    const res = await updateDelay(this.delayApplyObject)
                    if (res.code === 200) {
                        this.$message.success(res.data)
                        this.applyDelayVisible = false
                        //修改延期时间和表格，作为页面不刷新的补偿
                        await this.getUnforcedDays(this.curCaseSubObj)
                        this.curCaseSubObj.unforcedDays = 0
                        this.delayList.forEach(item => this.curCaseSubObj.unforcedDays = this.curCaseSubObj.unforcedDays + +item.applyDays)
                    } else
                        this.$message.error(res.msg)
                }
            })
        },
        async deleteDelay(row) {
            this.$confirm('此操作将删除该延期申请, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {

                const res = await deleteDelay(row.id)
                if (res.code === 200) {
                    this.$message.success(res.data)
                    await this.getUnforcedDays(this.curCaseSubObj)
                    this.curCaseSubObj.unforcedDays = 0
                    this.delayList.forEach(item => this.curCaseSubObj.unforcedDays = this.curCaseSubObj.unforcedDays + +item.applyDays)
                }
            }).catch((error) => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                });

            })
        },
        editDelay(row) {
            this.addDelayFlag = false
            this.editDelayFlag = true
            const { id, delayType, applyReason, applyDays, predictTime } = row
            this.oldApplyDays = applyDays
            this.delayApplyObject = { id, delayType, applyReason, applyDays, predictTime }
            this.applyDelayVisible = true
        },
        //计算预计完成时间
        computePresetTime() {
            //修改模式下
            if (this.editDelayFlag) {
                var subDays = this.delayApplyObject.applyDays - this.oldApplyDays
                this.presetTime = formatDate(timeAdd(this.delayApplyObject.predictTime, subDays, 1))
            } else {
                this.presetTime = formatDate(timeAdd(this.curCaseSubObj.startTime, this.curCaseSubObj.planDays, this.curCaseSubObj.unforcedDays, this.delayApplyObject.applyDays))
            }
        },
        // 专案进度颜色显示
        caseScheduleColor() {
            if (this.caseFinishDays === this.casePlanDays) {
                return '#67c23a'
            } else if (this.caseFinishDays * 1.0 / this.casePlanDays > 0.6)
                return '#e6a23c'
            else
                return '#409eff'
        },
        // 专案时间进度颜色显示
        scheduleColor() {
            if (this.caseExecutionDays > this.casePlanDays) {
                return '#f56c6c'
            } else if (this.caseExecutionDays * 1.0 / this.casePlanDays > 0.6)
                return '#e6a23c'
            else
                return '#67c23a'
        },
        // 专案时间进度文字显示
        scheduleText() {
            if (this.caseExecutionDays >= this.casePlanDays) {
                return `延误${this.caseExecutionDays - this.casePlanDays}天`
            } else
                return `剩余${this.casePlanDays - this.caseExecutionDays}天`
        },
        // 显示执行甘特图
        showExecutionGantt() {
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
            execTime_end = this.initGanttObj(execTime_end, "bar1", false, "#FF7F50", 1, "完成/当前时间")

            // y轴标签
            var yAxis = []

            for (let i = this.subInfo.length - 1; i >= 0; i--) {
                if (this.subInfo[i].startTime === null)
                    continue
                planTime_start_0.data.push(new Date(this.subInfo[i].startTime))
                planTime_start_1.data.push(new Date(this.subInfo[i].startTime))
                planTime_end.data.push(new Date(this.subInfo[i].targetTime))
                standardTime.data.push(new Date(this.subInfo[i].standardTime))
                execTime_end.data.push(this.subInfo[i].finishTime === null ? new Date() : new Date(this.subInfo[i].finishTime))
                yAxis.push(this.subInfo[i].subName)
            }
            yAxis.push("计划工期")
            planTime_start_0.data.push(new Date(this.subInfo[0].startTime))
            planTime_start_1.data.push(new Date(this.subInfo[0].startTime))
            planTime_end.data.push(new Date(timeAdd(this.subInfo[0].startTime, this.casePlanDays)))
            standardTime.data.push(new Date(timeAdd(this.subInfo[0].startTime, this.casePlanDays, this.caseUnforcedDays)))
            execTime_end.data.push(new Date())


            dataSeries.push(planTime_start_0)
            dataSeries.push(planTime_start_1)
            dataSeries.push(planTime_end)
            dataSeries.push(standardTime)
            dataSeries.push(execTime_end)

            var option = {
                title: {
                    text: this.caseName,
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
                    data: ['开始时间', '预计完成时间', '目标完成时间', '完成/当前时间'],
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
                    type: 'time',
                    axisLabel: {
                        show: true,
                        interval: 5,
                        formatter: function (value) {
                            var data = new Date(value);
                            var year = data.getFullYear();
                            var month = data.getMonth() + 1;
                            var day = data.getDate();

                            if (day > 1) {
                                // 如果是天，字体大小为30
                                return '{fontSizeMini|' + day + '}';
                            } else if (month > 1) {
                                // 如果是月份，字体大小为原始大小
                                return '{fontSize|' + month + '月' + '}';
                            } else {
                                // 如果是年份，字体大小为原始大小
                                return '{fontSizeLarge|' + year + '年' + '}';
                            }
                        },
                        rich: {
                            fontSizeMini: {
                                fontSize: 20
                            },
                            fontSize: {
                                fontSize: 25
                            },
                            fontSizeLarge: {
                                fontSize: 30
                            }

                        },
                    },
                },
                yAxis: {
                    axisLabel: {
                        show: true,
                        interval: 0,
                        fontSize: 18, // 调整字体大小以提高可读性
                        color: '#555', // 轻微调暗颜色以降低视觉疲劳
                        fontWeight: "bolder"
                    },
                    data: yAxis,
                    type: 'category',
                    boundaryGap: true, // 确保条形图完全显示
                },
                tooltip: {
                    trigger: "axis",
                    formatter: function (params) {
                        var res = ''
                        res += params[0].axisValue + '<br/>';
                        var set = new Set()
                        for (var i = 0; i < params.length; i++) {
                            if(set.has(params[i].seriesName))
                                continue
                            set.add(params[i].seriesName)
                            res += '<div style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:' + params[i].color + ';"></div>' +
                                params[i].seriesName + '：' + formatDate(params[i].value) + '<br/>'
                        }
                        return res
                    }
                },
                series: dataSeries
            }
            this.gantt.setOption(option)
        },
        // 初始化甘特图对象
        initGanttObj(obj, stack, start, color, zlevel, name) {
            obj.name = name
            obj.stack = stack
            obj.type = "bar";
            // 表示结束时间
            if (zlevel <= 2) {
                obj.label = {
                    show: true,
                    color: "#333333",
                    position: "right",
                    fontSize: 18,
                    formatter: function (params) {
                        var data = new Date(params.value)
                        return data.getMonth() + 1 + "-" + data.getDate()
                    }
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
        // 翻页
        async turnPage(value) {
            this.caseIndex += value
            if (this.caseIndex < 0) {
                this.caseIndex = this.caseList.length - 1
            } else if (this.caseIndex >= this.caseList.length) {
                this.caseIndex = 0
            }
            this.caseId = this.caseList[this.caseIndex].id
            this.caseName = this.caseList[this.caseIndex].name
            await this.getSubInfo(this.caseId)
            this.showExecutionGantt()
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

.table {
    width: 100%;
}

.page_change {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 10px;
}

.align-items-center {
    display: flex;
    align-items: center;
}
</style>