import service from "@/plugins/service";

export const getDemandList = ()=>{
    return service.get('/demand/list')
}

export const addDemand = (obj)=>{
    return service.post('/demand',obj)
}

export const finishDemand = (obj)=>{
    return service.put('/demand',obj)
}