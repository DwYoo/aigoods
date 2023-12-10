import { Request, Response } from "express";

export default class InferController {

  async infer(req: Request, res: Response) {
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

  async getGenImageSet(req: Request, res: Response) {
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