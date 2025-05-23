<template>
    <el-card>
        <!-- 面包屑导航区域 -->
        <div>
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>专案管理</el-breadcrumb-item>
                <el-breadcrumb-item>问题详情</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <el-row>
            <el-col :span="6">
                <el-page-header @back="$router.back()" content="详情页面">
                </el-page-header>
            </el-col>
        </el-row>

        <div class="markdown-container">

            <div class="toc-container">
                <!-- 侧边导航栏（目录） -->
                <div v-for="anchor in titles" :key="anchor.dataset"
                    :style="{ padding: `0 0 10px ${anchor.indent * 20}px`, fontSize: `${24 - anchor.indent * 4}px` }"
                    @click="handleAnchorClick(anchor)">
                    <a style="cursor: pointer">{{ anchor.title }}</a>
                </div>
            </div>
            <div class="issueContent">
                <h3 style="font-weight: bold;">{{ issue.title }}</h3>
                <el-tag v-if="issue.type === 0">机构</el-tag>
                <el-tag v-else-if="issue.type === 1" type="success">电控</el-tag>
                <el-tag v-else-if="issue.type === 2" type="warning">综合</el-tag>
                <el-link style="margin-left: 10px;">{{ issue.createName }}</el-link>
                <span style="margin-left:10px;font-size:13px;">{{ issue.createTime + " 创建了该问题. " + issue.comments.length
                +
                "回复"
                    }}</span>
                <hr>
                <v-md-preview ref="preview" :text="issue.description" @image-click="handleClickImg"></v-md-preview>
                <br>
                <br>
                <!-- 展示评论的区域 -->
                <div v-if="issue.comments.length > 0">
                    <div class="reply-area" v-for="comment in issue.comments" :key="comment.id">
                        <hr>
                        <el-link style="margin-left: 10px;font-size:15px;" disabled><i class="el-icon-user"></i>{{
                comment.createName
            }}</el-link>
                        <span style="margin-left:10px;font-size:13px;">{{ (comment.toName === null ? "回复了该问题. " :
                "回复了" + comment.toName + ".") + comment.createTime }}</span>
                        <div style="float: right;">
                            <el-link v-if="comment.createId === user.id" type="danger"
                                @click="deleteReply(comment.id)">删除</el-link>
                            <el-link style="margin-left:10px;" @click="changeReply(comment.id, false)">回复</el-link>
                        </div>
                        <v-md-preview :text="comment.data" @image-click="handleClickImg"></v-md-preview>
                    </div>
                </div>
                <el-empty description="暂无评论，快来发表你的意见吧" v-else></el-empty>

                <div class="addComment" ref="replyBox">
                    <h4 v-if="replyToIssue">添加评论</h4>
                    <h4 v-else>回复评论<el-link style="margin-left: 10px;" type="primary"
                            @click="changeReply(null, true)">回到评论问题</el-link></h4>
                    <v-md-editor style="height:300px;" :disabled-menus="[]" v-model="newComment.data"
                        @upload-image="handleUploadImage" @image-click="handleClickImg"></v-md-editor>
                    <div style="margin-top: 10px;">
                        <AllUser style="float:left;" v-model="newComment.commentNotifiedUserIds"></AllUser>
                        <el-button style="margin-top:5px;float: right;" type="success"
                            @click="submitComment()">回复</el-button>
                    </div>

                </div>

            </div>
        </div>
        <!-- 显示大图 -->
        <el-dialog :visible.sync="showOrigin" width="70%" center>
            <el-image :src="originImgUrl"></el-image>
        </el-dialog>
    </el-card>
</template>

<script>
import { deleteReplyNotice } from '@/api/notice';
import { getIssueById } from '@/api/issues';
import { addComment, deleteById } from '@/api/issuesComment'
import { formatTimestamp } from '@/utils/common';
import { uploadImg } from '@/api/common';
import { mapState } from 'vuex';
import { getUserListWithAssistants } from '@/api/user';

export default {
    data() {
        return {
            issueId: null,
            showOrigin: false,
            originImgUrl: null,
            issue: {
                comments: [],
            },
            //true表示回给了问题，false表示回给了评论
            replyToIssue: true,
            newComment: {
                issueId: null,
                commentId: null,
                data: '',
                commentNotifiedUserIds: [],
            },
            fileList: [],
            urlPrefix: process.env.VUE_APP_IMG_DOWNLOAD_URL,
            titles: [],
            fontSize: 46,
            fontSizeOption: [
                { value: 14, label: '14px' },
                { value: 18, label: '18px' },
                { value: 22, label: '22px' },
            ]
        }
    },
    created() {
        this.issueId = this.$route.query.issueId;
        deleteReplyNotice(this.issueId);
        this.newComment.issueId = this.issueId;

    },
    async mounted() {
        await this.getIssueById();
        this.generateTitle();
    },
    computed: {
        ...mapState(['user'])
    },
    methods: {
        async getUserList() {
            var { data: res } = await getUserListWithAssistants();
            for (var i = 0; i < res.length; i++) {
                this.assistants[0].children[res[i].status].children.push({ value: res[i].id, label: res[i].name })
            }
        },
        generateTitle() {
            const anchors = this.$refs.preview.$el.querySelectorAll('h1,h2,h3,h4,h5,h6');
            const titles = Array.from(anchors).filter((title) => !!title.innerText.trim());

            if (!titles.length) {
                this.titles = [];
                return;
            }

            const hTags = Array.from(new Set(titles.map((title) => title.tagName))).sort();

            this.titles = titles.map((el) => ({
                title: el.innerText,
                lineIndex: el.getAttribute('data-v-md-line'),
                indent: hTags.indexOf(el.tagName),
            }));
        },
        handleAnchorClick(anchor) {
            const { preview } = this.$refs;
            const { lineIndex } = anchor;

            const heading = preview.$el.querySelector(`[data-v-md-line="${lineIndex}"]`);

            if (heading) {
                // 注意：如果你使用的是编辑组件的预览模式,则这里的方法名改为 previewScrollToTarget
                preview.scrollToTarget({
                    target: heading,
                    scrollContainer: window,
                    top: 60,
                });
            }
        },
        async getIssueById() {
            var res = await getIssueById(this.issueId);
            if (res.code === 200) {
                this.issue = res.data
                this.issue.createTime = formatTimestamp(parseInt(this.issue.createAt))
                // 递归遍历所有子评论
                this.issue.comments.forEach(item => {
                    item.createTime = formatTimestamp(parseInt(item.createAt))
                });
            }
        },

        handleClickImg(images, currentIndex) {
            this.originImgUrl = images[currentIndex];
            this.showOrigin = true;
        },
        // 处理上传成功后的图片
        async handleUploadImage(event, insertImage, files) {
            var res = await uploadImg(files[0]);
            if (res.code === 200) {
                // 插入到文本内
                insertImage({
                    url:
                        this.urlPrefix + res.data,
                    desc: '',
                });
            }
        },
        changeReply(commendId, flag) {
            this.replyToIssue = flag;
            this.newComment.commentId = commendId
            this.$refs.replyBox.scrollIntoView();
        },
        async submitComment() {
            if (this.newComment.commentNotifiedUserIds !== null) {
                this.newComment.commentNotifiedUserIds = this.newComment.commentNotifiedUserIds.map(item => {
                    if (item.length == 3)
                        return item[2]
                    else return item[1]
                })
            }
            var res = await addComment(this.newComment);
            if (res.code == 200) {
                this.$message.success(res.data);
                this.getIssueById();
                this.newComment.data = '';
                this.newComment.commentNotifiedUserIds = [];
            }
        },
        // 删除评论
        deleteReply(id) {
            this.$confirm('此操作将删除该评论及其子评论, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                var res = await deleteById(id)
                if (res.code === 200) {
                    this.$message({
                        type: 'success',
                        message: res.data
                    });
                }
                this.getIssueById();
            })
        },
    },
}
</script>

<style>
.issueContent {
    width: 85%;
    padding-left: 15%;
    padding-right: 15%;
    padding-top: 2%;
}

.markdown-container {
    display: flex;
}

.toc-container {
    position: fixed;
    padding-top: 2%;
    width: 15%;
}

.addComment {
    margin-top: 50px;
    height: 350px;
}

.github-markdown-body {
    padding: 0 !important;
    padding-left: 30px !important;
}
</style>