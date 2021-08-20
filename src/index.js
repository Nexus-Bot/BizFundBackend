const { getApp } = require("./app")

const startApp = async () => {
    try {
        //Set port from environment variabale
        const port = process.env.PORT
        const app = await getApp()

        //Start the server on port
        app.listen(port, () => {
            console.log("Server is up and running on port " + port)
        })
    } catch (error) {
        console.log(error)
    }
}

startApp()
