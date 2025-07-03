<template>
  <div class="micro-phase-container">
    <div class="header">
      <h2>微阶段工作量统计</h2>
      <div class="filter-area">
        <el-form :inline="true">
          <el-form-item label="选择专案">
            <el-select v-model="selectedProject" placeholder="请选择专案" @change="loadMicroPhaseData">
              <el-option
                v-for="project in projectList"
                :key="project.id"
                :label="project.name"
                :value="project.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="yyyy-MM-dd"
              @change="loadMicroPhaseData">
            </el-date-picker>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <div class="summary-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card shadow="hover" class="summary-card">
            <div class="card-content">
              <div class="card-title">微阶段总数</div>
              <div class="card-value">{{ summaryData.totalCount }}</div>
              <div class="card-trend">
                <span :class="summaryData.countTrend > 0 ? 'up' : 'down'">
                  <i :class="summaryData.countTrend > 0 ? 'el-icon-top' : 'el-icon-bottom'"></i>
                  {{ Math.abs(summaryData.countTrend) }}%
                </span>
                <span class="card-trend-label">较上月</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="summary-card">
            <div class="card-content">
              <div class="card-title">总计划天数</div>
              <div class="card-value">{{ summaryData.totalPlanDays }}</div>
              <div class="card-trend">
                <span :class="summaryData.planDaysTrend > 0 ? 'up' : 'down'">
                  <i :class="summaryData.planDaysTrend > 0 ? 'el-icon-top' : 'el-icon-bottom'"></i>
                  {{ Math.abs(summaryData.planDaysTrend) }}%
                </span>
                <span class="card-trend-label">较上月</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="summary-card">
            <div class="card-content">
              <div class="card-title">总执行天数</div>
              <div class="card-value">{{ summaryData.totalExecutionDays }}</div>
              <div class="card-trend">
                <span :class="summaryData.executionDaysTrend > 0 ? 'up' : 'down'">
                  <i :class="summaryData.executionDaysTrend > 0 ? 'el-icon-top' : 'el-icon-bottom'"></i>
                  {{ Math.abs(summaryData.executionDaysTrend) }}%
                </span>
                <span class="card-trend-label">较上月</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="summary-card">
            <div class="card-content">
              <div class="card-title">平均执行效率</div>
              <div class="card-value">{{ summaryData.avgEfficiency }}%</div>
              <div class="card-trend">
                <span :class="summaryData.efficiencyTrend > 0 ? 'up' : 'down'">
                  <i :class="summaryData.efficiencyTrend > 0 ? 'el-icon-top' : 'el-icon-bottom'"></i>
                  {{ Math.abs(summaryData.efficiencyTrend) }}%
                </span>
                <span class="card-trend-label">较上月</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="chart-section">
      <el-card shadow="hover">
        <div class="chart-header">
          <h3>微阶段执行效率趋势</h3>
          <el-radio-group v-model="chartType" size="small">
            <el-radio-button label="line">折线图</el-radio-button>
            <el-radio-button label="bar">柱状图</el-radio-button>
          </el-radio-group>
        </div>
        <div class="chart-container" ref="efficiencyChart"></div>
      </el-card>
    </div>

    <div class="detail-table">
      <el-card shadow="hover">
        <div class="table-header">
          <h3>微阶段明细</h3>
          <div class="table-actions">
            <el-button type="primary" size="small" @click="exportData">导出数据</el-button>
            <el-button size="small" @click="toggleExpandAll">{{ expandAll ? '收起全部' : '展开全部' }}</el-button>
          </div>
        </div>
        <el-table
          :data="microPhaseData"
          style="width: 100%"
          border
          stripe
          v-loading="loading"
          :row-class-name="tableRowClassName"
          @row-click="handleRowClick"
          :expand-row-keys="expandedRows"
          row-key="id">
          <el-table-column type="expand">
            <template slot-scope="props">
              <div class="expand-content">
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="微阶段描述">{{ props.row.description }}</el-descriptions-item>
                  <el-descriptions-item label="所属专案">{{ getProjectName(props.row.projectId) }}</el-descriptions-item>
                  <el-descriptions-item label="所属阶段">{{ props.row.phaseName }}</el-descriptions-item>
                  <el-descriptions-item label="负责人">{{ props.row.owner }}</el-descriptions-item>
                  <el-descriptions-item label="开始时间">{{ props.row.startTime }}</el-descriptions-item>
                  <el-descriptions-item label="结束时间">{{ props.row.endTime }}</el-descriptions-item>
                  <el-descriptions-item label="计划天数">{{ props.row.planDays }}天</el-descriptions-item>
                  <el-descriptions-item label="执行天数">{{ props.row.executionDays }}天</el-descriptions-item>
                  <el-descriptions-item label="外界延期">{{ props.row.externalDelayDays }}天</el-descriptions-item>
                  <el-descriptions-item label="执行效率">{{ props.row.efficiency }}%</el-descriptions-item>
                </el-descriptions>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="微阶段名称" width="180"></el-table-column>
          <el-table-column prop="phaseName" label="所属阶段" width="120"></el-table-column>
          <el-table-column prop="startTime" label="开始时间" width="120"></el-table-column>
          <el-table-column prop="endTime" label="结束时间" width="120"></el-table-column>
          <el-table-column prop="planDays" label="计划天数" width="100">
            <template slot-scope="scope">
              <span>{{ scope.row.planDays }}天</span>
            </template>
          </el-table-column>
          <el-table-column prop="executionDays" label="执行天数" width="100">
            <template slot-scope="scope">
              <span :class="getExecutionDaysClass(scope.row)">
                {{ scope.row.executionDays }}天
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="externalDelayDays" label="外界延期" width="100">
            <template slot-scope="scope">
              <el-tag :type="scope.row.externalDelayDays > 0 ? 'danger' : 'success'" size="small">
                {{ scope.row.externalDelayDays }}天
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="efficiency" label="执行效率" width="120">
            <template slot-scope="scope">
              <el-progress 
                :percentage="scope.row.efficiency" 
                :color="getEfficiencyColor(scope.row.efficiency)"
                :show-text="false">
              </el-progress>
              <span :class="getEfficiencyTextClass(scope.row.efficiency)">
                {{ scope.row.efficiency }}%
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template slot-scope="scope">
              <el-tag :type="getStatusTagType(scope.row.status)" size="small">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template slot-scope="scope">
              <el-button size="mini" @click.stop="showDetail(scope.row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <el-dialog :title="currentDetailTitle" :visible.sync="detailVisible" width="70%">
      <div v-if="currentDetail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="微阶段名称">{{ currentDetail.name }}</el-descriptions-item>
          <el-descriptions-item label="所属专案">{{ getProjectName(currentDetail.projectId) }}</el-descriptions-item>
          <el-descriptions-item label="所属阶段">{{ currentDetail.phaseName }}</el-descriptions-item>
          <el-descriptions-item label="负责人">{{ currentDetail.owner }}</el-descriptions-item>
          <el-descriptions-item label="开始时间">{{ currentDetail.startTime }}</el-descriptions-item>
          <el-descriptions-item label="结束时间">{{ currentDetail.endTime }}</el-descriptions-item>
          <el-descriptions-item label="计划天数">{{ currentDetail.planDays }}天</el-descriptions-item>
          <el-descriptions-item label="执行天数">{{ currentDetail.executionDays }}天</el-descriptions-item>
          <el-descriptions-item label="外界延期">{{ currentDetail.externalDelayDays }}天</el-descriptions-item>
          <el-descriptions-item label="执行效率">
            <span :class="getEfficiencyTextClass(currentDetail.efficiency)">
              {{ currentDetail.efficiency }}%
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTagType(currentDetail.status)" size="small">
              {{ getStatusText(currentDetail.status) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
        <div class="detail-description">
          <h4>详细描述</h4>
          <p>{{ currentDetail.description }}</p>
        </div>
        <div class="detail-comments" v-if="currentDetail.comments && currentDetail.comments.length > 0">
          <h4>备注信息</h4>
          <el-timeline>
            <el-timeline-item
              v-for="(comment, index) in currentDetail.comments"
              :key="index"
              :timestamp="comment.time">
              {{ comment.content }}
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: 'MicroPhaseWorkload',
  data() {
    return {
      selectedProject: null,
      dateRange: [this.getFirstDayOfMonth(), this.getLastDayOfMonth()],
      projectList: [
        { id: 'p1', name: '智慧城市建设项目' },
        { id: 'p2', name: '企业ERP系统升级' },
        { id: 'p3', name: '电商平台重构' },
        { id: 'p4', name: '大数据分析平台' },
        { id: 'p5', name: '移动端应用开发' }
      ],
      summaryData: {
        totalCount: 0,
        countTrend: 0,
        totalPlanDays: 0,
        planDaysTrend: 0,
        totalExecutionDays: 0,
        executionDaysTrend: 0,
        avgEfficiency: 0,
        efficiencyTrend: 0
      },
      microPhaseData: [],
      efficiencyChart: null,
      chartType: 'line',
      loading: false,
      detailVisible: false,
      currentDetail: null,
      currentDetailTitle: '',
      expandAll: false,
      expandedRows: []
    };
  },
  mounted() {
    this.loadMicroPhaseData();
    this.initEfficiencyChart();
  },
  beforeDestroy() {
    if (this.efficiencyChart) {
      this.efficiencyChart.dispose();
    }
  },
  watch: {
    chartType() {
      this.updateEfficiencyChart();
    }
  },
  methods: {
    getFirstDayOfMonth() {
      const date = new Date();
      return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
    },
    getLastDayOfMonth() {
      const date = new Date();
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
    },
    loadMicroPhaseData() {
      this.loading = true;
      // 模拟API请求
      setTimeout(() => {
        this.generateMockData();
        this.updateSummaryData();
        this.updateEfficiencyChart();
        this.loading = false;
      }, 800);
    },
    generateMockData() {
      const mockData = [];
      const projects = this.selectedProject ? 
        this.projectList.filter(p => p.id === this.selectedProject) : 
        this.projectList;
      
      const statuses = ['pending', 'in_progress', 'completed', 'delayed'];
      const statusTexts = {
        'pending': '待开始',
        'in_progress': '进行中',
        'completed': '已完成',
        'delayed': '已延期'
      };
      
      const phaseNames = ['需求分析', '设计阶段', '开发阶段', '测试阶段', '部署阶段'];
      
      projects.forEach(project => {
        const phaseCount = Math.floor(Math.random() * 3) + 2; // 每个项目2-4个阶段
        for (let i = 0; i < phaseCount; i++) {
          const phaseName = phaseNames[i % phaseNames.length];
          const microPhaseCount = Math.floor(Math.random() * 5) + 3; // 每个阶段3-7个微阶段
          
          for (let j = 0; j < microPhaseCount; j++) {
            const planDays = Math.floor(Math.random() * 10) + 3; // 3-12天
            const externalDelayDays = Math.random() > 0.7 ? Math.floor(Math.random() * 5) : 0;
            const executionDays = Math.floor(Math.random() * (planDays + externalDelayDays + 3));
            const efficiency = Math.min(100, Math.floor((planDays / executionDays) * 100));
            const statusIndex = Math.floor(Math.random() * statuses.length);
            const status = statuses[statusIndex];
            
            const startDate = new Date(this.dateRange[0]);
            const endDate = new Date(this.dateRange[1]);
            const randomStart = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
            const randomEnd = new Date(randomStart.getTime() + executionDays * 24 * 60 * 60 * 1000);
            
            mockData.push({
              id: `mp_${project.id}_${i}_${j}`,
              projectId: project.id,
              name: `${phaseName}-微阶段${j + 1}`,
              phaseName: phaseName,
              description: `这是${project.name}项目中${phaseName}的第${j + 1}个微阶段，主要完成相关功能的开发和测试工作。`,
              startTime: randomStart.toISOString().split('T')[0],
              endTime: randomEnd.toISOString().split('T')[0],
              planDays: planDays,
              executionDays: executionDays,
              externalDelayDays: externalDelayDays,
              efficiency: efficiency,
              status: status,
              statusText: statusTexts[status],
              owner: `用户${Math.floor(Math.random() * 5) + 1}`,
              comments: [
                {
                  time: '2023-05-10',
                  content: '微阶段需求确认完成'
                },
                {
                  time: '2023-05-15',
                  content: '开发工作已开始'
                }
              ]
            });
          }
        }
      });
      
      this.microPhaseData = mockData;
    },
    updateSummaryData() {
      if (this.microPhaseData.length === 0) {
        this.summaryData = {
          totalCount: 0,
          countTrend: 0,
          totalPlanDays: 0,
          planDaysTrend: 0,
          totalExecutionDays: 0,
          executionDaysTrend: 0,
          avgEfficiency: 0,
          efficiencyTrend: 0
        };
        return;
      }
      
      const totalCount = this.microPhaseData.length;
      const totalPlanDays = this.microPhaseData.reduce((sum, item) => sum + item.planDays, 0);
      const totalExecutionDays = this.microPhaseData.reduce((sum, item) => sum + item.executionDays, 0);
      const avgEfficiency = Math.round(this.microPhaseData.reduce((sum, item) => sum + item.efficiency, 0) / totalCount);
      
      // 模拟趋势数据
      const countTrend = Math.floor(Math.random() * 20) - 10;
      const planDaysTrend = Math.floor(Math.random() * 20) - 10;
      const executionDaysTrend = Math.floor(Math.random() * 20) - 10;
      const efficiencyTrend = Math.floor(Math.random() * 20) - 10;
      
      this.summaryData = {
        totalCount,
        countTrend,
        totalPlanDays,
        planDaysTrend,
        totalExecutionDays,
        executionDaysTrend,
        avgEfficiency,
        efficiencyTrend
      };
    },
    initEfficiencyChart() {
      this.efficiencyChart = echarts.init(this.$refs.efficiencyChart);
      this.updateEfficiencyChart();
    },
    updateEfficiencyChart() {
      if (!this.efficiencyChart) return;
      
      // 模拟按周/月的效率数据
      const weeks = ['第1周', '第2周', '第3周', '第4周'];
      const efficiencyData = weeks.map(() => Math.floor(Math.random() * 30) + 70);
      const planData = weeks.map(() => 100);
      
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['执行效率', '计划效率']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: weeks
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value}%'
          },
          max: 100
        },
        series: [
          {
            name: '执行效率',
            type: this.chartType,
            data: efficiencyData,
            itemStyle: {
              color: '#409EFF'
            },
            markLine: {
              data: [
                { type: 'average', name: '平均值' }
              ]
            }
          },
          {
            name: '计划效率',
            type: this.chartType,
            data: planData,
            itemStyle: {
              color: '#67C23A'
            }
          }
        ]
      };
      
      this.efficiencyChart.setOption(option);
    },
    getProjectName(projectId) {
      const project = this.projectList.find(p => p.id === projectId);
      return project ? project.name : '未知项目';
    },
    getStatusTagType(status) {
      switch (status) {
        case 'completed': return 'success';
        case 'in_progress': return 'primary';
        case 'pending': return 'info';
        case 'delayed': return 'danger';
        default: return '';
      }
    },
    getStatusText(status) {
      const statusTexts = {
        'pending': '待开始',
        'in_progress': '进行中',
        'completed': '已完成',
        'delayed': '已延期'
      };
      return statusTexts[status] || status;
    },
    getExecutionDaysClass(row) {
      if (row.executionDays > row.planDays + row.externalDelayDays) {
        return 'execution-over';
      } else if (row.executionDays < row.planDays) {
        return 'execution-under';
      }
      return '';
    },
    getEfficiencyColor(efficiency) {
      if (efficiency >= 90) return '#67C23A';
      if (efficiency >= 70) return '#E6A23C';
      return '#F56C6C';
    },
    getEfficiencyTextClass(efficiency) {
      if (efficiency >= 90) return 'efficiency-high';
      if (efficiency >= 70) return 'efficiency-medium';
      return 'efficiency-low';
    },
    tableRowClassName({ row }) {
      if (row.status === 'delayed') {
        return 'warning-row';
      } else if (row.status === 'completed') {
        return 'success-row';
      }
      return '';
    },
    handleRowClick(row) {
      const index = this.expandedRows.indexOf(row.id);
      if (index > -1) {
        this.expandedRows.splice(index, 1);
      } else {
        this.expandedRows.push(row.id);
      }
    },
    toggleExpandAll() {
      this.expandAll = !this.expandAll;
      if (this.expandAll) {
        this.expandedRows = this.microPhaseData.map(item => item.id);
      } else {
        this.expandedRows = [];
      }
    },
    showDetail(row) {
      this.currentDetail = row;
      this.currentDetailTitle = `微阶段详情 - ${row.name}`;
      this.detailVisible = true;
    },
    exportData() {
      this.$message.success('导出数据成功');
    }
  }
};
</script>

<style scoped>
.micro-phase-container {
  padding: 20px;
  background-color: #f5f7fa;
}

.header {
  margin-bottom: 20px;
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.header h2 {
  margin: 0 0 20px 0;
  color: #303133;
}

.summary-cards {
  margin-bottom: 20px;
}

.summary-card {
  margin-bottom: 20px;
  height: 100%;
}

.summary-card .card-content {
  padding: 10px;
}

.summary-card .card-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.summary-card .card-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #303133;
}

.summary-card .card-trend {
  font-size: 12px;
  color: #909399;
}

.summary-card .card-trend .up {
  color: #67C23A;
}

.summary-card .card-trend .down {
  color: #F56C6C;
}

.summary-card .card-trend-label {
  margin-left: 5px;
}

.chart-section {
  margin-bottom: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.chart-header h3 {
  margin: 0;
}

.chart-container {
  height: 400px;
}

.detail-table {
  margin-bottom: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.table-header h3 {
  margin: 0;
}

.expand-content {
  padding: 20px;
  background-color: #f9f9f9;
}

.execution-over {
  color: #F56C6C;
  font-weight: bold;
}

.execution-under {
  color: #E6A23C;
  font-weight: bold;
}

.efficiency-high {
  color: #67C23A;
  font-weight: bold;
}

.efficiency-medium {
  color: #E6A23C;
  font-weight: bold;
}

.efficiency-low {
  color: #F56C6C;
  font-weight: bold;
}

.detail-description {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.detail-comments {
  margin-top: 20px;
}

.el-table .warning-row {
  background-color: #fdf6ec;
}

.el-table .success-row {
  background-color: #f0f9eb;
}
</style>