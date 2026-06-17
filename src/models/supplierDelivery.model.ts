import mongoose from "mongoose"

const Schema = mongoose.Schema

export interface IDeliveredItem {
    name: string
    quantity: number
}

export interface ISupplierDelivery {
    id: string
    supplier: string
    items: IDeliveredItem[]
    deliveryDate: Date
}