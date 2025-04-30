"""
This file deploys any infrastructure updates to the AWS account pointed to in .env,
as well as builds an image from the updated configuration and deploys a new version of the Lambda
"""
import dotenv
import sys, os, shlex, subprocess, time
import boto3

dotenv.load_dotenv()

os.environ["TF_VAR_lambda_handler"]=shlex.quote(open("main.py").read()).replace("\n", r"\n")

print("Applying Terraform configuration...")
process=subprocess.run(["terraform", "plan", "-detailed-exitcode"], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)

if process.returncode==0:
    print("Configuration is up to date! There is nothing to do.")
    sys.exit()
elif process.returncode==1:
    print(sys.stdout)
    sys.exit()
else:
    print(sys.stdout)

returncode=subprocess.run(["terraform", "apply"]).returncode
if returncode>0:
    sys.exit(returncode)

print("Running ImageBuilder pipeline...")
client=boto3.client('imagebuilder')

pipeline_arn=client.list_image_pipelines(filters=[{"name": "name", "values": ["compile-latex"]}])["imagePipelineList"][0]["arn"]

image_arn=client.start_image_pipeline_execution(imagePipelineArn=pipeline_arn)["imageBuildVersionArn"]

print("Waiting for the image to finish building...")

status=None
reason=None
while True:
    response=client.get_image(imageBuildVersionArn=image_arn)["image"]["state"]
    status=response["status"]
    reason=response["reason"]
    if not status.endswith("ING"):
        break
    time.sleep(30)

if status!="AVAILABLE":
    print(f"Image build is {status} due to: {reason}")
    sys.exit(1)

print("Deploying new version of Lambda...")

client=boto3.client("lambda")
lambda_image_uri=client.get_function(FunctionName="compile-latex")["Code"]["ImageUri"]

client.update_function_code(FunctionName="compile-latex", ImageUri=lambda_image_uri, Publish=True)

while True:
    response=client.get_function(FunctionName="compile-latex")["Configuration"]
    status=response["State"]
    reason=response["StateReason"]

    if status in ["Active", "Inactive"]:
        break
    elif status=="Failed":
        print(f"Deployment of Lambda has failed due to: {reason}")
        sys.exit(1)
    time.sleep(30)
print("Deployment has succeeded!")
