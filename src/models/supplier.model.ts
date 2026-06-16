import mongoose from "mongoose"

const Schema = mongoose.Schema

export interface ISupplier {
    id: string
    name: string
    phone: string
    email: string
    address: string
}

const SupplierSchema = new Schema<ISupplier>(
    {
        id: {
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
            type: Schema.Types.String
        }
    },
    {
        _id: false,
        timestamps: false
    }
)

SupplierSchema.pre("save", async function (this: ISupplier) {
    this.id = this.id.toUpperCase()
})

const SupplierModel = mongoose.model("supplier", SupplierSchema)

export default SupplierModel