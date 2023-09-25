<template>
    <div>
        <!-- 面包屑导航区域 -->
        <div>
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>需求管理</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <el-card>


            <el-table :data="demandList">
                <el-table-column label="描述" prop="description"></el-table-column>
                <el-table-column label="类型">
                    <template slot-scope="scope">
                        <el-tag type="danger" v-if="scope.row.type === 0">bug</el-tag>
                        <el-tag type="primary" v-else>需求</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="创建人" prop="createName"></el-table-column>
                <el-table-column label="创建时间" prop="createTime"></el-table-column>
                <el-table-column label="完成时间" prop="updateTime"></el-table-column>
                <el-table-column label="操作" v-if="user.name === '余博'">
                    <template slot-scope="scope">
                        <el-button type="success" @click="finishDemand(scope.row)" v-if="scope.row.updateTime===null">完成
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <br>
            <el-row>
                <el-col :span="12">
                    <el-input v-model="description" class="textarea-placeholder-multiline" type="textarea" :rows="4"
                        placeholder="请尽可能详细的描述你的需求/或者系统bug, 例： 
个人总览界面: 搜索后 界面不跳转
数据统计界面: 我需要多一个查询维度,比如按照XX查询/排序"></el-input>
                </el-col>
                <el-col :span="3" :offset="3">
                    <el-select v-model="type" placeholder="请选择类型">
                        <el-option v-for="item in [{ label: 'bug', value: 0 }, { label: '需求', value: 1 }]" :key="item.value"
                            :label="item.label" :value="item.value">
                        </el-option>
                    </el-select>
                </el-col>
                <el-col :span="2" :offset="4">
                    <el-button type="primary" @click="addDemand">添 加</el-button>
                </el-col>
            </el-row>
        </el-card>
    </div>
</template>

<script>
import { getDemandList, addDemand,finishDemand } from '@/api/demand'
import { mapState } from 'vuex'
export default {
    data() {
        return {
            description: '',
            type: null,
            demandList: ''
        }
    },
    created() {
        // 获取需求列表
        this.getDemandList()
    },
    computed: {
        ...mapState(['user'])
    },
    methods: {
        async getDemandList() {
            const res = await getDemandList()
            this.demandList = res.data
        },
        async addDemand() {
            if (this.description === '' || this.description.length <= 10) {
                this.$message.error("需求描述为空或者过短，请尽可能详细的描述需求或者bug")
                return
            }
            if (this.type === null) {
                this.$message.error("请选择类型，是系统bug还是新增需求")
                return
            }
            const res = await addDemand({ createName: this.user.name, description: this.description, type: this.type })
            this.$message.success(res.data)
            this.description = '',
            this.type = null
            this.getDemandList()
        },
        async finishDemand(row) {
            const res = await finishDemand({ id: row.id })
            this.$message.success(res.data)
            this.getDemandList()
        }
    }
}
</script>

<style lang="less" scoped>
.el-button {
    align-items: center;
}
</style>