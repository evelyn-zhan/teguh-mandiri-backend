import mongoose from "mongoose"

const Schema = mongoose.Schema

export interface IDeliveredItem {
    id: string
    name: string
    quantity: number
}

export interface ISalesDelivery {
    _id: string
    purchaseId: string
    items: IDeliveredItem[]
    deliveryDate: Date
}

const DeliveredItemSchema = new Schema<IDeliveredItem> (
    {
        id: {
            type: Schema.Types.String,
            required: true
        },
        name: {
            type: Schema.Types.String,
            required: true
        },
        quantity: {
            type: Schema.Types.Number,
            required: true
        }
    },
    {
        _id: false,
        timestamps: false
    }
)

const SalesDeliverySchema = new Schema<ISalesDelivery> (
    {
        _id: {
            type: Schema.Types.String,
            required: true
        },
        purchaseId: {
            type: Schema.Types.String,
            required: true
        },
        items: {
            type: [DeliveredItemSchema],
            required: true
        },
        deliveryDate: {
            type: Schema.Types.Date,
            required: true
        }
    },
    {
        timestamps: false
    }
)

SalesDeliverySchema.pre("save", async function (this: ISalesDelivery) {
    this._id = this._id.toUpperCase()
})

const SalesDeliveryModel = mongoose.model("salesDelivery", SalesDeliverySchema)

export default SalesDeliveryModel