const express = require('express');
const router = express.Router();
const axios = require('axios');

// Endpoint per generare flashcard
router.post('/generate', async (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Il testo è richiesto per generare flashcard.' });
    }

    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'google/gemini-2.0-flash-exp:free',
            messages: [
                {
                    role: 'user',
                    content: `Genera flashcard basate sul seguente testo:\n\n${text}\n\nIl formato deve essere un array JSON con oggetti contenenti "question" e "answer".`
                }
            ],
            max_tokens: 500,
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        // Invia il contenuto grezzo della risposta al client
        res.json({ rawResponse: response.data.choices[0].message.content });
    } catch (error) {
        console.error('Errore nella generazione delle flashcard:', error.message);
        res.status(500).json({ error: 'Errore nella generazione delle flashcard.' });
    }
});

module.exports = router;