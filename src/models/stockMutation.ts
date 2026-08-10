import mongoose from 'mongoose'

const Schema = mongoose.Schema

export interface IStockMutation {
    itemId: string
    inQuantity: number
    outQuantity: number
}

const StockMutationSchema = new Schema<IStockMutation>(
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
        }
    }
)

StockMutationSchema.pre('save', async function (this: IStockMutation) {
    this.itemId = this.itemId.toUpperCase()
})

const StockMutationModel = mongoose.model('stockMutation', StockMutationSchema)

export default StockMutationModel