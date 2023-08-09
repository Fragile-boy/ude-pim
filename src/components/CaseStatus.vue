<template>
    <div class="status">
        <div class="cards">
            <a href="#">
                <el-col :span="8" class="card">
                    <el-card shadow="hover" class="doing">
                        正在执行
                    </el-card>
                </el-col>
            </a>

            <a href="#">
                <el-col :span="8" class="card">
                    <el-card shadow="hover" class="dead-line">
                        即将截至
                    </el-card>
                </el-col>
            </a>

            <a href="#">
                <el-col :span="8" class="card">
                    <el-card shadow="hover" class="delay">
                        已延误
                    </el-card>
                </el-col>
            </a>

            <a href="#">
                <el-col :span="8" class="card">
                    <el-card shadow="hover" class="finish">
                        已完成
                    </el-card>
                </el-col>
            </a>
        </div>
    </div>
</template>

<script>
export default {

}
</script>

<style scoped>
.status{
    display: flex;
    justify-content: space-between;
}
.cards {
    margin-top: 20px;
    display: flex;
    width: 800px;
    color: white;
}

.el-card {
    margin-left: 20px;
    color: white;
    border-radius: 20px;
    width: 200px;
}

.doing {
    background-color: rgb(13, 110, 253);
}

.dead-line {
    background-color: rgb(255, 193, 7);
}

.delay {
    background-color: rgb(220, 53, 69);
}

.finish {
    background-color: rgb(25, 135, 84);
}
</style>