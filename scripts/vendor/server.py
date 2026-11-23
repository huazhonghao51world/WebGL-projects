"""Frozen dengta delivery server; Python 3.8+, standard library only."""
import argparse
import hashlib
import json
import mimetypes
import os
from pathlib import Path
import secrets
import sys
import time
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent.parent
def read_json(p):
    return json.loads(p.read_text(encoding='utf-8'))

def verify():
    manifest = read_json(ROOT / 'manifest.json')
    for entry in manifest['files']:
        p = (ROOT / entry['path']).resolve()
        if ROOT not in p.parents or not p.is_file():
            raise RuntimeError('Missing or invalid file: ' + entry['path'])
        digest = hashlib.sha256()
        with p.open('rb') as f:
            for block in iter(lambda: f.read(1024 * 1024), b''):
                digest.update(block)
        if p.stat().st_size != entry['bytes'] or digest.hexdigest() != entry['sha256']:
            raise RuntimeError('Integrity check failed: ' + entry['path'])
    print('Integrity OK: %d files' % len(manifest['files']), flush=True)
    return manifest

class Handler(BaseHTTPRequestHandler):
    server_version = 'DengtaOffline/1.0'
    def reply(self, status, value):
        body = json.dumps(value, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        if self.command != 'HEAD': self.wfile.write(body)

    def do_POST(self):
        p = urlsplit(self.path).path
        if p != '/api/delivery/token':
            self.reply(501, {'code':'E_CAPABILITY_UNAVAILABLE','message':'This offline package does not include AI or platform write services.'})
            return
        try:
            size = int(self.headers.get('Content-Length', '0'))
            if size < 1 or size > 4096: raise ValueError('Invalid request length')
            body = json.loads(self.rfile.read(size))
        except (ValueError, TypeError):
            self.reply(400, {'code':'E_INVALID_ARGUMENT','message':'Invalid JSON request'})
            return
        if body.get('code') != 'LOCAL-GPU-TEST':
            self.reply(403, {'code':'E_DELIVERY_INVALID','message':'Use the local test configuration shipped in this package.'})
            return
        r = self.server.release
        self.reply(200, {'token':self.server.token,'expiresAt':int((time.time()+86400)*1000), **{k:r[k] for k in ('sceneId','name','revision')}})

    def do_HEAD(self): self.do_GET()

    def do_GET(self):
        p = unquote(urlsplit(self.path).path)
        if p == '/health':
            self.reply(200, {'ok':True,'mode':'offline-snapshot','revision':self.server.release['revision']})
            return
        if p == '/config.json':
            c = read_json(ROOT / 'web/config.json')
            host, port = self.server.server_address[:2]
            c['serverUrl'] = 'http://%s:%d/api' % (self.server.public_host, port)
            self.reply(200,c)
            return
        if p.startswith('/api/'):
            if self.headers.get('Authorization') != 'Bearer '+self.server.token:
                self.reply(401,{'code':'E_AUTH_REQUIRED','message':'Local session required'})
                return
            if p == '/api/delivery/release': self.reply(200,self.server.release); return
            if p == '/api/delivery/custom-apis': self.reply(200,self.server.custom_apis); return
            if p == '/api/delivery/status':
                self.reply(200,{k:self.server.release[k] for k in ('sceneId','name','revision')}); return
            if p.startswith('/api/objects/'):
                h = p.rsplit('/',1)[-1]
                if h not in self.server.objects:
                    self.reply(404,{'code':'E_NOT_FOUND','message':'Object not in snapshot'}); return
                self.serve_file(ROOT/'snapshot/objects'/h, 'application/octet-stream'); return
            self.reply(501,{'code':'E_CAPABILITY_UNAVAILABLE','message':'Service not included in offline GPU test'}); return
        target = (ROOT / 'web' / (p.lstrip('/') or 'index.html')).resolve()
        if (ROOT/'web').resolve() not in target.parents or not target.is_file():
            self.reply(404,{'message':'File not found'}); return
        mime = {'.js':'application/javascript','.mjs':'application/javascript','.wasm':'application/wasm','.json':'application/json','.vtk':'application/octet-stream'}.get(target.suffix) or mimetypes.guess_type(str(target))[0] or 'application/octet-stream'
        self.serve_file(target,mime)

    def serve_file(self, p, mime):
        self.send_response(200)
        self.send_header('Content-Type',mime)
        self.send_header('Content-Length',str(p.stat().st_size))
        self.send_header('Cache-Control','no-store')
        self.end_headers()
        if self.command != 'HEAD':
            try:
                with p.open('rb') as f:
                    for block in iter(lambda:f.read(256*1024),b''): self.wfile.write(block)
            except (BrokenPipeError,ConnectionResetError): pass

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--port',type=int,default=3666)
    parser.add_argument('--verify-only',action='store_true')
    args=parser.parse_args()
    verify()
    if args.verify_only:return
    server=ThreadingHTTPServer(('127.0.0.1',args.port),Handler)
    server.public_host='localhost'
    server.release=read_json(ROOT/'snapshot/release.json')
    server.custom_apis=read_json(ROOT/'snapshot/custom-apis.json')
    server.objects={x.name for x in (ROOT/'snapshot/objects').iterdir() if x.is_file()}
    server.token=secrets.token_urlsafe(32)
    print('Offline dengta ready: http://localhost:%d/#/page_2/2' % args.port,flush=True)
    print('WebGL2 diagnostics: http://localhost:%d/diagnostics.html' % args.port,flush=True)
    print('Keep this terminal open. Ctrl+C to stop.',flush=True)
    try: server.serve_forever()
    except KeyboardInterrupt: pass
    finally: server.server_close()

if __name__=='__main__':
    try: main()
    except Exception as exc:
        print('START FAILED: '+str(exc),file=sys.stderr,flush=True)
        sys.exit(1)
