import openai from "./config/open-ai.js";
import readline from 'readline';

import fs from 'fs';
import path from 'path';
import axios from 'axios';

// Using streaming service of openAI.
async function getResponse(messages) {
    const stream = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-0125",
        messages: messages,
        stream: true,
    });

    let responseContent = '';
    for await (const chunk of stream) {
        responseContent += chunk.choices[0]?.delta?.content || "";
    }

    return responseContent;
}

async function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let messages = [];
    const __dirname = path.dirname(new URL(import.meta.url).pathname);

    const WEATHER_API_KEY = 'ef9f17451f96c58089c4928de3bba635';
    const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';


    // Function to log the convo file
    function logConversation(message) {
        const logPath = path.join(__dirname, 'conversationLog.txt');
        fs.appendFile(logPath, `${new Date().toLocaleString()}, ${message}\n`, 'utf8', err => {
            if (err) {
                console.error('Failed to log conversation:', err);
            }
        });
    }

    //Function to generate weather response
    async function getWeather(city) {
        try {
            const response = await axios.get(`${WEATHER_API_URL}?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`);
            return `The current temperature in ${city} is ${response.data.main.temp}°C, with ${response.data.weather[0].description}.`;
        } catch (error) {
            return 'Failed to retrieve weather data.';
        }
    }

    // Function to ask a question and get a response
    const askQuestion = async (question) => {

        let responses;
        if (question.toLowerCase().includes('weather')) {
            const city = question.split(' ')[2]; // Simple extraction of city name
            responses = await getWeather(city);
        } else if (question.toLowerCase().includes('news')) {
            responses = await getNews();
        } else {
            // Default response handling
            responses = 'Sorry, I can only provide weather and news updates.';
        }
        logConversation(`User: ${question}`);
        messages.push({ role: "user", content: question });
        const response = await getResponse(messages);
        messages.push({ role: "assistant", content: response });
        logConversation(`Bot: ${response}`);
        console.log(`Bot: ${response}`);
    };


    // Function to handle user input
    const handleInput = async (input) => {
        // Exit if user types "goodbye" or "exit"
        if (input.toLowerCase() === 'goodbye' || input.toLowerCase() === 'exit') {
            console.log('Goodbye!');
            rl.close();
            return;
        }

        await askQuestion(input);

        // Prompt for the next input
        rl.prompt();
    };

    console.log('You can start typing your questions...');
    rl.setPrompt('You: ');
    rl.prompt();
    rl.on('line', handleInput);
}

main();
