const express = require("express")
const Milestone = require("../models/milestoneModel")
const auth = require("../middlewares/authProjectMaker")

const router = express.Router()

//Create milestone in DB
router.post("/milestones", auth, async (req, res) => {
    try {
        const milestone = new Milestone({
            ...req.body,
            owner: req.projectMaker._id,
        })
        const milestoneDoc = await milestone.save()
        res.status(201).send(milestoneDoc)
    } catch (error) {
        res.status(400).send(error)
    }
})

//Get all milestones for a project from DB
router.get("/project/milestones/:projectId", async (req, res) => {
    const projectId = req.params.projectId

    try {
        const milestones = await Milestone.find({ projectId })
        if (!milestones) {
            res.status(404).send({ error: "Milestones not found!!!" })
            return
        }
        res.send(milestones)
    } catch (error) {
        res.status(500).send(error)
    }
})

//Get milestone by ID from DB
router.get("/milestones/:id", async (req, res) => {
    try {
        const _id = req.params.id
        const milestone = await Milestone.findOne({ _id })
        if (!milestone) {
            res.status(404).send({ error: "Milestone not found!!!" })
            return
        }
        res.send(milestone)
    } catch (error) {
        res.status(500).send(error)
    }
})

//Update milestone by ID for a authenticated projectMaker in DB
router.patch("/milestones/:id", auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = [
        "description",
        "title",
        "isCompleted",
        "isCancelled",
    ]

    const isValidUpdates = updates.every((update) =>
        allowedUpdates.includes(update)
    )

    if (!isValidUpdates) {
        res.status(400).send({ error: "invalid updates" })
        return
    }

    try {
        const _id = req.params.id
        const milestone = await Milestone.findOne({
            _id,
            owner: req.projectMaker._id,
        })

        if (!milestone) {
            res.status(404).send({ error: "Milestone not found!!!" })
            return
        }

        updates.forEach((update) => {
            milestone[update] = req.body[update]
        })

        const updatedMilestone = await milestone.save()

        res.send(updatedMilestone)
    } catch (error) {
        res.status(400).send(error)
    }
})

// After creating a request add the relevant requestIndex in milestone array of requestIds
router.patch("/project/milestones/createrequest", auth, async (req, res) => {
    try {
        const requestId = req.body.requestId
        const milestoneId = req.body.milestoneId
        if (!requestId) {
            res.status(400).send({ error: "invalid request Id" })
            return
        }

        if (!milestoneId) {
            res.status(400).send({ error: "invalid milestone Id" })
            return
        }

        const milestone = await Milestone.findOne({
            _id: milestoneId,
            owner: req.projectMaker._id,
        })

        if (!milestone) {
            res.status(400).send({ error: "invalid milestone Id" })
            return
        }

        const requestIds = milestone.requestIds

        if (requestIds.includes(requestId)) {
            res.status(400).send({ error: "request Id already included" })
            return
        }

        milestone.requestIds = [...requestIds, requestId]

        const updatedMilestone = await milestone.save()

        res.send(updatedMilestone)
    } catch (error) {
        res.status(400).send(error)
    }
})

// After removing a request remove the relevant requestIndex in milestone array of requestIds
router.patch("/project/milestones/deleterequest", auth, async (req, res) => {
    try {
        const requestId = req.body.requestId
        const milestoneId = req.body.milestoneId
        if (!requestId) {
            res.status(400).send({ error: "invalid request Id" })
            return
        }

        if (!milestoneId) {
            res.status(400).send({ error: "invalid milestone Id" })
            return
        }
        const milestone = await Milestone.findOne({
            _id: milestoneId,
            owner: req.projectMaker._id,
        })

        if (!milestone) {
            res.status(400).send({ error: "invalid milestone Id" })
            return
        }

        const requestIds = milestone.requestIds

        if (!requestIds.includes(requestId)) {
            res.status(400).send({ error: "request Id not included" })
            return
        }

        milestone.requestIds = requestIds.filter(
            (request) => request !== Number(requestId)
        )

        const updatedMilestone = await milestone.save()

        res.send(updatedMilestone)
    } catch (error) {
        res.status(400).send(error)
    }
})

//Delete milestone by ID for a authenticated projectMaker in DB
router.delete("/milestones/:id", auth, async (req, res) => {
    try {
        const _id = req.params.id
        const deletedMilestone = await Milestone.findOneAndDelete({
            _id,
            owner: req.projectMaker._id,
        })
        if (!deletedMilestone) {
            res.status(404).send({ error: "Milestone not found!!!" })
            return
        }

        res.send(deletedMilestone)
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router
