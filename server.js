
var http = require('http'),
      url = require('url'),
      fs = require('fs'),
      path = require('path'),
      upload = require("./upload.js");

http.createServer(function(req, res) {
   var _path = url.parse(req.url, true);
   var query = _path.query;
   var pathname = _path.pathname;
   
   if (pathname === '/upload') {
      upload.upload_file(req, res);
   } else {
      // http://ericsowell.com/blog/2011/5/6/serving-static-files-from-node-js
      var filePath = '.' + pathname;
      if (filePath == './') {
         filePath = './index.html';
      }
        
      var extname = path.extname(filePath);
      var contentType = 'text/html';
      switch (extname) {
         case '.js':
            contentType = 'text/javascript';
            break;
         case '.css':
            contentType = 'text/css';
            break;
         case '.woff':
            // http://stackoverflow.com/questions/2871655/proper-mime-type-for-fonts
            contentType = 'application/x-font-woff';
            break;
         case '.png':
            contentType = 'application/png';
            break;
      }
      
      fs.exists(filePath, function(exists) {
         if (exists) {
            fs.readFile(filePath, function(error, content) {
               if (error) {
                  res.writeHead(500);
                  res.end();
               } else {
                  res.writeHead(200, { 'Content-Type': contentType });
                  res.end(content, 'utf-8');
               }
            });
         } else {
            res.writeHead(404);
            res.end("Not found.");
         }
      });
   }
}).listen(9669);

console.log("Server is running in http://localhost:9669 ...");