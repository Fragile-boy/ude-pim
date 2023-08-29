<template>
    <div>
        <!-- 面包屑导航区域 -->
        <div>
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>部员管理</el-breadcrumb-item>
                <el-breadcrumb-item>部员信息管理</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <!-- 卡片区域 -->
        <el-card>
            <!-- 搜索区域 -->
            <div class="query-area">
                <el-row :gutter="20">
                    <el-col :span="4">
                        <el-input placeholder="请输入姓名查询" v-model="queryInfo.query" @change="searchUser()"></el-input>
                    </el-col>

                    <el-col :span="2">
                        <el-button type="primary" icon="el-icon-search" @click="searchUser()">查询</el-button>
                    </el-col>

                    <el-col :span="2">
                        <el-button type="primary" icon="el-icon-plus" @click="addFormVisible = true">添加用户</el-button>
                    </el-col>
                </el-row>
            </div>
            <!-- 表格区域 -->
            <el-table :data="userList" border>
                <el-table-column type="index"></el-table-column>
                <el-table-column prop="name" label="姓名"></el-table-column>
                <el-table-column prop="number" label="工号"></el-table-column>
                <el-table-column prop="status" label="权限">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.type === 1">管理员</el-tag>
                        <el-tag type="success" v-else>用户</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="职务">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.status === 0">机构</el-tag>
                        <el-tag type="success" v-else>电控</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button icon="el-icon-edit" type="primary" round size="mini" @click="openEditUser(scope.row.id)"></el-button>
                        <el-button icon="el-icon-delete" type="danger" round size="mini" @click="removeUser(scope.row.id)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区域 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="queryInfo.page" :page-sizes="[5, 7, 10, 20]" :page-size="queryInfo.pageSize"
                layout="total, sizes, prev, pager, next" :total="total">
            </el-pagination>
        </el-card>

        <!-- 添加用户dialog -->
        <el-dialog title="添加用户" :visible.sync="addFormVisible" width="30%" @close="$refs.addFormRef.resetFields()">
            <el-form ref="addFormRef" :model="addForm" label-width="80px" :rules="addFormRules">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="姓名" prop="name">
                            <el-input v-model="addForm.name"></el-input>
                        </el-form-item>
                    </el-col>

                    <el-col :span="12">
                        <el-form-item label="工号" prop="number">
                            <el-input v-model.number="addForm.number"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-form-item label="职务" prop="status">
                    <el-select v-model="addForm.status" placeholder="请选择职务">
                        <el-option v-for="item in statusOps" :key="item.value" :label="item.label" :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>

            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser()">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 修改用户dialog -->
        <el-dialog title="修改用户" :visible.sync="editFormVisible" width="30%" @close="$refs.editFormRef.resetFields()">
            <el-form ref="editFormRef" :model="editForm" label-width="80px" :rules="addFormRules">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="姓名" prop="name">
                            <el-input v-model="editForm.name" disabled></el-input>
                        </el-form-item>
                    </el-col>

                    <el-col :span="12">
                        <el-form-item label="工号" prop="number">
                            <el-input v-model.number="editForm.number" disabled></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-form-item label="职务" prop="status">
                    <el-select v-model="editForm.status" placeholder="请选择职务">
                        <el-option v-for="item in statusOps" :key="item.value" :label="item.label" :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>

            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUser()">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { getUserPage, saveUser,getUserById, updateUser, removeUser } from '@/api/user'
export default {
    data() {
        var checkNumber = (rule, value, callback) => {
            if (!/^52\d{4}$/.test(value))
                return callback(new Error('工号是52开头的6位数字'))
            return callback()
        }
        return {
            userList: [],
            total: 0,
            queryInfo: {
                page: 1,
                pageSize: 7,
                query: ''
            },
            //新增用户窗口显示
            addFormVisible: false,
            addForm: {
                name: '',
                number: '',
                status: null
            },
            statusOps: [
                { value: 0, label: "机构" },
                { value: 1, label: "电控" },
            ],
            addFormRules: {
                name: [
                    { required: true, message: '请输入姓名', trigger: 'blur' }
                ],
                number: [
                    { required: true, message: '请输入工号', trigger: 'blur' },
                    { validator: checkNumber, trigger: 'blur' }
                ],
                status: [
                    { required: true, message: '请选择职务', trigger: 'blur' }
                ],
            },
            //修改用户窗口显示
            editFormVisible: false,
            editForm: {
                id:null,
                name: '',
                number: '',
                status: null
            },
        }
    },
    created() {
        this.getUserPage()
    },
    methods: {
        async getUserPage() {
            const res = await getUserPage(this.queryInfo)
            this.userList = res.data.records
            this.total = res.data.total
        },
        handleSizeChange(value) {
            //改变页码大小的时候，将默认页码变为1
            this.queryInfo.page = 1
            this.queryInfo.pageSize = value
            this.getUserPage()
        },
        handleCurrentChange(value) {
            this.queryInfo.page = value
            this.getUserPage()
        },
        //搜索部员
        searchUser() {
            //搜索的时候，将默认页码变为1
            this.queryInfo.page = 1
            this.getUserPage()
        },
        //新增用户
        addUser() {
            this.$refs.addFormRef.validate(async valid => {
                if (!valid) return;
                const res = await saveUser(this.addForm)
                if (res.code === 200) {
                    this.$message.success(res.data)
                    this.getUserPage()
                    //刷新界面
                    setTimeout(() => {
                        this.addFormVisible = false
                    }, 1000);
                } else {
                    this.$message.error(res.msg)
                }
            })
        },
        //打开修改用户界面
        async openEditUser(id) {
            const res = await getUserById(id)
            if(res.code!==200)
                return this.$message.error("用户信息查询失败")
            this.editForm = res.data
            this.editFormVisible = true
        },
        //修改用户
        async editUser(){
            const res = await updateUser(this.editForm)
            if(res.code===200){
                this.$message.success(res.data)
                this.getUserPage()
                this.editFormVisible = false
            }else{
                this.$message.error(res.msg)
            }
        },
        //移除用户
        async removeUser(id){
            //如果该页只有一个表项，删除后应该回到上一页
            if(this.userList.length===1)
                this.queryInfo.page-=1
            const res = await removeUser(id)
            if(res.code===200){
                this.$message.success(res.data)
                this.getUserPage()
            }else{
                this.$message({
                    type:'error',
                    message:res.msg,
                    duration: 5000
                })
            }
        }
    }
}
</script>

<style lang="less" scoped>
.query-area {
    margin-bottom: 10px;
}
</style>