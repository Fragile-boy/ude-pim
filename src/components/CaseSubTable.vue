<template>
    <div class="subInfo">
        <label class="caseName">{{caseName}}</label>
        <el-table :row-class-name="tableRowClassName" :data="subInfo" scope border style="width: 100%" max-height=700
            :default-sort="{ prop: 'doingDay', order: 'descending' }">
            <el-table-column prop="subName" label="子流程编号" width="70">
            </el-table-column>
            <el-table-column prop="number" label="专案下序号" width="100">
            </el-table-column>
            <el-table-column prop="level" label="难度" width="100">
            </el-table-column>
            <el-table-column prop="startTime" label="开始时间" width="100">
            </el-table-column>
            <el-table-column prop="targetTime" label="目标时间" width="100">
            </el-table-column>
            <el-table-column prop="standardTime" label="正常结束时间" width="100">
            </el-table-column>
            <el-table-column prop="finishTime" label="实际结束时间" width="120">
            </el-table-column>
            <el-table-column prop="unforcedDays" label="非人为异常时间" width="120">
            </el-table-column>
            <el-table-column prop="idealTime" label="理想完成时间" width="120">
            </el-table-column>
            <el-table-column prop="status" label="执行状态" width="100"
                :filters="[{ text: '正在执行', value: '正在执行' }, { text: '正常完成', value: '正常完成' }, { text: '已延误', value: '已延误' }, { text: '延误完成', value: '延误完成' }]"
                :filter-method="filterTag" filter-placement="bottom-end">
                <template slot-scope="scope">
                    <el-tag :type="showtype(scope.row.status)" disable-transitions>{{ scope.row.status }}</el-tag>
                </template>

            </el-table-column>
            <el-table-column label="操作" width="100">
                <template slot-scope="scope">
                    <el-button size="mini" type="info" @click="handleEdit(scope.$index, scope.row)">查看详情</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>

export default {
    props: {
        subInfo: Array,
        caseName: String
    },
    created() {
        // this.initData()
    },
    methods: {

        filterTag(value, row) {
            return row.status === value;
        },
        formatDate(date) {

            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');

            const formattedDate = `${year}-${month}-${day}`;
            return formattedDate
        },
        tableRowClassName(row) {
            if (row.row['finishTime'] !== null)
                return "delay_success"
            const today = new Date()
            const presetDay = new Date(row.row.presetTime)
            if (presetDay < today)
                return 'danger'
            else {
                if ((presetDay - today) / (3600 * 24 * 1000) <= 10)
                    return "warning"
                else
                    return ''
            }
        },
        showtype(tag) {
            if (tag === "正在执行")
                return "primary"
            else if (tag === "正常完成")
                return "success"
            else if (tag === "已延误")
                return "danger"
            else if (tag === "延误完成")
                return "warning"
        }
    }
}
</script>

<style scoped>
.subInfo >>> .caseName{
    margin-top: 20px;
    margin-bottom: 30px;
    font-size: 40px;
}
</style>