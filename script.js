// Configuration - Yahan aapki API key hai
const GEMINI_API_KEY = 'AIzaSyDTNvluhe9U8xlgaFCe8jUNUjBIZrRtihw';

// Current generated app code store karne ke liye
let currentGeneratedCode = '';

// Section navigation
function showSection(sectionName) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(`${sectionName}-section`).classList.remove('hidden');
}

// Template insert karne ke liye
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
- Responsive design with smooth animations`
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
            <p class="text-lg">AI is generating your app... This may take 20-30 seconds</p>
            <p class="text-gray-400 text-sm mt-2">Creating HTML, CSS, JavaScript code...</p>
        </div>
    `;
    resultSection.classList.remove('hidden');
    
    try {
        // Gemini API call
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Create a complete, ready-to-run web application based on this description: "${prompt}"

Requirements:
- Return ONLY the complete HTML, CSS, and JavaScript code in one file
- Make it visually beautiful with modern CSS
- Include responsive design for mobile and desktop
- Add smooth animations and transitions
- Make sure all functionality works perfectly
- Use modern ES6 JavaScript
- Include proper error handling
- Add comments for important sections

Return the complete code without any explanations or markdown formatting. Start directly with <!DOCTYPE html>`
                    }]
                }]
            })
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0].content.parts[0].text) {
            throw new Error('No response from AI');
        }
        
        const generatedCode = data.candidates[0].content.parts[0].text;
        currentGeneratedCode = generatedCode;
        
        // Display generated code
        generatedCodeDiv.innerHTML = `
            <div class="mb-4 flex justify-between items-center">
                <span class="text-green-400 font-bold">✅ Code Generated Successfully!</span>
                <button onclick="copyCode()" class="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 text-sm">📋 Copy Code</button>
            </div>
            <pre class="text-green-400 text-sm whitespace-pre-wrap">${escapeHtml(generatedCode)}</pre>
        `;
        
        // Save to local storage
        saveAppToStorage(prompt, generatedCode);
        
    } catch (error) {
        console.error('Error:', error);
        generatedCodeDiv.innerHTML = `
            <div class="text-red-400 text-center py-8">
                <p class="text-lg">❌ Error generating app</p>
                <p class="text-sm mt-2">${error.message}</p>
                <p class="text-gray-400 text-sm mt-4">Please try again with a different description.</p>
                <button onclick="generateDummyApp()" class="mt-4 px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-700">
                    Try Demo Version
                </button>
            </div>
        `;
    }
}

// Demo app generation (agar API mein issue ho)
function generateDummyApp() {
    const prompt = document.getElementById('app-prompt').value;
    const generatedCodeDiv = document.getElementById('generated-code');
    
    const demoCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your App</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            text-align: center;
            max-width: 500px;
        }
        h1 {
            color: #333;
            margin-bottom: 20px;
        }
        button {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover {
            background: #764ba2;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Your App is Ready!</h1>
        <p>This is your custom app for: "${prompt}"</p>
        <button onclick="alert('🎉 Your app is working!')">Test My App</button>
    </div>
</body>
</html>`;
    
    currentGeneratedCode = demoCode;
    generatedCodeDiv.innerHTML = `
        <div class="mb-4 flex justify-between items-center">
            <span class="text-yellow-400 font-bold">⚠️ Demo Version</span>
            <button onclick="copyCode()" class="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 text-sm">📋 Copy Code</button>
        </div>
        <pre class="text-green-400 text-sm whitespace-pre-wrap">${escapeHtml(demoCode)}</pre>
    `;
    
    saveAppToStorage(prompt, demoCode);
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
    alert('🚀 Deployment feature coming soon! For now, download the code and upload to Netlify manually.');
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
    
    appsList.innerHTML = apps.map(app => `
        <div class="bg-gray-700 rounded-lg p-4 mb-4">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <h3 class="font-bold text-lg mb-2">${app.prompt.substring(0, 60)}...</h3>
                    <p class="text-gray-400 text-sm mb-2">Created: ${app.timestamp}</p>
                    <pre class="text-gray-500 text-xs bg-gray-800 p-2 rounded overflow-hidden">${app.preview}</pre>
                </div>
                <div class="flex space-x-2 ml-4">
                    <button onclick="loadApp(${app.id})" class="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 text-sm">Load</button>
                    <button onclick="deleteApp(${app.id})" class="px-3 py-1 bg-red-600 rounded hover:bg-red-700 text-sm">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

function loadApp(appId) {
    const apps = JSON.parse(localStorage.getItem('buildgenius-apps') || '[]');
    const app = apps.find(a => a.id === appId);
    
    if (app) {
        currentGeneratedCode = app.code;
        document.getElementById('app-prompt').value = app.prompt;
        showSection('create');
        
        const generatedCodeDiv = document.getElementById('generated-code');
        generatedCodeDiv.innerHTML = `
            <div class="mb-4 flex justify-between items-center">
                <span class="text-green-400 font-bold">✅ Loaded from History</span>
                <button onclick="copyCode()" class="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 text-sm">📋 Copy Code</button>
            </div>
            <pre class="text-green-400 text-sm whitespace-pre-wrap">${escapeHtml(app.code)}</pre>
        `;
        
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
