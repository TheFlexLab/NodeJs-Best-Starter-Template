const generateOtp = () => {
  const value = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Expires in 5 minutes
  return { value, expiresAt };
};

module.exports = { generateOtp };
