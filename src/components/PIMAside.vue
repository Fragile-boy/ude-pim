<template>
    <div class="nav">
        <div class="menuList">
            <div class="menu">
                <!-- <a href="#">专案管理</a> -->
                <router-link to="/">专案管理</router-link>
            </div>
            <div class="menu">
                <a href="#">子流程管理</a>
            </div>
            <div class="menu">
                <a href="#">部员管理</a>
            </div>
            <div class="menu">
                <!-- <a href="#">日志管理</a> -->
                <router-link to="./note">需求管理</router-link>
            </div>
        </div>
    </div>
</template>

<script>
export default {

}
</script>

<style scoped>
.nav{
    width: 200px;
    height: 1000px;
    background-color: rgb(33, 37, 41);
    margin-left: -10px;
}

.menuList{
    margin-top: 30px;
    font-size: 25px;
}

.menu{
    margin-top: 60px;
    border-bottom: 1px solid grey;
    /* border-top: 1px solid grey; */
}

.menu a{
    color: skyblue;
    text-decoration: none;
}
</style>