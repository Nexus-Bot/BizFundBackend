const jwt = require("jsonwebtoken")
const BizFundraiser = require("../models/bizFundraiserModel")

const auth = async (req, res, next) => {
    try {
        const secret = process.env.JWT_SECRET
        const token = req.header("Authorization").replace("Bearer ", "")
        const decoded = jwt.verify(token, secret)
        const bizFundraiser = await BizFundraiser.findOne({
            _id: decoded._id,
            "tokens.token": token,
        })

        if (!bizFundraiser)
            throw new Error({ error: "Authentication Failed!!!" })

        req.token = token
        req.bizFundraiser = bizFundraiser
        next()
    } catch (error) {
        res.status(401).send({ error: "Please authenticate" })
    }
}

module.exports = auth
