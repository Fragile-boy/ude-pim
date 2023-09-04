<template>
    <div>
        <!-- 面包屑导航区域 -->
        <div>
            <el-breadcrumb separator="/">
                <el-breadcrumb-item :to="{ path: '/index' }">主页</el-breadcrumb-item>
                <el-breadcrumb-item>专案管理</el-breadcrumb-item>
                <el-breadcrumb-item>子流程管理</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <el-card>
            <!-- 查询和新增区域 -->
            <div class="query_and_add">
                <el-row :gutter="20">
                    <el-col :span="4">
                        <el-input placeholder="请输入子流程名称" disabled></el-input>
                    </el-col>

                    <el-col :span="2">
                        <el-button type="primary" icon="el-icon-search" disabled>查询</el-button>
                    </el-col>

                    <el-col :span="2">
                        <el-button type="primary" icon="el-icon-plus" @click="addSubFormVisible = true">新增子流程</el-button>
                    </el-col>
                </el-row>
            </div>
            <!-- 表格区域，显示子流程 -->
            <el-table :data="subList" border scrope>
                <el-table-column prop="id" label="编号">
                </el-table-column>
                <el-table-column prop="name" label="流程名">
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" @click="openEditSub(scope.row)"></el-button>
                        <el-button v-if="false" type="danger" icon="el-icon-delete" @click="removeSub(scope.row)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区域 -->
            <el-pagination style="margin-top: 10px;text-align: left;" @size-change="handleSizeChange"
                @current-change="handleCurrentChange" :current-page.sync="queryInfo.page" :page-sizes="[5, 7, 10, 20]"
                :page-size="queryInfo.pageSize" layout="total, sizes, prev, pager, next" :total="total">
            </el-pagination>
        </el-card>
        <!-- 子流程新增区域 -->
        <el-dialog title="新增子流程" :visible.sync="addSubFormVisible" width="30%" @close="resetFields()">
            <el-form ref="subFormRef" :model="subForm" label-width="100px" :rules="subFormRules">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="子流程名称" prop="name">
                            <el-input v-model="subForm.name"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="子流程序号" prop="sort">
                            <el-input v-model.number="subForm.sort"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <label
                        style="display: flex; justify-content: center; font-size: 20px; margin-bottom: 3px;">难度对应执行天数</label>
                </el-row>
                <el-form-item v-for="item in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]" :label="`难度:${item}`" :key="item">
                    <el-input :placeholder="item" v-model.number="subForm.l2p[item - 1]"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addSubFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="addSub(1)">确 定</el-button>
                <el-button type="warning" @click="addSub(2)">确定并继续添加</el-button>
            </span>
        </el-dialog>

        <!-- 子流程修改区域 -->
        <el-dialog title="修改子流程" :visible.sync="editSubFormVisible" width="30%" @close="subForm.name = null">
            <el-form ref="editSubFormRef" :model="subForm" label-width="90px">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="子流程名称" prop="name">
                            <el-input v-model="subForm.name"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="子流程序号" prop="sort">
                            <el-input v-model.number="subForm.sort"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <label
                        style="display: flex; justify-content: center; font-size: 20px; margin-bottom: 3px;">难度对应执行天数</label>
                </el-row>
                <el-form-item v-for="item in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]" :label="`难度:${item}`" :key="item">
                    <el-input :placeholder="item" v-model.number="subForm.l2p[item - 1]"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editSubFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="editSub()">修 改</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { getSubList, saveSub, updateSub, getAllSub, deleteSubWithLevel, getSubWithLevel } from '@/api/sub'
export default {
    data() {
        return {
            subList: [],
            queryInfo: {
                query: '',
                page: 1,
                pageSize: 7
            },
            total: null,
            addSubFormVisible: false,
            editSubFormVisible: false,
            subForm: {
                //新增子流程名称
                name: '',
                sort: '',
                //level to planDays
                l2p: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            },
            //子流程表格校验规则
            subFormRules: {
                name: [
                    { required: true, message: '请输入子流程名称', trigger: 'blur' }
                ],
                sort: [
                    { required: true, message: '请输入子流程序号', trigger: 'blur' }
                ]
            }
        }
    },
    created() {
        this.getSubList()
    },
    methods: {
        async getSubList() {
            const res = await getSubList(this.queryInfo)
            this.subList = res.data.records
            this.total = res.data.total
        },
        handleSizeChange(size) {
            this.queryInfo.pageSize = size
            this.queryInfo.page = 1
            this.getSubList()
        },
        handleCurrentChange(page) {
            this.queryInfo.page = page
            this.getSubList()
        },
        // 新增子流程
        addSub(mode) {
            this.subForm.id = null
            this.$refs.subFormRef.validate(async (valid) => {
                if (valid) {
                    if (!this.checkLevel(this.subForm.l2p)) {
                        this.$message.error("计划天数设定不合理，请检查是否有空值或者非正数值")
                        return
                    }
                    const res = await saveSub(this.subForm)
                    if (res.code === 200) {
                        this.$message.success(res.data)
                        if (mode === 1) {
                            this.addSubFormVisible = false
                            this.getSubList()
                        }
                        else if (mode === 2) {
                            this.resetFields()
                        }
                    } else {
                        this.$message.error(res.msg)
                    }
                }
            })

        },
        //打开修改子流程表单
        async openEditSub(subObj) {
            const res = await getSubWithLevel(subObj.id)
            console.log(res.data)
            this.subForm = { ...res.data }
            this.editSubFormVisible = true
        },
        //修改子流程
        async editSub() {
            if (this.subForm.name === '') {
                this.$message.error("名称不可为空")
                return
            }
            this.$refs.editSubFormRef.validate(async (valid) => {
                if (valid) {
                    if (!this.checkLevel(this.subForm.l2p)) {
                        this.$message.error("计划天数设定不合理，请检查是否有空值或者非正数值")
                        return
                    }
                    const res = await updateSub(this.subForm)
                    if (res.code === 200) {
                        this.$message.success(res.data)
                        this.editSubFormVisible = false
                        this.getSubList()
                    } else {
                        this.$message.error(res.msg)
                    }
                }
            })
        },
        resetFields() {
            this.subForm = {
                //新增子流程名称
                name: '',
                sort: '',
                //level to planDays
                l2p: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            }
        },
        checkLevel(value) {
            for (var i = 0; i < 10; i++) {
                if (value[i] === null || value[i] === '')
                    return false
                else if (value[i] <= 0)
                    return false
            }
            return true
        },
        //删除子流程
        removeSub(row) {
            this.$confirm(`你正在删除 "${row.name}"，此操作将永久删除该子流程以及对应计划天数信息，是否继续`, "危险操作", {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'danger'
            }).then(async () => {
                const res = await deleteSubWithLevel(row.id)
                if (res.code === 200) {
                    this.$message.success(res.data)
                    this.getSubList()
                } else
                    this.$message.error(res.msg)
            }).catch(() => { })
        }
    }
}
</script>

<style lang="less" scoped>
.query_and_add {
    margin-bottom: 10px;
}
</style>