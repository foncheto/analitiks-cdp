import { Router } from "express";

import {
  getLeads,
  getLead,
  postLead,
  getNewLeads,
  updateLeadStatus,
} from "../controllers/leadController";

const router = Router();

router.get("/", getLeads);
router.post("/", postLead);

router.get("/:leadId", getLead);

router.get("/update/bot", getNewLeads);

router.patch("/:leadId/status", updateLeadStatus);

export default router;
