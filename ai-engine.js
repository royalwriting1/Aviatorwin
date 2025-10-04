// =============================================
// BUILDGENIUS AI ENGINE - Complete Capabilities
// =============================================

class BuildGeniusAI {
    constructor() {
        this.apiKeys = {
            gemini: 'AIzaSyDTNvluhe9U8xlgaFCe8jUNUjBIZrRtihw',
            groq: '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'
        };
        this.conversationHistory = [];
        this.maxHistory = 50;
    }

    // =============================================
    // CORE AI CAPABILITIES
    // =============================================

    async processUserInput(userMessage, context = {}) {
        try {
            // Add to conversation history
            this.addToHistory('user', userMessage);
            
            // Determine intent and route to appropriate handler
            const intent = this.analyzeIntent(userMessage);
            const response = await this.routeToHandler(intent, userMessage, context);
            
            // Add AI response to history
            this.addToHistory('assistant', response);
            
            return response;
            
        } catch (error) {
            console.error('AI Processing Error:', error);
            return this.getFallbackResponse(userMessage);
        }
    }

    analyzeIntent(message) {
        const lowerMsg = message.toLowerCase();
        
        if (lowerMsg.includes('app') || lowerMsg.includes('build') || lowerMsg.includes('create')) {
            return 'app_development';
        } else if (lowerMsg.includes('code') || lowerMsg.includes('program') || lowerMsg.includes('function')) {
            return 'code_generation';
        } else if (lowerMsg.includes('design') || lowerMsg.includes('ui') || lowerMsg.includes('layout')) {
            return 'ui_design';
        } else if (lowerMsg.includes('database') || lowerMsg.includes('table') || lowerMsg.includes('sql')) {
            return 'database';
        } else if (lowerMsg.includes('api') || lowerMsg.includes('endpoint') || lowerMsg.includes('rest')) {
            return 'api_development';
        } else if (lowerMsg.includes('deploy') || lowerMsg.includes('host') || lowerMsg.includes('publish')) {
            return 'deployment';
        } else if (lowerMsg.includes('error') || lowerMsg.includes('bug') || lowerMsg.includes('fix')) {
            return 'debugging';
        } else if (lowerMsg.includes('explain') || lowerMsg.includes('what is') || lowerMsg.includes('how to')) {
            return 'explanation';
        } else {
            return 'general';
        }
    }

    async routeToHandler(intent, message, context) {
        switch (intent) {
            case 'app_development':
                return await this.handleAppDevelopment(message, context);
            case 'code_generation':
                return await this.handleCodeGeneration(message, context);
            case 'ui_design':
                return await this.handleUIDesign(message, context);
            case 'database':
                return await this.handleDatabase(message, context);
            case 'api_development':
                return await this.handleAPIDevelopment(message, context);
            case 'deployment':
                return await this.handleDeployment(message, context);
            case 'debugging':
                return await this.handleDebugging(message, context);
            case 'explanation':
                return await this.handleExplanation(message, context);
            default:
                return await this.handleGeneralQuery(message, context);
        }
    }

    // =============================================
    // SPECIALIZED HANDLERS
    // =============================================

    async handleAppDevelopment(message, context) {
        const prompt = `As a professional app development AI, help user create an app: "${message}"

Provide:
1. Complete app structure
2. Recommended tech stack
3. Key features to include
4. Step-by-step development plan
5. Code snippets for critical parts

Make it practical and ready to implement.`;

        const aiResponse = await this.callAIAPI(prompt);
        return this.formatAppDevelopmentResponse(aiResponse, message);
    }

    async handleCodeGeneration(message, context) {
        const prompt = `Generate professional, production-ready code for: "${message}"

Requirements:
- Complete, runnable code
- Modern best practices
- Proper error handling
- Comments for important sections
- Responsive design if applicable

Return only the code with minimal explanations.`;

        const code = await this.callAIAPI(prompt);
        return this.formatCodeResponse(code, message);
    }

    async handleUIDesign(message, context) {
        const prompt = `As a UI/UX expert, create design recommendations for: "${message}"

Include:
1. Color scheme suggestions
2. Layout structure
3. Component recommendations
4. Responsive design tips
5. Modern design trends

Provide practical, implementable advice.`;

        const designAdvice = await this.callAIAPI(prompt);
        return this.formatDesignResponse(designAdvice, message);
    }

    async handleDatabase(message, context) {
        const prompt = `As a database architect, provide database solutions for: "${message}"

Include:
1. Database schema design
2. Table structures
3. Relationships and indexes
4. Query optimization tips
5. Security considerations

Make it scalable and efficient.`;

        const dbSolution = await this.callAIAPI(prompt);
        return this.formatDatabaseResponse(dbSolution, message);
    }

    // =============================================
    // AI API INTEGRATION
    // =============================================

    async callAIAPI(prompt, model = 'auto') {
        try {
            // Try Groq first (faster)
            let response = await this.tryGroqAPI(prompt);
            if (response) return response;

            // Fallback to Gemini
            response = await this.tryGeminiAPI(prompt);
            if (response) return response;

            // Final fallback
            return this.getIntelligentFallback(prompt);
            
        } catch (error) {
            console.error('AI API Error:', error);
            return this.getIntelligentFallback(prompt);
        }
    }

    async tryGroqAPI(prompt) {
        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKeys.groq}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: prompt }],
                    model: 'llama3-8b-8192',
                    temperature: 0.7,
                    max_tokens: 4000
                })
            });

            if (!response.ok) throw new Error('Groq API failed');
            
            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            return null;
        }
    }

    async tryGeminiAPI(prompt) {
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${this.apiKeys.gemini}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                }
            );

            if (!response.ok) throw new Error('Gemini API failed');
            
            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            return null;
        }
    }

    // =============================================
    // RESPONSE FORMATTING
    // =============================================

    formatAppDevelopmentResponse(aiResponse, originalMessage) {
        return `🚀 **App Development Plan**\n\n${aiResponse}\n\n💡 *Based on your request: "${originalMessage}"*\n\nI can generate the complete code for this app. Would you like me to proceed?`;
    }

    formatCodeResponse(code, originalMessage) {
        return `💻 **Generated Code**\n\n\`\`\`html\n${code}\n\`\`\`\n\n📝 *Generated for: "${originalMessage}"*\n\nYou can copy this code directly into your project!`;
    }

    formatDesignResponse(designAdvice, originalMessage) {
        return `🎨 **UI/Design Recommendations**\n\n${designAdvice}\n\n✨ *For your design: "${originalMessage}"*\n\nNeed specific CSS code or component designs?`;
    }

    formatDatabaseResponse(dbSolution, originalMessage) {
        return `🗄️ **Database Solution**\n\n${dbSolution}\n\n🔧 *For your database needs: "${originalMessage}"*\n\nI can generate the actual SQL schemas if needed!`;
    }

    // =============================================
    // INTELLIGENT FALLBACK SYSTEM
    // =============================================

    getIntelligentFallback(prompt) {
        if (prompt.includes('app') || prompt.includes('build')) {
            return `I'd love to help you build that app! 🚀

Here's a quick development plan:
1. **Frontend**: React.js with Tailwind CSS
2. **Backend**: Node.js with Express
3. **Database**: MongoDB for flexibility
4. **Deployment**: Vercel/Netlify

Want me to generate the complete code structure?`;
        } else if (prompt.includes('code')) {
            return `Here's a professional code template:\n\n\`\`\`javascript\n// Professional code structure\nfunction main() {\n    try {\n        // Your logic here\n        console.log("Hello World!");\n    } catch (error) {\n        console.error("Error:", error);\n    }\n}\n\nmodule.exports = { main };\n\`\`\``;
        } else {
            return `I understand you're looking for help with development! 💡

I can assist with:
• Complete app generation
• Code writing & debugging  
• UI/UX design suggestions
• Database design
• API development
• Deployment strategies

What specific help do you need right now?`;
        }
    }

    getFallbackResponse(message) {
        return `I apologize for the interruption! ⚡

I'm here to help you build amazing applications. You asked about: "${message}"

Let me assist you with:
🤖 **AI-Powered Development**
💻 **Code Generation** 
🎨 **UI/UX Design**
🗄️ **Database Solutions**
🚀 **Deployment Help**

How can I help you proceed with your project?`;
    }

    // =============================================
    // CONVERSATION MANAGEMENT
    // =============================================

    addToHistory(role, content) {
        this.conversationHistory.push({
            role,
            content,
            timestamp: new Date().toISOString()
        });

        // Keep history manageable
        if (this.conversationHistory.length > this.maxHistory) {
            this.conversationHistory = this.conversationHistory.slice(-this.maxHistory);
        }
    }

    getConversationContext() {
        return this.conversationHistory.slice(-10); // Last 10 messages for context
    }

    clearHistory() {
        this.conversationHistory = [];
    }

    // =============================================
    // ADVANCED CAPABILITIES
    // =============================================

    async generateCompleteApp(appDescription) {
        const prompt = `Create a complete, production-ready web application based on: "${appDescription}"

Requirements:
- Complete HTML, CSS, JavaScript in one file
- Modern, responsive design
- Professional code structure
- Error handling
- Comments for important sections

Return ONLY the complete code without explanations.`;

        return await this.callAIAPI(prompt);
    }

    async debugCode(codeSnippet, errorDescription) {
        const prompt = `Debug this code and fix the issue:\n\nCode:\n${codeSnippet}\n\nError/Issue: ${errorDescription}\n\nProvide the fixed code with explanation.`;

        return await this.callAIAPI(prompt);
    }

    async optimizeCode(codeSnippet) {
        const prompt = `Optimize this code for better performance and best practices:\n\n${codeSnippet}\n\nProvide the optimized version with improvements explained.`;

        return await this.callAIAPI(prompt);
    }

    async generateAPIIntegration(apiDescription) {
        const prompt = `Create complete API integration code for: "${apiDescription}"

Include:
- API client setup
- Request/response handling
- Error management
- Authentication if needed

Provide production-ready code.`;

        return await this.callAIAPI(prompt);
    }
}

// =============================================
// INITIALIZE AND EXPORT AI ENGINE
// =============================================

const buildGeniusAI = new BuildGeniusAI();

// Export for use in other files
window.BuildGeniusAI = BuildGeniusAI;
window.buildGeniusAI = buildGeniusAI;
