<template>
  <!-- 设计人员积分展示组件 -->
  <el-card shadow="hover" class="designer-score-card">
    <div slot="header" class="clearfix">
      <span style="font-weight: bold; font-size: 16px;">设计人员积分分配</span>
      <el-button type="primary" size="small" style="float: right;" @click="showAddMemberDialog()" v-if="user.type===1">
        <i class="el-icon-plus"></i> 新增参与人员
      </el-button>
    </div>

    <!-- 积分表格 -->
    <el-table :data="processedDesignerData" border stripe size="small" style="width: 100%; margin-bottom: 15px;"
      :span-method="mergeRoleCells">
      <el-table-column prop="role" label="身份" width="80" align="center"></el-table-column>
      <el-table-column prop="userName" label="成员" width="80" align="center"></el-table-column>
      <el-table-column prop="executionScore" label="执行积分/提成比例" width="160" align="center">
        <template slot-scope="scope">
          {{ scope.row.executionScore.toFixed(0) + (scope.row.isDesigner ? '' : '%') }}
        </template>
      </el-table-column>
      <el-table-column prop="closureScore" label="结案积分" width="100" align="center">
        <template slot-scope="scope">
          {{ scope.row.closureScore.toFixed(0) }}
        </template>
      </el-table-column>
      <el-table-column prop="totalScore" label="总积分" width="100" align="center">
        <template slot-scope="scope">
          {{ scope.row.totalScore.toFixed(0) }}
        </template>
      </el-table-column>
      <el-table-column label="占比" align="center">
        <template slot-scope="scope">
          <el-progress :percentage="scope.row.scoreRate" :stroke-width="20"
            :color="getPercentageColor(scope.row.scoreRate)" :text-inside="true"
            :format="formatScoreRate"></el-progress>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="60" align="center" v-if="editable">
        <template slot-scope="scope">
          <el-button type="danger" size="mini" icon="el-icon-delete" circle @click="removeMember(scope.row)"
            v-if='user.type===1&&scope.row.isDesigner === false'></el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 积分统计汇总 -->
    <div class="score-summary">
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="summary-item">
            <span class="summary-label">总执行积分:</span>
            <span class="summary-value">{{ totalExecutionScore.toFixed(1) }}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="summary-item">
            <span class="summary-label">总结案积分:</span>
            <span class="summary-value">{{ totalClosureScore.toFixed(1) }}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="summary-item">
            <span class="summary-label">总积分:</span>
            <span class="summary-value">{{ totalScore.toFixed(1) }}</span>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 新增参与人员对话框 -->
    <el-dialog title="新增参与人员" :visible.sync="addMemberDialogVisible" width="500px" @close="resetAddMemberForm()">
      <el-form :model="addMemberForm" ref="addMemberFormRef" label-width="100px">
        <el-form-item label="选择成员" prop="userId">
          <AllUser v-model="addMemberForm.userId" :placeholder="'请选择参与贡献成员'" :multiplable="false"></AllUser>
        </el-form-item>
        <el-form-item label="身份" prop="role">
          <el-select v-model="addMemberForm.role" placeholder="请选择身份" style="width: 100%">
            <el-option label="导师" value="导师"></el-option>
            <el-option label="助理" value="助理"></el-option>
            <el-option label="IE" value="IE"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="占比(%)" prop="commissionRate">
          <el-input-number v-model="addMemberForm.commissionRate" :min="0" :max="100" :precision="1"
            controls-position="right"></el-input-number>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addMemberDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmAddMember()">确 定</el-button>
      </span>
    </el-dialog>

  </el-card>
</template>

<script>
import { mapState } from 'vuex';
import { getMemberList, addMember, updateMember, deleteMember } from '@/api/caseParticipants';
export default {
  props: {
    // 从父组件接收的设计人员积分数据
    designerData: {
      type: Array,
      default: () => [
        {
          id: 1,
          name: '张三',
          role: '机构',
          executionScore: 25.5,
          closureScore: 20.0
        },
        {
          id: 2,
          name: '李四',
          role: '电控',
          executionScore: 18.0,
          closureScore: 14.0
        },
        {
          id: 3,
          name: '王五',
          role: '电控',
          executionScore: 12.0,
          closureScore: 10.5
        },
        {
          id: 4,
          name: '赵六',
          role: '导师',
          executionScore: 15.0,
          closureScore: 12.0
        },
        {
          id: 5,
          name: '钱七',
          role: '助理',
          executionScore: 8.0,
          closureScore: 6.5
        }
      ]
    },
    caseId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      editable: true,
      addMemberDialogVisible: false,
      addMemberForm: {
        userId: null,       // 用户ID
        userName: '',       // 用户名（用于展示）
        role: '',           // 角色
        commissionRate: 0   // 提成比例
      },
      addMemberRules: {
        userId: [
          { required: true, message: '请选择用户', trigger: 'change' }
        ],
        role: [
          { required: true, message: '请选择身份', trigger: 'change' }
        ],
        commissionRate: [
          { required: true, message: '请输入占比', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (value <= 0) {
                callback(new Error('占比必须大于0'));
              } else if (value > 100) {
                callback(new Error('占比不能超过100%'));
              } else {
                callback();
              }
            },
            trigger: 'blur'
          }
        ]
      },
      memberList: []
    }
  },
  computed: {
    ...mapState(['user']),
    // 计算新增参与人员的总占比
    totalCommissionRate() {
      return this.designerData.filter(designer => !designer.isDesigner)
        .reduce((sum, designer) => sum + (designer.commissionRate || 0), 0)
    },
    // 计算总执行积分
    totalExecutionScore() {
      return this.designerData.reduce((sum, designer) => {
        return designer.isDesigner? sum + designer.executionScore : sum
      }, 0)
    },
    // 计算总结案积分
    totalClosureScore() {
      return this.designerData.reduce((sum, designer) => sum + designer.closureScore, 0)
    },
    // 计算总积分
    totalScore() {
      return this.totalExecutionScore + this.totalClosureScore
    },
    sortedDesignerData() {
      // 按照角色分组排序
      return [...this.designerData].sort((a, b) => {
        if (a.role === b.role) {
          return 0;
        }
        // 可以自定义角色排序规则
        const roleOrder = ['机构', '电控', '机设', '导师', '助理', 'IE'];
        return roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role);
      });
    },
    // 修改后的处理后的设计人员数据
    processedDesignerData() {
      var data = this.sortedDesignerData.map(designer => ({
        ...designer,
        totalScore: designer.isDesigner ? designer.executionScore + designer.closureScore : designer.closureScore,
        scoreRate: designer.totalScore / this.totalScore * 100
      }));
      return data
    },
    // 新增角色分组计算属性
    roleGroups() {
      const groups = {};
      this.processedDesignerData.forEach((item, index) => {
        if (!groups[item.role]) {
          groups[item.role] = {
            start: index,
            count: 1
          };
        } else {
          groups[item.role].count++;
        }
      });
      return groups;
    }
  },
  methods: {
    // 修改后的合并单元格方法
    mergeRoleCells({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) { // 只合并身份列
        const role = row.role;
        if (this.roleGroups[role]) {
          if (rowIndex === this.roleGroups[role].start) {
            return {
              rowspan: this.roleGroups[role].count,
              colspan: 1
            };
          } else {
            return {
              rowspan: 0,
              colspan: 0
            };
          }
        }
      }
    },
    // 根据百分比获取进度条颜色
    getPercentageColor(percentage) {
      if (percentage > 20) return '#67C23A'
      if (percentage > 10) return '#409EFF'
      if (percentage > 5) return '#E6A23C'
      return '#F56C6C'
    },
    // 获取贡献标签类型
    getContributionTagType(index) {
      const types = ['', 'success', 'info', 'warning', 'danger']
      return types[index % types.length]
    },
    // 显示新增成员对话框
    showAddMemberDialog() {
      this.addMemberDialogVisible = true
    },
    // 重置新增成员表单
    resetAddMemberForm() {
      this.$refs.addMemberFormRef?.resetFields()
    },
    // 确认新增成员
    confirmAddMember() {
      this.$refs.addMemberFormRef.validate(async valid => {
        if (valid) {
          if (this.caseId === null) {
            this.$message.error('专案信息为空，无法新增成员')
            return
          }
          const newMember = {
            caseId: this.caseId,
            userId: this.addMemberForm.userId[2],
            role: this.addMemberForm.role,
            commissionRate: this.addMemberForm.commissionRate
          }
          const res = await addMember(newMember)
          if (res.code === 200) {
            this.$message.success('新增成员成功')
            this.$emit('refresh');  // 通知父组件刷新数据
          }
          this.addMemberDialogVisible = false
        }
      })
    },
    handleUserChange(userId) {
      const user = this.userList.find(u => u.id === userId);
      if (user) {
        this.addMemberForm.userName = user.name;
      }
    },
    removeMember(member) {
      this.$confirm(`此操作将删除  ${member.role} ${member.userName},  是否继续?`, '提示', {
        cancelButtonText: '取消',
        confirmButtonText: '确定',
        type: 'warning'
      }).then(async () => {
        const res = await deleteMember(member.id);
        if (res.code === 200) {
          this.$message({
            type: 'success',
            message: `${member.name} 已删除`,
            duration: 2000
          });
          this.$emit('refresh');
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    formatScoreRate(value) {
      return value.toFixed(0) + "%";
    }
  }
}
</script>

<style scoped>
.designer-score-card {
  margin-bottom: 20px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both;
}

/* 积分汇总样式 */
.score-summary {
  margin-top: 15px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 10px;
}

.summary-label {
  font-size: 14px;
  color: #606266;
}

.summary-value {
  font-size: 16px;
  font-weight: bold;
  color: #409EFF;
}

/* 表格单元格样式 */
.el-table /deep/ .cell {
  padding: 8px 10px;
}

/* 进度条样式 
.el-progress {
  display: inline-block;
  vertical-align: middle;
  width: 120px;
}*/
</style>