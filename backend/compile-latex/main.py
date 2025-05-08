import os, subprocess, json, base64

def main(event, context):
    os.chdir("/tmp")
    os.system("rm -rf *")

    params=event.get("queryStringParameters", event)

    filename=params["filename"]

    with open(filename+".tex", "w+") as f:
        f.write(params["content"])

    process=subprocess.run(["pdflatex", "-interaction=nonstopmode", filename+".tex"], capture_output=True, text=True)

    status_code=200
    headers={}
    body=b""
    if process.returncode>0:
        status_code=500
        headers["Error-Message"]=process.stdout
    else:
       body=open(filename+".pdf", "rb").read()

    return json.dumps({
    "headers": headers,
    "statusCode": status_code, 
    "body": base64.b64encode(body).decode(),
    'isBase64Encoded': False
    })

