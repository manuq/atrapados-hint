#!/usr/bin/env python3

import http.server
import socketserver
import webbrowser


PORT = 8085

Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"abriendo en un navegador: http://localhost:{PORT}/")
    webbrowser.open(f"http://localhost:{PORT}")
    httpd.serve_forever()
