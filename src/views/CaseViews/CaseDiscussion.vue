<template>
    <el-card>
        <!-- 面包屑导航区域 -->
        <div>
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>专案管理</el-breadcrumb-item>
                <el-breadcrumb-item>专案讨论</el-breadcrumb-item>
            </el-breadcrumb>
        </div>

        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
            <el-form-item label="问题标题" prop="name">
                <el-input v-model="queryParams.searchText" placeholder="请输入问题标题" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="问题状态" prop="status">
                <el-select v-model="queryParams.status" clearable placeholder="请选择问题状态">
                    <el-option v-for="status in statusOpptions" :key="status.value" :label="status.label"
                        :value="status.value"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="问题类型" prop="type">
                <el-select v-model="queryParams.type" clearable placeholder="请选择问题类型">
                    <el-option v-for="type_item in typeOpptions" :key="type_item.value" :label="type_item.label"
                        :value="type_item.value"></el-option>
                </el-select>
            </el-form-item>

            <el-form-item label="关联专案" prop="relativeCaseId">
                <el-select v-model="queryParams.relativeCaseId" clearable placeholder="请选择关联专案">
                    <el-option v-for="case_item in caseList" :key="case_item.id" :label="case_item.name"
                        :value="case_item.id"></el-option>
                </el-select>
            </el-form-item>

            <el-form-item>
                <el-dropdown size="medium" @command="handleCommand" trigger="click">
                    <span class="el-dropdown-link">
                        {{ sortByTime ? '最早' : sortByReply ? '热度' : '最新' }}<i
                            class="el-icon-arrow-down el-icon--right"></i>
                    </span>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="timeUp">最早</el-dropdown-item>
                        <el-dropdown-item command="timeDown">最新</el-dropdown-item>
                        <el-dropdown-item command="reply">热度</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </el-form-item>

            <el-form-item>
                <el-button type="primary" icon="el-icon-search" @click="handleQuery" circle />
                <el-tooltip class="item" effect="dark" content="重置查询条件" placement="top">
                    <el-button v-if="!loading" icon="el-icon-refresh" @click="resetQuery" circle />
                    <el-button v-else icon="el-icon-loading" circle />
                </el-tooltip>
                <el-button type="success" icon="el-icon-circle-plus-outline"
                    @click="newIssueVisible = true">新增问题</el-button>
            </el-form-item>

            <el-form-item>
                <el-button v-if="!loadMine" type="primary" icon="el-icon-user" size="mini"
                    @click="viewMine(true)">我的问题</el-button>
                <el-button v-else type="warning" icon="el-icon-document" size="mini"
                    @click="viewMine(false)">全部问题</el-button>
                <el-button v-if="queryParams.onlyRelativeMe === false" type="danger" size="mini" icon="el-icon-view"
                    @click="viewRelatedMe(true)">与我相关</el-button>
                <el-button v-else type="danger" size="mini" icon="el-icon-s-grid"
                    @click="viewRelatedMe(false)">查看全部</el-button>

            </el-form-item>
        </el-form>

        <el-descriptions :column="4" style="margin-bottom: 20px;" border v-for="issues_item in pageList"
            :key="issues_item.id" v-loading="loading" :class="issues_item.className">
            <template #title>
                {{ issues_item.title }}<el-tag v-if="issues_item.createTime > lastLoginDate" type="danger" effect="dark"
                    style="font-size:15px;margin-left:15px;">new</el-tag>
            </template>
            <el-descriptions-item label="关联专案" :labelStyle="{ width: '100px' }" :contentStyle="{ width: '400px' }">{{
            issues_item.caseName === null ? '无关联专案' : issues_item.caseName }}</el-descriptions-item>
            <el-descriptions-item label="状态">
                <el-tag v-if="issues_item.status === 0">处理中</el-tag>
                <el-tag v-else-if="issues_item.status === 1" type="success">已解决</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="类型">
                <el-tag v-if="issues_item.type === 0">机构</el-tag>
                <el-tag v-else-if="issues_item.type === 1" type="success">电控</el-tag>
                <el-tag v-else-if="issues_item.type === 2" type="warning">综合</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建人">{{ issues_item.createName }}</el-descriptions-item>
            <el-descriptions-item label="回复"><el-tag type="success" effect="dark" style="font-size:15px;">{{
            issues_item.replyCount }}</el-tag></el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ issues_item.createTime }}</el-descriptions-item>
            <el-descriptions-item label="详情">
                <div style="width:40%;display: flex;justify-content: space-between;">
                    <el-link type="primary" @click="viewIssusDetail(issues_item)">查看详情<el-badge
                            :value="issues_item.newReplyCount" v-if="issues_item.newReplyCount !== 0" /></el-link>
                    <el-link v-if="loadMine" type="info" @click="editIssues(issues_item)">编辑</el-link>
                    <el-link v-if="loadMine" type="danger" @click="deleteIssues(issues_item.id)">删除</el-link>
                </div>
            </el-descriptions-item>
        </el-descriptions>
        <el-empty description="快来发表你的第一个问题吧~" v-if="pageList.length === 0"></el-empty>


        <el-pagination style="margin-top: 10px;" small @current-change="pageChange"
            :current-page.sync="queryParams.page" :page-size="queryParams.pageSize" layout="prev, pager, next"
            :total="total">
        </el-pagination>

        <!-- 新增专案问题表单显示 -->
        <el-dialog :title="newIssue.id === null ? '新增问题' : '编辑问题'" :visible.sync="newIssueVisible" width="70%"
            @close="initNewIssue()">
            <el-form ref="issuesForm" :model="newIssue" label-width="80px" :rules="issuesRules">
                <el-form-item label="问题名称" prop="title">
                    <el-input v-model="newIssue.title"></el-input>
                </el-form-item>
                <el-form-item label="问题详情">
                    <v-md-editor v-model="newIssue.description" :disabled-menus="[]" @upload-image="handleUploadImage"
                        height="400px"></v-md-editor>
                </el-form-item>

                <el-form-item label="问题类型" prop="type">
                    <el-select v-model="newIssue.type" placeholder="请选择问题类型">
                        <el-option v-for="item in typeOpptions" :key="item.value" :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>

                <el-form-item label="关联专案">
                    <el-select v-model="newIssue.caseId" filterable placeholder="请选择关联专案">
                        <el-option v-for="case_item in caseList" :key="case_item.id" :label="case_item.name"
                            :value="case_item.id">
                        </el-option>
                    </el-select>
                </el-form-item>

                <el-form-item label="状态" v-if="newIssue.id !== null">
                    <el-select v-model="newIssue.status" filterable placeholder="请选择问题状态">
                        <el-option v-for="status in statusOpptions" :key="status.value" :label="status.label"
                            :value="status.value">
                        </el-option>
                    </el-select>
                </el-form-item>

            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button v-if="newIssue.id === null" type="primary" @click="submitNewIssue()">确 定</el-button>
                <el-button v-else type="primary" @click="submitEdit()">修 改</el-button>
                <el-button @click="newIssueVisible = false">取 消</el-button>
            </span>
        </el-dialog>
    </el-card>
</template>

<script>
import { getList, addIssue, editIssue, deleteIssue } from '@/api/issues'
import { deleteImg, uploadImg } from '@/api/common';
import { unFinishedCaseList } from '@/api/case'
import { getLastLoginDate } from '@/api/log'
import { formatTimestamp } from '@/utils/common'
import { mapActions, mapState } from 'vuex';

export default {
    name: 'caseDiscussion',
    data() {
        return {
            showSearch: true,
            // 新增专案问题表单显示
            newIssueVisible: false,
            text: '',
            // 正在执行的专案
            issuesList: null,
            pageList: [],
            sortByTime: false,
            sortByReply: false,
            loadMine: false,
            queryParams: {
                searchText: '',
                status: 0,
                type: '',
                relativeCaseId: '',
                onlyRelativeMe: false,
                createId: null,
                page: 1,
                pageSize: 5,
            },
            // 加载中
            loading: false,
            // 用于保存搜索
            searchList: null,
            // 总数
            total: null,
            defaultDescription: '## 背景\n描述一下问题出现的背景\n## 上下文\n描述一下在什么环境，什么条件下出现的问题\n## 详细描述\n描述一下问题的详细情况\n> 备注信息:',
            // 新增问题对象
            newIssue: {
                id: null,
                title: '',
                description: '',
                type: null,
                caseId: null,
                status: null,
            },
            issuesRules: {
                title: [
                    { required: true, message: '请输入标题', trigger: 'blur' },
                    { min: 10, message: '请输入10字以上的内容', trigger: 'blur' }
                ],
                type: [
                    { required: true, message: '请选择问题类型', trigger: 'blur' }
                ]
            },
            typeOpptions: [
                { label: '机构', value: 0 },
                { label: '电控', value: 1 },
                { label: '综合', value: 2 }
            ],
            statusOpptions: [
                { label: '处理中', value: 0 },
                { label: '已解决', value: 1 }
            ],
            //专案列表
            caseList: [],
            // 地址前缀
            urlPrefix: process.env.VUE_APP_IMG_DOWNLOAD_URL,
            // 获得当前用户最近一次登录时间
            lastLoginDate: null,
            relativeIssueId: new Map(),
        }
    },
    beforeRouteEnter(to, from, next) {
        next(async vm => {
            if (from.name === '问题详情' && vm.relativeIssueId.has(from.query.issueId)) {
                vm.loading = true;
                await new Promise(res => setTimeout(res, 350))
                window.location.reload();
                await new Promise(res => setTimeout(res, 350))
                vm.loading = false;
            }
        })
    },
    computed: {
        ...mapState(['user']),
        ...mapState('issuesReply', ['relativeObject']),
    },
    // 加载完成的时候，添加上描述模板。如果写在data中，会导致显示不出来
    mounted() {
        this.newIssue.description = this.defaultDescription
    },
    async created() {
        // 保证vueX中有数据
        await this.getReplyCount()
        // 先处理map对象
        this.relativeObject.forEach(item => {
            var issueId = item.content
            if (this.relativeIssueId.has(issueId))
                this.relativeIssueId.set(issueId, this.relativeIssueId.get(issueId) + 1)
            else
                this.relativeIssueId.set(issueId, 1)
        });
        this.getCaseList();
        this.lastLoginDate = await this.getLastLoginDate()
        this.getIssuesList();
    },
    methods: {
        ...mapActions('issuesReply', ['getReplyCount']),
        async getIssuesList() {
            var res = await getList();
            this.issuesList = res.data;
            // 按照创建时间排序
            this.issuesList.sort((a, b) => {
                return a.createAt - b.createAt;
            })
            this.issuesList.forEach(element => {
                element.createTime = formatTimestamp(parseInt(element.createAt))
                this.$set(element, 'newReplyCount', this.relativeIssueId.has(element.id) ? this.relativeIssueId.get(element.id) : 0)
                this.$set(element, 'className', element.createTime > this.lastLoginDate ? 'newItem' : 'oldItem')
            });
            this.searchList = this.issuesList
            this.handleQuery()
        },
        pageChange() {
            this.pageList = this.searchList.slice((this.queryParams.page - 1) * this.queryParams.pageSize, this.queryParams.page * this.queryParams.pageSize)
        },
        // 搜索
        handleQuery() {
            this.queryParams.page = 1;
            this.searchList = this.issuesList.filter(item => {
                const matchSearch = this.queryParams.searchText === '' || item.title.includes(this.queryParams.searchText) || item.description.includes(this.queryParams.searchText)
                const matchStaus = this.queryParams.status === '' || item.status === this.queryParams.status
                const matchType = this.queryParams.type === '' || item.type === this.queryParams.type
                const matchCase = this.queryParams.relativeCaseId === '' || item.caseId === this.queryParams.relativeCaseId
                const matchCreateId = this.queryParams.createId === null || item.createId === this.queryParams.createId
                const matchRelativeMe = this.queryParams.onlyRelativeMe === false || item.newReplyCount > 0
                return matchSearch && matchStaus && matchType && matchCase && matchCreateId && matchRelativeMe
            })
            this.searchList.sort((a, b) => {
                if (this.sortByTime)
                    return a.createAt - b.createAt;
                else if (this.sortByReply)
                    return b.replyCount - a.replyCount;
                else
                    return b.createAt - a.createAt;
            })
            this.total = this.searchList.length;
            this.pageList = this.searchList.slice((this.queryParams.page - 1) * this.queryParams.pageSize, this.queryParams.page * this.queryParams.pageSize)
        },
        // 重置搜索条件
        async resetQuery() {
            this.loading = true;
            await new Promise(res => setTimeout(res, 750));
            this.queryParams.searchText = '';
            this.queryParams.status = '';
            this.queryParams.type = '';
            this.queryParams.relativeCaseId = '';
            this.handleQuery();
            this.loading = false;
        },
        // 新增专案问题
        async submitNewIssue() {
            this.$refs.issuesForm.validate(async valid => {
                if (!valid) {
                    this.$message.error('表单校验错误，请检查输入！');
                    return;
                }
                if (this.newIssue.description.length < 30) {
                    this.$message.error('描述字符小于30个字符，请尽可能详细的描述问题的背景');
                    return;
                }
                var res = await addIssue(this.newIssue)
                if (res.code === 200) {
                    this.$message.success(res.data);
                    this.newIssueVisible = false;
                    this.newIssue.title = null;
                    this.newIssue.description = this.defaultDescription;
                    this.getIssuesList();
                }
            })
        },
        // 查看专案问题
        viewIssusDetail(issues) {
            this.$set(issues, 'className', 'oldItem')
            this.$router.push({
                path: '/common/issueDetail',
                query: {
                    issueId: issues.id
                }
            })
        },
        // 获得专案列表
        async getCaseList() {
            var res = await unFinishedCaseList();
            if (res.code === 200) {
                this.caseList = res.data;
            } else {
                this.$message.error("获取专案列表失败！")
            }
        },
        handleCommand(command) {
            if (command === 'timeUp')
                this.sortByTime = true;
            else if (command === 'timeDown') {
                this.sortByTime = false;
                this.sortByReply = false;
            } else if (command === 'reply') {
                this.sortByTime = false;
                this.sortByReply = true;
            }
            this.handleQuery();
        },
        // 处理上传成功后的图片
        async handleUploadImage(event, insertImage, files) {
            console.log(files[0])
            var res = await uploadImg(files[0]);
            if (res.code === 200) {
                console.log(this.urlPrefix + res.data)
                // 插入到文本内
                insertImage({
                    url:
                        this.urlPrefix + res.data,
                    desc: '',
                });
            }
        },
        // 仅查看我创建的问题
        viewMine(flag) {
            this.loadMine = flag;
            if (flag)
                this.queryParams.createId = this.user.id
            else
                this.queryParams.createId = null
            this.handleQuery()
        },
        editIssues(issue) {
            this.newIssue.id = issue.id
            this.newIssue.title = issue.title
            this.newIssue.description = issue.description
            this.newIssue.type = issue.type
            this.newIssue.caseId = issue.caseId
            this.newIssue.status = issue.status
            this.newIssueVisible = true
        },
        async submitEdit() {
            var res = await editIssue(this.newIssue)
            if (res.code === 200) {
                this.$message.success(res.data)
                // 初始化newIssue对象
                this.initNewIssue()
                this.newIssueVisible = false
                this.getIssuesList()
            }
        },
        initNewIssue() {
            // 初始化newIssue对象
            this.newIssue = {
                id: null,
                title: '',
                description: this.defaultDescription,
                type: null,
                caseId: null,
                status: null,
            }
        },
        deleteIssues(id) {
            this.$confirm('该操作将删除该问题以及所有评论，确定删除该问题吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                var res = await deleteIssue(id)
                if (res.code === 200)
                    this.$message.success(res.data)
                this.getIssuesList()
            })

        },
        async getLastLoginDate() {
            var res = await getLastLoginDate()
            return res.data
        },
        // 仅查看与我相关
        viewRelatedMe(flag) {
            this.queryParams.onlyRelativeMe = flag
            this.handleQuery()
        },
    }
}
</script>

<style>
.el-form-item {
    margin-right: 30px !important;
}

.newItem {
    /* animation: blink 0.6s linear 2; */
}

@keyframes blink {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.1);
    }

    100% {
        transform: scale(1);
    }
}
</style>