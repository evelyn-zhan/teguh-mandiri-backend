import express from "express"
import bodyParser from "body-parser"
import cors from "cors"

import connectToDb from "./utils/database"
import router from "./routes/api"

const app = express()

app.use(cors())
app.use(bodyParser.json())

connectToDb()
.then((message) => console.log(message))
.catch((error) => console.log(error))

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Server is running.",
        data: null
    })
})

app.use("/api", router)

export default app

if (!process.env.VERCEL) {
    const PORT = 3000
    app.listen(PORT, () => {
        console.log(`http://localhost:${PORT}`)
    })
}

// async function init() {
//     try {
//         const dbConnection = await connectToDb()
//         console.log(dbConnection)

//         const app = express()
//         const PORT = process.env.PORT || 3000

//         app.use(cors())
//         app.use(bodyParser.json())

//         app.get("/", (req, res) => {
//             res.status(200).json({
//                 message: "Server is running.",
//                 data: null
//             })
//         })

//         app.use("/api", router)

//         app.listen(PORT, () => {
//             console.log(`Server is running on http://localhost:${PORT}`)
//         })
//     }
//     catch (error) {
//         console.log(error)
//     }
// }

// init()