<template>
    <div v-loading="caseInfo.length===0">
        <div class="query" style="text-align: left;">
            <!-- 专案名称 -->
            <label class="label">专案名称：</label>
            <el-input class="queryText" placeholder="请输入内容" v-model="queryText" clearable style="width: 15%;"
                @change="handleQuery">
            </el-input>

            <!-- 难度 -->
            <label class="label"> 难度: </label>
            <el-select v-model="queryLevel" placeholder="请选择难度" clearable @change="handleQuery">
                <el-option v-for="item in levels" :key="item" :label="item" :value="item">
                </el-option>
            </el-select>

            <!-- 开始时间-->
            <label class="label"> 开始时间: </label>
            <el-date-picker v-model="queryStartTime" type="daterange" align="right" unlink-panels range-separator="至"
                start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="timeOptions">
            </el-date-picker>

            <!-- 结束时间 -->
            <label class="label"> 结束时间: </label>
            <el-date-picker v-model="queryEndTime" type="daterange" align="right" unlink-panels range-separator="至"
                start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="timeOptions">
            </el-date-picker>
            <!-- 按钮 -->
            <el-button type="primary" @click="handleQuery">搜索 <i class="el-icon-search"></i></el-button>
            <el-button type="primary" @click="handleReset">重置 <i class="el-icon-s-tools"></i></el-button>
        </div>
        <el-table :data="caseInfo" scripe border style="width: 100%" max-height=600
            :default-sort="{ prop: 'doingDay', order: 'descending' }">
            <el-table-column prop="caseNumber" label="编号" width="50">
            </el-table-column>
            <el-table-column prop="name" label="任务名" width="245">
            </el-table-column>
            <el-table-column prop="level" label="难度" width="50">
            </el-table-column>
            <el-table-column prop="director" label="负责人" width="70">
            </el-table-column>
            <el-table-column prop="startTime" label="开始时间" width="100">
            </el-table-column>
            <el-table-column prop="presetTime" label="预计完成时间" width="110">
            </el-table-column>
            <el-table-column prop="finishTime" label="实际完成时间" width="110">
            </el-table-column>
            <el-table-column prop="planDay" label="计划天数" width="60">
            </el-table-column>
            <el-table-column prop="doingDay" label="执行天数" width="60">
            </el-table-column>
            <el-table-column prop="unforcedDay" label="外界因素延期" width="100">
            </el-table-column>
            <el-table-column prop="curStage" label="当前阶段" width="80">
            </el-table-column>
            <el-table-column prop="status" label="执行状态" width="100"
                :filters="[{ text: '正在执行', value: 0 }, { text: '已完成', value: 1 }, { text: '已延误', value: 2 }, { text: '延误完成', value: 3 }]"
                :filter-method="filterTag" filter-placement="bottom-end">
                <template slot-scope="scope">
                    <el-tag :type="showtype(scope.row.status)" disable-transitions>{{ number2status(scope.row.status)
                    }}</el-tag>
                </template>

            </el-table-column>
            <el-table-column label="操作">
                <template slot-scope="scope">
                    <el-button size="middle" type="info" @click="showSub(scope.row)">查看详情</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex';

export default {
    data() {
        return {
            queryText: '',
            caseInfo: [],
            levels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            queryLevel: '',
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
    },
    watch: {
        caseList: {
            handler() {
                this.caseInfo = this.caseList
            }
        }
    },
    methods: {
        ...mapMutations('caseM', ['queryCase']),
        filterTag(value, row) {
            return row.status === value;
        },
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
        },
        //查询
        handleQuery() {
            //1. 名称
            //2. 难度
            //4. 开始时间
            //5. 结束时间
            var queryObj = {}
            if(this.queryText!=='')
                queryObj.name = this.queryText
            // 难度不为空
            if (this.queryLevel !== '' && this.queryLevel !== null )
                queryObj.level = this.queryLevel

            //开始时间不为空
            if (this.queryStartTime !== null && this.queryStartTime !== '')
                queryObj.startTime = this.queryStartTime

            //结束时间不为空
            if (this.queryEndTime !== null  && this.queryEndTime !== '')
                queryObj.endTime = this.queryEndTime


            this.queryCase(queryObj)
            this.caseInfo = this.queryList
        },
        handleReset() {
            //空查询对象，保证queryList变化，让上方图形也跟随变化
            this.queryCase({})
            //清空状态
            this.queryText = ''
            this.queryLevel = null
        }
    }
}
</script>

<style scoped>
.query {
    margin-bottom: 20px;
}

.query>>>.label {
    font-size: 15px;
    display: inline;
}

.queryText {
    margin-right: 20px;
}
</style>