import { Router } from "express";
import TrainController from "../controllers/trainController";

class TrainRoutes {
  router = Router();
  controller = new TrainController();

  constructor() {
    this.intializeRoutes();
  }

  intializeRoutes() {
    this.router.post("/users/:user_id/train-images", this.controller.addImageSetAndTrain);

    this.router.get("/users/:user_id/train-images", this.controller.getTrainImageSet);

  }
}

export default new TrainRoutes().router;