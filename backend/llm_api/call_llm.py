import vertexai
import vertexai.generative_models as genai
from vertexai.generative_models import (
    HarmBlockThreshold,
    HarmCategory,
)

safety_settings = {
	HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
	HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
	HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
	HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
}
conf = {
	"temperature": 1,
	"max_output_tokens": 256,
}

def call_llm(image=None, image_type=None, prompt=None):  # [base64_encoded_image_str, image_type_str, prompt_str] => str
    
    vertexai.init(project="artisanallyproject", location="asia-northeast1")
    model = genai.GenerativeModel(
        #model_name="gemini-1.5-pro",
        model_name="gemini-1.5-flash-002",
        generation_config=conf,
        safety_settings=safety_settings
    )
    
    if image is None:
        return "画像がcall_llmに渡されていません"
    else:
        image_type = "image/" + image_type 
        response = model.generate_content([
            {
                "role": "user",
                "parts": [
                    {
                        "inline_data": {
                            "data": image,
                            "mime_type": image_type
                        }
                    }
                ]
            },
            {
                "role": "user",
                "parts": [
                    {"text": prompt}
                ]
            }
        ])

        return response.text
