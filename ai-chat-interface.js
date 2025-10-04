// =============================================
// AI CHAT INTERFACE - Complete UI Integration
// =============================================

class AIChatInterface {
    constructor() {
        this.aiEngine = window.buildGeniusAI;
        this.isOpen = false;
        this.initializeInterface();
    }

    initializeInterface() {
        this.createChatWidget();
        this.setupEventListeners();
    }

    createChatWidget() {
        const chatHTML = `
        <div id="ai-chat-widget" class="fixed bottom-6 right-6 z-50">
            <!-- Chat Button -->
            <button id="ai-chat-toggle" class="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition duration-300">
                <i class="fas fa-robot text-white text-2xl"></i>
            </button>

            <!-- Chat Window -->
            <div id="ai-chat-window" class="hidden absolute bottom-20 right-0 w-96 h-96 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 flex flex-col">
                <!-- Header -->
                <div class="bg-gray-900 px-4 py-3 rounded-t-2xl border-b border-gray-700 flex justify-between items-center">
                    <div class="flex items-center space-x-3">
                        <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <h3 class="font-semibold">BuildGenius AI</h3>
                    </div>
                    <button id="ai-chat-close" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <!-- Messages -->
                <div id="ai-chat-messages" class="flex-1 overflow-y-auto p-4 space-y-4">
                    <div class="message-bubble bg-gray-700 rounded-2xl p-4">
                        <div class="flex items-start space-x-3">
                            <div class="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                                <i class="fas fa-robot text-white text-sm"></i>
                            </div>
                            <div class="flex-1">
                                <p class="font-semibold text-green-400 text-sm">BuildGenius AI</p>
                                <p class="text-gray-200 mt-1 text-sm">
                                    Hello! I'm your AI development assistant. 🚀<br>
                                    I can help you build apps, generate code, design UI, and much more!
                                </p>
                                <p class="text-gray-400 text-xs mt-2">What would you like to create today?</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Typing Indicator -->
                <div id="ai-typing-indicator" class="hidden px-4 py-2 bg-gray-800">
                    <div class="flex items-center space-x-2 text-gray-400">
                        <div class="flex space-x-1">
                            <div class="typing-indicator"></div>
                            <div class="typing-indicator"></div>
                            <div class="typing-indicator"></div>
                        </div>
                        <span class="text-sm">AI is thinking...</span>
                    </div>
                </div>

                <!-- Input Area -->
                <div class="border-t border-gray-700 p-4 bg-gray-800 rounded-b-2xl">
                    <div class="flex space-x-2">
                        <input 
                            type="text" 
                            id="ai-chat-input"
                            placeholder="Ask me to build an app, generate code, or help with design..."
                            class="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500 text-sm"
                        >
                        <button 
                            id="ai-chat-send"
                            class="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 px-4 py-2 rounded-lg font-semibold transition text-sm"
                        >
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>

                    <!-- Quick Actions -->
                    <div class="flex flex-wrap gap-2 mt-3">
                        <button class="quick-action px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition" data-action="build-app">
                            🚀 Build App
                        </button>
                        <button class="quick-action px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition" data-action="generate-code">
                            💻 Generate Code
                        </button>
                        <button class="quick-action px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition" data-action="ui-design">
                            🎨 UI Design
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatHTML);
    }

    setupEventListeners() {
        // Toggle chat
        document.getElementById('ai-chat-toggle').addEventListener('click', () => this.toggleChat());
        document.getElementById('ai-chat-close').addEventListener('click', () => this.closeChat());

        // Send message
        document.getElementById('ai-chat-send').addEventListener('click', () => this.sendMessage());
        document.getElementById('ai-chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Quick actions
        document.querySelectorAll('.quick-action').forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleQuickAction(action);
            });
        });
    }

    toggleChat() {
        const chatWindow = document.getElementById('ai-chat-window');
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            chatWindow.classList.remove('hidden');
            document.getElementById('ai-chat-input').focus();
        } else {
            chatWindow.classList.add('hidden');
        }
    }

    closeChat() {
        document.getElementById('ai-chat-window').classList.add('hidden');
        this.isOpen = false;
    }

    async sendMessage() {
        const input = document.getElementById('ai-chat-input');
        const message = input.value.trim();
        
        if (!message) return;

        // Add user message
        this.addMessage(message, 'user');
        input.value = '';

        // Show typing indicator
        this.showTyping();

        try {
            // Process with AI engine
            const response = await this.aiEngine.processUserInput(message);
            this.addMessage(response, 'assistant');
        } catch (error) {
            this.addMessage('Sorry, I encountered an error. Please try again.', 'assistant');
        }

        this.hideTyping();
    }

    addMessage(content, role) {
        const messagesContainer = document.getElementById('ai-chat-messages');
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-bubble ${role === 'user' ? 'user-message bg-blue-600' : 'bg-gray-700'} rounded-2xl p-4`;
        
        if (role === 'user') {
            messageDiv.innerHTML = `
                <div class="flex items-start space-x-3 justify-end">
                    <div class="flex-1 text-right">
                        <p class="font-semibold text-blue-300 text-sm">You</p>
                        <p class="text-white mt-1 text-sm">${this.escapeHtml(content)}</p>
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
                        <div class="text-gray-200 mt-1 text-sm">${this.formatAIResponse(content)}</div>
                    </div>
                </div>
            `;
        }

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    handleQuickAction(action) {
        const prompts = {
            'build-app': 'I want to build a web application. Can you help me create a complete app with modern features?',
            'generate-code': 'Generate professional code for a responsive web component with best practices.',
            'ui-design': 'Help me design a beautiful and modern user interface for my application.'
        };

        document.getElementById('ai-chat-input').value = prompts[action];
        document.getElementById('ai-chat-input').focus();
    }

    showTyping() {
        document.getElementById('ai-typing-indicator').classList.remove('hidden');
    }

    hideTyping() {
        document.getElementById('ai-typing-indicator').classList.add('hidden');
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    formatAIResponse(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\`\`\`([^]+?)\`\`\`/g, '<pre class="bg-gray-900 p-3 rounded my-2 overflow-auto"><code>$1</code></pre>')
            .replace(/\`(.*?)\`/g, '<code class="bg-gray-700 px-1 rounded">$1</code>')
            .replace(/\n/g, '<br>');
    }
}

// =============================================
// INTEGRATION WITH EXISTING APP
// =============================================

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Load AI Engine first
    const script = document.createElement('script');
    script.src = 'assets/js/ai-engine.js';
    document.head.appendChild(script);

    // Initialize chat interface after AI engine loads
    script.onload = function() {
        new AIChatInterface();
        
        // Make AI engine available globally for other components
        window.AI = {
            generateApp: (description) => window.buildGeniusAI.generateCompleteApp(description),
            debugCode: (code, error) => window.buildGeniusAI.debugCode(code, error),
            optimizeCode: (code) => window.buildGeniusAI.optimizeCode(code),
            generateAPI: (description) => window.buildGeniusAI.generateAPIIntegration(description)
        };
    };
});
