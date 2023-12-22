require('dotenv').config();
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import R from 'ramda';
import {inferenceRequestData, trainRequestData, } from './config';
import {DefaultPrompt} from './prompts'
import { AnyMxRecord } from 'dns';

interface RunpodResponse {
  id: string,
  status: string
}

class RunpodClient {
    inferEndpoint: string;
    trainEndpoint: string;
    apiKey?: string;
    inferRequestData: any = inferenceRequestData;
    trainRequestData: any = trainRequestData;
    
    constructor(inferEndpoint:string, trainEndpoint:string, apiKey?:string) {
        this.inferEndpoint = inferEndpoint;
        this.trainEndpoint = trainEndpoint;
        this.apiKey = apiKey;        
    }

    async train(projectName: string, petClass:string, zipPath: string, outputPath: string, webhookUrl:string): Promise<RunpodResponse> {
      return this.sendTrainRequest('run', projectName, petClass, zipPath, outputPath, webhookUrl)
    }

    async trainsync(projectName: string, petClass:string, zipPath: string, outputPath: string): Promise<RunpodResponse> {
      return this.sendTrainRequest('runsync', projectName, petClass, zipPath, outputPath)
    }

    private async sendTrainRequest(urlSuffix:string, projectName:string, petClass:string, zipPath:string, outputPath:string, webhookUrl: string|null = null) : Promise<RunpodResponse> {
      let requestData = R.clone(this.trainRequestData)
      requestData["input"]["zipfile_path"] = zipPath
      requestData["input"]["output_path"] = outputPath
      requestData["input"]["train"]["project_name"] = projectName
      requestData["input"]["train"]["class_word"] = petClass
      console.log(requestData)

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

    async inferBatch(petClass: string, loraPath: string, outputPath:string, webhookUrl:string, num:number=9, batchSize:number=3): Promise<RunpodResponse[]> {
      let result;
      const results = []
      for (let i = 0;i<Math.floor(num/batchSize)+1; i++) {
        result = await this.sendInferRequest('run', petClass, loraPath, outputPath, webhookUrl);
        results.push(result)
      }
      return results
  }
    async infer(petClass: string, loraPath: string, outputPath:string, webhookUrl:string): Promise<RunpodResponse> {
        return this.sendInferRequest('run', petClass, loraPath, outputPath, webhookUrl);
    }

    async infersync(petClass: string, loraPath: string, outputPath:string): Promise<RunpodResponse> {
        return this.sendInferRequest('runsync',petClass, loraPath, outputPath);
    }

    private async sendInferRequest(urlSuffix: string,petClass: string, loraPath: string, outputPath:string, webhookUrl: string|null = null): Promise<RunpodResponse> {
        let requestData = R.clone(this.inferRequestData) 
        requestData["input"]["output_path"]= outputPath;
        requestData["input"]["comfy_input"]["prompt"]["11"]["inputs"]["remote_lora_path_or_url"] = loraPath;
        requestData["input"]["comfy_input"]["prompt"]["41"]["inputs"]["text"] = new DefaultPrompt(petClass).prompt
        requestData["input"]["comfy_input"]["prompt"]["41"]["inputs"]["var_2"] = petClass
        requestData["input"]["comfy_input"]["prompt"]["3"]["inputs"]["seed"] = Date.now()
        console.log(requestData["input"]["comfy_input"]["prompt"])
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

    async checkJobStatus(jobId: string, jobType:string): Promise<void> {
      let url;
      if (jobType === 'infer') {
        url = `${this.inferEndpoint}status/${jobId}`;
      } else if (jobType === 'train') {
        url = `${this.trainEndpoint}status/${jobId}`;
      } else {
        throw Error("jobType must be either infer or train")
      }
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

    async purgeQueue(jobType:string): Promise<void> {
        let url;
        if (jobType === 'infer') {
          url = `${this.inferEndpoint}purge-queue`;
        } else if (jobType === 'train') {
          url = `${this.trainEndpoint}purge-queue`;
        } else {
          throw Error("jobType must be either infer or train")
        }
        const requestConfig:  AxiosRequestConfig = {
          method: 'post',
          url: url,
          headers: {
              Authorization: `Bearer ${this.apiKey}`,
          },
        };
          try {
              const response:AxiosResponse = await axios.request(requestConfig);
              return response.data
          } catch (error) {
            console.error('An error occurred:', error);
          }
        };
}

interface InferenceRequestData {
    input: {
      output_path: string;
      prompt: any; 
      // 다른 필드들...
    },
    webhook?: any
  }
  

export {RunpodClient, RunpodResponse};