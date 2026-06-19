import { Request, Response } from "express"
import * as Yup from "yup"

import PurchaseOrderModel, { IOrderSupplier, IOrderItem } from "../models/purchaseOrder.model"
import ItemModel from "../models/item.model"
import SupplierModel from "../models/supplier.model"

type TPurchaseOrder = {
    id: string
    supplier: IOrderSupplier
    items: IOrderItem[]
    createdAt: Date
    expectedDeliveryDate: Date
}

const purchaseOrderValidation = Yup.object({
    id: Yup.string().required("ID Pemesanan diperlukan."),
    supplier: Yup.object({
        id: Yup.string().required("ID Supplier diperlukan."),
        name: Yup.string().required("Nama Supplier diperlukan.")
    }),
    items: Yup.array().of(
        Yup.object({
            id: Yup.string().required("ID Barang diperlukan."),
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

            const data = orders.map((order) => {
                const { _id, __v, ...props } = order.toJSON()
                return { id: _id, ...props }
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

            const { _id, __v, ...props } = order.toJSON()
            const data = { id: _id, ...props }

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
        const { id, supplier, items, expectedDeliveryDate } = req.body as unknown as TPurchaseOrder

        try {
            const parsedCreatedAt = new Date(Date.now())
            const parsedExpectedDeliveryDate = new Date(expectedDeliveryDate)

            await purchaseOrderValidation.validate({ id, supplier, items, expectedDeliveryDate: parsedExpectedDeliveryDate })

            const existingOrder = await PurchaseOrderModel.findOne({ _id: id.toUpperCase() })
            if (existingOrder) {
                return res.status(400).json({
                    message: "Sudah ada pemesanan dengan ID ini.",
                    data: null
                })
            }

            const existingSupplier = await SupplierModel.findOne({ _id: supplier.id.toUpperCase() })
            if (!existingSupplier) {
                return res.status(404).json({
                    message: `Supplier dengan ID ${supplier.id} tidak ditemukan.`,
                    data: null
                })
            }

            for (const item of items) {
                const existingItem = await ItemModel.findOne({ _id: item.id.toUpperCase() })
                if (!existingItem) {
                    return res.status(404).json({
                        message: `Barang dengan ID ${item.id} tidak ditemukan.`,
                        data: null
                    })
                }
            }

            const order = await PurchaseOrderModel.create({ _id: id, supplier, items, createdAt: parsedCreatedAt, expectedDeliveryDate: parsedExpectedDeliveryDate })
            
            const { _id, __v, ...props } = order.toJSON()
            const data = { id: _id, ...props }

            res.status(201).json({
                message: "Berhasil menambahkan pemesanan barang.",
                data
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
        const { supplier, items, createdAt, expectedDeliveryDate } = req.body as unknown as TPurchaseOrder

        try {
            const order = await PurchaseOrderModel.findOne({ _id: id.toUpperCase() })
            if (!order) {
                return res.status(404).json({
                    message: "Pemesanan tidak ditemukan.",
                    data: null
                })
            }

            if (supplier) {
                const existingSupplier = await SupplierModel.findOne({ _id: supplier.id.toUpperCase() })
                if (!existingSupplier) {
                    return res.status(404).json({
                        message: `Supplier ${supplier.name} dengan ID ${supplier.id} tidak ditemukan pada daftar supplier.`,
                        data: null
                    })
                }
            }

            if (items) {
                for (const item of items) {
                    const existingItem = await ItemModel.findOne({ _id: item.id.toUpperCase() })
                    if (!existingItem) {
                        return res.status(404).json({
                            message: `${item.name} dengan ID ${item.id} tidak ditemukan pada daftar barang.`,
                            data: null
                        })
                    }
                }
            }

            const parsedCreatedAt = createdAt ? new Date(createdAt) : order.createdAt
            const parsedExpectedDeliveryDate = expectedDeliveryDate ? new Date(expectedDeliveryDate) : order.expectedDeliveryDate

            const updatedOrder = await PurchaseOrderModel.findOneAndUpdate(
                { _id: id.toUpperCase() },
                { supplier, items, createdAt: parsedCreatedAt, expectedDeliveryDate: parsedExpectedDeliveryDate },
                { new: true }
            )

            const { _id, __v, ...props } = updatedOrder!.toJSON()
            const data = { id: _id, ...props }

            res.status(200).json({
                message: "Berhasil mengubah data pemesanan barang.",
                data
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