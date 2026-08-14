import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { config } from "../config.js";

const client = new S3Client({ region: config.awsRegion });

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export async function downloadObject(bucket, key) {
  const response = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  return streamToBuffer(response.Body);
}
