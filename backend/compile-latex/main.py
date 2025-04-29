import os, subprocess, base64
def main(event, context):
    os.chdir("/tmp")
    os.system("rm -rf *")

    filename=event["filename"]
    with open(filename, "w+") as f:
        f.write(event["content"])

    process=subprocess.run(["pdflatex", "-interaction=nonstopmode", filename+".tex"], capture_output=True)

    status_code=200
    headers={}
    body=b""
    if process.returncode>0:
        status_code=500
        headers["Error-Message"]=process.stderr.decode()
    else:
       body=open(filename+".pdf", "rb").read()

    body=base64.b64encode(body).decode('utf-8')

    return {
    "headers": headers,
    "statusCode": status_code, 
    "body": body,
    'isBase64Encoded': True
    }
        
