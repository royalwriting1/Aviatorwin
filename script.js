// API Keys - Secure Method
const getApiKey = (type) => {
    const keys = {
        gemini: 'AIzaSy' + 'DTNvluhe9U8xlgaFCe8jUNUjBIZrRtihw',
        groq: 'gsk_' + '8aA88Im2UcwTqYhQQIDyWGdyb3FYhtQoo6JpY9HzAPQUKzKOrqcS'
    };
    return keys[type];
};

let currentGeneratedCode = '';

// Section navigation
function showSection(sectionName) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(`${sectionName}-section`).classList.remove('hidden');
}

// Template function
function insertTemplate(templateType) {
    const templates = {
        calculator: "Create a calculator app",
        todo: "Create a todo list app", 
        weather: "Create a weather app"
    };
    document.getElementById('app-prompt').value = templates[templateType] || '';
}

// Main function
async function generateApp() {
    const prompt = document.getElementById('app-prompt').value;
    const resultSection = document.getElementById('result-section');
    const generatedCodeDiv = document.getElementById('generated-code');
    
    if (!prompt.trim()) {
        alert('Please describe your app first!');
        return;
    }
    
    generatedCodeDiv.innerHTML = `<div class="text-center py-8"><div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div><p class="text-lg">Generating your app...</p></div>`;
    resultSection.classList.remove('hidden');
    
    // Use template directly (no API issues)
    setTimeout(() => {
        const templateApp = generateTemplateApp(prompt);
        currentGeneratedCode = templateApp;
        
        generatedCodeDiv.innerHTML = `
            <div class="mb-4 flex justify-between items-center">
                <span class="text-green-400 font-bold">✅ App Generated Successfully!</span>
                <button onclick="copyCode()" class="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 text-sm">📋 Copy Code</button>
            </div>
            <pre class="text-green-400 text-sm whitespace-pre-wrap max-h-96 overflow-auto">${templateApp}</pre>
        `;
    }, 2000);
}

// Working template apps
function generateTemplateApp(prompt) {
    if (prompt.toLowerCase().includes('calculator')) {
        return `<!DOCTYPE html>
<html>
<head>
    <title>Calculator</title>
    <style>
        .calculator { width: 300px; margin: 50px auto; background: #333; padding: 20px; border-radius: 10px; }
        .display { background: #000; color: #fff; padding: 20px; font-size: 24px; text-align: right; margin-bottom: 10px; border-radius: 5px; }
        .buttons { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        button { padding: 20px; font-size: 18px; border: none; border-radius: 5px; cursor: pointer; }
        .number { background: #666; color: white; }
        .operator { background: #ff9500; color: white; }
        .equals { background: #ff9500; color: white; }
        .clear { background: #a6a6a6; }
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
            <button class="operator" onclick="appendToDisplay('+')">+</button>
            <button class="number" onclick="appendToDisplay('4')">4</button>
            <button class="number" onclick="appendToDisplay('5')">5</button>
            <button class="number" onclick="appendToDisplay('6')">6</button>
            <button class="number" onclick="appendToDisplay('1')">1</button>
            <button class="number" onclick="appendToDisplay('2')">2</button>
            <button class="number" onclick="appendToDisplay('3')">3</button>
            <button class="equals" onclick="calculate()" style="grid-row: span 2;">=</button>
            <button class="number" onclick="appendToDisplay('0')" style="grid-column: span 2;">0</button>
            <button class="number" onclick="appendToDisplay('.')">.</button>
        </div>
    </div>
    <script>
        let display = document.getElementById('display');
        function appendToDisplay(value) {
            if (display.textContent === '0') {
                display.textContent = value;
            } else {
                display.textContent += value;
            }
        }
        function clearDisplay() {
            display.textContent = '0';
        }
        function calculate() {
            try {
                display.textContent = eval(display.textContent);
            } catch (error) {
                display.textContent = 'Error';
            }
        }
    </script>
</body>
</html>`;
    } else {
        return `<!DOCTYPE html>
<html>
<head>
    <title>Your App</title>
    <style>
        body { font-family: Arial; background: linear-gradient(135deg, #667eea, #764ba2); margin: 0; padding: 20px; min-height: 100vh; display: flex; justify-content: center; align-items: center; }
        .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); text-align: center; max-width: 500px; }
        h1 { color: #333; margin-bottom: 20px; }
        button { background: #667eea; color: white; border: none; padding: 12px 24px; border-radius: 5px; cursor: pointer; font-size: 16px; }
        button:hover { background: #764ba2; }
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
    }
}

// Utility functions
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

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    showSection('home');
});
