const koa = require('koa')
const koaRouter = require('koa-router')
const fs = require('fs')
const bodyParser = require('koa-bodyparser');
const staticCache = require('koa-static-cache')
const https = require('https')
const sslify = require('koa-sslify').default
const app = new koa()
const router = new koaRouter()
const { creatToken, checkToken } = require('./jwt/jwt');
const apiModel = require('./models/apiTool');
//const proxy = require('koa-server-http-proxy')
//const cors = require('./cors/koa-cors');


app.use(sslify())
app.use(bodyParser());
app.use(staticCache(__dirname + '/httpdoc'), {
    prefix: '',
    maxAge: 1000 * 60 * 60 * 24 * 30,
    gzip: true,
    dynamic: true
});
//app.use(cors)
router.get('/', ctx => {
    console.log('访问/、、')
    ctx.redirect('/index.html')
})
router.post('/api/login', async ctx => {
    console.log('有人尝试登录', new Date().toLocaleString())
    //let rsdata = ctx.request.body
    let rsdata = ctx.request.body
    console.log(rsdata)
    if (!rsdata["username"]) {
        rsdata = JSON.parse(Object.keys(ctx.request.body)[0].replace(/\$/g, "."))
    }
    let username = rsdata["username"]
    let pwd = rsdata["pwd"]
    console.log(rsdata, username, pwd)
    let token = '';
    try {
        let loginrs = await apiModel.login(username, pwd)
        //console.log(dbrs)
        token = creatToken(loginrs);
        //console.log('token is ok',token)
        ctx.cookies.set('token', token, {
            //domain:'127.0.0.1',//写入cookie所在的域名
            // path:'/index',       // 写cookie所在的路径
            maxAge: 1000 * 60 * 60 * 24,   // cookie有效时长
            //expires:new Date('2018-12-31'), // cookie失效时间
            // httpOnly:false,  // 是否只用于http请求中获取
            //overwrite:false  // 是否允许重写
        })
        ctx.body = { ...loginrs, "token": token }
    } catch (error) {
        console.log(error)
        ctx.body = error
    }
})
router.post('/api/get_task', async ctx => {
    console.log('有人尝试提取任务', new Date().toLocaleString(), ctx.request.body, "===")
    let rsdata = ctx.request.body
    if (!rsdata["token"]) {
        rsdata = JSON.parse(Object.keys(ctx.request.body)[0].replace(/\$/g, "."))
    }
    let token = rsdata["token"]
    console.log('token====', token.replace(/\$/g, "."));
    try {
        let tokenRs = await checkToken(token.replace(/\$/g, "."))
        //console.log(tokenRs)
        let userId = tokenRs["userId"]
        let tasks = await apiModel.get_task(userId)
        console.log("提取success")
        ctx.body = tasks
    } catch (error) {
        console.log(error)
        ctx.body = { "msg": "登录信息失效，请重新登录" }
    }
})
router.post('/api/get_history_task', async ctx => {
    console.log('有人尝试提取历史任务', new Date().toLocaleString())
    let rsdata = ctx.request.body
    if (!rsdata["token"]) {
        rsdata = JSON.parse(Object.keys(ctx.request.body)[0].replace(/\$/g, "."))
    }
    let token = rsdata["token"]
    try {
        let tokenRs = await checkToken(token.replace(/\$/g, "."))
        //console.log(tokenRs)
        let userId = tokenRs["userId"]
        let tasks = await apiModel.get_history_task(userId)
        console.log("提取success")
        ctx.body = tasks
    } catch (error) {
        console.log(error)
        ctx.body = { "msg": "登录信息失效，请重新登录" }
    }
})
router.post('/api/get_lover_history_task', async ctx => {
    console.log('有人尝试提取历史任务', new Date().toLocaleString())
    let rsdata = ctx.request.body
    if (!rsdata["token"]) {
        rsdata = JSON.parse(Object.keys(ctx.request.body)[0].replace(/\$/g, "."))
    }
    let token = rsdata["token"]
    try {
        let tokenRs = await checkToken(token.replace(/\$/g, "."))
        //console.log(tokenRs)
        let userId = tokenRs["loverId"]
        let tasks = await apiModel.get_history_task(userId)
        console.log("提取success")
        ctx.body = tasks
    } catch (error) {
        console.log(error)
        ctx.body = { "msg": "登录信息失效，请重新登录" }
    }
})
router.post('/api/get_lover_task', async ctx => {
    console.log('有人尝试提取lover任务', new Date().toLocaleString())
    let rsdata = ctx.request.body
    if (!rsdata["token"]) {
        rsdata = JSON.parse(Object.keys(ctx.request.body)[0].replace(/\$/g, "."))
    }
    let token = rsdata["token"]
    try {
        let tokenRs = await checkToken(token.replace(/\$/g, "."))
        //console.log(tokenRs)
        let userId = tokenRs["loverId"]
        let tasks = await apiModel.get_task(userId)
        console.log("提取success")
        ctx.body = tasks
    } catch (error) {
        console.log(error)
        ctx.body = { "msg": "登录信息失效，请重新登录" }
    }
})
router.post('/api/change_task', async ctx => {
    console.log('有人尝试更新任务', new Date().toLocaleString())
    let rsdata = ctx.request.body
    if (!rsdata["token"]) {
        rsdata = JSON.parse(Object.keys(ctx.request.body)[0].replace(/\$/g, "."))
    }
    let token = rsdata["token"]
    let task_id = rsdata["id"]
    let task_status = Number(rsdata["status"])
    try {
        let tokenRs = await checkToken(token.replace(/\$/g, "."))
        //console.log(tokenRs)
        let userId = tokenRs["userId"]
        let data = await apiModel.change_task(task_id, task_status, userId)
        console.log("update success")
        ctx.body = data
    } catch (error) {
        console.log(error)
        ctx.body = { "msg": "登录信息失效，请重新登录" }
    }

})
router.post('/api/add_task', async ctx => {
    console.log('有人尝试添加任务', new Date().toLocaleString())
    //new Date().getTime()
    //taskId, userId, startTime, deadLine, taskTitle, taskContent

    let rsdata = ctx.request.body
    if (!rsdata["token"]) {
        rsdata = JSON.parse(Object.keys(ctx.request.body)[0].replace(/\$/g, "."))
    }
    let token = rsdata["token"]
    let task_data = []
    try {
        let tokenRs = await checkToken(token.replace(/\$/g, "."))
        let userId = tokenRs["userId"]
        task_data.push(userId + "-" + new Date().getTime().toString().substr(9, 4));
        task_data.push(userId)
        task_data.push(rsdata["startTime"])
        task_data.push(rsdata["deadLine"])
        task_data.push(rsdata["taskTitle"])
        task_data.push(rsdata["taskContent"])
        let data = await apiModel.add_task(task_data)
        console.log("insert success")
        ctx.body = data
    } catch (error) {
        console.log(error)
        ctx.body = { "msg": "登录信息失效，请重新登录" }
    }

})
router.post('/api/update_task', async ctx => {
    console.log('有人尝试修改任务', new Date().toLocaleString())
    //new Date().getTime()
    //taskId, userId, startTime, deadLine, taskTitle, taskContent

    let rsdata = ctx.request.body
    if (!rsdata["token"]) {
        rsdata = JSON.parse(Object.keys(ctx.request.body)[0].replace(/\$/g, "."))
    }
    let token = rsdata["token"]
    console.log(rsdata)
    let task_data = []
    try {
        let tokenRs = await checkToken(token.replace(/\$/g, "."))
        let userId = tokenRs["userId"]
        task_data.push(rsdata["startTime"])
        task_data.push(rsdata["deadLine"])
        task_data.push(rsdata["taskTitle"])
        task_data.push(rsdata["taskContent"])
        task_data.push(rsdata["taskId"])
        task_data.push(userId)
        let data = await apiModel.update_task(task_data)
        console.log("change success")
        ctx.body = data
    } catch (error) {
        console.log(error)
        ctx.body = { "msg": "登录信息失效，请重新登录" }
    }

})
router.all(/\S+/, ctx => {
    ctx.status = 404
    ctx.body = `<h1 style="font-size:100px;color:red;text-align:center">找不到页面</h1>`
})
var option = {
    key: fs.readFileSync(__dirname + '/ssl/server.key'),
    cert: fs.readFileSync(__dirname + '/ssl/server.crt')
}

app.use(async (ctx, next) => {
    // 设置是否运行客户端设置 withCredentials
    // 即在不同域名下发出的请求也可以携带 cookie
    ctx.set("Access-Control-Allow-Credentials", true)
    // 第二个参数表示允许跨域的域名，* 代表所有域名  
    ctx.set('Access-Control-Allow-Origin', '*')
    ctx.set('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS') // 允许的 http 请求的方法
    // 允许前台获得的除 Cache-Control、Content-Language、Content-Type、Expires、Last-Modified、Pragma 这几张基本响应头之外的响应头
    ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With')
    if (ctx.method == 'OPTIONS') {
        ctx.body = '';
        ctx.status = 200;
    } else {
        await next()
    }
});
app.use(router.routes())
const server = https.createServer(option, app.callback())
server.listen(443)
let port = 80
//console.log('koa初始化完成')
app.listen(port, () => {
    console.log('端口开启', 'http://127.0.0.1:' + port);
})
