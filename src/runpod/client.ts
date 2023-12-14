require('dotenv').config(); // Load environment variables from .env file
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import R from 'ramda';
import {inferenceRequestData, trainRequestData} from './config';

class RunpodClient {
    baseEndpoint: string = "https://api.runpod.ai/v2/";
    inferEndpoint: string;
    trainEndpoint: string;
    apiKey?: string;
    inferRequestData: InferenceRequestData = inferenceRequestData;
    trainRequestData: any = trainRequestData;
    
    constructor(inferEndpoint:string, trainEndpoint:string, apiKey?:string) {
        this.inferEndpoint = inferEndpoint;
        this.trainEndpoint = trainEndpoint;
        this.apiKey = apiKey;        
    }

    async train(zipPath: string, outputPath: string, webhookUrl:string): Promise<string> {
      return this.sendTrainRequest('run', zipPath, outputPath, webhookUrl)
    }

    async trainsync(zipPath: string, outputPath: string): Promise<string> {
      return this.sendTrainRequest('runsync', zipPath, outputPath)
    }

    private async sendTrainRequest(urlSuffix:string, zipPath:string, outputPath:string, webhookUrl: string|null = null) : Promise<string> {
      let requestData = R.clone(this.trainRequestData)
      requestData["input"]["zipfile_path"] = zipPath
      requestData["input"]["output_path"] = outputPath
      if (webhookUrl != null) {
        requestData["webhook"] = webhookUrl
      }
      const requestConfig: AxiosRequestConfig = {
          method: 'post',
          maxBodyLength: Infinity,
          url: this.trainEndpoint + urlSuffix,
          headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.apiKey}`,
          },
          data: JSON.stringify(requestData),
      };
      try {
          const response: AxiosResponse = await axios.request(requestConfig);
          return response.data;
      } catch (error) {
          console.error(error);
          throw error;
      }
    }

    async infer(loraPath: string, outputPath:string, webhookUrl:string): Promise<InferResponse> {
        return this.sendInferRequest('run', loraPath, outputPath, webhookUrl);
    }

    async infersync(loraPath: string, outputPath:string): Promise<string> {
        return this.sendInferRequest('runsync', loraPath, outputPath);
    }

    private async sendInferRequest(urlSuffix: string, loraPath: string, outputPath:string, webhookUrl: string|null = null): Promise<any> {

        let requestData = R.clone(this.inferRequestData) 
        requestData["input"]["output_path"]= outputPath;
        requestData["input"]["prompt"]["11"]["inputs"]["lora_name"] = loraPath;
        if (webhookUrl !== null) {
            requestData["webhook"] = webhookUrl
        }

        const requestConfig: AxiosRequestConfig = {
            method: 'post',
            maxBodyLength: Infinity,
            url: this.inferEndpoint + urlSuffix,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.apiKey}`,
            },
            data: JSON.stringify(requestData),
        };

        try {
            const response: AxiosResponse = await axios.request(requestConfig);
            return response.data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async checkInferStatus(jobId: string): Promise<void> {
        const url = `${this.inferEndpoint}status/${jobId}`;

        const requestConfig:  AxiosRequestConfig = {
          method: 'get',
          url: url,
          headers: {
              Authorization: `Bearer ${this.apiKey}`,
          },
      };
      
        try {
            const response:AxiosResponse = await axios.request(requestConfig);
      
            if (response.data.status === 'COMPLETED') {
              console.log('Job completed:', response.data);
            } else if (response.data.status === 'IN_QUEUE') {
              console.log('Job in queue...');
            } else {
              console.log('Job status:', response.data.status);
            }
            return response.data
        } catch (error) {
          console.error('An error occurred:', error);
        }
      };
}

interface InferenceRequestData {
    input: {
      output_path: string;
      prompt: any; // 이 부분은 실제 구조에 맞게 정의 필요
      // 다른 필드들...
    },
    webhook?: any
  }

interface InferResponse {
    id: string;
    status: string;
}
  

export {RunpodClient};