import { Request, Response } from "express"
import * as Yup from "yup"

import ItemModel from "../models/item.model"

type TItem = {
    id: string
    name: string
    stock: number
}

const itemDataValidation = Yup.object({
    id: Yup.string().required("ID Barang diperlukan."),
    name: Yup.string().required("Nama Barang diperlukan."),
    stock: Yup.number().default(0)
})

export default {
    async getAllItems(req: Request, res: Response) {
        try {
            const items = await ItemModel.find()

            const formattedItems = items.map((item) => ({
                ...item.toJSON(),
                id: item._id
            }))

            res.status(200).json({
                message: "Berhasil mengambil data barang.",
                data: formattedItems
            })
        }
        catch (error) {
            res.status(500).json({
                message: "Internal Server Error",
                data: null
            })
        }
    },
    async getItemById(req: Request<{ id: string }>, res: Response) {
        const { id } = req.params

        try {
            const item = await ItemModel.findOne({ _id: id.toUpperCase() })

            if (!item) {
                return res.status(404).json({
                    message: "Barang tidak ditemukan.",
                    data: null
                })
            }

            res.status(200).json({
                message: "Berhasil mengambil data barang.",
                data: {
                    ...item.toJSON(),
                    id: item._id
                }
            })
        }
        catch (error) {
            res.status(500).json({
                message: "Internal Server Error",
                data: null
            })
        }
    },
    async addItem(req: Request, res: Response) {
        const { id, name, stock } = req.body as unknown as TItem
        
        try {
            await itemDataValidation.validate({ id, name, stock })

            const existingItem = await ItemModel.findOne({ _id: id.toUpperCase() })

            if (existingItem) {
                return res.status(400).json({
                    message: "Sudah ada barang dengan ID ini.",
                    data: null
                })
            }

            const item = await ItemModel.create({ _id: id, name, stock })

            res.status(201).json({
                message: "Berhasil menambahkan barang.",
                data: {
                    ...item.toJSON(),
                    id: item._id
                }
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
    async updateItem(req: Request<{ id: string }>, res: Response) {
        const { id } = req.params
        const { name, stock } = req.body as unknown as TItem

        try {
            const item = await ItemModel.findOne({ _id: id.toUpperCase() })

            if (!item) {
                return res.status(404).json({
                    message: "Barang tidak ditemukan.",
                    data: null
                })
            }

            await itemDataValidation.validate({ id, name, stock })

            const updatedItem = await ItemModel.findOneAndUpdate({ _id: id.toUpperCase() }, { name, stock }, { new: true })
            
            res.status(200).json({
                message: "Berhasil mengubah data barang.",
                data: {
                    ...updatedItem!.toJSON(),
                    id: updatedItem!._id
                }
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
    async deleteItem(req: Request<{ id: string }>, res: Response) {
        const { id } = req.params

        try {
            const item = await ItemModel.findOne({ _id: id.toUpperCase() })

            if (!item) {
                return res.status(404).json({
                    message: "Barang tidak ditemukan.",
                    data: null
                })
            }

            await ItemModel.findOneAndDelete({ _id: id.toUpperCase() })

            res.status(200).json({
                message: "Berhasil menghapus barang.",
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