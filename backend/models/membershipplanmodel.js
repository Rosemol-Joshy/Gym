const MembershipPlan = require("./membershipplanschema");

const createMembershipPlan = async (planData) => {
  return await MembershipPlan.create(planData);
};

const getAllMembershipPlans = async () => {
  return await MembershipPlan.find();
};

const getMembershipPlanById = async (id) => {
  return await MembershipPlan.findById(id);
};

const updateMembershipPlan = async (id, planData) => {
  return await MembershipPlan.findByIdAndUpdate(id, planData, {
    new: true,
  });
};

const deleteMembershipPlan = async (id) => {
  return await MembershipPlan.findByIdAndDelete(id);
};

module.exports = {
  createMembershipPlan,
  getAllMembershipPlans,
  getMembershipPlanById,
  updateMembershipPlan,
  deleteMembershipPlan,
};