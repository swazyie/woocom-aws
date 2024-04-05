import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as WoocomAws from '../lib/woocom-aws-stack';

test('S3 Bucket, Lambda Function, and DynamoDB Table Created', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new WoocomAws.WoocomAwsStack(app, 'MyTestStack');
  // THEN
  const template = Template.fromStack(stack);

  // Check for S3 bucket with corrected WebsiteConfiguration property
  template.resourceCountIs('AWS::S3::Bucket', 1);
  template.hasResourceProperties('AWS::S3::Bucket', {
    WebsiteConfiguration: {
      IndexDocument: 'index.html'
    }
  });

  // Check for Lambda function
  template.resourceCountIs('AWS::Lambda::Function', 1);
  template.hasResourceProperties('AWS::Lambda::Function', {
    Handler: 'backend.handler',
    Runtime: 'nodejs20.x'
  });

  // Check for DynamoDB table
  template.resourceCountIs('AWS::DynamoDB::Table', 1);
  template.hasResourceProperties('AWS::DynamoDB::Table', {
    BillingMode: 'PAY_PER_REQUEST',
    KeySchema: [
      {
        AttributeName: 'id',
        KeyType: 'HASH'
      }
    ]
  });
});



// test('S3 Bucket, Lambda Function, and DynamoDB Table Created', () => {
//   const app = new cdk.App();
//   // WHEN
//   const stack = new WoocomAws.WoocomAwsStack(app, 'MyTestStack');
//   // THEN
//   const template = Template.fromStack(stack);

//   // Check for S3 bucket
//   template.resourceCountIs('AWS::S3::Bucket', 1);
//   template.hasResourceProperties('AWS::S3::Bucket', {
//     WebsiteIndexDocument: 'index.html'
//   });

//   // Check for Lambda function
//   template.resourceCountIs('AWS::Lambda::Function', 1);
//   template.hasResourceProperties('AWS::Lambda::Function', {
//     Handler: 'backend.handler',
//     Runtime: 'nodejs20.x'
//   });

//   // Check for DynamoDB table
//   template.resourceCountIs('AWS::DynamoDB::Table', 1);
//   template.hasResourceProperties('AWS::DynamoDB::Table', {
//     BillingMode: 'PAY_PER_REQUEST',
//     KeySchema: [
//       {
//         AttributeName: 'id',
//         KeyType: 'HASH'
//       }
//     ]
//   });
// });
