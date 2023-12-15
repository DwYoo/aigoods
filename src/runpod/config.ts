require('dotenv').config(); // Load environment variables from .env file

export let inferenceRequestData= {
    "input": {
        "output_path": "",
        "prompt": {
            "3": {
                "inputs": {
                "seed": 157691551724910,
                "steps": 20,
                "cfg": 8,
                "sampler_name": "euler",
                "scheduler": "normal",
                "denoise": 1,
                "model": [
                    "11",
                    0
                ],
                "positive": [
                    "6",
                    0
                ],
                "negative": [
                    "7",
                    0
                ],
                "latent_image": [
                    "5",
                    0
                ]
                },
                "class_type": "KSampler"
            },
            "4": {
                "inputs": {
                "ckpt_name": "sd_xl_base_1.0.safetensors"
                },
                "class_type": "CheckpointLoaderSimple"
            },
            "5": {
                "inputs": {
                "width": 1024,
                "height": 1024,
                "batch_size": 3
                },
                "class_type": "EmptyLatentImage"
            },
            "6": {
                "inputs": {
                "text": "artistic photo of zwc cat wearing Santa costume, small cute santa hat, Christmas tree, Christmas style, Christmas concept, (Christmas:1.3), presents, (zwc cat:1.4), (midnight:1.5), (fancy:1.5), twinkle, colorful background, fancy wallpaper, a professional photo, 4k",
                "clip": [
                    "11",
                    1
                ]
                },
                "class_type": "CLIPTextEncode"
            },
            "7": {
                "inputs": {
                "text": "text, watermark, low quality, day, bad body, monotone background, white wall, white background, bad hat, bad costume, 2, double hat",
                "clip": [
                    "11",
                    1
                ]
                },
                "class_type": "CLIPTextEncode"
            },
            "8": {
                "inputs": {
                "samples": [
                    "3",
                    0
                ],
                "vae": [
                    "4",
                    2
                ]
                },
                "class_type": "VAEDecode"
            },
            "11": {
                "inputs": {
                "lora_name": "test/models/ms_zwc_cat_v11.safetensors",
                "strength_model": 1,
                "strength_clip": 1,
                "model": [
                    "4",
                    0
                ],
                "clip": [
                    "4",
                    1
                ]
                },
                "class_type": "S3Bucket_Load_LoRA"
            },
            "25": {
                "inputs": {
                "filename_prefix": "ComfyUI",
                "images": [
                    "8",
                    0
                ]
                },
                "class_type": "SaveImage"
            }
        }
    }
};

export let trainRequestData={
  "input": {
      "zipfile_path": "", //이미지 zipfile경로
      "output_path": "", 
      "train": {
        "class_word": "cat",
        "full_bf16": true,
        "learning_rate": 0.0004,
        "lr_scheduler": "cosine",
        "lr_warmup_steps": 0,
        "max_train_steps": 800,
        "mixed_precision": "bf16",
        "network_alpha": 1,
        "network_dim": 16,
        "optimizer_type": "adafactor",
        "project_name": "ms_zwc_cat_768_v1",
        "resolution": 768,
        "save_every_n_steps": 2000,
        "save_model_as": "safetensors",
        "save_precision": "bf16",
        "token_word": "zwc",
        "train_batch_size": 3,
        "train_text_encoder": false,
        "training_repeats": 40
      },
  }
}