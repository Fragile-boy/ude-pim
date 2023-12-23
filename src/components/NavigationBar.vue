<template>
    <div class="navigation_bar">
        <el-tag class="navigate-tag" v-for="tab in tabs" :key="tab.name" :color="currentPath===tab.path?'white':'#cde7ed'" closable style="margin-right: 5px;" @click="jump2path(tab)"
            @close="removePath(tab.path)">
            {{ tab.name }}
        </el-tag>
    </div>
</template>

<script>
export default {
    data() {
        return {
            tabs: [],
            currentPath: '',
        }
    },
    created() {
        // 监听路由变化
        this.$router.afterEach((to, from) => {
            if (to.path === '/common/case2sub' || to.path === '/common/case2person')
                return
            // 获取当前页面的path
            this.currentPath = to.path
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
        removePath(path) {
            this.tabs = this.tabs.filter(tab => tab.path !== path)
        },
        jump2path(tab) {
            this.$router.push({
                path: tab.path,
                query: tab.query
            })
        }
    }
}
</script>

<style lang="less" scoped>

.navigation_bar {
    width: 100%;
    background-color: #eaedf1;
    padding: 10px 0;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    overflow-x: auto;
}

.el-tag {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    height: 30px;
    line-height: 30px;
    border-radius: 16px;
    color: #555;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
    margin-right: 8px;
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
        background-color: #76d4e7 !important;
    }
}
</style>