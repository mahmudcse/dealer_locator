import express from "express";
import { getAllDealers, getDealerById, createDealer, updateDealer, deleteDealer, searchByPostalCode, searchByPlace, searchByRadius, filterByManufacturer, exportDealersCSV, exportDealersExcel, } from "../controllers/dealerController.js";
const router = express.Router();
// CRUD routes
router.get("/", getAllDealers);
router.get("/:id", getDealerById);
router.post("/", createDealer);
router.put("/:id", updateDealer);
router.delete("/:id", deleteDealer);
// Search routes
router.get("/search/postal-code", searchByPostalCode);
router.get("/search/place", searchByPlace);
router.get("/search/radius", searchByRadius);
router.get("/filter/manufacturer", filterByManufacturer);
// Export routes
router.get("/export/csv", exportDealersCSV);
router.get("/export/excel", exportDealersExcel);
export default router;
//# sourceMappingURL=dealerRoutes.js.map