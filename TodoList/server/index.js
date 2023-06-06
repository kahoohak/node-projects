const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const { Server, Router } = require("../lib/interceptor");

const dbFile = path.resolve(__dirname, "../database/todolist.db");
let db = null;

const app = new Server();
const router = new Router();

app.use(async ({ req }, next) => {
  console.log(`${req.method} ${req.url}`);
  await next();
});

app.use(async (ctx, next) => {
  if (!db) {
    db = await open({
      filename: dbFile,
      driver: sqlite3.cached.Database,
    });
  }
  ctx.database = db;
  await next();
});

/**
 * 如果请求路径是/list, 则从todo表中获取所有任务数据
 */
app.use(
  router.get("/list", async ({ database, route, res }, next) => {
    res.setHeader("Content-Type", "application/json");
    const { getList } = require("../model/todolist");
    const result = await getList(database);
    res.body = { data: result };
    await next();
  })
);

/**
 * 如果请求路径不是/list, 则返回not found
 */
app.use(
  router.all(".*", async ({ params, req, res }, next) => {
    res.setHeader("Content-Type", "text/html");
    res.body = "<h1>Not Found</h1>";
    res.statusCode = 404;
    await next();
  })
);

app.listen(
  {
    port: 9090,
    host: "0.0.0.0",
  },
  (server) => {
    console.log(server.address());
  }
);
