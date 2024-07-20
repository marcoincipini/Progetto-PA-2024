# Progetto-PA-2024: Backend per un sistema di gestione del calcolo del costo dei parcheggi
<a><img Progetto-PA-2024="images/logo-univpm.png" height='60' align="right"/></a>

## Specifica e obiettivi del progetto
Si realizzi un sistema che consenta di gestire il calcolo del costo dei parcheggi a seguito del passaggio di autoveicoli con classi differenti tra un varco di ingresso e di uscita. Un parcheggio può avere diversi punti di ingresso e diversi punti di uscita. Dovranno essere modellati le tipologie di veicolo che hanno poi costi differenti. Dovranno essere inseribili i transiti impostando data e ora del passaggio e targa del veicolo lungo un varco specifico di un dato parcheggio; la richiesta di inserimento deve essere rifiutata se non ci sono più posti disponibili all’interno del parcheggio. Un veicolo in un giorno può parcheggiare in diversi parcheggi. Il sistema deve anche provvedere a calcolare il costo del parcheggio in funzione della permanenza effettiva all’interno dello stesso.

La specifica completa è consultabile nel seguente [documento](Programmazione avanzata richieste.pdf)

## Strumenti utilizzati per lo sviluppo

- [Node.JS](https://nodejs.org)
- [Express](https://expressjs.com)
- [Sequelize](https://sequelize.org) 
- [PostgreSQL](https://www.postgresql.org/)
- [Docker](https://www.docker.com/)
- [Docker-compose](https://docs.docker.com/compose/)
- [Postman](https://www.postman.com)
- [JWT](https://jwt.io)

## Installazione

### Requisiti 

Per installare l'applicazione è necessario avere installato l'ultima versione di Docker-compose, seguendo le istruzioni in base al tipo di architettura su cui gira la propria macchina. Inoltre è necessario avere installato Git, in modo tale da riuscire a clonare correttamente il codice.  

Per il testing dell'applicazione viene utilizzato il client API Postman.
### Avvio del progetto

1. Clonare la repository con il comando:
    ```
    git clone https://github.com/marcoincipini/Progetto-PA-2024.git
    ```

2.  Avviare il docker-compose costituito dal container dell'applicazione e dal container Postgres. Questo comando permette di buildare il codice e di far partire automaticamente il server
    ```
    docker-compose up --build 
    ```

3. Aprire postman e caricare la seguente collection

4.  (Se necessario) Dato che il codice va a creare un database Postgres tramite un file di seeding, se fosse necessario eliminare tutti i cambiamenti fatti al database sarebbe necessario buttare giù i container e riavviare l'applicazione con il comando indicato sopra.
    ```
    docker-compose down
    ```

## Configurazione

### File docker-compose
Per configurare correttamente i container da utilizzare, si usa il file ```docker-compose.yaml``` cosi composto:
```
version: '3.8'

services:
  app:
    build: 
      context: app/
      dockerfile: Dockerfile
    depends_on:
      - postgres
    env_file:
      - ./app/.env     
    ports:
      - "3000:3000"
    volumes:
      - .:/app:/usr/app
  postgres:
    image: postgres
    container_name: postgres
    env_file:
      - ./app/.env  
    environment:
      - POSTGRES_DB=Parkings
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=admin  
    ports:
      - "5432:5432"
    volumes:
      - ./database_seeding.sql:/docker-entrypoint-initdb.d/database_seeding.sql
```
In questo file possono essere modificate diverse parti per avere configurazioni differenti.

#### Servizio 'app'

- build: Si può cambiare il percorso del contesto di build (context) e il nome del file Dockerfile (dockerfile) se il Dockerfile si trova in una posizione diversa.
- depends_on: Se vengono aggiunti nuovi servizi che dipendono dall'applicazione, bisogna includerli in questa sezione.
- env_file: Si può modificare il percorso del file delle variabili d'ambiente se è situato in una directory diversa.
- ports: Si può cambiare il mapping delle porte per esporre il servizio su porte diverse, in caso le porte indicate siano già occupate.
- volumes: Si possono cambiare i volumi montati se c'è la necessità di specificare percorsi diversi per i file dell'applicazione.

#### Servizio 'postgres'

- image: Si può specificare una versione diversa di PostgreSQL.
- container_name: Si può cambiare il nome del container se si desidera un nome diverso.
- env_file: Si può modificare il percorso del file delle variabili d'ambiente se necessario.
- environment: Si possono cambiare le variabili d'ambiente come il nome del database (POSTGRES_DB), l'utente (POSTGRES_USER) e la password (POSTGRES_PASSWORD).
- ports: Si può cambiare il mapping delle porte per esporre il servizio PostgreSQL su porte diverse.
- volumes: Si può modificare il volume montato per il file di seeding del database se il file si trova in una posizione diversa o se si desidera utilizzare un file diverso.

### File database_seeding.sql
Nel file ```database_seeding.sql``` viene specificata la struttura del database da creare al primo avvio del container. Vengono anche precaricati dei dati per consentire un utilizzo di prova dell'applicazione, quindi in caso di configurazione possono essere modificati direttamente in questo file. 

### File tsconfig.json
Nel file ```tsconfig.json``` vengono specificate delle opzioni da passare al compilatore Typescript. Se si vogliono selezionare 

## Diagrammi UML

### Casi d'uso

### Diagrammi di sequenza

### Diagramma ER


## Utilizzo

Tramite le rotte ```/login``` e ```/passageLogin```, accessibili da qualsiasi utente, viene effettuata la creazione di un token JWT, che vanno a costruire il body del token in base all'utente che deve fare un'operazione. Successivamente il token viene passato ad un middleware di autenticazione, ```auth.ts``` che si occupa di fare la verifica del token per la sua validità. Queste rotte, in base al modello da utilizzare, devono prendere in input dati differenti. 
- Nel caso del login come utente normale, ovvero automobilista o operatore, l'input consiste in un json contenente l'email e la password dell'utente:

```
{
  "email": "marco.rossi@example.com",
  "password": "password123"
}
```
- Nel caso del login come utente automatizzato, ovvero il varco, l'input consiste in un json contenente il nome del varco con cui si vuole accedere:

```
{
  "name": "Via Roma"
}
```

Le rotte per le operazioni CRUD (Create, Read, Update e Delete) dei vari modelli presenti sono accessibili solamente dall'operatore, con l'eccezione della rotta di creazione dei transiti, ```/api/transits```, che è invece accessibile anche da un utente di tipo varco. L'input da fornire a queste rotte cambia in base al modello con cui si desidera interagire. Ad esempio, gli input da fornire se si volesse interagire con un modello di tipo User sarebbero:
- Create, un json dove vengono specificati i dati da inserire 
```
{
    "name": "Mario",
    "surname": "Rossi",
    "email": "mario.rossi@esempio.com",
    "password": "passwor123",
    "role": "operatore"
}
```
- Read, aggiunta dell'id con cui si desidera interagire alla fine della rotta
```
http://localhost:3000/api/users/1
```
- Update, un json dove vengono specificati i dati da inserire 
```
{
    "name": "Marioooo",
    "email": "mario.rossi@esempio.com",
    "password": "passwor1234",
    "role": "automobilista"
}
```
- Delete, aggiunta dell'id con cui si desidera interagire alla fine della rotta
```
http://localhost:3000/api/users/2
```

La rotta ```/api/transitReport``` non presenta un controllo sull'autorizzazione come operatore, in quanto può essere eseguita sia da un utente operatore che da un utente automobilista. Se la rotta viene eseguita dall'operatore, il risultato ottenuto consisterà nello stato dei transiti di tutti i veicoli indicati, mentre se viene eseguita dall'automobilista il risultato ottenuto consisterà nello stato dei transiti dei veicoli associati solamente all'utente che ha fatto la richiesta.

Le rotte, ```/api/generalParkStats/parkAverageVacancies``` e ```/api/generalParkStats/parkRevenues``` permettono di ottenere, rispettivamente, il numero medio di posti liberi per parcheggio facendo una distinzione per fascia oraria e il fatturato totale di ciascun parcheggio. 

Le rotte, ```/api/singleParkStats/nTransits/:id``` e ```/api/singleParkStats/parkRevenues/:id``` permettono di ottenere, rispettivamente, il numero totale di transiti distinti per tipologia di veicolo e per fascia oraria di un parcheggio singolo e il fatturato totale del parcheggio preso in considerazione. 




### Rotte

Ogni rotta utilizzata in questa applicazione viene autenticata tramite autenticazione JWT, dove il token viene fornito dalle rotte ```/login``` e ```/passageLogin```. Ogni rotta presenta inoltre dei middleware personalizzati, utilizzati per il controllo sulla validità dei dati passati alla richiesta ( contenuti nel file ```validateData.ts```) e per un controllo sull'autorizzazione dell'utente (contenuti nel file ```auth.ts```). 

| Rotta  | Metodo | Descrizione                                                             | Utente autorizzato 
| -------| ------ | ------------------------------------------------------------------------| ------------------ 
| /login | POST   | Accesso con email e password per ottenere il token di autenticazione JWT| Operatore, Automobilista  
| /passageLogin | POST   | Accesso con nome del varco per ottenere il token di autenticazione JWT | Varco 
| /api/users | POST   | Creazione di un modello User tramite i dati in input               | Operatore   
| /api/users/:id | GET   | Accesso ai dati del modello User con l'id selezionato | Operatore  
| /api/users/:id | PUT   | Aggiornamento dei dati del modello User con l'id selezionato | Operatore 
| /api/users/:id | DELETE   | Cancellazione dei dati del modello User con l'id selezionato              | Operatore   
| /api/parkings | POST   | Creazione di un modello Parking tramite i dati in input              | Operatore  
| /api/parkings/:id | GET   | Accesso ai dati del modello Parking con l'id selezionato              | Operatore  
| /api/parkings/:id | PUT   | Aggiornamento dei dati del modello Parking con l'id selezionato              | Operatore  
| /api/parkings/:id | DELETE   | Cancellazione dei dati del modello Parking con l'id selezionato              | Operatore 
| /api/passages | POST   | Creazione di un modello Passage tramite i dati in input              | Operatore  
| /api/passages/:id | GET   | Accesso ai dati del modello Passage con l'id selezionato              | Operatore   
| /api/passages/:id | PUT   | Aggiornamento dei dati del modello Passage con l'id selezionato              | Operatore   
| /api/passages/:id | DELETE   | Cancellazione dei dati del modello Passage con l'id selezionato              | Operatore  
| /api/fees | POST   | Creazione di un modello Fee tramite i dati in input              | Operatore   
| /api/fees/:id | GET   | Accesso ai dati del modello Fee con l'id selezionato              | Operatore   
| /api/fees/:id | PUT   | Aggiornamento dei dati del modello Fee con l'id selezionato              | Operatore  
| /api/fees/:id | DELETE   | Cancellazione dei dati del modello Fee con l'id selezionato             | Operatore, Varco   
| /api/transits              | POST   | Creazione di un modello Transit tramite i dati in input                   | Operatore  
| /api/transits/:id       | GET    | Accesso ai dati del modello Transit con l'id selezionato                                         | Operatore   
| /api/transits/:id     | PUT    | Aggiornamento dei dati del modello Transit con l'id selezionato                               | Operatore   
| /api/transits/:id   | DELETE    | Cancellazione dei dati del modello Transit con l'id selezionato                                | Operatore      
| /api/transitReport           | GET    | Recupero stato dettagliato dei transiti in base al periodo temporale | Operatore, Automobilista      
| /api/generalParkStats/parkAverageVacancies | GET | Recupero numero medio di posti liberi per parcheggio distinguendo per fascia oraria | Operatore
| /api/generalParkStats/parkRevenues | GET    | Recupero fatturato totale di ciascun parcheggio                | Operatore      
|/api/singleParkStats/nTransits/:id |GET|Recupero numero totale di transiti distinti per tipologia di veicolo e per fascia oraria in un parcheggio con l'id selezionato|Operatore
| /api/singleParkStats/parkRevenues/:id | GET    | Recupero fatturato totale di un parcheggio con l'id selezionato | Operatore 

## Pattern utilizzati

## ✍️ Autori
#### [Simone Giano](mailto:s1116146@studenti.univpm.it) (Matricola 1116146) 
#### [Marco Incipini](mailto:s1115924@studenti.univpm.it) (Matricola 1115924)

## 🔒 License
MIT License

Copyright © 2024 Simone Giano & Marco Incipini