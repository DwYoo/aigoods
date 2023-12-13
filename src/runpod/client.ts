require('dotenv').config(); // Load environment variables from .env file
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import R from 'ramda';
import {inferenceRequestData} from './config';

class RunpodClient {
    baseEndpoint: string = "https://api.runpod.ai/v2/";
    inferEndpoint: string;
    trainEndpoint: string;
    apiKey?: string;
    inferRequestData: InferenceRequestData = inferenceRequestData;
    
    constructor(inferEndpoint:string, trainEndpoint:string, apiKey?:string) {
        this.inferEndpoint = inferEndpoint;
        this.trainEndpoint = trainEndpoint;
        this.apiKey = apiKey;        
    }

    // async train(): Promise<string> {
        
    // }

    // async trainsync(): Promise<string> {

    // }

    async infer(outputPath:string, webhookUrl:string): Promise<string> {
        return this.sendInferRequest('run', outputPath, webhookUrl);
    }

    async infersync(outputPath:string): Promise<string> {
        return this.sendInferRequest('runsync', outputPath);
    }

    private async sendInferRequest(urlSuffix: string, outputPath:string, webhookUrl: string|null = null): Promise<string> {

        let requestData = R.clone(this.inferRequestData) 
        requestData["input"]["output_path"]= outputPath;
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
        const url = `${this.inferEndpoint}/${jobId}`;
      
        try {
          while (true) {
            const response = await axios.get<JobStatusResponse>(url);
      
            if (response.data.status === 'COMPLETED') {
              console.log('Job completed:', response.data);
              break;
            } else if (response.data.status === 'IN_QUEUE') {
              console.log('Job in queue...');
            } else {
              console.log('Job status:', response.data.status);
            }
      
            // Wait for a short period before making another request
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
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

interface JobStatusResponse {
    id: string;
    status: string;
    delayTime?: number;
    executionTime?: number;
    output?: Array<{ image: string; seed: number }>;
}
  

export {RunpodClient};