import { Router } from "express";

import {WebhookController} from "../controllers/webhook";
const webhookController = new WebhookController();

const webhookRouter = Router();

webhookRouter.post("/webhook/train/:user_id", webhookController.handleTrainComplete);

webhookRouter.post("/webhook/infer/:user_id", webhookController.handleInferComplete);

export default webhookRouter