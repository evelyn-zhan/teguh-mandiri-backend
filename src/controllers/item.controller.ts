import { Request, Response } from "express"
import * as Yup from "yup"

import ItemModel from "../models/item.model"

type TItem = {
    id: string
    name: string
    stock: number
}

const itemDataValidation = Yup.object({
    id: Yup.string().required("Item ID is required."),
    name: Yup.string().required("Item name is required."),
    stock: Yup.number().default(0)
})

export default {
    async getAllItems(req: Request, res: Response) {
        try {
            const items = await ItemModel.find()
            res.status(200).json({
                message: "Items fetched successfully.",
                data: items
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
            const item = await ItemModel.findOne({ id: id.toUpperCase() })

            if (!item) {
                return res.status(404).json({
                    message: "Item not found.",
                    data: null
                })
            }

            res.status(200).json({
                message: "Item fetched successfully.",
                data: item
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
                    message: "Item with this ID already exists.",
                    data: null
                })
            }

            const item = await ItemModel.create({ _id: id, name, stock })

            res.status(201).json({
                message: "Item added successfully.",
                data: item
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
                    message: "Item not found.",
                    data: null
                })
            }

            await itemDataValidation.validate({ id, name, stock })

            const updatedItem = await ItemModel.findOneAndUpdate({ _id: id.toUpperCase() }, { name, stock }, { new: true })
            
            res.status(200).json({
                message: "Item data updated successfully.",
                data: updatedItem
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
                    message: "Item not found.",
                    data: null
                })
            }

            await ItemModel.findOneAndDelete({ _id: id.toUpperCase() })

            res.status(200).json({
                message: "Item deleted successfully.",
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