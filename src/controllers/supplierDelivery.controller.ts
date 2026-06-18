import { Request, Response } from "express"
import * as Yup from "yup"

import SupplierDeliveryModel, { IOrderSupplier, IDeliveredItem } from "../models/supplierDelivery.model"

type TSupplierDelivery = {
    id: string
    purchaseId: string
    supplier: IOrderSupplier
    items: IDeliveredItem[]
    deliveryDate: Date
}

const SupplierDeliveryValidation = Yup.object({
    id: Yup.string().required("ID Pengiriman diperlukan."),
    purchaseId: Yup.string().required("ID Pemesanan diperlukan."),
    supplier: Yup.string().required("ID Supplier diperlukan."),
    items: Yup.array().of(
        Yup.object({
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
            const deliveries = await SupplierDeliveryModel.find()

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
            const delivery = await SupplierDeliveryModel.findOne({ _id: id.toUpperCase() })

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
}