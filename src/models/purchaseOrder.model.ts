import mongoose from "mongoose"

const Schema = mongoose.Schema

export interface IOrderItem {
    id: string
    name: string
    quantity: number
    received: number
}

export interface IOrderSupplier {
    id: string
    name: string
}

export interface IPurchaseOrder {
    _id: string
    supplier: IOrderSupplier
    items: IOrderItem[]
    createdAt: Date
    expectedDeliveryDate: Date
}

const OrderItemSchema = new Schema<IOrderItem> (
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

const OrderSupplierSchema = new Schema<IOrderSupplier> (
    {
        id: {
            type: Schema.Types.String,
            required: true
        },
        name: {
            type: Schema.Types.String,
            required: true
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
            type: OrderSupplierSchema,
            required: true
        },
        items: {
            type: [OrderItemSchema],
            required: true
        },
        createdAt: {
            type: Schema.Types.Date,
            default: Date.now
        },
        expectedDeliveryDate: {
            type: Schema.Types.Date,
            required: true
        }
    },
    {
        timestamps: false
    }
)

PurchaseOrderSchema.pre("save", async function (this: IPurchaseOrder) {
    this._id = this._id.toUpperCase()
})

const PurchaseOrderModel = mongoose.model("purchaseOrder", PurchaseOrderSchema)

export default PurchaseOrderModel