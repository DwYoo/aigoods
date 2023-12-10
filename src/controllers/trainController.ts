import { Request, Response } from "express";

export default class TrainController {

  async addImageSetAndTrain(req: Request, res: Response) {
    try {
      res.status(200).json({
        message: "findAll OK"
      });
    } catch (err) {
      res.status(500).json({
        message: "Internal Server Error!"
      });
    }
  }

  async getTrainImageSet(req: Request, res: Response) {
    try {
      res.status(200).json({
        message: "findOne OK",
        reqParamId: req.params.id
      });
    } catch (err) {
      res.status(500).json({
        message: "Internal Server Error!"
      });
    }
  }

}