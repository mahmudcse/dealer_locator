import express from "express";
import {
  getAllDealers,
  getDealerById,
  createDealer,
  updateDealer,
  deleteDealer,
  searchByPostalCode,
  searchByPlace,
  searchByRadius,
  filterByManufacturer,
  exportDealersCSV,
  exportDealersExcel,
} from "./dealer.controller.js";
import {
  scrapeDealersFromWeb,
  scrapeDealersPreview,
} from "../scraper/scraper.controller.js";

const router = express.Router();

// CRUD routes
router.get("/", getAllDealers);
router.post("/", createDealer);

// Search routes (must come before /:id)
router.get("/search/postal-code", searchByPostalCode);
router.get("/search/place", searchByPlace);
router.get("/search/radius", searchByRadius);
router.get("/filter/manufacturer", filterByManufacturer);

// Export routes (must come before /:id)
router.get("/export/csv", exportDealersCSV);
router.get("/export/excel", exportDealersExcel);

// Scraping routes (must come before /:id)
router.get("/scrape/preview", scrapeDealersPreview);
router.get("/scrape", scrapeDealersFromWeb);

// CRUD routes with ID (must come last to avoid conflicts)
router.get("/:id", getDealerById);
router.put("/:id", updateDealer);
router.delete("/:id", deleteDealer);

export default router;
