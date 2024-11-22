import { Router } from "express";

import {
  getLeads,
  getLead,
  postLead,
  getNewLeads,
} from "../controllers/leadController";

const router = Router();

router.get("/", getLeads);
router.post("/", postLead);

router.get("/:leadId", getLead);

router.get("/update/bot", getNewLeads);

export default router;
