import { object, string, SchemaOf } from 'yup';
import * as cdk from '@aws-cdk/core';

export const fields = {
  jwtSecret: "JWT_SECRET",
  adminDefaultUsername: "ADMIN_DEFAULT_USERNAME",
  adminDefaultPassword: "ADMIN_DEFAULT_PASSWORD",
  cronEmailReceiver: "CRON_EMAIL_RECEIVER",
  mailgunReceiver: "MAILGUN_DOMAIN",
  mailgunApiKey: "MAILGUN_API_KEY",
  mailgunFrom: "MAILGUN_FROM",
  databaseUser: "DATABASE_USER",
  databasePassword: "DATABASE_PASSWORD"
};

export interface SecretValues {
  JWT_SECRET: cdk.SecretValue,
  ADMIN_DEFAULT_USERNAME: cdk.SecretValue,
  ADMIN_DEFAULT_PASSWORD: cdk.SecretValue,
  CRON_EMAIL_RECEIVER: cdk.SecretValue,
  MAILGUN_DOMAIN: cdk.SecretValue,
  MAILGUN_API_KEY: cdk.SecretValue,
  MAILGUN_FROM: cdk.SecretValue,
  DATABASE_USER: cdk.SecretValue,
  DATABASE_PASSWORD: cdk.SecretValue
}

export interface Secrets {
  JWT_SECRET: string,
  ADMIN_DEFAULT_USERNAME: string,
  ADMIN_DEFAULT_PASSWORD: string,
  CRON_EMAIL_RECEIVER: string,
  MAILGUN_DOMAIN: string,
  MAILGUN_API_KEY: string,
  MAILGUN_FROM: string,
  DATABASE_USER: string,
  DATABASE_PASSWORD: string
}

export const secretsSchema: SchemaOf<Secrets> = object({
  JWT_SECRET: string().required(),
  ADMIN_DEFAULT_USERNAME: string().required(),
  ADMIN_DEFAULT_PASSWORD: string().required(),
  CRON_EMAIL_RECEIVER: string().required().email(),
  MAILGUN_DOMAIN: string().required(),
  MAILGUN_API_KEY: string().required(),
  MAILGUN_FROM: string().required(),
  DATABASE_USER: string().required(),
  DATABASE_PASSWORD: string().required()
});
