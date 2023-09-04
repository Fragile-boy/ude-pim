<template>
    <div>
        <!-- 面包屑导航区域 -->
        <div>
            <el-breadcrumb separator="/">
                <el-breadcrumb-item :to="{ path: '/index' }">主页</el-breadcrumb-item>
                <el-breadcrumb-item>专案管理</el-breadcrumb-item>
                <el-breadcrumb-item>模板管理</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <el-card>
            <!-- 查询和新增区域 -->
            <div class="query_and_add">
                <el-row :gutter="20">
                    <el-col :span="4">
                        <el-input placeholder="请输入模板名称" disabled></el-input>
                    </el-col>

                    <el-col :span="2">
                        <el-button type="primary" icon="el-icon-search" disabled>查询</el-button>
                    </el-col>

                    <el-col :span="2">
                        <el-button type="primary" icon="el-icon-plus" @click="openAddTemplete()">新增模板</el-button>
                    </el-col>
                </el-row>
            </div>
            <!-- 表格区域，显示子流程 -->
            <el-table :data="templeteList" border scrope>
                <el-table-column type="index">
                </el-table-column>
                <el-table-column prop="description" label="模板描述">
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" @click="showDetail(scope.row)"></el-button>
                        <el-button type="danger" icon="el-icon-delete" @click="deleteTemplete(scope.row.id)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区域 -->
            <el-pagination style="margin-top: 10px;text-align: left;" @size-change="handleSizeChange"
                @current-change="handleCurrentChange" :current-page.sync="queryInfo.page" :page-sizes="[5, 7, 10, 20]"
                :page-size="queryInfo.pageSize" layout="total, sizes, prev, pager, next" :total="total">
            </el-pagination>
        </el-card>

        <!-- 模板添加区域 -->
        <el-dialog title="新增模板" :visible.sync="addTempleteFormVisible" width="50%" @close="closeAddTemplete()">
            <el-form ref="addTempleteFormRef" :model="templeteForm" label-width="90px">
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="模板描述">
                            <el-input v-model="templeteForm.description"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="内容">
                    <el-transfer target-order="push" class="custom-transfer" v-model="templeteForm.subIds" :data="allSub"
                        :button-texts="['移除', '添加']" :titles="['源', '目标']"
                        :props="{ key: 'id', label: 'name' }"></el-transfer>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addTempleteFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="addTemplete()">提 交</el-button>
            </span>
        </el-dialog>

        <!-- 模板修改区域 -->
        <el-dialog title="修改模板" :visible.sync="editTempleteFormVisible" width="50%">
            <el-form :model="editTempleteForm" label-width="90px">
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="模板描述">
                            <el-input v-model="editTempleteForm.description"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="内容">
                    <el-transfer target-order="push" v-model="editTempleteForm.subIds" :data="allSub"
                        :button-texts="['移除', '添加']" :titles="['源', '目标']"
                        :props="{ key: 'id', label: 'name' }"></el-transfer>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editTempleteFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="editTemplete()">提 交</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { saveTemplete, getTempleteList, getRelationId, updateTemplete, removeTemplete } from '@/api/templete'
import { getAllSub } from '@/api/sub'
export default {
    data() {
        return {
            allSub: [],
            templeteList: [],
            queryInfo: {
                query: '',
                page: 1,
                pageSize: 7
            },
            total: null,
            //新增模板图层
            addTempleteFormVisible: false,
            templeteForm: {
                description: '',
                subIds: [],
            },
            editTempleteFormVisible: false,
            //修改模板对象
            editTempleteForm: {
                id: '',
                description: '',
                subIds: [],
            }
        }
    },
    created() {
        this.getAllSub()
        this.getTempleteList()
    },
    methods: {
        async getTempleteList() {
            const res = await getTempleteList(this.queryInfo)
            this.templeteList = res.data.records
            this.total = res.data.total
        },
        //获取所有子流程数据
        async getAllSub() {
            const res = await getAllSub()
            if (res.code === 200) {
                this.allSub = res.data
            } else {
                this.$message.error(res.msg)
                return
            }
        },
        handleSizeChange(size) {
            this.queryInfo.pageSize = size
            this.queryInfo.page = 1
            this.getTempleteList()
        },
        handleCurrentChange(page) {
            this.queryInfo.page = page
            this.getTempleteList()
        },
        //打开新增模板界面
        async openAddTemplete() {
            this.addTempleteFormVisible = true
        },
        //关闭新增模板界面(重置表单)
        closeAddTemplete() {
            this.templeteForm = {
                description: '',
                subIds: [],
            }
        },
        //新增模板
        async addTemplete() {
            // 校验模板列表
            if (this.templeteForm.subIds.length === 0) {
                this.$message.error("子流程勾选后需要放置到右边才生效")
                return
            }
            // 校验模板描述
            if (this.templeteForm.description === '') {
                this.$message.error("模板描述不可为空")
                return
            }
            const res = await saveTemplete(this.templeteForm)
            if (res.code === 200) {
                this.$message.success(res.data)
                this.getTempleteList()
                this.addTempleteFormVisible = false
            } else {
                this.$message.error(res.msg)
            }
        },
        //展示详情
        async showDetail(temObj) {
            // this.editTempleteForm = { ...temObj }
            this.$set(this.editTempleteForm, 'id', temObj.id);
            this.$set(this.editTempleteForm, 'description', temObj.description);
            const res = await getRelationId(temObj.id)
            // this.editTempleteForm.subIds = res.data
            console.log(res.data)
            this.$set(this.editTempleteForm, 'subIds', res.data);
            this.editTempleteFormVisible = true
            console.log(this.editTempleteForm)
        },
        // 修改模板
        async editTemplete() {
            if (this.editTempleteForm.subIds.length === 0) {
                this.$message.error("子流程勾选后需要放置到右边才生效")
                return
            }
            // 校验模板描述
            if (this.editTempleteForm.description === '') {
                this.$message.error("模板描述不可为空")
                return
            }
            const res = await updateTemplete(this.editTempleteForm)
            if (res.code === 200) {
                this.$message.success(res.data)
                this.getTempleteList()
                this.editTempleteFormVisible = false
            } else {
                this.$message.error(res.msg)
            }
        },
        //删除模板
        deleteTemplete(id) {
            this.$confirm('此操作将永久删除该模板, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                const res = await removeTemplete(id)
                if (res.code === 200) {
                    this.$message.success(res.data)
                    this.getTempleteList()
                } else {
                    this.$message.error(res.msg)
                }
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                });
            });

        }

    }
}
</script>

<style lang="less" scoped>
.query_and_add {
    margin-bottom: 10px;
}
</style>