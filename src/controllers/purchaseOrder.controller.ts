import { Request, Response } from "express"

import PurchaseOrderModel from "../models/purchaseOrder.model"

export type TOrderSupplier = {
    id: string
    name: string
}

export type TOrderItem = {
    id: string
    name: string
    quantity: number
    received: number
}

export type TPurchaseOrder = {
    id: string
    supplier: TOrderSupplier
    items: TOrderItem[]
    createdAt: Date
    expectedDeliveryDate: Date
    isCompleted: Boolean
}

export default {
    async getAllOrders(req: Request, res: Response) {
        const { isCompleted } = req.query

        try {
            const filter: Record<string, any> = {}

            if (isCompleted == "true") {
                filter.isCompleted = true
            } else if (isCompleted == "false") {
                filter.isCompleted = false
            }

            const orders = await PurchaseOrderModel.find(filter)

            const data = orders.map((order) => {
                return { id: order._id, supplier: order.supplier, items: order.items, createdAt: order.createdAt, expectedDeliveryDate: order.expectedDeliveryDate, isCompleted: order.isCompleted }
            })

            res.status(200).json({
                message: "Berhasil mengambil data pemesanan barang.",
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
    async getOrderById(req: Request<{ id: string }>, res: Response) {
        const { id } = req.params

        try {
            const order = await PurchaseOrderModel.findOne({ _id: id.toUpperCase() })

            if (!order) {
                return res.status(404).json({
                    message: "Pemesanan tidak ditemukan.",
                    data: null
                })
            }

            const data = { id: order._id, supplier: order.supplier, items: order.items, createdAt: order.createdAt, expectedDeliveryDate: order.expectedDeliveryDate, isCompleted: order.isCompleted }

            res.status(200).json({
                message: "Berhasil mengambil data pemesanan barang.",
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
    async addOrder(req: Request, res: Response) {
        const { id, supplier, items, createdAt, expectedDeliveryDate } = req.body as unknown as TPurchaseOrder

        try {
            const parsedCreatedAt = new Date(createdAt || Date.now())
            const parsedExpectedDeliveryDate = new Date(expectedDeliveryDate)

            await PurchaseOrderModel.create({ _id: id, supplier, items, createdAt: parsedCreatedAt, expectedDeliveryDate: parsedExpectedDeliveryDate })

            res.status(201).json({
                message: "Berhasil menambahkan pemesanan barang.",
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
    async updateOrder(req: Request<{ id: string }>, res: Response) {
        const { id } = req.params
        const { supplier, items, createdAt, expectedDeliveryDate } = req.body as unknown as TPurchaseOrder

        try {
            const newData: Record<string, any> = {}

            if (supplier) newData.supplier = supplier
            if (items) newData.items = items
            if (createdAt) newData.createdAt = new Date(createdAt)
            if (expectedDeliveryDate) newData.expectedDeliveryDate = new Date(expectedDeliveryDate)

            await PurchaseOrderModel.updateOne({ _id: id.toUpperCase() }, newData)

            res.status(200).json({
                message: "Berhasil mengubah data pemesanan barang.",
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
    async deleteOrder(req: Request<{ id: string }>, res: Response) {
        const { id } = req.params
        
        try {
            await PurchaseOrderModel.deleteOne({ _id: id.toUpperCase() })

            res.status(200).json({
                message: "Berhasil menghapus pemesanan barang.",
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