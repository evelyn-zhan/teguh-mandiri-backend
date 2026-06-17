import mongoose from "mongoose"

const Schema = mongoose.Schema

export interface IDeliveredItem {
    name: string
    quantity: number
}

export interface ISupplierDelivery {
    _id: string
    supplier: string
    items: IDeliveredItem[]
    deliveryDate: Date
}

const DeliveredItemSchema = new Schema<IDeliveredItem> (
    {
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

const SupplierDeliverySchema = new Schema<ISupplierDelivery> (
    {
        _id: {
            type: Schema.Types.String,
            required: true
        },
        supplier: {
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

SupplierDeliverySchema.pre("save", async function (this: ISupplierDelivery) {
    this._id = this._id.toUpperCase()
})

const SupplierDeliveryModel = mongoose.model("supplierDelivery", SupplierDeliverySchema)

export default SupplierDeliveryModel