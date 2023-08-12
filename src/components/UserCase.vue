<template>
    <div class="usercaseInfo">
        <el-table :data="userInfo">
            <el-table-column prop="caseName" label="专案名称" width="245">
            </el-table-column>
            <el-table-column prop="subName" label="阶段名称" width="50">
            </el-table-column>
            <el-table-column prop="planDays" label="计划时间" width="80">
            </el-table-column>
            <el-table-column prop="startTime" label="开始时间" width="100">
            </el-table-column>
            <el-table-column prop="presetTime" label="预计完成时间" width="110">
            </el-table-column>
            <el-table-column prop="todo" label="还剩多少天或者已延误多少天" width="110">
            </el-table-column>
            <el-table-column prop="status" label="执行状态" width="100"
                :filters="[{ text: '正在执行', value: '正在执行' }, { text: '已完成', value: '已完成' }, { text: '已延误', value: '已延误' }, { text: '延误完成', value: '延误完成' }]"
                :filter-method="filterTag" filter-placement="bottom-end">
                <template slot-scope="scope">
                    <el-tag :type="showtype(scope.row.status)" disable-transitions>{{ number2status(scope.row.status)
                    }}</el-tag>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
export default {
    props:{
        userInfo:Array
    }
}
</script>

<style scoped></style>