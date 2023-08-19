<template>
    <ul>
        <li v-for="item in userInfo" :key="item.id">
            <CaseBox :data="item"></CaseBox>
        </li>
    </ul>
</template>

<script>
import { mapState } from 'vuex'
import { getSubById} from '@/utils/common'
export default {
    name:'case4me',
    data(){
        return{
            userInfo:[]
        }
    },
    created() {
        this.getSubByUserId(this.user)
    },
    computed: {
        ...mapState(['user'])
    },
    methods: {
        async getSubByUserId(user) {
            const res = await getSubById(user.id)
            this.userInfo = res
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
ul{
    display: flex;
}
</style>