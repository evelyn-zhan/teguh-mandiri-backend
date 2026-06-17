import mongoose from "mongoose"

const Schema = mongoose.Schema

export interface IItem {
    _id: string
    name: string
    stock: number
}

const ItemSchema = new Schema<IItem>(
    {
        _id: {
            type: Schema.Types.String,
            required: true
        },
        name: {
            type: Schema.Types.String,
            required: true
        },
        stock: {
            type: Schema.Types.Number,
            default: 0
        }
    },
    {
        timestamps: false
    }
)

ItemSchema.pre("save", async function (this: IItem) {
    this._id = this._id.toUpperCase()
})

const ItemModel = mongoose.model("item", ItemSchema)

export default ItemModel