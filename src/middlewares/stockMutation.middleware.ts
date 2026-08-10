import { Request, Response, NextFunction } from 'express'
import * as Yup from 'yup'
import { TItemLog } from '../controllers/itemLog.controller'
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
            next()
        }
        catch (error) {
            const err = error as unknown as Error
            return res.status(400).json({
                message: err.message,
                data: null
            })
        }
    }
}