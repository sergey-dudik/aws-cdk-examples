#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { AwsExampleStack } from "../lib/aws-example-stack";
import { StackProps } from "aws-cdk-lib";

const domainName = "aws-example.xyz";
const hostedZoneId = "Z01395012LPLFQI32IEEA";
const certArn =
  "arn:aws:acm:us-east-1:988135634994:certificate/496295d2-317a-4622-85a2-4cc5b6ea6519";
const lambdaRepository = "111122223333.dkr.ecr.us-east-1.amazonaws.com";

export interface AwsExampleStackProps extends StackProps {
  domainName: string;
  hostedZoneId: string;
  certArn: string;
  lambdaRepository: string;
}

const app = new cdk.App();
new AwsExampleStack(app, "AwsExampleStack", {
  domainName,
  hostedZoneId,
  certArn,
  lambdaRepository,
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});
