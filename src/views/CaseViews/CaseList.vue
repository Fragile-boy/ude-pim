<template>
    <div>
        <!-- 面包屑导航区域 -->
        <div>
            <el-breadcrumb separator="/">
                <el-breadcrumb-item :to="{ path: '/index' }">主页</el-breadcrumb-item>
                <el-breadcrumb-item>专案管理</el-breadcrumb-item>
                <el-breadcrumb-item>专案列表</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <el-card>
            <!-- 查询和新增区域 -->
            <div class="case_add">
                <el-row :gutter="20">
                    <el-col :span="4">
                        <el-input placeholder="请输入专案名称查询" @change="getTableDate()" v-model="queryInfo.query"></el-input>
                    </el-col>

                    <el-col :span="2">
                        <el-button type="primary" icon="el-icon-search" @click="getTableDate()">查询</el-button>
                    </el-col>

                    <el-col :span="2">
                        <el-button type="primary" icon="el-icon-plus" @click="openAddCase()">新增专案</el-button>
                    </el-col>
                </el-row>
            </div>
            <!-- 表格区域 -->
            <el-table :data="pageInfo" border scrope max-height=600>
                <el-table-column type="index" label="#">
                </el-table-column>
                <el-table-column prop="name" label="任务名">
                </el-table-column>
                <el-table-column prop="level" label="难度">
                </el-table-column>
                <el-table-column prop="directorName" label="负责人">
                </el-table-column>
                <el-table-column prop="createTime" label="创建时间">
                </el-table-column>
                <el-table-column prop="startTime" label="开始时间">
                </el-table-column>
                <el-table-column prop="finishTime" label="完结时间">
                </el-table-column>
                <el-table-column label="操作" width="240">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" @click="editCase(scope.row)" size="mini"
                            round></el-button>
                        <el-tooltip v-if="!scope.row.hasSub" effect="dark" content="分配子流程" placement="top">
                            <el-button type="warning" icon="el-icon-setting" size="mini"
                                @click="openAddRelationMenu(scope.row)" round></el-button>
                        </el-tooltip>
                        <el-tooltip effect="dark" content="终止专案" placement="top" v-if="scope.row.finishTime===null&&!scope.row.terminate">
                            <el-button type="warning" size="mini" icon="el-icon-circle-close" round
                                @click="terminateCase(scope.row, true)"></el-button>
                        </el-tooltip>
                        <el-tooltip effect="dark" content="重启专案" placement="top" v-if="scope.row.finishTime===null&&scope.row.terminate">
                            <el-button type="success" size="mini" icon="el-icon-success" round
                                @click="terminateCase(scope.row, false)"></el-button>
                        </el-tooltip>
                        <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteCase(scope.row)"
                            round></el-button>

                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区域 -->
            <el-pagination style="margin-top: 10px;text-align: left;" @size-change="handleSizeChange"
                @current-change="handleCurrentChange" :current-page.sync="queryInfo.page" :page-sizes="[5, 7, 10, 20]"
                :page-size="queryInfo.pageSize" layout="total, sizes, prev, pager, next" :total="total">
            </el-pagination>
        </el-card>
        <!-- 新增专案表单 -->
        <el-dialog :title="dialogTitle" :visible.sync="addCaseVisible" width="35%" @close="addCaseFormClose()">
            <el-form ref="addCaseFormRef" :model="addCaseForm" :rules="addCaseRules" label-width="80px">
                <el-row :gutter="20">
                    <el-col>
                        <el-form-item label="专案名称" prop="name">
                            <el-input v-model="addCaseForm.name" placeholder="请输入专案名称"></el-input>
                        </el-form-item>
                    </el-col>

                </el-row>

                <el-row :gutter="40">
                    <el-col :span="12">
                        <el-form-item label="专案号">
                            <el-input v-model="addCaseForm.number" placeholder="如专案号未申请下来，为空"></el-input>
                        </el-form-item>
                    </el-col>

                    <el-col :span="12">
                        <el-form-item label="难度" prop="level">
                            <el-input v-model.number="addCaseForm.level" placeholder="请输入专案难度"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-form-item label="负责人" prop="directors">
                    <el-cascader v-model="addCaseForm.directors" :options="directorOptions" :show-all-levels="false"
                        placeholder="请选择负责人"></el-cascader>
                </el-form-item>

                <el-form-item label="专案描述" prop="description">
                    <el-input type="textarea" v-model="addCaseForm.description" placeholder="简要介绍专案"></el-input>
                </el-form-item>



            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="addCase()">确 定</el-button>
                <el-button @click="addCaseVisible = false">取 消</el-button>
            </span>
        </el-dialog>

        <!-- 分配子流程主界面 -->
        <el-dialog title="模式选择" :visible.sync="addRelationMenuVisible" width="30%">
            <!-- 子流程添加区域 -->
            <el-col :span="8">
                <el-dropdown split-button type="warning" @command="openAddRelationSubByTemplate">
                    按模板
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item v-for="item in templateList" :key="item.id" :command="item.id">{{ item.description
                        }}</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </el-col>
            <!-- <el-button type="warning"></el-button> -->
            <el-button type="primary" @click="openAddRelationSub()">按流程</el-button>
        </el-dialog>

        <!-- 新增关联子流程表单 -->
        <el-dialog title="关联子流程" :visible.sync="addRelationSubVisible" width="50%" @close="addRelationSubClose()">
            <el-table :data="relationSub" ref="multipleTable" tooltip-effect="dark" style="width: 100%"
                @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55">
                </el-table-column>
                <el-table-column prop="realSort" label="序号">
                </el-table-column>
                <el-table-column prop="name" label="名称">
                </el-table-column>
                <el-table-column label="难度">
                    <template slot-scope="scope">
                        <el-select v-model="scope.row.level" :placeholder="curLevel + ''"
                            @change="getPresetDays(scope.row)">
                            <el-option v-for="item in levelInfo" :key="item" :value="item">
                            </el-option>
                        </el-select>
                    </template>
                </el-table-column>
                <el-table-column label="计划天数">
                    <template slot-scope="scope">
                        <el-input v-model="scope.row.planDays" :placeholder="defaultDays[scope.row.id]"></el-input>
                    </template>
                </el-table-column>
                <el-table-column label="负责人">
                    <template slot-scope="scope">
                        <el-select v-model="scope.row.chargeId" multiple filterable placeholder="请选择"
                            @change="selectChange()">
                            <el-option-group v-for="group in directorOptions" :key="group.value" :label="group.label">
                                <el-option v-for="item in group.children" :key="item.value" :label="item.label"
                                    :value="item.value">
                                </el-option>
                            </el-option-group>
                        </el-select>
                    </template>
                </el-table-column>
            </el-table>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="addRelation()">确 定</el-button>
                <el-button @click="addRelationSubVisible = false">取 消</el-button>
            </span>
        </el-dialog>

        <el-dialog title="模板关联子流程" :visible.sync="addTempleteRelationSubVisible" width="50%">
            <el-table :data="relationTemplateSub">
                <el-table-column prop="name" label="名称">
                </el-table-column>
                <el-table-column label="难度">
                    <template slot-scope="scope">
                        <el-select v-model="scope.row.level" :placeholder="curLevel + ''" @change="getPlanDays(scope.row)">
                            <el-option v-for="item in levelInfo" :key="item" :value="item">
                            </el-option>
                        </el-select>
                    </template>
                </el-table-column>
                <el-table-column label="计划天数">
                    <template slot-scope="scope">
                        <el-input v-model.number="scope.row.planDays"
                            :placeholder="defaultDays[scope.row.id] + ''"></el-input>
                    </template>
                </el-table-column>
                <el-table-column label="负责人">
                    <template slot-scope="scope">
                        <el-select v-model="scope.row.chargeId" multiple filterable placeholder="请选择负责人">
                            <el-option-group v-for="group in directorOptions" :key="group.value" :label="group.label">
                                <el-option v-for="item in group.children" :key="item.value" :label="item.label"
                                    :value="item.value">
                                </el-option>
                            </el-option-group>
                        </el-select>
                    </template>
                </el-table-column>
            </el-table>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="addRelationByTemplate()">确 定</el-button>
                <el-button @click="addTempleteRelationSubVisible = false">取 消</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { getUserList, getUserStatus } from '@/api/user'
import { addCase, getList, editCase, deleteCase, terminateCase } from '@/api/case'
import { checkResult } from '@/utils/common'
import { getAllSub, getPresetDay } from '@/api/sub'
import { insertRelation } from '@/api/caseSub'
import { getTempleteList, getSubsByTemplateId } from '@/api/templete'
export default {
    data() {
        return {
            dialogTitle: "新增专案",
            pageInfo: [],
            queryInfo: {
                page: 1,
                pageSize: 7,
                query: ''
            },
            total: 0,
            addCaseVisible: false,
            addCaseForm: {
                name: '',
                description: "",
                number: null,
                level: 7,
                //这里用directors，避免和director冲突
                directors: null,
            },
            // 标志这是新增还是修改,0=>new,1=>edit
            newFlag: 0,
            //新增关联子流程表单显示标志位
            addRelationSubVisible: false,
            //模板新增关联子流程表单显示标志位
            addTempleteRelationSubVisible: false,
            // 新增专案表单校验规则
            addCaseRules: {
                name: [
                    { required: true, message: '请输入专案名称', trigger: 'blur' }
                ],
                // description: [
                //     { required: true, message: '请输入专案描述', trigger: 'blur' }
                // ],
                level: [
                    { required: true, message: '请输入难度', trigger: 'blur' }
                ],
                directors: [
                    { required: true, message: '请选择负责人', trigger: 'blur' }
                ]
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
                }
            ],
            //添加关联关系显示标志位
            addRelationMenuVisible: false,
            //所有科员
            allUser: [],
            //所有子流程数据
            relationSub: [],
            //所有模板添加子流程数据
            relationTemplateSub: [],
            // 所有难度数据
            levelInfo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            //要插入数据库的数据
            insertInfo: [],
            //所有模板数据
            templateList: [],
            //序号数据
            case_sub_sort: 0
        }
    },
    computed: {
        ...mapState(['user'])
    },
    created() {
        this.getTableDate()
    },
    async mounted() {
        var { data: res } = await getUserList()
        for (var i = 0; i < res.length; i++) {
            this.directorOptions[res[i].status].children.push({ value: res[i].id, label: res[i].name })
        }
    },
    methods: {
        async getTableDate() {
            var res = await getList(this.queryInfo)
            this.pageInfo = res.data.records
            this.total = res.data.total
        },
        //修改专案
        async editCase(caseObj) {
            // 先赋值给表单元素
            this.addCaseForm = { ...caseObj }
            const res = await getUserStatus(caseObj.director);
            if (res.code !== 200) {
                this.$message.error("获取用户职务失败")
                return
            }
            this.addCaseForm['directors'] = [res.data, caseObj.director]
            this.dialogTitle = "修改专案"
            this.newFlag = 1
            this.addCaseVisible = true
        },
        //页面大小发生变化
        handleSizeChange(val) {
            this.queryInfo.pageSize = val
            this.queryInfo.page = 1
            this.getTableDate()
        },
        //翻页
        handleCurrentChange(val) {
            this.queryInfo.page = val
            this.getTableDate()
        },

        // 打开新增专案
        async openAddCase() {
            this.dialogTitle = "新增专案"
            this.newFlag = 0
            this.addCaseVisible = true
        },
        //关闭新增窗口的回调函数
        addCaseFormClose() {
            this.$refs.addCaseFormRef.resetFields()
            //重置负责人，避免出问题
            this.addCaseForm.director = null
        },
        // 新增专案
        addCase() {
            this.$refs.addCaseFormRef.validate(async valid => {
                if (!valid) return;
                // 获得正确的负责人值
                this.addCaseForm.director = this.addCaseForm.directors[1]
                this.addCaseForm.createUser = this.user.id
                this.addCaseForm.terminate = 0
                if (this.newFlag === 0)
                    var res = await addCase(this.addCaseForm)
                else
                    var res = await editCase(this.addCaseForm)
                checkResult(res)
                if (res.code === 200) {
                    this.addCaseVisible = false
                    this.getTableDate()
                }
            })
        },
        //打开添加子流程弹窗口
        async openAddRelationSub() {
            //获取子流程数据
            await this.getAllSub()
            //获取负责人列表
            this.getAllUser()
            this.addRelationSubVisible = true
        },
        //初始化所有子流程数据
        async getAllSub() {
            const res = await getAllSub()
            //存储默认的计划天数
            this.defaultDays = {}
            if (res.code === 200) {
                this.relationSub = res.data
                //绑定默认难度下的每个流程的计划天数
                for (var i = 0; i < this.relationSub.length; i++) {
                    const r = await getPresetDay({ subId: this.relationSub[i].id, level: this.curLevel })
                    this.defaultDays[this.relationSub[i].id] = r.data
                    if (this.relationSub[i].id <= 6) {
                        this.relationSub[i].chargeId = [this.curDirector]
                    }
                }
                console.log(this.defaultDays)
            } else {
                this.$message.error(res.msg)
                return
            }
        },
        //获取负责人列表
        async getAllUser() {
            const res = await getUserList()
            if (res.code === 200) {
                this.allUser = res.data
            } else {
                this.$message.error(res.msg)
                return
            }
        },
        //获取子流程特定难度的对应的计划天数
        async getPresetDays(row) {
            row.subId = row.id
            const res = await getPresetDay({ subId: row.subId, level: row.level })
            this.$set(row, 'planDays', res.data)
        },
        //选择子流程后的回调函数
        handleSelectionChange(val) {
            this.insertInfo = val
            var sort = 1;
            //清空原来的realSort
            for (var j = 0; j < this.relationSub.length; j++) {
                this.relationSub[j].realSort = null
            }
            for (var i = 0; i < this.insertInfo.length; i++) {
                for (var j = 0; j < this.relationSub.length; j++) {
                    if (this.relationSub[j].id === this.insertInfo[i].id) {
                        this.relationSub[j].realSort = sort
                        sort++
                        break
                    }
                }
            }
        },
        //关联窗口关闭后回调函数
        addRelationSubClose() {
            this.relationSub = []
            //elementUI的bug，关闭窗口的时候会触发一次handleSelectionChange
            this.case_sub_sort = -1
        },
        //插入数据库
        async addRelation() {
            if (this.insertInfo.length === 0) {
                this.$message.error("请勾选要添加的子流程")
                return
            }
            for (var i = 0; i < this.insertInfo.length; i++) {
                this.insertInfo[i].subId = this.insertInfo[i].id
                //查看计划天数是否有值，没有则赋值为默认值
                if (!("planDays" in this.insertInfo[i]) || this.insertInfo[i].planDays <= 0) {

                    if (this.defaultDays[this.insertInfo[i].id] === null) {
                        this.$message.error("部分阶段的计划天数为空或者小于等于0，请检查输入")
                        return
                    } else
                        this.insertInfo[i].planDays = this.defaultDays[this.insertInfo[i].id]
                }
                // 难度赋默认值
                if (!("level" in this.insertInfo[i] || this.insertInfo[i].level === null)) {
                    this.insertInfo[i].level = this.curLevel
                }

                this.insertInfo[i].caseId = this.curCaseId
            }
            //id本来是子流程的id，结果变成了专案子流程的id，可恶的bug
            for(var i =0;i<this.insertInfo.length;i++)
                this.insertInfo[i].id = null
            console.log(this.insertInfo)
            const res = await insertRelation(this.insertInfo)
            if (res.code === 200) {
                this.$message.success(res.data)
                this.addRelationSubVisible = false
                this.addRelationMenuVisible = false
                this.getTableDate()
            } else {
                this.$message.error(res.msg)
            }
        },
        //打开添加关联关系菜单界面，并做一些初始化
        async openAddRelationMenu(row) {
            console.log(row)
            //获得当前id 
            this.curCaseId = row.id
            //获取当前难度
            this.curLevel = row.level
            //获得当前负责人
            this.curDirector = row.director
            //获取模板列表
            const res = await getTempleteList({ page: 1, pageSize: 20, query: '' })
            this.templateList = res.data.records
            this.addRelationMenuVisible = true
        },
        //删除专案
        deleteCase(row) {
            this.$confirm(`此操作将永久删除 “${row.name}” 专案以及关联负责人、子流程信息, 是否继续?`, '操作不可逆', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                const res = await deleteCase(row.id)
                if (res.code === 200) {
                    this.$message.success(res.data)
                    this.getTableDate()
                } else {
                    this.$message.error(res.msg)
                }
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                });
            });
        },
        //按模板添加
        async openAddRelationSubByTemplate(id) {
            //获取模板对应的子流程数据
            const res = await getSubsByTemplateId(id)
            if (res.code === 200) {
                this.relationTemplateSub = res.data
                await this.setDefaultRelationSub()
            } else {
                this.$message.error(res.msg)
            }
            this.addTempleteRelationSubVisible = true
        },
        //模板添加进入数据库
        async addRelationByTemplate() {
            for (var i = 0; i < this.relationTemplateSub.length; i++) {
                this.relationTemplateSub[i].subId = this.relationTemplateSub[i].id
                
                if (!('level' in this.relationTemplateSub[i]) || this.relationTemplateSub[i].level === null)
                    this.relationTemplateSub[i].level = this.curLevel
                if (!('planDays' in this.relationTemplateSub[i]) || this.relationTemplateSub[i].planDays === null)
                    this.relationTemplateSub[i].planDays = this.defaultDays[this.relationTemplateSub[i].id]
                this.relationTemplateSub[i].caseId = this.curCaseId
                this.relationTemplateSub[i].id = null
            }
            console.log(this.relationTemplateSub)
            const res = await insertRelation(this.relationTemplateSub)
            if (res.code === 200) {
                this.$message.success(res.data)
                this.addTempleteRelationSubVisible = false
                this.addRelationMenuVisible = false
                this.getTableDate()
            } else {
                this.$message.error(res.msg)
            }
        },
        //设置默认值
        async setDefaultRelationSub() {
            //存储模板表格默认的计划天数
            this.defaultDays = {}
            //绑定默认难度下的每个流程的计划天数
            for (var i = 0; i < this.relationTemplateSub.length; i++) {
                const r = await getPresetDay({ subId: this.relationTemplateSub[i].id, level: this.curLevel })
                this.defaultDays[this.relationTemplateSub[i].id] = r.data
                if (this.relationTemplateSub[i].id <= 6) {
                    this.relationTemplateSub[i].chargeId = [this.curDirector]
                }
            }

        },
        //获取子流程特定难度的对应的计划天数
        async getPlanDays(row) {
            row.subId = row.id
            const res = await getPresetDay({ subId: row.subId, level: row.level })
            this.$set(row, 'planDays', res.data)
        },
        //负责人变化强制刷新
        selectChange() {
            this.$forceUpdate()
        },
        async terminateCase(row, status) {
            this.$confirm(`此操作将${status?'冻结':'重启'} “${row.name}” 专案,${status?'正在执行的阶段数据将丢失，':''} 是否继续?`, '操作不可逆', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                row.terminate = status
                const res = await terminateCase(row)
                if (res.code == 200) {
                    this.$message.success(res.data)
                    this.getTableDate()
                } else {
                    this.$message.error(res.msg)
                }
            })
        }
    }
}
</script>

<style lang="less" scoped>
.case_add {
    margin-bottom: 10px;
}</style>