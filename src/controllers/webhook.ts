import { Request, Response } from "express";
import fs from 'fs';

class WebhookController {
    public async handleTrainComplete(req: Request, res: Response): Promise<void> {
      const userId:string = req.params.user_id;
      console.log("Webhook received:", req.body);

  
      res.status(200).send("Webhook processed");
    }

    public async handleInferComplete(req: Request, res: Response): Promise<void> {
      const userId:string = req.params.user_id;

      console.log("Webhook received:", req.body);
  
      res.status(200).send("Webhook processed");
    }
}



export {WebhookController};