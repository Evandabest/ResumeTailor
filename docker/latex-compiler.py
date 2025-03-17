from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import subprocess
import base64
import os
import tempfile

class LaTeXCompiler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            body = self.rfile.read(content_length)
            data = json.loads(body)
            
            with tempfile.TemporaryDirectory() as tmpdir:
                tex_file = os.path.join(tmpdir, 'document.tex')
                with open(tex_file, 'w') as f:
                    f.write(data['latex'])
                
                # Run pdflatex twice to resolve references
                for _ in range(2):
                    result = subprocess.run(
                        ['pdflatex', '-interaction=nonstopmode', tex_file],
                        cwd=tmpdir,
                        capture_output=True,
                        text=True
                    )
                
                pdf_file = os.path.join(tmpdir, 'document.pdf')
                if os.path.exists(pdf_file):
                    with open(pdf_file, 'rb') as f:
                        pdf_content = f.read()
                        pdf_base64 = base64.b64encode(pdf_content).decode()
                    
                    # Send response headers in correct order
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
                    self.send_header('Access-Control-Allow-Headers', 'Content-Type')
                    self.end_headers()
                    
                    response = json.dumps({
                        'success': True,
                        'pdf': f'data:application/pdf;base64,{pdf_base64}'
                    })
                    self.wfile.write(response.encode())
                else:
                    raise Exception(f'PDF generation failed:\n{result.stdout}\n{result.stderr}')
                    
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = json.dumps({
                'success': False,
                'error': str(e)
            })
            self.wfile.write(response.encode())

    def do_OPTIONS(self):
        # Handle preflight request
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == '__main__':
    server = HTTPServer(('0.0.0.0', 3001), LaTeXCompiler)
    print('Starting LaTeX compilation server on port 3001...')
    server.serve_forever()