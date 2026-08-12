import { Request, Response, NextFunction } from 'express'
import { Types } from 'mongoose'

import * as Yup from 'yup'

import { TItemLog } from '../controllers/itemLog.controller'

import ItemModel from '../models/item.model'
import ItemLogModel from '../models/itemLog.model'

const itemLogValidation = Yup.object({
    itemId: Yup.string().required('ID Barang diperlukan.'),
    inQuantity: Yup.number().required('Jumlah Barang Masuk diperlukan.'),
    outQuantity: Yup.number().required('Jumlah Barang Keluar diperlukan.')
})

export default {
    async validateItemLogData(req: Request, res: Response, next: NextFunction) {
        const { itemId, inQuantity, outQuantity } = req.body as TItemLog

        try {
            await itemLogValidation.validate({ itemId, inQuantity, outQuantity })

            const item = await ItemModel.findOne({ id: itemId.toUpperCase() })

            if (!item) {
                return res.status(404).json({
                    message: 'Barang dengan ID tersebut tidak ditemukan.',
                    data: null
                })
            }

            res.locals.item = item

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
    async checkItemLogExistence(req: Request<{ id: string }>, res: Response, next: NextFunction) {
        const { id } = req.params
        const log = await ItemLogModel.findOne({ _id: new Types.ObjectId(id) })

        if (!log) {
            return res.status(404).json({
                message: 'Data mutasi stok tidak ditemukan',
                data: null
            })
        }

        res.locals.itemLog = log

        next()
    }
}