/*
 * Server-related tasks
 *
 */

 // Dependencies
 var http = require('http');
 var https = require('https');
 var url = require('url');
 var StringDecoder = require('string_decoder').StringDecoder;
 var config = require('./config');
 var fs = require('fs');
 var handlers = require('./handlers');
 var helpers = require('./helpers');
 var path = require('path');
 var util = require('util');
 var multiparty = require('multiparty');
 var debug = util.debuglog('server');


// Instantiate the server module object
var server = {};

 // Instantiate the HTTP server
server.httpServer = http.createServer(function(req,res){
   server.unifiedServer(req,res);
 });

 // Instantiate the HTTPS server
server.httpsServerOptions = {
   'key': fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
   'cert': fs.readFileSync(path.join(__dirname,'/../https/cert.pem'))
 };
 server.httpsServer = https.createServer(server.httpsServerOptions,function(req,res){
   server.unifiedServer(req,res);
 });

 // All the server logic for both the http and https server
server.unifiedServer = function(req,res){

   // Parse the url
   var parsedUrl = url.parse(req.url, true);

   // Get the path
   var path = parsedUrl.pathname;
   var trimmedPath = path.replace(/^\/+|\/+$/g, '');

   // Get the query string as an object
   var queryStringObject = parsedUrl.query;

   // Get the HTTP method
   var method = req.method.toLowerCase();

   //Get the headers as an object
   var headers = req.headers;

   // Caso seja uma requisição do tipo multipart/form-data, utilizar multiparty para fazer o parse dos campos e arquivos
   if(typeof(headers['content-type']) == 'string'
      && headers['content-type'].includes('multipart/form-data')
      && trimmedPath.split('/').length == 2
      && trimmedPath.split('/')[0] == 'arquivos' ) {


      var form = new multiparty.Form();

      if(method === 'options') {
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.setHeader("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept,token");
        res.setHeader('Content-Type', 'application/json; charset=UTF-8');
        res.writeHead(204);
        res.end();
      }else if (method === 'get') {
        // Check the router for a matching path for a handler. If one is not found, use the notFound handler instead.
        var chosenHandler = typeof(server.arquivos[trimmedPath.split('/')[1]]) !== 'undefined' ? server.arquivos[trimmedPath.split('/')[1]] : handlers.notFound;
        // Construct the data object to send to the handler
        var data = {
          'trimmedPath' : trimmedPath,
          'queryStringObject' : queryStringObject,
          'method' : method,
          'headers' : headers,
          'payload' : ''
        };
        
        // Route the request to the handler specified in the router
        chosenHandler(data,function(statusCode, payload){
          
          if( typeof(payload) == 'string' ){
            var filePath = payload;
            var stat = fs.statSync(filePath);
            
            
            // Return the response
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
            res.setHeader('Access-Control-Allow-Credentials', true);
            res.setHeader("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept,token,responseType");
            res.writeHead(statusCode);
            
            var readStream = fs.createReadStream(filePath);
            readStream.pipe(res);
            
          }else {
            // Use the status code returned from the handler, or set the default status code to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            
            // Use the payload returned from the handler, or set the default payload to an empty object
            payload = typeof(payload) == 'object'? payload : {};
            
            // Convert the payload to a string
            var payloadString = JSON.stringify(payload);
            
            // Return the response
            res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
            res.setHeader('Access-Control-Allow-Credentials', true);
            res.setHeader("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept,token,responseType");
            res.setHeader('Content-Type', 'application/json; charset=UTF-8');
            res.writeHead(statusCode);
            res.end(payloadString);
          }
          
          // If the response is 200, print green, otherwise print red
          if(statusCode == 200){
            debug('\x1b[32m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+statusCode);
          } else {
            debug('\x1b[31m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+statusCode);
          }
        });
      }else {
        
        form.parse(req, function(err, fields, files) {
          
          if(!err) {
            console.log(req.headers);
            
            // Check the router for a matching path for a handler. If one is not found, use the notFound handler instead.
            var chosenHandler = typeof(server.arquivos[trimmedPath.split('/')[1]]) !== 'undefined' ? server.arquivos[trimmedPath.split('/')[1]] : handlers.notFound;
            // Construct the data object to send to the handler
            var data = {
              'trimmedPath' : trimmedPath,
              'queryStringObject' : queryStringObject,
              'method' : method,
              'headers' : headers,
              'payload' : {'fields': fields, 'files': files},
            };
            
            // Route the request to the handler specified in the router
            chosenHandler(data,function(statusCode, payload){
              
              if( typeof(payload) == 'string' ){
                var filePath = payload;
                var stat = fs.statSync(filePath);
                
                
                // Return the response
                res.setHeader('Content-Type', 'image/png');
                res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
                res.setHeader('Access-Control-Allow-Credentials', true);
                res.setHeader("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept,token,responseType");
                res.writeHead(statusCode);
                
                var readStream = fs.createReadStream(filePath);
                readStream.pipe(res);
                
              }else {
                // Use the status code returned from the handler, or set the default status code to 200
                statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
                
                // Use the payload returned from the handler, or set the default payload to an empty object
                payload = typeof(payload) == 'object'? payload : {};
                
                // Convert the payload to a string
                var payloadString = JSON.stringify(payload);
                
                // Return the response
                res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
                res.setHeader('Access-Control-Allow-Credentials', true);
                res.setHeader("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept,token,responseType");
                res.setHeader('Content-Type', 'application/json; charset=UTF-8');
                res.writeHead(statusCode);
                res.end(payloadString);
              }
              
              // If the response is 200, print green, otherwise print red
              if(statusCode == 200){
                debug('\x1b[32m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+statusCode);
              } else {
                debug('\x1b[31m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+statusCode);
              }
            });
          }else {
            console.log(err);
            res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
            res.setHeader('Access-Control-Allow-Credentials', true);
            res.setHeader("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept,token,responseType");
            res.setHeader('Content-Type', 'application/json; charset=UTF-8');
            res.writeHead(500);
            res.end({'Error': 'Não foi possível fazer upload do arquivo'});
          }
          
        });
      }
  } else {

     // Se não for um requisição do tipo multipart/form-data
     var decoder = new StringDecoder('utf-8');
     var buffer = '';
     req.on('data', function(data) {
         buffer += decoder.write(data);
     });
     req.on('end', function() {
    
         buffer += decoder.end();

         // Check the router for a matching path for a handler. If one is not found, use the notFound handler instead.
         var chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

         // Construct the data object to send to the handler
         var data = {
           'trimmedPath' : trimmedPath,
           'queryStringObject' : queryStringObject,
           'method' : method,
           'headers' : headers,
           'payload' : helpers.parseJsonToObject(buffer),
         };

         if(method === 'options') {
          res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
          res.setHeader('Access-Control-Allow-Credentials', true);
          res.setHeader("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept,token,responseType");
          res.setHeader('Content-Type', 'application/json; charset=UTF-8');
          res.writeHead(204);
          res.end();
         }else {

           
           // Route the request to the handler specified in the router
           chosenHandler(data,function(statusCode,payload){
             
             // Use the status code returned from the handler, or set the default status code to 200
             statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
             
             // Use the payload returned from the handler, or set the default payload to an empty object
             payload = typeof(payload) == 'object'? payload : {};
             
             // Convert the payload to a string
             var payloadString = JSON.stringify(payload);
             
             // Return the response
             res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
             res.setHeader('Access-Control-Allow-Credentials', true);
             res.setHeader("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept,token,responseType");
             res.setHeader('Content-Type', 'application/json; charset=UTF-8');
             res.writeHead(statusCode);
             
             res.end(payloadString);
             
             // If the response is 200, print green, otherwise print red
             if(statusCode == 200){
                debug('\x1b[32m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+statusCode);
              } else {
                debug('\x1b[31m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+statusCode);
              }
            });
          }

     });
   }

 };

 // Define the request router
server.router = {
   'ping' : handlers.ping,
   'usuarios' : handlers.usuarios,
   'tokens' : handlers.tokens,
   'categorias' : handlers.categorias,
   'cartoes': handlers.cartoes,
   'paineis': handlers.paineis
 };

server.arquivos = {
  'cartoes': handlers.arquivos.cartoes,
  'categorias': handlers.arquivos.categorias
};

 // Init script
server.init = function(){
  // Start the HTTP server
  server.httpServer.listen(config.httpPort,function(){
    console.log('\x1b[36m%s\x1b[0m','The HTTP server is running on port '+config.httpPort);
  });

  // Start the HTTPS server
  server.httpsServer.listen(config.httpsPort,function(){
    console.log('\x1b[35m%s\x1b[0m','The HTTPS server is running on port '+config.httpsPort);
  });
};


 // Export the module
 module.exports = server;