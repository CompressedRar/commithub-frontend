
  //import { Client, PollinationsAI, DeepInfra, Together, Puter, HuggingFace } from 'https://g4f.dev/dist/js/client.js';
  import { Client, PollinationsAI, DeepInfra, Worker, Puter, HuggingFace } from "../dist/js/client.js";
  
  import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

  const chat = document.getElementById('chat');
  const form = document.getElementById('form');
  const input = document.getElementById('input');
  const providerSelect = document.getElementById('provider');
  const apiKeyInput = document.getElementById('apiKey');
  const modelSelect = document.getElementById('modelSelect');

  let client = null;
  let messages = [];

  // Set the initial height of the container to fit the viewport
  document.querySelector(".container").style.maxHeight = window.innerHeight + "px";

  async function initClient() {
    const provider = providerSelect.value;
    const apiKey = apiKeyInput.value.trim();
    const options = apiKey ? { apiKey } : {};
    let ClientClass;

    switch (provider) {
      case 'pollinations':
        ClientClass = PollinationsAI;
        break;
      case 'deepinfra':
        ClientClass = DeepInfra;
        break;
      case 'huggingface':
        ClientClass = HuggingFace;
        break;
      case 'together':
        ClientClass = Together;
        break;
      case 'puter':
        ClientClass = Puter;
        break;
      case 'azure':
        ClientClass = Client;
        break;
      case 'worker':
        ClientClass = Worker;
        break;
      case 'airforce':
        ClientClass = Client;
        options.baseUrl = 'https://api.airforce/v1';
        options.apiKey = localStorage.getItem('ApiAirforce-api_key');
        break;
    }

    client = new ClientClass(options);
    await loadModels();
  }

  async function loadModels() {
    modelSelect.innerHTML = '<option disabled selected>Loading...</option>';
    try {
      const models = await client.models.list();
      modelSelect.innerHTML = '';
      models.forEach(model => {
        if (model.type && !["chat", "image", "text"].includes(model.type)) {
          return;
        }
        const opt = document.createElement('option');
        opt.value = model.id;
        opt.textContent = model.id + (model.type == "image" ? " 🎨" : "");
        // Store the model type (e.g., 'chat' or 'image') in a data attribute.
        if (model.type) {
          opt.dataset.type = model.type;
        }
        if (model.id === client.defaultModel) opt.selected = true;
        modelSelect.appendChild(opt);
      });
    } catch (err) {
      console.error('Model load failed:', err);
      modelSelect.innerHTML = "";
    }
  }

  providerSelect.addEventListener('change', initClient);
  apiKeyInput.addEventListener('change', initClient);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    // Get the full selected option element to access its data attributes.
    const selectedOption = modelSelect.options[modelSelect.selectedIndex];
    const selectedModel = selectedOption.value || client.defaultModel;
    const modelType = selectedOption.dataset.type || 'chat'; // Default to 'chat' if type is not specified

    addMessage('user', text);
    messages.push({ role: 'user', content: text });
    input.value = '';

    const assistantEl = document.createElement('div');
    assistantEl.className = 'message assistant';
    assistantEl.innerHTML = `<em>Generating with ${modelType} model...</em>`;
    chat.appendChild(assistantEl);
    chat.scrollTop = chat.scrollHeight;

    try {
      // Conditionally call the correct client method based on model type.
      if (modelType === 'image') {
        // Handle image generation
        const response = await client.images.generate({
          model: selectedModel,
          prompt: text,
        });
        
        const imageUrl = response.data[0].url;
        assistantEl.innerHTML = `<img src="${imageUrl}" alt="${text}" />`;
        messages.push({ role: 'assistant', content: `Image generated: ${imageUrl}` });

      } else {
        // Handle chat completion (existing logic)
        const stream = await client.chat.completions.create({
          model: selectedModel,
          messages,
          stream: true
        });

        let fullResponse = '';
        let isReasoning = false;
        for await (const chunk of stream) {
          let delta;
          if (chunk.choices && chunk.choices[0]?.delta?.reasoning) {
            delta = chunk.choices[0]?.delta?.reasoning;
            isReasoning = true;
          } else if (chunk.choices) {
            delta = chunk.choices[0]?.delta?.content || '';
            if (isReasoning) {
              isReasoning = false;
              delta = '\n\n---\n\n' + delta;
            }
          }
          if (!delta) continue; // Skip empty chunks
          fullResponse += delta;
          assistantEl.innerHTML = marked.parse(fullResponse);
          chat.scrollTop = chat.scrollHeight;
        }
        messages.push({ role: 'assistant', content: fullResponse });
      }
    } catch (err) {
      assistantEl.innerHTML = '<strong>Error:</strong> ' + err.message;
      console.error(err);
    }
  });

  function addMessage(role, content) {
    const el = document.createElement('div');
    el.className = 'message ' + role;
    el.innerHTML = role === 'user'
      ? `<div class="user">${content}</div>`
      : marked.parse(content);
    chat.appendChild(el);
    chat.scrollTop = chat.scrollHeight;
  }

  await initClient();
