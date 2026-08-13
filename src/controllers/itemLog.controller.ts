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
        const log = res.locals.itemLog

        try {
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

        const item = res.locals.item

        const session = await mongoose.startSession()
        session.startTransaction()
        
        try {
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

        const currentLog = res.locals.itemLog
        const item = res.locals.item

        const session = await mongoose.startSession()
        session.startTransaction()

        try {
            if (itemId.toUpperCase() == currentLog.itemId) {
                let finalStock = item.stock

                let logs = await ItemLogModel.find({ itemId: itemId.toUpperCase() }).session(session)

                for (const log of logs) {
                    finalStock = finalStock - log.inQuantity + log.outQuantity
                }

                await ItemLogModel.deleteOne({ itemId: itemId.toUpperCase(), createdAt: currentLog.createdAt }).session(session)

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
            }
            else {
                let prevItemFinalStock = currentLog.finalStock
                let newItemFinalStock = item.stock

                let logs = await ItemLogModel.find({ itemId: currentLog.itemId }).session(session)

                for (const log of logs) {
                    prevItemFinalStock = prevItemFinalStock - log.inQuantity + log.outQuantity
                }

                logs = await ItemLogModel.find({ itemId: itemId.toUpperCase() }).session(session)

                for (const log of logs) {
                    newItemFinalStock = newItemFinalStock - log.inQuantity + log.outQuantity
                }

                await ItemLogModel.deleteOne({ itemId: currentLog.itemId, createdAt: currentLog.createdAt }).session(session)

                await ItemLogModel.findOneAndUpdate(
                    { itemId: itemId.toUpperCase(), createdAt },
                    {
                        $set: { finalStock: 0 },
                        $inc: { inQuantity, outQuantity }
                    },
                    { upsert: true, session }
                )

                logs = await ItemLogModel.find({ itemId: currentLog.itemId }).sort({ createdAt: 1 }).session(session)

                for (const log of logs) {
                    prevItemFinalStock += log.inQuantity - log.outQuantity

                    if (prevItemFinalStock < 0) {
                        await session.abortTransaction()
                        session.endSession()

                        return res.status(400).json({
                            message: `Stok barang dengan kode ${currentLog.itemId} tidak mencukupi.`,
                            data: null
                        })
                    }

                    await ItemLogModel.updateOne({ _id: log._id }, { finalStock: prevItemFinalStock }).session(session)
                }

                logs = await ItemLogModel.find({ itemId: itemId.toUpperCase() }).sort({ createdAt: 1 }).session(session)

                for (const log of logs) {
                    newItemFinalStock += log.inQuantity - log.outQuantity

                    if (newItemFinalStock < 0) {
                        await session.abortTransaction()
                        session.endSession()

                        return res.status(400).json({
                            message: `Stok barang dengan kode ${itemId} tidak mencukupi.`,
                            data: null
                        })
                    }

                    await ItemLogModel.updateOne({ _id: log._id }, { finalStock: newItemFinalStock }).session(session)
                }

                await ItemModel.updateOne({ id: currentLog.itemId }, { stock: prevItemFinalStock }).session(session)
                await ItemModel.updateOne({ id: itemId.toUpperCase() }, { stock: newItemFinalStock }).session(session)
            }

            await session.commitTransaction()
            session.endSession()

            res.status(200).json({
                message: 'Berhasil mengubah data mutasi stok.',
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