terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region = "us-east-2"
}

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

locals {
  account_id                  = data.aws_caller_identity.current.account_id
  region                      = data.aws_region.current.name
  function_name               = "random_quote"
  function_handler            = "lambda_handler"
  function_runtime            = "python3.9"
  function_timeout_in_seconds = 5

  function_source_dir = "${path.module}/../src/main/python/"
}

resource "aws_lambda_function" "function" {
  function_name = "${local.function_name}-${var.env_name}"
  handler       = "${local.function_name}.${local.function_handler}"
  runtime       = local.function_runtime
  timeout       = local.function_timeout_in_seconds

  filename         = "${local.function_source_dir}.zip"
  source_code_hash = data.archive_file.function_zip.output_base64sha256

  role = aws_iam_role.function_role.arn

  environment {
    variables = {
      ENVIRONMENT = var.env_name
    }
  }
}

data "archive_file" "function_zip" {
  source_dir  = local.function_source_dir
  type        = "zip"
  output_path = "${local.function_source_dir}.zip"
}

resource "aws_iam_role" "function_role" {
  name = "${local.function_name}-${var.env_name}"

  assume_role_policy = jsonencode({
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      },
    ]
  })
}

resource "aws_iam_role_policy" "dynamo_access" {
  name = "lambda_dynamo_access"
  role = aws_iam_role.function_role.id # Links to your existing role

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action   = ["dynamodb:Query", "dynamodb:GetItem"]
        Effect   = "Allow"
        Resource = "arn:aws:dynamodb:${local.region}:${local.account_id}:table/quotes"
      }
    ]
  })
}

resource "aws_s3_bucket" "bucket_quotes_floriank_org" {
  bucket = var.bucket_name

}

resource "aws_lambda_function_url" "random-quote-function-url" {
  function_name      = aws_lambda_function.function.function_name
  authorization_type = "NONE"
}

resource "aws_s3_bucket_policy" "bucket_policy_quotes_floriank_org" {
  bucket = aws_s3_bucket.bucket_quotes_floriank_org.id
  policy = templatefile("s3-policy.json", { bucket = var.bucket_name })
}

resource "aws_s3_bucket_website_configuration" "quotes_floriank_org" {
  bucket = aws_s3_bucket.bucket_quotes_floriank_org.bucket

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }
}

resource "aws_s3_bucket_acl" "public_acl" {
  bucket = aws_s3_bucket.bucket_quotes_floriank_org.id
  acl    = "public-read"
}

resource "aws_s3_object" "index" {
  bucket       = aws_s3_bucket.bucket_quotes_floriank_org.id
  key          = "index.html"
  source       = "${var.static_src}/index.html"
  content_type = "text/html"
  etag         = filemd5("${var.static_src}/index.html")
  acl          = "public-read"
}

resource "aws_s3_object" "error" {
  bucket       = aws_s3_bucket.bucket_quotes_floriank_org.id
  key          = "error.html"
  source       = "${var.static_src}/error.html"
  content_type = "text/html"
  etag         = filemd5("${var.static_src}/error.html")
  acl          = "public-read"
}

resource "aws_s3_object" "quotes_js" {
  bucket = aws_s3_bucket.bucket_quotes_floriank_org.id
  key    = "quotes.js"
  content = templatefile("${var.static_src}/quotes.js.tftpl", {
    lambda_url = aws_lambda_function_url.random-quote-function-url.function_url
  })
  content_type = "text/javascript"
  etag = md5(templatefile("${var.static_src}/quotes.js.tftpl", {
    lambda_url = aws_lambda_function_url.random-quote-function-url.function_url
  }))
  acl = "public-read"
}

resource "aws_s3_object" "dist" {
  for_each = fileset("../src/static/scripts", "*.js")

  bucket       = aws_s3_bucket.bucket_quotes_floriank_org.id
  key          = "scripts/${each.value}"
  source       = "../src/static/scripts/${each.value}"
  content_type = "text/javascript"
  etag         = filemd5("../src/static/scripts/${each.value}")
  acl          = "public-read"
}

resource "aws_route53_record" "quotes_floriank_org_arecord" {
  name    = var.domain_name
  type    = "A"
  zone_id = var.hosted_zone_id
  alias {
    evaluate_target_health = false
    name                   = "s3-website.us-east-2.amazonaws.com"
    zone_id                = aws_s3_bucket.bucket_quotes_floriank_org.hosted_zone_id
  }
}