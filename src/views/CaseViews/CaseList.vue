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
                <el-button type="primary" icon="el-icon-plus" @click="openAddCase()">新增专案</el-button>
            </div>
            <!-- 表格区域 -->
            <el-table :data="pageInfo" border scrope max-height=600>
                <el-table-column type="index" label="#">
                </el-table-column>
                <el-table-column prop="name" label="任务名" >
                </el-table-column>
                <el-table-column prop="level" label="难度" >
                </el-table-column>
                <el-table-column prop="director" label="负责人" >
                </el-table-column>
                <el-table-column prop="createTime" label="创建时间" >
                </el-table-column>
                <el-table-column label="操作" >
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" @click="editCase(scope.row)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区域 -->
            <el-pagination style="margin-top: 10px;text-align: left;" @size-change="handleSizeChange"
                @current-change="handleCurrentChange" :current-page.sync="page" :page-sizes="[5, 7, 10, 20]"
                :page-size="size" layout="total, sizes, prev, pager, next" :total="total">
            </el-pagination>
        </el-card>
        <!-- 新增专案表单 -->
        <el-dialog title="新增专案" :visible.sync="addCaseVisible" width="35%" @close="addCaseFormClose()">
            <el-form ref="addCaseFormRef" :model="addCaseForm" :rules="addCaseRules" label-width="80px">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="专案名称" prop="name">
                            <el-input v-model="addCaseForm.name" placeholder="请输入专案名称"></el-input>
                        </el-form-item>
                    </el-col>

                    <el-col :span="12">
                        <el-form-item label="难度" prop="level">
                            <el-input v-model.number="addCaseForm.level" placeholder="请输入专案难度"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row :gutter="40">
                    <el-col :span="12">
                        <el-form-item label="专案号">
                            <el-input v-model="addCaseForm.number" placeholder="如专案号未申请下来，为空"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-form-item label="负责人" prop="director">
                    <el-cascader v-model="addCaseForm.director" :options="directorOptions" :show-all-levels="false"
                        placeholder="请选择负责人"></el-cascader>
                </el-form-item>

                <el-form-item label="专案描述" prop="description">
                    <el-input type="textarea" v-model="addCaseForm.description" placeholder="简要介绍专案"></el-input>
                </el-form-item>

            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="addCase">确 定</el-button>
                <el-button @click="addCaseVisible = false">取 消</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { getUserList } from '@/api/user'
import {addCase, getList} from '@/api/case'
import { checkResult } from '@/utils/common'
export default {
    data() {
        return {
            caseList:[],
            pageInfo: [],
            page: 1,
            size: 7,
            total: 0,
            addCaseVisible: false,
            addCaseForm: {
                name: 'SXX',
                description: "测试新增专案",
                number: null,
                level: 7,
                director: null,
            },

            // 新增专案表单校验规则
            addCaseRules: {
                name: [
                    { required: true, message: '请输入专案名称', trigger: 'blur' }
                ],
                description: [
                    { required: true, message: '请输入专案描述', trigger: 'blur' }
                ],
                level: [
                    { required: true, message: '请输入难度', trigger: 'blur' }
                ],
                director: [
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
    async created() {
        await this.getList()
        this.getTableDate()
    },
    async mounted(){
        var {data:res} = await getUserList()
        for (var i = 0; i < res.length; i++) {
            this.directorOptions[res[i].status].children.push({ value: res[i].id, label: res[i].name })
        }
    },
    methods: {
        async getList(){
            var res = await getList()
            this.caseList = res.data
        },
        getTableDate() {
            this.pageInfo = this.caseList.slice((this.page - 1) * this.size,
                this.page * this.size)
            this.total = this.caseList.length
        },
        editCase(caseObj) {
            //1. 获取到该行的专案信息
            console.log(caseObj)
            this.addCaseVisible = true
        },
        //页面大小发生变化
        handleSizeChange(val) {
            this.size = val
            this.page = 1
            this.getTableDate()
        },
        //翻页
        handleCurrentChange(val) {
            this.page = val
            this.getTableDate()
        },
        
        // 打开新增专案
        async openAddCase() {
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
                this.addCaseForm.director = this.addCaseForm.director[1]
                this.addCaseForm.createUser = this.user.id
                var res = await addCase(this.addCaseForm)
                checkResult(res)
                if(res.code===200){
                    this.addCaseVisible = false
                    setTimeout(()=>this.$router.go(0),500)
                }
            })
        }
    }
}
</script>

<style lang="less" scoped>
.case_add {
    margin-bottom: 10px;
    display: flex;
    justify-content: flex-end;
}
</style>