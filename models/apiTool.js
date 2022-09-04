const db = require('./db');
const moment = require('moment')

module.exports = {
    login(username,pwd) {
        return new Promise((resolve, reject) => {
            if(!db.query) reject({"msg":"服务器错误"});
            db.query("select * from `user` where username = ? and pwd = ?",[username,pwd], function(err, rs) {
                if (err) {
                    reject({"msg":"服务器错误"});
                } else if(rs.length == 1){
                    resolve({"msg":"登录成功",...rs[0]})
                }else{
                    reject({"msg":"用户不存在或密码错误"});
                }
            })
        })
    },
    get_task(userId) {
        return new Promise((resolve, reject) => {
            let DATE = new Date()
            let now_time = DATE.toLocaleString()
            let now_date = `${DATE.getFullYear()}-${DATE.getMonth()+1}-${DATE.getDate()}`
            DATE = new Date(DATE.getTime()+1000*60*60*24)
            let next_date = `${DATE.getFullYear()}-${DATE.getMonth()+1}-${DATE.getDate()}`
            //console.log('now_date',now_date,'next_date',next_date)
            var tasks = {}
            tasks[now_date] = [];
            db.query("select * from `task` where userId = ? and deadLine >= ? and startTime < ? order by deadLine",[userId,now_date,next_date], function(err, rs) {
                if (err) {
                    reject({"msg":"服务器错误"});
                }else{
                    if(rs.length > 0 ) {
                        for (let index = 0; index < rs.length; index++) {
                            //moment(new Date(rs[index]["startTime"])).format("YYYY-MM-DD HH:mm:ss")
                            rs[index]["startTime"] = moment(new Date(rs[index]["startTime"])).format("YYYY-M-D HH:mm:ss")
                            rs[index]["deadLine"] = moment(new Date(rs[index]["deadLine"])).format("YYYY-M-D HH:mm:ss")
                            tasks[now_date] = rs;
                        }
                    }
                    db.query("select * from `task` where userId = ? and deadLine >= ? and startTime >= ? order by startTime",[userId,next_date,next_date],(err,rs2)=>{
                        if (err) {
                            reject({"msg":"服务器错误"});
                        }else{
                            if(rs2.length > 0 ) {
                                for (let index = 0; index < rs2.length; index++) {
                                    rs2[index]["startTime"] = moment(new Date(rs2[index]["startTime"])).format("YYYY-M-D HH:mm:ss")
                                    rs2[index]["deadLine"] = moment(new Date(rs2[index]["deadLine"])).format("YYYY-M-D HH:mm:ss")
                                    let key = moment(new Date(rs2[index]["startTime"])).format("YYYY-M-D")
                                    //console.log(rs2[index]["startTime"],key)
                                    if(!tasks.hasOwnProperty(key)) tasks[key] = [];
                                    tasks[key].push(rs2[index])
                                }
                            }
                            resolve({"msg":"成功","tasks":tasks});
                        }
                    })
                }
            })
        })
    },
    get_history_task(userId) {
        return new Promise((resolve, reject) => {
            let DATE = new Date()
            let now_time = DATE.toLocaleString()
            let now_date = `${DATE.getFullYear()}-${DATE.getMonth()+1}-${DATE.getDate()}`
            DATE = new Date(DATE.getTime()+1000*60*60*24)
            let next_date = `${DATE.getFullYear()}-${DATE.getMonth()+1}-${DATE.getDate()}`
            // console.log(now_time,now_date)
            var tasks = {}
            db.query("select * from `task` where userId = ? and deadLine < ? order by startTime DESC",[userId,now_date],(err,rs2)=>{
                if (err) {
                    reject({"msg":"服务器错误"});
                }else{
                    if(rs2.length > 0 ) {
                        for (let index = 0; index < rs2.length; index++) {
                            rs2[index]["startTime"] = moment(new Date(rs2[index]["startTime"])).format("YYYY-M-D HH:mm:ss")
                                    rs2[index]["deadLine"] = moment(new Date(rs2[index]["deadLine"])).format("YYYY-M-D HH:mm:ss")
                                    let key = moment(new Date(rs2[index]["startTime"])).format("YYYY-M-D")
                            //console.log(rs2[index]["startTime"],key)
                            if(!tasks.hasOwnProperty(key)) tasks[key] = [];
                            tasks[key].push(rs2[index])
                        }
                    }
                    resolve({"msg":"成功","tasks":tasks});
                }
            })
        })
    },
    change_task(taskId,status,userId) {
        return new Promise((resolve, reject) => {
            let option = [status,taskId,userId]
            let sql = "update `task` set taskStatus = ? where taskId = ? and userId = ?"
            // if(status == 1) {
            //     option = [status,new Date().toLocaleString(),taskId,userId]
            //     sql = "update `task` set taskStatus = ?,deadLine = ? where taskId = ? and userId = ?"
            // }
            db.query(sql,option, function(err, rs) {
                if (err) {
                    //console.log(err)
                    reject({"msg":"服务器错误"});
                }else{
                    console.log(rs)
                    if(rs["changedRows"] > 0) {
                        resolve({"msg":"成功"});
                    }else{
                        reject({"msg":"修改失败"});
                    }
                 } 
            })
        })
    },
    add_task(data) {
        return new Promise((resolve, reject) => {
            //console.log(data)
            let sql = "insert into `task` (taskId, userId, startTime, deadLine, taskTitle, taskContent)  values (?,?,?,?,?,?)"
            // if(status == 1) {
            //     option = [status,new Date().toLocaleString(),taskId,userId]
            //     sql = "update `task` set taskStatus = ?,deadLine = ? where taskId = ? and userId = ?"
            // }
            db.query(sql,data, function(err, rs) {
                if (err) {
                    console.log(err)
                    reject({"msg":"服务器错误"});
                }else{
                    //console.log(rs)
                    if(rs["affectedRows"] > 0) {
                        resolve({"msg":"成功"});
                    }else{
                        reject({"msg":"修改失败"});
                    }
                 } 
            })
        })
    },
    update_task(data) {
        return new Promise((resolve, reject) => {
            //console.log(data)
            //let option = [startTime, deadLine, taskTitle, taskContent,taskId,userId]
            let sql = "update `task` set startTime = ?, deadLine = ?, taskTitle = ?, taskContent = ? where taskId = ? and userId = ?"
            // if(status == 1) {
            //     option = [status,new Date().toLocaleString(),taskId,userId]
            //     sql = "update `task` set taskStatus = ?,deadLine = ? where taskId = ? and userId = ?"
            // }
            db.query(sql,data, function(err, rs) {
                if (err) {
                    console.log(err)
                    reject({"msg":"服务器错误"});
                }else{
                    //console.log(rs)
                    if(rs["changedRows"] > 0) {
                        resolve({"msg":"成功"});
                    }else{
                        reject({"msg":"修改失败"});
                    }
                 } 
            })
        })
    }
}