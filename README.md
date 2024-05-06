# WooCom

* Infrastructure as Code: The stack resides in lib/woocom-aws-stack.ts where we can tell CloudFormation what cloud resources (with specific config) we want to provision. This is where we have DynamoDB and the S3 bucket setup right now.
* Lambda Functions: The lambda code will be in the lambdas folder. Any other new lambdas will follow this pattern (code in folder, lambda handler declaration in the stack.ts file).
* Database Operations: Further architecture will have lambdas using db clients to use DynamoDB (for insertions and read eg).
* Integration with AWS Amplify: To enhance our project's frontend and backend capabilities, we are integrating AWS Amplify. Amplify will help in setting up and deploying scalable applications with features like hosting, authentication, and API management:
* Frontend Deployment: We will utilize Amplify for continuous deployment (CD) of our frontend resources, hosting them in an S3 bucket and delivering via CloudFront.
* Backend APIs: Amplify will also be used to manage backend APIs created with API Gateway and AWS Lambda, ensuring seamless interaction with our frontend.

# WooCom - Sameer Quick Notes

* API Gateway: Needed for public facing APIs -- and for frontend. Can use CloudFront Edge CDNs for the frontend page load optimizations as well.
* Database Schema: Ensure the DB schema makes sense for DynamoDB and that our TypeScript wrappers are aligned with the type and we are enforcing it through the adapter code and components.
* Environment Stacks: 2 stacks, one for staging and production. We can also use a preview deploy GitHub action to deploy a preview branch to staging (AWS Staging stack) (option to have independent stacks for a self-contained stack for developers that doesn't touch staging but it just replicates it).
* Configuration and Permissions: The config is where we manage the IaC. New lambdas will be added here with all the correct permissions. We want to make sure access is only given to the deployment account to create IaC resources on GitHub. Using GitHub secrets, we will host our creds for staging and production accounts. But each individual developer will have their own IAM policies that will allow them to provision resources manually in the test account and by access request on development needs (eg senior dev needs to delete a faulty lambda not updating).
* Monitoring and Alerting: We can add managed monitoring and alerting through AWS. For example, if we reach a certain threshold of errors in a certain amount of time (like 500 errors are above 150 per minute) we can send out alerts.
* S3 Bucket Usage: The S3 bucket here is more for backend support, but if we were making a 3-tier application, likely using technologies like React, it makes more sense for the deploy/test cycles to be in that repository. The deploy would have a build step that drops the file into the S3 bucket serving the index.html + assets.
* Dockerization: For Dockerization, let's try to keep it as simple as possible and get developers using native package, but if we run into project complexities (eg multiple versions of Python), it'll make more sense to have use Docker for local dev and use similar Docker images for deployment (can potentially speed up deploy times - reduce costs too if we host our own images).