#!/usr/bin/env python3

import os
import sys
import socket
import http.server
import contextlib
from functools import partial

import webbrowser

# http.server.__main__

def test(HandlerClass=http.server.BaseHTTPRequestHandler,
         ServerClass=http.server.ThreadingHTTPServer,
         protocol="HTTP/1.0", port=8000, bind=None):
    """Test the HTTP request handler class.

    This runs an HTTP server on port 8000 (or the port argument).

    """
    ServerClass.address_family, addr = http.server._get_best_family(bind, port)

    HandlerClass.protocol_version = protocol
    with ServerClass(addr, HandlerClass) as httpd:
        host, port = httpd.socket.getsockname()[:2]
        url_host = f'[{host}]' if ':' in host else host
        url = f"http://{url_host}:{port}/"
        print(f"Abriendo en un navegador: {url}")
        webbrowser.open(url)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nSaliendo...")
            sys.exit(0)

handler_class = partial(
    http.server.SimpleHTTPRequestHandler,
    directory=os.getcwd(),
)

# ensure dual-stack is not disabled; ref #38907
class DualStackServer(http.server.ThreadingHTTPServer):
    def server_bind(self):
        # suppress exception when protocol is IPv4
        with contextlib.suppress(Exception):
            self.socket.setsockopt(
                socket.IPPROTO_IPV6,
                socket.IPV6_V6ONLY,
                0,
            )
            return super().server_bind()

test(
    HandlerClass=handler_class,
    ServerClass=DualStackServer,
)
