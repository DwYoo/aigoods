import { Application } from "express";
import inferRoutes from "./infer";
import trainRoutes from "./train";

export default class Routes {
  constructor(app: Application) {
    this.initializeRoutes(app);
  }

  private initializeRoutes(app: Application): void {
    app.use("/api", inferRoutes);
    app.use("/api", trainRoutes);
  }
}