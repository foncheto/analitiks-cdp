import { Router } from "express";

import { getSale, getSales, postSale } from "../controllers/saleController";

const router = Router();

router.get("/", getSales);
router.post("/", postSale);

router.get("/:saleId", getSale);

export default router;
