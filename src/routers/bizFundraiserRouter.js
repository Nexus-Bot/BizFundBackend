const express = require("express")
const BizFundraiser = require("../models/bizFundraiserModel")
const auth = require("../middlewares/authBizFundraiser")
const jwt = require("jsonwebtoken")
const { sendActivationMailForBizFundraiser } = require("../mail/account")

const router = express.Router()

//Create bizFundraiser in DB
router.post("/bizfundraisers", async (req, res) => {
    try {
        const bizFundraiser = new BizFundraiser(req.body)
        const bizFundraiserDoc = await bizFundraiser.save()
        const token = await bizFundraiser.generateAuthenticationToken()
        sendActivationMailForBizFundraiser(bizFundraiserDoc)
        // sendWelcomeMail(bizFundraiser.name, bizFundraiser.email);
        res.status(201).send({ bizFundraiserDoc, token })
    } catch (error) {
        res.status(400).send(error)
    }
})

// Activate user with email activation link
router.get("/bizfundraiser/activate", async (req, res) => {
    try {
        const token = req.query.token
        const secret = process.env.JWT_SECRET
        const decoded = jwt.verify(token, secret)

        const bizFundraiser = await BizFundraiser.findOne({
            _id: decoded._id,
        })

        if (!bizFundraiser) {
            res.status(404).send("Invalid Link")
            return
        }

        bizFundraiser.isVerified = true
        const updatedBizFundraiser = await bizFundraiser.save()

        res.send(updatedBizFundraiser)
    } catch (error) {
        res.status(400).send(error)
    }
})

//LogIn bizFundraiser
router.post("/bizfundraisers/login", async (req, res) => {
    try {
        const bizFundraiser = await BizFundraiser.findByCredentials(
            req.body.email,
            req.body.password
        )

        const token = await bizFundraiser.generateAuthenticationToken()

        res.send({ bizFundraiser, token })
    } catch (error) {
        res.status(400).send(error.message)
    }
})

//LogIn using token for projectMaker
router.post("/bizfundraisers/login/token", auth, async (req, res) => {
    const bizFundraiser = req.bizFundraiser

    if (!bizFundraiser) {
        res.status(404).send("User not found")
        return
    }

    res.status(200).send(bizFundraiser)
})

//LogOut bizFundraiser from one session
router.post("/bizfundraisers/logout", auth, async (req, res) => {
    try {
        req.bizFundraiser.tokens = req.bizFundraiser.tokens.filter(
            (token) => token.token !== req.token
        )

        await req.bizFundraiser.save()

        res.status(200).send("Successfully logged out :)")
    } catch (error) {
        res.status(500).send({ error: "Error logging out!!!" })
    }
})

//LogOut bizFundraiser from all sessions
router.post("/bizfundraiserss/logoutall", auth, async (req, res) => {
    try {
        req.bizFundraiser.tokens = []
        await req.bizFundraiser.save()

        res.status(200).send("Successfully logged out from all sessions :)")
    } catch (error) {
        res.status(500).send({ error: "Error logging out!!!" })
    }
})

//Get all bizFundraisers in DB
router.get("/bizfundraisers", async (req, res) => {
    try {
        const bizfundraisers = await BizFundraiser.find({})
        if (!bizfundraisers) {
            res.status(404).send({ error: "BizFundraisers not found!!!" })
            return
        }

        res.send(bizfundraisers)
    } catch (error) {
        res.status(500).send(error)
    }
})

//Get current authenticated bizFundraiser
router.get("/bizfundraisers/me", auth, (req, res) => {
    res.send(req.bizFundraiser)
})

//Get bizFundraiser by ID from DB
router.get("/bizfundraisers/:id", async (req, res) => {
    try {
        const _id = req.params.id
        const bizFundraiser = await BizFundraiser.findById(_id)

        if (!bizFundraiser) {
            res.status(404).send({ error: "BizFundraiser not found!!!" })
            return
        }
        res.send(bizFundraiser)
    } catch (error) {
        res.status(500).send(error)
    }
})

// Get bizFundraiser by metamaskAddress from DB
router.get("/bizfundraisersbymetamask/:id", async (req, res) => {
    try {
        const metamaskAddress = req.params.id
        const bizFundraiser = await BizFundraiser.findOne({
            metamaskAddress,
        })

        if (!bizFundraiser) {
            res.status(404).send({ error: "ProjectMaker not found!!!" })
            return
        }
        res.send(bizFundraiser)
    } catch (error) {
        res.status(500).send(error)
    }
})

//Update current authenticated bizFundraiser in DB
router.patch("/bizfundraisers/me", auth, async (req, res) => {
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
        const bizFundraiser = req.bizFundraiser

        updates.forEach((update) => {
            bizFundraiser[update] = req.body[update]
        })

        const updatedBizFundraiser = await bizFundraiser.save()

        res.send(updatedBizFundraiser)
    } catch (error) {
        res.status(400).send(error)
    }
})

//Delete current authenticated bizFundraiser from DB
router.delete("/bizfundraisers/me", auth, async (req, res) => {
    try {
        const _id = req.bizFundraiser._id
        const bizFundraiser = await BizFundraiser.findById(_id)
        if (!bizFundraiser) {
            res.status(404).send({ error: "BizFundraiser not found!!!" })
            return
        }

        const deletedBizFundraiser = await bizFundraiser.remove()
        // sendAccountDeleteMail(deletedBizFundraiser.name, deletedBizFundraiser.email);
        res.send(deletedBizFundraiser)
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router
