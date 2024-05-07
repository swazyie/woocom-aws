# WooCom
### running
`aws configure`
`npm install -g aws-cdk`
`npm install`
`npm run build`
`cdk deploy `
### test
`npm test`

* optional: synthesize the CloudFormation template from cdk
`cdk synth`

### notes
* Infrastructure as Code: The stack resides in lib/woocom-aws-stack.ts where we can tell CloudFormation what cloud resources (with specific config) we want to provision. This is where we have DynamoDB and the S3 bucket setup right now.
* Lambda Functions: The lambda code will be in the lambdas folder. Any other new lambdas will follow this pattern (code in folder, lambda handler declaration in the stack.ts file).
* Database Operations: Further architecture will have lambdas using db clients to use DynamoDB (for insertions and read eg).
* Frontend Deployment: We will utilize Amplify for continuous deployment (CD) of our frontend resources, hosting them in an S3 bucket and delivering via CloudFront. (just s3 in this example)
* Backend APIs: api gateway authenticates and handles routing to lambda. lambda has specifc iam policies when calling actions to dynamoDB table.
* Within VPC - Lambda Function Execution Roles: now we are within the VPC, specific managed policies are added to the service roles associated with the Lambda functions:
    * `AWSLambdaVPCAccessExecutionRole`: Grants the necessary permissions for Lambda functions to execute within a VPC, ensuring secure network interactions and access control when connecting to other AWS services like RDS or ElastiCache inside a VPC.
    * `AWSLambdaBasicExecutionRole`: Provides permissions for Lambda functions to log to Amazon CloudWatch, which is vital for monitoring function execution and debugging issues.
* User Authentication and API Access Control: use AWS Cognito for user management. All API requests must include a valid JWT token provided upon user authentication. Managed service also includes sign-ups, sign-in, and securing API access.
# WooCom - Sameer Quick Notes

* API Gateway: Needed for public facing APIs -- and for frontend. Can use CloudFront Edge CDNs for the frontend page load optimizations as well.
* Database Schema: Ensure the DB schema makes sense for DynamoDB and that our TypeScript wrappers are aligned with the type and we are enforcing it through the adapter code and components.
* Environment Stacks: 2 stacks, one for staging and production. We can also use a preview deploy GitHub action to deploy a preview branch to staging (AWS Staging stack) (option to have independent stacks for a self-contained stack for developers that doesn't touch staging but it just replicates it).
* Configuration and Permissions: The config is where we manage the IaC. New lambdas will be added here with all the correct permissions. We want to make sure access is only given to the deployment account to create IaC resources on GitHub. Using GitHub secrets, we will host our creds for staging and production accounts. But each individual developer will have their own IAM policies that will allow them to provision resources manually in the test account and by access request on development needs (eg senior dev needs to delete a faulty lambda not updating).
* Monitoring and Alerting: We can add managed monitoring and alerting through AWS. For example, if we reach a certain threshold of errors in a certain amount of time (like 500 errors are above 150 per minute) we can send out alerts.
* S3 Bucket Usage: The S3 bucket here is more for backend support, but if we were making a 3-tier application, likely using technologies like React, it makes more sense for the deploy/test cycles to be in that repository. The deploy would have a build step that drops the file into the S3 bucket serving the index.html + assets.
* Dockerization: For Dockerization, let's try to keep it as simple as possible and get developers using native package, but if we run into project complexities (eg multiple versions of Python), it'll make more sense to have use Docker for local dev and use similar Docker images for deployment (can potentially speed up deploy times - reduce costs too if we host our own images).