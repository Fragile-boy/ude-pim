

// 公共方法，提高代码复用率

//格式化时间
export function formatDate(date) {
    if (date === null)
        return null
    if (typeof (date) !== 'date')
        date = new Date(date)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate
}

//获得流程状态
export function getStatus(startTime, planTime, finishTime) {
    var status = 0
    //未开始
    if (startTime === null)
        return 4
    //如果还没完成
    if (finishTime === null) {
        //先获取今天的00：00：00的时间戳
        const today = new Date().setHours(0, 0, 0, 0)
        //和正常结束时间比较
        if (today - new Date(planTime) >= 0)
            status = 2
        else
            status = 0
    } else {
        //如果已经完成了
        finishTime = new Date(finishTime)
        planTime = new Date(planTime)
        //比正常完成时间少
        if (finishTime - planTime <= 0)
            status = 1
        else
            status = 3
    }
    return status
}

//时间相加
export function timeAdd(){
    var result = new Date(arguments[0])
    for(var i =1;i<arguments.length;i++){
        result.setDate(result.getDate()+arguments[i]-1)
    }
    return formatDate(result)
}

//时间相见
export function timeSub(time1, time2){
    time1 = new Date(time1)
    time2 = new Date(time2)
    return Math.ceil((time2-time1)/(1000*24*3600))
}

