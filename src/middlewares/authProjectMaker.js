const jwt = require("jsonwebtoken")
const ProjectMaker = require("../models/projectMakerModel")

const auth = async (req, res, next) => {
    try {
        const secret = process.env.JWT_SECRET
        const token = req.header("Authorization").replace("Bearer ", "")
        const decoded = jwt.verify(token, secret)
        const projectMaker = await ProjectMaker.findOne({
            _id: decoded._id,
            "tokens.token": token,
        })

        if (!projectMaker)
            throw new Error({ error: "Authentication Failed!!!" })

        req.token = token
        req.projectMaker = projectMaker
        next()
    } catch (error) {
        res.status(401).send({ error: "Please authenticate" })
    }
}

module.exports = auth
