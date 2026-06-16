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
            default: 0
        }
    },
    {
        _id: false,
        timestamps: false
    }
)

ItemSchema.pre("save", async function (this: IItem) {
    this.id = this.id.toUpperCase()
})

const ItemModel = mongoose.model("item", ItemSchema)

export default ItemModel