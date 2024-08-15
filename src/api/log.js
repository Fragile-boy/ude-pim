import service from "@/plugins/service";

export const logList = ()=>{
    return service.get("/log/list")
}

export const checkLog = (obj)=>{
    return service.put("/log/checkLog", obj)
}

export const getHistoryLogByUserId = (obj)=>{
    return service.get("/log/getHistoryLogByUserId", {params:obj})
}

export const getLastLoginDate = ()=>{
    return service.get("/log/getLastLoginDate")
}

export const getReplyCount = ()=>{
    return service.get("/log/replyCount")
}

export const deleteReplyLog = (id)=>{
    return service.delete(`/log/deleteReplyLog/${id}`)
}

export const batchCheckLog = ()=>{
    return service.put("/log/batchCheckLog")
}