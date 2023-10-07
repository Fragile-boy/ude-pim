<template>
    <div>
        <div>
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>专案管理</el-breadcrumb-item>
                <el-breadcrumb-item>任务管理</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <el-card>
            <!-- 筛选区域 -->
            <el-row>

                <el-col :span="2">
                    <el-button type="primary" icon="el-icon-circle-plus" @click="openAddTask()">新建任务</el-button>
                </el-col>

                <el-col :span="3" :offset="19">
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
            <el-table :data="taskList">
                <el-table-column label="类型">
                    <template slot-scope="scope">
                        <el-tag effect="dark" type="warning" v-if="scope.row.type === 1">临时事务</el-tag>
                        <el-tag effect="dark" type="primary" v-else-if="scope.row.type === 2">技术研究</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="description" label="描述"></el-table-column>
                <el-table-column prop="startTime" label="开始时间"></el-table-column>
                <el-table-column prop="finishTime" label="完成时间"></el-table-column>
                <el-table-column prop="planDays" label="计划时间"></el-table-column>
                <el-table-column prop="unforcedDays" label="外界因素延期"></el-table-column>
                <el-table-column prop="applyDelay" label="人为因素延期"></el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-tooltip class="item" effect="dark" content="任务详情" placement="right-start">
                            <el-button icon="el-icon-edit" type="primary" size="mini" round
                                @click="openTaskDetail(scope.row)">
                            </el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 修改图层 -->
        <el-dialog title="任务详情" :visible.sync="taskDetailVisible" width="30%">
            <el-form ref="editCaseSubRef" label-width="90px">
                <el-form-item label="描述">
                    <el-input type="textarea" v-model="curTaskObj.description"></el-input>
                </el-form-item>


                <el-row>
                    <el-col :span="10">
                        <el-form-item label="计划天数">
                            <el-input v-model="curTaskObj.planDays"></el-input>
                        </el-form-item>
                    </el-col>

                    <el-col :span="12" :offset="2">
                        <el-form-item label="负责人">
                            <el-select v-model="curTaskObj.director" placeholder="请选择科员" @change="handleUserChange()">
                                <el-option-group v-for="group in directorOptions" :key="group.value" :label="group.label">
                                    <el-option v-for="item in group.children" :key="item.value" :label="item.label"
                                        :value="item.value">
                                    </el-option>
                                </el-option-group>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>

                <!-- 开始时间 -->
                <el-form-item label="开始时间">
                    <el-date-picker v-model="curTaskObj.startTime" type="date" placeholder="开始日期">
                    </el-date-picker>
                </el-form-item>

                <!-- 结束时间 -->

                <el-form-item label="结束时间">
                    <el-date-picker v-model="curTaskObj.finishTime" type="date" placeholder="结束时间">
                    </el-date-picker>
                </el-form-item>

                <el-row>
                    <!-- 外界因素延期 -->
                    <el-col :span="12">
                        <el-form-item label="外界延期">
                            <el-input v-model="curTaskObj.unforcedDays"></el-input>
                        </el-form-item>
                    </el-col>
                    <!-- 人为因素延期 -->
                    <el-col :span="12">
                        <el-form-item label="人为延期">
                            <el-input v-model="curTaskObj.applyDelay"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="taskDetailVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitTaskChange()">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 新增任务图层 -->
        <el-dialog title="任务详情" :visible.sync="addTaskVisible" width="30%">
            <el-form ref="addTaskFormRef" :rules="applyTaskRules" :model="addTaskObj" label-width="80px">
                <el-form-item label="任务类型" prop="type">
                    <el-select v-model="addTaskObj.type" placeholder="请选择任务类型">
                        <el-option v-for="item in [{ label: '技术研究', value: 2 }, { label: '临时事务', value: 1 }]"
                            :key="item.value" :label="item.label" :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="任务描述" prop="description">
                    <el-input type="textarea" placeholder="请输入任务描述" v-model="addTaskObj.description"></el-input>
                </el-form-item>
                <el-form-item label="预估时间" prop="planDays">
                    <el-input type="number" placeholder="请输入预估完成时间（天）" v-model.number="addTaskObj.planDays"></el-input>
                </el-form-item>
                <el-form-item label="负责人" prop="director">
                    <el-select v-model="addTaskObj.director" placeholder="请选择科员">
                        <el-option-group v-for="group in directorOptions" :key="group.value" :label="group.label">
                            <el-option v-for="item in group.children" :key="item.value" :label="item.label"
                                :value="item.value">
                            </el-option>
                        </el-option-group>
                    </el-select>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addTaskVisible = false">取 消</el-button>
                <el-button type="primary" @click="addTask()">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { allTaskList, updateTask, addTask } from '@/api/task';
import { getUserList } from '@/api/user';
import { format4back } from '@/utils/common';
import { mapState } from 'vuex';

export default {
    data() {
        var checkPlandays = (rule, value, callback) => {
            if (value === null || value === '')
                callback(new Error("申请天数不能为空"))
            if (value < 1)
                callback(new Error("申请天数必须大于1"))
            callback()
        }
        return {
            taskList: [],
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
            taskDetailVisible: false,
            curTaskObj: {},
            //新增任务
            addTaskVisible: false,
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
                ],
                director: [
                    { required: true, message: '请指派负责人', trigger: 'change' }
                ],
            },
            addTaskObj: {
                director: null,
            }
        }
    },
    async created() {
        await this.getAllUser()
        this.curUser = this.directorOptions[0].children[0].value
        this.getAllTaskList()

    },
    computed: {
        ...mapState(['user'])
    }
    ,
    methods: {
        async getAllTaskList() {
            const res = await allTaskList(this.curUser)
            if (res.code === 200) {
                this.taskList = res.data
            } else {
                this.$message.error(res.msg)
            }
        },
        //获取所有科员信息
        async getAllUser() {
            //获取所有科员信息
            var { data: res } = await getUserList()
            for (var i = 0; i < res.length; i++) {
                if(res[i].status >=2)
                    continue
                this.directorOptions[res[i].status].children.push({ value: res[i].id, label: res[i].name })
            }
        },
        handleUserChange() {
            this.getAllTaskList()
        },
        openTaskDetail(row) {
            this.taskDetailVisible = true
            //先清空，避免有些对象没有的属性没有被覆盖s
            this.curTaskObj = {}
            this.curTaskObj = { ...row }
        },
        //修改任务信息
        async submitTaskChange() {
            //检查输入
            if (this.curTaskObj.description === '' || this.curTaskObj.description === null) {
                this.$message.error("描述请不要置空")
                return
            }
            if (this.curTaskObj.planDays === '' || this.curTaskObj.planDays === null) {
                this.$message.error("计划天数请不要置空")
                return
            }
            if (this.curTaskObj.startTime === null && this.curTaskObj.finishTime !== null) {
                this.$message.error("开始时间为空，但是结束时间不为空")
                return
            }
            //转换时间格式
            this.curTaskObj.startTime = format4back(this.curTaskObj.startTime)
            this.curTaskObj.finishTime = format4back(this.curTaskObj.finishTime)
            const res = await updateTask(this.curTaskObj)
            if (res.code === 200) {
                this.$message.success(res.data)
                this.taskDetailVisible = false
                this.getAllTaskList()
            } else {
                this.$message.error(res.msg)
            }
        },
        //新增任务
        openAddTask() {
            this.addTaskVisible = true
        },
        addTask() {
            this.$refs.addTaskFormRef.validate(async (valid) => {
                if (valid) {
                    this.addTaskObj.createUser = this.user.id
                    const res = await addTask(this.addTaskObj)
                    if (res.code === 200) {
                        this.addTaskVisible = false
                        this.$message.success(res.data)
                        this.getAllTaskList()
                    } else {
                        this.$message.error(res.msg)
                    }
                }
            })

        }
    }
}
</script>

<style></style>