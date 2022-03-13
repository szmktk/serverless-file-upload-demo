import * as apigwv2 from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { CfnOutput, Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import * as path from 'path';


export class FileUploadStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const uploadBucket = new s3.Bucket(this, `${id}-uploadBucket`, {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      cors: [{
        allowedHeaders: ['*'],  // insecure, for illustrative purposes only
        allowedMethods: [
          s3.HttpMethods.GET,
          s3.HttpMethods.PUT,
          s3.HttpMethods.HEAD,
        ],
        allowedOrigins: ['*'],  // insecure, for illustrative purposes only
      }]
    })

    const getSignedUrlFunction = new NodejsFunction(this, `${id}-getSignedUrlFunction`, {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'handler',
      memorySize: 128,
      timeout: Duration.seconds(5),
      entry: path.join(__dirname, '../lambda/getSignedUrl.ts'),
      environment: {
        URL_EXPIRATION_SECONDS: '300',
        UPLOAD_BUCKET_NAME: uploadBucket.bucketName
      }
    });

    getSignedUrlFunction.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['s3:putObject'],
        resources: [`${uploadBucket.bucketArn}/*`]
      })
    )

    const httpApi = new apigwv2.HttpApi(this, `${id}-httpApi`, {
      description: 'ApiGateway API that invokes a function responsible for creating a pre-signed S3 url',
      corsPreflight: {
        allowHeaders: ['*'],  // insecure, for illustrative purposes only
        allowMethods: [
          apigwv2.CorsHttpMethod.GET,
          apigwv2.CorsHttpMethod.PUT,
          apigwv2.CorsHttpMethod.HEAD,
        ],
        allowOrigins:['*'],  // insecure, for illustrative purposes only
      },
    })

    httpApi.addRoutes({
      path: '/',
      methods: [apigwv2.HttpMethod.GET],
      integration: new HttpLambdaIntegration(id, getSignedUrlFunction),
    })

    new CfnOutput(this, id, {
      value: httpApi.url!,
    });
  }
}
