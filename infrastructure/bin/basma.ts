#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { BasmaStack } from '../lib/basma-stack';
import * as dotenv from 'dotenv';

dotenv.config();

const app = new cdk.App();

new BasmaStack(app, "BasmaStack");