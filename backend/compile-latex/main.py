import os, subprocess

def main(event, context):
    os.chdir("/tmp")
    os.system("rm -rf *")

    params=event.get("queryStringParameters", event)

    return [event, params]
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

    return {
    "headers": headers,
    "statusCode": status_code, 
    "body": body,
    'isBase64Encoded': False
    }

