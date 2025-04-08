# BFlash - Flashcard App


## Struttura del progetto
- **Frontend**: HTML, CSS e JavaScript.
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
   cd arancione
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


## Spiegazione File Principali

### `.env`
File che contiene variabili di ambiente sensibili come:
- Credenziali del database
- Secret key per la generazione di token JWT
- URL del database
- Altre configurazioni che non devono essere condivise pubblicamente

*Nota: Questo file non viene caricato su Git per motivi di sicurezza. Chiederlo a totò quando necessario*

### `.gitignore`
Specifica quali file e cartelle Git deve ignorare durante il controllo delle versioni, tra cui:
- `.env` (per non esporre dati sensibili)
- `node_modules` (librerie installate, che occuperebbero troppo spazio)

### `package.json`
File di configurazione del progetto Node.js che include:
- Informazioni generali sul progetto (nome, versione, descrizione)
- Elenco delle dipendenze necessarie
- Script di avvio dell'applicazione (`start`, `dev`)
- Altre configurazioni del progetto

## Cartella `client/` (Frontend)

Contiene tutti i file relativi all'interfaccia utente dell'applicazione.

### `index.html`
La pagina principale dell'applicazione che mostra:
- Lista dei mazzi dell'utente 
- Opzioni per creare nuovi mazzi
- Menu di navigazione principale per raggiungere: stats.html, friends.html, settings.html
- Sezione per accedere ai giochi

### `indexlight.html`
Versione alternativa della pagina principale con tema chiaro, offrendo:
- Le stesse funzionalità di `index.html`
- Un'interfaccia con colori più chiari per chi preferisce questo stile visivo

### `login.html`
Pagina di autenticazione degli utenti che permette:
- Accesso con credenziali (email e password)
- Registrazione di nuovi account
- Eventualmente recupero password

### `deck.html`
Pagina dedicata alla visualizzazione e gestione di un singolo mazzo, con funzioni per:
- Visualizzare i set di flashcard contenuti nel mazzo
- Aggiungere nuovi set al mazzo
- Modificare o eliminare set esistenti
- Modificare le informazioni del mazzo

### `set.html`
Pagina per la gestione di un set specifico di flashcard, che offre:
- Visualizzazione di tutte le flashcard del set
- Aggiunta di nuove flashcard
- Modifica o eliminazione di flashcard esistenti


### `style.css`
File che definisce lo stile visivo dell'intera applicazione, gestendo:
- Layout delle pagine
- Colori, font e spaziature
- Animazioni e transizioni
- Adattamento a diverse dimensioni dello schermo (responsive design)

## Cartella `server/` (Backend)

Contiene il codice che gestisce la logica dell'applicazione e le interazioni con il database.

### `app.js`
File principale che configura il server Express, tra cui:
- Importazione e configurazione dei middleware necessari
- Collegamento alle route API

### `server.js`
File che avvia effettivamente il server, occupandosi di:
- Connessione al database MongoDB
- Avvio del server sulla porta specificata
- Gestione degli eventi di avvio/spegnimento

### Sottocartella `middleware/`

#### `auth.js`
Middleware per la protezione delle API che:
- Verifica la validità dei token JWT nelle richieste
- Autorizza o blocca l'accesso alle risorse protette
- Estrae le informazioni dell'utente dal token

### Sottocartella `models/`

Contiene gli schemi del database che definiscono la struttura dei dati.

#### `User.js`
Modello per gli utenti dell'applicazione, con campi come:
- Username
- Email
- Password (criptata)
- Data di registrazione
- Riferimenti ai mazzi creati dall'utente

#### `Deck.js`
Modello per i mazzi di flashcard, che include:
- Nome/titolo del mazzo
- Soggetto o materia
- Riferimento all'utente proprietario
- Lista dei set contenuti nel mazzo
- Data di creazione e modifica

#### `Set.js`
Modello per i set di flashcard all'interno di un mazzo, con:
- Nome del set
- Descrizione
- Riferimento al mazzo a cui appartiene
- Lista delle flashcard contenute

#### `Card.js`
Modello per le singole flashcard, contenente:
- Contenuto del fronte (domanda)
- Contenuto del retro (risposta)
- Riferimenti al set e al mazzo di appartenenza

### Sottocartella `routes/`

Contiene i file che definiscono le API REST per interagire con i dati.

#### `authRoutes.js`
Gestisce le operazioni relative all'autenticazione:
- Registrazione di nuovi utenti
- Login e generazione di token JWT
- Logout
- Eventuale verifica email o recupero password

#### `userRoutes.js`
API per la gestione dei profili utente:
- Recupero dei dati dell'utente
- Aggiornamento delle informazioni del profilo
- Eliminazione dell'account
- Gestione delle preferenze

#### `deckRoutes.js`
API per la gestione dei mazzi:
- Creazione di nuovi mazzi
- Recupero della lista dei mazzi dell'utente
- Modifica delle informazioni di un mazzo
- Eliminazione di mazzi

#### `setRoutes.js`
API per la gestione dei set all'interno dei mazzi:
- Creazione di nuovi set
- Recupero dei set di un mazzo
- Modifica delle informazioni di un set
- Eliminazione di set

#### `cardRoutes.js`
API per la gestione delle flashcard:
- Creazione di nuove flashcard
- Recupero delle flashcard di un set
- Modifica del contenuto delle flashcard
- Eliminazione di flashcard
- Aggiornamento dei dati di studio
