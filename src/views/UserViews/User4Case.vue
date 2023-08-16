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
        getCaseByUserName(user) {
            this.$axios.get(`/caseSub/director/${user.id}`)
                .then(res => {
                    this.userInfo = res.data.data
                    this.infoAmount = this.userInfo.length
                    for (var i = 0; i < this.userInfo.length; i++) {
                        this.userInfo[i].startTime = formatDate(this.userInfo[i].startTime)
                        const presetTime = new Date(this.userInfo[i].startTime)
                        this.userInfo[i].presetTime = formatDate(presetTime.setDate(presetTime.getDate() + this.userInfo[i].planDays))
                        this.userInfo[i].status = getStatus(this.userInfo[i].startTime, this.userInfo[i].presetTime, this.userInfo[i].finishTime)
                        this.userInfo[i].deadLine = Math.floor(this.userInfo[i].status == 0 ? (new Date(this.userInfo[i].presetTime) - new Date().setHours(0, 0, 0, 0)) / (1000 * 3600 * 24) :
                            (new Date(new Date().setHours(0, 0, 0, 0) - new Date(this.userInfo[i].presetTime))) / (1000 * 3600 * 24))
                    }
                }).catch(err => {
                    console.dir(err)
                })
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