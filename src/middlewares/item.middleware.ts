import { Request, Response, NextFunction } from "express"

import * as Yup from "yup"

import { TItem } from "../controllers/item.controller"

import ItemModel from "../models/item.model"

const itemDataValidation = Yup.object({
    id: Yup.string().required("ID Barang diperlukan."),
    name: Yup.string().required("Nama Barang diperlukan."),
    stock: Yup.number().default(0)
})

export default {
    async validateItemData(req: Request, res: Response, next: NextFunction) {
        const { id, name, stock } = req.body as unknown as TItem

        try {
            await itemDataValidation.validate({ id, name, stock })
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
    async validateItemId(req: Request<{ id: string }>, res: Response, next: NextFunction) {
        const { id } = req.params

        const item = await ItemModel.findOne({ _id: id.toUpperCase() })

        if (!item) {
            return res.status(404).json({
                message: "Barang tidak ditemukan.",
                data: null
            })
        }

        next()
    },
    async validateItemExistance(req: Request, res: Response, next: NextFunction) {
        const { id } = req.body

        const item = await ItemModel.findOne({ _id: id.toUpperCase() })

        if (item) {
            return res.status(400).json({
                message: "Sudah ada barang dengan ID ini.",
                data: null
            })
        }

        next()
    }
}