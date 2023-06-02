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
    res.setHeader("Content-Type", "application/json");
    res.body = { data: index };
    await next();
  })
);

app.use(
  router.get("/coronavirus/:date", async ({ route, res }, next) => {
    const data = getCoronavirusByDate(route.date);
    res.setHeader("Content-Type", "application/json");
    res.body = { data };
    await next();
  })
);

app.use(router.all(".*", async ({ params, route, res }, next) => {
  res.setHeader('Content-Type', 'text/html')
  res.body = '<h1>Not Found</h1>'
  res.statusCode = 404
  await next()
}));

app.listen({
  port: 9090,
  host: "0.0.0.0",
}, (server) => {
  console.log(server.address())
});
