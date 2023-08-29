<template>
    <div>
        <!-- 面包屑导航区域 -->
        <div>
            <el-breadcrumb separator="/">
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
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" @click="editCase(scope.row)"></el-button>
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
                <el-button type="primary" @click="addCase(newFlag)">确 定</el-button>
                <el-button @click="addCaseVisible = false">取 消</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { getUserList } from '@/api/user'
import { addCase, getList } from '@/api/case'
import { checkResult } from '@/utils/common'
import { editCase } from '@/api/case'
import { getUserStatus } from '@/api/user'
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
                name: 'SXX',
                description: "测试新增专案",
                number: null,
                level: 7,
                //这里用directors，避免和director冲突
                directors: null,
            },
            // 标志这是新增还是修改,0=>new,1=>edit
            newFlag:0,
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
            ]
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
                if(this.newFlag = 0)
                    var res = await addCase(this.addCaseForm)
                else
                    var res = await editCase(this.addCaseForm)
                checkResult(res)
                if (res.code === 200) {
                    this.addCaseVisible = false
                    this.getTableDate()
                }
            })
        }
    }
}
</script>

<style lang="less" scoped>
.case_add {
    margin-bottom: 10px;
}
</style>