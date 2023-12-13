require('dotenv').config(); // Load environment variables from .env file
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import R from 'ramda';
import {inferenceRequestData} from './config';

class RunpodClient {
    baseEndpoint: string = "https://api.runpod.ai/v2/";
    inferEndpoint?: string;
    trainEndpoint?: string;
    apiKey?: string;
    inferRequestData: InferenceRequestData = inferenceRequestData;
    
    constructor(inferEndpoint?:string, trainEndpoint?:string, apiKey?:string) {
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

        const requestConfig: AxiosRequestConfig = {
            method: 'post',
            maxBodyLength: Infinity,
            url: this.inferEndpoint + urlSuffix,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.apiKey}`,
            },
            data: requestData,
        };

        try {
            const response: AxiosResponse = await axios.request(requestConfig);
            return response.data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

interface InferenceRequestData {
    input: {
      output_path: string;
      prompt: any; // 이 부분은 실제 구조에 맞게 정의 필요
      // 다른 필드들...
    }
  }

  
export {RunpodClient};