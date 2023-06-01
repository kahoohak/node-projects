const http = require('http')
const path = require('path')
const url = require('url')
const fs = require('fs')
const mime = require('mime')
const checksum = require('checksum')

const getMimeType = (filePath) => {
  const { ext } = path.parse(filePath)
  return mime.getType(ext)
}

const server = http.createServer((req, res) => { 
  let urlPathname = url.parse(req.url).pathname;
  let filePath = path.join('www', urlPathname);
  filePath = path.resolve(__dirname, filePath.replace(/^\/[A-Z]:/i, '')); // 移除 Windows 驱动器名称
  if(filePath === '/') filePath += '/index.html'

  if(!fs.existsSync(filePath)) {
    res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'})
    return res.end('<h1>Not Found</h1>')
  }

  checksum.file(filePath, (err, sum) => {
    const fileStream = fs.createReadStream(filePath)
    sum = `"${sum}"`

    if(req.headers['if-none-match'] === sum) {
      res.writeHead(304, {
        'Content-Type': getMimeType(filePath),
        etag: sum,
      });
      res.end();
    } else {
      res.writeHead(200, {
        'Content-Type': getMimeType(filePath),
        etag: sum,
      });
      fileStream.pipe(res);
    }
  })
})

server.on('clientError', (err, socket) => {
  socket.end('HTTP/1/1 400 Bad Request\r\n\r\n')
})

server.listen(8080, () => {
  console.log('open server on', server.address())
})