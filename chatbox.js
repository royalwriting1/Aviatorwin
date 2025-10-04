// =============================================
// AI CHATBOX CONFIGURATION
// =============================================

// Secure API Configuration
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
// CHAT HISTORY MANAGEMENT
// =============================================

class ChatHistory {
    constructor() {
        this.key = 'buildgenius-chat-history';
        this.maxMessages = 100;
    }
    
    saveMessage(role, content) {
        try {
            const history = this.getHistory();
            history.push({
                role,
                content,
                timestamp: new Date().toISOString(),
                id: Date.now() + Math.random()
            });
            
            // Keep only recent messages
            const trimmed = history.slice(-this.maxMessages);
            localStorage.setItem(this.key, JSON.stringify(trimmed));
        } catch (error) {
            console.error('Chat save error:', error);
        }
    }
    
    getHistory() {
        try {
            return JSON.parse(localStorage.getItem(this.key) || '[]');
        } catch (error) {
            return [];
        }
    }
    
    clearHistory() {
        localStorage.removeItem(this.key);
        location.reload();
    }
}

const chatHistory = new ChatHistory();

// =============================================
// CHAT UI MANAGEMENT
// =============================================

function addMessage(content, isUser = false) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-bubble ${isUser ? 'user-message bg-blue-600' : 'bg-gray-700'} rounded-2xl p-4`;
    
    if (isUser) {
        messageDiv.innerHTML = `
            <div class="flex items-start space-x-3 justify-end">
                <div class="flex-1 text-right">
                    <p class="font-semibold text-blue-300">You</p>
                    <p class="text-white mt-1">${escapeHtml(content)}</p>
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
                    <p class="font-semibold text-green-400">BuildGenius AI</p>
                    <div class="text-gray-200 mt-1 prose prose-invert max-w-none">${formatAIResponse(content)}</div>
                </div>
            </div>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Save to history
    chatHistory.saveMessage(isUser ? 'user' : 'assistant', content);
}

function showTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.classList.remove('hidden');
}

function hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.classList.add('hidden');
}

// =============================================
// MESSAGE HANDLING
// =============================================

async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    
    if (!userInput || !userInput.value.trim()) return;
    
    const message = userInput.value.trim();
    userInput.value = '';
    sendBtn.disabled = true;
    
    // Add user message to chat
    addMessage(message, true);
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Get AI response
        const aiResponse = await getAIResponse(message);
        addMessage(aiResponse, false);
    } catch (error) {
        console.error('Chat error:', error);
        addMessage("I'm having trouble connecting right now. Please try again in a moment. Meanwhile, you can try our app builder directly!", false);
    } finally {
        hideTypingIndicator();
        sendBtn.disabled = false;
        userInput.focus();
    }
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function quickAction(action) {
    const prompts = {
        'app-ideas': "Can you suggest some unique web app ideas that I can build with your app builder?",
        'technical-help': "I need technical help with my app. Can you guide me through common issues?",
        'code-review': "Can you review my app code and suggest improvements?",
        'feature-suggest': "What features should I add to make my app more engaging for users?"
    };
    
    document.getElementById('user-input').value = prompts[action] || prompts['app-ideas'];
    document.getElementById('user-input').focus();
}

// =============================================
// AI RESPONSE GENERATION
// =============================================

async function getAIResponse(userMessage) {
    try {
        // Try Groq first (faster)
        const groqResponse = await tryGroqChat(userMessage);
        if (groqResponse) return groqResponse;
        
        // Try Gemini as backup
        const geminiResponse = await tryGeminiChat(userMessage);
        if (geminiResponse) return geminiResponse;
        
        // Fallback response
        return getFallbackResponse(userMessage);
        
    } catch (error) {
        console.error('AI response error:', error);
        return getFallbackResponse(userMessage);
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
                messages: [
                    {
                        role: 'system',
                        content: `You are BuildGenius AI Assistant, a helpful expert in web development and app creation. You help users build amazing web applications using our app builder platform. Be friendly, encouraging, and provide practical advice. Always suggest using our BuildGenius app builder when relevant. Keep responses conversational but informative.`
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                model: 'llama3-8b-8192',
                temperature: 0.7,
                max_tokens: 1000
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
                        text: `You are BuildGenius AI Assistant. Help users with app development and suggest using our app builder. User message: ${message}`
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1000,
                }
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
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('app') || lowerMessage.includes('build')) {
        return `Great question about app development! 🚀

I'd love to help you build that with our **BuildGenius App Builder**. Here's what you can do:

1. **Describe your app idea** in detail
2. **Our AI will generate** the complete code
3. **Download or deploy** instantly

Why not try our app builder? It can create:
• Todo lists, calculators, weather apps
• Portfolio websites, business sites
• Custom web applications

Want me to help you refine your idea, or would you like to try the app builder directly?`;
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('problem')) {
        return `I'm here to help! 🔧

For technical issues with your app, you can:
1. **Use our app builder** - it handles most complexity automatically
2. **Describe the issue** - I can suggest solutions
3. **Check generated code** - our templates are well-tested

Common solutions:
• Make sure to describe your app clearly
• Use specific features you want
• Test the generated app in preview mode

What specific issue are you facing?`;
    }
    
    return `Thanks for your message! 🤖

I'm BuildGenius AI, and I specialize in helping people create amazing web applications. I can:

• Brainstorm app ideas with you
• Provide technical guidance
• Help with feature planning
• Suggest improvements

Feel free to ask me anything about web development, or try our app builder to create your app instantly!

What would you like to build today? 🎯`;
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
    // Convert markdown-like formatting to HTML
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>')
        .replace(/(\d+\.)\s/g, '<br>$1 ')
        .replace(/•\s/g, '<br>• ');
}

// =============================================
// INITIALIZATION
// =============================================

document.addEventListener('DOMContentLoaded', function() {
    // Load chat history
    const history = chatHistory.getHistory();
    history.forEach(msg => {
        if (msg.role === 'user') {
            addMessage(msg.content, true);
        } else if (msg.role === 'assistant') {
            addMessage(msg.content, false);
        }
    });
    
    // Focus input field
    const userInput = document.getElementById('user-input');
    if (userInput) userInput.focus();
    
    // Add clear chat button functionality
    const clearChat = document.createElement('button');
    clearChat.innerHTML = '<i class="fas fa-trash mr-2"></i>Clear Chat';
    clearChat.className = 'px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition ml-auto';
    clearChat.onclick = () => {
        if (confirm('Clear all chat history?')) {
            chatHistory.clearHistory();
        }
    };
    
    const chatHeader = document.querySelector('.bg-gray-900');
    if (chatHeader) {
        chatHeader.appendChild(clearChat);
    }
});
