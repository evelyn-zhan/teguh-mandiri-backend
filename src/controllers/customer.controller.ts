import { Request, Response } from "express"

import CustomerModel from "../models/customer.model"

export type TCustomer = {
    id: string
    name: string
    phone: string
    email: string
    address: string
}

export default {
    async getAllCustomers(req: Request, res: Response) {
        try {
            const customers = await CustomerModel.find()

            const data = customers.map((customer) => {
                return { id: customer._id, name: customer.name, phone: customer.phone, email: customer.email, address: customer.address }
            })

            res.status(200).json({
                message: "Berhasil mengambil data pelanggan.",
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
    async getCustomerById(req: Request<{ id: string }>, res: Response) {
        const { id } = req.params

        try {
            const customer = await CustomerModel.findOne({ _id: id.toUpperCase() })

            if (!customer) {
                return res.status(404).json({
                    message: "Pelanggan tidak ditemukan.",
                    data: null
                })
            }

            const data = { id: customer._id, name: customer.name, phone: customer.phone, email: customer.email, address: customer.address }

            res.status(200).json({
                message: "Berhasil mengambil data pelanggan.",
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
    async addCustomer(req: Request, res: Response) {
        const { id, name, phone, email, address } = req.body as unknown as TCustomer

        try {
            await CustomerModel.create({ _id: id, name, phone, email, address })

            res.status(201).json({
                message: "Berhasil menambahkan pelanggan.",
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
    async updateCustomer(req: Request<{ id: string }>, res: Response) {
        const { id } = req.params
        const { name, phone, email, address } = req.body as unknown as TCustomer

        try {
            await CustomerModel.updateOne({ _id: id.toUpperCase() }, { name, phone, email, address })

            res.status(200).json({
                message: "Berhasil mengubah data pelanggan.",
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
    async deleteCustomer(req: Request<{ id: string }>, res: Response) {
        const { id } = req.params

        try {
            await CustomerModel.deleteOne({ _id: id.toUpperCase() })

            res.status(200).json({
                message: "Berhasil menghapus pelanggan.",
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