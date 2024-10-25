import { Router } from "express";

import {
  getClient,
  getClients,
  postClient,
} from "../controllers/clientController";

const router = Router();

router.get("/", getClients);
router.post("/", postClient);

router.get("/:clientId", getClient);

export default router;
