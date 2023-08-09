<template>
    <!-- :row-class-name="tableRowClassName" -->
    <el-table :row-class-name="tableRowClassName" :data="tableData" scripe border style="width: 100%" max-height=700
        :default-sort="{ prop: 'doingDay', order: 'descending' }">
        <el-table-column prop="caseNumber" label="编号" width="50">
        </el-table-column>
        <el-table-column prop="name" label="任务名" width="250">
        </el-table-column>
        <el-table-column prop="level" label="难度" width="100">
        </el-table-column>
        <el-table-column prop="director" label="负责人" width="100">
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="100">
        </el-table-column>
        <el-table-column prop="presetTime" label="预计完成时间" width="120">
        </el-table-column>
        <el-table-column prop="presetDay" label="计划天数" width="100">
        </el-table-column>
        <el-table-column prop="doingDay" label="执行天数" width="100">
        </el-table-column>
        <el-table-column prop="unforcedDay" label="非计划异常天数" width="120">
        </el-table-column>
        <el-table-column prop="status" label="执行状态" width="100"
            :filters="[{ text: '正在执行', value: '正在执行' }, { text: '已完成', value: '已完成' }, { text: '已延误', value: '已延误' }, { text: '延误完成', value: '延误完成' }]"
            :filter-method="filterTag" filter-placement="bottom-end">
            <template slot-scope="scope">
                <el-tag :type="scope.row.tag" disable-transitions>{{ scope.row.status }}</el-tag>
            </template>

        </el-table-column>
        <el-table-column label="操作" width="110">
            <template slot-scope="scope">
                <el-button size="mini" type="info" @click="handleEdit(scope.$index, scope.row)">查看详情</el-button>
            </template>
        </el-table-column>
    </el-table>
</template>

<script>

export default {
    data() {
        return {
            tableData: []
        }
    },
    created() {
        this.initData()
    },
    methods: {
        initData() {
            var data
            this.$axios.get('http://localhost/case/list')
                .then(result => {
                    this.tableData = result.data.data
                    for (let i = 0; i < this.tableData.length; i++) {
                        const startTime = new Date(this.tableData[i]['startTime'])
                        const endTime = new Date(this.tableData[i]['presetTime'])
                        const today = new Date()
                        var presetDay = (endTime - startTime) / (3600 * 24 * 1000)
                        var doingDay = Math.ceil((today - startTime) / (3600 * 24 * 1000))
                        this.tableData[i]['presetDay'] = presetDay
                        this.tableData[i]['doingDay'] = doingDay
                        this.tableData[i].startTime = this.formatDate(startTime)
                        this.tableData[i].presetTime = this.formatDate(endTime)
                        switch (this.tableData[i].status){
                            case 0:
                            this.tableData[i].status = "正在执行"
                            break
                            case 1:
                            this.tableData[i].status = "已完成"
                            break
                            case 2:
                            this.tableData[i].status = "已延误"
                            break
                            case 3:
                            this.tableData[i].status = "延误完成"
                            break
                        }
                    }
                })
        },
        filterTag(value, row) {
            return row.status === value;
        },
        formatDate(date){

            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');

            const formattedDate = `${year}-${month}-${day}`;
            return formattedDate
        },
        tableRowClassName(row){

            // if(row.caseNumber===52)
            console.log(row.row['finishTime'])
            if(row.row['finishTime']!==null)
                return "delay_success"
            const today = new Date()
            const presetDay = new Date(row.row.presetTime)
            if(presetDay<today)
                return 'danger'
            else{
                if((presetDay - today) / (3600 * 24 * 1000)<=10)
                    return "warning"
                else 
                    return ''
            }
        }
    }
}
</script>

<style>
    .el-table >>> .delay_success{
        background: rgb(179, 216, 255);
    }
    .el-table >>> .success{
        background: rgb(240, 249, 235);
    }
    .el-table >>> .danger{
        background: rgb(243, 192, 210);
    }
    .el-table >>> .warning{
        background: rgb(243, 223, 187);
    }
</style>