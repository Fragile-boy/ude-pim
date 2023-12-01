import service from '@/plugins/service'

export const startPause = (obj) => {
    return service.post("/pause/startPause", obj)
}

export const finishPause = (pauseId)=>{
    return service.put(`/pause/finishPause/${pauseId}`)
}