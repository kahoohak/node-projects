const fs = require("fs");
const handlebars = require("handlebars");

const Server = require("./lib/server");
const Router = require("./lib/middleware/router");
const param = require("./lib/aspect/param");
const { getCoronavirusKeyIndex, getCoronavirusByDate } = require("./lib/module/mock");

const app = new Server();
const router = new Router();

app.use(({ req }, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(param);

app.use(
  router.get("/coronavirus/index", async ({ route, res }, next) => {
    const index = getCoronavirusKeyIndex();
    //获取模板文件
    const tpl = fs.readFileSync("./view/coronavirus_index.html", { encoding: "utf-8" });
    //编译模板
    const template = handlebars.compile(tpl);
    //将数据和模板整合
    const result = template({ data: index });
    res.setHeader("Content-Type", "text/html");
    res.body = result;
    await next();
  })
);

app.use(
  router.get("/coronavirus/:date", async ({ params, route, res }, next) => {
    const data = getCoronavirusByDate(route.date);
    if (params.type === "json") {
      res.setHeader("Content-Type", "application/json");
      res.body = { data };
    } else {
      //获取模板文件
      const tpl = fs.readFileSync("./view/coronavirus_data.html", { encoding: "utf-8" });
      //编译模板
      const template = handlebars.compile(tpl);
      //将数据和模板整合
      const result = template({ data });
      res.setHeader("Content-Type", "text/html");
      res.body = result;
    }

    await next();
  })
);

app.use(
  router.all(".*", async ({ params, route, res }, next) => {
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
