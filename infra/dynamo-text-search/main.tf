variable "table_name" {
  description = "Name of the search table."
  type        = string
  default     = "DTS"
}

variable "tags" {
  description = "Tags to set on the table."
  type        = map(string)
  default     = {}
}

resource "aws_dynamodb_table" "DTSSearch" {
  name         = var.table_name
  billing_mode = "PAY_PER_REQUEST"

  hash_key  = "indexShard"
  range_key = "entryTextSegment"

  # primary key
  attribute {
    name = "indexShard"
    type = "S"
  }

  # search key
  attribute {
    name = "entryTextSegment"
    type = "S"
  }

  ttl {
    enabled        = true
    attribute_name = "ttl"
  }

  tags = var.tags
}

output "table" {
  description = "Text search table"
  value       = aws_dynamodb_table.DTSSearch
}
