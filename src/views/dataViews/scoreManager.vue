<template>
    <div class="score-management-container">
        <!-- 顶部标题和操作按钮 -->
        <div class="header">
            <h2>积分管理</h2>
            <div class="actions">
                <el-button type="primary" @click="showAddRecordDialog">新增积分记录</el-button>
                <el-button type="warning" @click="showCategoryManagement">管理积分种类</el-button>
            </div>
        </div>

        <!-- 查询条件 -->
        <div class="query-conditions">
            <el-form :inline="true" :model="queryForm" class="query-form">
                <el-form-item label="部员">
                    <AllUser v-model="queryForm.userInfo" :placeholder="'请选择用户'" :multiplable="false"></AllUser>
                </el-form-item>
                <el-form-item label="积分类型">
                    <el-select v-model="queryForm.categoryType" placeholder="请选择积分类型" clearable>
                        <el-option label="全部" :value="null"></el-option>
                        <el-option label="纪律" value="discipline"></el-option>
                        <el-option label="贡献" value="contribution"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="积分种类">
                    <el-cascader v-model="queryForm.categoryInfo" :options="categories" placeholder="请选择积分类型" clearable
                        filterable></el-cascader>
                </el-form-item>
                <el-form-item label="日期范围">
                    <el-date-picker v-model="queryForm.dateRange" type="daterange" range-separator="至"
                        start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions">
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
            <el-table :data="records" border style="width: 100%" v-loading="loading" :cell-style="{ textAlign: 'center' }"
                :header-cell-style="{ textAlign: 'center' }" :default-sort="{ prop: 'recordDate', order: 'descending' }">
                <el-table-column prop="userName" label="部员" width="100">
                </el-table-column>
                <el-table-column prop="categoryName" label="积分名称" width="240">
                    <template slot-scope="scope">
                        <div :class="['category-type', scope.row.categoryType]">
                            <i
                                :class="scope.row.categoryType === 'discipline' ? 'el-icon-warning' : 'el-icon-star-on'"></i>
                            {{ scope.row.categoryName }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="scoreValue" label="积分值" width="100">
                    <template slot-scope="scope">
                        <span :class="{ 'positive': scope.row.scoreValue > 0, 'negative': scope.row.scoreValue < 0 }">
                            {{ scope.row.scoreValue }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column prop="recordDate" label="记录日期" width="120" sortable>
                </el-table-column>
                <el-table-column prop="recordedName" label="记录人" width="100">
                </el-table-column>
                <el-table-column prop="description" label="描述">
                </el-table-column>
                <el-table-column label="操作" width="180">
                    <template slot-scope="scope">
                        <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button size="mini" type="danger" @click="handleDelete(scope.row.recordId)">删除</el-button>
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
        <el-dialog title="积分种类管理" :visible.sync="categoryDialogVisible" width="60%" @close="fetchCategories()">
            <div class="category-actions">
                <el-button type="primary" @click="showAddCategoryDialog">新增积分种类</el-button>
            </div>
            <el-table :data="categoryList" border style="width: 100%">
                <el-table-column prop="categoryId" label="ID" width="80">
                </el-table-column>
                <el-table-column prop="categoryName" label="种类名称" width="150">
                </el-table-column>
                <el-table-column prop="categoryType" label="类型" width="120">
                    <template slot-scope="scope">
                        <el-tag effect="dark" type="success" v-if="scope.row.categoryType === 'contribution'">贡献</el-tag>
                        <el-tag effect="dark" type="danger"
                            v-else-if="scope.row.categoryType === 'discipline'">纪律</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="description" label="描述">
                </el-table-column>
                <el-table-column prop="active" label="启用" width="100">
                    <template slot-scope="scope">
                        <el-switch v-model="scope.row.active" active-color="#13ce66" inactive-color="#ff4949"
                            @change="toggleCategoryStatus(scope.row)">
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
                    <el-form-item label="种类名称" prop="categoryName">
                        <el-input v-model="categoryForm.categoryName"></el-input>
                    </el-form-item>
                    <el-form-item label="类型" prop="category_type">
                        <el-select v-model="categoryForm.categoryType" placeholder="请选择类型">
                            <el-option label="贡献" value="contribution"></el-option>
                            <el-option label="纪律" value="discipline"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="描述" prop="description">
                        <el-input type="textarea" v-model="categoryForm.description"></el-input>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="categoryFormDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="submitCategoryForm()">确 定</el-button>
                </span>
            </el-dialog>
        </el-dialog>

        <score-charts ref="scoreCharts"></score-charts>
    </div>
</template>

<script>
import { updateScoreCategory, getScoreCategories, getScoreCategoriesList, addScoreCategory, deleteScoreCategory } from '@/api/scoreCategories'
import { getList, addRecord, deleteRecord, editRecord } from '@/api/scoreManager'
import { initScoreOptions, formatDate } from '@/utils/common'
import ScoreCharts from '@/components/ScoreComponents/ScoreCharts'
export default {
    components: {
        ScoreCharts
    },
    data() {
        return {
            // 查询表单
            queryForm: {
                userInfo: null,
                userId: null,
                categoryInfo: null,
                categoryId: null,
                dateRange: this.getCurrentMonthRange(),
                page: 1,
                pageSize: 10,
                categoryType: null // 积分种类
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
            // 积分种类列表
            categoryList: [],
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
                categoryId: null,
                categoryName: '',
                categoryType: 'contribution',
                description: ''
            },
            categoryRules: {
                categoryName: [
                    { required: true, message: '请输入种类名称', trigger: 'blur' }
                ],
                categoryType: [
                    { required: true, message: '请选择类型', trigger: 'change' }
                ]
            },

            // 当前操作模式
            currentAction: 'add',
            // 从子组件传递过来的辅助信息
            usersList: [],
            pickerOptions: {
                shortcuts: [
                    {
                        text: '上个月',
                        onClick(picker) {
                            const now = new Date();
                            const year = now.getFullYear();
                            const month = now.getMonth();

                            const startDate = new Date(year, month - 1, 1);
                            const endDate = new Date(year, month, 0);

                            picker.$emit('pick', [startDate, endDate]);
                        }
                    },
                    {
                        text: '本月',
                        onClick(picker) {
                            const now = new Date();
                            const year = now.getFullYear();
                            const month = now.getMonth();

                            const startDate = new Date(year, month, 1);
                            const endDate = new Date(year, month, now.getDate());

                            picker.$emit('pick', [startDate, endDate]);
                        }
                    },
                    {
                        text: '半年内',
                        onClick(picker) {
                            const now = new Date();
                            const year = now.getFullYear();

                            const startDate = new Date(year, 0, 1);
                            const endDate = new Date(year, now.getMonth(), now.getDate());

                            picker.$emit('pick', [startDate, endDate]);
                        }
                    },
                    {
                        text: '今年',
                        onClick(picker) {
                            const now = new Date();
                            const year = now.getFullYear();

                            const startDate = new Date(year, 0, 1);
                            const endDate = new Date(year, 11, 31);

                            picker.$emit('pick', [startDate, endDate]);
                        }
                    },
                    {
                        text: '去年',
                        onClick(picker) {
                            const now = new Date();
                            const year = now.getFullYear() - 1;

                            const startDate = new Date(year, 0, 1);
                            const endDate = new Date(year, 11, 31);

                            picker.$emit('pick', [startDate, endDate]);
                        }
                    }
                ]
            },
        }
    },
    created() {
        this.fetchRecords();
        this.fetchCategories();
    },
    methods: {
        // 获取本月日期范围
        getCurrentMonthRange() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);
        
        return [
            formatDate(startDate),
            formatDate(endDate)
        ];
        },
        // 获取积分记录
        async fetchRecords() {
            this.loading = true;
            this.queryForm.page = this.pagination.currentPage;
            this.queryForm.pageSize = this.pagination.pageSize;
            this.queryForm.categoryId = this.queryForm.categoryInfo === null ? null : this.queryForm.categoryInfo[1]
            this.queryForm.userId = this.queryForm.userInfo === null ? null : this.queryForm.userInfo[2]
            const tableParams = {
                userId: this.queryForm.userId,
                categoryId: this.queryForm.categoryId,
                categoryType: this.queryForm.categoryType,
                startDate: this.queryForm.dateRange && this.queryForm.dateRange[0] ? this.queryForm.dateRange[0] : null,
                endDate: this.queryForm.dateRange && this.queryForm.dateRange[1] ? this.queryForm.dateRange[1] : null,
                page: this.queryForm.page,
                pageSize: this.queryForm.pageSize
            }
            // 获取图表数据（不分页）
            const chartParams = {
                ...tableParams,
                page: 1,
                pageSize: 10000 // 设置一个足够大的值获取所有数据
            };

            try {
                // 并行请求表格数据和图表数据
                const [tableRes, chartRes] = await Promise.all([
                    getList(tableParams),
                    getList(chartParams)
                ]);

                if (tableRes.code === 200 && chartRes.code === 200) {
                    this.records = tableRes.data.records;
                    this.pagination.total = tableRes.data.total;

                    // 安全引用图表组件
                    if (this.$refs.scoreCharts && this.$refs.scoreCharts.updateCharts) {
                        this.$refs.scoreCharts.updateCharts(chartRes.data.records);
                    } else {
                        console.warn('图表组件未正确初始化或缺少updateCharts方法');
                    }
                }
            } catch (error) {
                console.error('获取数据失败:', error);
            } finally {
                this.loading = false;
            }
        },

        // 获取积分种类
        async fetchCategories() {
            // 这里应该是API调用，示例中使用模拟数据
            const res = await getScoreCategories();
            if (res.code === 200) {
                // 先清空原有数据
                this.categories = initScoreOptions();
                // 再添加新数据
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
                pageSize: 10,
                categoryType: null
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
        // 根据ID查找完整路径
        findCategoryPath(id, root, path = []) {
            for (let category of root) {
                const currentPath = [...path, category.value]
                if (category.value === id) {
                    return currentPath
                }
                if (category.children && category.children.length > 0) {
                    const foundPath = this.findCategoryPath(id, category.children, currentPath)
                    if (foundPath) return foundPath
                }
            }
            return null
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
        handleDelete(id) {
            this.$confirm('确认删除该积分记录吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                // 这里应该是API调用删除记录
                const res = await deleteRecord(id);
                if (res.code !== 200) {
                    this.$message.error('删除失败');
                    this.$message.error(res.msg);
                    return false;
                }
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
                    this.recordForm.userId = Array.isArray(this.recordForm.userId) ? this.recordForm.userId[2] : this.recordForm.userId;
                    this.recordForm.categoryId = Array.isArray(this.recordForm.categoryId) ? this.recordForm.categoryId[1] : this.recordForm.categoryId;
                    this.recordForm.recordDate = formatDate(this.recordForm.recordDate);
                    // 这里应该是API调用保存记录
                    if (this.currentAction === 'add') {
                        const res = await addRecord(this.recordForm);
                        if (res.code !== 200) {
                            this.$message.error(res.msg);
                            return false;
                        }
                    } else {
                        const res = await editRecord(this.recordForm);
                        if (res.code !== 200) {
                            this.$message.error(res.msg);
                            return false;
                        }
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
        async showCategoryManagement() {
            await this.fenchCategoryList();
            this.categoryDialogVisible = true;
        },

        // 显示新增种类对话框
        showAddCategoryDialog() {
            this.currentAction = 'add';
            this.categoryDialogTitle = '新增积分种类';
            this.categoryForm = {
                categoryId: null,
                categoryName: '',
                categoryType: 'contribution',
                description: ''
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
            console.log(row)
            this.$confirm('确认删除该积分种类吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                const res = await deleteScoreCategory(row.categoryId);
                if (res.code !== 200) {
                    this.$message.error('删除失败');
                    return false;
                }
                // 这里应该是API调用删除种类
                this.$message({
                    type: 'success',
                    message: '删除成功!'
                });
                this.fenchCategoryList();
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                });
            });
        },

        // 切换积分种类状态
        async toggleCategoryStatus(row) {
            const res = await updateScoreCategory(row);
            if (res.code !== 200) {
                this.$message.error('状态更新失败');
                return false;
            }
            // 这里应该是API调用更新状态
            this.$message({
                message: '状态更新成功',
                type: 'success'
            });
            // this.fenchCategoryList();
        },

        // 提交种类表单
        submitCategoryForm() {
            this.$refs.categoryForm.validate(async valid => {
                if (valid) {
                    var res;
                    if (this.currentAction === 'add') {
                        res = await addScoreCategory(this.categoryForm);
                    } else {
                        res = await updateScoreCategory(this.categoryForm);
                    }
                    if (res.code !== 200) {
                        this.$message.error(res.msg);
                        return false;
                    }
                    // 这里应该是API调用保存种类
                    this.$message({
                        message: this.currentAction === 'add' ? '添加成功' : '修改成功',
                        type: 'success'
                    });
                    this.categoryFormDialogVisible = false;
                    this.fenchCategoryList();
                } else {
                    return false;
                }
            });
        },
        async fenchCategoryList() {
            const res = await getScoreCategoriesList();
            if (res.code === 200) {
                this.categoryList = res.data;
            } else {
                this.$message.error("获取积分种类列表失败");
            }
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

.category-actions {
    margin-bottom: 20px;
}

.category-type {
    display: flex;
    align-items: center;
}

.category-type.contribution {
    color: #67C23A;
}

.category-type.discipline {
    color: #F56C6C;
}

.category-type i {
    margin-right: 5px;
}
</style>