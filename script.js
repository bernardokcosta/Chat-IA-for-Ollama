document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chatForm');
    const userInput = document.getElementById('msg-ia');
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');
    const removeImageBtn = document.getElementById('removeImageBtn');
    const chatHistoryContainer = document.getElementById('chatHistoryContainer');
    const statusMessage = document.getElementById('statusMessage');
    const loadingIndicator = document.getElementById('loadingIndicator');

    const OLLAMA_ENDPOINT = 'http://localhost:11434/api/generate';
    const OLLAMA_MODEL = 'gemma3:4b';
    const PERSISTENT_INSTRUCTION = "Em português brasileiro, e utilize fontes ou referências confiáveis para apoiar suas respostas. Não invente fatos, se uma solicitação não estiver clara ou for ambígua, ou se isso melhorar sua resposta, peça mais detalhes para confirmar sua compreensão.";

    let chatHistory = [];

    function renderChatHistory() {
        if (chatHistory.length === 0) {
            statusMessage.style.display = 'block';
            chatHistoryContainer.innerHTML = '';
            chatHistoryContainer.appendChild(statusMessage);
        } else {
            statusMessage.style.display = 'none';
            chatHistoryContainer.innerHTML = '';
            chatHistory.forEach(msg => {
                const messageDiv = document.createElement('div');
                messageDiv.classList.add('chat-message', msg.sender === 'user' ? 'user-message' : 'ia-message');

                const senderP = document.createElement('p');
                senderP.classList.add('message-sender');
                senderP.textContent = msg.sender === 'user' ? 'Você:' : 'IA:';
                messageDiv.appendChild(senderP);

                if (msg.text) {
                    const textP = document.createElement('p');
                    textP.textContent = msg.text;
                    messageDiv.appendChild(textP);
                }

                if (msg.imageUrl) {
                    const imgElement = document.createElement('img');
                    imgElement.src = msg.imageUrl;
                    imgElement.alt = msg.sender === 'user' ? 'Imagem enviada pelo usuário' : 'Imagem da IA';
                    messageDiv.appendChild(imgElement);
                }
                chatHistoryContainer.appendChild(messageDiv);
            });
            chatHistoryContainer.scrollTop = chatHistoryContainer.scrollHeight;
        }
    }

    imageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
                removeImageBtn.style.display = 'inline-block';
            }
            reader.readAsDataURL(file);
        } else {
            imagePreview.src = '#';
            imagePreview.style.display = 'none';
            removeImageBtn.style.display = 'none';
        }
    });

    removeImageBtn.addEventListener('click', () => {
        imageInput.value = '';
        imagePreview.src = '#';
        imagePreview.style.display = 'none';
        removeImageBtn.style.display = 'none';
    });

    chatForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const userText = userInput.value.trim();
        const userImageFile = imageInput.files[0];

        if (!userText && !userImageFile) {
            alert('Por favor, digite uma mensagem ou selecione uma imagem.');
            return;
        }

        loadingIndicator.style.display = 'block';
        userInput.disabled = true;
        imageInput.disabled = true;
        chatForm.querySelector('input[type="submit"]').disabled = true;

        let userImageUrl = null;
        if (userImageFile) {
            userImageUrl = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(userImageFile);
            });
        }

        chatHistory.push({ sender: 'user', text: userText, imageUrl: userImageUrl });
        renderChatHistory();

        userInput.value = '';
        imageInput.value = '';
        imagePreview.src = '#';
        imagePreview.style.display = 'none';
        removeImageBtn.style.display = 'none';

        const promptForIA = `${PERSISTENT_INSTRUCTION}\n\nUsuário: ${userText}`;

        try {
            const response = await fetch(OLLAMA_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: OLLAMA_MODEL,
                    prompt: promptForIA,
                    stream: false,
                }),
            });

            let iaResponseText = 'Não foi possível obter uma resposta da IA.';
            if (response.ok) {
                const data = await response.json();
                if (data && data.response) {
                    iaResponseText = data.response;
                } else if (data && data.error) {
                    iaResponseText = `Erro do modelo Ollama: ${data.error}`;
                }
            } else {
                 iaResponseText = `Erro na comunicação com a API: ${response.status} ${response.statusText || 'Não foi possível obter detalhes do erro.'}`;
            }

            chatHistory.push({ sender: 'ia', text: iaResponseText, imageUrl: null });
        } catch (error) {
            console.error(error);
            chatHistory.push({ sender: 'ia', text: `Falha ao conectar com o Ollama ou processar a resposta: ${error.message}`, imageUrl: null });
        } finally {
            renderChatHistory();
            loadingIndicator.style.display = 'none';
            userInput.disabled = false;
            imageInput.disabled = false;
            chatForm.querySelector('input[type="submit"]').disabled = false;
            userInput.focus();
        }
    });
    renderChatHistory();
});
