#!/usr/bin/env python3
"""
Serve the exported site from GozuStudioWebsite with static-file routing support.

Fixes two local-preview problems:
1) Serves the GozuStudioWebsite folder as web root.
2) Resolves extensionless routes like /about to /about.html.
"""

from __future__ import annotations

import argparse
import functools
import socketserver
from http.server import SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import unquote, urlsplit


SITE_DIR = Path(__file__).resolve().parent / "GozuStudioWebsite"


class HtmlFallbackHandler(SimpleHTTPRequestHandler):
    def end_headers(self) -> None:
        # Prevent browser cache during local static-export edits.
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def _rewritten_path(self, raw_path: str) -> str:
        parsed = urlsplit(raw_path)
        path = unquote(parsed.path)

        if path == "/":
            rewritten = "/index.html"
        else:
            requested = Path(self.directory) / path.lstrip("/")
            if requested.exists():
                rewritten = path
            elif not path.endswith("/") and not Path(path).suffix:
                html_candidate = Path(self.directory) / f"{path.lstrip('/')}.html"
                rewritten = f"{path}.html" if html_candidate.exists() else path
            else:
                rewritten = path

        if parsed.query:
            return f"{rewritten}?{parsed.query}"
        return rewritten

    def do_GET(self) -> None:
        self.path = self._rewritten_path(self.path)
        super().do_GET()

    def do_HEAD(self) -> None:
        self.path = self._rewritten_path(self.path)
        super().do_HEAD()


class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True


def main() -> None:
    parser = argparse.ArgumentParser(description="Serve local Gozu static export")
    parser.add_argument("--port", type=int, default=4173, help="Port to bind")
    args = parser.parse_args()

    if not SITE_DIR.exists():
        raise SystemExit(f"Site directory not found: {SITE_DIR}")

    handler = functools.partial(HtmlFallbackHandler, directory=str(SITE_DIR))

    with ReusableTCPServer(("127.0.0.1", args.port), handler) as httpd:
        print(f"Serving {SITE_DIR} at http://127.0.0.1:{args.port}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
