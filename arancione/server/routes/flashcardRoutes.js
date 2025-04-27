require('dotenv').config(); // Importa dotenv

const express = require('express');
const router = express.Router();
const axios = require('axios');

const GROQ_API_KEY = process.env.GROQ_API_KEY; // Legge la chiave API dal .env
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Endpoint corretto per generare flashcards
router.post('/generate', async (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }

    try {
        const payload = {
            model: 'gemma2-9b-it',
            messages: [
                {
                    role: 'user',
                    content: `Leggi il seguente testo e generami esattamente 15 flashcard in formato JSON puro:

                    ${text.substring(0, 5000)} // Limita la lunghezza del testo

                    RISPOSTA OBBLIGATORIA IN QUESTO FORMATO, SENZA ALCUN TESTO AGGIUNTIVO:

                    [
                    {"question": "testo domanda 1", "answer": "testo risposta 1"},
                    {"question": "testo domanda 2", "answer": "testo risposta 2"}
                    ]

                    REGOLE:
                    1. MAX 10 flashcard
                    2. Solo JSON valido
                    3. Nessun testo prima o dopo
                    4. Risposte brevi (max 20 parole)`}
            ],
            max_completion_tokens: 3000,
            temperature: 0.7
        };

        const response = await axios.post(GROQ_API_URL, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            }
        });

        res.json({
            rawResponse: response.data.choices[0].message.content
        });
    } catch (error) {
        console.error('Errore nella richiesta a Groq:', error.response?.data || error.message);
        res.status(500).json({
            error: 'Errore nella generazione delle flashcard',
            details: error.response?.data || error.message
        });
    }
});

module.exports = router;