// Chat History Storage
let chatHistory = JSON.parse(localStorage.getItem('buildgenius_chat_history')) || [];
let currentGeneratedCode = '';

// Toggle Chatbox
function toggleChatbox() {
    const chatbox = document.getElementById('ai-chatbox');
    chatbox.style.display = chatbox.style.display === 'flex' ? 'none' : 'flex';
    loadChatHistory();
}

// Toggle Preview
function togglePreview() {
    const preview = document.getElementById('preview-window');
    preview.style.display = preview.style.display === 'block' ? 'none' : 'block';
}

// Handle Chat Input
function handleChatInput(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Send Message to AI
async function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;

    // Add user message
    addMessage(message, 'user');
    input.value = '';

    // Show typing indicator
    showTyping();

    // Get AI response
    try {
        const response = await getAIResponse(message);
        addMessage(response, 'ai');
        
        // Check if response contains code
        if (containsCode(response)) {
            extractAndShowCode(response);
        }
        
        // Save to history
        saveToHistory(message, response);
    } catch (error) {
        addMessage("Sorry, I'm having trouble connecting. Please try again!", 'ai');
    }

    hideTyping();
}

// AI Response Generator
async function getAIResponse(userMessage) {
    // Free AI APIs - No cost involved
    try {
        // Try Groq AI first (completely free)
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer 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',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [{
                    role: 'user',
                    content: `As a code generation expert, create complete HTML/CSS/JS code for: ${userMessage}. 
                    Provide ready-to-use code with comments. Make it responsive and modern.`
                }],
                model: 'llama3-8b-8192',
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (groqResponse.ok) {
            const data = await groqResponse.json();
            return data.choices[0].message.content;
        }
    } catch (error) {
        console.log('Groq failed, using fallback');
    }

    // Fallback: Generate code based on keywords
    return generateFallbackCode(userMessage);
}

// Generate Code Based on User Request
function generateFallbackCode(description) {
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('todo') || lowerDesc.includes('task')) {
        return `Here's your Todo List App:\n\n\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Todo App</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: Arial, sans-serif; 
            background: #1a202c; 
            color: white;
            padding: 20px;
        }
        .container { max-width: 500px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; }
        .input-section { display: flex; gap: 10px; margin-bottom: 20px; }
        input { 
            flex: 1; 
            padding: 12px; 
            border: none; 
            border-radius: 8px;
            background: #2d3748;
            color: white;
        }
        button { 
            padding: 12px 20px; 
            background: #4299e1; 
            color: white; 
            border: none; 
            border-radius: 8px;
            cursor: pointer;
        }
        .todo-item { 
            background: #2d3748; 
            padding: 15px; 
            margin: 10px 0; 
            border-radius: 8px;
            display: flex;
            justify-content: between;
            align-items: center;
        }
        .delete-btn { 
            background: #e53e3e; 
            padding: 5px 10px; 
            border-radius: 5px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>My Todo List</h1>
        </div>
        <div class="input-section">
            <input type="text" id="todoInput" placeholder="Add a new task...">
            <button onclick="addTodo()">Add</button>
        </div>
        <div id="todoList"></div>
    </div>

    <script>
        let todos = JSON.parse(localStorage.getItem('todos')) || [];
        
        function renderTodos() {
            const todoList = document.getElementById('todoList');
            todoList.innerHTML = todos.map((todo, index) => \`
                <div class="todo-item">
                    <span>\${todo}</span>
                    <button class="delete-btn" onclick="deleteTodo(\${index})">Delete</button>
                </div>
            \`).join('');
        }
        
        function addTodo() {
            const input = document.getElementById('todoInput');
            const text = input.value.trim();
            if (text) {
                todos.push(text);
                localStorage.setItem('todos', JSON.stringify(todos));
                input.value = '';
                renderTodos();
            }
        }
        
        function deleteTodo(index) {
            todos.splice(index, 1);
            localStorage.setItem('todos', JSON.stringify(todos));
            renderTodos();
        }
        
        // Initial render
        renderTodos();
    </script>
</body>
</html>
\`\`\``;
    }
    
    // Add more app templates as needed...
    
    return `I understand you want: "${description}". Here's a basic template to get you started:\n\n\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>Your App</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #0f172a;
            color: white;
        }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { color: #4299e1; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Your App</h1>
        <p>Start building your amazing application!</p>
        <!-- Add your components here -->
    </div>
    <script>
        // Your JavaScript code here
        console.log('App loaded successfully!');
    </script>
</body>
</html>
\`\`\``;
}

// Check if response contains code
function containsCode(response) {
    return response.includes('```') || response.includes('function') || response.includes('const ') || response.includes('let ');
}

// Extract and show code in preview
function extractAndShowCode(response) {
    const codeMatch = response.match(/```(?:html|javascript)?\n([\s\S]*?)```/);
    if (codeMatch) {
        currentGeneratedCode = codeMatch[1];
        showPreview(currentGeneratedCode);
        
        // Add preview button to message
        const messages = document.getElementById('chat-messages');
        const lastMessage = messages.lastElementChild;
        const previewButton = document.createElement('button');
        previewButton.innerHTML = '<i class="fas fa-eye mr-1"></i>Live Preview';
        previewButton.className = 'mt-2 px-3 py-1 bg-purple-500 rounded-lg text-white text-sm hover:bg-purple-600';
        previewButton.onclick = () => togglePreview();
        lastMessage.appendChild(previewButton);
    }
}

// Show preview with generated code
function showPreview(code) {
    const previewFrame = document.getElementById('preview-frame');
    previewFrame.srcdoc = code;
}

// Add message to chat
function addMessage(content, sender) {
    const messages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    if (sender === 'user') {
        messageDiv.innerHTML = `<strong>You:</strong> ${escapeHtml(content)}`;
    } else {
        // Format AI response with code highlighting
        const formattedContent = formatAIResponse(content);
        messageDiv.innerHTML = `<strong>BuildGenius AI:</strong> ${formattedContent}`;
    }
    
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
}

// Format AI response
function formatAIResponse(text) {
    return text
        .replace(/```([\s\S]*?)```/g, '<div class="code-block">$1</div>')
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

// Typing indicator
function showTyping() {
    const messages = document.getElementById('chat-messages');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'message ai-message';
    typingDiv.innerHTML = '<strong>BuildGenius AI:</strong> <i class="fas fa-typing"></i> Generating code...';
    messages.appendChild(typingDiv);
    messages.scrollTop = messages.scrollHeight;
}

function hideTyping() {
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
}

// Save chat history
function saveToHistory(userMessage, aiResponse) {
    chatHistory.push({
        user: userMessage,
        ai: aiResponse,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('buildgenius_chat_history', JSON.stringify(chatHistory));
}

// Load chat history
function loadChatHistory() {
    const messages = document.getElementById('chat-messages');
    messages.innerHTML = '<div class="message ai-message"><strong>BuildGenius AI:</strong> Hello! I can help you create complete apps. Describe what you want to build and I\'ll generate the code! 🚀</div>';
    
    chatHistory.forEach(chat => {
        addMessage(chat.user, 'user');
        addMessage(chat.ai, 'ai');
    });
}

// Clear chat
function clearChat() {
    if (confirm('Clear all chat history?')) {
        chatHistory = [];
        localStorage.removeItem('buildgenius_chat_history');
        loadChatHistory();
    }
}

// Generate sample app
function generateSampleApp() {
    document.getElementById('chat-input').value = "Create a beautiful weather app with current temperature, 5-day forecast, and location search";
    sendMessage();
}

// Download code
function downloadCode() {
    if (!currentGeneratedCode) return;
    
    const blob = new Blob([currentGeneratedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-app.html';
    a.click();
    URL.revokeObjectURL(url);
}

// Deploy app (simulated)
function deployApp() {
    alert('App deployed successfully! 🚀\n\nIn real implementation, this would connect to:\n- Netlify\n- Vercel\n- GitHub Pages\n- Your own hosting');
}

// Utility function
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadChatHistory();
});
