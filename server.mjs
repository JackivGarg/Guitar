import http from 'node:http';
import {createReadStream,existsSync,statSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'dist');
const port=17842;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.ico':'image/x-icon','.png':'image/png','.txt':'text/plain; charset=utf-8','.mp3':'audio/mpeg'};
if(!existsSync(path.join(root,'index.html'))){console.error('Build the app first with npm run build.');process.exit(1);}
const server=http.createServer((req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('Cross-Origin-Resource-Policy','same-origin');
 const host=req.headers.host??'';if(!['127.0.0.1:17842','localhost:17842'].includes(host)){res.writeHead(403);res.end();return;}
 if(!['GET','HEAD'].includes(req.method??'')){res.writeHead(405,{Allow:'GET, HEAD'});res.end();return;}
 let pathname;try{pathname=decodeURIComponent(new URL(req.url??'/',`http://127.0.0.1:${port}`).pathname);}catch{res.writeHead(400);res.end();return;}
 if(pathname==='/health'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({app:'six-strings',status:'ok'}));return;}
 let file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 if(!existsSync(file)||!statSync(file).isFile()){res.writeHead(404);res.end('Not found');return;}
 const size=statSync(file).size;res.setHeader('Content-Type',mime[path.extname(file)]??'application/octet-stream');res.setHeader('Accept-Ranges','bytes');res.setHeader('Cache-Control','no-cache');
 const range=req.headers.range;
 if(range){const m=/^bytes=(\d*)-(\d*)$/.exec(range);if(!m||(!m[1]&&!m[2])){res.writeHead(416,{'Content-Range':`bytes */${size}`});res.end();return;}const start=m[1]?Number(m[1]):Math.max(0,size-Number(m[2]));const end=m[1]&&m[2]?Math.min(size-1,Number(m[2])):size-1;if(!Number.isSafeInteger(start)||start> end||start>=size){res.writeHead(416,{'Content-Range':`bytes */${size}`});res.end();return;}res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':end-start+1});if(req.method==='HEAD'){res.end();return;}createReadStream(file,{start,end}).on('error',()=>res.destroy()).pipe(res);return;}
 res.writeHead(200,{'Content-Length':size});if(req.method==='HEAD'){res.end();return;}createReadStream(file).on('error',()=>res.destroy()).pipe(res);
});
server.on('error',error=>{console.error(error.code==='EADDRINUSE'?'Port 17842 is already in use. If Six Strings is running, open http://127.0.0.1:17842.':error.message);process.exit(1);});
server.listen(port,'127.0.0.1',()=>console.log('Six Strings is ready at http://127.0.0.1:17842'));
