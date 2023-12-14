import { Router } from "express";
import multer from 'multer';

import InferController from "../controllers/inferController";
import TrainController from "../controllers/trainController";
import {WebhookController} from "../controllers/webhook";


const storage:multer.StorageEngine = multer.memoryStorage()
const upload: multer.Multer = multer({ storage: storage})

const router = Router();
const inferController = new InferController();
const trainController = new TrainController();
const webhookController = new WebhookController();

router.get("/users/:user_id/train-images", trainController.getTrainImageSet)

router.post("/users/:user_id/train-images", upload.array('image', 9), trainController.postImageSetAndTrain)

router.get("/users/:user_id/gen-images", inferController.getGenImages);

router.post("/users/:user_id/gen-images", inferController.infer);

router.post("/webhook/train/:user_id", webhookController.handleTrainComplete);
router.post("/webhook/infer/:user_id", webhookController.handleInferComplete);
router.get("/test", function(req, res, next) {
    res.status(200).json({
      "message" : "hello from server"
        });
  });

export default router;