import { Request, Response } from "express"
import * as Yup from "yup"

import PurchaseOrderModel, { IOrderItem } from "../models/purchaseOrder.model"
import { idText } from "typescript"

type TPurchaseOrder = {
    id: string
    supplier: string
    items: IOrderItem[]
    expectedDeliveryDate: Date
}

const purchaseOrderValidation = Yup.object({
    id: Yup.string().required("Purchase Order ID is required."),
    supplier: Yup.string().required("Supplier name is required."),
    items: Yup.array().of(
        Yup.object({
            name: Yup.string().required("Item name is required."),
            quantity: Yup.number().required("Item quantity is required."),
            received: Yup.number().default(0)
        })
    )
    .min(1, "Items are required.")
    .required("Items are required."),
    expectedDeliveryDate: Yup.string().required("Expected delivery date is required.")
})

export default {
    async getAllOrders(req: Request, res: Response) {
        try {
            const purchaseOrders = await PurchaseOrderModel.find()
            res.status(200).json({
                message: "Purchase orders fetched successfully.",
                data: purchaseOrders
            })
        }
        catch (error) {
            res.status(500).json({
                message: "Internal Server Error",
                data: null
            })
        }
    },
    async getOrderById(req: Request<{ id: string }>, res: Response) {
        const { id } = req.params

        try {
            const purchaseOrder = await PurchaseOrderModel.findOne({ id: id.toUpperCase() })

            if (!purchaseOrder) {
                return res.status(404).json({
                    message: "Purchase order not found.",
                    data: null
                })
            }

            res.status(200).json({
                message: "Purchase order fetched successfully.",
                data: purchaseOrder
            })
        }
        catch (error) {
            res.status(500).json({
                message: "Internal Server Error",
                data: null
            })
        }
    },
    async addOrder(req: Request, res: Response) {
        const { id, supplier, items, expectedDeliveryDate } = req.body as unknown as TPurchaseOrder

        try {
            const parsedDate = new Date(expectedDeliveryDate)

            await purchaseOrderValidation.validate({ id, supplier, items, expectedDeliveryDate: parsedDate })

            const existingOrder = await PurchaseOrderModel.findOne({ _id: id.toUpperCase() })

            if (existingOrder) {
                return res.status(400).json({
                    message: "Purchase order with this ID already exists.",
                    data: null
                })
            }

            const purchaseOrder = await PurchaseOrderModel.create({ _id: id, supplier, items, expectedDeliveryDate: parsedDate })

            res.status(201).json({
                message: "Purchase order added successfully.",
                data: {
                    ...purchaseOrder.toJSON(),
                    expectedDeliveryDate: purchaseOrder.expectedDeliveryDate.toISOString().split("T")[0]
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
    async updateOrder(req: Request<{ id: string }>, res: Response) {
        const { id } = req.params
        const { supplier, items, expectedDeliveryDate } = req.body as unknown as TPurchaseOrder

        try {
            const order = await PurchaseOrderModel.findOne({ _id: id.toUpperCase() })

            if (!order) {
                return res.status(404).json({
                    message: "Purchase order not found.",
                    data: null
                })
            }

            const parsedDate = new Date(expectedDeliveryDate)

            await purchaseOrderValidation.validate({ id, supplier, items, expectedDeliveryDate: parsedDate })

            const updatedOrder = await PurchaseOrderModel.findOneAndUpdate({ _id: id.toUpperCase() }, { supplier, items, expectedDeliveryDate: parsedDate }, { new: true })

            res.status(200).json({
                message: "Purchase order updated successfully.",
                data: {
                    ...updatedOrder!.toJSON(),
                    expectedDeliveryDate: updatedOrder!.expectedDeliveryDate.toISOString().split("T")[0]
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
    async deleteOrder(req: Request<{ id: string }>, res: Response) {
        const { id } = req.params
        
        try {
            const order = await PurchaseOrderModel.findOne({ _id: id.toUpperCase() })

            if (!order) {
                return res.status(404).json({
                    message: "Purchase order not found.",
                    data: null
                })
            }

            await PurchaseOrderModel.findOneAndDelete({ _id: id.toUpperCase() })

            res.status(200).json({
                message: "Purchase order deleted successfully.",
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