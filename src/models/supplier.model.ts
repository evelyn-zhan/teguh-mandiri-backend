import mongoose from "mongoose"

const Schema = mongoose.Schema

export interface ISupplier {
    _id: string
    name: string
    phone: string
    email: string
    address: string
}

const SupplierSchema = new Schema<ISupplier>(
    {
        _id: {
            type: Schema.Types.String,
            required: true
        },
        name: {
            type: Schema.Types.String,
            required: true
        },
        phone: {
            type: Schema.Types.String,
            required: true
        },
        email: {
            type: Schema.Types.String,
            required: true
        },
        address: {
            type: Schema.Types.String,
            default: ""
        }
    },
    {
        timestamps: false
    }
)

SupplierSchema.pre("save", async function (this: ISupplier) {
    this._id = this._id.toUpperCase()
})

const SupplierModel = mongoose.model("supplier", SupplierSchema)

export default SupplierModel