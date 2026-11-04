"""Local read-only story asset search server, using Python standard library."""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit, parse_qs, unquote
from pathlib import Path
import argparse, json, mimetypes
from search import AssetSearch, ROOT

class Handler(BaseHTTPRequestHandler):
    def send(self,status,content,content_type):
        self.send_response(status);self.send_header('Content-Type',content_type);self.send_header('Content-Length',str(len(content)));self.send_header('X-Content-Type-Options','nosniff');self.end_headers();self.wfile.write(content)
    def do_GET(self):
        url=urlsplit(self.path)
        if url.path=='/api/search':
            try:
                q=parse_qs(url.query).get('q',[''])[0]; result={'results':self.server.engine.recommend(q),'suggestion':self.server.engine.suggestions(q)}
                self.send(200,json.dumps(result,ensure_ascii=False).encode(),'application/json; charset=utf-8')
            except ValueError as exc: self.send(400,json.dumps({'error':str(exc)},ensure_ascii=False).encode(),'application/json; charset=utf-8')
            return
        path=unquote(url.path)
        if path=='/': file=ROOT/'index.html'
        elif path.startswith('/assets/'):
            file=(ROOT/path.lstrip('/')).resolve()
            if not file.is_relative_to((ROOT/'assets').resolve()): self.send(403,b'Forbidden','text/plain');return
        else: self.send(404,b'Not found','text/plain');return
        try:self.send(200,file.read_bytes(),mimetypes.guess_type(file.name)[0] or 'application/octet-stream')
        except OSError:self.send(404,b'Not found','text/plain')

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--port',type=int,default=5179);args=p.parse_args()
    server=ThreadingHTTPServer(('127.0.0.1',args.port),Handler);server.engine=AssetSearch()
    print(f'故事素材库：http://127.0.0.1:{args.port}',flush=True)
    try:server.serve_forever()
    except KeyboardInterrupt:pass
    finally:server.server_close()
