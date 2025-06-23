<template>
    <div class="score-management-container">
        <!-- 顶部标题和操作按钮 -->
        <div class="header">
            <h2>积分统计</h2>
        </div>

        <!-- 查询条件 -->
        <div class="query-conditions">
            <el-form :inline="true" :model="queryForm" class="query-form">
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
            <el-table :data="records" border style="width: 100%" v-loading="loading"
                :cell-style="{ textAlign: 'center' }" :header-cell-style="{ textAlign: 'center' }"
                :default-sort="{ prop: 'recordDate', order: 'descending' }">
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
                <el-table-column prop="recordDate" sortable label="记录日期" width="120">
                </el-table-column>
                <el-table-column prop="recordedName" label="记录人" width="100">
                </el-table-column>
                <el-table-column prop="description" label="描述">
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
        <score-charts ref="scoreCharts"></score-charts>
    </div>
</template>

<script>
import { getScoreCategories } from '@/api/scoreCategories'
import { getList } from '@/api/scoreManager'
import { initScoreOptions, formatDate } from '@/utils/common'
import { mapState } from 'vuex'
import ScoreCharts from '@/components/ScoreComponents/ScoreCharts'
export default {
    components: {
        ScoreCharts
    },
    data() {
        return {
            // 查询表单
            queryForm: {
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
    computed: {
        ...mapState(['user'])
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
            this.queryForm.userId = this.user.id
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