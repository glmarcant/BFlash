# BFlash - Flashcard App

**BFlash** è un'applicazione web progettata per aiutarti a imparare in modo efficace utilizzando flashcard. L'app consente agli utenti di creare, gestire e studiare mazzi di flashcard organizzati in set. È ideale per studenti, professionisti e chiunque voglia migliorare le proprie capacità di apprendimento.

## Funzionalità principali
- **Autenticazione sicura**: Registrazione e login con gestione dei token JWT.
- **Gestione mazzi**: Crea, modifica ed elimina mazzi di flashcard.
- **Gestione set**: Organizza le flashcard in set all'interno di un mazzo.
- **Interfaccia utente moderna**: Design responsivo con modalità chiara e scura.
- **API REST**: Backend robusto basato su Node.js ed Express.
- **Database MongoDB**: Archiviazione sicura e scalabile per utenti, mazzi, set e flashcard.

## Struttura del progetto
- **Frontend**: HTML, CSS e JavaScript per un'interfaccia utente interattiva.
- **Backend**: Node.js con Express per la gestione delle API REST.
- **Database**: MongoDB per la persistenza dei dati.

### Cartelle principali
- `client/`: Contiene i file frontend, inclusi HTML, CSS e JavaScript.
- `server/`: Contiene il backend, con modelli, middleware e route API.
- `routes/`: Definisce le API per utenti, mazzi, set e flashcard.
- `models/`: Modelli Mongoose per la gestione dei dati.

## Come iniziare
1. Clona il repository:
   ```bash
   git clone https://github.com/totovr46/BFlash.git   
   cd BFlash
   ```
2. Installa le dipendenze:
   ```bash
   npm install
   ```
3. Configura le variabili d'ambiente:  
   Crea un file `.env` nella directory principale e aggiungi:  
   ```
   MONGODB_URI=<stringadachiedereatotò>
   JWT_SECRET=<stringasegretadachiedereatotò>
   PORT=5050
   ```
4. Avvia il server:
   ```bash
   npm start
   ```
5. Apri il frontend:  
   Usa un server locale come [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) per servire i file HTML.

## Tecnologie utilizzate
- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Autenticazione**: JSON Web Tokens (JWT)
- **Stile**: Font Awesome, design responsivo
