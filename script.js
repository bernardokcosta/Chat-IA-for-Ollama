document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chatForm');
    const userInput = document.getElementById('msg-ia');
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');
    const removeImageBtn = document.getElementById('removeImageBtn');
    const chatHistoryContainer = document.getElementById('chatHistoryContainer');
    const statusMessage = document.getElementById('statusMessage');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const modelSelector = document.getElementById('modelSelector');
    const newChatBtn = document.getElementById('newChatBtn');

    const OLLAMA_API_BASE_URL = 'http://localhost:11434/api';
    const PERSISTENT_INSTRUCTION = "Em português brasileiro, e utilize fontes ou referências confiáveis para apoiar suas respostas. Não invente fatos, se uma solicitação não estiver clara ou for ambígua, ou se isso melhorar sua resposta, peça mais detalhes para confirmar sua compreensão.";

    let chatHistory = [];

    async function loadModels() {
        try {
            const response = await fetch(`${OLLAMA_API_BASE_URL}/tags`);
            if (!response.ok) {
                throw new Error(`Erro ao buscar modelos: ${response.statusText}`);
            }
            const data = await response.json();
            modelSelector.innerHTML = ''; // Limpa opções de carregamento

            if (data.models && data.models.length > 0) {
                data.models.forEach(model => {
                    const option = document.createElement('option');
                    option.value = model.name;
                    option.textContent = model.name;
                    modelSelector.appendChild(option);
                });

                const defaultModels = ['gemma:latest', 'gemma3:4b', 'llama3:latest'];
                let foundDefault = false;
                for (const dm of defaultModels) {
                    if (data.models.some(m => m.name === dm)) {
                        modelSelector.value = dm;
                        foundDefault = true;
                        break;
                    }
                }
                if (!foundDefault) modelSelector.selectedIndex = 0;

            } else {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'Nenhum modelo encontrado';
                modelSelector.appendChild(option);
                modelSelector.disabled = true;
            }
        } catch (error) {
            console.error('Falha ao carregar modelos Ollama:', error);
            modelSelector.innerHTML = '<option value="">Falha ao carregar modelos</option>';
            modelSelector.disabled = true;
        }
    }

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
                    if (msg.sender === 'ia') {
                        textP.innerHTML = msg.text.replace(/\n/g, '<br>');
                    } else {
                        textP.textContent = msg.text;
                    }
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

    function clearImageSelection() {
        imageInput.value = '';
        imagePreview.src = '#';
        imagePreview.style.display = 'none';
        removeImageBtn.style.display = 'none';
    }

    removeImageBtn.addEventListener('click', clearImageSelection);

    newChatBtn.addEventListener('click', () => {
        chatHistory = [];
        userInput.value = '';
        clearImageSelection();
        renderChatHistory();
        userInput.focus();
    });

    chatForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const userText = userInput.value.trim();
        const userImageFile = imageInput.files[0];
        const selectedModel = modelSelector.value;

        if (!selectedModel) {
            alert('Por favor, selecione um modelo de IA.');
            return;
        }

        if (!userText && !userImageFile) {
            alert('Por favor, digite uma mensagem ou selecione uma imagem.');
            return;
        }

        loadingIndicator.style.display = 'block';
        userInput.disabled = true;
        imageInput.disabled = true;
        modelSelector.disabled = true;
        chatForm.querySelector('input[type="submit"]').disabled = true;
        newChatBtn.disabled = true;

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
        clearImageSelection();

        const promptForIA = `${PERSISTENT_INSTRUCTION}\n\nUsuário: ${userText}`;

        try {
            const response = await fetch(`${OLLAMA_API_BASE_URL}/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: selectedModel,
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
            modelSelector.disabled = false;
            chatForm.querySelector('input[type="submit"]').disabled = false;
            newChatBtn.disabled = false;
            userInput.focus();
        }
    });

    loadModels();
    renderChatHistory();
});
