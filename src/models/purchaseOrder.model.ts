import mongoose from "mongoose"

const Schema = mongoose.Schema

export interface IOrderItem {
    name: string
    quantity: number
    received: number
}

export interface IPurchaseOrder {
    _id: string
    supplier: string
    items: IOrderItem[]
    createdAt: Date
    expectedDeliveryDate: Date
}

const OrderItemSchema = new Schema<IOrderItem> (
    {
        name: {
            type: Schema.Types.String,
            required: true
        },
        quantity: {
            type: Schema.Types.Number,
            required: true
        },
        received: {
            type: Schema.Types.Number,
            default: 0
        }
    },
    {
        _id: false,
        timestamps: false
    }
)

const PurchaseOrderSchema = new Schema<IPurchaseOrder> (
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
            type: [OrderItemSchema],
            required: true
        },
        expectedDeliveryDate: {
            type: Schema.Types.Date,
            required: true
        }
    },
    {
        timestamps: true
    }
)

PurchaseOrderSchema.pre("save", async function (this: IPurchaseOrder) {
    this._id = this._id.toUpperCase()
})

const PurchaseOrderModel = mongoose.model("purchaseOrder", PurchaseOrderSchema)

export default PurchaseOrderModel