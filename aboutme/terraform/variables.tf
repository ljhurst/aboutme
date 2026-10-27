variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "environment" {
  description = "Environment name (e.g., prod)"
  type        = string
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "spotify_client_id" {
  description = "Spotify Client ID"
  type        = string
  sensitive   = true
}

variable "lambda_package_dir" {
  description = "Directory holding the Lambda zips; run aboutme/scripts/build_lambdas.sh"
  type        = string
}
