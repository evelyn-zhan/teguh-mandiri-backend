import mongoose from "mongoose"

const Schema = mongoose.Schema

export interface ICustomer {
    _id: string
    name: string
    phone: string
    email: string
    address: string
}

const CustomerSchema = new Schema<ICustomer> (
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

CustomerSchema.pre("save", async function (this: ICustomer) {
    this._id = this._id.toUpperCase()
})

const CustomerModel = mongoose.model("customer", CustomerSchema)

export default CustomerModel