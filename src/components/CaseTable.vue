<template>
    <div class="indexTable">
        <div class="query" style="margin-bottom: 15px;">
            <el-row :gutter="20">
                <!-- 专案名称 -->
                <el-col :span="4">
                    <el-input class="queryText" placeholder="请输入专案名称" v-model="queryText" clearable @change="handleQuery">
                    </el-input>
                </el-col>

                <!-- 难度 -->
                <el-col :span="4">
                    <el-select v-model="queryStatus" placeholder="请选择执行状态" clearable @change="handleQuery">
                        <el-option v-for="item in levels" :key="item" :label="item" :value="item">
                        </el-option>
                    </el-select>
                </el-col>

                <el-col :span="2">
                    <!-- 按钮 -->
                    <el-button type="primary" @click="handleQuery">搜索 <i class="el-icon-search"></i></el-button>
                </el-col>

                <el-col :span="2">
                    <!-- 按钮 -->
                    <el-button type="primary" @click="handleReset">重置 <i class="el-icon-s-tools"></i></el-button>
                </el-col>

            </el-row>
        </div>

        <el-table :data="pageInfo" border stripe max-height=600 :default-sort="{ prop: 'doingDay', order: 'descending' }">
            <el-table-column type="index" label="编号" width="50">
            </el-table-column>
            <el-table-column prop="name" label="任务名" width="245">
            </el-table-column>
            <el-table-column prop="level" label="难度" width="50">
            </el-table-column>
            <el-table-column prop="directorName" label="负责人" width="70">
            </el-table-column>
            <el-table-column prop="startTime" label="开始时间" width="110">
            </el-table-column>
            <el-table-column prop="presetTime" label="预计完成时间" width="110">
            </el-table-column>
            <el-table-column prop="finishTime" label="实际完成时间" width="110">
            </el-table-column>
            <el-table-column prop="planDay" label="计划天数" width="90">
            </el-table-column>
            <el-table-column prop="doingDay" label="执行天数" width="90">
            </el-table-column>
            <el-table-column prop="unforcedDay" label="外界因素延期" width="110">
            </el-table-column>
            <el-table-column prop="curStage" label="当前阶段" width="120">
            </el-table-column>
            <el-table-column prop="status" label="执行状态" width="100">
                <template slot-scope="scope">
                    <el-tag :type="showtype(scope.row.status)" disable-transitions>{{ number2status(scope.row.status)
                    }}</el-tag>
                </template>

            </el-table-column>
            <el-table-column label="操作" width="120">
                <template slot-scope="scope">
                    <el-button size="middle" type="info" @click="showSub(scope.row)">查看详情</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- 分页区域 -->
        <el-pagination style="margin-top: 10px;text-align: left;" @size-change="handleSizeChange"
            @current-change="handleCurrentChange" :current-page.sync="page" :page-sizes="[5, 7, 10, 20]" :page-size="size"
            layout="total, sizes, prev, pager, next" :total="total">
        </el-pagination>
    </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex';

export default {
    data() {
        return {
            pageInfo: [],
            page: 1,
            size: 7,
            total: 0,
            queryText: '',
            caseInfo: [],
            levels: ['正在执行', '已延误', '正常完成', '延误完成', '中断'],
            queryStatus: '',
            queryStartTime: '',
            queryEndTime: '',
            timeOptions: {
                shortcuts: [{
                    text: '最近一个月',
                    onClick(picker) {
                        const end = new Date();
                        var start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                        const year = start.getFullYear();
                        const month = (start.getMonth() + 1).toString().padStart(2, '0');
                        start = new Date(`${year}-${month}-01`)
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: '最近三个月',
                    onClick(picker) {
                        const end = new Date();
                        var start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                        const year = start.getFullYear();
                        const month = (start.getMonth() + 1).toString().padStart(2, '0');
                        start = new Date(`${year}-${month}-01`)
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: '最近半年',
                    onClick(picker) {
                        const end = new Date();
                        var start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 180);
                        const year = start.getFullYear();
                        const month = (start.getMonth() + 1).toString().padStart(2, '0');
                        start = new Date(`${year}-${month}-01`)
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: '今年到今天',
                    onClick(picker) {
                        const end = new Date();
                        var start = new Date();
                        start = start.getFullYear() + "-01-01"
                        console.log(start)
                        start = new Date(start)
                        picker.$emit('pick', [start, end]);
                    }
                }]
            }
        }
    },
    computed: {
        ...mapState('caseM', ['caseList', 'queryList'])
    },
    created() {
        this.caseInfo = this.caseList
        console.log(this.caseInfo)
        this.getTableDate()
    },
    watch: {
        queryList: {
            handler() {
                this.caseInfo = this.queryList
            }
        },
        caseList: {
            handler() {
                this.caseInfo = this.caseList
            }
        },
        caseInfo: {
            handler() {
                this.getTableDate()
            }
        }
    },
    methods: {
        ...mapMutations('caseM', ['queryCase']),
        showSub(row) {
            this.$router.push({
                name: 'case-sub',
                query: {
                    caseId: row.id,
                    caseName: row.name
                }
            })
        },
        showtype(tag) {
            if (tag === 0)
                return "primary"
            else if (tag === 1)
                return "success"
            else if (tag === 2)
                return "danger"
            else if (tag === 3)
                return "warning"
        },
        number2status(status) {
            if (status === 0)
                return "正在执行"
            else if (status === 1)
                return "正常完成"
            else if (status === 2)
                return "已延误"
            else if (status === 3)
                return "延误完成"
            else if (status === 4)
                return "未开始"
            else if (status === 5)
                return "中断"
        },
        transformStatus(status) {
            if (status === "正在执行")
                return 0
            else if (status === "正常完成")
                return 1
            else if (status === "已延误")
                return 2
            else if (status === "延误完成")
                return 3
            else if (status === "未开始")
                return 4
            else if (status === "中断")
                return 5
        },
        //查询
        handleQuery() {
            //1. 名称
            //2. 难度
            //4. 开始时间
            //5. 结束时间
            var queryObj = {}
            if (this.queryText !== '')
                queryObj.name = this.queryText
            // 状态不为空
            if (this.queryStatus !== '' && this.queryStatus !== null) {
                // this.queryStatus = this.transformStatus(this.queryStatus)
                queryObj.status = this.transformStatus(this.queryStatus)
            }

            //开始时间不为空
            if (this.queryStartTime !== null && this.queryStartTime !== '')
                queryObj.startTime = this.queryStartTime

            //结束时间不为空
            if (this.queryEndTime !== null && this.queryEndTime !== '')
                queryObj.endTime = this.queryEndTime


            this.queryCase(queryObj)

            this.page = 1
            // this.caseInfo = this.queryList
        },
        handleReset() {
            //空查询对象，保证queryList变化，让上方图形也跟随变化
            this.queryCase({})
            //清空状态
            this.queryText = ''
            this.queryLevel = null
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
        getTableDate() {
            this.pageInfo = this.caseInfo.slice((this.page - 1) * this.size,
                this.page * this.size)
            this.total = this.caseInfo.length
        }
    }
}
</script>

<style scoped></style>