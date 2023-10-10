import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { AwsExampleStackProps } from "../bin/aws-example";
import { ARecord, HostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import {
  DomainName,
  HttpApi,
  HttpMethod,
  SecurityPolicy,
} from "@aws-cdk/aws-apigatewayv2-alpha";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { ApiGatewayv2DomainProperties } from "aws-cdk-lib/aws-route53-targets";
import { IpAddresses, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import { DockerImageCode, DockerImageFunction } from "aws-cdk-lib/aws-lambda";
import { Repository } from "aws-cdk-lib/aws-ecr";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";

export class AwsExampleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AwsExampleStackProps) {
    super(scope, id, props);

    const vpc = new Vpc(this, "VPC", {
      vpcName: "VpcName",
      ipAddresses: IpAddresses.cidr("10.0.0.0/16"),
      subnetConfiguration: [
        { name: 'Public', cidrMask: 24, subnetType: SubnetType.PUBLIC },
        {
          name: 'Private',
          cidrMask: 24,
          subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          name: 'Isolated',
          cidrMask: 24,
          subnetType: SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    const hostedZoned = HostedZone.fromHostedZoneAttributes(
      this,
      "HostedZone",
      {
        zoneName: props.domainName,
        hostedZoneId: props.hostedZoneId,
      }
    );

    const domainName = new DomainName(this, "DomainName", {
      domainName: props.domainName,
      certificate: Certificate.fromCertificateArn(
        this,
        "Certificate",
        props.certArn
      ),
      securityPolicy: SecurityPolicy.TLS_1_2,
    });

    new ARecord(this, "DnsRecord", {
      zone: hostedZoned,
      recordName: props.domainName,
      target: RecordTarget.fromAlias(
        new ApiGatewayv2DomainProperties(
          domainName.regionalDomainName,
          domainName.regionalHostedZoneId
        )
      ),
    });

    const lambda = new DockerImageFunction(this, "LambdaFunction", {
      functionName: "FunctionName",
      code: DockerImageCode.fromEcr(
        Repository.fromRepositoryName(
          this,
          "LambdaRepository",
          props.lambdaRepository
        ),
        { tagOrDigest: "latest" }
      ),
    });

    const gateway = new HttpApi(this, "HttpApiGateway", {
      disableExecuteApiEndpoint: true,
      defaultDomainMapping: {
        domainName,
      },
    });

    gateway.addRoutes({
      path: "/api/v1/test",
      methods: [HttpMethod.POST],
      integration: new HttpLambdaIntegration("LambdaIntegration", lambda),
    });
  }
}