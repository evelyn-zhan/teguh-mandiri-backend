import mongoose from "mongoose"

const Schema = mongoose.Schema

export interface IOrderSupplier {
    id: string
    name: string
}

export interface IDeliveredItem {
    id: string
    name: string
    quantity: number
}

export interface ISupplierDelivery {
    _id: string
    purchaseId: string
    supplier: IOrderSupplier
    items: IDeliveredItem[]
    deliveryDate: Date
}

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

const SupplierDeliverySchema = new Schema<ISupplierDelivery> (
    {
        _id: {
            type: Schema.Types.String,
            required: true
        },
        purchaseId: {
            type: Schema.Types.String,
            required: true
        },
        supplier: {
            type: OrderSupplierSchema,
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
    this.purchaseId = this.purchaseId.toUpperCase()
})

const SupplierDeliveryModel = mongoose.model("supplierDelivery", SupplierDeliverySchema)

export default SupplierDeliveryModel