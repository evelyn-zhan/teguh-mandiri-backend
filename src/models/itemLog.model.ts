import mongoose from 'mongoose'

const Schema = mongoose.Schema

export interface IItemLog {
    itemId: string
    inQuantity: number
    outQuantity: number
    finalStock: number
    createdAt: string
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
        finalStock: {
            type: Schema.Types.Number,
        },
        createdAt: {
            type: Schema.Types.String,
            default: () => new Date().toISOString().split('T')[0]
        }
    }
)

ItemLogSchema.pre('save', async function (this: IItemLog) {
    this.itemId = this.itemId.toUpperCase()
})

const ItemLogModel = mongoose.model('ItemLog', ItemLogSchema)

export default ItemLogModel