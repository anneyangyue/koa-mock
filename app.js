const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const router = require('koa-router')()
const Mock = require('mockjs')

const index = require('./routes/index')
const users = require('./routes/users')

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'ejs'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())

// mockjs的常用mock字段
// let basicData = Mock.mock({
//   'list|1-100': [{
//       'id|+1': 1,
//       'isBoolean': '@boolean(10, 0, true)',//百分之百的true
//       'naturalNumber': '@natural(1, 1000)', //大于等于零的整数
//       'integer': '@integer(0)', //随机整数
//       'float': '@float(1, 100, 3, 6)', //随机浮点数, 
//       'character': '@character("upper")', //一个随机字符
//       'string': '@string("lower", 5, 20)', //一串随机字符串
//       'range': '@range(1, 10, 2)', //一个整形数组，步长为2
//   }]
// })

let testData = router.get('/test', async (ctx, next) => {
  let data = Mock.mock({
    'array|1-10': [
      {
        'id|+1': 1,
        'name': '@string("lower", 5, 20)'
      }
    ]
  })
  ctx.body = data
})
app.use(testData.routes(), testData.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

app.listen('3001')
console.log('listening at 3001...')

module.exports = app
