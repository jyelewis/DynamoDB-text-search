terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region = "ap-southeast-2"
}

module "dynamo-text-search" {
  source = "./dynamo-text-search"

  table_name = "DTS_example"
  tags = {
    App         = "DynamoDB-text-search"
    Environment = "development"
  }
}
