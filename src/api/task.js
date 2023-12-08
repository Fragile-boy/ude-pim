import service from "@/plugins/service";

export const taskList = (id)=>{
    return service.get(`/task/taskList/${id}`)
}

export const notStartTaskList = (id)=>{
    return service.get(`/task/notStartTaskList/${id}`)
}

//获取最近一个月用户的工作近况，为饼状图服务
export const recentTaskList=(id)=>{
    return service.get('/task/taskList/recentMonth',{params:{userId:id}})
}

//获取最近半年用户的工作近况，为柱状图服务
export const recentHalfYear=(id)=>{
    return service.get('/task/taskList/recentHalfYear',{params:{userId:id}})
}

export const allFinishTask=(id)=>{
    return service.get(`/task/allFinishTask/${id}`)
}


export const allTaskList=(id)=>{
    return service.get('/task/taskList',{params:{userId:id}})
}

export const updateTask=(obj)=>{
    return service.put('/task/updateTask',obj)
}

export const addTask = (obj)=>{
    return service.post('/task/addTask',obj)
}

//获取所有未开始的任务
export const getExceptionList = (id)=>{
    return service.get(`/task/exception/${id}`)
}