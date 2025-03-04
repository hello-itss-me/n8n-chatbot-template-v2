// chat-widget.js - Your Custom Chat Widget (Updated Powered-by Text Handling)

(function() {
    // --- 1. Configuration ---
    const defaultConfig = {
        webhook: {
            url: '', // Replace with your default webhook URL if needed
            route: 'general' // Default webhook route
        },
        branding: {
            logo: '', // URL to default logo, leave empty for no logo
            name: 'Chat Support', // Default company name
            welcomeText: 'Hello! How can I help you today?', // Default welcome message
            responseTimeText: 'Typically replies instantly', // Default response time text
            poweredByText: 'Powered by Your Brand' // Default "Powered by" text
        },
        style: {
            primaryColor: '#007bff', // Default primary color (Bootstrap blue)
            secondaryColor: '#6c757d', // Default secondary color (Bootstrap gray)
            position: 'right', // Default widget position: 'right' or 'left'
            backgroundColor: '#f8f9fa', // Default background color (light gray)
            fontColor: '#212529' // Default font color (dark gray)
        }
    };

    // Merge user configuration from window.ChatWidgetConfig with defaults
    const config = {
        webhook: { ...defaultConfig.webhook, ...(window.ChatWidgetConfig?.webhook || {}) },
        branding: { ...defaultConfig.branding, ...(window.ChatWidgetConfig?.branding || {}) },
        style: { ...defaultConfig.style, ...(window.ChatWidgetConfig?.style || {}) }
    };

    // --- 2. CSS Styles Injection ---
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .custom-chat-widget {
            --widget-primary-color: ${config.style.primaryColor};
            --widget-secondary-color: ${config.style.secondaryColor};
            --widget-background-color: ${config.style.backgroundColor};
            --widget-font-color: ${config.style.fontColor};
            font-family: sans-serif; /* You can customize the font-family */
        }

        .custom-chat-widget .chat-toggle-button {
            position: fixed;
            bottom: 20px;
            ${config.style.position}: 20px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background-color: var(--widget-primary-color);
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            transition: background-color 0.3s;
            z-index: 1000;
        }

        .custom-chat-widget .chat-toggle-button:hover {
            background-color: var(--widget-secondary-color);
        }

        .custom-chat-widget .chat-container {
            position: fixed;
            bottom: 90px; /* Adjust based on toggle button size */
            ${config.style.position}: 20px;
            width: 350px;
            max-height: 500px;
            background-color: var(--widget-background-color);
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
            overflow: hidden;
            display: none; /* Initially hidden */
            flex-direction: column;
            z-index: 1001;
        }

        .custom-chat-widget .chat-container.open {
            display: flex; /* Show when 'open' class is added */
        }

        .custom-chat-widget .chat-header {
            background-color: var(--widget-primary-color);
            color: white;
            padding: 12px 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .custom-chat-widget .chat-header-title {
            font-weight: bold;
            margin: 0;
            font-size: 1.1em;
        }

        .custom-chat-widget .chat-header-close-button {
            background: none;
            border: none;
            color: white;
            font-size: 1.5em;
            cursor: pointer;
            opacity: 0.8;
            transition: opacity 0.2s;
        }

        .custom-chat-widget .chat-header-close-button:hover {
            opacity: 1;
        }

        .custom-chat-widget .chat-messages {
            padding: 15px;
            overflow-y: auto;
            flex-grow: 1; /* Take up remaining space */
            display: flex;
            flex-direction: column;
        }

        .custom-chat-widget .message {
            padding: 10px 12px;
            border-radius: 8px;
            margin-bottom: 8px;
            word-wrap: break-word;
            max-width: 80%;
        }

        .custom-chat-widget .message.user {
            background-color: var(--widget-primary-color);
            color: white;
            align-self: flex-end; /* Align user messages to the right */
        }

        .custom-chat-widget .message.bot {
            background-color: #e9ecef; /* Light gray for bot messages */
            color: var(--widget-font-color);
            align-self: flex-start; /* Align bot messages to the left */
        }

        .custom-chat-widget .chat-input-area {
            padding: 10px 15px;
            border-top: 1px solid #ddd;
            display: flex;
        }

        .custom-chat-widget .chat-input-area input[type="text"] {
            flex-grow: 1;
            padding: 8px;
            border-radius: 5px;
            border: 1px solid #ccc;
            margin-right: 8px;
        }

        .custom-chat-widget .chat-input-area button {
            background-color: var(--widget-primary-color);
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s;
        }

        .custom-chat-widget .chat-input-area button:hover {
            background-color: var(--widget-secondary-color);
        }

        .custom-chat-widget .chat-footer {
            padding: 8px 15px;
            text-align: center;
            background-color: var(--widget-background-color);
            border-top: 1px solid #ddd;
            font-size: 0.8em;
            color: #777;
        }

        .custom-chat-widget .chat-footer a {
            color: var(--widget-primary-color);
            text-decoration: none;
        }
    `;
    document.head.appendChild(styleElement);


    // --- 3. Widget HTML Structure ---
    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'custom-chat-widget';

    const toggleButton = document.createElement('button');
    toggleButton.className = 'chat-toggle-button';
    toggleButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><path d="M17 11V5"></path><path d="M7 11V5"></path></svg>'; // Example chat icon

    const chatContainer = document.createElement('div');
    chatContainer.className = 'chat-container';

    const header = document.createElement('div');
    header.className = 'chat-header';
    header.innerHTML = `<h3 class="chat-header-title">${config.branding.name}</h3><button class="chat-header-close-button">×</button>`;

    const messagesArea = document.createElement('div');
    messagesArea.className = 'chat-messages';

    const inputArea = document.createElement('div');
    inputArea.className = 'chat-input-area';
    inputArea.innerHTML = `<input type="text" placeholder="Type your message..."><button>Send</button>`;

    const footer = document.createElement('div');
    footer.className = 'chat-footer';

    // --- 3.1. Dynamically create the "Powered by" link based on config ---
    const poweredByLink = document.createElement('a');
    poweredByLink.href = '#'; // You can set a default link or leave it '#'
    poweredByLink.textContent = config.branding.poweredByText; // Use config.branding.poweredByText here!
    footer.appendChild(poweredByLink);

    chatContainer.appendChild(header);
    chatContainer.appendChild(messagesArea);
    chatContainer.appendChild(inputArea);
    chatContainer.appendChild(footer);

    widgetDiv.appendChild(toggleButton);
    widgetDiv.appendChild(chatContainer);
    document.body.appendChild(widgetDiv);


    // --- 4. Event Listeners and Functions ---
    const chatInput = inputArea.querySelector('input[type="text"]');
    const sendButton = inputArea.querySelector('button');
    const closeButton = header.querySelector('.chat-header-close-button');

    toggleButton.addEventListener('click', () => {
        chatContainer.classList.toggle('open');
    });

    closeButton.addEventListener('click', () => {
        chatContainer.classList.remove('open');
    });

    sendButton.addEventListener('click', sendMessage);

    chatInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter' && !event.shiftKey) { // Send on Enter, not Shift+Enter
            event.preventDefault(); // Prevent default newline behavior in input
            sendMessage();
        }
    });


    function sendMessage() {
        const messageText = chatInput.value.trim();
        if (messageText) {
            displayMessage(messageText, 'user'); // Display user message immediately
            chatInput.value = ''; // Clear input

            // Send message to webhook
            fetch(config.webhook.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: messageText,
                    route: config.webhook.route // Include route in the payload
                    // You can add more data here if needed, like sessionId, userId, etc.
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data && data.response) { // Assuming the response from webhook is in data.response
                    displayMessage(data.response, 'bot'); // Display bot response
                } else if (data && typeof data === 'string'){ // Handle string response directly
                    displayMessage(data, 'bot');
                } else {
                    displayMessage("Sorry, I couldn't understand. Please try again.", 'bot'); // Handle error/no response
                }
            })
            .catch(error => {
                console.error('Error sending message to webhook:', error);
                displayMessage("Failed to send message. Please check your connection and try again.", 'bot'); // Display error to user
            });
        }
    }

    function displayMessage(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.textContent = message;
        messagesArea.appendChild(messageDiv);
        messagesArea.scrollTop = messagesArea.scrollHeight; // Scroll to bottom after new message
    }

    // --- 5. Initial Welcome Message (Optional) ---
    displayMessage(config.branding.welcomeText, 'bot');
    if (config.branding.responseTimeText) {
        displayMessage(config.branding.responseTimeText, 'bot'); // Display response time text as a bot message
    }


})();