<template>
    <div>
        <div>
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>部员管理</el-breadcrumb-item>
                <el-breadcrumb-item>部员专案管理</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <el-card>
            <!-- 搜索区域 -->
            <el-row :gutter="20">
                <el-col :span="2">
                    <el-button type="warning" icon="el-icon-right" @click="openCharts">图表统计</el-button>
                </el-col>

                <el-col :span="3">
                    <el-select v-model="curType" placeholder="请选择任务类型" clearable @change="handleTypeChange()">
                        <el-option v-for="item in [{
                            value: 0,
                            label: '专案类'
                        }, {
                            value: 1,
                            label: '临时事务'
                        }, {
                            value: 2,
                            label: '技术研究'
                        }]" :key="item.value" :label="item.label" :value="item.value">
                        </el-option>
                    </el-select>
                </el-col>

                <el-col :span="6">
                    <el-date-picker v-model="start_stop_time" type="daterange" align="left" unlink-panels
                        range-separator="——" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="timeOptions"
                        value-format="yyyy-MM-dd">
                    </el-date-picker>
                </el-col>

                <el-col :span="2">
                    <el-button type="primary" @click="filter()">查询</el-button>
                </el-col>

                <el-col :span="3" :offset="8">
                    <el-select v-model="curUser" placeholder="请选择科员" @change="handleUserChange()">
                        <el-option-group v-for="group in directorOptions" :key="group.value" :label="group.label">
                            <el-option v-for="item in group.children" :key="item.value" :label="item.label"
                                :value="item.value">
                            </el-option>
                        </el-option-group>
                    </el-select>
                </el-col>
            </el-row>

            <el-table :data="showList" :default-sort="{ prop: 'finishTime', order: 'descending' }"
                @sort-change="handlesortChange">
                <el-table-column label="类型">
                    <template slot-scope="scope">
                        <el-tag effect="dark" type="success" v-if="scope.row.caseSubId">专案类</el-tag>
                        <el-tag effect="dark" v-else-if="scope.row.type === 2">技术研究</el-tag>
                        <el-tag effect="dark" type="warning" v-else-if="scope.row.type === 1">临时事务</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="description" label="描述"></el-table-column>
                <el-table-column prop="startTime" sortable="custom" label="开始时间"></el-table-column>
                <el-table-column prop="finishTime" sortable label="完成时间"></el-table-column>
                <el-table-column prop="planDays" sortable label="计划时间"></el-table-column>
                <el-table-column prop="executionDays" sortable label="执行时间"></el-table-column>
                <el-table-column prop="unforcedDays" sortable label="外因延期"></el-table-column>
                <el-table-column prop="applyDelay" sortable label="人为延期"></el-table-column>
                <el-table-column prop="achievingRate" sortable label="达成率(%)"></el-table-column>
                <el-table-column label="是否延误">
                    <template slot-scope="scope">
                        <el-tag effect="dark" type="danger" v-if="scope.row.isDelay">延误</el-tag>
                        <el-tag effect="dark" type="success" v-else>正常</el-tag>
                    </template>
                </el-table-column>

            </el-table>
            <!-- 分页区域 -->
            <el-pagination style="margin-top: 10px;text-align: center;" @size-change="handleSizeChange"
                @current-change="handleCurrentChange" :current-page.sync="pageInfo.page" :page-sizes="[8, 10, 15, 20]"
                :page-size="pageInfo.pageSize" layout="total, sizes, prev, pager, next" :total="total">
            </el-pagination>
        </el-card>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import { allFinishTask } from '@/api/task'
import { timeSub } from '@/utils/common';
import { getUserList } from '@/api/user'
export default {
    name: 'userStatistics',
    data() {
        return {
            showList: [],
            filterList: [],
            allTaskList: [],
            pageInfo: {
                page: 1,
                pageSize: 8
            },
            total: 0,
            //筛选条件
            start_stop_time: null,
            timeOptions: {
                shortcuts: [{
                    text: '最近一月',
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: '最近三个月',
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: '最近半年',
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 180);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: '最近一年',
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 365);
                        picker.$emit('pick', [start, end]);
                    }
                }]
            },
            //当前查看的类型
            curType: null,
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
            ],
            curUser: {},
        }
    },
    created() {
        var pageSize = +localStorage.getItem("pim_user_statistics_pageSize")
        this.pageInfo.pageSize = pageSize === 0 ? 8 : pageSize

    },
    async mounted() {
        await this.getAllUser()
        this.curUser = this.directorOptions[0].children[0].value
        console.log(this.curUser)
        this.getFinishedTaskList();
    },
    methods: {
        async getFinishedTaskList() {
            const res = await allFinishTask(this.curUser)
            if (res.code === 200) {
                this.allTaskList = res.data
                this.total = this.allTaskList.length
                this.allTaskList.forEach(s => {
                    s.executionDays = timeSub(s.startTime, s.finishTime)
                    s.achievingRate = +((s.planDays + +s.unforcedDays) * 100 / s.executionDays).toFixed(0)
                    s.isDelay = s.achievingRate < 100
                })
                this.filterList = this.allTaskList
                this.showList = this.filterList.slice((this.pageInfo.page - 1) * this.pageInfo.pageSize, this.pageInfo.page * this.pageInfo.pageSize)
            } else {
                this.$message.error(res.msg)
            }
        },
        handleSizeChange(value) {
            localStorage.setItem("pim_user_statistics_pageSize", value)
            this.pageInfo.pageSize = value
            this.pageInfo.page = 1
            this.showList = this.filterList.slice((this.pageInfo.page - 1) * this.pageInfo.pageSize, this.pageInfo.page * this.pageInfo.pageSize)
        },
        handleCurrentChange(value) {
            this.pageInfo.page = value
            this.showList = this.filterList.slice((this.pageInfo.page - 1) * this.pageInfo.pageSize, this.pageInfo.page * this.pageInfo.pageSize)
        },
        handlesortChange(column) {
            if (column.order === 'ascending')
                column.order = 1
            else if (column.order === 'descending')
                column.order = -1
            else {
                column.order = -1
                column.prop = 'finishTime'
            }
            this.filterList.sort((a, b) => {
                if (a[column.prop] < b[column.prop])
                    return -1 * column.order
                else if (a[column.prop] > b[column.prop])
                    return 1 * column.order
                else return 0
            })
            this.showList = this.filterList.slice((this.pageInfo.page - 1) * this.pageInfo.pageSize, this.pageInfo.page * this.pageInfo.pageSize)
        },
        filter() {
            if (this.start_stop_time === null) {
                this.getFinishedTaskList()
                return
            }
            const start = this.start_stop_time[0]
            const end = this.start_stop_time[1]
            this.filterList = this.allTaskList.filter(item => item.finishTime >= start && item.finishTime <= end)
            this.pageInfo.page = 1
            this.showList = this.filterList.slice((this.pageInfo.page - 1) * this.pageInfo.pageSize, this.pageInfo.page * this.pageInfo.pageSize)
            this.total = this.filterList.length
        },
        openCharts() {
            this.$router.push({
                name: 'userChart',
                query: {
                    allTaskList: this.filterList,
                    start_stop_time: this.start_stop_time
                }
            })
        },
        async getAllUser() {
            //获取所有科员信息
            var { data: res } = await getUserList()
            console.log(res)
            for (var i = 0; i < res.length; i++) {
                this.directorOptions[res[i].status].children.push({ value: res[i].id, label: res[i].name })
            }
        },
        //选中科员变化回调参数
        handleUserChange() {
            this.start_stop_time = null
            this.curType = null
            this.getFinishedTaskList()
        },
        //选中类型变化后的回调函数
        handleTypeChange() {
            //先初始化filterList()
            if (this.start_stop_time) {
                const start = this.start_stop_time[0]
                const end = this.start_stop_time[1]
                this.filterList = this.allTaskList.filter(item => item.finishTime >= start && item.finishTime <= end)
            } else {
                this.filterList = this.allTaskList
            }
            if (this.curType === '') {
                this.filterList = this.filterList
            }
            else if (this.curType === 0) {
                this.filterList = this.filterList.filter(i => i.caseSubId)
            } else
                this.filterList = this.filterList.filter(i => i.type === this.curType)
            this.pageInfo.page = 1
            this.showList = this.filterList.slice((this.pageInfo.page - 1) * this.pageInfo.pageSize, this.pageInfo.page * this.pageInfo.pageSize)
            this.total = this.filterList.length
        }
    }
}
</script>

<style lang="less" scoped>
.el-row {
    margin-bottom: 10px;
}
</style>