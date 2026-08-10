import mongoose from 'mongoose'

const Schema = mongoose.Schema

export interface IItemLog {
    itemId: string
    inQuantity: number
    outQuantity: number
    createdAt: Date
}

const ItemLogSchema = new Schema<IItemLog>(
    {
        itemId: {
            type: Schema.Types.String,
            required: true
        },
        inQuantity: {
            type: Schema.Types.Number,
            required: true
        },
        outQuantity: {
            type: Schema.Types.Number,
            required: true
        },
        createdAt: {
            type: Schema.Types.Date,
            default: Date.now
        }
    }
)

ItemLogSchema.pre('save', async function (this: IItemLog) {
    this.itemId = this.itemId.toUpperCase()
})

const ItemLogModel = mongoose.model('ItemLog', ItemLogSchema)

export default ItemLogModel