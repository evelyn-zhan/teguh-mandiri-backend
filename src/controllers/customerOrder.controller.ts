import { Request, Response } from "express"
import * as Yup from "yup"

import CustomerOrderModel, { IOrderItem } from "../models/customerOrder.model"
import ItemModel from "../models/item.model"

type TCustomerOrder = {
    id: string
    items: IOrderItem[]
    createdAt: Date
    expectedDeliveryDate: Date
    isCompleted: Boolean
}

const customerOrderValidation = Yup.object({
    id: Yup.string().required("ID Pemesanan diperlukan."),
    items: Yup.array().of(
        Yup.object({
            id: Yup.string().required("ID Barang diperlukan."),
            name: Yup.string().required("Nama Barang diperlukan."),
            quantity: Yup.number().required("Jumlah Barang diperlukan."),
            delivered: Yup.number().default(0)
        })
    )
    .min(1, "Daftar Barang diperlukan.")
    .required("Daftar Barang diperlukan."),
    expectedDeliveryDate: Yup.string().required("Perkiraan Tanggal Pengiriman diperlukan."),
    isCompleted: Yup.boolean().default(false)
})

export default {
    async getAllOrders(req: Request, res: Response) {
        const { isCompleted } = req.query

        try {
            let filter = {}
            if (isCompleted != undefined && isCompleted) {
                filter = (isCompleted == "true" ? { isCompleted: true } : { isCompleted: false })
            }

            const orders = await CustomerOrderModel.find(filter)

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
            const order = await CustomerOrderModel.findOne({ _id: id.toUpperCase() })
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
        const { id, items, expectedDeliveryDate } = req.body as unknown as TCustomerOrder

        try {
            const parsedCreatedAt = new Date(Date.now())
            const parsedExpectedDeliveryDate = new Date(expectedDeliveryDate)

            await customerOrderValidation.validate({ id, items, expectedDeliveryDate: parsedExpectedDeliveryDate })

            const existingOrder = await CustomerOrderModel.findOne({ _id: id.toUpperCase() })
            if (existingOrder) {
                return res.status(400).json({
                    message: "Sudah ada pemesanan dengan ID ini.",
                    data: null
                })
            }

            for (const item of items) {
                const existingItem = await ItemModel.findOne({ _id: item.id })
                if (!existingItem) {
                    return res.status(404).json({
                        message: `Barang dengan ID ${item.id} tidak ditemukan.`,
                        data: null
                    })
                }
            }

            const order = await CustomerOrderModel.create({ _id: id, items, createdAt: parsedCreatedAt, expectedDeliveryDate: parsedExpectedDeliveryDate })
            
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
        const { items, createdAt, expectedDeliveryDate } = req.body as unknown as TCustomerOrder

        try {
            const order = await CustomerOrderModel.findOne({ _id: id.toUpperCase() })
            if (!order) {
                return res.status(404).json({
                    message: "Pemesanan tidak ditemukan.",
                    data: null
                })
            }

            if (items) {
                for (const item of items) {
                    const existingItem = await ItemModel.findOne({ _id: item.id })
                    if (!existingItem) {
                        return res.status(404).json({
                            message: `Barang dengan ID ${item.id} tidak ditemukan.`,
                            data: null
                        })
                    }
                }
            }

            const parsedCreatedAt = createdAt ? new Date(createdAt) : order.createdAt
            const parsedExpectedDeliveryDate = expectedDeliveryDate ? new Date(expectedDeliveryDate) : order.expectedDeliveryDate

            const updatedOrder = await CustomerOrderModel.findOneAndUpdate(
                { _id: id.toUpperCase() },
                { items, createdAt: parsedCreatedAt, expectedDeliveryDate: parsedExpectedDeliveryDate },
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
            const order = await CustomerOrderModel.findOne({ _id: id.toUpperCase() })

            if (!order) {
                return res.status(404).json({
                    message: "Pemesanan tidak ditemukan.",
                    data: null
                })
            }

            await CustomerOrderModel.findOneAndDelete({ _id: id.toUpperCase() })

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