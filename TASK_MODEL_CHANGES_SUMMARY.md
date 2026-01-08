# Task 模型变化总结文档

## 概述

后端 Task 模型进行了重大更新，将原有的 `plan_days` 拆分为 `plan_days`（日历天数）和 `estimated_workload`（工作负荷/工作日数），并新增 `actual_duration_days`（实际执行天数）字段。同时引入 `calc_version` 字段来区分新旧版本的绩效计算方式。

## 后端模型变化

### 新增字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `estimated_workload` | Integer | 工作负荷，表示任务的工作日数 |
| `actual_duration_days` | Integer | 实际执行天数，不再实时计算 |
| `calc_version` | Integer | 计算版本：1=旧版本，2=新版本 |

### 字段说明

- **plan_days**: 日历天数（保留），用于时间规划
- **estimated_workload**: 工作负荷（新增），用于绩效计算，表示任务的实际工作量
- **actual_duration_days**: 实际执行天数（新增），由后端计算并存储，不再前端实时计算
- **calc_version**: 计算版本（新增），用于区分新旧计算方式

### 设计目的

原有方案的问题：
- 2天的任务由于其他原因必须执行10天，导致绩效计算不合理
- 用户需要频繁点击暂停和申请延期

新方案的优势：
- 将计划时间拆分为日历天数和工作负荷
- 绩效计算基于工作负荷而非实际执行天数
- 避免外部因素对绩效评分的影响

---

## 前端修改详情

### 1. UserStatistics.vue - 达成率计算

**文件路径**: `src/views/UserViews/UserStatistics.vue`

**修改位置**: Line 248-276 (getFinishedTaskList 方法)

**修改内容**:
```javascript
// 原来的计算方式（旧版本）
s.achievingRate = +((s.planDays + +s.unforcedDays) * 100 / s.executionDays).toFixed()

// 新增版本判断逻辑
if (s.calc_version === 2) {
  // 新版本：基于estimated_workload的计算
  if (s.actual_duration_days < s.planDays) {
    // 实际执行天数小于预计时间，达成率为100%
    s.achievingRate = 100
  } else {
    // 实际执行天数大于预计时间，计算达成率
    s.achievingRate = +(s.planDays * 100 / s.actual_duration_days).toFixed()
  }
} else {
  // 旧版本：保持原来的计算方式
  s.achievingRate = +((s.planDays + +s.unforcedDays) * 100 / s.executionDays).toFixed()
}
```

**说明**:
- 新版本达成率计算基于 `planDays` 和 `actual_duration_days`
- 当实际执行天数小于预计时间时，达成率为100%
- 当实际执行天数大于预计时间时，达成率 = 预计时间 / 实际执行天数 * 100

---

### 2. CaseSubView.vue - 积分计算

**文件路径**: `src/views/CaseViews/CaseSubView.vue`

**修改位置**: Line 799-819 (initSubInfo 方法中的积分计算部分)

**修改内容**:
```javascript
// 原来的计算方式（旧版本）
this.subInfo[i].value = (this.subInfo[i].planDays * (this.subInfo[i].planDays * 1.0 / this.subInfo[i].executionDays) ** (2 / 3)).toFixed(2)

// 新增版本判断逻辑
if (this.subInfo[i].calc_version === 2) {
  // 新版本：基于estimated_workload的计算
  if (this.subInfo[i].actual_duration_days < this.subInfo[i].planDays) {
    // 实际执行天数小于预计时间，获得estimated_workload数值表示的得分
    this.subInfo[i].value = this.subInfo[i].estimated_workload
  } else {
    // 实际执行天数大于预计时间，计算最终得分
    const achievingRate = this.subInfo[i].planDays * 1.0 / this.subInfo[i].actual_duration_days
    this.subInfo[i].value = (this.subInfo[i].estimated_workload * achievingRate).toFixed(2)
  }
} else {
  // 旧版本：保持原来的计算方式
  this.subInfo[i].value = (this.subInfo[i].planDays * (this.subInfo[i].planDays * 1.0 / this.subInfo[i].executionDays) ** (2 / 3)).toFixed(2)
}
```

**说明**:
- 新版本积分计算基于 `estimated_workload`
- 当实际执行天数小于预计时间时，得分 = estimated_workload
- 当实际执行天数大于预计时间时，得分 = estimated_workload * (planDays / actual_duration_days)

---

### 3. TaskManage.vue - 新增表单字段

**文件路径**: `src/views/CaseViews/TaskManage.vue`

**修改位置1**: Line 163-175 (编辑任务对话框)

**修改内容**:
```vue
<!-- 新增工作负荷和实际执行天数字段 -->
<el-row>
    <el-col :span="10">
        <el-form-item label="工作负荷">
            <el-input type="number" v-model="curTaskObj.estimated_workload" placeholder="工作日数"></el-input>
        </el-form-item>
    </el-col>

    <el-col :span="12" :offset="2">
        <el-form-item label="实际执行天数">
            <el-input type="number" v-model="curTaskObj.actual_duration_days" placeholder="实际执行天数"></el-input>
        </el-form-item>
    </el-col>
</el-row>
```

**修改位置2**: Line 245-247 (新增任务对话框)

**修改内容**:
```vue
<!-- 在预估时间字段后新增工作负荷字段 -->
<el-form-item label="工作负荷" prop="estimated_workload">
    <el-input type="number" placeholder="请输入工作负荷（工作日数）" v-model.number="addTaskObj.estimated_workload"></el-input>
</el-form-item>
```

**说明**:
- 编辑任务时可以修改 `estimated_workload` 和 `actual_duration_days`
- 新增任务时需要填写 `estimated_workload`
- `actual_duration_days` 通常由后端计算，前端可选填

---

### 4. UserProjectTracking.vue - 进度百分比计算

**文件路径**: `src/views/ManageViews/UserProjectTracking.vue`

**修改位置**: Line 429-496 (getTaskByUserId 方法)

**修改内容**:
```javascript
// 原来的计算方式（旧版本）
this.userInfo[i].percentage = costDay * 1.0 / (this.userInfo[i].planDays + +this.userInfo[i].unforcedDays) * 100

// 新增版本判断逻辑
if (this.userInfo[i].calc_version === 2) {
  // 新版本：基于estimated_workload的计算
  this.userInfo[i].percentage = costDay * 1.0 / this.userInfo[i].estimated_workload * 100
} else {
  // 旧版本：保持原来的计算方式
  this.userInfo[i].percentage = costDay * 1.0 / (this.userInfo[i].planDays + +this.userInfo[i].unforcedDays) * 100
}
```

**说明**:
- 新版本进度百分比基于 `estimated_workload`
- 计算公式：已执行天数 / estimated_workload * 100

---

## 修改的文件列表

| 文件路径 | 修改类型 | 修改说明 |
|---------|---------|---------|
| `src/views/UserViews/UserStatistics.vue` | 逻辑修改 | 更新达成率计算逻辑，支持新版本 |
| `src/views/CaseViews/CaseSubView.vue` | 逻辑修改 | 更新积分计算逻辑，支持新版本 |
| `src/views/CaseViews/TaskManage.vue` | UI + 逻辑 | 新增表单字段，支持编辑新字段 |
| `src/views/ManageViews/UserProjectTracking.vue` | 逻辑修改 | 更新进度百分比计算逻辑，支持新版本 |

---

## 新版本绩效计算公式总结

### 达成率计算 (UserStatistics.vue)

**新版本 (calc_version = 2)**:
```
if actual_duration_days < planDays:
    achievingRate = 100%
else:
    achievingRate = (planDays / actual_duration_days) * 100%
```

**旧版本 (calc_version = 1)**:
```
achievingRate = ((planDays + unforcedDays) / executionDays) * 100%
```

### 积分计算 (CaseSubView.vue)

**新版本 (calc_version = 2)**:
```
if actual_duration_days < planDays:
    score = estimated_workload
else:
    score = estimated_workload * (planDays / actual_duration_days)
```

**旧版本 (calc_version = 1)**:
```
score = planDays * (planDays / executionDays) ^ (2/3)
```

### 进度百分比计算 (UserProjectTracking.vue)

**新版本 (calc_version = 2)**:
```
percentage = (executedDays / estimated_workload) * 100%
```

**旧版本 (calc_version = 1)**:
```
percentage = (executedDays / (planDays + unforcedDays)) * 100%
```

---

## 后端对接要点

### API 返回数据结构

后端返回的 Task 对象需要包含以下字段：

```json
{
  "id": 1,
  "description": "任务描述",
  "planDays": 5,
  "estimated_workload": 4,
  "actual_duration_days": 6,
  "calc_version": 2,
  "startTime": "2024-01-01",
  "finishTime": "2024-01-07",
  "executionDays": 7,
  "unforcedDays": 0,
  "applyDelay": 0,
  "achievingRate": 83,
  "isDelay": true
}
```

### 关键字段说明

- `calc_version`: 必须返回，用于前端判断使用哪种计算方式
- `estimated_workload`: 新版本必须返回，用于绩效计算
- `actual_duration_days`: 新版本必须返回，用于绩效计算
- `planDays`: 保留，用于时间规划和兼容旧版本

---

## 兼容性说明

### 向后兼容

- 当 `calc_version = 1` 或未设置时，使用旧版本计算方式
- 旧版本计算方式保持不变，确保现有数据不受影响
- 前端自动判断版本，无需手动切换

### 数据迁移

- 旧数据保持 `calc_version = 1`
- 新数据设置 `calc_version = 2`
- 可以在后端逐步迁移数据，前端自动适配

---

## 测试建议

### 单元测试

1. 测试新版本达成率计算
   - 实际执行天数 < 预计时间
   - 实际执行天数 > 预计时间
   - 实际执行天数 = 预计时间

2. 测试新版本积分计算
   - 实际执行天数 < 预计时间
   - 实际执行天数 > 预计时间

3. 测试进度百分比计算
   - 基于 estimated_workload 的计算

### 集成测试

1. 测试旧版本数据兼容性
2. 测试新旧版本数据混合场景
3. 测试表单提交新字段

### 用户验收测试

1. 验证达成率显示正确
2. 验证积分计算正确
3. 验证进度条显示正确
4. 验证统计数据准确

---

## 注意事项

1. **字段验证**: 前端需要验证 `estimated_workload` 和 `actual_duration_days` 为正整数
2. **数据一致性**: 确保后端返回的数据包含所有必需字段
3. **性能考虑**: 大量数据时注意计算性能
4. **错误处理**: 当字段缺失时，应使用默认值或提示用户

---

## 后续优化建议

1. 考虑在表格中添加 `estimated_workload` 列显示
2. 考虑在表格中添加 `actual_duration_days` 列显示
3. 考虑添加数据验证规则
4. 考虑添加计算版本的可视化标识
5. 考虑添加数据导出功能，包含新字段

