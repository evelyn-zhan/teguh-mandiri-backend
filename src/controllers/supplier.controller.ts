import { Request, Response } from "express"
import * as Yup from "yup"

import SupplierModel from "../models/supplier.model"

type TSupplier = {
    id: string
    name: string
    phone: string
    email: string
    address: string
}

const supplierDataValidation = Yup.object({
    id: Yup.string().required("ID Supplier diperlukan."),
    name: Yup.string().required("Nama Supplier diperlukan."),
    phone: Yup.string().required("Nomor HP Supplier diperlukan."),
    email: Yup.string().required("E-mail Supplier diperlukan."),
    address: Yup.string()
})

export default {
    async getAllSuppliers(req: Request, res: Response) {
        try {
            const suppliers = await SupplierModel.find()
            res.status(200).json({
                message: "Berhasil mengambil data supplier.",
                data: suppliers
            })
        }
        catch (error) {
            res.status(500).json({
                message: "Internal Server Error",
                data: null
            })
        }
    },
    async getSupplierById(req: Request<{ id: string }>, res: Response) {
        const { id } = req.params

        try {
            const supplier = await SupplierModel.findOne({ id: id.toUpperCase() })

            if (!supplier) {
                return res.status(404).json({
                    message: "Supplier tidak ditemukan.",
                    data: null
                })
            }

            res.status(200).json({
                message: "Berhasil mengambil data supplier.",
                data: supplier
            })
        }
        catch (error) {
            res.status(500).json({
                message: "Internal Server Error",
                data: null
            })
        }
    },
    async addSupplier(req: Request, res: Response) {
        const { id, name, phone, email, address } = req.body as unknown as TSupplier

        try {
            await supplierDataValidation.validate({ id, name, phone, email, address })

            const existingSupplier = await SupplierModel.findOne({ _id: id.toUpperCase() })

            if (existingSupplier) {
                return res.status(400).json({
                    message: "Sudah ada supplier dengan ID ini.",
                    data: null
                })
            }

            const supplier = await SupplierModel.create({ _id: id, name, phone, email, address })

            res.status(201).json({
                message: "Berhasil menambahkan supplier.",
                data: supplier
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
    async updateSupplier(req: Request<{ id: string }>, res: Response) {
        const { id } = req.params
        const { name, phone, email, address } = req.body as unknown as TSupplier

        try {
            const supplier = await SupplierModel.findOne({ _id: id.toUpperCase() })

            if (!supplier) {
                return res.status(404).json({
                    message: "Supplier tidak ditemukan.",
                    data: null
                })
            }

            await supplierDataValidation.validate({ id, name, phone, email, address })

            const updatedSupplier = await SupplierModel.findOneAndUpdate({ _id: id.toUpperCase() }, { name, phone, email, address }, { new: true })

            res.status(200).json({
                message: "Berhasil mengubah data supplier.",
                data: updatedSupplier
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
    async deleteSupplier(req: Request<{ id: string }>, res: Response) {
        const { id } = req.params

        try {
            const supplier = await SupplierModel.findOne({ _id: id.toUpperCase() })

            if (!supplier) {
                return res.status(404).json({
                    message: "Supplier tidak ditemukan.",
                    data: null
                })
            }

            await SupplierModel.findOneAndDelete({ _id: id.toUpperCase() })

            res.status(200).json({
                message: "Berhasil menghapus supplier.",
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