import os, sys
os.chdir(os.path.dirname(os.path.abspath(__file__)))
import http.server, socketserver
PORT = 3456
handler = http.server.SimpleHTTPRequestHandler
with socketserver.TCPServer(("", PORT), handler) as httpd:
    print(f"Serving at port {PORT}", flush=True)
    httpd.serve_forever()
