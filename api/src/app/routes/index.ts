import { Router } from "express";
import dealerRoutes from "../modules/dealer/dealer.route.js";

const router = Router();

// Dealer module routes
router.use("/dealers", dealerRoutes);

export default router;

