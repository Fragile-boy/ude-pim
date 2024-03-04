import { getSubByUserId } from '@/api/caseSub'
import { Message } from 'element-ui';

// 公共方法，提高代码复用率


//格式化为后端时间
export function format4back(date){
    var res = formatDate(date)
    if(res===null)
        return res
    res+=" 00:00:00"
    return res
}

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
export function getStatus(startTime, planTime, finishTime, pausing) {
    // 暂停中
    if(pausing)
        return 5
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
export function timeAdd() {
    var result = new Date(arguments[0])
    for (var i = 1; i < arguments.length; i++) {
        if(arguments[i]!==null){
            if(i===1){
                result.setDate(result.getDate() + arguments[i] - 1)
            }else{
                result.setDate(result.getDate() + arguments[i])
            }
        }
            
    }
    return formatDate(result)
}

//时间相减，默认第二个大
export function timeSub(time1, time2) {
    time1 = new Date(time1)
    time2 = new Date(time2)
    time1.setHours(0,0,0,0)
    time2.setHours(0,0,0,0)
    return Math.floor((time2 - time1) / (1000 * 24 * 3600))+1
}


//获取用户负责的专案子列表
export async function getSubById(id) {
    var res = await getSubByUserId(id)
    res = res.data
    for (var i = 0; i < res.length; i++) {
        //开始时间
        res[i].startTime = formatDate(res[i].startTime)
        const presetTime = new Date(res[i].startTime)
        // 预计时间
        res[i].presetTime = formatDate(presetTime.setDate(presetTime.getDate() + res[i].planDays + res[i].unforcedDays))
        // 状态
        res[i].status = getStatus(res[i].startTime, res[i].presetTime, res[i].finishTime)
        // 截止日期（还剩多少天/已延误多少天）
        res[i].deadLine = Math.floor(res[i].status == 0 ? (new Date(res[i].presetTime) - new Date().setHours(0, 0, 0, 0)) / (1000 * 3600 * 24) :
            (new Date(new Date().setHours(0, 0, 0, 0) - new Date(res[i].presetTime))) / (1000 * 3600 * 24))
    }
    return res
}

//检查后端结果
export async function checkResult(res) {
    if (res.code === 200) {
        Message.success(res.data)
    } else {
        Message({
            type:'error',
            message:res.msg,
            duration:5000
        })
    }
}