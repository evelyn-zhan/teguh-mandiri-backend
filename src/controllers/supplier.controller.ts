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
    id: Yup.string().required("Supplier ID is required."),
    name: Yup.string().required("Supplier name is required."),
    phone: Yup.string().required("Supplier phone is required."),
    email: Yup.string().required("Supplier e-mail is required."),
    address: Yup.string()
})

export default {
    async getAllSuppliers(req: Request, res: Response) {
        try {
            const suppliers = await SupplierModel.find()
            res.status(200).json({
                message: "Suppliers fetched successfully.",
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
                    message: "Supplier not found.",
                    data: null
                })
            }

            res.status(200).json({
                message: "Supplier fetched successfully.",
                data: supplier
            })
        }
        catch (error) {
            res.status(400).json({
                message: "Internal Server Error",
                data: null
            })
        }
    },
    async addSupplier(req: Request, res: Response) {
        const { id, name, phone, email, address } = req.body as unknown as TSupplier

        try {
            await supplierDataValidation.validate({ id, name, phone, email, address })

            const existingSupplier = await SupplierModel.findOne({ id: id.toUpperCase() })

            if (existingSupplier) {
                return res.status(400).json({
                    message: "Supplier with this ID already exists.",
                    data: null
                })
            }

            const supplier = await SupplierModel.create({ id, name, phone, email, address })

            res.status(201).json({
                message: "Supplier added successfully.",
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
            const supplier = await SupplierModel.findOne({ id: id.toUpperCase() })

            if (!supplier) {
                return res.status(404).json({
                    message: "Supplier not found.",
                    data: null
                })
            }

            await supplierDataValidation.validate({ id, name, phone, email, address })

            const updatedSupplier = await SupplierModel.findOneAndUpdate({ id: id.toUpperCase() }, { name, phone, email, address }, { new: true })

            res.status(200).json({
                message: "Supplier data updated successfully.",
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
            const supplier = await SupplierModel.findOne({ id: id.toUpperCase() })

            if (!supplier) {
                return res.status(404).json({
                    message: "Supplier not found.",
                    data: null
                })
            }

            await SupplierModel.findOneAndDelete({ id: id.toUpperCase() })

            res.status(200).json({
                message: "Supplier deleted successfully.",
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