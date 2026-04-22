import { GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2, userR2 } from "../configs/r2Client.js";

export const getDocFromR2 = async (topic, file) => {
  const key = `${topic}/${file}`;

  const command = new GetObjectCommand({
    Bucket: "notes-docs",
    Key: key,
  });

  const response = await r2.send(command);
  const data = await response.Body.transformToString();
  return data;
};

export const getPersonalDocFromR2 = async (key) => {
  const command = new GetObjectCommand({
    Bucket: "notes",
    Key: key,
  });

  const response = await userR2.send(command);
  const data = await response.Body.transformToString();
  return data;
};

export const putDocToR2 = async (key, body) => {
  const command = new PutObjectCommand({
    Bucket: "notes",
    Key: key,
    Body: body,
    ContentType: "text/markdown",
  });

  await userR2.send(command);
  return true;
};

export const deleteDocFromR2 = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: "notes",
    Key: key,
  });

  await userR2.send(command);
  return true;
};

