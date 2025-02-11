const User = require("../models/userModel");

/**
 * List users with search and filter options
 */
const listUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, name, from, to, status } = req.query;
    const startDate = req.query.dateRange?.from;
    const endDate = req.query.dateRange?.to;

    const filters = { role: "user" };

    if (name) {
      filters["kyc.name"] = { $regex: name, $options: "i" };
    }

    if (startDate) {
      filters["kyc.dateOfBirth"] = {
        ...filters["kyc.dateOfBirth"],
        $gte: new Date(startDate),
      };
    }

    if (endDate) {
      filters["kyc.dateOfBirth"] = {
        ...filters["kyc.dateOfBirth"],
        $lte: new Date(endDate),
      };
    }

    if (status) {
      filters.status = { $regex: status, $options: "i" };
    }

    const skip = (page - 1) * limit;

    // Query for users with applied filters
    const users = await User.find(filters).skip(skip).limit(Number(limit));

    // Transform the user data to the desired format
    const formattedUsers = users.map((user) => ({
      _id: user._id,
      email: user.email,
      name: user.kyc?.name || "N/A",
      location: user.kyc?.address || "N/A",
      keyStatus: user.status,
      dateOfBirth: user.kyc?.dateOfBirth || "N/A",
      kycStatus: user.kyc?.status || "N/A",
      document: user.kyc?.document || "N/A",
      selfie: user.kyc?.selfie || "N/A",
    }));

    const totalCount = await User.countDocuments(filters);

    res.status(200).json({
      success: true,
      data: formattedUsers,
      pagination: {
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Change user status (Active/Inactive)
 */
const changeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Active", "Inactive"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const user = await User.findByIdAndUpdate(id, { status }, { new: true });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get user detail by ID
 */
const getUserDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUserDetail, changeStatus, listUsers };
