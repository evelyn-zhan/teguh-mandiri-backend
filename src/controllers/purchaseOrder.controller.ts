import { Request, Response } from "express"
import * as Yup from "yup"

import PurchaseOrderModel, { IOrderItem } from "../models/purchaseOrder.model"
import { idText } from "typescript"

type TPurchaseOrder = {
    id: string
    supplier: string
    items: IOrderItem[]
    expectedDeliveryDate: Date
}

const purchaseOrderValidation = Yup.object({
    id: Yup.string().required("ID Pemesanan diperlukan."),
    supplier: Yup.string().required("Nama Supplier diperlukan."),
    items: Yup.array().of(
        Yup.object({
            name: Yup.string().required("Nama Barang diperlukan."),
            quantity: Yup.number().required("Jumlah Barang diperlukan."),
            received: Yup.number().default(0)
        })
    )
    .min(1, "Daftar Barang diperlukan.")
    .required("Daftar Barang diperlukan."),
    expectedDeliveryDate: Yup.string().required("Perkiraan Tanggal Pengiriman diperlukan.")
})

export default {
    async getAllOrders(req: Request, res: Response) {
        try {
            const orders = await PurchaseOrderModel.find()

            const formattedOrders = orders.map((order) => {
                const { _id, __v, ...data } = order.toJSON()
                return { id: _id, ...data }
            })

            res.status(200).json({
                message: "Berhasil mengambil data pemesanan barang.",
                data: formattedOrders
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

            const { _id, __v, ...data } = order.toJSON()
            const formattedOrder = { id: _id, ...data }

            res.status(200).json({
                message: "Berhasil mengambil data pemesanan barang.",
                data: formattedOrder
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
        const { id, supplier, items, expectedDeliveryDate } = req.body as unknown as TPurchaseOrder

        try {
            const parsedDate = new Date(expectedDeliveryDate)

            await purchaseOrderValidation.validate({ id, supplier, items, expectedDeliveryDate: parsedDate })

            const existingOrder = await PurchaseOrderModel.findOne({ _id: id.toUpperCase() })

            if (existingOrder) {
                return res.status(400).json({
                    message: "Sudah ada pemesanan dengan ID ini.",
                    data: null
                })
            }

            const order = await PurchaseOrderModel.create({ _id: id, supplier, items, expectedDeliveryDate: parsedDate })
            
            const { _id, __v, ...data } = order.toJSON()
            const formattedOrder = { id: _id, ...data }

            res.status(201).json({
                message: "Berhasil menambahkan pemesanan barang.",
                data: {
                    ...formattedOrder,
                    expectedDeliveryDate: formattedOrder.expectedDeliveryDate.toISOString().split("T")[0]
                }
            })
        }
        catch (error) {
            const err = error as unknown as Error

            if (err.name == "ValidationError") {
                return res.status(400).json({
                    message: err.message,
                    data: null
                })
            }
            
            res.status(500).json({
                message: "Internal Server Error",
                data: null
            })
        }
    },
    async updateOrder(req: Request<{ id: string }>, res: Response) {
        const { id } = req.params
        const { supplier, items, expectedDeliveryDate } = req.body as unknown as TPurchaseOrder

        try {
            const order = await PurchaseOrderModel.findOne({ _id: id.toUpperCase() })

            if (!order) {
                return res.status(404).json({
                    message: "Pemesanan tidak ditemukan.",
                    data: null
                })
            }

            const parsedDate = new Date(expectedDeliveryDate)

            await purchaseOrderValidation.validate({ id, supplier, items, expectedDeliveryDate: parsedDate })

            const updatedOrder = await PurchaseOrderModel.findOneAndUpdate({ _id: id.toUpperCase() }, { supplier, items, expectedDeliveryDate: parsedDate }, { new: true })

            const { _id, __v, ...data } = updatedOrder!.toJSON()
            const formattedOrder = { id: _id, ...data }

            res.status(200).json({
                message: "Berhasil mengubah data pemesanan barang.",
                data: {
                    ...formattedOrder,
                    expectedDeliveryDate: formattedOrder.expectedDeliveryDate.toISOString().split("T")[0]
                }
            })
        }
        catch (error) {
            const err = error as unknown as Error

            if (err.name == "ValidationError") {
                return res.status(400).json({
                    message: err.message,
                    data: null
                })
            }
            
            res.status(500).json({
                message: "Internal Server Error",
                data: null
            })
        }
    },
    async deleteOrder(req: Request<{ id: string }>, res: Response) {
        const { id } = req.params
        
        try {
            const order = await PurchaseOrderModel.findOne({ _id: id.toUpperCase() })

            if (!order) {
                return res.status(404).json({
                    message: "Pemesanan tidak ditemukan.",
                    data: null
                })
            }

            await PurchaseOrderModel.findOneAndDelete({ _id: id.toUpperCase() })

            res.status(200).json({
                message: "Berhasil menghapus pemesanan barang.",
                data: null
            })
        }
        catch (error) {
            const err = error as unknown as Error

            if (err.name == "ValidationError") {
                return res.status(400).json({
                    message: err.message,
                    data: null
                })
            }
            
            res.status(500).json({
                message: "Internal Server Error",
                data: null
            })
        }
    }
}