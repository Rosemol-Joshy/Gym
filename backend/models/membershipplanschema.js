const mongoose = require("mongoose");

const membershipPlanSchema = new mongoose.Schema(
    {
        plan_name: {
            type: String,
            required: true,
        },
        duration_months: {
            type: Number,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        description: {
            type: String,
        },
        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "MembershipPlan",
    membershipPlanSchema
);