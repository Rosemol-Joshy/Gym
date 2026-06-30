// backend/models/attendanceModel.js
// Mongoose schema for attendance records.
// References member_id as an ObjectId pointing to the Members collection.

const mongoose = require('mongoose');
const { Schema } = mongoose;

const attendanceSchema = new Schema(
    {
        member: {
            type: Schema.Types.ObjectId,
            ref: 'Member',          // assumes the Members module exports a 'Member' model
            required: true,
        },
        checkIn: {
            type: Date,
            required: true,
            default: Date.now,
        },
        checkOut: {
            type: Date,
            default: null,
        },
        date: {
            // stored as YYYY-MM-DD string for easy equality filtering / uniqueness
            type: String,
            required: true,
        },
        notes: {
            type: String,
            default: null,
            maxlength: 255,
        },
    },
    { timestamps: true } // adds createdAt / updatedAt automatically
);

// Prevent duplicate check-ins for the same member on the same day
attendanceSchema.index({ member: 1, date: 1 }, { unique: true });

// Virtual: duration in minutes (works for both active and completed sessions)
attendanceSchema.virtual('durationMinutes').get(function () {
    const end = this.checkOut || new Date();
    return Math.round((end - this.checkIn) / 60000);
});

attendanceSchema.set('toJSON', { virtuals: true });
attendanceSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Attendance', attendanceSchema);