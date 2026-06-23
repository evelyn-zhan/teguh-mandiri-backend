import { Request, Response } from "express"

import SupplierModel from "../models/supplier.model"

export type TSupplier = {
    id: string
    name: string
    phone: string
    email: string
    address: string
}

export default {
    async getAllSuppliers(req: Request, res: Response) {
        try {
            const suppliers = await SupplierModel.find()

            const data = suppliers.map((supplier) => {
                return { id: supplier._id, name: supplier.name, phone: supplier.phone, email: supplier.email, address: supplier.address }
            })

            res.status(200).json({
                message: "Berhasil mengambil data supplier.",
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
    async getSupplierById(req: Request<{ id: string }>, res: Response) {
        const { id } = req.params

        try {
            const supplier = await SupplierModel.findOne({ _id: id.toUpperCase() })

            if (!supplier) {
                return res.status(404).json({
                    message: "Supplier tidak ditemukan.",
                    data: null
                })
            }

            const data = { id: supplier._id, name: supplier.name, phone: supplier.phone, email: supplier.email, address: supplier.address }

            res.status(200).json({
                message: "Berhasil mengambil data supplier.",
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
    async addSupplier(req: Request, res: Response) {
        const { id, name, phone, email, address } = req.body as unknown as TSupplier

        try {
            await SupplierModel.create({ _id: id, name, phone, email, address })

            res.status(201).json({
                message: "Berhasil menambahkan supplier.",
                data: null
            })
        }
        catch (error) {
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
            await SupplierModel.updateOne({ _id: id.toUpperCase() }, { name, phone, email, address })

            res.status(200).json({
                message: "Berhasil mengubah data supplier.",
                data: null
            })
        }
        catch (error) {
            res.status(500).json({
                message: "Internal Server Error",
                data: null
            })
        }
    },
    async deleteSupplier(req: Request<{ id: string }>, res: Response) {
        const { id } = req.params

        try {
            await SupplierModel.deleteOne({ _id: id.toUpperCase() })

            res.status(200).json({
                message: "Berhasil menghapus supplier.",
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