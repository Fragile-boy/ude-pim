<template>
    <div>
        <div class="checkNav">
            <router-link to="/commit">子流程备注</router-link>
            <router-link to="/delay">延期申请</router-link>
            <router-link to="/finish">完结申请</router-link>
            <router-link to="/study">技术研究申请</router-link>
            <a href="#">敬请期待...</a>

        </div>
        <router-view></router-view>
    </div>
</template>

<script>
export default {
    data() {
        return {

        };
    },
    methods: {

    }
};
</script>

<style scoped>
.checkNav {
    width: 113%;
    height: 50px;
    display: flex;
    flex-direction: row;
    /* justify-content: space-between; */
    align-content: space-between;
    border: 1px solid grey;
    background-color: black;
}

a {
    display: block;
    width: 300px;
    height: 50px;
    line-height: 50px;
    text-align: center;
    color: white;
    text-decoration: none;
    font-size: 30px;
}

a:hover {
    color: orange;
}

a.router-link-exact-active {
    color: orange;
}
</style>