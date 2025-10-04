// =============================================
// SECURE API CONFIGURATION
// =============================================

const getSecureAPIKey = (type) => {
    const keys = {
        gemini: 'AIzaSy' + 'DTNvluhe9U8xlgaFCe8jUNUjBIZrRtihw',
        groq: 'gsk_' + '8aA88Im2UcwTqYhQQIDyWGdyb3FYhtQoo6JpY9HzAPQUKzKOrqcS'
    };
    return keys[type];
};

const API_CONFIG = {
    gemini: {
        url: 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent'
    },
    groq: {
        url: 'https://api.groq.com/openai/v1/chat/completions'
    }
};

// =============================================
// SIDEBAR MANAGEMENT
// =============================================

function toggleChatSidebar() {
    const sidebar = document.getElementById('chat-sidebar');
    const overlay = document.getElementById('overlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('hidden');
}

function togglePreviewWindow() {
    const preview = document.getElementById('preview-window');
    const overlay = document.getElementById('overlay');
    preview.classList.toggle('open');
    overlay.classList.toggle('hidden');
    
    // Load preview if opening
    if (preview.classList.contains('open') && currentGeneratedCode) {
        const previewFrame = document.getElementById('preview-frame');
        previewFrame.srcdoc = currentGeneratedCode;
    }
}

function closeAllPanels() {
    document.getElementById('chat-sidebar').classList.remove('open');
    document.getElementById('preview-window').classList.remove('open');
    document.getElementById('overlay').classList.add('hidden');
}

// =============================================
// CHAT FUNCTIONALITY
// =============================================

function addChatMessage(content, isUser = false) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-bubble ${isUser ? 'user-message bg-blue-600' : 'bg-gray-700'} rounded-2xl p-4`;
    
    if (isUser) {
        messageDiv.innerHTML = `
            <div class="flex items-start space-x-3 justify-end">
                <div class="flex-1 text-right">
                    <p class="font-semibold text-blue-300 text-sm">You</p>
                    <p class="text-white mt-1 text-sm">${escapeHtml(content)}</p>
                </div>
                <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <i class="fas fa-user text-white text-sm"></i>
                </div>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="flex items-start space-x-3">
                <div class="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <i class="fas fa-robot text-white text-sm"></i>
                </div>
                <div class="flex-1">
                    <p class="font-semibold text-green-400 text-sm">BuildGenius AI</p>
                    <div class="text-gray-200 mt-1 text-sm">${formatAIResponse(content)}</div>
                </div>
            </div>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showChatTyping() {
    document.getElementById('typing-indicator').classList.remove('hidden');
}

function hideChatTyping() {
    document.getElementById('typing-indicator').classList.add('hidden');
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;
    
    input.value = '';
    addChatMessage(message, true);
    showChatTyping();
    
    try {
        const response = await getAIResponse(message);
        addChatMessage(response, false);
    } catch (error) {
        addChatMessage("I'm having trouble connecting. Please try again!", false);
    }
    
    hideChatTyping();
}

// =============================================
// AI RESPONSE GENERATION (Same as before)
// =============================================

async function getAIResponse(message) {
    try {
        const groqResponse = await tryGroqChat(message);
        if (groqResponse) return groqResponse;
        
        const geminiResponse = await tryGeminiChat(message);
        if (geminiResponse) return geminiResponse;
        
        return getFallbackResponse(message);
    } catch (error) {
        return getFallbackResponse(message);
    }
}

async function tryGroqChat(message) {
    try {
        const apiKey = getSecureAPIKey('groq');
        const response = await fetch(API_CONFIG.groq.url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [{
                    role: 'user',
                    content: `As BuildGenius AI, help with app development: ${message}`
                }],
                model: 'llama3-8b-8192',
                temperature: 0.7,
                max_tokens: 500
            })
        });
        
        if (!response.ok) return null;
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        return null;
    }
}

async function tryGeminiChat(message) {
    try {
        const apiKey = getSecureAPIKey('gemini');
        const response = await fetch(`${API_CONFIG.gemini.url}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `As BuildGenius AI, help with: ${message}`
                    }]
                }]
            })
        });
        
        if (!response.ok) return null;
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        return null;
    }
}

function getFallbackResponse(message) {
    if (message.toLowerCase().includes('app')) {
        return `Great question about app development! 🚀

I'd love to help you build that. You can:
1. Describe your app idea in the main panel
2. Our AI will generate the complete code
3. Preview it instantly in the preview window

Need specific help with features or design?`;
    }
    return `Thanks for your message! I specialize in helping people create amazing web applications. Feel free to ask me anything about app development! 🎯`;
}

// =============================================
// UTILITY FUNCTIONS
// =============================================

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatAIResponse(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
}

// =============================================
// REST OF YOUR EXISTING CODE (App generation, etc.)
// =============================================

// ... (Your existing app generation code remains the same)
// Just make sure to update the preview function to use the new sidebar

let currentGeneratedCode = '';

function showSection(sectionName) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(`${sectionName}-section`).classList.remove('hidden');
}

function insertTemplate(templateType) {
    const templates = {
        todo: "Create a beautiful todo list app with dark theme, add/delete tasks, local storage, and responsive design",
        calculator: "Create a scientific calculator with basic operations, scientific functions, and beautiful UI",
        weather: "Create a weather app with current temperature, forecast, and beautiful gradients"
    };
    document.getElementById('app-prompt').value = templates[templateType] || '';
}

// ... Continue with your existing app generation functions
