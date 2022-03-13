import { v4 as uuid } from 'uuid';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as process from "process";

const uploadBucket: string = process.env.UPLOAD_BUCKET_NAME as string
const urlExpirationSeconds: number = parseInt(process.env.URL_EXPIRATION_SECONDS as string)
const s3client = new S3Client({});

export const handler = async (event: any): Promise<string> => {
  console.log('Event: ', event)
  return await getUploadURL()
}

const getUploadURL = async () => {
  const key = `${uuid()}.txt`

  const command = new PutObjectCommand({
    Bucket: uploadBucket,
    Key: key
  });
  const url = await getSignedUrl(s3client, command, {expiresIn: urlExpirationSeconds})

  return JSON.stringify({
    uploadUrl: url,
    Key: key
  })
}
