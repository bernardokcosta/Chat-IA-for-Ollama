# Chat IA para Ollama - Interface Gráfica Simples

[Português do Brasil](#português-do-brasil) | [English](#english)

## Português do Brasil

### Visão Geral

Este projeto oferece uma interface gráfica de usuário (GUI) simples e direta para interagir com modelos de linguagem grandes (LLMs) através do Ollama. O objetivo principal é fornecer uma maneira rápida e fácil de testar e conversar com seus modelos Ollama localmente, diretamente no navegador, sem a necessidade de configurar um servidor web como Apache ou Nginx. Basta abrir o arquivo `index.html` em seu navegador preferido.

### Funcionalidades

* **Seleção de Modelo Dinâmica:** Carrega e permite selecionar qualquer um dos modelos Ollama disponíveis em sua máquina local.
* **Histórico de Chat:** Mantém um histórico da conversa atual na interface.
* **Envio de Mensagens de Texto:** Permite enviar prompts de texto para o modelo de IA selecionado.
* **Suporte a Envio de Imagens (Opcional):** Permite anexar imagens à sua mensagem (a capacidade de processamento de imagem dependerá do modelo Ollama selecionado).
* **Pré-visualização e Remoção de Imagem:** Mostra uma pré-visualização da imagem selecionada e permite removê-la antes do envio.
* **Indicador de Carregamento:** Informa ao usuário quando a IA está processando a resposta.
* **Criação de Novo Chat:** Permite limpar o histórico e iniciar uma nova conversa facilmente.
* **Design Responsivo:** Interface amigável para diferentes tamanhos de tela, utilizando Bootstrap.
* **Instrução Persistente:** Inclui uma instrução de sistema configurável (atualmente definida para respostas em português brasileiro e foco na precisão).

### Como Usar

1.  **Clone o Repositório:**
    ```bash
    git clone https://github.com/bernardokcosta/Chat-IA-for-Ollama.git
    cd Chat-IA-for-Ollama
    ```
2.  **Certifique-se de que o Ollama está em execução:**
    Verifique se o serviço Ollama está ativo e acessível em `http://localhost:11434`. Você deve ter pelo menos um modelo baixado (por exemplo, `ollama pull llama3`).
3.  **Configure o CORS do Ollama (Importante!):**
    Consulte a seção abaixo para detalhes sobre como configurar as permissões de CORS para o Ollama.
4.  **Abra o `index.html`:**
    Navegue até a pasta do projeto e abra o arquivo `index.html` diretamente no seu navegador web (Firefox, Chrome, Edge, etc.).
5.  **Selecione um Modelo:**
    Use o menu suspenso para selecionar o modelo Ollama que você deseja usar.
6.  **Envie Mensagens:**
    Digite sua mensagem na caixa de texto, anexe uma imagem se desejar, e clique em "Enviar".

### Importante: Configuração do CORS do Ollama

Para que esta interface web (rodando via `file://` ou qualquer outro domínio) possa se comunicar com a API do Ollama (que roda em `http://localhost:11434`), você precisa configurar o Ollama para aceitar requisições de diferentes origens (CORS).

A forma mais simples de permitir todas as origens para testes locais é definir a variável de ambiente `OLLAMA_ORIGINS`.

**Exemplos de como definir `OLLAMA_ORIGINS`:**

* **Windows (PowerShell):**
    ```powershell
    $env:OLLAMA_ORIGINS = "*"
    ```
    Para tornar essa configuração persistente entre reinicializações no Windows, você pode precisar adicioná-la às variáveis de ambiente do sistema ou do usuário através do Painel de Controle.

* **Linux / macOS (Terminal):**
    ```bash
    export OLLAMA_ORIGINS="*"
    ```
    Para tornar essa configuração persistente, adicione a linha acima ao seu arquivo de perfil do shell (por exemplo, `.bashrc`, `.zshrc`) e reinicie o terminal ou execute `source ~/.bashrc` (ou o arquivo correspondente).

**Atenção:** Usar `"*"` permite que **qualquer** origem acesse sua API Ollama. Para um ambiente de produção ou se você tiver preocupações com segurança, restrinja para origens específicas (por exemplo, `export OLLAMA_ORIGINS="http://meu-app-seguro.com"`). Para o propósito deste projeto (teste local rápido abrindo `index.html`), `"*"` é geralmente aceitável.

Após definir a variável de ambiente, **reinicie o serviço Ollama** para que as alterações entrem em vigor.

### Tecnologias Utilizadas

* **HTML5**
* **CSS3**
* **JavaScript (ES6+)**
* **Bootstrap 5.3**
* **Ollama API**
---

## English

### Overview

This project provides a simple and straightforward graphical user interface (GUI) for interacting with large language models (LLMs) via Ollama. The main goal is to offer a quick and easy way to test and chat with your local Ollama models directly in the browser, without needing to set up a web server like Apache or Nginx. Simply open the `index.html` file in your preferred browser.

### Features

* **Dynamic Model Selection:** Loads and allows selection from any Ollama models available on your local machine.
* **Chat History:** Maintains a history of the current conversation in the interface.
* **Text Message Submission:** Allows sending text prompts to the selected AI model.
* **Image Upload Support (Optional):** Allows attaching images to your message (image processing capability will depend on the selected Ollama model).
* **Image Preview and Removal:** Displays a preview of the selected image and allows its removal before sending.
* **Loading Indicator:** Informs the user when the AI is processing the response.
* **New Chat Creation:** Allows clearing the history and starting a new conversation easily.
* **Responsive Design:** User-friendly interface for different screen sizes, using Bootstrap.
* **Persistent Instruction:** Includes a configurable system instruction (currently set for responses in Brazilian Portuguese and focus on accuracy).

### How to Use

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/bernardokcosta/Chat-IA-for-Ollama.git
    cd Chat-IA-for-Ollama
    ```
2.  **Ensure Ollama is Running:**
    Verify that the Ollama service is active and accessible at `http://localhost:11434`. You should have at least one model downloaded (e.g., `ollama pull llama3`).
3.  **Configure Ollama CORS (Important!):**
    Refer to the section below for details on how to configure CORS permissions for Ollama.
4.  **Open `index.html`:**
    Navigate to the project folder and open the `index.html` file directly in your web browser (Firefox, Chrome, Edge, etc.).
5.  **Select a Model:**
    Use the dropdown menu to select the Ollama model you wish to use.
6.  **Send Messages:**
    Type your message in the text area, attach an image if desired, and click "Enviar" (Send).

### Important: Ollama CORS Configuration

For this web interface (running via `file://` or any other domain) to communicate with the Ollama API (running on `http://localhost:11434`), you need to configure Ollama to accept requests from different origins (CORS).

The simplest way to allow all origins for local testing is to set the `OLLAMA_ORIGINS` environment variable.

**Examples of how to set `OLLAMA_ORIGINS`:**

* **Windows (PowerShell):**
    ```powershell
    $env:OLLAMA_ORIGINS = "*"
    ```
    To make this setting persistent across reboots on Windows, you may need to add it to your system or user environment variables via the Control Panel.

* **Linux / macOS (Terminal):**
    ```bash
    export OLLAMA_ORIGINS="*"
    ```
    To make this setting persistent, add the line above to your shell profile file (e.g., `.bashrc`, `.zshrc`) and restart your terminal or run `source ~/.bashrc` (or the corresponding file).

**Warning:** Using `"*"` allows **any** origin to access your Ollama API. For a production environment or if you have security concerns, restrict it to specific origins (e.g., `export OLLAMA_ORIGINS="http://my-secure-app.com"`). For the purpose of this project (quick local testing by opening `index.html`), `"*"` is generally acceptable.

After setting the environment variable, **restart the Ollama service** for the changes to take effect.

### Technologies Used

* **HTML5**
* **CSS3**
* **JavaScript (ES6+)**
* **Bootstrap 5.3**
* **Ollama API**
