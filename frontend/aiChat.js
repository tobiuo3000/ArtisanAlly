const messageBox = document.getElementById('messageBox');
const inputMsg = document.getElementById('inputMsg');
const sendBtn = document.getElementById('sendBtn');

// メッセージの送信処理
sendBtn.addEventListener('click', async () => {
  const message = inputMsg.value.trim();
  if (!message) return;
  inputMsg.value = '';
  addMessageToChat(message, 'user');
  try{
    const aiResponse = await getAiResponse(message);
    addMessageToChat(aiResponse, 'ai');
  } catch (error) {
    console.error("Error getting AI response:", error);
    addMessageToChat("エラーが発生しました。", "ai");
  }
});

// aiエージェントを叩いてテキストを取得
async function getAiResponse(message) {
  return "「" + message + "」ね、あーしってるしってる。おいしいよね";
}

// メッセージを生成してぶちこむ
export function addMessageToChat(message, sender) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  messageElement.classList.add(sender === 'user' ? 'user-message' : 'ai-message');
  messageElement.textContent = message;
  messageBox.appendChild(messageElement);
  messageBox.scrollTop = messageBox.scrollHeight;
}