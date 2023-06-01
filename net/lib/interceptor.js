// 拦截切面签名
//  async (ctx, next) => {
//    do sth...
//  }


class Interceptor {
  constructor() {
    //存储拦截切面
    this.aspects = [] 
  }

  //注册拦截切面
  use(functor) {
    this.aspects.push(functor) 
    return this
  }

  //执行拦截切面
  async run (context) { 
    const aspects = this.aspects

    const proc = aspects.reduceRight((a, b) => {
      return async () => {
        await b(context, a)
      }
    }, () => Promise.resolve())

    try {
      await proc()
    } catch(err) {
      throw new Error(err)
    }
  }
}

module.exports = Interceptor

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function task(id) {
  return async (ctx, next) => {
    console.log(`task ${id} start`)
    ctx.count++
    await wait(1000)
    console.log(`count: ${ctx.count}`)
    //执行下一个切面
    await next()
    console.log(`task ${id} end`)
  }
}

const inter = new Interceptor()

//注册拦截切面
// inter.use(task(0)) 
// inter.use(task(1))
// inter.use(task(2))
// inter.use(task(3))
// inter.use(task(4))

// inter.run({count: 0})