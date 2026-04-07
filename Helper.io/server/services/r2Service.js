import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "../configs/r2Client.js";

export const getDocFromR2 = async (topic, file) => {

  const key = `${topic}/${file}`;
  

  const command = new GetObjectCommand({
    Bucket: "notes-docs",
    Key: key,
  });
  

  const response = await r2.send(command);

  const data = await response.Body.transformToString();
//   console.log(data)

  return data;
};