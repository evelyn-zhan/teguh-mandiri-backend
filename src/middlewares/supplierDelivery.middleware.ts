import { Request, Response, NextFunction } from "express"

import * as Yup from "yup"

import { TSupplierDelivery } from "../controllers/supplierDelivery.controller"

import SupplierDeliveryModel from "../models/supplierDelivery.model"
import PurchaseOrderModel from "../models/purchaseOrder.model"
import SupplierModel from "../models/supplier.model"

const supplierDeliveryDataValidation = Yup.object({
    id: Yup.string().required("ID Pengiriman diperlukan."),
    purchaseId: Yup.string().required("ID Pemesanan diperlukan."),
    supplier: Yup.object({
        id: Yup.string().required("ID Supplier diperlukan."),
        name: Yup.string().required("Nama Supplier diperlukan.")
    }),
    items: Yup.array().of(
        Yup.object({
            id: Yup.string().required("ID Barang diperlukan."),
            name: Yup.string().required("Nama Barang diperlukan."),
            quantity: Yup.number().required("Jumlah Barang diperlukan.").min(1, "Jumlah Barang minimal 1.")
        })
    )
    .min(1, "Daftar Barang diperlukan.")
    .required("Daftar Barang diperlukan."),
    deliveryDate: Yup.date().required("Tanggal Pengiriman diperlukan.")
})

export default {
    async validateSupplierDeliveryData(req: Request, res: Response, next: NextFunction) {
        const { id, purchaseId, supplier, items, deliveryDate } = req.body as unknown as TSupplierDelivery

        try {
            const parsedDeliveryDate = new Date(deliveryDate)
            await supplierDeliveryDataValidation.validate({ id, purchaseId, supplier, items, deliveryDate: parsedDeliveryDate })
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
    async validateSupplierDeliveryId(req: Request<{ id: string }>, res: Response, next: NextFunction) {
        const { id } = req.params

        const delivery = await SupplierDeliveryModel.findOne({ _id: id.toUpperCase() })

        if (!delivery) {
            return res.status(404).json({
                message: "Pengiriman tidak ditemukan.",
                data: null
            })
        }

        next()
    },
    async validateSupplierDeliveryExistance(req: Request, res: Response, next: NextFunction) {
        const { id } = req.body

        const existingDelivery = await SupplierDeliveryModel.findOne({ _id: id.toUpperCase() })

        if (existingDelivery) {
            return res.status(400).json({
                message: "Sudah ada pengiriman dengan ID ini.",
                data: null
            })
        }

        next()
    },
    async validateSupplierDeliveryRefs(req: Request<{ id: string }>, res: Response, next: NextFunction) {
        const id = req.params.id || req.body.id
        const { purchaseId, supplier, items } = req.body

        if (purchaseId) {
            const existingOrder = await PurchaseOrderModel.findOne({ _id: purchaseId.toUpperCase() })
            if (!existingOrder) {
                return res.status(404).json({
                    message: `Pemesanan dengan ID ${purchaseId} tidak ditemukan.`,
                    data: null
                })
            }
        }

        if (supplier) {
            const existingSupplier = await SupplierModel.findOne({ _id: supplier.id.toUpperCase() })
            if (!existingSupplier) {
                return res.status(404).json({
                    message: `Supplier dengan ID ${supplier.id} tidak ditemukan.`,
                    data: null
                })
            }

            const matchingSupplier = await PurchaseOrderModel.findOne({ _id: purchaseId.toUpperCase(), "supplier.id": supplier.id.toUpperCase() })
            if (!matchingSupplier) {
                return res.status(400).json({
                    message: `Supplier dengan ID ${supplier.id} tidak ada pada pemesanan yang berkaitan dengan pengiriman ini.`,
                    data: null
                })
            }
        }

        if (items) {
            const delivery = await SupplierDeliveryModel.findOne({ _id: id.toUpperCase() })
            const order = await PurchaseOrderModel.findOne({ _id: delivery!.purchaseId || purchaseId.toUpperCase() })

            for (const item of items) {
                const matchingItem = order!.items.find((orderedItem) => orderedItem.id == item.id.toUpperCase())
                if (!matchingItem) {
                    return res.status(400).json({
                        message: `Barang dengan ID ${item.id} tidak ada pada pemesanan yang berkaitan dengan pengiriman ini.`,
                        data: null
                    })
                }
            }
        }

        next()
    }
}