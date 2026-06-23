import { Request, Response, NextFunction } from "express"

import * as Yup from "yup"

import { TPurchaseOrder } from "../controllers/purchaseOrder.controller"

import PurchaseOrderModel from "../models/purchaseOrder.model"
import SupplierModel from "../models/supplier.model"
import ItemModel from "../models/item.model"

const purchaseOrderDataValidation = Yup.object({
    id: Yup.string().required("ID Pemesanan diperlukan."),
    supplier: Yup.object({
        id: Yup.string().required("ID Supplier diperlukan."),
        name: Yup.string().required("Nama Supplier diperlukan.")
    }),
    items: Yup.array().of(
        Yup.object({
            id: Yup.string().required("ID Barang diperlukan."),
            name: Yup.string().required("Nama Barang diperlukan."),
            quantity: Yup.number().required("Jumlah Barang diperlukan.").min(1, "Jumlah Barang minimal 1."),
            received: Yup.number().default(0)
        })
    )
    .min(1, "Daftar Barang diperlukan.")
    .required("Daftar Barang diperlukan."),
    expectedDeliveryDate: Yup.string().required("Perkiraan Tanggal Pengiriman diperlukan."),
    isCompleted: Yup.boolean().default(false)
})

export default {
    async validatePurchaseOrderData(req: Request, res: Response, next: NextFunction) {
        const { id, supplier, items, createdAt, expectedDeliveryDate } = req.body as unknown as TPurchaseOrder

        try {
            const parsedCreatedAt = new Date(createdAt || Date.now())
            const parsedExpectedDeliveryDate = new Date(expectedDeliveryDate)

            await purchaseOrderDataValidation.validate({ id, supplier, items, createdAt: parsedCreatedAt, expectedDeliveryDate: parsedExpectedDeliveryDate })
            
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
    async validatePurchaseOrderId(req: Request<{ id: string }>, res: Response, next: NextFunction) {
        const { id } = req.params

        const order = await PurchaseOrderModel.findOne({ _id: id.toUpperCase() })

        if (!order) {
            return res.status(404).json({
                message: "Pemesanan tidak ditemukan.",
                data: null
            })
        }

        next()
    },
    async validatePurchaseOrderExistance(req: Request<{ id: string }>, res: Response, next: NextFunction) {
        const { id } = req.body

        const existingOrder = await PurchaseOrderModel.findOne({ _id: id.toUpperCase() })

        if (existingOrder) {
            return res.status(400).json({
                message: "Sudah ada pemesanan dengan ID ini.",
                data: null
            })
        }

        next()
    },
    async validatePurchaseOrderRefs(req: Request, res: Response, next: NextFunction) {
        const { supplier, items } = req.body

        if (supplier) {
            const existingSupplier = await SupplierModel.findOne({ _id: supplier.id })
            if (!existingSupplier) {
                return res.status(404).json({
                    message: `Supplier dengan ID ${supplier.id} tidak ditemukan.`,
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