import { Router } from "express";
import multer from 'multer';

import InferController from "../controllers/inferController";
import TrainController from "../controllers/trainController";

const storage:multer.StorageEngine = multer.memoryStorage()
const upload: multer.Multer = multer({ storage: storage})

const router = Router();
const inferController = new InferController();
const trainController = new TrainController();

router.get("/users/:user_id/train-images", trainController.getTrainImageSet)

router.post("/users/:user_id/train-images", upload.array('image', 9), trainController.postImageSetAndTrain)

router.get("/users/:user_id/gen-images", inferController.getGenImageSet);

router.post("/users/:user_id/gen-images", inferController.infer);


export default router;