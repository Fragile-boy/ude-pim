<template>
    <div class="pim-header">
        <el-row :gutter="20">
            <el-col :span="4">
                <div class="grid-content bg-purple logo">
                    <a href="#"></a>
                </div>
            </el-col>
            <el-col :span="16">
                <div class="grid-content bg-purple title">
                    <span>新技研专案管理系统</span>
                </div>
            </el-col>
            <el-col :span="4">
                <div class="grid-content bg-purple info">
                    <a href="#">
                        <span>你的名字</span>
                        <i class="el-icon-switch-button"></i>
                    </a>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
export default {

}
</script>

<style scoped>
.pim-header {
    margin-top: -10px;
    margin-left: -10px;
    margin-right: -10px;
    background: rgb(33, 37, 41);
    height: 100px;
    width: 110%;
}
.title{
    line-height: 100px;
    font-size: 30px;
    color: white;
}
.info a{
    color: white;
    line-height: 100px;
    font-size: 20px;
    text-decoration: none;
    padding-right: 150px;
}
.info a:hover{
    color:rgb(103, 194, 58)
}

.logo a{
    display: block;
    background-color: #fff;
    height: 100px;
    width: 100px;
    background-image: url("../assets/logo.png");
    background-size: cover;
    background-repeat: no-repeat;
    margin-left: 10px;
}
</style>