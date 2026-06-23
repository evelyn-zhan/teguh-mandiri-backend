import express from "express"

import itemMiddleware from "../middlewares/item.middleware"
import supplierMiddleware from "../middlewares/supplier.middleware"
import purchaseOrderMiddleware from "../middlewares/purchaseOrder.middleware"
import supplierDeliveryMiddleware from "../middlewares/supplierDelivery.middleware"
import customerOrderMiddleware from "../middlewares/customerOrder.middleware"

import itemController from "../controllers/item.controller"
import supplierController from "../controllers/supplier.controller"
import purchaseOrderController from "../controllers/purchaseOrder.controller"
import supplierDeliveryController from "../controllers/supplierDelivery.controller"
import customerOrderController from "../controllers/customerOrder.controller"
import salesDeliveryController from "../controllers/salesDelivery.controller"

const router = express.Router()

router.get("/items", itemController.getAllItems)
router.get("/items/:id", itemController.getItemById)
router.post("/items", itemMiddleware.validateItemData, itemMiddleware.validateItemExistance, itemController.addItem)
router.put("/items/:id", itemMiddleware.validateItemId, itemController.updateItem)
router.delete("/items/:id", itemMiddleware.validateItemId, itemController.deleteItem)

router.get("/suppliers", supplierController.getAllSuppliers)
router.get("/suppliers/:id", supplierController.getSupplierById)
router.post("/suppliers", supplierMiddleware.validateSupplierData, supplierMiddleware.validateSupplierExistance, supplierController.addSupplier)
router.put("/suppliers/:id", supplierMiddleware.validateSupplierId, supplierController.updateSupplier)
router.delete("/suppliers/:id", supplierMiddleware.validateSupplierId, supplierController.deleteSupplier)

router.get("/procurement/purchase-orders", purchaseOrderController.getAllOrders)
router.get("/procurement/purchase-orders/:id", purchaseOrderController.getOrderById)
router.post(
    "/procurement/purchase-orders",
    purchaseOrderMiddleware.validatePurchaseOrderData,
    purchaseOrderMiddleware.validatePurchaseOrderExistance,
    purchaseOrderMiddleware.validatePurchaseOrderRefs,
    purchaseOrderController.addOrder
)
router.put(
    "/procurement/purchase-orders/:id",
    purchaseOrderMiddleware.validatePurchaseOrderId,
    purchaseOrderMiddleware.validatePurchaseOrderRefs,
    purchaseOrderController.updateOrder
)
router.delete(
    "/procurement/purchase-orders/:id",
    purchaseOrderMiddleware.validatePurchaseOrderId,
    purchaseOrderController.deleteOrder
)

router.get("/procurement/deliveries", supplierDeliveryController.getAllDeliveries)
router.get("/procurement/deliveries/:id", supplierDeliveryController.getDeliveryById)
router.post(
    "/procurement/deliveries",
    supplierDeliveryMiddleware.validateSupplierDeliveryData,
    supplierDeliveryMiddleware.validateSupplierDeliveryExistance,
    supplierDeliveryMiddleware.validateSupplierDeliveryRefs,
    supplierDeliveryController.addDelivery
)
router.put(
    "/procurement/deliveries/:id",
    supplierDeliveryMiddleware.validateSupplierDeliveryId,
    supplierDeliveryMiddleware.validateSupplierDeliveryRefs,
    supplierDeliveryController.updateDelivery
)
router.delete(
    "/procurement/deliveries/:id",
    supplierDeliveryMiddleware.validateSupplierDeliveryId,
    supplierDeliveryController.deleteDelivery
)

router.get("/sales/orders", customerOrderController.getAllOrders)
router.get("/sales/orders/:id", customerOrderController.getOrderById)
router.post(
    "/sales/orders",
    customerOrderMiddleware.validateCustomerOrderData,
    customerOrderMiddleware.validateCustomerOrderExistance,
    customerOrderMiddleware.validateCustomerOrderRefs,
    customerOrderController.addOrder
)
router.put(
    "/sales/orders/:id",
    customerOrderMiddleware.validateCustomerOrderId,
    customerOrderMiddleware.validateCustomerOrderRefs,
    customerOrderController.updateOrder
)
router.delete(
    "/sales/orders/:id",
    customerOrderMiddleware.validateCustomerOrderId,
    customerOrderController.deleteOrder
)

router.get("/sales/deliveries", salesDeliveryController.getAllDeliveries)
router.get("/sales/deliveries/:id", salesDeliveryController.getDeliveryById)
router.post(
    "/sales/deliveries",
    supplierDeliveryMiddleware.validateSupplierDeliveryData,
    supplierDeliveryMiddleware.validateSupplierDeliveryExistance,
    supplierDeliveryMiddleware.validateSupplierDeliveryRefs,
    salesDeliveryController.addDelivery
)
router.put(
    "/sales/deliveries/:id",
    supplierDeliveryMiddleware.validateSupplierDeliveryId,
    supplierDeliveryMiddleware.validateSupplierDeliveryRefs,
    salesDeliveryController.updateDelivery
)
router.delete(
    "/sales/deliveries/:id",
    supplierDeliveryMiddleware.validateSupplierDeliveryId,
    salesDeliveryController.deleteDelivery
)

export default router