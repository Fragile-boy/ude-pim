import service from "@/plugins/service";

export const getMonthKpi = (obj)=>{
    return service.get(`/kpi/MonthKpi`, {params: obj})
}

export const getTeamMonthKpi = (obj)=>{
    return service.get(`/kpi/MonthAll`, {params: obj})
}

export const getMonthRangeKpi = (obj)=>{
    return service.get(`/kpi/MonthRangeKpi`, {params: obj})
}

export const getUserMonthRangeKpi = (obj)=>{
    return service.get(`/kpi/UserMonthRangeKpi`, {params: obj})
}