import { Request, Response } from "express"
import * as Yup from "yup"

import SalesDeliveryModel, { IDeliveredItem } from "../models/salesDelivery.model"
import CustomerOrderModel from "../models/purchaseOrder.model"
import ItemModel from "../models/item.model"

type TSalesDelivery = {
    id: string
    purchaseId: string
    items: IDeliveredItem[]
    deliveryDate: Date
}

const SalesDeliveryValidation = Yup.object({
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
    async getAllDeliveries(req: Request, res: Response) {
        try {
            const deliveries = await SalesDeliveryModel.find()

            const data = deliveries.map((delivery) => {
                const { _id, __v, ...props } = delivery.toJSON()
                return { id: _id, ...props }
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

            const { _id, __v, ...props } = delivery.toJSON()
            const data = { id: _id, ...props }

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
        const { id, purchaseId, items, deliveryDate } = req.body as unknown as TSalesDelivery

        try {
            const parsedDeliveryDate = new Date(deliveryDate)

            await SalesDeliveryValidation.validate({ id, purchaseId, items, deliveryDate: parsedDeliveryDate })

            const existingDelivery = await SalesDeliveryModel.findOne({ _id: id.toUpperCase() })
            if (existingDelivery) {
                return res.status(400).json({
                    message: "Sudah ada pengiriman dengan ID ini.",
                    data: null
                })
            }

            const existingPurchase = await CustomerOrderModel.findOne({ _id: purchaseId })
            if (!existingPurchase) {
                return res.status(404).json({
                    message: `Pemesanan dengan ID ${purchaseId} tidak ditemukan.`,
                    data: null
                })
            }

            for (const item of items) {
                const matchingItem = existingPurchase.items.find((purchasedItem) => purchasedItem.id == item.id)

                if (!matchingItem) {
                    return res.status(400).json({
                        message: `Barang dengan ID ${item.id} tidak ada pada pemesanan.`,
                        data: null
                    })
                }

                await CustomerOrderModel.updateOne(
                    {
                        _id: purchaseId,
                        "items.id": item.id
                    },
                    {
                        $inc: { "items.$.received": item.quantity }
                    }
                )

                await ItemModel.updateOne(
                    { _id: item.id },
                    {
                        $inc: { stock: item.quantity }
                    }
                )
            }

            const purchase = await CustomerOrderModel.findOne({ _id: purchaseId })
            let completedDelivery = true

            for (const item of purchase!.items) {
                if (item.received != item.quantity) {
                    completedDelivery = false
                }
            }

            console.log(completedDelivery)

            if (completedDelivery) {
                await CustomerOrderModel.updateOne(
                    { _id: purchaseId },
                    {
                        $set: { isCompleted: true }
                    }
                )
            }

            const delivery = await SalesDeliveryModel.create({ _id: id, purchaseId, items, deliveryDate: parsedDeliveryDate })

            const { _id, __v, ...props } = delivery.toJSON()
            const data = { id: _id, ...props }

            res.status(201).json({
                message: "Berhasil menambahkan pengiriman barang.",
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
    async updateDelivery(req: Request<{ id: string }>, res: Response) {
        const { id } = req.params
        const { purchaseId, items, deliveryDate } = req.body as unknown as TSalesDelivery

        try {
            const delivery = await SalesDeliveryModel.findOne({ _id: id.toUpperCase() })
            if (!delivery) {
                return res.status(404).json({
                    message: "Pengiriman tidak ditemukan.",
                    data: null
                })
            }

            if (purchaseId) {
                const existingPurchase = await CustomerOrderModel.findOne({ _id: purchaseId })
                if (!existingPurchase) {
                    return res.status(404).json({
                        message: `Pemesanan dengan ID ${purchaseId} tidak ditemukan.`,
                        data: null
                    })
                }
            }

            if (items) {
                const purchase = await CustomerOrderModel.findOne({ _id: purchaseId || delivery!.purchaseId })

                for (const item of items) {
                    const matchingItem = purchase!.items.find((purchasedItem) => purchasedItem.id == item.id)

                    if (!matchingItem) {
                        return res.status(400).json({
                            message: `Barang dengan ID ${item.id} tidak ada pada pemesanan.`,
                            data: null
                        })
                    }

                    const currentDeliveredQuantity = delivery!.items.find((deliveredItem) => deliveredItem.id == item.id)!.quantity

                    await CustomerOrderModel.updateOne(
                        {
                            _id: purchaseId || delivery!.purchaseId,
                            "items.id": item.id
                        },
                        {
                            $inc: { "items.$.received": item.quantity - currentDeliveredQuantity }
                        }
                    )

                    await ItemModel.updateOne(
                        { _id: item.id },
                        {
                            $inc: { stock: item.quantity - currentDeliveredQuantity }
                        }
                    )
                }
            }

            const updatedDelivery = await SalesDeliveryModel.findOneAndUpdate(
                { _id: id.toUpperCase() },
                { purchaseId, items, deliveryDate },
                { new: true }
            )

            const { _id, __v, ...props } = updatedDelivery!.toJSON()
            const data = { id: _id, ...props }

            res.status(200).json({
                message: "Berhasil memperbarui pengiriman barang.",
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
    async deleteDelivery(req: Request<{ id: string }>, res: Response) {
        const { id } = req.params

        try {
            const delivery = await SalesDeliveryModel.findOne({ _id: id.toUpperCase() })

            if (!delivery) {
                return res.status(404).json({
                    message: "Pengiriman tidak ditemukan.",
                    data: null
                })
            }

            await SalesDeliveryModel.findOneAndDelete({ _id: id.toUpperCase() })

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