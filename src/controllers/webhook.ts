import { Request, Response } from "express";
import fs from 'fs';

class WebhookController {
    public async handleTrainComplete(req: Request, res: Response): Promise<void> {
      // webhook 데이터 처리 로직
      console.log("Webhook received:", req.body);
      logWebhookData("Webhook received:")
      logWebhookData(req.body)
  
      res.status(200).send("Webhook processed");
    }

    public async handleInferComplete(req: Request, res: Response): Promise<void> {
      // webhook 데이터 처리 로직
      console.log("Webhook received:", req.body);
  
      res.status(200).send("Webhook processed");
    }
}

function logWebhookData(data: any) {
  const logFileName = 'webhook.log';

  // 현재 날짜 및 시간을 포함한 로그 메시지 생성
  const logMessage = `${new Date().toISOString()}: ${JSON.stringify(data)}\n`;

  // 로그 파일에 데이터 추가
  fs.appendFile(logFileName, logMessage, (err) => {
    if (err) {
      console.error('Failed to log webhook data:', err);
    } else {
      console.log('Webhook data logged successfully.');
    }
  });
}
export {WebhookController};