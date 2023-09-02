<template>
    <div>
        <!-- 面包屑导航区域 -->
        <div>
            <el-breadcrumb separator="/">
                <el-breadcrumb-item :to="{ path: '/index' }">主页</el-breadcrumb-item>
                <el-breadcrumb-item>审批流程</el-breadcrumb-item>
                <el-breadcrumb-item>专案类申请</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <el-card>
            <div class="btns">
                <el-button type="info" icon="el-icon-s-order"> 历史记录 </el-button>
            </div>
            <el-table border>
                <el-table-column label="专案"></el-table-column>
                <el-table-column label="子流程"></el-table-column>
                <el-table-column label="申请人"></el-table-column>
                <el-table-column label="申请时间"></el-table-column>
                <el-table-column label="操作"></el-table-column>
            </el-table>
        </el-card>
    </div>
</template>

<script>
export default {

}
</script>

<style scoped>
.btns {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 15px;
}
</style>