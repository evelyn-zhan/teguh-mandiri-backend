import { Request, Response, NextFunction } from "express"

import * as Yup from "yup"

import { TSupplier } from "../controllers/supplier.controller"

import SupplierModel from "../models/supplier.model"

const supplierDataValidation = Yup.object({
    id: Yup.string().required("ID Supplier diperlukan."),
    name: Yup.string().required("Nama Supplier diperlukan."),
    phone: Yup.string().required("Nomor HP Supplier diperlukan."),
    email: Yup.string().required("E-mail Supplier diperlukan."),
    address: Yup.string()
})

export default {
    async validateSupplierData(req: Request, res: Response, next: NextFunction) {
        const { id, name, phone, email, address } = req.body as unknown as TSupplier

        try {
            await supplierDataValidation.validate({ id, name, phone, email, address })
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
    async validateSupplierId(req: Request<{ id: string }>, res: Response, next: NextFunction) {
        const { id } = req.params

        const supplier = await SupplierModel.findOne({ _id: id.toUpperCase() })

        if (!supplier) {
            return res.status(404).json({
                message: "Supplier tidak ditemukan.",
                data: null
            })
        }

        next()
    },
    async validateSupplierExistance(req: Request, res: Response, next: NextFunction) {
        const { id } = req.body

        const supplier = await SupplierModel.findOne({ _id: id.toUpperCase() })

        if (supplier) {
            return res.status(400).json({
                message: "Sudah ada barang dengan ID ini.",
                data: null
            })
        }

        next()
    }
}