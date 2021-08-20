const mongoose = require("mongoose")

const milestoneSchema = new mongoose.Schema(
    {
        projectId: { type: String, required: true, trim: true },
        milestoneIndex: { type: Number, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        isCompleted: { type: Boolean, default: false },
        isCancelled: { type: Boolean, default: false },
        requestIds: [Number],
    },
    { timestamps: true }
)

const Milestone = mongoose.model("Milestone", milestoneSchema)

module.exports = Milestone
