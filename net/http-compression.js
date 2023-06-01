const http = require('http')
const path = require('path')
const url = require('url')
const fs = require('fs')
const mime = require('mime')
const zlib = require('zlib')

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
      const stats = fs.statSync(filePath)
      const timeStamp = req.headers['if-modified-since']
      let status = timeStamp && Number(timeStamp) === stats.mtimeMs ? 304 : 200
      const mimeType = mime.getType(ext)
      const responseHeaders = {
        'Content-Type': mimeType,
        'Cache-control': 'max-age=86400',
        'Last-Modified': stats.mtimeMs,
      }
      const acceptEncoding = req.headers['accept-encoding']
      const compress = /^(text|application)\//.test(mimeType)
      if(compress) {
        responseHeaders['Content-Encoding'] = 'deflate'
        acceptEncoding.split(/\s*,\s*/).some(encoding => {
          if(encoding === 'gzip') {
            responseHeaders['Content-Encoding'] = 'gzip'
            return true
          }
          if(encoding === 'deflate') {
            responseHeaders['Content-Encoding'] = 'deflate';
            return true;
          }
          if(encoding === 'br') {
            responseHeaders['Content-Encoding'] = 'br';
            return true;
          }
          return false
        })
      }
      res.writeHead(status, responseHeaders)
      const compressionEncoding = responseHeaders['Content-Encoding']

      if(status === 200) {
        const fileStream = fs.createReadStream(filePath)
        if(compress && compressionEncoding) {
          let comp
          if(compressionEncoding === 'gzip') {
            console.log('gzip')
            comp = zlib.createGzip()
          } else if(compressionEncoding === 'deflate') {
            comp = zlib.createDeflate()
          } else {
            comp = zlib.createBrotliCompress()
          }
          fileStream.pipe(comp).pipe(res)
        } else {
          fileStream.pipe(res)
        }
      } else {
        res.end()
      }
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