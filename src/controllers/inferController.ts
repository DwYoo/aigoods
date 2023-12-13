import { Request, Response } from "express";
import { RunpodClient } from "../runpod/client";
const runpodClient:RunpodClient = new RunpodClient(process.env.INFER_ENDPOINT, process.env.TRAIN_ENDPOINT, process.env.RUNPOD_SECRET);

export default class InferController {

  async infer(req: Request, res: Response) {
    try {
      const user_id:string = req.params.user_id;
      const body = req.body; // request body에 접근
      // body를 사용하여 필요한 작업 수행
      const webhookUrl = ""

      runpodClient.infer(user_id, webhookUrl)
  
      res.status(200).json({
        
        message: "Infer OK"
      });
    } catch (err) {
      res.status(500).json({
        message: "Internal Server Error!"
      });
    }
  }

  async getGenImageSet(req: Request, res: Response) {
    try {
      const user_id:string = req.params.user_id;
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