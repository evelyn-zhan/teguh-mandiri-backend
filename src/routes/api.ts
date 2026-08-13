import express from 'express'
import itemMiddleware from '../middlewares/item.middleware'
import itemLogController from '../controllers/itemLog.controller'
import itemController from '../controllers/item.controller'
import itemLogMiddleware from '../middlewares/itemLog.middleware'

const router = express.Router()

router.get('/items', itemController.getAllItems)
router.get('/items/:id', itemMiddleware.checkItemExistence, itemController.getItemById)
router.post('/items', itemMiddleware.validateItemData, itemMiddleware.checkDuplicateItem, itemController.addItem)
router.put('/items/:id', itemMiddleware.validateItemData, itemMiddleware.checkItemExistence, itemController.updateItem)
router.delete('/items/:id', itemMiddleware.checkItemExistence, itemController.deleteItem)

router.get('/item-logs', itemLogController.getAllLogs)
router.get('/item-logs/:id', itemLogMiddleware.checkItemLogExistence, itemLogController.getLogById)
router.post('/item-logs', itemLogMiddleware.validateItemLogData, itemLogController.addLog)
router.put('/item-logs/:id', itemLogMiddleware.validateItemLogData, itemLogMiddleware.checkItemLogExistence, itemLogController.updateLog)
router.delete('/item-logs/:id', itemLogMiddleware.checkItemLogExistence, itemLogController.deleteLog)

export default router