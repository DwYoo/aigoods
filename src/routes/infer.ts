import { Router } from "express";
import TrainController from "../controllers/inferController";

class InferRoutes {
  router = Router();
  controller = new TrainController();

  constructor() {
    this.intializeRoutes();
  }

  intializeRoutes() {
    this.router.post("/users/:user_id/gen-images", this.controller.infer);

    this.router.get("/users/:user_id/gen-images", this.controller.getGenImageSet);

  }
}

export default new InferRoutes().router;