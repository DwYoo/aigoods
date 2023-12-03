require('dotenv').config(); // Load environment variables from .env file
import axios, { AxiosRequestConfig, AxiosResponse } from '../../../aigoods/node_modules/axios';
import {inferenceRequestData} from './config';

class RunpodClient {
    baseEndpoint: string = "https://api.runpod.ai/v2/";
    inferEndpoint?: string;
    trainEndpoint?: string;
    apiKey?: string;
    inferRequestData: string = inferenceRequestData;
    inferRequestConfig: AxiosRequestConfig = {};
    
    constructor(inferEndpoint?:string, trainEndpoint?:string, apiKey?:string) {
        this.inferEndpoint = inferEndpoint;
        this.trainEndpoint = trainEndpoint;
        this.apiKey = apiKey;        
    }

    async infer(): Promise<string> {
        return this.sendInferRequest('run');
    }

    async infersync(): Promise<string> {
        return this.sendInferRequest('runsync');
    }

    private async sendInferRequest(urlSuffix: string): Promise<string> {
        const requestConfig: AxiosRequestConfig = {
            method: 'post',
            maxBodyLength: Infinity,
            url: this.inferEndpoint + urlSuffix,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.apiKey}`,
            },
            data: this.inferRequestData,
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

export {RunpodClient};