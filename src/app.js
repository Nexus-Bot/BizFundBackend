const express = require("express")
const { connectToDB } = require("./db/mongoose")
const bizFundraiserRouter = require("./routers/bizFundraiserRouter")
const projectMakerRouter = require("./routers/projectMakerRouter")
const milestoneRouter = require("./routers/milestoneRouter")
const cors = require("cors")

const getApp = async () => {
    //Connect to database
    await connectToDB()

    //Create configure express app
    const app = express()

    // Add express middlewares
    // //Site maintainance middleware
    // app.use((req, res, next) => {
    // 	res.status(503).send(
    // 		"Site is under maintainance, Please check back soon :)"
    // 	);
    // });

    const corsOptions = {
        origin: ["http://localhost:3000"],
        credentials: true, //access-control-allow-credentials:true
        optionSuccessStatus: 200,
    }
    //Add cors to app
    app.use(cors(corsOptions))

    //Add json body to response object
    app.use(express.json())

    //Attach routers to express server
    app.use(bizFundraiserRouter)
    app.use(projectMakerRouter)
    app.use(milestoneRouter)

    return app
}

module.exports = { getApp }
