<template>
  <div class="index_container">
    <!-- 面包屑导航区域 -->
    <div>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>个人中心</el-breadcrumb-item>
        <el-breadcrumb-item>个人总览</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div>
      <!-- 头部区域 -->
      <div class="userHeader">
        <el-row :gutter="20">
          <el-col :span="4">
            <el-input v-model="caseName" placeholder="输入专案查询"></el-input>
          </el-col>
          <el-col :span="2">
            <el-button type="primary" icon="el-icon-search" @click="jump2QueryCase"></el-button>
          </el-col>
          <!-- 消息区域 -->
          <el-col :span="1" :offset="15">
            <el-badge :value="logList.length" :hidden="logList.length === 0" class="item">
              <el-button round @click="$router.push('/user/info')"><i class="el-icon-chat-dot-round"></i></el-button>
            </el-badge>
          </el-col>
          <el-col :span="1">
            <el-dropdown @command="handleCommand">
              <el-button round>
                <i class="el-icon-setting el-icon-arrow-down"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="editUser">修改资料</el-dropdown-item>
                <el-dropdown-item command="password">修改密码</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </el-col>

        </el-row>
      </div>

      <!-- 链接区域 -->
      <div class="notice-container">
        <el-card>
          <h2 style="margin-bottom: 10px;">快捷访问</h2>
          <div class="link-container">
            <el-link type="primary" target="_blank" href="https://scmail.ude-corp.com/">邮件系统<i
                class="el-icon-s-promotion"></i></el-link>
            <el-button type="primary" @click="jump2Case">申请子流程<i class="el-icon-plus"></i></el-button>
            <el-button type="primary" @click="jump2Task">申请技术研究<i class="el-icon-plus"></i></el-button>
            <el-button type="primary" @click="jump2CaseIndex">专案主页<i class="el-icon-view"></i></el-button>
            <el-button type="info">待定</el-button>
          </div>
        </el-card>
      </div>

      <!-- 执行任务区域 -->
      <div class="task-container">
        <el-card class="taskTable">
          <h2>最近任务</h2>
          <el-table :data="taskList" style="margin-bottom: 15px;">
            <el-table-column>
              <template slot-scope="scope">
                <el-tag effect="dark" type="success" v-if="scope.row.type === 0">专案类</el-tag>
                <el-tag effect="dark" type="info" v-if="scope.row.type === 1">临时事务</el-tag>
                <el-tag effect="dark" v-if="scope.row.type === 2">技术研究</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="caseName"></el-table-column>
            <el-table-column prop="subName"></el-table-column>
            <el-table-column prop="comment"></el-table-column>
            <el-table-column>
              <template slot-scope="scope">
                <!-- 未开始进度条 -->
                <el-progress v-if="scope.row.startTime === null" :stroke-width="24" :percentage="100" color="#30E0D4"
                  :show-text="false">
                </el-progress>
                <!-- 正常状态进度条 -->
                <el-progress v-else-if="!scope.row.pausing" :stroke-width="24" :percentage="scope.row.percentage"
                  :status="scope.row.finishedOwnWork ? 'primary' : 'leftDelay' in scope.row ? scope.row.leftDelay >= 0 ? 'warning' : 'exception' : 'success'">
                </el-progress>
                <!-- 暂停中进度条 -->
                <el-progress v-else-if="scope.row.pausing" :stroke-width="24" :percentage="scope.row.percentage" color="#909399" :show-text="false">
                </el-progress>
              </template>
            </el-table-column>
          </el-table>


          <!-- <el-row>
            <el-col :span="3" :offset="10">
              <el-button type="primary">显示所有任务</el-button>
            </el-col>
          </el-row> -->
        </el-card>

        <!-- 日历显示 -->
        <el-calendar style="width: 50%;">
          <template slot="dateCell" slot-scope="{data}">

            <div style="width: 100%;height: 100%;font-size: 25px; text-align: center;line-height: 70px;"
              :style="{ 'background-color': isFinishDay(data.day) ? 'skyblue' : isSunDay(data.day) ? '#5BEE58' : 'white' }">
              <el-tooltip v-if="isFinishDay(data.day)" :content="isFinishDay(data.day)" placement="top">
                <template #content>
                  <div style="white-space: pre-wrap;">{{ isFinishDay(data.day) }}</div>
                </template>
                <p style="color:#F13E32">{{ formatData(data.day) + '★' }}</p>
              </el-tooltip>
              <el-tooltip v-else-if="isToday(data.day)" content="就在今天!" placement="top">
                <p>{{ formatData(data.day) + '✔️' }}</p>
              </el-tooltip>

              <p v-else>
                {{ formatData(data.day) }}
              </p>
            </div>
          </template>
        </el-calendar>
      </div>



      <!-- 卡片区域 -->
      <div class="applyArea">
        <caseStatus></caseStatus>
      </div>
    </div>

    <!-- 修改资料区域 -->
    <el-dialog title="修改资料" :visible.sync="editUserVisible" width="30%">
      <el-form ref="editUserRef" :rules="editUserRule" :model="editUser" label-width="80px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="editUser.name"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="工号" prop="number">
              <el-input v-model="editUser.number"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="职务" prop="status">
          <el-select v-model="editUser.status" placeholder="请选择职务">
            <el-option v-for="item in [{ label: '机构', value: 0 }, { label: '电控', value: 1 }]" :key="item.value"
              :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="电子邮件" prop="email">
          <el-input v-model="editUser.email" placeholder="请输入电子邮件地址"></el-input>
        </el-form-item>

      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editUserVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleEditUser()">确 定</el-button>
      </span>
    </el-dialog>


    <!-- 修改密码区域 -->
    <el-dialog title="修改密码" :visible.sync="editPasswordVisible" width="30%">
      <el-form ref="editPasswordRef" :model="passwordInfo" :rules="passwordInfoRule" label-width="80px">
        <el-form-item label="新密码" prop="password">
          <el-input type="password" v-model="passwordInfo.password"></el-input>
        </el-form-item>


        <el-form-item label="确认密码" prop="doublecheck">
          <el-input type="password" v-model="passwordInfo.doublecheck"></el-input>
        </el-form-item>


      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editPasswordVisible = false">取 消</el-button>
        <el-button type="primary" @click="updatePassword()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { taskList, notStartTaskList } from '@/api/task'
import { timeSub, timeAdd, formatDate } from '@/utils/common'
import { updatePassword } from '@/api/user'
export default {
  data() {
    var checkNumber = (rule, value, callback) => {
      if (!/^\d{6}$/.test(value)) {
        return callback(new Error('工号必须是6位数字'))
      }
      callback()
    }
    var checkPassword = (rule, value, callback) => {
      if (!/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(value)) {
        return callback(new Error('密码必须包含字母、数字，长度大于8'))
      }
      callback()
    }

    var checkSecond = (rule, value, callback) => {
      if (value !== this.passwordInfo.password) {
        return callback(new Error('两次密码不一致'))
      }
      callback()
    }

    var checkEmail = (rule, value, callback) => {
      //正则表达式验证电子邮箱地址
      if (/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(value)) {
        callback()
      }
    }

    return {
      // 包括还未开始的任务列表
      taskList: [],
      pieChart: null,
      statusPie: null,
      editUserVisible: false,
      editPasswordVisible: false,
      editUser: {},
      editUserRule: {
        name: [
          { required: true, message: '名字不可为空', trigger: 'blur' },
          { min: 2, max: 10, message: '名字必须在2-10个字符之间', trigger: 'blur' }
        ],
        number: [
          { validator: checkNumber, trigger: 'blur' }
        ],
        email: [
          { required: true, message: '电子邮箱不能为空', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ]
      },
      passwordInfo: {
        password: '',
        doublecheck: ''
      },
      passwordInfoRule: {
        password: [
          { validator: checkPassword, trigger: 'blur' }
        ],
        doublecheck: [
          { validator: checkSecond, trigger: 'blur' }
        ]
      },
      caseName: '',
      today: new Date(),

    }
  },
  computed: {
    ...mapState(['user']),
    ...mapState('log', ['logList'])
  },
  created() {

  },
  async mounted() {
    // 因为会插入到同一个列表，所以要串行执行
    await this.initTaskList()
    await this.getNotStartTaskList()
    // this.typePie = this.$echarts.init(document.getElementById('typePie'));
    // this.statusPie = this.$echarts.init(document.getElementById('statusPie'));

    // this.renderPieChart()
  },
  methods: {
    ...mapActions(['editUserInfo']),
    async getNotStartTaskList() {
      const res = await notStartTaskList(this.user.id)
      res.data.forEach(item=>item.comment='即将开始')
      this.taskList.push(...res.data)
    },
    async initTaskList() {
      const res = await taskList(this.user.id)
      if (res.code === 200) {
        this.taskList = res.data
        var delayCount = 0
        for (var i = 0; i < this.taskList.length; i++) {
          this.taskList[i].executionDays = timeSub(this.taskList[i].startTime, new Date())
          var presetTime = new Date(this.taskList[i].startTime)
          presetTime = presetTime.setDate(presetTime.getDate()+this.taskList[i].planDays+this.taskList[i].unforcedDays)
          this.taskList[i].presetTime = presetTime
          //分为已延误和未延误
          var today = new Date()
          today.setHours(0, 0, 0, 0)
          // 是否暂停
          this.taskList[i].pauseStart = this.taskList[i].pauseStart ? formatDate(this.taskList[i].pauseStart) : null
          //还未截止
          if (today <= this.taskList[i].presetTime) {
            //已经执行了多少天
            var costDay = timeSub(this.taskList[i].startTime, today)
            // 已经执行了多少天/总共多少天
            this.taskList[i].percentage = costDay * 1.0 / (this.taskList[i].planDays + +this.taskList[i].unforcedDays) * 100
          } else {
            //已经延期了多少天(这里不能算预计时间当天，所以必须要-1)
            var delayDay = timeSub(this.taskList[i].presetTime, today) - 1
            //计算延误期限
            this.taskList[i].leftDelay = this.taskList[i].applyDelay - delayDay
            //判断是否在延期期限内
            if (this.taskList[i].leftDelay >= 0) {
              this.taskList[i].percentage = (delayDay / this.taskList[i].applyDelay) * 100
            } else {
              this.taskList[i].percentage = timeSub(this.taskList[i].startTime, today)*100.0 / this.taskList[i].planDays
              if(!this.taskList[i].finishedOwnWork)
                delayCount++
            }
          }
          this.taskList[i].presetTime = formatDate(this.taskList[i].presetTime)
          this.taskList[i].comment = this.percentageText(this.taskList[i])
          if (this.taskList[i].percentage > 100)
            this.taskList[i].percentage = 100
        }
        if (delayCount) {
          this.$notify({
            title: '错误',
            message: '你当前有' + delayCount + '个任务进度已滞后，请及时申请延期确定下一个交期',
            duration: 0,
            type: 'error'
          });
        }
      } else {
        this.$message.error(res.msg)
      }
    },
    // 进度条备注显示
    percentageText(row) {
      if (row.pausing)
        return "暂停中"
      if ('leftDelay' in row) {
        if (row.leftDelay >= 0) {
          return `延期剩余${row.leftDelay}天`
        }
        return `已延误${row.applyDelay - row.leftDelay}天`
      }
      //算上今天，剩余天数+1
      return `执行剩余${row.planDays + +row.unforcedDays + 1 - row.executionDays}天`
    },
    //初始化显示图表
    renderPieChart() {
      var typeData = [
        {
          name: '专案类',
          value: 0
        }, {
          name: '临时事务',
          value: 0
        }, {
          name: '技术研究', value: 0
        }]

      var statusData = [
        {
          name: '已延误',
          value: 0
        },
        {
          name: '时间过半',
          value: 0
        },
        {
          name: '正在执行',
          value: 0
        }
      ]
      this.taskList.forEach(s => {
        typeData[s.type].value += 1
        if (+s.percentage === 100)
          statusData[0].value += 1
        else if (+s.percentage >= 60)
          statusData[1].value += 1
        else
          statusData[2].value += 1
      })
      // 计算属性值的数量
      const typeOption = {
        legend: {
          orient: 'vertical',
          x: 'left',
          data: ['专案类', '临时事务', '技术研究']
        },
        series: [
          {
            type: 'pie',
            data: typeData,
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            itemStyle: {
              color: function (params) {
                if (params.data.name === "专案类")
                  return '#67c23a'
                else if (params.data.name === "临时事务")
                  return '#e6a23c'
                else if (params.data.name === "技术研究")
                  return '#409eff'
              }
            },
            labelLine: {
              show: false
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '30',
                fontWeight: 'bold'
              }
            },
          }
        ]
      };
      // 计算属性值的数量
      const statusOption = {
        legend: {
          orient: 'vertical',
          x: 'left',
          data: ['已延误', '时间过半', '正在执行']
        },
        series: [
          {
            type: 'pie',
            data: statusData,
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            itemStyle: {
              color: function (params) {
                if (params.data.name === "已延误")
                  return '#f56c6c'
                else if (params.data.name === "时间过半")
                  return '#e6a23c'
                else if (params.data.name === "正在执行")
                  return '#67c23a'
              }
            },
            labelLine: {
              show: false
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '30',
                fontWeight: 'bold'
              }
            },
          }
        ]
      };
      this.typePie.setOption(typeOption);
      this.statusPie.setOption(statusOption);
    },
    //设置按钮
    handleCommand(command) {
      if (command === 'editUser') {
        //修改资料
        this.editUser = { ...this.user }
        this.editUserVisible = true
      } else {
        this.editPasswordVisible = true
      }
    },
    handleEditUser() {
      this.$refs.editUserRef.validate(async (valid) => {
        if (valid) {
          const res = await this.editUserInfo(this.editUser)
          if (res.code === 200) {
            this.$message.success(res.data)
            this.editUserVisible = false
          } else {
            this.$message.error(res.msg)
          }
        }
      })

    },
    //修改密码
    updatePassword() {
      this.$refs.editPasswordRef.validate(async (valid) => {
        if (valid) {
          const res = await updatePassword({ password: this.passwordInfo.password, id: this.user.id })
          if (res.code === 200) {
            this.$message.success(res.data)
            this.editPasswordVisible = false
          }
        }
      })
    },
    jump2Case() {
      this.$router.push({
        path: '/user/progress',
        query: {
          applyCaseSubVisible: true
        }
      })
    },
    jump2Task() {
      this.$router.push({
        path: '/user/progress',
        query: {
          applyTaskVisible: true
        }
      })
    },
    jump2CaseIndex() {
      this.$router.push({
        path: '/common/index',
      })
    },
    jump2QueryCase() {
      this.$router.push({
        path: '/common/index',
        query: {
          caseName: this.caseName
        }
      })
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
    },
    isFinishDay(date) {
      var str = ''
      for (let i = 0; i < this.taskList.length; i++) {
        if (timeAdd(this.taskList[i].presetTime, +this.taskList[i].applyDelay) === date) {
          str += this.taskList[i].description+"\n"
        }
      }
      return str===''?false:str
    }
  },


}
</script>

<style lang="less" scoped>
.el-button {
  border: none;
}

.applyArea {
  margin-top: 30px;
  margin-bottom: 30px;
  width: 100%;
}

.task-container {
  display: flex;
  justify-content: space-between;
}

.taskTable {
  width: 50%;
  margin-right: 10px;
}

.taskCharts {
  width: 50%;
}

.notice-container {
  margin-top: 20px;

  .link-container {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
    margin: 0 30px;
  }

  .el-button {
    font-size: 15px;
  }
}
</style>