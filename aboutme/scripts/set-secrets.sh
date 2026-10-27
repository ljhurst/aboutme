#!/usr/bin/env bash
# Stores the Spotify and Garmin credentials the Lambdas read at runtime as SSM
# SecureStrings under /aboutme/. Values are read without echo and handed to the
# AWS CLI through a private temporary file, so they never appear on a command
# line, in shell history, or in Terraform. Run it again to rotate a value.
#
# Usage (in an interactive terminal, with credentials allowed to write SSM):
#   AWS_PROFILE=luke-hurst-admin aboutme/scripts/set-secrets.sh
set -euo pipefail

if [ ! -t 0 ]; then
  echo "Run this in an interactive terminal: it prompts for each value." >&2
  exit 1
fi

payload=$(mktemp)
trap 'rm -f "$payload"' EXIT

store() {
  local name=$1 label=$2 value
  read -rsp "${label}: " value
  echo
  if [ -z "$value" ]; then
    echo "Empty value; nothing written for ${name}." >&2
    return 1
  fi
  jq -n --arg name "$name" --arg value "$value" \
    '{Name: $name, Value: $value, Type: "SecureString", Overwrite: true}' >"$payload"
  aws ssm put-parameter --region us-east-1 --cli-input-json "file://$payload" >/dev/null
  echo "Stored ${name}"
}

store /aboutme/spotify/client-secret "Spotify client secret"
store /aboutme/spotify/refresh-token "Spotify refresh token"
store /aboutme/garmin/email "Garmin email"
store /aboutme/garmin/password "Garmin password"
