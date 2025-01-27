import vertexai
import vertexai.generative_models as genai


func call_llm(isImageContained=false, prompt=None):
	vertexai.init()
	model = genai.GenerativeModel(
	    "models/gemini-1.5-pro"
	)

	if prompt is None:
		prompt = "私の名前は九条ネギです。私の外見を想像して、説明してみて。"
	
	
	if isImageContained:
		image = [1]  # put image data in the future version 
		response = model.generate_content([prompt, image])
	else:
		response = model.generate_content([prompt])	
	return response

if __name__ == "__main__":
	call_llm()
