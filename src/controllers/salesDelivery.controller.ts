import { Request, Response } from "express"

import SalesDeliveryModel from "../models/salesDelivery.model"
import CustomerOrderModel from "../models/purchaseOrder.model"
import ItemModel from "../models/item.model"

export type TOrderCustomer = {
    id: string
    name: string
}

export type TDeliveredItem = {
    id: string
    name: string
    quantity: number
}

export type TSalesDelivery = {
    id: string
    purchaseId: string
    customer: TOrderCustomer
    items: TDeliveredItem[]
    deliveryDate: Date
}

export default {
    async getAllDeliveries(req: Request, res: Response) {
        try {
            const deliveries = await SalesDeliveryModel.find()

            const data = deliveries.map((delivery) => {
                return { id: delivery._id, purchaseId: delivery.purchaseId, customer: delivery.customer, items: delivery.items, deliveryDate: delivery.deliveryDate }
            })

            res.status(200).json({
                message: "Berhasil mengambil data pengiriman barang.",
                data
            })
        }
        catch (error) {
            res.status(500).json({
                message: "Internal Server Error",
                data: null
            })
        }
    },
    async getDeliveryById(req: Request<{ id: string }>, res: Response) {
        const { id } = req.params

        try {
            const delivery = await SalesDeliveryModel.findOne({ _id: id.toUpperCase() })

            if (!delivery) {
                return res.status(404).json({
                    message: "Pengiriman tidak ditemukan.",
                    data: null
                })
            }

            const data = { id: delivery._id, purchaseId: delivery.purchaseId, customer: delivery.customer, items: delivery.items, deliveryDate: delivery.deliveryDate }

            res.status(200).json({
                message: "Berhasil mengambil data pengiriman barang.",
                data
            })
        }
        catch (error) {
            res.status(500).json({
                message: "Internal Server Error",
                data: null
            })
        }
    },
    async addDelivery(req: Request, res: Response) {
        const { id, purchaseId, customer, items, deliveryDate } = req.body as unknown as TSalesDelivery

        try {
            let order = await CustomerOrderModel.findOne({ _id: purchaseId.toUpperCase() })
            
            for (const item of items) {
                const matchingItem = order!.items.find((orderedItem) => orderedItem.id == item.id.toUpperCase())

                if (matchingItem!.received + item.quantity > matchingItem!.quantity) {
                    return res.status(400).json({
                        message: `Total pengiriman untuk barang dengan ID ${item.id} melebihi jumlah yang dipesan.`,
                        data: null
                    })
                }
            
                await CustomerOrderModel.updateOne(
                    { _id: purchaseId.toUpperCase(), "items.id": item.id },
                    { $inc: { "items.$.received": item.quantity } }
                )
            
                await ItemModel.updateOne(
                    { _id: item.id },
                    { $inc: { stock: item.quantity } }
                )
            }
            
            order = await CustomerOrderModel.findOne({ _id: purchaseId.toUpperCase() })
            
            let isCompleted = true
            
            for (const item of order!.items) {
                if (item.received != item.quantity) {
                    isCompleted = false
                }
            }
            
            if (isCompleted) {
                await CustomerOrderModel.updateOne(
                    { _id: purchaseId.toUpperCase() },
                    { $set: { isCompleted } }
                )
            }
            
            const parsedDeliveryDate = new Date(deliveryDate)
            
            await SalesDeliveryModel.create({ _id: id, purchaseId, customer, items, deliveryDate: parsedDeliveryDate })
            
            res.status(201).json({
                message: "Berhasil menambahkan pengiriman barang.",
                data: null
            })
        }
        catch (error) { 
            res.status(500).json({
                message: "Internal Server Error",
                data: null
            })
        }
    },
    async updateDelivery(req: Request<{ id: string }>, res: Response) {
        const { id } = req.params
        const { purchaseId, customer, items, deliveryDate } = req.body as unknown as TSalesDelivery

        try {
            if (items) {
                const delivery = await SalesDeliveryModel.findOne({ _id: id.toUpperCase() })

                for (const item of items) {
                    const quantity = delivery!.items.find((deliveredItem) => deliveredItem.id == item.id.toUpperCase())!.quantity

                    await CustomerOrderModel.updateOne(
                        { _id: purchaseId.toUpperCase() || delivery!.purchaseId, "items.id": item.id },
                        { $inc: { "items.$.received": item.quantity - quantity } }
                    )

                    await ItemModel.updateOne(
                        { _id: item.id },
                        { $inc: { stock: item.quantity - quantity } }
                    )
                }
            }

            const newData: Record<string, any> = {}

            if (purchaseId) newData.purchaseId = purchaseId.toUpperCase()
            if (items) {
                newData.items = items.map((item) => {
                    return { id: item.id.toUpperCase(), name: item.name, quantity: item.quantity }
                })
            }
            if (deliveryDate) newData.deliveryDate = new Date(deliveryDate)

            await SalesDeliveryModel.updateOne({ _id: id.toUpperCase() }, newData)

            res.status(200).json({
                message: "Berhasil memperbarui pengiriman barang.",
                data: null
            })
        }
        catch (error) {
            res.status(500).json({
                message: "Internal Server Error",
                data: null
            })
        }
    },
    async deleteDelivery(req: Request<{ id: string }>, res: Response) {
        const { id } = req.params

        try {
            await SalesDeliveryModel.deleteOne({ _id: id.toUpperCase() })

            res.status(200).json({
                message: "Berhasil menghapus pengiriman barang.",
                data: null
            })
        }
        catch (error) {
            res.status(500).json({
                message: "Internal Server Error",
                data: null
            })
        }
    }
}