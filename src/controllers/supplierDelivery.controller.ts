import { Request, Response } from "express"

import SupplierDeliveryModel, { IOrderSupplier, IDeliveredItem } from "../models/supplierDelivery.model"
import PurchaseOrderModel from "../models/purchaseOrder.model"
import ItemModel from "../models/item.model"

export type TOrderSupplier = {
    id: string
    name: string
}

export type TDeliveredItem = {
    id: string
    name: string
    quantity: number
}

export type TSupplierDelivery = {
    id: string
    purchaseId: string
    supplier: IOrderSupplier
    items: IDeliveredItem[]
    deliveryDate: Date
}

export default {
    async getAllDeliveries(req: Request, res: Response) {
        try {
            const deliveries = await SupplierDeliveryModel.find()

            const data = deliveries.map((delivery) => {
                return { id: delivery._id, purchaseId: delivery.purchaseId, supplier: delivery.supplier, items: delivery.items, deliveryDate: delivery.deliveryDate }
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
            const delivery = await SupplierDeliveryModel.findOne({ _id: id.toUpperCase() })

            if (!delivery) {
                return res.status(404).json({
                    message: "Pengiriman tidak ditemukan.",
                    data: null
                })
            }

            const data = { id: delivery._id, purchaseId: delivery.purchaseId, supplier: delivery.supplier, items: delivery.items, deliveryDate: delivery.deliveryDate }

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
        const { id, purchaseId, supplier, items, deliveryDate } = req.body as unknown as TSupplierDelivery

        try {
            for (const item of items) {
                await PurchaseOrderModel.updateOne(
                    { _id: purchaseId.toUpperCase(), "items.id": item.id },
                    { $inc: { "items.$.received": item.quantity } }
                )

                await ItemModel.updateOne(
                    { _id: item.id },
                    { $inc: { stock: item.quantity } }
                )
            }

            const order = await PurchaseOrderModel.findOne({ _id: purchaseId.toUpperCase() })

            let isCompleted = true

            for (const item of order!.items) {
                if (item.received != item.quantity) {
                    isCompleted = false
                }
            }

            if (isCompleted) {
                await PurchaseOrderModel.updateOne(
                    { _id: purchaseId.toUpperCase() },
                    { $set: { isCompleted } }
                )
            }

            const parsedDeliveryDate = new Date(deliveryDate)

            await SupplierDeliveryModel.create({ _id: id, purchaseId, supplier, items, deliveryDate: parsedDeliveryDate })

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
        const { purchaseId, supplier, items, deliveryDate } = req.body as unknown as TSupplierDelivery

        try {
            if (items) {
                const delivery = await SupplierDeliveryModel.findOne({ _id: id.toUpperCase() })

                for (const item of items) {
                    const quantity = delivery!.items.find((deliveredItem) => deliveredItem.id == item.id.toUpperCase())!.quantity

                    await PurchaseOrderModel.updateOne(
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
            if (supplier) newData.supplier = { id: supplier.id.toUpperCase(), name: supplier.name }
            if (items) {
                newData.items = items.map((item) => {
                    return { id: item.id.toUpperCase(), name: item.name, quantity: item.quantity }
                })
            }
            if (deliveryDate) newData.deliveryDate = new Date(deliveryDate)

            await SupplierDeliveryModel.updateOne({ _id: id.toUpperCase() }, newData)

            res.status(200).json({
                message: "Berhasil memperbarui pengiriman barang.",
                data: null
            })
        }
        catch (error) {
            const err = error as unknown as Error
            console.log(err.message)
            res.status(500).json({
                message: "Internal Server Error",
                data: null
            })
        }
    },
    async deleteDelivery(req: Request<{ id: string }>, res: Response) {
        const { id } = req.params

        try {
            await SupplierDeliveryModel.deleteOne({ _id: id.toUpperCase() })

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