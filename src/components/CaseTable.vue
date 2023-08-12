<template>
    <!-- :row-class-name="tableRowClassName" -->
    <el-table :data="caseInfo" scripe border style="width: 100%" max-height=400
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
        <el-table-column prop="presetTime" label="预计完成时间" width="100">
        </el-table-column>
        <el-table-column prop="finishTime" label="实际完成时间" width="100">
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
            :filters="[{ text: '正在执行', value: '正在执行' }, { text: '已完成', value: '已完成' }, { text: '已延误', value: '已延误' }, { text: '延误完成', value: '延误完成' }]"
            :filter-method="filterTag" filter-placement="bottom-end">
            <template slot-scope="scope">
                <el-tag :type="showtype(scope.row.status)" disable-transitions>{{ number2status(scope.row.status)
                }}</el-tag>
            </template>

        </el-table-column>
        <el-table-column label="操作">
            <template slot-scope="scope">
                <el-button size="mini" type="info" @click="showSub(scope.row)">查看详情</el-button>
            </template>
        </el-table-column>
    </el-table>
</template>

<script>

export default {
    props: {
        caseInfo: Array
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
        showSub(row) {
            // console.log(row.id);
            this.$emit("showSub", row.id, row.name)
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
.el-table>>>.delay_success {
    background: rgb(179, 216, 255);
}

.el-table>>>.success {
    background: rgb(240, 249, 235);
}

.el-table>>>.danger {
    background: rgb(243, 192, 210);
}

.el-table>>>.warning {
    background: rgb(243, 223, 187);
}
</style>