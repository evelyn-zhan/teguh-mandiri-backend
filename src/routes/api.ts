import express from "express"

import itemController from "../controllers/item.controller"
import supplierController from "../controllers/supplier.controller"

const router = express.Router();

router.get("/items", itemController.getAllItems)
router.get("/items/:id", itemController.getItemById)
router.post("/items", itemController.addItem)
router.put("/items/:id", itemController.updateItem)
router.delete("/items/:id", itemController.deleteItem)

router.get("/suppliers", supplierController.getAllSuppliers)
router.get("/suppliers/:id", supplierController.getSupplierById)
router.post("/suppliers", supplierController.addSupplier)
router.put("/suppliers/:id", supplierController.updateSupplier)
router.delete("/suppliers/:id", supplierController.deleteSupplier)

export default router