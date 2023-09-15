import service from "@/plugins/service";

export const taskList = (id)=>{
    return service.get(`/task/taskList/${id}`)
}


//获取最近一个月用户的工作近况，为饼状图服务
export const recentTaskList=(id)=>{
    return service.get('/task/taskList/recentMonth',{params:{userId:id}})
}

//获取最近半年用户的工作近况，为柱状图服务
export const recentHalfYear=(id)=>{
    return service.get('/task/taskList/recentHalfYear',{params:{userId:id}})
}
