output "site_url" {
  description = "Site URL"
  value       = "https://${local.site_domain}"
}

output "cname_target" {
  description = "Target for the DNS-only CNAME of the site hostname"
  value       = module.site.cname_target
}

output "distribution_id" {
  description = "CloudFront distribution to invalidate after deploying"
  value       = module.site.distribution_id
}

output "api_gateway_url" {
  description = "API Gateway endpoint URL"
  value       = aws_api_gateway_stage.aboutme.invoke_url
}
