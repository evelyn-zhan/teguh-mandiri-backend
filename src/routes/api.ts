import express from "express"

import itemController from "../controllers/item.controller"
import supplierController from "../controllers/supplier.controller"
import purchaseOrderController from "../controllers/purchaseOrder.controller"
import supplierDeliveryController from "../controllers/supplierDelivery.controller"
import customerOrderController from "../controllers/customerOrder.controller"
import salesDeliveryController from "../controllers/salesDelivery.controller"

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

router.get("/procurement/deliveries", supplierDeliveryController.getAllDeliveries)
router.get("/procurement/deliveries/:id", supplierDeliveryController.getDeliveryById)
router.post("/procurement/deliveries", supplierDeliveryController.addDelivery)
router.put("/procurement/deliveries/:id", supplierDeliveryController.updateDelivery)
router.delete("/procurement/deliveries/:id", supplierDeliveryController.deleteDelivery)

router.get("/sales/orders", customerOrderController.getAllOrders)
router.get("/sales/orders/:id", customerOrderController.getOrderById)
router.post("/sales/orders", customerOrderController.addOrder)
router.put("/sales/orders/:id", customerOrderController.updateOrder)
router.delete("/sales/orders/:id", customerOrderController.deleteOrder)

router.get("/sales/deliveries", salesDeliveryController.getAllDeliveries)
router.get("/sales/deliveries/:id", salesDeliveryController.getDeliveryById)
router.post("/sales/deliveries", salesDeliveryController.addDelivery)
router.put("/sales/deliveries/:id", salesDeliveryController.updateDelivery)
router.delete("/sales/deliveries/:id", salesDeliveryController.deleteDelivery)

export default router