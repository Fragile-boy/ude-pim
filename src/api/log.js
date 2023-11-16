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