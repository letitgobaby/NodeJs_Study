import http from 'http'; // it's http protocol(HTTP/1.1)
import url from 'url';
import path from 'path';
import fs from 'fs';

import IndexUserApi from './API/User';

const staticFileType = ['.html', '.js', '.png', '.css'];
const mimeTypes = {
  ".ico": "image/x-icon",
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".eot": "aplication/vnd.ms-fontobject",
  ".ttf": "aplication/font-sfnt",
}
const Http_Methods = http.METHODS; // method lists, array type
const Http_StatusCode = http.STATUS_CODES; // status code lists, object type;
const port = process.env.PORT || 9000;
const host = process.env.HOST || 'localhost';

// make new instance of http.Server class
const server = http.createServer();

server.listen(port, host, () => {
  console.log('Server is running');
});


// Emitted each time there is a request
server.on('request', (request, response) => {
  console.log(`Url is ${request.url} and Method is ${request.method}`);

  // parse request url
  let urlObject = url.parse(request.url, true);

  // URL path router
  switch (urlObject.pathname) {

    // http://localhost:9000,  static file example
    case '/': 
        let filePath = path.join(__dirname, './PUBLIC/index.html');
        let mimeType = mimeTypes[filePath.substr(filePath.indexOf('.'), filePath.length)];
        fs.readFile(filePath, (err, data) => {
          if (err) throw err
          response.writeHead(200, { 'Content-Type': mimeType });
          response.end(data);
        });
      break


    // http://localhost:9000/user
    case '/user': 
        IndexUserApi(request, response);
      break


    // http://localhost:9000/assets
    case '/assets': 
        console.log('assets !!!');
      break


    // http://localhost:9000/*
    default: 
      // Hard coding
      if (staticFileType.some( a => urlObject.pathname.includes(a) )) {
        filePath = path.join(__dirname, './PUBLIC/'+urlObject.pathname);
        mimeType = mimeTypes[filePath.substr(filePath.indexOf('.'), filePath.length)];
        fs.readFile(filePath, (err, data) => {
          if (err) throw err
          response.writeHead(200, { 'Content-Type': mimeType });
          response.end(data);
        });
      } else {
        response.writeHead(404, { 'Content-Type': 'text/plain' });
        response.write('Error 404: Resource not found');
        response.end();
      }
  }
});


// If a client connection emits an 'error' event - it will forwarded here.
server.on('clientError', (error, socket) => {
  console.log( error );
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});


// When a new TCP stream is established
server.on('connection',(socket) => {
  socket.setTimeout(1200000); // Default is 2 minutes (120000 milliseconds)
  console.log(`Clent Address : ${socket.remoteAddress} / ${socket.remotePort} `);
  console.log('Server Address : ', socket.address() );
});


// Emitted when the server closes 
server.on('close',() => {
  console.log('Server Down');
});
