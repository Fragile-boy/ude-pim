<template>
    <div class="cards">
        <el-card shadow="always" class="sub_card">
            <label class="cardName">专案类</label>
            <hr>
            <a href="#">查看详情</a>
        </el-card>

        <el-card shadow="always" class="temporary_card">
            <label class="cardName">临时事务</label>
            <hr>
            <a href="#">查看详情</a>
        </el-card>

        <el-card shadow="always" class="research_card">
            <label class="cardName">技术研究</label>
            <hr>
            <a href="#">查看详情</a>
        </el-card>
    </div>
</template>

<script>
export default {

}
</script>

<style lang="less" scoped>
a {
    color: aliceblue;
}

.cards {
    display: flex;
    justify-content: space-between;
    color: white;
}

.el-card {
    color: white;
    border-radius: 20px;
    width: 550px;
    height: 150px;

    .cardName {
        font-size: 30px;
    }
}


.sub_card {
    background-color: rgb(13, 110, 253);
}

.temporary_card {
    background-color: rgb(255, 193, 7);
}

.research_card {
    background-color: rgb(25, 135, 84);
}
</style>