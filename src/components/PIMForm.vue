<template>
    <el-form ref="form" label-width="80px">
        <el-form-item label="专案名称:">
            <el-form-item>{{ caseName }}</el-form-item>
        </el-form-item>

        <el-form-item label="子流程:">
            <el-form-item>{{ subName }}</el-form-item>
        </el-form-item>

        <!-- 信息插槽 -->
        <slot name="info">
            
        </slot>

        <!-- 文本域插槽 -->
        <slot name="text-area">
            <el-form-item label="增加信息:">
                <el-input type="textarea"></el-input>
            </el-form-item>
        </slot>

        <!-- 输入框插槽 -->
        <slot name="input">
            <el-form-item label="输入框">
                <el-input placeholder="请输入内容"></el-input>
            </el-form-item>
        </slot>


        <el-form-item>
            <!-- 按钮插槽 -->
            <slot name="submitButton">
                <el-button type="primary">提交</el-button>
            </slot>
            <el-button @click="$router.back()">返回</el-button>
        </el-form-item>
    </el-form>
</template>

<script>
</script>

<style scoped>
.form {
    width: 70%;
    text-align: center;
    margin-left: 150px;
    margin-top: 200px;
    background-color: #eee;
    height: 50%;
}
</style>