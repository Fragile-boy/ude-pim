<template>
    <div class="score-management-container">
        <!-- 顶部标题和操作按钮 -->
        <div class="header">
            <h2>积分管理系统</h2>
            <div class="actions">
                <el-button type="primary" @click="showAddRecordDialog">新增积分记录</el-button>
                <el-button @click="showCategoryManagement">管理积分种类</el-button>
            </div>
        </div>

        <!-- 查询条件 -->
        <div class="query-conditions">
            <el-form :inline="true" :model="queryForm" class="query-form">
                <el-form-item label="部员">
                    <AllUser v-model="queryForm.userInfo" :placeholder="'请选择用户'" :multiplable="false"></AllUser>
                </el-form-item>
                <el-form-item label="积分种类">
                    <el-cascader v-model="queryForm.categoryInfo" :options="categories" placeholder="请选择积分类型" clearable
                        filterable></el-cascader>
                </el-form-item>
                <el-form-item label="日期范围">
                    <el-date-picker v-model="queryForm.dateRange" type="daterange" range-separator="至"
                        start-placeholder="开始日期" end-placeholder="结束日期">
                    </el-date-picker>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleQuery()">查询</el-button>
                    <el-button @click="resetQuery">重置</el-button>
                </el-form-item>
            </el-form>
        </div>

        <!-- 积分记录表格 -->
        <div class="record-table">
            <el-table :data="records" border style="width: 100%" v-loading="loading">
                <el-table-column prop="userName" label="部员" width="100">
                </el-table-column>
                <el-table-column prop="categoryName" label="积分种类" width="120">
                </el-table-column>
                <el-table-column prop="scoreValue" label="积分值" width="100">
                    <template slot-scope="scope">
                        <span :class="{ 'positive': scope.row.score_value > 0, 'negative': scope.row.score_value < 0 }">
                            {{ scope.row.scoreValue }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column prop="recordDate" label="记录日期" width="120">
                </el-table-column>
                <el-table-column prop="recordedName" label="记录人" width="100">
                </el-table-column>
                <el-table-column prop="description" label="描述">
                </el-table-column>
                <el-table-column label="操作" width="180">
                    <template slot-scope="scope">
                        <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <!-- 分页组件 -->
        <div class="pagination">
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="pagination.currentPage" :page-sizes="[10, 20, 50, 100]" :page-size="pagination.pageSize"
                layout="total, sizes, prev, pager, next, jumper" :total="pagination.total">
            </el-pagination>
        </div>

        <!-- 积分记录表单对话框 -->
        <el-dialog :title="recordDialogTitle" :visible.sync="recordDialogVisible" width="50%">
            <el-form :model="recordForm" :rules="recordRules" ref="recordForm" label-width="100px">
                <el-form-item label="部员" prop="userId">
                    <AllUser v-model="recordForm.userId" :placeholder="'请选择用户'" :multiplable="false"></AllUser>
                </el-form-item>
                <el-form-item label="积分种类" prop="categoryId">
                    <el-cascader v-model="recordForm.categoryId" :options="categories" placeholder="请选择积分类型" clearable
                        filterable></el-cascader>
                </el-form-item>
                <el-form-item label="积分值" prop="scoreValue">
                    <el-input-number v-model="recordForm.scoreValue" :min="-100" :max="100"></el-input-number>
                </el-form-item>
                <el-form-item label="记录日期" prop="recordDate">
                    <el-date-picker v-model="recordForm.recordDate" type="date" format="yyyy-MM-dd"
                        value-format="yyyy-MM-dd" placeholder="选择日期">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="描述" prop="description">
                    <el-input type="textarea" v-model="recordForm.description"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="recordDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitRecordForm()">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 积分种类管理对话框 -->
        <el-dialog title="积分种类管理" :visible.sync="categoryDialogVisible" width="60%">
            <div class="category-actions">
                <el-button type="primary" @click="showAddCategoryDialog">新增积分种类</el-button>
            </div>
            <el-table :data="categories" border style="width: 100%">
                <el-table-column prop="category_id" label="ID" width="80">
                </el-table-column>
                <el-table-column prop="category_name" label="种类名称" width="150">
                </el-table-column>
                <el-table-column prop="category_type" label="类型" width="120">
                    <template slot-scope="scope">
                        <el-tag :type="scope.row.category_type === 'contribution' ? 'success' : 'warning'">
                            {{ scope.row.category_type === 'contribution' ? '贡献' : '纪律' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="description" label="描述">
                </el-table-column>
                <el-table-column prop="is_active" label="状态" width="100">
                    <template slot-scope="scope">
                        <el-switch v-model="scope.row.is_active" active-color="#13ce66" inactive-color="#ff4949"
                            :active-value="1" :inactive-value="0" @change="toggleCategoryStatus(scope.row)">
                        </el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180">
                    <template slot-scope="scope">
                        <el-button size="mini" @click="handleEditCategory(scope.row)">编辑</el-button>
                        <el-button size="mini" type="danger" @click="handleDeleteCategory(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 积分种类表单对话框 -->
            <el-dialog :title="categoryDialogTitle" :visible.sync="categoryFormDialogVisible" append-to-body
                width="50%">
                <el-form :model="categoryForm" :rules="categoryRules" ref="categoryForm" label-width="100px">
                    <el-form-item label="种类名称" prop="category_name">
                        <el-input v-model="categoryForm.category_name"></el-input>
                    </el-form-item>
                    <el-form-item label="类型" prop="category_type">
                        <el-select v-model="categoryForm.category_type" placeholder="请选择类型">
                            <el-option label="贡献" value="contribution"></el-option>
                            <el-option label="纪律" value="discipline"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="描述" prop="description">
                        <el-input type="textarea" v-model="categoryForm.description"></el-input>
                    </el-form-item>
                    <el-form-item label="状态" prop="is_active">
                        <el-switch v-model="categoryForm.is_active" active-color="#13ce66" inactive-color="#ff4949"
                            :active-value="1" :inactive-value="0">
                        </el-switch>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="categoryFormDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="submitCategoryForm">确 定</el-button>
                </span>
            </el-dialog>
        </el-dialog>
    </div>
</template>

<script>
import { getScoreCategories } from '@/api/scoreCategories'
import { getList, addRecord } from '@/api/scoreManager'
import { initScoreOptions, formatDate } from '@/utils/common'
export default {
    data() {
        return {
            // 查询表单
            queryForm: {
                userInfo: null,
                userId: null,
                categoryInfo: null,
                categoryId: null,
                dateRange: [],
                page: 1,
                pageSize: 10
            },

            // 分页配置
            pagination: {
                currentPage: 1,
                pageSize: 10,
                total: 0
            },

            // 积分记录数据
            records: [],
            loading: false,

            // 积分种类数据
            categories: initScoreOptions(),

            // 积分记录对话框
            recordDialogVisible: false,
            recordDialogTitle: '新增积分记录',
            recordForm: {
                recordId: '',
                userId: '',
                categoryId: '',
                scoreValue: 0,
                recordDate: new Date(),
                recordedBy: '',
                description: ''
            },
            recordRules: {
                user_id: [
                    { required: true, message: '请选择部员', trigger: 'blur' }
                ],
                category_id: [
                    { required: true, message: '请选择积分种类', trigger: 'change' }
                ],
                score_value: [
                    { required: true, message: '请输入积分值', trigger: 'blur' }
                ],
                record_date: [
                    { required: true, message: '请选择记录日期', trigger: 'change' }
                ]
            },

            // 积分种类对话框
            categoryDialogVisible: false,
            categoryFormDialogVisible: false,
            categoryDialogTitle: '新增积分种类',
            categoryForm: {
                category_id: '',
                category_name: '',
                category_type: 'contribution',
                description: '',
                is_active: 1
            },
            categoryRules: {
                category_name: [
                    { required: true, message: '请输入种类名称', trigger: 'blur' }
                ],
                category_type: [
                    { required: true, message: '请选择类型', trigger: 'change' }
                ]
            },

            // 当前操作模式
            currentAction: 'add'
        }
    },
    created() {
        this.fetchRecords();
        this.fetchCategories();
    },
    methods: {
        // 获取积分记录
        async fetchRecords() {
            this.loading = true;
            this.queryForm.page = this.pagination.currentPage;
            this.queryForm.pageSize = this.pagination.pageSize;
            this.queryForm.categoryId = this.queryForm.categoryInfo === null ? null : this.queryForm.categoryInfo[1]
            this.queryForm.userId = this.queryForm.userInfo === null ? null : this.queryForm.userInfo[2]
            const params = {
                userId: this.queryForm.userId,
                categoryId: this.queryForm.categoryId,
                startDate: this.queryForm.dateRange[0],
                endDate: this.queryForm.dateRange[1],
                page: this.queryForm.page,
                pageSize: this.queryForm.pageSize
            }
            const res = await getList(params);
            if (res.code === 200) {
                this.records = res.data.records;
                this.pagination.total = this.records.length;
                this.loading = false;
            }
        },

        // 获取积分种类
        async fetchCategories() {
            // 这里应该是API调用，示例中使用模拟数据
            const res = await getScoreCategories();
            if (res.code === 200) {
                Object.entries(res.data).forEach(([key, value]) => {
                    for (var i = 0; i < this.categories.length; i++) {
                        if (this.categories[i].value === key) {
                            for (var j = 0; j < value.length; j++) {
                                this.categories[i].children.push({
                                    value: value[j].categoryId,
                                    label: value[j].categoryName,
                                })
                            }
                        }
                    }
                })
            } else {
                this.$message.error("获取积分种类失败");
                this.$message.error(res.msg);
            }
        },

        // 查询处理
        handleQuery() {
            this.pagination.currentPage = 1;
            this.fetchRecords();
        },

        // 重置查询
        resetQuery() {
            this.queryForm = {
                userInfo: null,
                userId: null,
                categoryInfo: null,
                categoryId: null,
                dateRange: [],
                page: 1,
                pageSize: 10
            };
            this.handleQuery();
        },

        // 分页大小变化
        handleSizeChange(val) {
            this.pagination.pageSize = val;
            this.fetchRecords();
        },

        // 当前页变化
        handleCurrentChange(val) {
            this.pagination.currentPage = val;
            this.fetchRecords();
        },

        // 显示新增记录对话框
        showAddRecordDialog() {
            this.currentAction = 'add';
            this.recordDialogTitle = '新增积分记录';
            this.recordForm = {
                recordId: '',
                userId: '',
                categoryId: '',
                scoreValue: 0,
                recordDate: new Date(),
                recordedBy: '',
                description: ''
            };
            this.recordDialogVisible = true;
            this.$nextTick(() => {
                this.$refs.recordForm.clearValidate();
            });
        },

        // 编辑记录
        handleEdit(row) {
            this.currentAction = 'edit';
            this.recordDialogTitle = '编辑积分记录';
            this.recordForm = Object.assign({}, row);
            this.recordDialogVisible = true;
            this.$nextTick(() => {
                this.$refs.recordForm.clearValidate();
            });
        },

        // 删除记录
        handleDelete(row) {
            this.$confirm('确认删除该积分记录吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                // 这里应该是API调用删除记录
                this.$message({
                    type: 'success',
                    message: '删除成功!'
                });
                this.fetchRecords();
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                });
            });
        },

        // 提交记录表单
        submitRecordForm() {
            this.$refs.recordForm.validate(async valid => {
                if (valid) {
                    this.recordForm.userId = this.recordForm.userId[2];
                    this.recordForm.categoryId = this.recordForm.categoryId[1];
                    console.log(this.recordForm)
                    this.recordForm.recordDate = formatDate(this.recordForm.recordDate);
                    // 这里应该是API调用保存记录
                    const res = await addRecord(this.recordForm);
                    if (res.code !== 200) {
                        this.$message.error(res.msg);
                        return false;
                    }
                    this.$message({
                        message: this.currentAction === 'add' ? '添加成功' : '修改成功',
                        type: 'success'
                    });
                    this.recordDialogVisible = false;
                    this.fetchRecords();
                } else {
                    return false;
                }
            });
        },

        // 显示积分种类管理对话框
        showCategoryManagement() {
            this.categoryDialogVisible = true;
        },

        // 显示新增种类对话框
        showAddCategoryDialog() {
            this.currentAction = 'add';
            this.categoryDialogTitle = '新增积分种类';
            this.categoryForm = {
                category_id: '',
                category_name: '',
                category_type: 'contribution',
                description: '',
                is_active: 1
            };
            this.categoryFormDialogVisible = true;
            this.$nextTick(() => {
                this.$refs.categoryForm.clearValidate();
            });
        },

        // 编辑积分种类
        handleEditCategory(row) {
            this.currentAction = 'edit';
            this.categoryDialogTitle = '编辑积分种类';
            this.categoryForm = Object.assign({}, row);
            this.categoryFormDialogVisible = true;
            this.$nextTick(() => {
                this.$refs.categoryForm.clearValidate();
            });
        },

        // 删除积分种类
        handleDeleteCategory(row) {
            this.$confirm('确认删除该积分种类吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                // 这里应该是API调用删除种类
                this.$message({
                    type: 'success',
                    message: '删除成功!'
                });
                this.fetchCategories();
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                });
            });
        },

        // 切换积分种类状态
        toggleCategoryStatus(row) {
            // 这里应该是API调用更新状态
            this.$message({
                message: '状态更新成功',
                type: 'success'
            });
        },

        // 提交种类表单
        submitCategoryForm() {
            this.$refs.categoryForm.validate(valid => {
                if (valid) {
                    // 这里应该是API调用保存种类
                    this.$message({
                        message: this.currentAction === 'add' ? '添加成功' : '修改成功',
                        type: 'success'
                    });
                    this.categoryFormDialogVisible = false;
                    this.fetchCategories();
                } else {
                    return false;
                }
            });
        }
    }
}
</script>

<style scoped>
.score-management-container {
    padding: 20px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.query-conditions {
    background-color: #f5f7fa;
    padding: 20px;
    margin-bottom: 20px;
    border-radius: 4px;
}

.query-form {
    display: flex;
    flex-wrap: wrap;
}

.pagination {
    margin-top: 20px;
    text-align: right;
}

.positive {
    color: #67c23a;
    font-weight: bold;
}

.negative {
    color: #f56c6c;
    font-weight: bold;
}

.category-actions {
    margin-bottom: 20px;
}
</style>