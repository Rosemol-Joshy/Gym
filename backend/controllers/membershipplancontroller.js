const membershipPlanModel = require("../models/membershipPlanModel");

// Add Membership Plan
const addMembershipPlan = async (req, res) => {
  try {
    const plan = await membershipPlanModel.createMembershipPlan(req.body);

    res.status(201).json({
      message: "Membership plan added successfully",
      plan,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Membership Plans
const getAllMembershipPlans = async (req, res) => {
  try {
    const plans = await membershipPlanModel.getAllMembershipPlans();

    res.status(200).json(plans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Membership Plan By ID
const getMembershipPlanById = async (req, res) => {
  try {
    const plan = await membershipPlanModel.getMembershipPlanById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        message: "Membership plan not found",
      });
    }

    res.status(200).json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Membership Plan
const updateMembershipPlan = async (req, res) => {
  try {
    const plan = await membershipPlanModel.updateMembershipPlan(
      req.params.id,
      req.body
    );

    if (!plan) {
      return res.status(404).json({
        message: "Membership plan not found",
      });
    }

    res.status(200).json({
      message: "Membership plan updated successfully",
      plan,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Membership Plan
const deleteMembershipPlan = async (req, res) => {
  try {
    const plan = await membershipPlanModel.deleteMembershipPlan(req.params.id);

    if (!plan) {
      return res.status(404).json({
        message: "Membership plan not found",
      });
    }

    res.status(200).json({
      message: "Membership plan deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addMembershipPlan,
  getAllMembershipPlans,
  getMembershipPlanById,
  updateMembershipPlan,
  deleteMembershipPlan,
};