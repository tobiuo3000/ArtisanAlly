import vertexai
from vertexai.generative_models import GenerativeModel, Part
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


def call_llm(image_filename=None, prompt=None) -> str:
    conf = {
        "temperature": 1,
        "max_output_tokens": 256,
    }

    vertexai.init(project="artisanallyproject", location="asia-northeast1")
    model = GenerativeModel(
        "gemini-1.5-flash-002",
        generation_config=conf,
        safety_settings=safety_settings
        )
    
    try:
        response = model.generate_content(
            [
                Part.from_uri(
                    f"https://storage.googleapis.com/artisanally_images/images/{image_filename}",
                    mime_type="image/jpeg",
                ),
                prompt,
            ]
        )
    except:
        raise Exception("error of gemini input")

    return response.text


def commentary_histogram(histogram_json_str, prompt) -> str:
    conf = {
        "temperature": 1,
        "max_output_tokens": 128,
    }
    
    vertexai.init(project="artisanallyproject", location="asia-northeast1")
    model = GenerativeModel(
        "gemini-1.5-flash-002",
        generation_config=conf,
        safety_settings=safety_settings
    )
    
    try:
        response = model.generate_content(
            [
                histogram_json_str,
                prompt,
            ]
        )
    except:
        raise Exception("error of gemini input")

    return response.text


if __name__ == "__main__":
    result = call_llm(image_filename="fb06d0f9-0783-46a9-aceb-7554914e9b5e.png", prompt="Why is the sky blue?")
    print(result)
