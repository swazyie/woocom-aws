import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as yaml from 'js-yaml';
import * as fs from 'fs';

export class WoocomAwsStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        const config = yaml.load(fs.readFileSync('config.yml', 'utf8')) as any;
        const envName = process.env.ENV_NAME || 'staging'; // Default to staging if not specified
        const envConfig = config[envName];

        super(scope, id, {
            env: {
                account: envConfig.account,
                region: envConfig.region,
            },
            ...props,
        });

        // Create a VPC
        const vpc = new ec2.Vpc(this, 'WoocomVPC', {
            maxAzs: 3 // Default is all AZs in the region
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
            vpc,
        });

        // DynamoDB table for the database
        const table = new dynamodb.Table(this, 'WooCommerceData', {
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        });

        // IAM Role: Allow Lambda to access the DynamoDB table
        backendFunction.addToRolePolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['dynamodb:*'],
            resources: [table.tableArn],
        }));

        // Create a Cognito user pool
        const userPool = new cognito.UserPool(this, 'WoocomUserPool', {
            selfSignUpEnabled: true,
            userVerification: {
                emailSubject: 'Verify your email for our app!',
                emailBody: 'Thanks for signing up to our app! Your verification code is {####}',
                emailStyle: cognito.VerificationEmailStyle.CODE
            },
            signInAliases: {
                email: true
            }
        });

        // Create a Cognito user pool client
        const userPoolClient = new cognito.UserPoolClient(this, 'WoocomUserPoolClient', {
            userPool,
        });

        // API Gateway with Cognito User Pool Authorizer
        const api = new apigateway.LambdaRestApi(this, 'WoocomApi', {
            handler: backendFunction,
            proxy: false, // Important: Disable default proxy behavior
        });

        const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
            cognitoUserPools: [userPool]
        });

        const items = api.root.addResource('items');
        items.addMethod('GET', new apigateway.LambdaIntegration(backendFunction), {
            authorizer: authorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });
        items.addMethod('POST', new apigateway.LambdaIntegration(backendFunction), {
            authorizer: authorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });
    }
}
