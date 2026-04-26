import mongoose from "mongoose"
import { DATABASE_URL } from "./env"

const connect = async() => {
    try {
        await mongoose.connect(DATABASE_URL, { dbName: "teguh-mandiri" })
        return "Connected to database."
    }
    catch (error) {
        throw error
    }
}

export default connect