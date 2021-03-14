#!/bin/sh

set -e
dir="$( cd "$( dirname "$0" )" && pwd )"

if ! command -v jq > /dev/null 2>&1; then
    echo "jq is not installed on your system. Please install it prior executing this." >&2
    exit 1
fi

promptUser () {
    # $1 message
    # $2 default value
    # returns selected valiue
    local res
    if [ -z "${2}" ]; then
        read -p "${1}: " res
        if [ -z "${res}" ]; then
            #echo "Value must not be empty! Please enter a valid value." >&2
            promptUser "${1}" "${2}"
            return 0
        fi
    else
        read -p "${1} [${2}]: " res
        if [ -z "${res}" ]; then
            res="${2}"
        fi
    fi
    echo "${res}"
    return 0
}

echo "Configuring the environment variables:"

JWT_SECRET="$(promptUser "JWT SECRET" "$JWT_SECRET")"
ADMIN_DEFAULT_USERNAME="$(promptUser "ADMIN_DEFAULT_USERNAME" "$ADMIN_DEFAULT_USERNAME")"
ADMIN_DEFAULT_PASSWORD="$(promptUser "ADMIN_DEFAULT_PASSWORD" "$ADMIN_DEFAULT_PASSWORD")"
CRON_EMAIL_RECEIVER="$(promptUser "CRON_EMAIL_RECEIVER" "$CRON_EMAIL_RECEIVER")"
MAILGUN_DOMAIN="$(promptUser "MAILGUN_DOMAIN" "$MAILGUN_DOMAIN")"
MAILGUN_API_KEY="$(promptUser "MAILGUN_API_KEY" "$MAILGUN_API_KEY")"
MAILGUN_FROM="$(promptUser "MAILGUN_FROM" "$MAILGUN_FROM")"
DATABASE_USER="$(promptUser "DATABASE_USER" "$DATABASE_USER")"
DATABASE_PASSWORD="$(promptUser "DATABASE_PASSWORD" "$DATABASE_PASSWORD")"

json_secrets=$(jq -n --arg JWT_SECRET "$JWT_SECRET" \
    --arg ADMIN_DEFAULT_USERNAME "$ADMIN_DEFAULT_USERNAME" \
    --arg ADMIN_DEFAULT_PASSWORD "$ADMIN_DEFAULT_PASSWORD" \
    --arg CRON_EMAIL_RECEIVER "$CRON_EMAIL_RECEIVER" \
    --arg MAILGUN_DOMAIN "$MAILGUN_DOMAIN" \
    --arg MAILGUN_API_KEY "$MAILGUN_API_KEY" \
    --arg MAILGUN_FROM "$MAILGUN_FROM" \
    --arg DATABASE_USER "$DATABASE_USER" \
    --arg DATABASE_PASSWORD "$DATABASE_PASSWORD" \
    "{
        JWT_SECRET: \$JWT_SECRET,
        ADMIN_DEFAULT_USERNAME: \$ADMIN_DEFAULT_USERNAME,
        ADMIN_DEFAULT_PASSWORD: \$ADMIN_DEFAULT_PASSWORD,
        CRON_EMAIL_RECEIVER: \$CRON_EMAIL_RECEIVER,
        MAILGUN_DOMAIN: \$MAILGUN_DOMAIN,
        MAILGUN_API_KEY: \$MAILGUN_API_KEY,
        MAILGUN_FROM: \$MAILGUN_FROM,
        DATABASE_USER: \$DATABASE_USER,
        DATABASE_PASSWORD: \$DATABASE_PASSWORD
    }")

if [ ! aws secretsmanager get-secret-value --secret-id "basma.com/test" > /dev/null 2>&1 ]; then
    res=$(aws secretsmanager create-secret --name "basma.com/test" \
    --secret-string "${json_secrets}" \
    --description "Basma.com test secrets ")
else
    echo "Secret already exists.. updating"
    res=$(aws secretsmanager update-secret --secret-id "basma.com/test" \
    --secret-string "${json_secrets}" \
    --description "Basma.com test secrets ")
fi

arn="$(echo "$res" | jq .ARN)"

echo "BASMA_SECRETS_ARN=${arn}" > "${dir}/../.env"

echo "Secrets created under ARN: ${arn}"