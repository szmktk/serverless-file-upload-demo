#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { FileUploadStack } from '../lib/file-upload-stack';

const app = new cdk.App();
new FileUploadStack(app, 'FileUploadStack');
