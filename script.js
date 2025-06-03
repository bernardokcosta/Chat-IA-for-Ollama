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
    const langPtBtn = document.getElementById('lang-pt');
    const langEnBtn = document.getElementById('lang-en');

    const settingsIcon = document.getElementById('settingsIcon');
    const settingsModalElement = document.getElementById('settingsModal');
    const ollamaIpInput = document.getElementById('ollamaIpInput');
    const persistentInstructionInput = document.getElementById('persistentInstructionInput');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    let settingsModal = null;

    let OLLAMA_BASE_URL = 'http://localhost:11434';

    const translations = {
        en: {
            pageTitle: "Chat AI for Ollama",
            mainTitle: "Chat AI for Ollama",
            modelSelectorLabel: "Select Model:",
            loadingModels: "Loading models...",
            loadModelsError: "Failed to load models",
            noModelsFound: "No models found",
            newChatButton: "New Chat",
            noMessagesYet: "No messages yet. Start the conversation!",
            yourMessageLabel: "Your message:",
            messagePlaceholder: "Ask the AI something...",
            attachImageLabel: "Attach image (optional):",
            removeImageButton: "Remove Image",
            sendButton: "Send",
            generatingResponse: "Generating response, please wait...",
            userLabel: "You:",
            aiLabel: "AI:",
            alertSelectModel: "Please select an AI model.",
            alertEnterMessageOrImage: "Please enter a message or select an image.",
            couldNotGetResponse: "Could not get a response from the AI.",
            ollamaModelError: "Ollama model error:",
            apiCommunicationError: "Error communicating with the API:",
            modelNoImageSupport: "The model '{modelName}' does not support image submission. Please try with a multimodal model or send text only.",
            couldNotGetErrorDetails: "Could not get error details.",
            persistentInstruction: "Communicate in English. Use only verifiable information from reliable sources. Do not invent. Clarify ambiguities by asking for more details.",
            flagTitlePT: "Switch to Portuguese (Brazil)",
            flagTitleEN: "Switch to English (US)",
            settingsIconTitle: "Settings",
            settingsModalTitle: "Settings",
            ollamaIpLabel: "Ollama API Base Address:",
            ollamaIpHint: "Ex: http://192.168.1.10:11434. Do not include /api.",
            persistentInstructionLabel: "Persistent System Instruction:",
            persistentInstructionHint: "This instruction will be used for the current language ({currentLanguage}).",
            settingsCancelButton: "Cancel",
            settingsSaveButton: "Save Changes",
            settingsApplied: "Settings applied. Models will be reloaded.",
            invalidOllamaUrl: "Invalid Ollama URL format. Please use http://hostname:port."
        },
        pt: {
            pageTitle: "Chat IA for Ollama",
            mainTitle: "Chat IA for Ollama",
            modelSelectorLabel: "Selecionar Modelo:",
            loadingModels: "Carregando modelos...",
            loadModelsError: "Falha ao carregar modelos",
            noModelsFound: "Nenhum modelo encontrado",
            newChatButton: "Novo Chat",
            noMessagesYet: "Nenhuma mensagem ainda. Comece a conversa!",
            yourMessageLabel: "Sua mensagem:",
            messagePlaceholder: "Pergunte algo para a IA...",
            attachImageLabel: "Anexar imagem (opcional):",
            removeImageButton: "Remover Imagem",
            sendButton: "Enviar",
            generatingResponse: "Gerando resposta, por favor aguarde...",
            userLabel: "Você:",
            aiLabel: "IA:",
            alertSelectModel: "Por favor, selecione um modelo de IA.",
            alertEnterMessageOrImage: "Por favor, digite uma mensagem ou selecione uma imagem.",
            couldNotGetResponse: "Não foi possível obter uma resposta da IA.",
            ollamaModelError: "Erro do modelo Ollama:",
            apiCommunicationError: "Erro na comunicação com a API:",
            modelNoImageSupport: "O modelo '{modelName}' não suporta o envio de imagens. Por favor, tente com um modelo multimodal ou envie apenas texto.",
            couldNotGetErrorDetails: "Não foi possível obter detalhes do erro.",
            persistentInstruction: "Comunique-se em português brasileiro. Use apenas informações verificáveis de fontes confiáveis. Não invente. Clarifique ambiguidades pedindo mais detalhes.",
            flagTitlePT: "Mudar para Português (Brasil)",
            flagTitleEN: "Mudar para Inglês (US)",
            settingsIconTitle: "Configurações",
            settingsModalTitle: "Configurações",
            ollamaIpLabel: "Endereço Base da API Ollama:",
            ollamaIpHint: "Ex: http://192.168.1.10:11434. Não inclua /api.",
            persistentInstructionLabel: "Instrução de Sistema Persistente:",
            persistentInstructionHint: "Esta instrução será usada para o idioma atual ({currentLanguage}).",
            settingsCancelButton: "Cancelar",
            settingsSaveButton: "Salvar Alterações",
            settingsApplied: "Configurações aplicadas. Os modelos serão recarregados.",
            invalidOllamaUrl: "Formato de URL do Ollama inválido. Por favor, use http://hostname:porta."
        }
    };

    let currentLanguage = localStorage.getItem('preferredLanguage') || 'pt';
    let currentPersistentInstruction = '';
    let chatHistory = [];
    let customPersistentInstructions = {};

    function getOllamaApiUrl(endpoint) {
        const base = OLLAMA_BASE_URL.endsWith('/') ? OLLAMA_BASE_URL.slice(0, -1) : OLLAMA_BASE_URL;
        return `${base}/api/${endpoint}`;
    }

    function loadSettingsFromLocalStorage() {
        const savedOllamaBaseUrl = localStorage.getItem('ollamaBaseUrl');
        if (savedOllamaBaseUrl) {
            OLLAMA_BASE_URL = savedOllamaBaseUrl;
        }

        const savedCustomInstructions = localStorage.getItem('customPersistentInstructions');
        if (savedCustomInstructions) {
            try {
                customPersistentInstructions = JSON.parse(savedCustomInstructions);
            } catch (e) {
                console.error("Erro ao parsear instruções personalizadas do localStorage:", e);
                customPersistentInstructions = {};
            }
        }
    }

    function saveSettingsToLocalStorage() {
        localStorage.setItem('ollamaBaseUrl', OLLAMA_BASE_URL);
        localStorage.setItem('customPersistentInstructions', JSON.stringify(customPersistentInstructions));
    }

    function setLanguage(lang) {
        if (!translations[lang]) {
            console.warn(`Language ${lang} not supported.`);
            return;
        }
        currentLanguage = lang;
        currentPersistentInstruction = customPersistentInstructions[currentLanguage] || translations[currentLanguage].persistentInstruction;
        document.documentElement.lang = lang === 'pt' ? 'pt-br' : 'en';

        document.querySelectorAll('[data-lang-key]').forEach(element => {
            const key = element.getAttribute('data-lang-key');
            if (translations[lang][key]) {
                let textToShow = translations[lang][key];
                if (key === "persistentInstructionHint" && settingsModalElement.contains(element)) {
                    textToShow = textToShow.replace('{currentLanguage}', lang.toUpperCase());
                }

                if (element.tagName === 'INPUT' && element.type === 'submit') {
                    element.value = textToShow;
                } else if (element.tagName === 'TEXTAREA' && element.hasAttribute('data-lang-key-placeholder')) {
                    const placeholderKey = element.getAttribute('data-lang-key-placeholder');
                    element.placeholder = translations[lang][placeholderKey] || '';
                    if (translations[lang][key] && element.id !== 'persistentInstructionInput') {
                        element.textContent = textToShow;
                    }
                } else if (element.hasAttribute('title') && element.getAttribute('data-lang-key') === key) {
                    element.title = textToShow;
                } else {
                    element.textContent = textToShow;
                }
            }
        });

        document.querySelectorAll('[data-lang-key-placeholder]').forEach(element => {
            const placeholderKey = element.getAttribute('data-lang-key-placeholder');
            if (translations[lang][placeholderKey] && !element.hasAttribute('data-lang-key')) {
                element.placeholder = translations[lang][placeholderKey];
            }
        });

        langPtBtn.title = translations[lang].flagTitlePT;
        langEnBtn.title = translations[lang].flagTitleEN;
        if(settingsIcon) settingsIcon.title = translations[lang].settingsIconTitle;

        langPtBtn.classList.toggle('active', lang === 'pt');
        langEnBtn.classList.toggle('active', lang === 'en');

        const modelSelectorInitialOption = modelSelector.querySelector('option[value=""]');
        if (modelSelectorInitialOption) {
            const ptLoadError = translations.pt.loadModelsError.split(' ')[0];
            const enLoadError = translations.en.loadModelsError.split(' ')[0];
            const ptNoModels = translations.pt.noModelsFound.split(' ')[0];
            const enNoModels = translations.en.noModelsFound.split(' ')[0];
            const ptLoading = translations.pt.loadingModels.split(' ')[0];
            const enLoading = translations.en.loadingModels.split(' ')[0];

            if (modelSelector.disabled && (modelSelectorInitialOption.textContent.includes(ptLoadError) || modelSelectorInitialOption.textContent.includes(enLoadError))) {
                modelSelectorInitialOption.textContent = translations[lang].loadModelsError;
            } else if (modelSelector.disabled && (modelSelectorInitialOption.textContent.includes(ptNoModels) || modelSelectorInitialOption.textContent.includes(enNoModels))) {
                modelSelectorInitialOption.textContent = translations[lang].noModelsFound;
            } else if (modelSelectorInitialOption.textContent.includes(ptLoading) || modelSelectorInitialOption.textContent.includes(enLoading)) {
                if (!modelSelector.disabled || (modelSelector.options.length > 0 && modelSelector.options[0].value !== "")) {
                } else {
                    modelSelectorInitialOption.textContent = translations[lang].loadingModels;
                }
            }
        }
        localStorage.setItem('preferredLanguage', lang);
        renderChatHistory();
    }

    async function loadModels() {
        const initialLoadingOption = modelSelector.querySelector('option[value=""]') || document.createElement('option');
        initialLoadingOption.value = "";
        initialLoadingOption.textContent = translations[currentLanguage].loadingModels;
        if (!modelSelector.querySelector('option[value=""]')) {
            modelSelector.prepend(initialLoadingOption);
        }
        modelSelector.disabled = true;


        try {
            const response = await fetch(getOllamaApiUrl('tags'));
            if (!response.ok) {
                throw new Error(`${translations[currentLanguage].loadModelsError}: ${response.statusText} (status: ${response.status})`);
            }
            const data = await response.json();

            const currentlySelectedModel = modelSelector.value;
            modelSelector.innerHTML = '';

            if (data.models && data.models.length > 0) {
                data.models.forEach(model => {
                    const option = document.createElement('option');
                    option.value = model.name;
                    option.textContent = model.name;
                    modelSelector.appendChild(option);
                });

                if (data.models.some(m => m.name === currentlySelectedModel)) {
                    modelSelector.value = currentlySelectedModel;
                } else if (data.models.length > 0) {
                    modelSelector.selectedIndex = 0;
                }
                modelSelector.disabled = false;
            } else {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = translations[currentLanguage].noModelsFound;
                modelSelector.appendChild(option);
                modelSelector.disabled = true;
            }
        } catch (error) {
            console.error('Falha ao carregar modelos Ollama:', error);
            modelSelector.innerHTML = `<option value="">${translations[currentLanguage].loadModelsError}</option>`;
            modelSelector.disabled = true;
        }
    }

    function renderChatHistory() {
        const currentStatusMessageElem = document.getElementById('statusMessage');

        if (chatHistory.length === 0) {
            if (currentStatusMessageElem) {
                currentStatusMessageElem.textContent = translations[currentLanguage].noMessagesYet;
                currentStatusMessageElem.style.display = 'block';
            }
            chatHistoryContainer.innerHTML = '';
            if (currentStatusMessageElem) chatHistoryContainer.appendChild(currentStatusMessageElem);
        } else {
            if (currentStatusMessageElem) currentStatusMessageElem.style.display = 'none';
            chatHistoryContainer.innerHTML = '';

            chatHistory.forEach(msg => {
                const messageDiv = document.createElement('div');
                messageDiv.classList.add('chat-message', msg.sender === 'user' ? 'user-message' : 'ia-message');

                const senderP = document.createElement('p');
                senderP.classList.add('message-sender');
                senderP.textContent = msg.sender === 'user' ? translations[currentLanguage].userLabel : translations[currentLanguage].aiLabel;
                messageDiv.appendChild(senderP);

                if (msg.text) {
                    const textP = document.createElement('p');
                    if (msg.sender === 'ia') {
                        textP.innerHTML = marked.parse(msg.text);
                    } else {
                        textP.textContent = msg.text;
                    }
                    messageDiv.appendChild(textP);
                }

                if (msg.imageUrl) {
                    const imgElement = document.createElement('img');
                    imgElement.src = msg.imageUrl;
                    imgElement.alt = msg.sender === 'user' ? 'Imagem enviada pelo usuário' : 'Imagem da IA';
                    imgElement.style.maxWidth = '200px';
                    imgElement.style.maxHeight = '200px';
                    imgElement.style.objectFit = 'contain';
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
            alert(translations[currentLanguage].alertSelectModel);
            return;
        }

        if (!userText && !userImageFile) {
            alert(translations[currentLanguage].alertEnterMessageOrImage);
            return;
        }

        loadingIndicator.style.display = 'block';
        userInput.disabled = true;
        imageInput.disabled = true;
        if (!(modelSelector.options.length === 1 && modelSelector.options[0].value === '')) {
            modelSelector.disabled = true;
        }
        chatForm.querySelector('input[type="submit"]').disabled = true;
        newChatBtn.disabled = true;

        let userImageUrlForDisplay = null;
        let base64ImageForApi = null;

        if (userImageFile) {
            userImageUrlForDisplay = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(userImageFile);
            });
            if (userImageUrlForDisplay) {
                base64ImageForApi = userImageUrlForDisplay.split(',')[1];
            }
        }

        chatHistory.push({ sender: 'user', text: userText, imageUrl: userImageFile ? userImageUrlForDisplay : null });
        renderChatHistory();

        userInput.value = '';
        clearImageSelection();

        const promptForIA = `${currentPersistentInstruction}\n\n${translations[currentLanguage].userLabel} ${userText}`;

        try {
            const requestPayload = {
                model: selectedModel,
                prompt: promptForIA,
                stream: false,
            };

            if (base64ImageForApi) {
                requestPayload.images = [base64ImageForApi];
            }

            const response = await fetch(getOllamaApiUrl('generate'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestPayload),
            });

            let iaResponseText = translations[currentLanguage].couldNotGetResponse;
            if (response.ok) {
                const data = await response.json();
                if (data && data.response) {
                    iaResponseText = data.response;
                } else if (data && data.error) {
                    if (data.error.toLowerCase().includes("does not support images") || data.error.toLowerCase().includes("image data is not supported by this model")) {
                        iaResponseText = translations[currentLanguage].modelNoImageSupport.replace('{modelName}', selectedModel);
                    } else {
                        iaResponseText = `${translations[currentLanguage].ollamaModelError} ${data.error}`;
                    }
                }
            } else {
                let errorDetails = `${translations[currentLanguage].apiCommunicationError} ${response.status} ${response.statusText || ''}`;
                try {
                    const errorData = await response.json();
                    if (errorData && errorData.error) {
                        if (errorData.error.toLowerCase().includes("does not support images") || errorData.error.toLowerCase().includes("image data is not supported by this model")) {
                            iaResponseText = translations[currentLanguage].modelNoImageSupport.replace('{modelName}', selectedModel);
                        } else {
                            iaResponseText = `${translations[currentLanguage].ollamaModelError} ${errorData.error}`;
                        }
                    } else {
                        const textError = await response.text();
                        iaResponseText = `${errorDetails} - ${textError || translations[currentLanguage].couldNotGetErrorDetails}`;
                    }
                } catch (e) {
                    const textError = await response.text().catch(() => '');
                    iaResponseText = `${errorDetails} ${textError || translations[currentLanguage].couldNotGetErrorDetails}`;
                }
            }
            chatHistory.push({ sender: 'ia', text: iaResponseText, imageUrl: null });

        } catch (error) {
            console.error('Falha na comunicação com Ollama ou processamento:', error);
            chatHistory.push({ sender: 'ia', text: `${translations[currentLanguage].apiCommunicationError.split(':')[0]}: ${error.message}`, imageUrl: null });
        } finally {
            renderChatHistory();
            loadingIndicator.style.display = 'none';
            userInput.disabled = false;
            imageInput.disabled = false;
            if (!(modelSelector.options.length === 1 && modelSelector.options[0].value === '' && modelSelector.disabled)) {
                modelSelector.disabled = false;
            }
            chatForm.querySelector('input[type="submit"]').disabled = false;
            newChatBtn.disabled = false;
            userInput.focus();
        }
    });

    if (settingsModalElement) {
        settingsModal = new bootstrap.Modal(settingsModalElement);
    }

    if (settingsIcon) {
        settingsIcon.addEventListener('click', () => {
            ollamaIpInput.value = OLLAMA_BASE_URL;
            persistentInstructionInput.value = customPersistentInstructions[currentLanguage] || translations[currentLanguage].persistentInstruction;

            const instructionHintElement = settingsModalElement.querySelector('.form-text[data-lang-key="persistentInstructionHint"]');
            if (instructionHintElement) {
                instructionHintElement.textContent = translations[currentLanguage].persistentInstructionHint.replace('{currentLanguage}', currentLanguage.toUpperCase());
            }

            if (settingsModal) settingsModal.show();
        });
    }

    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            const newOllamaIp = ollamaIpInput.value.trim();
            const newPersistentInstruction = persistentInstructionInput.value.trim();

            if (!newOllamaIp.match(/^https?:\/\/[^\s/$.?#].[^\s]*$/i) || newOllamaIp.endsWith('/api') || newOllamaIp.endsWith('/')) {
                alert(translations[currentLanguage].invalidOllamaUrl + " " + translations[currentLanguage].ollamaIpHint);
                return;
            }

            OLLAMA_BASE_URL = newOllamaIp;
            if (newPersistentInstruction) {
                customPersistentInstructions[currentLanguage] = newPersistentInstruction;
                currentPersistentInstruction = newPersistentInstruction;
            } else {
                delete customPersistentInstructions[currentLanguage];
                currentPersistentInstruction = translations[currentLanguage].persistentInstruction;
            }

            saveSettingsToLocalStorage();
            if (settingsModal) settingsModal.hide();
            console.log(translations[currentLanguage].settingsApplied);
            loadModels();
        });
    }

    langPtBtn.addEventListener('click', () => setLanguage('pt'));
    langEnBtn.addEventListener('click', () => setLanguage('en'));

    loadSettingsFromLocalStorage();
    setLanguage(currentLanguage);
    loadModels();
});
