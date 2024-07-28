
// Import dotenv for environment variables and OpenAI SDK
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

// Load environment variables from .env file
dotenv.config();

// Create an instance of the OpenAI API with your API key
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export default openai;