const messageBox = document.getElementById('messageBox');
const inputMsg = document.getElementById('inputMsg');
const sendBtn = document.getElementById('sendBtn');

import { docRefId } from "./uploadInit.js";

// メッセージの送信処理
sendBtn.addEventListener('click', async () => {
  const message = inputMsg.value.trim();
  if (!message) return;
  inputMsg.value = '';
  // addMessageToChat(message, 'user');
  try{
    const aiResponse = await getAiResponse(message);
    // addMessageToChat(aiResponse, 'ai');
  } catch (error) {
    console.error("Error getting AI response:", error);
    // addMessageToChat("エラーが発生しました。", "ai");
  }
});

// aiエージェントを叩いてテキストを取得
async function getAiResponse(message) {
  try {
    console.log({
      "user_message": message,
      "room_id": docRefId,
    });
    const response = await fetch("/chat/", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "user_message": message,
        "room_id": docRefId,
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log('Success: chat');
  } catch (error) {
    console.error('Error:', error);
    // エラーハンドリング (UIにエラーメッセージを表示するなど)
    throw error; //エラーを呼び出し元に再度投げる。
  }
}

// メッセージを生成してぶちこむ
export function addMessageToChat(message, sender, id) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  messageElement.classList.add(sender === 'user' ? 'user-message' : 'ai-message');
  messageElement.id = id;
  messageElement.textContent = message;
  messageBox.appendChild(messageElement);
  messageBox.scrollTop = messageBox.scrollHeight;
}