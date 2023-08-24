<template>
    <div class="status">
        <div class="cards">
            <a href="#">
                <el-card shadow="hover" class="sub_card">
                    子阶段审核
                </el-card>
            </a>

            <a href="#">
                <el-card shadow="hover" class="delay_card">
                    延期审核
                </el-card>
            </a>

            <a href="#">
                <el-card shadow="hover" class="finish_card">
                    完结审核
                </el-card>
            </a>

            <a href="#">
                <el-card shadow="hover" class="research_card">
                    技术研究审核
                </el-card>
            </a>
        </div>
    </div>
</template>

<script>
export default {

}
</script>

<style scoped>
.status {
    display: flex;
    justify-content: space-between;
}

.cards {
    display: flex;
    width: 800px;
    color: white;
}

.el-card {
    color: white;
    border-radius: 20px;
    width: 200px;
}

.cards a{
    text-decoration: none;
}

.sub_card {
    background-color: rgb(13, 110, 253);
}

.delay_card {
    background-color: rgb(255, 193, 7);
}

.finish_card {
    background-color: rgb(220, 53, 69);
}

.research_card {
    background-color: rgb(25, 135, 84);
}
</style>