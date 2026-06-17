import express from "express"

import itemController from "../controllers/item.controller"
import supplierController from "../controllers/supplier.controller"
import purchaseOrderController from "../controllers/purchaseOrder.controller"

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

router.get("/procurement/purchase-orders", purchaseOrderController.getAllOrders)
router.get("/procurement/purchase-orders/:id", purchaseOrderController.getOrderById)
router.post("/procurement/purchase-orders", purchaseOrderController.addOrder)
router.put("/procurement/purchase-orders/:id", purchaseOrderController.updateOrder)
router.delete("/procurement/purchase-orders/:id", purchaseOrderController.deleteOrder)

export default router