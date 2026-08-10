import express from "express"

import itemMiddleware from "../middlewares/item.middleware"

import itemController from "../controllers/item.controller"

const router = express.Router()

router.get("/items", itemController.getAllItems)
router.get("/items/:id", itemMiddleware.checkItemExistence, itemController.getItemById)
router.post("/items", itemMiddleware.validateItemData, itemMiddleware.checkDuplicateItem, itemController.addItem)
router.put("/items/:id", itemMiddleware.checkItemExistence, itemMiddleware.validateItemData, itemController.updateItem)
router.delete("/items/:id", itemMiddleware.checkItemExistence, itemController.deleteItem)

export default router