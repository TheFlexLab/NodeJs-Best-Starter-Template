const AWS = require("aws-sdk");
const {
  AWS_ACCESS_KEY,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
} = require("../config/env");

// Setup AWS S3
const s3 = new AWS.S3({
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION,
});

// Function to upload the file to S3
exports.uploadToS3 = async (fileBuffer, folderName, fileName, file) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME, // Your S3 bucket name
    Key: `${folderName}/${fileName}`, // Folder and file name in S3
    Body: fileBuffer, // The file's buffer data
    ContentType: "image/jpeg", // MIME type of the file
  };
  try {
    const data = await s3.upload(params).promise();
    return { url: data.Location };
  } catch (error) {
    console.log(error);
    throw error;
  }
};
