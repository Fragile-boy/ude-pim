<template>
  <div class="index" style="text-align: center;">
    <!-- 面包屑导航区域 -->
    <div>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>专案详情</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <el-card class="box-card">
      <div class="indexTable">
        <div class="query" style="margin-bottom: 15px;">
          <el-row :gutter="20">
            <!-- 专案名称 -->
            <el-col :span="4">
              <el-input class="queryText" placeholder="请输入专案名称" v-model="queryText" clearable @change="handleQuery">
              </el-input>
            </el-col>

            <!-- 难度 -->
            <el-col :span="4">
              <el-select v-model="queryStatus" placeholder="请选择执行状态" clearable @change="handleQuery">
                <el-option v-for="item in levels" :key="item" :label="item" :value="item">
                </el-option>
              </el-select>
            </el-col>

            <el-col :span="2">
              <!-- 按钮 -->
              <el-button type="primary" @click="handleQuery">搜索 <i class="el-icon-search"></i></el-button>
            </el-col>

            <el-col :span="2">
              <!-- 按钮 -->
              <el-button type="primary" @click="handleReset">重置 <i class="el-icon-s-tools"></i></el-button>
            </el-col>

          </el-row>
        </div>

        <el-table :data="pageInfo" border stripe max-height=600 @cell-dblclick="handleDoubleClick">
          <el-table-column type="index" label="编号" width="50">
          </el-table-column>
          <el-table-column prop="name" label="任务名" width="260">
          </el-table-column>
          <el-table-column prop="curStage" label="当前阶段">
          </el-table-column>
          <el-table-column prop="level" label="难度">
          </el-table-column>
          <el-table-column prop="directorName" label="负责人">
          </el-table-column>
          <el-table-column prop="startTime" label="开始时间">
          </el-table-column>
          <el-table-column prop="presetTime" label="预计完成时间">
          </el-table-column>
          <el-table-column prop="finishTime" label="实际完成时间">
          </el-table-column>
          <el-table-column prop="planDay" label="计划天数">
          </el-table-column>
          <el-table-column prop="executionDays" label="执行天数">
          </el-table-column>
          <el-table-column prop="unforcedDay" label="外界因素延期">
          </el-table-column>
          <el-table-column prop="status" label="执行状态">
            <template slot-scope="scope">
              <el-tag effect="dark" :type="showtype(scope.row.status)" disable-transitions>{{
                number2status(scope.row.status)
              }}</el-tag>
            </template>

          </el-table-column>
          <el-table-column label="操作" width="120">
            <template slot-scope="scope">
              <el-tooltip effect="dark" content="子流程详情" placement="top" :enterable="false">
                <el-button type="info" size="mini" icon="el-icon-info" round @click="showSub(scope.row)"></el-button>
              </el-tooltip>
              <el-tooltip effect="dark" content="个人详情" placement="top" :enterable="false">
                <el-button type="danger" size="mini" icon="el-icon-s-custom" round
                  @click="showPerson(scope.row)"></el-button>
              </el-tooltip>
            </template>

          </el-table-column>
        </el-table>
        <!-- 分页区域 -->
        <el-pagination style="margin-top: 10px;text-align: left;" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" :current-page.sync="page" :page-sizes="[5, 9, 10, 20]" :page-size="size"
          layout="total, sizes, prev, pager, next" :total="total">
        </el-pagination>
      </div>
    </el-card>

    <!-- 显示备注框 -->
    <el-dialog title="备注信息" :visible.sync="commitVisible" width="40%" @close="$refs.commitFormRef.resetFields()">
      <el-form ref="commitFormRef" :model="commitForm" :rules="rules" label-width="100px">
        <!-- 专案名称显示 -->
        <el-form-item label="专案">
          <el-input v-model="commitForm.caseName" disabled></el-input>
        </el-form-item>
        <!-- 子流程名称显示 -->
        <el-form-item label="流程名">
          <el-input v-model="commitForm.subName" disabled></el-input>
        </el-form-item>
        <!-- 备注显示区域 -->
        <el-form-item label="备注信息">
          <el-card class="box-card">
            <div v-for="o in commitForm.content" :key="o" class="text item">
              {{ o }}
            </div>
            <label v-if="commitForm.content.length === 0">暂无备注</label>
          </el-card>
        </el-form-item>
        <!-- 备注增加 现在的设计是，只有特定的人员去填写备注-->
        <el-form-item prop="newContent" label="增加备注" v-if="user.type === 1 || user.status === 2">
          <el-input type="textarea" v-model="commitForm.newContent"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitCommitForm" v-if="user.type === 1 || user.status === 2">提交</el-button>
        <el-button @click="commitVisible = false">取 消</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import { mapActions, mapState, mapMutations } from 'vuex'
import { getById, saveCommit } from '@/api/caseSubCommit';
export default {
  name: 'indexPage',
  data() {
    return {
      pageInfo: [],
      page: 1,
      size: 9,
      total: 0,
      queryText: '',
      caseInfo: [],
      levels: ['正在执行', '已延误'],
      queryStatus: '',
      queryStartTime: '',
      queryEndTime: '',
      commitVisible: false,
      commitForm: {
        caseName: '',
        subName: '',
        content: [],
        newContent: '',
        caseSubId: null,
      },
      //备注验证规则
      rules: {
        newContent: [
          {
            required: true, message: '备注不能为空', trigger: 'blur'
          },
          {
            min: 8, max: 255, message: '备注应该大于8个字符，小于255个字符', trigger: 'blur'
          }
        ]
      },

    }
  },
  async created() {
    await this.getCaseList()
    var pageSize = +localStorage.getItem('pim_caseTable_pageSize')
    this.pageSize = pageSize === 0 ? 10 : pageSize
    this.caseInfo = this.caseList
    this.getTableDate()
  },
  watch: {
    queryList: {
      handler() {
        this.caseInfo = this.queryList
      }
    },
    caseList: {
      handler() {
        this.caseInfo = this.caseList
      }
    },
    caseInfo: {
      handler() {
        this.getTableDate()
      }
    }
  },
  computed: {
    ...mapState('caseM', ['caseList', 'queryList']),
    ...mapState(['user'])
  },
  //缓存界面路由导航进入之前
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      if ('caseName' in to.query) {
        vm.queryText = to.query.caseName
        vm.handleQuery()
      }
    })
  },
  methods: {
    ...mapActions('caseM', ['getCaseList']),
    ...mapMutations('caseM', ['queryCase']),
    showSub(row) {
      this.$router.push({
        name: 'case-sub',
        query: {
          caseId: row.id,
          caseName: row.name
        }
      })
    },
    //跳转到按个人分类的界面
    showPerson(row) {
      this.$router.push({
        name: 'case-person',
        query: {
          caseId: row.id,
          caseName: row.name
        }
      })
    },
    showtype(tag) {
      if (tag === 0)
        return "primary"
      else if (tag === 1)
        return "success"
      else if (tag === 2)
        return "danger"
      else if (tag === 3)
        return "warning"
    },
    number2status(status) {
      if (status === 0)
        return "正在执行"
      else if (status === 1)
        return "正常完成"
      else if (status === 2)
        return "已延误"
      else if (status === 3)
        return "延误完成"
      else if (status === 4)
        return "未开始"
      else if (status === 5)
        return "中断"
    },
    transformStatus(status) {
      if (status === "正在执行")
        return 0
      else if (status === "正常完成")
        return 1
      else if (status === "已延误")
        return 2
      else if (status === "延误完成")
        return 3
      else if (status === "未开始")
        return 4
      else if (status === "中断")
        return 5
    },
    //查询
    handleQuery() {
      //1. 名称
      //2. 难度
      //4. 开始时间
      //5. 结束时间
      var queryObj = {}
      if (this.queryText !== '')
        queryObj.name = this.queryText
      // 状态不为空
      if (this.queryStatus !== '' && this.queryStatus !== null) {
        // this.queryStatus = this.transformStatus(this.queryStatus)
        queryObj.status = this.transformStatus(this.queryStatus)
      }

      //开始时间不为空
      if (this.queryStartTime !== null && this.queryStartTime !== '')
        queryObj.startTime = this.queryStartTime

      //结束时间不为空
      if (this.queryEndTime !== null && this.queryEndTime !== '')
        queryObj.endTime = this.queryEndTime


      this.queryCase(queryObj)

      this.page = 1
      // this.caseInfo = this.queryList
    },
    handleReset() {
      //空查询对象，保证queryList变化，让上方图形也跟随变化
      this.queryCase({})
      //清空状态
      this.queryText = ''
      this.queryLevel = null
    },
    //页面大小发生变化
    handleSizeChange(val) {
      localStorage.setItem('pim_caseTable_pageSize', val)
      this.size = val
      this.page = 1
      this.getTableDate()
    },
    //翻页
    handleCurrentChange(val) {
      this.page = val
      this.getTableDate()
    },
    getTableDate() {
      this.pageInfo = this.caseInfo.slice((this.page - 1) * this.size,
        this.page * this.size)
      this.total = this.caseInfo.length
    },
    //显示专案正在执行阶段的备注信息
    async handleDoubleClick(row, column) {
      if (column.label === '当前阶段') {
        this.commitForm.caseName = row.name
        this.commitForm.subName = row.curStage
        this.commitForm.caseSubId = row.curStageId
        // 获取专案子流程对应的所有备注
        var res = await getById(this.commitForm.caseSubId)
        res = res.data
        //备注数组必须清空，否则会叠加
        this.commitForm.content = []
        for (var i = 0; i < res.length; i++) {
          this.commitForm.content.push(res[i].content)
        }
        this.commitVisible = true
      }
    },
    async submitCommitForm() {
      //判断备注信息是否为空或者内容太少
      this.$refs.commitFormRef.validate(async valid => {
        if (!valid) return;
        const commmitObj = {}
        commmitObj.caseSubId = this.commitForm.caseSubId
        commmitObj.content = this.commitForm.newContent
        commmitObj.createUser = this.user.id
        var res = await saveCommit(commmitObj)
        this.$message(res.data)
        //隐藏画面
        this.commitVisible = false
      })

    },
  }
}
</script>

<style scoped></style>

