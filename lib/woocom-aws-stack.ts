import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as yaml from 'js-yaml';
import * as fs from 'fs';

export class WoocomAwsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    const config = yaml.load(fs.readFileSync('config.yml', 'utf8')) as any;

    // Determine the environment ('staging' or 'production') based on a command line argument or any other mechanism
    const envName = process.env.ENV_NAME || 'staging'; // Default to staging if not specified
    const envConfig = config[envName];

    super(scope, id, {
      env: {
        account: envConfig.account,
        region: envConfig.region,
      },
      ...props,
    });

    // S3 bucket for the frontend
    const frontendBucket = new s3.Bucket(this, 'WooCommerceFrontend', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: false,
      removalPolicy: RemovalPolicy.DESTROY, // Be cautious with this in production
    });

    // Lambda function for the backend
    const backendFunction = new lambda.Function(this, 'BackendHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('lib/lambdas'),
      handler: 'backend.handler',
    });

    // DynamoDB table for the database
    const table = new dynamodb.Table(this, 'WooCommerceData', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // IAM Role: Allow Lambda to access the DynamoDB table
    const lambdaDynamoPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['dynamodb:*'],
      resources: [table.tableArn],
    });
    backendFunction.addToRolePolicy(lambdaDynamoPolicy);

    // Optionally, if your Lambda needs to access the S3 bucket
    const lambdaS3Policy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['s3:GetObject', 's3:PutObject','s3:CreateBucket'],
      resources: ['*'],
    });
    backendFunction.addToRolePolicy(lambdaS3Policy);
  }
}
