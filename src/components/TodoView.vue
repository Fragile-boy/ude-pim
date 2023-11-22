<template>
    <div class="schedule">
        <h1 style="text-align: center; color:white"><i class=el-icon-price-tag></i>待办事项</h1>
        <div style="margin-left: 100px;margin-right: 100px;margin-bottom: 20px;">
            <div v-for="task in schedule" :key="task.addTime">
                <div class="my-card" v-if="!task.checked">
                    <el-row class="item_center">
                        <el-col :span="22">{{ task.newTask }}</el-col>
                        <el-col :span="1" :offset="1">
                            <el-button @click="finishTask(task)" type="success" round>完成</el-button>
                        </el-col>
                    </el-row>
                </div>


            </div>
        </div>



        <div style="margin-left: 100px;margin-right: 100px;margin-bottom: 20px;">
            <el-dropdown style="margin-bottom:10px">
                <el-button type="info" @click="showFinish = !showFinish">
                    已完成<i :class="{ 'el-icon-arrow-down': showFinish, 'el-icon-arrow-right': !showFinish }"></i>
                </el-button>
            </el-dropdown>
            <!-- <el-button type="warning" style="margin-left: 5px;" v-if="true||user.type===0">打包申请任务</el-button> -->
            <div v-if="showFinish">
                <div v-for="task in schedule" :key="task.addTime">
                    <div class="my-card_finish" v-if="task.checked">
                        <el-row class="item_center">
                            <el-col :span="21">
                                <span style="text-decoration: line-through;">{{ task.newTask }}</span>
                            </el-col>
                            <el-col :span="1" :offset="1">
                                <el-button @click="finishTask(task)" type="primary" size="small" round>撤销</el-button>
                            </el-col>
                            <el-col :span="1">
                                <el-button @click="delTask(task)" type="danger" size="small" round>删除</el-button>
                            </el-col>
                        </el-row>
                    </div>
                </div>
            </div>
        </div>

        <div class="bottom-input">

            <el-input style="width:78%" v-model="taskObj.newTask" prefix-icon="el-icon-plus"
                placeholder="添加任务  例：与XXX部门合作解决XXX问题，截止XX日" @keyup.enter.native="addTask()">
            </el-input>

        </div>
    </div>
</template>

<style scoped>
.schedule {
    background-color: #5e72c0;
    height: 100%;
}

.el-input {
    border: none;
}

.item_center {
    display: flex;
    align-items: center;
    height: 100%;
}

.my-card {
    border-radius: 25px;
    height: 70px;
    padding-left: 30px;
    padding-right: 30px;
    width: 100%;
    background-color: #fff;
    margin-bottom: 2px;
    font-size: 18px;
}

.my-card_finish {
    border-radius: 20px;
    height: 50px;
    padding-left: 30px;
    padding-right: 30px;
    width: 100%;
    background-color: #fff;
    margin-bottom: 2px;
    font-size: 12px;
}

.bottom-input {
    position: fixed;
    bottom: 0;
    width: 100%;
    margin-left: 100px;
    margin-bottom: 50px;
}
</style>

<script>
import { mapState } from 'vuex'
export default {
    data() {
        return {
            // 待办事项
            schedule: [],
            taskObj: {
                newTask: '',
                addTime: null,
                checked: false
            },
            showFinish: true,
            pickerOptions: {
                shortcuts: [{
                    text: '今后一周',
                    onClick(picker) {
                        const end = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
                        picker.$emit('pick', [new Date(), end])
                    }
                }, {
                    text: '今后两周',
                    onClick(picker) {
                        const end = new Date(new Date().getTime() + 2 * 7 * 24 * 60 * 60 * 1000)
                        picker.$emit('pick', [new Date(), end])
                    }
                }, {
                    text: '今后三周',
                    onClick(picker) {
                        const end = new Date(new Date().getTime() + 3 * 7 * 24 * 60 * 60 * 1000)
                        picker.$emit('pick', [new Date(), end])
                    }
                }, {
                    text: '今后一月',
                    onClick(picker) {
                        const end = new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)
                        picker.$emit('pick', [new Date(), end])
                    }
                }, {
                    text: '今后两月',
                    onClick(picker) {
                        const end = new Date(new Date().getTime() + 2 * 30 * 24 * 60 * 60 * 1000)
                        picker.$emit('pick', [new Date(), end])
                    }
                }]
            }
        }
    },
    created() {
        this.schedule = JSON.parse(localStorage.getItem('pim_schedule'))
        if (this.schedule === null)
            this.schedule = []
    },
    computed: {
        ...mapState(['user'])
    },
    methods: {
        addTask() {
            this.taskObj.addTime = new Date()
            this.schedule.unshift(this.taskObj)
            localStorage.setItem('pim_schedule', JSON.stringify(this.schedule))
            this.taskObj = {
                newTask: '',
                addTime: null,
                checked: false
            }
        },
        finishTask(obj) {
            obj.checked = !obj.checked
            localStorage.setItem('pim_schedule', JSON.stringify(this.schedule))
        },
        delTask(obj) {
            this.schedule.splice(this.schedule.indexOf(obj), 1)
            localStorage.setItem('pim_schedule', JSON.stringify(this.schedule))
        }
    }
}
</script>

