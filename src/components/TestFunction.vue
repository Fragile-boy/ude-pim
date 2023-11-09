<template>
    <el-calendar>
        <!-- 这里使用的是 2.5 slot 语法，对于新项目请使用 2.6 slot 语法-->
        <template slot="dateCell" slot-scope="{data}">

            <div :class="{ 'green-background': isInRange(data.day) }"
                style="width: 100%;height: 100%;font-size: 25px; text-align: center;line-height: 70px;"
                :style="{ 'background-color': isSunDay(data.day) ? '#EB4343' : 'white' }">
                <el-tooltip v-if="isToday(data.day)" content="就在今天" placement="top">
                    <p>{{formatData(data.day)+'✔️'}}</p>
                </el-tooltip>
                <p :class="{ 'is-selected': data.isSelected }" v-else>
                    {{ formatData(data.day) }}
                </p>
            </div>
        </template>
    </el-calendar>
</template>
  
<script>

export default {
    data() {
        return {
            value: new Date(), // 当前选中的日期
            range: ['2023-11-1', '2023-11-12'] // 日期范围
        };
    },
    methods: {
        isInRange(date) {
            date = new Date(date)
            const startDate = new Date(this.range[0]);
            const endDate = new Date(this.range[1]);
            return date >= startDate && date <= endDate;
        },
        isSunDay(date) {
            date = new Date(date)
            return date.getDay() === 0
        },
        formatData(date) {
            var array = date.split("-")
            if (+array[2] === 1)
                return array[1] + "月"
            else
                return +array[2]
        },
        isToday(date) {
            const today = new Date().toISOString().slice(0, 10);
            return date === today
        }
    }
};
</script>
  
<style scoped>
.green-background {
    background-color: skyblue;
}
</style>
  