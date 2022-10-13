const mysql2 = require('mysql2');

// 数据链接不推荐使用use中间件
let mysql_config = {
    host: '172.17.0.1',//node.lemonyun.net
    port: 9006,
    user: 'root',
    password: 'message0904mysql',
    database: 'message'
}
var pool = mysql2.createPool(mysql_config)

module.exports = {
    query(...args) {
        pool.getConnection((err,conn)=>{
            let que = conn.query(...args)
            que.on('end',()=>{
                console.log('已释放')
                conn.release()
            })
        })
    },
};