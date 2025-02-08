import vertexai
from vertexai.generative_models import GenerativeModel, Part, HarmBlockThreshold, HarmCategory
from google.cloud import storage, firestore

safety_settings = {
    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
}

conf = {
    "temperature": 1,
    "max_output_tokens": 128,
}

def get_chat_context(room_id: str, chats) -> list:
    
    context_messages = []
    if not chats:
        return context_messages

    for chat in chats:
        data = chat.to_dict() if hasattr(chat, "to_dict") else chat
        sender = data.get("sender", "")
        message = data.get("text", "")
        # sender の接頭辞で role を判定（"user" なら user、それ以外は model とする）
        role = "user" if sender.startswith("user") else "model"
        context_messages.append({
            "role": role,
            "parts": [Part.from_text(message).to_dict()]
        })
    return context_messages

def chat_llm(original_part_object=None, new_image=None, new_image_type=None, new_message=None, 
             len_chat_history=0, room_id=None, chats=None) -> str:
    """
    Vertex AI のチャット API に、初期プロンプト・チャット履歴・新たなメッセージを入力して応答を取得する。
    """

    vertexai.init(project="artisanallyproject", location="asia-northeast1")
    model = GenerativeModel(
        model_name="gemini-1.5-flash-002",
        generation_config=conf,
        safety_settings=safety_settings
    )

    input_content = []

    if original_part_object is not None:
        input_content.append(original_part_object)

    if len_chat_history > 0 and chats is not None:
        try:
            context_messages = get_chat_context(room_id, chats)
            input_content.extend(context_messages)
        except Exception as e:
            raise Exception(f"Error in get_chat_context: {e}")

    if new_message is not None:
        input_content.append({
            "role": "user",
            "parts": [Part.from_text(new_message).to_dict()]
        })

    try:
        response = model.generate_content(input_content)
    except Exception as e:
        raise Exception(f"Error in generate_content with input {input_content}: {e}")

    return response.text




if __name__ == "__main__":
    result = chat_llm(
        new_message="こんにちは、この画像についてどう思いますか？ カラスの真似をしてください",
        len_chat_history=0, 
        room_id=None,
        chats=None
    )
    print("LLMの返答:", result)



