const AWS = require("aws-sdk");

module.exports.sendEmailMessage = async (
  subject,
  message,
  sender,
  receiver
) => {
  const SES_CONFIG = {
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  };

  const sesClient = new AWS.SES(SES_CONFIG);

  let receiverEmail = [receiver];

  if (sender !== undefined || sender !== "") {
    message = `${message}`;
  }

  let params = {
    Source: process.env.AWS_SES_SENDER,
    Destination: {
      ToAddresses: receiverEmail,
    },
    ReplyToAddresses: [],
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `${message}`,
        },
        Text: {
          Charset: "UTF-8",
          Data: "Verify Account",
        },
      },

      Subject: {
        Charset: "UTF-8",
        Data: `${subject}`,
      },
    },
  };

  try {
    const result = await sesClient.sendEmail(params).promise();
    if (!result) throw new Error("Mail Not Sent");
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
