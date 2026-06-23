import { Request, Response, NextFunction } from "express"

import * as Yup from "yup"

import { TSalesDelivery } from "../controllers/salesDelivery.controller"

import SalesDeliveryModel from "../models/salesDelivery.model"
import CustomerOrderModel from "../models/customerOrder.model"
import ItemModel from "../models/item.model"

const salesDeliveryDataValidation = Yup.object({
    id: Yup.string().required("ID Pengiriman diperlukan."),
    purchaseId: Yup.string().required("ID Pemesanan diperlukan."),
    items: Yup.array().of(
        Yup.object({
            id: Yup.string().required("ID Barang diperlukan."),
            name: Yup.string().required("Nama Barang diperlukan."),
            quantity: Yup.number().required("Jumlah Barang diperlukan.")
        })
    )
    .min(1, "Daftar Barang diperlukan.")
    .required("Daftar Barang diperlukan."),
    deliveryDate: Yup.date().required("Tanggal Pengiriman diperlukan.")
})

export default {
    async validateSalesDeliveryData(req: Request, res: Response, next: NextFunction) {
        const { id, purchaseId, items, deliveryDate } = req.body as TSalesDelivery

        try {
            const parsedDeliveryDate = new Date(deliveryDate)

            await salesDeliveryDataValidation.validate({ id, purchaseId, items, deliveryDate: parsedDeliveryDate })
            
            next()
        } catch (error) {
            const err = error as unknown as Error
            return res.status(400).json({
                message: err.message,
                data: null
            })
        }
    },
    async validateSalesDeliveryId(req: Request<{ id: string }>, res: Response, next: NextFunction) {
        const { id } = req.params

        const delivery = await SalesDeliveryModel.findOne({ _id: id.toUpperCase() })

        if (!delivery) {
            return res.status(404).json({
                message: "Pengiriman tidak ditemukan.",
                data: null
            })
        }

        next()
    },
    async validateSalesDeliveryExistance(req: Request, res: Response, next: NextFunction) {
        const { id } = req.body

        const existingDelivery = await SalesDeliveryModel.findOne({ _id: id.toUpperCase() })

        if (existingDelivery) {
            return res.status(400).json({
                message: "Sudah ada pengiriman dengan ID ini.",
                data: null
            })
        }

        next()
    },
    async validateSalesDeliveryRefs(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id || req.body.id
        const { purchaseId, items } = req.body

        if (purchaseId) {
            const existingOrder = await CustomerOrderModel.findOne({ _id: purchaseId.toUpperCase() })
            if (!existingOrder) {
                return res.status(404).json({
                    message: `Pemesanan dengan ID ${purchaseId} tidak ditemukan.`,
                    data: null
                })
            }
        }

        if (items) {
            const delivery = await SalesDeliveryModel.findOne({ _id: id.toUpperCase() })
            const order = await CustomerOrderModel.findOne({ _id: delivery!.purchaseId || purchaseId.toUpperCase() })
    
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