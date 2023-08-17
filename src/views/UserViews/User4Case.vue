<template>
    <ul>
        <li v-for="item in userInfo" :key="item.id">
            <CaseBox :data="item"></CaseBox>
        </li>
    </ul>
</template>

<script>
import { mapState } from 'vuex'
import { formatDate,getStatus} from '@/utils/common'
import {getSubByUserName} from '@/api/caseSub'
export default {
    name:'case4me',
    data(){
        return{
            userInfo:[]
        }
    },
    created() {
        this.getCaseByUserName(this.user)
    },
    computed: {
        ...mapState(['user'])
    },
    methods: {
        async getCaseByUserName(user) {
            const res = await getSubByUserName(user.id)
            this.userInfo = res.data
            this.infoAmount = this.userInfo.length
            for (var i = 0; i < this.userInfo.length; i++) {
                this.userInfo[i].startTime = formatDate(this.userInfo[i].startTime)
                const presetTime = new Date(this.userInfo[i].startTime)
                this.userInfo[i].presetTime = formatDate(presetTime.setDate(presetTime.getDate() + this.userInfo[i].planDays))
                this.userInfo[i].status = getStatus(this.userInfo[i].startTime, this.userInfo[i].presetTime, this.userInfo[i].finishTime)
                this.userInfo[i].deadLine = Math.floor(this.userInfo[i].status == 0 ? (new Date(this.userInfo[i].presetTime) - new Date().setHours(0, 0, 0, 0)) / (1000 * 3600 * 24) :
                    (new Date(new Date().setHours(0, 0, 0, 0) - new Date(this.userInfo[i].presetTime))) / (1000 * 3600 * 24))
            }
        },
    }
    // computed:{
    //     ...mapState('user','userInfo')
    // }
}
</script>

<style scoped>
li {
    list-style: none;
    display: inline;
}
</style>