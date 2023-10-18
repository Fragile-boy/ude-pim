<template>
    <div class="navigation_bar">
        <el-tag v-for="tab in tabs" :key="tab.name" closable style="margin-right: 5px;" @click="jump2path(tab)" @close="removePath(tab.path)">
            {{ tab.name }}
        </el-tag>
    </div>
</template>

<script>
export default {
    data() {
        return {
            tabs: []
        }
    },
    created() {
        // 监听路由变化
        this.$router.afterEach((to, from) => {
            if(to.path === '/case2sub')
                return
            let exists = this.tabs.find(tab => tab.path === to.path);
            if (!exists) {
                this.tabs.push({
                    name: to.name,
                    path: to.path,
                    query: to.query,
                })
            }
        })
    },
    methods: {
        removePath(path){
            this.tabs = this.tabs.filter(tab => tab.path !== path)
        },
        jump2path(tab){
            console.log(tab)
            this.$router.push({
                path:tab.path,
                query:tab.query
            })
        }
    }
}
</script>

<style lang="less" scoped>
.navigation_bar {
    width: 100%;
    height: 10%;
}

.el-tag{
    color:black !important;
    margin: 0,0 !important;
}
</style>