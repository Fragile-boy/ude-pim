<template>
    <div>
        <!-- 面包屑导航区域 -->
        <div>
            <el-breadcrumb separator="/">
                <el-breadcrumb-item :to="{ path: '/index' }">主页</el-breadcrumb-item>
                <el-breadcrumb-item>部员管理</el-breadcrumb-item>
                <el-breadcrumb-item>部员信息管理</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <!-- 卡片区域 -->
        <el-card>
            <!-- 搜索区域 -->
            <div class="query-area">
                <el-row :gutter="10">
                    <el-col :span="4">
                        <el-input placeholder="请输入姓名查询" v-model="queryInfo.query" @change="searchUser()"></el-input>
                    </el-col>

                    <el-col :span="2">
                        <el-button type="primary" icon="el-icon-search" @click="searchUser()">查询</el-button>
                    </el-col>

                    <el-col :span="2">
                        <el-button type="primary" icon="el-icon-plus" @click="addFormVisible = true">添加用户</el-button>
                    </el-col>

                    <el-col :span="1" :offset="15">
                        <el-dropdown @command="handleCommand">
                            <el-button round>
                                <i class="el-icon-setting el-icon-arrow-down"></i>
                            </el-button>
                            <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item command="editUser">修改资料</el-dropdown-item>
                                <el-dropdown-item command="password">修改密码</el-dropdown-item>
                            </el-dropdown-menu>
                        </el-dropdown>
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
                        <el-button icon="el-icon-edit" type="primary" round size="mini"
                            @click="openEditUser(scope.row.id)"></el-button>
                        <el-button icon="el-icon-delete" type="danger" round size="mini"
                            @click="removeUser(scope.row.id)"></el-button>
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
                            <el-input v-model="editForm.name"></el-input>
                        </el-form-item>
                    </el-col>

                    <el-col :span="12">
                        <el-form-item label="工号" prop="number">
                            <el-input v-model.number="editForm.number"></el-input>
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

        <!-- 修改资料区域 -->
        <el-dialog title="修改资料" :visible.sync="editUserVisible" width="30%">
            <el-form ref="editUserRef" :rules="editUserRule" :model="editUser" label-width="80px">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="姓名" prop="name">
                            <el-input v-model="editUser.name"></el-input>
                        </el-form-item>
                    </el-col>

                    <el-col :span="12">
                        <el-form-item label="工号" prop="number">
                            <el-input v-model="editUser.number"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-form-item label="职务" prop="status">
                    <el-select v-model="editUser.status" placeholder="请选择职务">
                        <el-option v-for="item in [{ label: '机构', value: 0 }, { label: '电控', value: 1 }]" :key="item.value"
                            :label="item.label" :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>

            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editUserVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleEditUser()">确 定</el-button>
            </span>
        </el-dialog>


        <!-- 修改密码区域 -->
        <el-dialog title="修改密码" :visible.sync="editPasswordVisible" width="30%">
            <el-form ref="editPasswordRef" :model="passwordInfo" :rules="passwordInfoRule" label-width="80px">
                <el-form-item label="新密码" prop="password">
                    <el-input type="password" v-model="passwordInfo.password"></el-input>
                </el-form-item>


                <el-form-item label="确认密码" prop="doublecheck">
                    <el-input type="password" v-model="passwordInfo.doublecheck"></el-input>
                </el-form-item>


            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editPasswordVisible = false">取 消</el-button>
                <el-button type="primary" @click="updatePassword()">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { getUserPage, saveUser, getUserById, updateUser, removeUser } from '@/api/user'
import { mapActions, mapState } from 'vuex'
import { updatePassword } from '@/api/user'
export default {
    data() {
        var checkNumber = (rule, value, callback) => {
            if (!/^\d{6}$/.test(value))
                return callback(new Error('工号是6位纯数字'))
            return callback()
        }
        var checkPassword = (rule, value, callback) => {
            if (!/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(value)) {
                return callback(new Error('密码必须包含字母、数字，长度大于8'))
            }
            callback()
        }

        var checkSecond = (rule, value, callback) => {
            if (value !== this.passwordInfo.password) {
                return callback(new Error('两次密码不一致'))
            }
            callback()
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
                id: null,
                name: '',
                number: '',
                status: null
            },
            //修改密码，修改个人信息
            editUserVisible: false,
            editPasswordVisible: false,
            editUser: {},
            editUserRule: {
                name: [
                    { required: true, message: '名字不可为空', trigger: 'blur' },
                    { min: 2, max: 10, message: '名字必须在2-10个字符之间', trigger: 'blur' }
                ],
                number: [
                    { validator: checkNumber, trigger: 'blur' }
                ]
            },
            passwordInfo: {
                password: '',
                doublecheck: ''
            },
            passwordInfoRule: {
                password: [
                    { validator: checkPassword, trigger: 'blur' }
                ],
                doublecheck: [
                    { validator: checkSecond, trigger: 'blur' }
                ]
            },
        }
    },
    created() {
        this.getUserPage()
    },
    computed:{
        ...mapState(['user'])
    },
    methods: {
        ...mapActions(['editUserInfo']),
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
            if (res.code !== 200)
                return this.$message.error("用户信息查询失败")
            this.editForm = res.data
            this.editFormVisible = true
        },
        //修改用户
        async editUser() {
            const res = await updateUser(this.editForm)
            if (res.code === 200) {
                this.$message.success(res.data)
                this.getUserPage()
                this.editFormVisible = false
            } else {
                this.$message.error(res.msg)
            }
        },
        //移除用户
        async removeUser(id) {
            //如果该页只有一个表项，删除后应该回到上一页
            if (this.userList.length === 1)
                this.queryInfo.page -= 1
            const res = await removeUser(id)
            if (res.code === 200) {
                this.$message.success(res.data)
                this.getUserPage()
            } else {
                this.$message({
                    type: 'error',
                    message: res.msg,
                    duration: 5000
                })
            }
        },
        //设置按钮
        handleCommand(command) {
            if (command === 'editUser') {
                //修改资料
                this.editUser = { ...this.user }
                this.editUserVisible = true
            } else {
                this.editPasswordVisible = true
            }
        },
        handleEditUser() {
            this.$refs.editUserRef.validate(async (valid) => {
                if (valid) {
                    const res = await this.editUserInfo(this.editUser)
                    if (res.code === 200) {
                        this.$message.success(res.data)
                        this.editUserVisible = false
                    } else {
                        this.$message.error(res.msg)
                    }
                }
            })

        },
        //修改密码
        updatePassword() {
            this.$refs.editPasswordRef.validate(async (valid) => {
                if (valid) {
                    const res = await updatePassword({ password: this.passwordInfo.password, id: this.user.id })
                    if (res.code === 200) {
                        this.$message.success(res.data)
                        this.editPasswordVisible = false
                    }
                }
            })
        },
    }
}
</script>

<style lang="less" scoped>
.query-area {
    margin-bottom: 10px;
}
</style>