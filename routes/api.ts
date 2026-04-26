import express from "express"

import itemController from "../controllers/item.controller"

const router = express.Router();

router.get("/items", itemController.getAllItems)
router.post("/items", itemController.addNewItem)
router.put("/items/:id", itemController.updateItemData)
router.delete("/items/:id", itemController.deleteItem)

export default router