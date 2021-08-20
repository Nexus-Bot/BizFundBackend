const express = require("express")
const ProjectMaker = require("../models/projectMakerModel")
const auth = require("../middlewares/authProjectMaker")
// const { sendWelcomeMail, sendAccountDeleteMail } = require('../mail/account');

const router = express.Router()

//Create projectMaker in DB
router.post("/projectmakers", async (req, res) => {
    try {
        const projectMaker = new ProjectMaker(req.body)
        const projectMakerDoc = await projectMaker.save()
        const token = await projectMaker.generateAuthenticationToken()
        // sendWelcomeMail(projectMaker.name, projectMaker.email);
        res.status(201).send({ projectMakerDoc, token })
    } catch (error) {
        res.status(400).send(error)
    }
})

//LogIn projectMaker
router.post("/projectmakers/login", async (req, res) => {
    try {
        const projectMaker = await ProjectMaker.findByCredentials(
            req.body.email,
            req.body.password
        )

        const token = await projectMaker.generateAuthenticationToken()

        res.send({ projectMaker, token })
    } catch (error) {
        res.status(400).send(error.message)
    }
})

//LogOut projectMaker from one session
router.post("/projectmakers/logout", auth, async (req, res) => {
    try {
        req.projectMaker.tokens = req.projectMaker.tokens.filter(
            (token) => token.token !== req.token
        )

        await req.projectMaker.save()

        res.status(200).send("Successfully logged out :)")
    } catch (error) {
        res.status(500).send({ error: "Error logging out!!!" })
    }
})

//LogOut projectMaker from all sessions
router.post("/projectmakers/logoutall", auth, async (req, res) => {
    try {
        req.projectMaker.tokens = []
        await req.projectMaker.save()

        res.status(200).send("Successfully logged out from all sessions :)")
    } catch (error) {
        res.status(500).send({ error: "Error logging out!!!" })
    }
})

//Get all projectMakers in DB
router.get("/projectmakers", async (req, res) => {
    try {
        const projectmakers = await ProjectMaker.find({})
        if (!projectmakers) {
            res.status(404).send({ error: "ProjectMakers not found!!!" })
            return
        }

        res.send(projectmakers)
    } catch (error) {
        res.status(500).send(error)
    }
})

//Get current authenticated projectMaker
router.get("/projectmakers/me", auth, (req, res) => {
    res.send(req.projectMaker)
})

//Get projectMaker by ID from DB
router.get("/projectmakers/:id", auth, async (req, res) => {
    try {
        const _id = req.params.id
        const projectMaker = await ProjectMaker.findById(_id)

        if (!projectMaker) {
            res.status(404).send({ error: "ProjectMaker not found!!!" })
            return
        }
        res.send(projectMaker)
    } catch (error) {
        res.status(500).send(error)
    }
})

//Update current authenticated projectMaker in DB
router.patch("/projectmakers/me", auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = [
        "firstName",
        "lastName",
        "displayName",
        "password",
        "photoURL",
        "metamaskAddress",
        "isVerified",
    ]

    const isValidUpdates = updates.every((update) =>
        allowedUpdates.includes(update)
    )

    if (!isValidUpdates) {
        res.status(400).send({ error: "invalid updates" })
        return
    }

    try {
        const projectMaker = req.projectMaker

        updates.forEach((update) => {
            projectMaker[update] = req.body[update]
        })

        const updatedProjectMaker = await projectMaker.save()

        res.send(updatedProjectMaker)
    } catch (error) {
        res.status(400).send(error)
    }
})

// After creating a project add the relevant project address in projectmakers array of projects
router.patch("/projectmaker/createproject", auth, async (req, res) => {
    try {
        const projectAddress = req.body.projectAddress
        if (!projectAddress) {
            res.status(400).send({ error: "invalid project address" })
            return
        }

        const projectMaker = req.projectMaker

        const projectIds = projectMaker.projectIds

        if (projectIds.includes(projectAddress)) {
            res.status(400).send({ error: "project address already included" })
            return
        }

        projectMaker.projectIds = [...projectIds, projectAddress]

        const updatedProjectMaker = await projectMaker.save()

        res.send(updatedProjectMaker)
    } catch (error) {
        res.status(400).send(error)
    }
})

//Delete current authenticated projectMaker from DB
router.delete("/projectmakers/me", auth, async (req, res) => {
    try {
        const _id = req.projectMaker._id
        const projectMaker = await ProjectMaker.findById(_id)
        if (!projectMaker) {
            res.status(404).send({ error: "ProjectMaker not found!!!" })
            return
        }

        const deletedProjectMaker = await projectMaker.remove()
        // sendAccountDeleteMail(deletedProjectMaker.name, deletedProjectMaker.email);
        res.send(deletedProjectMaker)
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router
