import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as ec2 from "@aws-cdk/aws-ec2";
import * as rds from "@aws-cdk/aws-rds";
import * as elasticbeanstalk from '@aws-cdk/aws-elasticbeanstalk';
import * as s3Assets from '@aws-cdk/aws-s3-assets';
import { ISecret, Secret } from "@aws-cdk/aws-secretsmanager";
import { SecretValues, fields } from './secrets';
import { join as joinPath } from 'path';

export class BasmaStack extends cdk.Stack {
  private bucket: s3.Bucket;
  private vpc: ec2.Vpc;
  private secret: ISecret;
  private rdsInstance: rds.DatabaseInstance;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    this.createVpc();
    this.createBucket();
    this.createRdsInstance();
    this.createEbs();
  }

  private createBucket() {
    this.bucket = new s3.Bucket(this, 'UsersBucket', {
      bucketName: 'basma-users-images',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    });
  }

  private createVpc() {
    this.vpc = new ec2.Vpc(this, "VPC");
  }

  private createRdsInstance() {
    if (! this.vpc) {
      throw new Error("VPC must be initialized!");
    }
    this.rdsInstance = new rds.DatabaseInstance(this, "Postgres", {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_12_4,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      vpc: this.vpc,
      vpcPlacement: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      storageType: rds.StorageType.GP2,
      deletionProtection: false,
      databaseName: (this.getSecretValue(fields.databaseUser)).toString(),
      port: 3306,
      credentials: {
        username: (this.getSecretValue(fields.databaseUser)).toString(),
        password: this.getSecretValue(fields.databasePassword),
      },
    });

    this.rdsInstance.connections.allowDefaultPortFromAnyIpv4();
    this.rdsInstance.connections.allowDefaultPortInternally();
  }

  private createEbs() {
    const environmentVariables = this.getAllSecretValues();

    const secretEnvironmentOptions = ((Object.keys(environmentVariables) as Array<keyof SecretValues>).map(
      (variable) => {
        return {
          namespace: "aws:elasticbeanstalk:application:environment",
          optionName: variable,
          value: environmentVariables[variable].toString(),
        };
      }
    ));

    const environmentOptions = [
      {
        namespace: "aws:elasticbeanstalk:application:environment",
        optionName: "DATABASE_HOST",
        value: this.rdsInstance.instanceEndpoint.hostname.toString(),
      },
      {
        namespace: "aws:elasticbeanstalk:application:environment",
        optionName: "DATABASE_PORT",
        value: "3306",
      },
      {
        namespace: "aws:elasticbeanstalk:application:environment",
        optionName: "PORT",
        value: "80",
      }
    ];

    const applicationName = "Basma";

    const assets = new s3Assets.Asset(this, `${applicationName}-assets`, {
      path: joinPath(__dirname, "/../.."),
      exclude: ["node_modules", "infrastructure", ".git"],
    });

    const application = new elasticbeanstalk.CfnApplication(this, `${applicationName}-app`, {
      applicationName,
    });

    const appVersionProps = new elasticbeanstalk.CfnApplicationVersion(
      this,
      `${applicationName}-version`,
      {
        applicationName,
        sourceBundle: {
          s3Bucket: assets.s3BucketName,
          s3Key: assets.s3ObjectKey,
        },
      }
    );

    const options: elasticbeanstalk.CfnEnvironment.OptionSettingProperty[] = [
      {
        namespace: "aws:autoscaling:launchconfiguration",
        optionName: "IamInstanceProfile",
        value: "aws-elasticbeanstalk-ec2-role",
      },
      {
        namespace: "aws:ec2:instances",
        optionName: "InstanceTypes",
        value: "t3.small",
      },
      {
        namespace: "aws:elasticbeanstalk:container:nodejs",
        optionName: "NodeCommand",
        value: "npm start"
      },
      // none does not work
      // {
      //   namespace: "aws:elasticbeanstalk:container:nodejs",
      //   optionName: "ProxyServer",
      //   value: "none"
      // }
    ];

    const env = new elasticbeanstalk.CfnEnvironment(this, `${applicationName}-environment`, {
      environmentName: "develop",
      applicationName: application.applicationName || applicationName,
      solutionStackName: "64bit Amazon Linux 2 v5.3.0 running Node.js 14",
      optionSettings: [
        ...options,
        ...secretEnvironmentOptions,
        ...environmentOptions
      ],
      versionLabel: appVersionProps.ref,
    });

    env.addDependsOn(application);
    appVersionProps.addDependsOn(application);
  }

  private retrieveSecret() {
    if (! process.env.BASMA_SECRETS_ARN) {
      throw new Error(
        "environment variable BASMA_SECRETS_ARN is not set! " +
        "please run 'yarn setup:secrets' to create the secret and export its ARN"
      );
    }
    this.secret = Secret.fromSecretCompleteArn(
      this,
      "BasmaSecrets",
      process.env.BASMA_SECRETS_ARN
    );
    return this.secret;
  }

  private getSecret() {
    if (this.secret) {
      return this.secret;
    }
    return this.retrieveSecret();
  }

  private getSecretValue(fieldName: string): cdk.SecretValue {
    const secret = this.getSecret();
    return secret.secretValueFromJson(fieldName);
  }

  private getAllSecretValues(): SecretValues {
    const result: Record<string, cdk.SecretValue> = {};
    const fieldNames = Object.values(fields);
    for (let i = 0; i < fieldNames.length; i++) {
      result[fieldNames[i]] = this.getSecretValue(fieldNames[i]);
    }
    return (result as unknown) as SecretValues;
  }
}