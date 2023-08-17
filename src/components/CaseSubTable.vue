<template>
    <div class="subInfo">
        <label class="caseName">{{ caseName }}</label>
        <div class="table">
            <div class="subTable">
                <el-table :data="subInfo" scope border :max-height=1080
                    @cell-dblclick="getCaseByUserName">
                    
                    <el-table-column prop="subName" label="子流程" width="90">
                    </el-table-column>

                    <el-table-column prop="number" label="专案下序号" width="100">
                    </el-table-column>

                    <el-table-column prop="level" label="难度" width="50">
                    </el-table-column>

                    <el-table-column prop="chargeName[0]" label="负责人1" width="80">
                    </el-table-column>

                    <el-table-column prop="chargeName[1]" label="负责人2" width="80">
                    </el-table-column>

                    <el-table-column prop="chargeName[2]" label="负责人3" width="80">
                    </el-table-column>

                    <el-table-column prop="startTime" label="开始时间" width="100">
                    </el-table-column>

                    <!-- 阶段目标时间：实际开始时间+预设时间 -->
                    <el-table-column prop="targetTime" label="阶段目标时间" width="110">
                    </el-table-column>

                    <!-- 目标完成时间：实际开始时间+预设时间+外界因素延期 -->
                    <el-table-column prop="standardTime" label="目标完成时间" width="110">
                    </el-table-column>

                    <!-- 理想完成时间：所有流程都正常结束的时间 -->
                    <el-table-column prop="ideaTime" label="预计完成时间" width="110">
                    </el-table-column>

                    <el-table-column prop="finishTime" label="实际结束时间" width="110">
                    </el-table-column>

                    <el-table-column prop="planDays" label="计划时间" width="110">
                    </el-table-column>

                    <el-table-column prop="unforcedDays" label="外界因素延期" width="110">
                    </el-table-column>

                    <el-table-column prop="status" label="执行状态" width="100"
                        :filters="[{ text: '正在执行', value: '正在执行' }, { text: '正常完成', value: '正常完成' }, { text: '已延误', value: '已延误' }, { text: '延误完成', value: '延误完成' }]"
                        :filter-method="filterTag" filter-placement="bottom-end">
                        <template slot-scope="scope">
                            <el-tag :type="showtype(scope.row.status)" disable-transitions>{{
                                number2status(scope.row.status)
                            }}</el-tag>
                        </template>

                    </el-table-column>

                    <el-table-column label="操作" width="120">
                        <template slot-scope="scope">
                            <el-button size="middle" type="info" @click="subDetail(scope.row.id)">查看详情</el-button>
                        </template>
                    </el-table-column>

                </el-table>
            </div>
            <div class="userCase" border>
                <div class="chargeInfo">
                    <label class="chargeName">{{ chargeName }}</label>
                </div>
                <el-table :data="userInfo">
                    <el-table-column prop="caseName" label="专案名称" width="245">
                    </el-table-column>
                    <el-table-column prop="subName" label="阶段名称" width="50">
                    </el-table-column>
                    <el-table-column prop="startTime" label="开始时间" width="100">
                    </el-table-column>
                    <el-table-column prop="presetTime" label="预计完成时间" width="110">
                    </el-table-column>
                    <el-table-column prop="deadLine" label="延期/截止" width="110">
                    </el-table-column>
                    <el-table-column prop="status" label="执行状态" width="100"
                        :filters="[{ text: '正在执行', value: '正在执行' }, { text: '已完成', value: '已完成' }, { text: '已延误', value: '已延误' }, { text: '延误完成', value: '延误完成' }]"
                        :filter-method="filterTag" filter-placement="bottom-end">
                        <template slot-scope="scope">
                            <el-tag :type="showtype(scope.row.status)" disable-transitions>{{
                                number2status(scope.row.status)
                            }}</el-tag>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
    </div>
</template>

<script>
import { formatDate, getStatus } from '@/utils/common'
import { getSubByUserName } from '@/api/caseSub'
export default {

    props: {
        subInfo: Array,
        caseName: String
    },
    created() {
        // this.initData()
    },
    data() {
        return {
            userInfo: [],
            chargeName: '負責人'
        }
    },
    watch: {
        caseName: {
            deep: true,
            immediate: true,
            handler() {
                this.userInfo = []
                this.chargeName = '負責人'
            }
        }
    },
    methods: {
        //显示负责人手头的子流程
        async getCaseByUserName(row, column, cell, event) {
            var index = column.label.match(/(\d+)/)[1] - 1
            var res = await getSubByUserName(row.chargeId[index])
            this.userInfo = res.data
            //負責人姓名顯示
            this.chargeName = row.chargeName[index]
            for (var i = 0; i < this.userInfo.length; i++) {
                this.userInfo[i].startTime = formatDate(this.userInfo[i].startTime)
                const presetTime = new Date(this.userInfo[i].startTime)
                this.userInfo[i].presetTime = formatDate(presetTime.setDate(presetTime.getDate() + this.userInfo[i].planDays))
                this.userInfo[i].status = getStatus(this.userInfo[i].startTime, this.userInfo[i].presetTime, this.userInfo[i].finishTime)
                this.userInfo[i].deadLine = Math.floor(this.userInfo[i].status == 0 ? (new Date(this.userInfo[i].presetTime) - new Date().setHours(0, 0, 0, 0)) / (1000 * 3600 * 24) :
                    (new Date(new Date().setHours(0, 0, 0, 0) - new Date(this.userInfo[i].presetTime))) / (1000 * 3600 * 24))
            }
        },
        filterTag(value, row) {
            return row.status === value;
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
        }


    }
}
</script>

<style scoped>

.subInfo>>>.caseName {
    display: block;
    margin-top: 20px;
    margin-bottom: 30px;
    font-size: 40px;
}

.subInfo>>>.table {
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
}

/* .subInfo .userCase {
    /* display: flex;
    flex-wrap: wrap;
    flex-direction: column; */
/* } */

.userCase .el-table{
    display: block;
    margin-left: 330px;
}

.userCase>>>.chargeName {
    font-size: 30px;
    margin-bottom: 20px;
    text-align: left;
}  
</style>