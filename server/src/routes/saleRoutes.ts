import { Router } from "express";

import {
  getSale,
  getSales,
  postSale,
  getSalesData,
  uploadSalesData,
} from "../controllers/saleController";

const router = Router();

router.get("/", getSales);
router.post("/", postSale);

router.get("/:saleId", getSale);

router.get("/test/download", getSalesData);

router.post("/test/upload", uploadSalesData);

export default router;
