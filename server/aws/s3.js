const AWS = require("aws-sdk");

// RENAME THIS TO THE NAME OF YOUR BUCKET
const NAME_OF_BUCKET = "aws-s3-express-react-demo";

if (process.env.NODE_ENV !== "production") {
  // make a `credentials.json` file in the root of your server folder that looks like this:
  /*
  {
    {
      "accessKeyId": "<YOUR AWS ACCESS ID>",
      "secretAccessKey": "<YOUR AWS SECRET KEY>",
      "region": "us-east-1"
    }
  }
  */
  AWS.config.loadFromPath("./credentials.json");
}
// else {
//  make sure to set environment variables in production for:
//  AWS_ACCESS_KEY_ID
//  AWS_SECRET_ACCESS_KEY
//  and aws will automatically use those environment variables
// }
const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

const singlePublicFileUpload = async (file) => {
  const { filename, mimetype, createReadStream } = await file;
  const fileStream = createReadStream();
  const path = require("path");
  // name of the file in your S3 bucket will be the date in ms plus the extension name
  const Key = new Date().getTime().toString() + path.extname(filename);
  const uploadParams = {
    Bucket: NAME_OF_BUCKET,
    Key,
    Body: fileStream,
    ACL: "public-read"
  };
  const result = await s3.upload(uploadParams).promise();

  // save the name of the file in your bucket as the key in your database to retrieve for later
  return result.Location;
};

const multiplePublicFileUpload = async files => {
  return await Promise.all(
    files.map(file => {
      return singlePublicFileUpload(file);
    })
  );
};

const singlePrivateFileUpload = async (file) => {
  const { filename, mimetype, createReadStream } = await file;
  const fileStream = createReadStream();
  const path = require("path");
  // name of the file in your S3 bucket will be the date in ms plus the extension name
  const Key = new Date().getTime().toString() + path.extname(filename);
  const uploadParams = {
    // name of your bucket here
    Bucket: NAME_OF_BUCKET,
    Key,
    Body: fileStream
  };
  const result = await s3.upload(uploadParams).promise();

  // save the name of the file in your bucket as the key in your database to retrieve for later
  return result.Key;
};

const multiplePrivateFileUpload = (files) => {
  return Promise.all(files.map(file => {
    return singlePrivateFileUpload(file);
  }));
};

const retrievePrivateFile = (key) => {
  let fileUrl;
  if (key) {
    fileUrl = s3.getSignedUrl("getObject", {
      Bucket: NAME_OF_BUCKET,
      Key: key
    });
  }
  return fileUrl || key;
};

module.exports = {
  s3,
  singlePublicFileUpload,
  multiplePublicFileUpload,
  singlePrivateFileUpload,
  multiplePrivateFileUpload,
  retrievePrivateFile
};