<template>
    <el-cascader v-model="selectedValue" :options="assistants" :props="{ multiple: true }" collapse-tags clearable placeholder="请选择要提醒的人"
        @change="handleChange">
    </el-cascader>
</template>

<script>
import { allUserList } from '@/api/user'
import { initDirectorOptions } from '@/utils/common'

export default {
    props: {
        value: {
            type: Array,
            default: () => []
        },
    },
    data() {
        return {
            selectedValue: this.value, // 初始值为父组件传递的值
            // 成员列表
            assistants: [{
                value: 0,
                label: '部员',
                children: initDirectorOptions()
            }, {
                value: 4,
                label: '领导',
                children: []
            }],
        };
    },
    watch: {
        // 监听父组件的 value 变化，同步更新本地值
        value(newVal) {
            this.selectedValue = newVal;
        }
    },
    created() {
        this.fetchAssistants(); // 组件创建时调用函数获取数据
    },
    methods: {
        handleChange(value) {
            this.$emit('input', value); // 动态绑定值并返回
            this.$emit('change', value); // 也可以通过其他事件返回
        },
        async fetchAssistants() {
            // 调用后端 API 获取数据
            const { data: res } = await allUserList();
            for (var i = 0; i < res.length; i++) {
                if (res[i].type == 0) {
                    this.assistants[0].children[res[i].status].children.push({ value: res[i].id, label: res[i].name })
                } else if (res[i].name !== 'admin')
                    this.assistants[1].children.push({ value: res[i].id, label: res[i].name })
            }
        }
    }
};
</script>