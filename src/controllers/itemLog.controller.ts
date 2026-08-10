import { Request, Response } from 'express'
import ItemLogModel from '../models/itemLog.model'

export type TItemLog = {
    itemId: string
    inQuantity: number
    outQuantity: number
    createdAt: Date
}

export default {
    async getAllLogs(req: Request, res: Response) {
        try {
            const logs = await ItemLogModel.find()

            const data = logs.map((log) => {
                return { itemId: log.itemId, inQuantity: log.inQuantity, outQuantity: log.outQuantity, createdAt: log.createdAt }
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
    async addLog(req: Request, res: Response) {
        const { itemId, inQuantity, outQuantity, createdAt } = req.body as unknown as TItemLog
        
        try {
            await ItemLogModel.create({ itemId, inQuantity, outQuantity, createdAt })

            res.status(201).json({
                message: 'Berhasil menambahkan mutasi stok.',
                data: null
            })
        }
        catch (error) {
            res.status(500).json({
                message: 'Internal Server Error',
                data: null
            })
        }
    },
    async updateLog(req: Request<{ id: string }>, res: Response) {
        const { id } = req.params
        const { itemId, inQuantity, outQuantity, createdAt } = req.body as unknown as TItemLog

        try {
            await ItemLogModel.updateOne({ _id: id }, { itemId, inQuantity, outQuantity, createdAt })
            
            res.status(200).json({
                message: 'Berhasil mengubah data mutasi stok.',
                data: null
            })
        }
        catch (error) {
            res.status(500).json({
                message: 'Internal Server Error',
                data: null
            })
        }
    },
    async deleteLog(req: Request<{ id: string }>, res: Response) {
        const { id } = req.params

        try {
            await ItemLogModel.deleteOne({ _id: id.toUpperCase() })

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