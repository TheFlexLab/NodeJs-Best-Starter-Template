var cron = require("node-cron");

const FunctionToRun = async () => {
  try {
    return 1;
  } catch (error) {
    console.error("Error", error.message);
    return false;
  }
};

const cronInitialize = () => {
  console.log("Crons initialized successfully.");

  // Schedule the cron job to run every hour
  cron.schedule("0 * * * *", async () => {
    let success = false;

    while (!success) {
      success = await FunctionToRun();
      if (!success) {
        console.log("Retrying immediately...");
      }
    }

    console.log("setRates API responded with 200 OK.");
  });
};

module.exports = {
  cronInitialize,
};
