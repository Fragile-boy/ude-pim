<template>
  <div class="case-closure-container">
    <!-- 头部标题和操作按钮 -->
    <div class="closure-header">
      <h2>{{ reportData.name }} - 专案完结信息</h2>
      <div class="action-buttons">
        <el-button type="primary" @click="completeReport()">完善完结信息</el-button>
        <el-button @click="goBack">返回</el-button>
      </div>
    </div>

    <!-- 基本信息卡片 -->
    <el-card shadow="hover" class="base-info-card">
      <el-descriptions :column="3" border>
        <el-descriptions-item label="专案名称">{{ reportData.name }}</el-descriptions-item>
        <el-descriptions-item label="难度等级">{{ reportData.level }}</el-descriptions-item>
        <el-descriptions-item label="专案状态">已完结</el-descriptions-item>
        <el-descriptions-item label="开始日期">{{ reportData.startTime }}</el-descriptions-item>
        <el-descriptions-item label="结案日期">{{ reportData.finishTime }}</el-descriptions-item>
        <el-descriptions-item label="持续时间">{{ reportData.duration }} 天</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 指标展示区 -->
    <div class="metrics-section">
      <!-- 时间指标 -->
      <el-card shadow="hover" class="metric-card">
        <div slot="header" class="metric-header">
          <i class="el-icon-time"></i>
          <span>时间指标</span>
        </div>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="计划执行天数">{{ reportData.planDay }}</el-descriptions-item>
          <el-descriptions-item label="实际执行天数">{{ reportData.executionDays }}</el-descriptions-item>
          <el-descriptions-item label="目标达成率">{{ (reportData.targetAchievementRate * 100).toFixed() }}
            %</el-descriptions-item>
          <el-descriptions-item label="实际达成率">{{ `${reportData.daysAchievementRate} %` }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 费用指标 -->
      <el-card shadow="hover" class="metric-card">
        <div slot="header" class="metric-header">
          <i class="el-icon-money"></i>
          <span>费用指标</span>
        </div>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="预估费用(元)">{{ reportData.estimatedCost }}</el-descriptions-item>
          <el-descriptions-item label="实际费用(元)">{{ reportData.actualCost }}</el-descriptions-item>
          <el-descriptions-item label="改善费用(元)">{{ reportData.improvementCost }}</el-descriptions-item>
          <el-descriptions-item label="目标失败成本">{{ (reportData.targetFailureCostRate * 100).toFixed() }}
            %</el-descriptions-item>
          <el-descriptions-item label="实际失败成本">{{ reportData.failureCostRatio }} %</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 质量指标 -->
      <el-card shadow="hover" class="metric-card">
        <div slot="header" class="metric-header">
          <i class="el-icon-odometer"></i>
          <span>质量指标</span>
        </div>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="目标CT(S)">{{ reportData.targetCt }}</el-descriptions-item>
          <el-descriptions-item label="实际CT(S)">{{ reportData.actualCt }}</el-descriptions-item>
          <el-descriptions-item label="目标延误率">{{ reportData.targetDelayRate }} %</el-descriptions-item>
          <el-descriptions-item label="实际延误率">{{ reportData.actualDelayRate }} %</el-descriptions-item>
          <el-descriptions-item label="目标不良率">{{ reportData.targetDefectRate }} %</el-descriptions-item>
          <el-descriptions-item label="实际不良率">{{ reportData.actualDefectRate }} %</el-descriptions-item>
          <el-descriptions-item label="OEE达成率">{{ reportData.oeeAchievementRate }} %</el-descriptions-item>
        </el-descriptions>
      </el-card>
    </div>

    <!-- 积分展示区 -->
    <div class="score-section">
      <!-- 专案评分 -->
      <el-card shadow="hover" class="score-card">
        <div slot="header" class="score-header">
          <i class="el-icon-data-analysis"></i>
          <span>专案评分</span>
        </div>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="完成进度得分">{{ reportData.progressScore }}</el-descriptions-item>
          <el-descriptions-item label="失败成本得分">{{ reportData.failureCostScore }}</el-descriptions-item>
          <el-descriptions-item label="实际效果得分">{{ reportData.effectivenessScore }}</el-descriptions-item>
          <el-descriptions-item label="设计实用性得分">{{ reportData.practicalityScore }}</el-descriptions-item>
          <el-descriptions-item label="设计创新得分">{{ reportData.designInnovationScore }}</el-descriptions-item>
          <el-descriptions-item label="特殊贡献得分">{{ reportData.specialContributionScore }}</el-descriptions-item>
          <el-descriptions-item label="专案结案积分">{{ reportData.finishScore }}</el-descriptions-item>
          <el-descriptions-item label="专案结案总积分"
            :content-style="{ color: '#F56C6C', 'font-weight': 'bold', 'font-size': '20px' }">
            {{ reportData.totalScore }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 设计人员积分分配 :designer-data="designerScores"-->
      <designer-score-card :designer-data="designerScores" :case-id="caseId" :total-score="reportData.totalScore" @refresh="getUserScore()" />
    </div>

    <!-- 专案总结编辑区 -->
    <!-- <el-card shadow="hover" class="summary-card">
      <div slot="header" class="summary-header">
        <i class="el-icon-edit"></i>
        <span>专案总结</span>
      </div>
      <el-input type="textarea" :rows="6" placeholder="请输入专案总结" v-model="reportData.summary" resize="none">
      </el-input>
    </el-card> -->

    <!-- 专案报表数据输入对话框 -->
    <el-dialog :title="reportDialogTitle" :visible.sync="reportInputVisible" width="50%"
      @close="handleReportDialogClose">
      <el-form :model="reportForm" :rules="reportRules" ref="reportFormRef" label-width="120px">
        <!-- 费用相关字段 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="预估费用(元)" prop="estimatedCost">
              <el-input-number v-model="reportForm.estimatedCost" :min="0" :precision="2"
                controls-position="right"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="实际费用(元)" prop="actualCost">
              <el-input-number v-model="reportForm.actualCost" :min="0" :precision="2"
                controls-position="right"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="改善费用(元)" prop="improvementCost">
              <el-input-number v-model="reportForm.improvementCost" :min="0" :precision="2"
                controls-position="right"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="专案立案数" prop="parallelCaseCount">
              <el-input-number v-model="reportForm.parallelCaseCount" :min="0"
                controls-position="right"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="目标达成率(%)" prop="targetAchievementRate">
              <el-input-number v-model="reportForm.targetAchievementRate" :min="0" :precision="2" :step="0.1"
                controls-position="right"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="目标失败成本(%)" prop="targetFailureCostRate">
              <el-input-number v-model="reportForm.targetFailureCostRate" :min="0" :step="0.1" :precision="2"
                controls-position="right"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- CT指标 -->
        <el-divider>CT指标</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="目标CT" prop="targetCt">
              <el-input-number v-model="reportForm.targetCt" :min="0" :precision="2"
                controls-position="right"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="实际CT" prop="actualCt">
              <el-input-number v-model="reportForm.actualCt" :min="0" :precision="2"
                controls-position="right"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 延误率指标 -->
        <el-divider>延误率指标</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="目标延误率(%)" prop="targetDelayRate">
              <el-input-number v-model="reportForm.targetDelayRate" :min="0" :max="100" :precision="2"
                controls-position="right"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="实际延误率(%)" prop="actualDelayRate">
              <el-input-number v-model="reportForm.actualDelayRate" :min="0" :max="100" :precision="2"
                controls-position="right"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 不良率指标 -->
        <el-divider>不良率指标</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="目标不良率(%)" prop="targetDefectRate">
              <el-input-number v-model="reportForm.targetDefectRate" :min="0" :max="100" :precision="2"
                controls-position="right"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="实际不良率(%)" prop="actualDefectRate">
              <el-input-number v-model="reportForm.actualDefectRate" :min="0" :max="100" :precision="2"
                controls-position="right"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 新增：专案质量评分 -->
        <el-divider>专案质量评分</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="实际效果得分" prop="effectivenessScore">
              <el-input-number v-model="reportForm.effectivenessScore" :min="8" :max="12" :precision="1"
                controls-position="right"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设计实用性得分" prop="practicalityScore">
              <el-input-number v-model="reportForm.practicalityScore" :min="8" :max="12" :precision="1"
                controls-position="right"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设计创新得分" prop="designInnovationScore">
              <el-input-number v-model="reportForm.designInnovationScore" :min="0" :max="12" :precision="1"
                controls-position="right"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="特殊贡献得分" prop="specialContributionScore">
              <el-input-number v-model="reportForm.specialContributionScore" :min="0" :max="100" :precision="1"
                controls-position="right"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="reportInputVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmitReport()" :loading="reportLoading">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import DesignerScoreCard from '@/components/CaseComponents/DesignerScoreCard.vue'
import { getMemberList, addMember, updateMember, deleteMember } from '@/api/caseParticipants'
import {
  addCaseClosureInfo,
  updateCaseClosureInfo,
  getClosureInfoByCaseId
} from '@/api/caseClosureInfo'
import { getUserScore } from '@/api/caseClosureInfo'
export default {
  components: {
    DesignerScoreCard
  },
  data() {
    return {
      caseId: null,
      saving: false,
      reportInputVisible: false,
      reportLoading: false,
      reportDialogTitle: "完善结案信息",
      reportForm: {
        id: null,
        caseId: null,
        estimatedCost: 0,
        actualCost: 0,
        improvementCost: 0,
        targetFailureCostRate: 0.07,
        targetAchievementRate: 0.75,
        targetCt: 0,
        actualCt: 0,
        targetDelayRate: 0,
        actualDelayRate: 0,
        targetDefectRate: 0,
        actualDefectRate: 0,
        parallelCaseCount: 1,
        effectivenessScore: 8,
        practicalityScore: 8,
        designInnovationScore: 0,
        specialContributionScore: 0
      },
      reportRules: {
        estimatedCost: [
          { required: true, message: '请输入预估费用', trigger: 'blur' }
        ],
        actualCost: [
          { required: true, message: '请输入实际费用', trigger: 'blur' }
        ],
        improvementCost: [
          { required: true, message: '请输入改善费用', trigger: 'blur' }
        ],
        targetCt: [
          { required: true, message: '请输入目标CT', trigger: 'blur' }
        ],
        actualCt: [
          { required: true, message: '请输入实际CT', trigger: 'blur' }
        ],
        targetDelayRate: [
          { required: true, message: '请输入目标延误率', trigger: 'blur' }
        ],
        actualDelayRate: [
          { required: true, message: '请输入实际延误率', trigger: 'blur' }
        ],
        targetDefectRate: [
          { required: true, message: '请输入目标不良率', trigger: 'blur' }
        ],
        actualDefectRate: [
          { required: true, message: '请输入实际不良率', trigger: 'blur' }
        ]
      },
      reportData: {
        name: '',
        startTime: '',
        finishTime: '',
        duration: 0,
        level: 0,
        estimatedCost: 0,
        actualCost: 0,
        improvementCost: 0,
        targetFailureCostRate: 0,
        failureCostRatio: 0,
        planDay: 0,
        executionDays: 0,
        targetAchievementRate: 0,
        daysAchievementRate: 0,
        targetCt: 0,
        actualCt: 0,
        targetDelayRate: 0,
        actualDelayRate: 0,
        targetDefectRate: 0,
        actualDefectRate: 0,
        oeeAchievementRate: 0,
        failureCost: 0,
        parallelCaseCount: 1,
        progressScore: 0,
        failureCostScore: 0,
        effectivenessScore: 0,
        practicalityScore: 0,
        designInnovationScore: 0,
        specialContributionScore: 0,
        finishScore: 0,
        totalScore: 0,
        summary: ''
      },
      designerScores: []
    }
  },
  created() {
    if (!this.$route.params.caseData) {
      this.$message.warning('请选择专案查看报告')
      this.$router.push({ name: '专案列表' }) // 重定向到专案列表页
      return
    }
    this.caseObject = JSON.parse(this.$route.params.caseData)
    console.log(this.caseObject)
    this.caseId = this.caseObject.id
    this.reportForm.caseId = this.caseId
    this.loadCaseData()
    this.getUserScore()
  },
  methods: {
    async loadCaseData() {
      try {
        // 加载专案基础信息
        this.reportData = { ...this.reportData, ...this.caseObject }

        // 加载结案信息
        const closureRes = await getClosureInfoByCaseId(this.caseId)
        if (closureRes.data) {
          this.reportData = { ...this.reportData, ...closureRes.data }
          this.reportForm = { ...this.reportForm, ...closureRes.data }
          this.generateReport()
        }
      } catch (error) {
        this.$message.error('加载专案数据失败')
        console.error(error)
      }
    },

    // 生成报表数据
    generateReport() {
      // 计算持续时间
      const startDate = new Date(this.reportData.startTime)
      const finishDate = new Date(this.reportData.finishTime)
      const duration = Math.ceil((finishDate - startDate) / (1000 * 60 * 60 * 24))
      this.reportData.duration = duration

      // 计算时间指标
      const daysAchievementRate = Math.round((this.reportData.planDay / this.reportData.executionDays) * 100)
      this.reportData.daysAchievementRate = daysAchievementRate

      // 计算费用指标
      this.reportData.failureCostRatio = this.reportData.improvementCost /
        (this.reportData.actualCost - this.reportData.improvementCost + Number.EPSILON) * 100
      this.reportData.failureCostRatio = this.reportData.failureCostRatio.toFixed(0)

      // 计算OEE达成率 
      const ctRate = Math.min(1, this.reportData.targetCt / (this.reportData.actualCt + Number.EPSILON))
      const delayRate = Math.min(1, this.reportData.targetDelayRate / (this.reportData.actualDelayRate + Number.EPSILON))
      const defectRate = Math.min(1, this.reportData.targetDefectRate / (this.reportData.actualDefectRate + Number.EPSILON))
      const oeeRate = Math.round((ctRate * delayRate * defectRate) * 100)
      this.reportData.oeeAchievementRate = oeeRate

      // 计算专案评分
      this.reportData.progressScore = Math.min(20, 10 * this.reportData.daysAchievementRate / 75).toFixed(0)
      this.reportData.failureCostScore = Math.min(30, 10 * 7 / this.reportData.failureCostRatio).toFixed(0)
      this.reportData.finishScore = (this.reportData.planDay * 0.4).toFixed(0)

      // 计算总分
      const totalScore = this.reportData.parallelCaseCount * this.reportData.finishScore * (
        0.1 * this.reportData.progressScore * 0.5 +
        0.1 * this.reportData.failureCostScore * 0.2 +
        0.1 * this.reportData.effectivenessScore * 0.2 +
        0.1 * this.reportData.practicalityScore * 0.1
      ) + 100 * this.reportData.designInnovationScore + this.reportData.specialContributionScore
      this.reportData.totalScore = totalScore.toFixed(0)
    },

    goBack() {
      this.$router.go(-1)
    },

    // 完善结案信息
    completeReport() {
      this.reportInputVisible = true
    },
    // 提交报表表单
    async handleSubmitReport() {
      this.$refs.reportFormRef.validate(async valid => {
        if (!valid) return

        this.reportLoading = true
        try {
          if (this.reportForm.id) {
            // 修改
            await updateCaseClosureInfo(this.reportForm)
            this.$message.success('修改成功')
          } else {
            // 新增
            await addCaseClosureInfo(this.reportForm)
            this.$message.success('新增成功')
          }
          this.reportInputVisible = false
          // 重新加载数据
          await this.loadCaseData()
          this.getUserScore()
        } catch (error) {
          console.error(error)
          this.$message.error('操作失败')
        } finally {
          this.reportLoading = false
        }
      })
    },
    // 对话框关闭回调
    handleReportDialogClose() {
      this.$refs.reportFormRef.resetFields()
    },
    async getUserScore() {
      const ret = await getMemberList(this.caseId)
      var totalCommissionRate = 0;
      if (ret.code === 200) {
        this.memberList = ret.data
        console.log('参与人员列表', this.memberList)
        for(var i=0;i<this.memberList.length;i++){
          var member = this.memberList[i];
          totalCommissionRate += member.commissionRate||0;
        }
      }
      const res = await getUserScore(this.caseId)
      if (res.code == 200) {
        this.designerScores = res.data
        var totalScore = 0;
        // 分给额外参与人员以后，还剩下多少结案积分的比例
        var leftRate = (100 - totalCommissionRate)/100;
        for (var i = 0; i < this.designerScores.length; i++) {
          totalScore += this.designerScores[i].executionScore;
        }
        for (var i = 0; i < this.designerScores.length; i++) {
          // 结案积分 = 结案积分*（1-参与人员占比总和）*执行阶段积分占比
          this.designerScores[i].closureScore = this.reportData.finishScore*leftRate*(this.designerScores[i].executionScore / totalScore);
          this.designerScores[i].totalScore = +this.designerScores[i].closureScore + +this.designerScores[i].executionScore;
          this.designerScores[i].isDeigner = true;
        }
        // 加上设计人员的数据
        for(var i=0;i<this.memberList.length;i++){
          var member = this.memberList[i];
          var newMember = {
            id: member.id,
            userName: member.userName,
            role: member.role,
            executionScore: member.commissionRate,
            closureScore: member.commissionRate*this.reportData.finishScore/100,
            totalScore: member.commissionRate*this.reportData.finishScore/100,
            isDeigner: false,
          }
          this.designerScores.push(newMember);
        }
        
        console.log('设计师评分列表', this.designerScores)
      }
    },
  }
}
</script>

<style scoped>
.case-closure-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.closure-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.closure-header h2 {
  margin: 0;
  color: #303133;
}

.base-info-card {
  margin-bottom: 20px;
}

.metrics-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.metric-card {
  height: 100%;
}

.metric-header {
  font-size: 16px;
  font-weight: bold;
}

.metric-header i {
  margin-right: 8px;
}

.score-section {
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: 20px;
  margin-bottom: 20px;
}

.score-card {
  height: 100%;
}

.score-header {
  font-size: 16px;
  font-weight: bold;
}

.score-header i {
  margin-right: 8px;
}

.summary-card {
  margin-bottom: 20px;
}

.summary-header {
  font-size: 16px;
  font-weight: bold;
}

.summary-header i {
  margin-right: 8px;
}

.closure-footer {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .metrics-section {
    grid-template-columns: 1fr;
  }

  .score-section {
    grid-template-columns: 1fr;
  }
}
</style>