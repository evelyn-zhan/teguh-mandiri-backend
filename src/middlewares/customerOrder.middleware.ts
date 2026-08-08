import { Request, Response, NextFunction } from "express"

import * as Yup from "yup"

import { TCustomerOrder } from "../controllers/customerOrder.controller"

import CustomerOrderModel from "../models/customerOrder.model"
import CustomerModel from "../models/customer.model"
import ItemModel from "../models/item.model"

const customerOrderDataValidation = Yup.object({
    id: Yup.string().required("ID Pemesanan diperlukan."),
    customer: Yup.object({
        id: Yup.string().required("ID Pelanggan diperlukan."),
        name: Yup.string().required("Nama Pelanggan diperlukan.")
    }),
    items: Yup.array().of(
        Yup.object({
            id: Yup.string().required("ID Barang diperlukan."),
            name: Yup.string().required("Nama Barang diperlukan."),
            quantity: Yup.number().required("Jumlah Barang diperlukan.").min(1, "Jumlah Barang minimal 1."),
            delivered: Yup.number().default(0)
        })
    )
    .min(1, "Daftar Barang diperlukan.")
    .required("Daftar Barang diperlukan."),
    expectedDeliveryDate: Yup.string().required("Perkiraan Tanggal Pengiriman diperlukan."),
    isCompleted: Yup.boolean().default(false)
})

export default {
    async validateCustomerOrderData(req: Request, res: Response, next: NextFunction) {
        const { id, customer, items, createdAt, expectedDeliveryDate } = req.body as unknown as TCustomerOrder

        try {
            const parsedCreatedAt = new Date(createdAt || Date.now())
            const parsedExpectedDeliveryDate = new Date(expectedDeliveryDate)

            await customerOrderDataValidation.validate({ id, customer, items, createdAt: parsedCreatedAt, expectedDeliveryDate: parsedExpectedDeliveryDate })
            
            next()
        }
        catch (error) {
            const err = error as unknown as Error
            return res.status(400).json({
                message: err.message,
                data: null
            })
        }
    },
    async validateCustomerOrderId(req: Request<{ id: string }>, res: Response, next: NextFunction) {
        const { id } = req.params

        const order = await CustomerOrderModel.findOne({ _id: id.toUpperCase() })

        if (!order) {
            return res.status(404).json({
                message: "Pemesanan tidak ditemukan.",
                data: null
            })
        }

        next()
    },
    async validateCustomerOrderExistance(req: Request<{ id: string }>, res: Response, next: NextFunction) {
        const { id } = req.body

        const existingOrder = await CustomerOrderModel.findOne({ _id: id.toUpperCase() })

        if (existingOrder) {
            return res.status(400).json({
                message: "Sudah ada pemesanan dengan ID ini.",
                data: null
            })
        }

        next()
    },
    async validateCustomerOrderRefs(req: Request, res: Response, next: NextFunction) {
        const { customer, items } = req.body

        if (customer) {
            const existingCustomer = await CustomerModel.findOne({ _id: customer.id })
            if (!existingCustomer) {
                return res.status(404).json({
                    message: `Customer dengan ID ${customer.id} tidak ditemukan.`,
                    data: null
                })
            }
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

        next()
    }
}