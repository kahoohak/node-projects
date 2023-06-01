const http = require('http')
const path = require('path')
const url = require('url')
const fs = require('fs')
const mime = require('mime')

const server = http.createServer((req, res) => { 
  let urlPathname = url.parse(req.url).pathname;
  let filePath = path.join('www', urlPathname);
  filePath = path.resolve(__dirname, filePath.replace(/^\/[A-Z]:/i, '')); // 移除 Windows 驱动器名称
  
  if(fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath)
    const isDir = stats.isDirectory()
    if(isDir) filePath = path.join(filePath, 'index.html')

    if(fs.existsSync(filePath)) {
      const { ext } = path.parse(filePath)
      res.writeHead(200, {'Content-Type': mime.getType(ext)})
      const fileStream = fs.createReadStream(filePath)
      fileStream.pipe(res)
    }
  } else {
    res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'})
    res.end('<h1>Not Found</h1>')
  }
})

server.on('clientError', (err, socket) => {
  socket.end('HTTP/1/1 400 Bad Request\r\n\r\n')
})

server.listen(8080, () => {
  console.log('open server on', server.address())
})