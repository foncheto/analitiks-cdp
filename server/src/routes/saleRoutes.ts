import { Router } from "express";

import {
  getSale,
  getSales,
  postSale,
  getSalesData,
  uploadSalesCSV,
} from "../controllers/saleController";

const router = Router();

router.get("/", getSales);
router.post("/", postSale);

router.get("/:saleId", getSale);

router.get("/test/download", getSalesData);

router.post("/upload-csv", uploadSalesCSV); // New endpoint

export default router;
