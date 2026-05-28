import { Router, type IRouter } from "express";
import healthRouter from "./health";
import propertiesRouter from "./properties";
import listingsRouter from "./listings";
import kycRouter from "./kyc";
import usersRouter from "./users";
import dashboardRouter from "./dashboard";
import inquiriesRouter from "./inquiries";
import newslettersRouter from "./newsletters";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/properties", propertiesRouter);
router.use("/listings", listingsRouter);
router.use("/kyc", kycRouter);
router.use("/users", usersRouter);
router.use("/dashboard", dashboardRouter);
router.use("/inquiries", inquiriesRouter);
router.use("/newsletters", newslettersRouter);

export default router;
