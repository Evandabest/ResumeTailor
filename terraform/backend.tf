terraform {
  backend "s3" {
    bucket = "terraform-state-resumetailor-aray1337"  # Replace with your S3 bucket name
    key    = "core/terraform.tfstate"
    region = "us-east-2"  # Must match provider region
  }
}
