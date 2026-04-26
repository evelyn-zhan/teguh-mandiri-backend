import mongoose from "mongoose"

const Schema = mongoose.Schema

export interface IItem {
    id: string
    name: string
    stock: number
}

const ItemSchema = new Schema<IItem>(
    {
        id: {
            type: Schema.Types.String,
            required: true
        },
        name: {
            type: Schema.Types.String,
            required: true
        },
        stock: {
            type: Schema.Types.Number,
            // required: true,
            default: 0
        }
    },
    {
        timestamps: false
    }
)

const ItemModel = mongoose.model("item", ItemSchema)

export default ItemModel