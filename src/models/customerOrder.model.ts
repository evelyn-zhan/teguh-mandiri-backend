import mongoose from "mongoose"

const Schema = mongoose.Schema

export interface IOrderItem {
    id: string
    name: string
    quantity: number
    delivered: number
}

export interface ICustomerOrder {
    _id: string
    items: IOrderItem[]
    createdAt: Date
    expectedDeliveryDate: Date
    isCompleted: boolean
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
        delivered: {
            type: Schema.Types.Number,
            default: 0
        }
    },
    {
        _id: false,
        timestamps: false
    }
)

const CustomerOrderSchema = new Schema<ICustomerOrder> (
    {
        _id: {
            type: Schema.Types.String,
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
        },
        isCompleted: {
            type: Schema.Types.Boolean,
            default: false
        }
    },
    {
        timestamps: false
    }
)

CustomerOrderSchema.pre("save", async function (this: ICustomerOrder) {
    this._id = this._id.toUpperCase()
})

const CustomerOrderModel = mongoose.model("customerOrder", CustomerOrderSchema)

export default CustomerOrderModel