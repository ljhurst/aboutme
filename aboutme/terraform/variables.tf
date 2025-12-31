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

variable "spotify_client_secret" {
  description = "Spotify Client Secret"
  type        = string
  sensitive   = true
}

variable "spotify_access_token" {
  description = "Spotify Access Token"
  type        = string
  sensitive   = true
}

variable "spotify_refresh_token" {
  description = "Spotify Refresh Token"
  type        = string
  sensitive   = true
}
