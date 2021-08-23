const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const bizFundraiserSchema = new mongoose.Schema(
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
            default: false,
        },
        isBizFundRaiser: {
            type: Boolean,
            default: true,
        },
        metamaskAddress: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
)

bizFundraiserSchema.methods.toJSON = function () {
    const user = this
    const userObj = user.toObject()

    delete userObj.password
    delete userObj.tokens

    return userObj
}

bizFundraiserSchema.methods.generateAuthenticationToken = async function () {
    const user = this
    const secret = process.env.JWT_SECRET
    const token = jwt.sign({ _id: user._id.toString() }, secret)

    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

bizFundraiserSchema.statics.findByCredentials = async (email, password) => {
    if (!email || !password) throw new Error("Invalid Credentials")

    const user = await BizFundraiser.findOne({ email })

    if (!user)
        throw new Error(`There is no account registered with ${email} address`)

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) throw new Error("Invalid Password")

    return user
}

//Hash the user password before saving in the database.
bizFundraiserSchema.pre("save", async function (next) {
    const user = this

    if (user.isModified("password"))
        user.password = await bcrypt.hash(user.password, 8)

    next()
})

// Delete the files related to user in firebase storage when user gets deleted
// bizFundraiserSchema.pre("remove", async function (next) {
// 	const user = this;
// 	await delete related files in firebase
// 	next();
// });

const BizFundraiser = mongoose.model("BizFundraiser", bizFundraiserSchema)

module.exports = BizFundraiser
