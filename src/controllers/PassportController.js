const {
  findOrCreateUserAndGenerateTokens,
} = require("../services/tokenService");
const { FRONTEND_URL } = require("../config/env");

const oauthSuccessHandler = async (req, res) => {
  try {
    const token = await findOrCreateUserAndGenerateTokens(req?.user?._json?.email, "user", req?.user?._json);
    res.redirect(`${FRONTEND_URL}/authenticating?token=${token}`);
    return;
  } catch (error) {
    console.error(error.message);
    res.redirect(`${FRONTEND_URL}/authenticating`);

  }
};

module.exports = {
  oauthSuccessHandler,
};
