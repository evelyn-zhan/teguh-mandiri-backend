import express from "express"
import bodyParser from "body-parser"
import cors from "cors"
import mongoose from "mongoose"

import { DATABASE_URL } from "./utils/env"
import router from "./routes/api"

const app = express()

app.use(cors())
app.use(bodyParser.json())

mongoose
.connect(DATABASE_URL, { dbName: "teguh-mandiri" })
.then(() => console.log("Connected to database."))
.catch((error) => console.log(error))

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Server is running.",
        data: null
    })
})

app.use("/api", router)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server is running on port http://localhost:${PORT}`))