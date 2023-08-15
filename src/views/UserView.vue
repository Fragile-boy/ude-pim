<template>
    <div class="userBox">
        <!-- <div class="searchBar">
            <el-input placeholder="请输入内容" v-model="input" clearable>
            </el-input>
            <el-button type="primary" icon="el-icon-search" circle></el-button>
        </div> -->
        <ul>
            <li v-for="item in userInfo" :key="item.id">
                <CaseBox :data="item"></CaseBox>
            </li>
        </ul>
    </div>
</template>

<script>
import { formatDate, getStatus } from '@/utils/common'
export default {
    data() {
        return {
            userInfo:[]
        }
    },
    created() {
        const user = JSON.parse(localStorage.getItem("user"))
        console.log(user.id)
        this.getCaseByUserName(user.id)
    },
    methods: {
        getCaseByUserName(id) {
            this.$axios.get(`/caseSub/director/${id}`)
                .then(res => {
                    this.userInfo = res.data.data
                    console.log(this.userInfo)
                    for (var i = 0; i < this.userInfo.length; i++) {
                        this.userInfo[i].startTime = formatDate(this.userInfo[i].startTime)
                        const presetTime = new Date(this.userInfo[i].startTime)
                        this.userInfo[i].presetTime = formatDate(presetTime.setDate(presetTime.getDate() + this.userInfo[i].planDays))
                        this.userInfo[i].status = getStatus(this.userInfo[i].startTime, this.userInfo[i].presetTime, this.userInfo[i].finishTime)
                        this.userInfo[i].deadLine = Math.floor(this.userInfo[i].status == 0 ? (new Date(this.userInfo[i].presetTime) - new Date().setHours(0, 0, 0, 0)) / (1000 * 3600 * 24) :
                            (new Date(new Date().setHours(0, 0, 0, 0) - new Date(this.userInfo[i].presetTime))) / (1000 * 3600 * 24))
                    }
                }).then(err=>{
                    console.dir(err)
                })
        },
    }
}
</script>

<style scoped>
li {
    list-style: none;
    display: inline;
}

.userBox {
    width: 100%;
}

.userBox>>>.singleBox {
    display: inline-block;
}

/* .userBox>>>.container {
    display: flex;
    flex-wrap: wrap;
    border: 1px solid grey;
} */
</style>