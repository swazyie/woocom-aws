#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { WoocomAwsStack } from '../lib/woocom-aws-stack';

const app = new cdk.App();
new WoocomAwsStack(app, 'WoocomAwsStack');
