import { Router } from "express";
import TrainController from "../controllers/controller";

class TrainRoutes {
  router = Router();
  controller = new TrainController();

  constructor() {
    this.intializeRoutes();
  }

  intializeRoutes() {
    this.router.post("/users/:user_id/train-images", this.controller.addImagesAndTrain);

    this.router.get("/users/:user_id/train-images", this.controller.getTrainImages);

  }
}

export default new TrainRoutes().router;