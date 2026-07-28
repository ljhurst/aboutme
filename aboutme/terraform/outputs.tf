output "s3_website_url" {
  description = "S3 website URL"
  value       = "http://${aws_s3_bucket_website_configuration.static_site.website_endpoint}"
}

output "api_gateway_url" {
  description = "API Gateway endpoint URL"
  value       = aws_api_gateway_stage.aboutme.invoke_url
}

output "github_actions_backend_deploy_role_arn" {
  description = "Role ARN for GitHub Actions to assume when deploying Lambda code"
  value       = aws_iam_role.github_actions_backend_deploy.arn
}

output "github_actions_frontend_deploy_role_arn" {
  description = "Role ARN for GitHub Actions to assume when deploying the frontend to S3"
  value       = aws_iam_role.github_actions_frontend_deploy.arn
}
