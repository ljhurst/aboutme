provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      ManagedBy   = "terraform"
      Environment = var.environment
      Project     = var.project_name
    }
  }
}

# The state still holds the website configuration under this provider until its removal has been applied.
# tflint-ignore: terraform_unused_declarations
provider "aws" {
  alias  = "west"
  region = "us-west-2"

  default_tags {
    tags = {
      ManagedBy   = "terraform"
      Environment = var.environment
      Project     = var.project_name
    }
  }
}
