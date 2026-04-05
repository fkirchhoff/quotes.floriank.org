variable "domain_name" {
  default = "quotes.floriank.org"
  type    = string
}

variable "bucket_name" {
  default = "quotes.floriank.org"
  type    = string
}

variable "static_src" {
  default = "../src/static"
  type    = string
}

variable "hosted_zone_id" {
  default = "/hostedzone/Z0231779JWQR5OICZH9M"
  type = string
}

variable env_name {
  default = "prod"
  type = string
}