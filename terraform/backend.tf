terraform {
  backend "s3" {
    bucket  = "terraform-state-quotes-floriank-org"
    key     = "prod/terraform.tfstate"
    region  = "us-east-2"
    encrypt = true
  }
}
