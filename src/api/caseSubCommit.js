import service from "@/plugins/service";

//根据子流程id获取备注信息
export const getById = (id)=>{
    return service.get(`/caseSubComment/${id}`)
}


//保存备注信息
export const saveCommit=(params)=>{
    return service.post('/caseSubComment',{...params})
}

//获取所有未审核的备注
export const getPendingReview = ()=>{
    return service.get('/caseSubComment/pendingList')
}

//通过该id对应备注的审核
export const passCheck = (params)=>{
    return service.put(`/caseSubComment`,{...params})
}