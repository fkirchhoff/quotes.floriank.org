output "website_endpoint" {
  description = "The public url of this website."
  value       = aws_s3_bucket_website_configuration.quotes_floriank_org.website_endpoint
}

output "lambda_function_url" {
  description = "The public URL of the Lambda function."
  value       = aws_lambda_function_url.random-quote-function-url.function_url
}