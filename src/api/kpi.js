import service from "@/plugins/service";

export const getMonthKpi = (obj)=>{
    return service.get(`/kpi/MonthKpi`, {params: obj})
}

export const getTeamMonthKpi = (obj)=>{
    return service.get(`/kpi/MonthAll`, {params: obj})
}