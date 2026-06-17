import mongoose from "mongoose"

const Schema = mongoose.Schema

export interface IOrderItem {
    name: string
    quantity: number
    received: number
}

export interface IPurchaseOrder {
    id: string
    supplier: string
    items: IOrderItem[]
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
        timestamps: false
    }
)

const PurchaseOrderSchema = new Schema<IPurchaseOrder> (
    {
        id: {
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
        _id: false
    }
)

PurchaseOrderSchema.pre("save", async function (this: IPurchaseOrder) {
    this.id = this.id.toUpperCase()
})

const PurchaseOrderModel = mongoose.model("purchaseOrder", PurchaseOrderSchema)

export default PurchaseOrderModel