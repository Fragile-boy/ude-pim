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

//修改该id对应备注的审核的状态
export const handleCheck = (params)=>{
    return service.put(`/caseSubComment`,{...params})
}


//根据用户id查询对应的备注，分为已审核，审核中，审核失败三种
export const getCommitByStatus = (params)=>{
    return service.post('/caseSubComment/byUserAndStatus',params)
}