"""
This file deploys any infrastructure updates to the AWS account pointed to in .env,
as well as builds an image from the updated configuration and deploys a new version of the Lambda
"""
from dotenv import load_dotenv
import sys

load_dotenv()

import os, shlex, subprocess

os.environ["TF_VAR_lambda_handler"]=shlex.quote(open("main.py").read()).replace("\n", r"\n")

returncode=subprocess.run(["terraform", "apply"]).returncode
if returncode>0:
    sys.exit(returncode)


import boto3
import time
from botocore.exceptions import ClientError

def find_pipeline_arn_by_name(client, pipeline_name):
    """Find the pipeline ARN based on the pipeline's name."""
    paginator = client.get_paginator('list_image_pipelines')
    for page in paginator.paginate():
        for pipeline in page.get('imagePipelineList', []):
            if pipeline['name'] == pipeline_name:
                return pipeline['arn']
    return None

def wait_for_image_build(client, image_build_version_arn, poll_interval=30):
    """Wait for the image build to complete."""
    print(f"Waiting for build {image_build_version_arn} to complete...")

    while True:
        try:
            response = client.get_image(
                imageBuildVersionArn=image_build_version_arn
            )
            status = response['image']['state']['status']
            print(f"Current status: {status}")

            if status in ["AVAILABLE", "FAILED", "CANCELLED"]:
                return status

            time.sleep(poll_interval)

        except ClientError as e:
            print(f"Error checking image status: {e.response['Error']['Message']}")
            break

def start_pipeline(pipeline_name):
    client = boto3.client('imagebuilder')

    arn = find_pipeline_arn_by_name(client, pipeline_name)
    if arn is None:
        print(f"Error: No pipeline found with name '{pipeline_name}'")
        return

    try:
        response = client.start_image_pipeline_execution(
            imagePipelineArn=arn
        )
        print(f"Started execution for pipeline '{pipeline_name}'")

        image_build_version_arn = response['imageBuildVersionArn']
        print(f"Image build version ARN: {image_build_version_arn}")

        final_status = wait_for_image_build(client, image_build_version_arn)
        print(f"Build completed with status: {final_status}")

    except ClientError as e:
        print(f"Failed to start pipeline: {e.response['Error']['Message']}")


start_pipeline("compile-latex")

boto3.client('lambda').update_function_code(FunctionName="compile-latex", Publish=True)
