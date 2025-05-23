import service from "@/plugins/service";

export const noticeList = ()=>{
    return service.get("/notice/list")
}

export const checkNotice = (obj)=>{
    return service.put("/notice/checkNotice", obj)
}

export const getHistoryNoticeByUserId = (obj)=>{
    return service.get("/notice/getHistoryNoticeByUserId", {params:obj})
}
export const getReplyCount = ()=>{
    return service.get("/notice/replyCount")
}

export const deleteReplyNotice = (id)=>{
    return service.delete(`/notice/deleteReplyNotice/${id}`)
}

export const batchCheckNotice = ()=>{
    return service.put("/notice/batchCheckNotice")
}