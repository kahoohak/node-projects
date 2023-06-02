const Server = require('./lib/server')

const app = new Server()

//添加拦截切面
app.use(async ({res}, next) => {
  res.setHeader('Content-Type', 'text/html')
  res.body = '<h1>Hello world</h1>'
  await next()
})

app.use(async ({res}, next) => {
  //验证用户信息，成功继续执行
  await next()
  //失败，暂停执行
})

app.listen({
  port: 9090,
  host: '0.0.0.0'
}, (server) => {
  console.log(server.address())
})