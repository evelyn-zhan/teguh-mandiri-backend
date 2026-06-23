import { Request, Response, NextFunction } from "express"

import * as Yup from "yup"

import { TCustomer } from "../controllers/customer.controller"

import CustomerModel from "../models/customer.model"

const customerDataValidation = Yup.object({
    id: Yup.string().required("ID Pelanggan diperlukan."),
    name: Yup.string().required("Nama Pelanggan diperlukan."),
    phone: Yup.string().required("Nomor HP Pelanggan diperlukan."),
    email: Yup.string().required("E-mail Pelanggan diperlukan."),
    address: Yup.string()
})

export default {
    async validateCustomerData(req: Request, res: Response, next: NextFunction) {
        const { id, name, phone, email, address } = req.body as unknown as TCustomer

        try {
            await customerDataValidation.validate({ id, name, phone, email, address })
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
    async validateCustomerId(req: Request<{ id: string }>, res: Response, next: NextFunction) {
        const { id } = req.params

        const customer = await CustomerModel.findOne({ _id: id.toUpperCase() })

        if (!customer) {
            return res.status(404).json({
                message: "Pelanggan tidak ditemukan.",
                data: null
            })
        }

        next()
    },
    async validateCustomerExistance(req: Request, res: Response, next: NextFunction) {
        const { id } = req.body

        const customer = await CustomerModel.findOne({ _id: id.toUpperCase() })

        if (customer) {
            return res.status(400).json({
                message: "Sudah ada pelanggan dengan ID ini.",
                data: null
            })
        }

        next()
    }
}