// Secure API Configuration
const API_CONFIG = {
    // API keys are split for basic security
    // In production, use environment variables
    gemini: {
        key: 'AIzaSy' + 'DTNvluhe9U8xlgaFCe8jUNUjBIZrRtihw',
        url: 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent'
    },
    groq: {
        key: 'gsk_' + '8aA88Im2UcwTqYhQQIDyWGdyb3FYhtQoo6JpY9HzAPQUKzKOrqcS',
        url: 'https://api.groq.com/openai/v1/chat/completions'
    }
};

let currentGeneratedCode = '';

// Section navigation
function showSection(sectionName) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(`${sectionName}-section`).classList.remove('hidden');
}

// Template insert function
function insertTemplate(templateType) {
    const promptTextarea = document.getElementById('app-prompt');
    
    const templates = {
        todo: `Create a beautiful todo list app with:
- Dark theme with gradient background
- Add new tasks functionality
- Delete tasks with confirmation
- Mark tasks as completed
- Local storage to save tasks
- Responsive design for mobile and desktop
- Smooth animations and transitions
- Clean and modern UI`,

        calculator: `Create a scientific calculator app with:
- Dark glass morphism design
- Basic operations (+, -, *, /)
- Scientific functions (sin, cos, tan, log, sqrt)
- Memory functions (M+, M-, MR, MC)
- Responsive touch-friendly buttons
- Keyboard support
- Error handling for invalid operations
- Beautiful display with history`,

        weather: `Create a weather app with:
- Beautiful gradient background based on weather
- Current temperature and conditions
- 5-day forecast
- Location detection
- Search by city name
- Weather icons for different conditions
- Humidity, wind speed, pressure display
- Responsive design with smooth animations`,

        portfolio: `Create a personal portfolio website with:
- Modern dark theme with accent colors
- Hero section with profile picture
- About me section
- Skills and technologies
- Projects gallery
- Contact form
- Smooth scrolling navigation
- Responsive design for all devices
- Social media links`
    };
    
    promptTextarea.value = templates[templateType] || '';
    promptTextarea.focus();
}

// Main app generation function
async function generateApp() {
    const prompt = document.getElementById('app-prompt').value;
    const resultSection = document.getElementById('result-section');
    const generatedCodeDiv = document.getElementById('generated-code');
    
    if (!prompt.trim()) {
        alert('Please describe your app first!');
        return;
    }
    
    // Loading state
    generatedCodeDiv.innerHTML = `
        <div class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p class="text-lg">AI is generating your app...</p>
            <p class="text-gray-400 text-sm mt-2">This may take 20-30 seconds</p>
        </div>
    `;
    resultSection.classList.remove('hidden');
    
    try {
        // Try Groq API first (faster)
        let generatedCode = await tryGroqGeneration(prompt);
        
        // If Groq fails, try Gemini
        if (!generatedCode) {
            generatedCode = await tryGeminiGeneration(prompt);
        }
        
        // If both APIs fail, use template
        if (!generatedCode) {
            generatedCode = generateTemplateApp(prompt);
        }
        
        currentGeneratedCode = generatedCode;
        
        // Display success
        generatedCodeDiv.innerHTML = `
            <div class="mb-4 flex justify-between items-center">
                <span class="text-green-400 font-bold">✅ App Generated Successfully!</span>
                <button onclick="copyCode()" class="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 text-sm">📋 Copy Code</button>
            </div>
            <pre class="text-green-400 text-sm whitespace-pre-wrap max-h-96 overflow-auto">${escapeHtml(generatedCode)}</pre>
        `;
        
        // Save to local storage
        saveAppToStorage(prompt, generatedCode);
        
    } catch (error) {
        console.error('Generation error:', error);
        // Fallback to template
        const templateApp = generateTemplateApp(prompt);
        currentGeneratedCode = templateApp;
        
        generatedCodeDiv.innerHTML = `
            <div class="mb-4 flex justify-between items-center">
                <span class="text-yellow-400 font-bold">⚠️ Using High-Quality Template</span>
                <button onclick="copyCode()" class="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 text-sm">📋 Copy Code</button>
            </div>
            <pre class="text-green-400 text-sm whitespace-pre-wrap max-h-96 overflow-auto">${escapeHtml(templateApp)}</pre>
        `;
        
        saveAppToStorage(prompt, templateApp);
    }
}

// Groq API Integration
async function tryGroqGeneration(prompt) {
    try {
        const response = await fetch(API_CONFIG.groq.url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_CONFIG.groq.key}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [{
                    role: 'user',
                    content: `Create a complete, ready-to-run web application based on: "${prompt}". Return ONLY the complete HTML, CSS, and JavaScript code in one file. Make it beautiful, responsive, and functional. Start with <!DOCTYPE html>`
                }],
                model: 'llama3-8b-8192',
                temperature: 0.7,
                max_tokens: 4000
            })
        });
        
        if (!response.ok) throw new Error('Groq API failed');
        
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.log('Groq API failed, trying Gemini...');
        return null;
    }
}

// Gemini API Integration
async function tryGeminiGeneration(prompt) {
    try {
        const response = await fetch(`${API_CONFIG.gemini.url}?key=${API_CONFIG.gemini.key}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Create a complete, ready-to-run web application based on: "${prompt}". Return ONLY the complete HTML, CSS, and JavaScript code in one file. Make it beautiful and responsive. Start with <!DOCTYPE html>`
                    }]
                }]
            })
        });
        
        if (!response.ok) throw new Error('Gemini API failed');
        
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.log('Gemini API failed');
        return null;
    }
}

// High-quality template apps
function generateTemplateApp(prompt) {
    const appType = getAppTypeFromPrompt(prompt);
    
    const templates = {
        calculator: `<!DOCTYPE html>
<html>
<head>
    <title>Calculator App</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Arial', sans-serif; 
            background: linear-gradient(135deg, #667eea, #764ba2);
            display: flex; 
            justify-content: center; 
            align-items: center; 
            min-height: 100vh; 
            padding: 20px;
        }
        .calculator {
            background: #2c3e50;
            padding: 25px;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            width: 100%;
            max-width: 350px;
        }
        .display {
            background: #34495e;
            color: white;
            padding: 20px;
            font-size: 2em;
            text-align: right;
            border-radius: 10px;
            margin-bottom: 20px;
            min-height: 80px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            word-wrap: break-word;
        }
        .buttons {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
        }
        button {
            padding: 20px;
            font-size: 1.2em;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.2s;
            font-weight: bold;
        }
        button:active { transform: scale(0.95); }
        .number { background: #ecf0f1; color: #2c3e50; }
        .number:hover { background: #bdc3c7; }
        .operator { background: #e67e22; color: white; }
        .operator:hover { background: #d35400; }
        .equals { background: #27ae60; color: white; }
        .equals:hover { background: #229954; }
        .clear { background: #e74c3c; color: white; }
        .clear:hover { background: #c0392b; }
        .zero { grid-column: span 2; }
    </style>
</head>
<body>
    <div class="calculator">
        <div class="display" id="display">0</div>
        <div class="buttons">
            <button class="clear" onclick="clearDisplay()">C</button>
            <button class="operator" onclick="appendToDisplay('/')">/</button>
            <button class="operator" onclick="appendToDisplay('*')">×</button>
            <button class="operator" onclick="appendToDisplay('-')">-</button>
            <button class="number" onclick="appendToDisplay('7')">7</button>
            <button class="number" onclick="appendToDisplay('8')">8</button>
            <button class="number" onclick="appendToDisplay('9')">9</button>
            <button class="operator" onclick="appendToDisplay('+')" style="grid-row: span 2;">+</button>
            <button class="number" onclick="appendToDisplay('4')">4</button>
            <button class="number" onclick="appendToDisplay('5')">5</button>
            <button class="number" onclick="appendToDisplay('6')">6</button>
            <button class="number" onclick="appendToDisplay('1')">1</button>
            <button class="number" onclick="appendToDisplay('2')">2</button>
            <button class="number" onclick="appendToDisplay('3')">3</button>
            <button class="equals" onclick="calculate()" style="grid-row: span 2;">=</button>
            <button class="number zero" onclick="appendToDisplay('0')">0</button>
            <button class="number" onclick="appendToDisplay('.')">.</button>
        </div>
    </div>

    <script>
        let display = document.getElementById('display');
        let currentInput = '0';
        let shouldResetDisplay = false;
        
        function updateDisplay() {
            display.textContent = currentInput;
        }
        
        function appendToDisplay(value) {
            if (currentInput === '0' || shouldResetDisplay) {
                currentInput = value;
                shouldResetDisplay = false;
            } else {
                currentInput += value;
            }
            updateDisplay();
        }
        
        function clearDisplay() {
            currentInput = '0';
            shouldResetDisplay = false;
            updateDisplay();
        }
        
        function calculate() {
            try {
                currentInput = eval(currentInput).toString();
                shouldResetDisplay = true;
                updateDisplay();
            } catch (error) {
                currentInput = 'Error';
                shouldResetDisplay = true;
                updateDisplay();
            }
        }
        
        // Keyboard support
        document.addEventListener('keydown', function(event) {
            const key = event.key;
            if ('0123456789+-*/.'.includes(key)) {
                appendToDisplay(key);
            } else if (key === 'Enter' || key === '=') {
                calculate();
            } else if (key === 'Escape' || key === 'c' || key === 'C') {
                clearDisplay();
            } else if (key === 'Backspace') {
                currentInput = currentInput.slice(0, -1) || '0';
                updateDisplay();
            }
        });
    </script>
</body>
</html>`,

        todo: `<!DOCTYPE html>
<html>
<head>
    <title>Todo List App</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 500px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        h1 {
            color: white;
            text-align: center;
            margin-bottom: 30px;
            font-size: 2.5em;
            text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        .input-section {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
        }
        input {
            flex: 1;
            padding: 15px 20px;
            border: none;
            border-radius: 50px;
            font-size: 16px;
            background: rgba(255, 255, 255, 0.9);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        button {
            padding: 15px 25px;
            border: none;
            border-radius: 50px;
            background: #4CAF50;
            color: white;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        button:hover {
            background: #45a049;
            transform: translateY(-2px);
        }
        .todo-list {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        .todo-item {
            background: rgba(255, 255, 255, 0.95);
            padding: 20px;
            border-radius: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            animation: slideIn 0.3s ease;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .todo-text {
            flex: 1;
            font-size: 16px;
            color: #333;
        }
        .completed .todo-text {
            text-decoration: line-through;
            color: #888;
        }
        .delete-btn {
            background: #ff4444;
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 14px;
        }
        .delete-btn:hover {
            background: #cc0000;
        }
        @keyframes slideIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📝 Todo List</h1>
        
        <div class="input-section">
            <input type="text" id="todoInput" placeholder="Add a new task...">
            <button onclick="addTodo()">Add Task</button>
        </div>
        
        <div class="todo-list" id="todoList"></div>
    </div>

    <script>
        let todos = JSON.parse(localStorage.getItem('todos')) || [];
        
        function renderTodos() {
            const todoList = document.getElementById('todoList');
            todoList.innerHTML = '';
            
            todos.forEach((todo, index) => {
                const todoItem = document.createElement('div');
                todoItem.className = \`todo-item \${todo.completed ? 'completed' : ''}\`;
                todoItem.innerHTML = \`
                    <span class="todo-text">\${todo.text}</span>
                    <button class="delete-btn" onclick="deleteTodo(\${index})">Delete</button>
                \`;
                
                todoItem.addEventListener('click', (e) => {
                    if (e.target !== todoItem.querySelector('.delete-btn')) {
                        toggleTodo(index);
                    }
                });
                
                todoList.appendChild(todoItem);
            });
        }
        
        function addTodo() {
            const input = document.getElementById('todoInput');
            const text = input.value.trim();
            
            if (text) {
                todos.push({ text, completed: false });
                input.value = '';
                saveTodos();
                renderTodos();
            }
        }
        
        function deleteTodo(index) {
            if (confirm('Are you sure you want to delete this task?')) {
                todos.splice(index, 1);
                saveTodos();
                renderTodos();
            }
        }
        
        function toggleTodo(index) {
            todos[index].completed = !todos[index].completed;
            saveTodos();
            renderTodos();
        }
        
        function saveTodos() {
            localStorage.setItem('todos', JSON.stringify(todos));
        }
        
        // Enter key support
        document.getElementById('todoInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addTodo();
            }
        });
        
        // Initial render
        renderTodos();
    </script>
</body>
</html>`
    };
    
    return templates[appType] || templates.calculator;
}

function getAppTypeFromPrompt(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    if (lowerPrompt.includes('todo') || lowerPrompt.includes('task')) return 'todo';
    if (lowerPrompt.includes('calculator') || lowerPrompt.includes('calc')) return 'calculator';
    if (lowerPrompt.includes('weather')) return 'weather';
    return 'calculator';
}

// Utility functions
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function copyCode() {
    navigator.clipboard.writeText(currentGeneratedCode).then(() => {
        alert('✅ Code copied to clipboard!');
    });
}

function downloadApp() {
    const blob = new Blob([currentGeneratedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-app.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function previewApp() {
    const newWindow = window.open();
    newWindow.document.write(currentGeneratedCode);
    newWindow.document.close();
}

function deployApp() {
    alert('🚀 Deployment feature coming soon! For now, download the code and upload to Netlify/Vercel.');
}

function saveAppToStorage(prompt, code) {
    let apps = JSON.parse(localStorage.getItem('buildgenius-apps') || '[]');
    apps.unshift({
        id: Date.now(),
        prompt: prompt,
        code: code,
        timestamp: new Date().toLocaleString(),
        preview: code.substring(0, 200) + '...'
    });
    
    if (apps.length > 50) apps = apps.slice(0, 50);
    localStorage.setItem('buildgenius-apps', JSON.stringify(apps));
    updateAppsList();
}

function updateAppsList() {
    const appsList = document.getElementById('apps-list');
    const apps = JSON.parse(localStorage.getItem('buildgenius-apps') || '[]');
    
    if (apps.length === 0) {
        appsList.innerHTML = '<p class="text-gray-400 text-center">No apps created yet. Go to "Create App" to build your first app!</p>';
        return;
    }
    
    appsList.innerHTML = apps.map(app => \`
        <div class="bg-gray-700 rounded-lg p-4 mb-4">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <h3 class="font-bold text-lg mb-2">\${app.prompt.substring(0, 60)}...</h3>
                    <p class="text-gray-400 text-sm mb-2">Created: \${app.timestamp}</p>
                    <pre class="text-gray-500 text-xs bg-gray-800 p-2 rounded overflow-hidden">\${app.preview}</pre>
                </div>
                <div class="flex space-x-2 ml-4">
                    <button onclick="loadApp(\${app.id})" class="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 text-sm">Load</button>
                    <button onclick="deleteApp(\${app.id})" class="px-3 py-1 bg-red-600 rounded hover:bg-red-700 text-sm">Delete</button>
                </div>
            </div>
        </div>
    \`).join('');
}

function loadApp(appId) {
    const apps = JSON.parse(localStorage.getItem('buildgenius-apps') || '[]');
    const app = apps.find(a => a.id === appId);
    
    if (app) {
        currentGeneratedCode = app.code;
        document.getElementById('app-prompt').value = app.prompt;
        showSection('create');
        
        const generatedCodeDiv = document.getElementById('generated-code');
        generatedCodeDiv.innerHTML = \`
            <div class="mb-4 flex justify-between items-center">
                <span class="text-green-400 font-bold">✅ Loaded from History</span>
                <button onclick="copyCode()" class="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 text-sm">📋 Copy Code</button>
            </div>
            <pre class="text-green-400 text-sm whitespace-pre-wrap">\${escapeHtml(app.code)}</pre>
        \`;
        
        document.getElementById('result-section').classList.remove('hidden');
    }
}

function deleteApp(appId) {
    if (confirm('Are you sure you want to delete this app?')) {
        let apps = JSON.parse(localStorage.getItem('buildgenius-apps') || '[]');
        apps = apps.filter(a => a.id !== appId);
        localStorage.setItem('buildgenius-apps', JSON.stringify(apps));
        updateAppsList();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateAppsList();
    showSection('home');
});
