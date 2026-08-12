import { Request, Response } from 'express'
import mongoose, { Types } from 'mongoose'

import ItemModel from '../models/item.model'
import ItemLogModel from '../models/itemLog.model'

export type TItemLog = {
    itemId: string
    inQuantity: number
    outQuantity: number
    finalStock: number
    createdAt: string
}

export default {
    async getAllLogs(req: Request, res: Response) {
        try {
            const logs = await ItemLogModel.find().sort({ createdAt: -1 })

            const data = logs.map((log) => {
                return {
                    _id: log._id,
                    itemId: log.itemId,
                    inQuantity: log.inQuantity,
                    outQuantity: log.outQuantity,
                    finalStock: log.finalStock,
                    createdAt: log.createdAt
                }
            })

            res.status(200).json({
                message: 'Berhasil mengambil riwayat mutasi stok.',
                data
            })
        }
        catch (error) {
            res.status(500).json({
                message: 'Internal Server Error',
                data: null
            })
        }
    },
    async getLogById(req: Request, res: Response) {
        try {
            const log = res.locals.itemLog
            const data = {
                _id: log._id,
                itemId: log.itemId,
                inQuantity: log.inQuantity,
                outQuantity: log.outQuantity,
                finalStock: log.finalStock,
                createdAt: log.createdAt
            }
    
            res.status(200).json({
                message: 'Berhasil mengambil data mutasi stok.',
                data
            })
        }
        catch (error) {
            res.status(500).json({
            message: 'Internal Server Error',
                data: null
            })
        }
    },
    async addLog(req: Request, res: Response) {
        const { itemId, inQuantity, outQuantity, createdAt } = req.body as unknown as TItemLog

        const session = await mongoose.startSession()
        session.startTransaction()
        
        try {
            const item = res.locals.item

            let finalStock = item.stock

            let logs = await ItemLogModel.find({ itemId: itemId.toUpperCase() }).session(session)

            for (const log of logs) {
                finalStock = finalStock - log.inQuantity + log.outQuantity
            }

            await ItemLogModel.findOneAndUpdate(
                { itemId: itemId.toUpperCase(), createdAt },
                {
                    $set: { finalStock: 0 },
                    $inc: { inQuantity, outQuantity }
                },
                { upsert: true, session }
            )

            logs = await ItemLogModel.find({ itemId: itemId.toUpperCase() }).sort({ createdAt: 1 }).session(session)

            for (const log of logs) {
                finalStock += log.inQuantity - log.outQuantity

                if (finalStock < 0) {
                    await session.abortTransaction()
                    session.endSession()

                    return res.status(400).json({
                        message: 'Stok barang tidak mencukupi.',
                        data: null
                    })
                }

                await ItemLogModel.updateOne({ _id: log._id }, { finalStock }).session(session)
            }

            await ItemModel.updateOne({ id: itemId.toUpperCase() }, { stock: finalStock }).session(session)

            await session.commitTransaction()
            session.endSession()

            res.status(201).json({
                message: 'Berhasil menambahkan mutasi stok.',
                data: null
            })
        }
        catch (error) {
            await session.abortTransaction()
            session.endSession()

            res.status(500).json({
                message: 'Internal Server Error',
                data: null
            })
        }
    },
    async updateLog(req: Request, res: Response) {
        const { itemId, inQuantity, outQuantity, createdAt } = req.body as unknown as TItemLog

        try {
            const currentLog = res.locals.itemLog
            const item = res.locals.item

            res.status(200).json({
                message: 'Berhasil mengubah data mutasi stok.',
                data: null
            })
        }
        catch (error) {
            console.log(error)
            res.status(500).json({
                message: 'Internal Server Error',
                data: null
            })
        }
    },
    async deleteLog(req: Request<{ id: string }>, res: Response) {
        const { id } = req.params

        try {
            await ItemLogModel.deleteOne({ _id: new Types.ObjectId(id) })

            res.status(200).json({
                message: 'Berhasil menghapus mutasi stok.',
                data: null
            })
        }
        catch (error) {
            res.status(500).json({
                message: 'Internal Server Error',
                data: null
            })
        }
    }
}