const jwt=require('jsonwebtoken')
const scrict='bG92ZSDojaPojaM='

function creatToken(palyload){
    let option ={
        expiresIn:60*60*24*30 
    }
    return jwt.sign(palyload,scrict,option)
}

function checkToken(token){
    return  new Promise((resovle,reject)=>{
        jwt.verify(token,scrict,(err,data)=>{
           if(err){
                reject('token 验证失败')}
           resovle(data)
           })
    })
    
}
module.exports={
    creatToken,checkToken
}