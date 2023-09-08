import service from "@/plugins/service";

export const taskList = (id)=>{
    return service.get(`/task/taskList/${id}`)
}