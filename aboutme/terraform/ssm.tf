# Credential values are written by aboutme/scripts/set-secrets.sh and never managed here:
# Terraform refreshes every attribute into state, including decrypted values.
locals {
  spotify_client_secret_ssm_param = "/aboutme/spotify/client-secret"
  spotify_refresh_token_ssm_param = "/aboutme/spotify/refresh-token"
  garmin_email_ssm_param          = "/aboutme/garmin/email"
  garmin_password_ssm_param       = "/aboutme/garmin/password"

  ssm_param_arn_prefix = "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter"
}

data "aws_caller_identity" "current" {}
