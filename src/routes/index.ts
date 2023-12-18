import { Router } from "express";
import multer from 'multer';

import InferController from "../controllers/inferController";
import TrainController from "../controllers/trainController";
import webhookRouter from "./webhook";



const storage:multer.StorageEngine = multer.memoryStorage()
const upload: multer.Multer = multer({ storage: storage})

const router = Router();
const inferController = new InferController();
const trainController = new TrainController();

router.get("/users/:user_id/train-images", trainController.getTrainImageSet)

router.post("/users/:user_id/train-images", upload.array('images', 9), trainController.postImageSetAndTrain)

router.get("/users/:user_id/gen-images", inferController.getGenImages);

router.get("/users/:user_id/all-gen-images", inferController.getAllGenImages);

router.post("/users/:user_id/gen-images", inferController.infer);

router.get("/test", function(req, res, next) {
    res.status(200).json({
      "message" : "hello from server"
        });
  });


export {router, webhookRouter};