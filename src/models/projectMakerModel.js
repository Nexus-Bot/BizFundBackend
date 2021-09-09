const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const projectMakerSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        isVerified: { type: Boolean, default: false },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            validate(value) {
                if (!validator.isEmail(value))
                    throw new Error("Invalid Email address!!!")
            },
        },
        password: {
            type: String,
            required: true,
            trim: true,
        },
        tokens: [
            {
                token: {
                    type: String,
                    required: true,
                },
            },
        ],
        displayName: { type: String, trim: true },
        photoURL: {
            type: String,
        },
        isProjectMaker: {
            type: Boolean,
            default: true,
        },
        isBizFundRaiser: {
            type: Boolean,
            default: false,
        },
        metamaskAddress: {
            type: String,
            trim: true,
        },
        projectIds: [String],
    },
    { timestamps: true }
)

projectMakerSchema.methods.toJSON = function () {
    const user = this
    const userObj = user.toObject()

    delete userObj.password
    delete userObj.tokens

    return userObj
}

projectMakerSchema.methods.generateAuthenticationToken = async function () {
    const user = this
    const secret = process.env.JWT_SECRET
    const claims = {
        // Required claims for weavy
        exp: new Date().getTime() + 300 * 24 * 60 * 60,
        iss: process.env.WEAVY_CLIENT_ID,
        sub: user._id.toString(),

        // Optional claims for weavy
        email: user.email,
        name: user.firstName + " " + user.lastName,
        username: user.displayName,

        // Required claims for this backend
        _id: user._id.toString(),
    }
    const token = jwt.sign(claims, secret)

    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

projectMakerSchema.statics.findByCredentials = async (email, password) => {
    if (!email || !password) throw new Error("Invalid Credentials")

    const user = await ProjectMaker.findOne({ email })

    if (!user)
        throw new Error(`There is no account registered with ${email} address`)

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) throw new Error("Invalid Password")

    return user
}

//Hash the user password before saving in the database.
projectMakerSchema.pre("save", async function (next) {
    const user = this

    if (user.isModified("password"))
        user.password = await bcrypt.hash(user.password, 8)

    next()
})

// Delete all related milestones with projectMaker when user gets deleted
// projectMakerSchema.pre("remove", async function (next) {
// 	const user = this;
// 	await delete all related milestones with projectMaker
//  await delete the files related to user in firebase storage
// 	next();
// });

const ProjectMaker = mongoose.model("ProjectMaker", projectMakerSchema)

module.exports = ProjectMaker
