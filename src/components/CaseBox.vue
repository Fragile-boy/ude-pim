<template>
    <div class="singleBox" style="text-align: center;">
        <label class="caseName">{{data.caseName}}</label>
        <div class="caseSubStatus" min-width="500px">
            <div class="subName">{{data.subName}}</div>
            <el-progress type="circle" :percentage="25"></el-progress>
        </div>

        <div class="operation">
            <el-button size="medium" type="primary" icon="el-icon-edit" round></el-button>
        </div>
    </div>
</template>

<script>
export default {
    props:{
        data:Array
    }
}
</script>

<style scoped>
.singleBox {
    border: 1px solid grey;
    /* width: 500px; */
    /* height: 200px; */
    /* background-color: pink; */
    padding-top: 10px;
    padding-left: 20px;
    padding-right: 20px;
    margin-left: 20px;
    margin-top: 20px;
    border-radius: 30px;
}

.singleBox label {
    font-size: 30px;
}


.singleBox .caseSubStatus{
    display: flex;
    justify-content: space-between;
}

.singleBox .el-progress{
    margin-right: 10px;
    margin-top: 5px;
}

.singleBox .subName {
    background-color: #fff;
    width: 30%;
    height: 60px;
    line-height: 60px;
    font-size: 20px;
    margin-top: 30px;
    border-radius: 30px;
}



.singleBox .operation {
    margin-top: -20px;
}
</style>