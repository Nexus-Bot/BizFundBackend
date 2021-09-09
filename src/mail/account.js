const nodemailer = require("nodemailer")
const jwt = require("jsonwebtoken")

let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        type: "OAuth2",
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
        clientId: process.env.OAUTH_CLIENTID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN,
    },
})

const sendMailFromNM = (mailOptions) => {
    transporter.sendMail(mailOptions, function (err, data) {
        if (err) {
            console.log("Error " + err)
        } else {
            console.log("Email sent successfully")
        }
    })
}

const sendActivationMailForProjectMaker = async (user) => {
    const secret = process.env.JWT_SECRET
    const token = jwt.sign({ _id: user._id.toString() }, secret)
    let mailOptions = {
        from: "nexus.org.co@gmail.com",
        to: user.email,
        subject: "Activation mail",
        text: `Link to activate your account - \n ${process.env.BASE_URL}/projectmaker/activate?token=${token}`,
    }

    sendMailFromNM(mailOptions)
}

const sendActivationMailForBizFundraiser = async (user) => {
    const secret = process.env.JWT_SECRET
    const token = jwt.sign({ _id: user._id.toString() }, secret)
    let mailOptions = {
        from: "nexus.org.co@gmail.com",
        to: user.email,
        subject: "Activation mail",
        text: `Link to activate your account - \n ${process.env.BASE_URL}/bizfundraiser/activate?token=${token}`,
    }

    sendMailFromNM(mailOptions)
}

module.exports = {
    sendActivationMailForProjectMaker,
    sendActivationMailForBizFundraiser,
}
