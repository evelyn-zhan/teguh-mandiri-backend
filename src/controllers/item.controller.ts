import { Request, Response } from "express"

import ItemModel from "../models/item.model"

export type TItem = {
    id: string
    name: string
    stock: number
}

export default {
    async getAllItems(req: Request, res: Response) {
        try {
            const items = await ItemModel.find()

            const data = items.map((item) => {
                return { id: item._id, name: item.name, stock: item.stock }
            })

            res.status(200).json({
                message: "Berhasil mengambil data barang.",
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

            const data = { id: item._id, name: item.name, stock: item.stock }

            res.status(200).json({
                message: "Berhasil mengambil data barang.",
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
    async addItem(req: Request, res: Response) {
        const { id, name, stock } = req.body as unknown as TItem
        
        try {
            await ItemModel.create({ _id: id, name, stock })

            res.status(201).json({
                message: "Berhasil menambahkan barang.",
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
    async updateItem(req: Request<{ id: string }>, res: Response) {
        const { id } = req.params
        const { name, stock } = req.body as unknown as TItem

        try {
            await ItemModel.updateOne({ _id: id.toUpperCase() }, { name, stock })
            
            res.status(200).json({
                message: "Berhasil mengubah data barang.",
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
    async deleteItem(req: Request<{ id: string }>, res: Response) {
        const { id } = req.params

        try {
            await ItemModel.deleteOne({ _id: id.toUpperCase() })

            res.status(200).json({
                message: "Berhasil menghapus barang.",
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