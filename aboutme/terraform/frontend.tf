locals {
  site_domain = "aboutme.bylukehurst.com"
}

module "site" {
  source = "git::https://github.com/ljhurst/stych.git//infra/modules/static-site?ref=v1.9.0"

  bucket_name = "lj-aboutme"
  region      = "us-west-2"
  domain_name = local.site_domain

  # The Tailwind CDN script and Handlebars compile at runtime, which needs unsafe-eval, and the retry button
  # uses an inline handler.
  content_security_policy = join("; ", [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.tailwindcss.com https://cdn.jsdelivr.net https://buttons.github.io",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' ${aws_api_gateway_stage.aboutme.invoke_url} https://api.github.com",
    "frame-src https://buttons.github.io",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "form-action 'self'",
  ])
}

moved {
  from = aws_s3_bucket.static_site
  to   = module.site.aws_s3_bucket.this
}

moved {
  from = aws_s3_bucket_policy.static_site
  to   = module.site.aws_s3_bucket_policy.this
}

removed {
  from = aws_s3_bucket_website_configuration.static_site

  lifecycle {
    destroy = false
  }
}
