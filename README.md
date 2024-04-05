## WooCom 

- the stack resides in `lib/woocom-aws-stack.ts` where we can tell cloudformation what cloud resources(with specific config) we want to provision (IaC). This is where we have dyanmoDB and the s3 bucket setup right now.

- the lambda code will be in the lambdas folder. any other new lambdas will follow this pattern (code in folder, lambda handler declaration in the stack.ts file)

- futher architecutre will have lambdas using db clients to use dynamo (for insertions and read eg)


## WooCom - Sameer quick notes

* API gateway needed for public facing APIs -- and for frontend. Can use Cloudfront Edge CDNs for the frontend page load optimizations as well 


* Lets make sure the DB schema makes sense for Dynamo DB and that our typescript wrappers are aligned with the type and we are enforcing it thought the adapter code and components

*  2 stacks, one for staging and production. We can also use a preview deploy GitHub action deploy that can deploy a preview branch to staging (AWS Staging stack) (option to have independent stacks for a self contained stack for developers that doesn't touch staging but it just replicates it)


* The config is where we manage the IaC. If we need a new lambda it will be added here with all the correct permissions, we can have config here if we want it to be behind APIGateway or if we want to to run on a cron or read from s3 bucket drop events or SQS events etc. 


* We want to make sure access is only given to the deployment account to create IaC resources on GitHub. Using GitHub secrets we will host our creds for staging and production accounts. But each individual developer will have their own IAM policies that will allow them to provision resources mananaully in the test account and by access request on development needs (eg senior dev needs to delete a faulty lambda not updating)


* We can add managed monitoring and alerting through AWS. If we reach a certain threshold of errors in a certain amount of time (like 500 errors are above 150 per minute) we can send out alerts. for the dynamoDB (ors RDS if needed) we can add alerts with the CPU/MEM gets to high. for the s3 (frontend bucket) we can still use API Gateway and setup alerts on users trying to access the frontend pages. We can also use ghost inspector to see that we are getting the expected render.



* The s3 bucket here is more for backend support, but if we were making a 3 tier application, likely using technologies like React, it makes more sense for the deploy/test cycles to be in that repository. The deploy would have a build step that drops the file into the s3 bucket serving the index.html + assets. (eg `ENV=PROD run npm build `and `mv source_file target_s3_bucket`)


* For Dockerization, lets try to keep it as simple as possible and get developers using native package, but if we run into project complexities ( eg multiple version of python), it'll make more sense to have use docker for local dev and use similar docker images for deployment(can potentially speed up deploy times - reduce costs too if we host our own images).