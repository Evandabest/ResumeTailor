terraform {
  backend "s3" {
    bucket = "terraform-state-resumetailor-hariskhan"
    key    = "terraform.tfstate"
    region = "us-east-2"
  }
}
