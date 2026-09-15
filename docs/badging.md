# Presenze tramite QR

## Contratto della prima versione

- Ogni sede ha un QR casuale, stampabile anche in più copie. Creazione, modifica,
  rigenerazione e archiviazione sono riservate ad admin e super_admin. Gli editor
  del CMS e gli account dei dipendenti non accedono ai dati delle presenze.
- L'indirizzo pubblico è /badge/:token; la dashboard è /dashboard/badging.
  La pagina del dipendente carica separatamente dal sito e dal CMS.
- Registrazione con nome, cognome, data di nascita, mansione, cellulare e password.
  Account inizialmente in attesa: il responsabile verifica la persona e lo attiva.
  Il numero di telefono identifica l'account; non viene inviato un SMS di verifica.
- Accesso ricordato per 30 giorni. Password temporanea generata dal responsabile
  in caso di smarrimento, da sostituire prima di timbrare. Sospensione e reset
  revocano le sessioni precedenti.
- Ingresso e uscita acquisiscono posizione e precisione soltanto su pressione
  del pulsante. Senza posizione valida non si registra una presenza. Data e ora
  vengono dal database; l'orologio del cellulare non determina la timbratura.
- Raggio predefinito 200 m, errore GPS massimo 100 m; entrambi configurabili.
  Fuori zona si blocca per impostazione iniziale; ogni sede può invece accettare
  con segnalazione. Una posizione troppo imprecisa viene sempre respinta.
- Un solo ingresso aperto per dipendente. L'uscita può avvenire in un'altra sede,
  con posizione valida per quella sede e anomalia esplicita. Un ingresso dimenticato
  può essere chiuso dal responsabile con motivazione obbligatoria: rimane annotato
  sulla riga originale e non genera un'uscita, una posizione o ore inventate.
- Le ricevute sono append-only per il backend. I tentativi con coordinate valide
  ma respinti restano separati dalle presenze accettate. Richieste prive di posizione
  o autenticazione valida non diventano eventi di presenza.
- Rigenerare il QR invalida i fogli precedenti; modificare i dati della sede mantiene
  il collegamento. Eliminare il QR archivia la sede e conserva lo storico. Gli
  ingressi aperti devono essere risolti prima dell'archiviazione.

## Ricerca indirizzi e mappa delle sedi

In **Presenze → Sedi e QR → Nuova sede / Modifica**, inserire via, civico e
comune, premere **Cerca indirizzo** e scegliere il risultato corretto.
Indirizzo, latitudine e longitudine vengono compilati insieme. Toccare la mappa
o trascinare il segnaposto permette di indicare l'ingresso effettivo; il cerchio
mostra il raggio consentito. Restano disponibili **Usa la mia posizione** e le
coordinate manuali. Modificare il testo dell'indirizzo cancella le vecchie
coordinate: serve confermare un nuovo punto prima del salvataggio.

La mappa usa Leaflet 1.9.4 e tile OpenStreetMap; la ricerca usa Photon, senza
chiavi Google. La ricerca parte solo su comando, con massimo cinque risultati:
non sceglie automaticamente il primo. Le risposte di ricerche precedenti o
di moduli chiusi vengono ignorate. La timbratura del dipendente continua a
richiedere il GPS: la mappa serve alla configurazione amministrativa della sede.

- `GET /api/badging/admin/geocode?q=...`: riservato ad amministratori attivi,
  query di 4–250 caratteri, timeout del provider 8 secondi, errori recuperabili.
- Limiti persistenti nel database: 30 richieste/minuto per amministratore e una
  richiesta/secondo al provider per applicazione, anche su più istanze Vercel.
- Cache per istanza calda, massimo 100 indirizzi: 24 ore per risultati trovati,
  10 minuti per risultati vuoti; ricerche identiche simultanee condividono la
  richiesta. La cache non è condivisa né durevole. Errori e timeout non sono
  memorizzati. Le risposte API al browser hanno `Cache-Control: no-store`.
- Provider sostituibile tramite `BADGING_GEOCODER_URL` nel backend, un endpoint
  HTTPS compatibile con Photon. Non servono nuove tabelle o migrazioni.
- Tile richiesti direttamente dal browser, attribuzione sempre visibile,
  cache HTTP ordinaria e referrer limitato all'origine. Nessun download offline
  o precaricamento massivo. Nei test automatici le tile sono sostituite da fixture.

Photon e le tile pubbliche sono servizi senza disponibilità garantita: se la
ricerca è indisponibile, usare mappa/GPS/coordinate; se mancano le tile, restano
ricerca/GPS/coordinate. Per volumi elevati occorre un provider dedicato.
[Condizioni Photon](https://github.com/komoot/photon#demo-server),
[policy tile OpenStreetMap](https://operations.osmfoundation.org/policies/tiles/),
[documentazione Leaflet](https://leafletjs.com/reference.html).

## Report

Filtri per intervallo, sede (anche archiviata), dipendente, esito e anomalie.
Pagine da 50 righe, riepiloghi calcolati su tutti i risultati, elenco degli ingressi
attualmente aperti. Sono visibili dati anagrafici, mansione, sede, ingresso/uscita,
coordinate, collegamento alla mappa, precisione, distanza, identificativo del browser,
anomalie e motivazioni delle chiusure amministrative.

Date interpretate nel fuso Europe/Rome, inclusi i cambi d'ora legale; UTC conservato
nel database e nel CSV. Periodo massimo 93 giorni. Il CSV esporta tutti i risultati,
fino a 20.000 righe: oltre questa soglia chiede di ridurre i filtri. Le celle vengono
quotate e protette dall'esecuzione di formule nei fogli di calcolo.

Le ore rappresentano gli intervalli chiusi da vere uscite e sono attribuite alla
data e alla sede di uscita. Comprendono gli intervalli anomali da verificare.
Non vengono spezzate automaticamente per giorno, né elaborate come buste paga.
Gli ingressi aperti sono uno stato corrente, indipendente dal periodo selezionato.

## Controlli e limiti

| Caso | Controllo incluso | Limite / eventuale passo successivo |
| --- | --- | --- |
| Foto del QR usata da casa | Posizione obbligatoria, raggio verificato nel database | Il browser non può attestare che le coordinate siano autentiche; un utente esperto può simularle. |
| Stesso browser per più persone | Identificativo casuale firmato dal server, conservato dopo il logout; associazioni e alert retroattivi per entrambi gli account | Non è IMEI né identificazione certa dell'hardware. |
| Altro browser o dati cancellati | Segnalazione quando il browser differisce dal primo utilizzato | Prima timbratura e identità browser separate non provano chi impugna il telefono. Si può aggiungere approvazione dei nuovi browser. |
| Doppio tocco o risposta persa | Richiesta identificata una sola volta, ricevuta recuperabile, transazione e blocco della riga dipendente | Nessuna conferma offline; occorre ritrovare connessione e posizione. |
| Account inventato o credenziali condivise | Attivazione manuale, password con hash bcrypt, segnalazioni browser | La verifica iniziale del responsabile resta necessaria. |
| QR vecchio o alterato | Token casuale, rigenerazione e revoca immediata | Il QR identifica una sede, non è una prova di presenza. |
| Spostamento improbabile | Segnalazione oltre 5 km a velocità media superiore a 180 km/h | È un indizio da verificare, non una decisione disciplinare automatica. |
| Uscita dimenticata | Ingresso aperto oltre 16 ore segnalato; chiusura motivata del responsabile | Le rettifiche degli orari lavorati richiedono un processo ulteriore. |

Se i controlli risultassero insufficienti, valutare un codice giornaliero esposto
in sede oppure un terminale gestito dal capocantiere. Un'app con verifica del
dispositivo aumenta complessità, costi e assistenza; non serve per questa prima
versione. Nessuno di questi strumenti elimina da solo la collaborazione tra persone.

La registrazione della posizione richiede HTTPS e autorizzazione esplicita del
browser. Viene richiesta una lettura nuova, senza posizione in cache; una richiesta
di timbratura autorizzata dal server scade dopo due minuti.
[API Geolocation di Mozilla](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition).
Gli identificativi permanenti dell'hardware non fanno parte delle normali API
web usate qui; il fingerprinting non è una prova affidabile dell'identità.
[W3C: identificazione del browser e limiti](https://www.w3.org/TR/fingerprinting-guidance/).

## Componenti e attivazione

- [Schema e funzioni](../database/badging.sql): tabelle private con RLS, funzioni
  riservate al service_role, ricevute immutabili per l'app, audit e limiti persistenti.
- [Router API](../server/badging/router.js): autenticazione dipendenti separata dal
  CMS, validazione, limiti per account/IP, amministrazione e report.
- [Frontend](../client/src/features/badging): pagina mobile, sedi/stampa, dipendenti
  e report. QR generati localmente con qrcode, senza servizi esterni.
- [Gate](../.agent-gates): sintassi server, TypeScript, lint delle schermate nuove,
  test API/database/client e build frontend.

Per preparare ulteriori ambienti, dopo autorizzazione alla pubblicazione:

1. Applicare lo schema in un progetto Supabase di preview e verificare le funzioni
   tramite PostgREST. È richiesto PostgreSQL 15 o successivo per la vista con
   security_invoker. La migrazione è transazionale e riapplicabile nella stessa
   versione; non contiene dati dimostrativi.
2. Configurare nel backend SUPABASE_SERVICE_ROLE_KEY e JWT_SECRET (oppure il
   SUPABASE_JWT_SECRET già previsto), almeno 32 caratteri. La chiave service_role
   non deve essere esposta al frontend. Servono anche le configurazioni Supabase
   già usate dal server.
3. Impostare REACT_APP_API_BASE_URL o REACT_APP_API_URL con il percorso API
   corretto, incluso /api, soprattutto per isolare una preview dalla produzione.
   Le nuove riscritture Vercel supportano l'apertura diretta dei QR.
4. Configurare la prima sede sul posto e provare raggio/precisione con Android
   e iPhone, anche all'interno. Preparare l'informativa e decidere accessi e tempi
   di conservazione con chi gestisce i dati dei dipendenti; non è configurata una
   cancellazione automatica dello storico.
5. Verificare una registrazione, attivazione, ingresso, uscita, reset password,
   browser condiviso e CSV in preview; quindi pubblicare quando autorizzato.

Una rotazione del segreto JWT invalida sessioni e firme degli identificativi del
browser: al login successivo viene richiesto un identificativo nuovo, con possibili
segnalazioni di cambio browser. Non cambiare il segreto per la normale rotazione dei QR.
Senza configurazione o migrazione il modulo risponde 503, senza accesso anonimo
alle tabelle delle presenze.

## Verifica locale riproducibile

Installazione delle dipendenze del progetto:

    npm ci --prefix client --legacy-peer-deps
    npm install --prefix server --ignore-scripts

Gate:

    /home/valua/Work/bin/agent-gate fast
    /home/valua/Work/bin/agent-gate full

Anteprima con database PostgreSQL isolato in memoria:

    REACT_APP_API_BASE_URL=/api npm run build --prefix client
    npm run preview:badging --prefix server

Il processo stampa URL e credenziali esclusivamente dimostrative; ascolta solo su
127.0.0.1:4100. I dati scompaiono alla chiusura. La sede dimostrativa è a latitudine
40, longitudine 14: impostare questa posizione nella simulazione del browser per
il test positivo, poi una posizione distante per il negativo.
Mappe e ricerca indirizzi usano i servizi pubblici anche nell'anteprima;
intercettare le tile nei test automatici, senza generare traffico di scansione.

Il banco prova usa PGlite per eseguire il vero schema PostgreSQL. Un piccolo
adattatore riproduce le operazioni Supabase, compreso il formato array delle RPC
che restituiscono righe. Non sostituisce la prova contro PostgREST reale:
[formato delle risposte PostgREST](https://docs.postgrest.org/en/stable/references/api/resource_representation.html).
PGlite ha una sola connessione; i blocchi per concorrenza devono essere confermati
anche con più connessioni PostgreSQL nell'ambiente di preview.

## Esiti al 2026-09-15

Gate fast e full superati: 27 test server (API, PostgreSQL, sicurezza e validazione)
e 7 test frontend; TypeScript e lint del modulo senza errori. Build frontend
riuscita con warning preesistenti del sito. Prove eseguite:

- Test di schema/RLS, geofence, sequenze, idempotenza, revoca QR, profili pending,
  reset password, ruoli, report completi oltre 1.000 righe e correzioni motivate.
- Frontend: accesso da QR, campi di registrazione, posizione negata, ricevute
  respinte, recupero della risposta persa con lo stesso identificativo.
- Browser Chromium a 390 px: ingresso/uscita, blocco fuori zona, registrazione,
  attivazione e riconoscimento di due account sullo stesso browser.
- QR decodificato con zbarimg; PDF verificato come singola pagina A4; CSV scaricato
  dalla dashboard e verificato contro le timbrature dell'anteprima.

Il runner automatico di mutation testing non è configurato: agent-gate mutation
restituisce un gap esplicito. Due probe manuali eseguiti e rilevati dai test:
controllo della precisione GPS rimosso e lettura dell'amministrazione consentita
agli editor. I test database e router sono falliti per asserzione; le modifiche
sono state ripristinate prima del gate full finale.
Per introdurre il runner completo: /gate-setup mutation.

Il lint senza warning riguarda il nuovo modulo e le route React. Il sito preesistente
contiene warning lint e dati Browserslist da aggiornare. Nessuna migrazione remota,
pubblicazione, verifica GPS fisica, prova iOS o test multi-connessione è implicita
nei risultati locali.

### Verifica della ricerca su mappa — 2026-09-15

Gate fast e full superati; il totale è ora 34 test server e 12 frontend.
TypeScript, lint del modulo e build superati, con i warning preesistenti del sito.
Coperti ordine latitudine/longitudine, risposte malformate, cache/scadenza,
ricerche simultanee, timeout, autenticazione admin e limiti persistenti.
Nel frontend: ricerca esplicita/Enter, scelta risultato, risposte obsolete,
nuovo modulo durante una ricerca, errori, coordinate zero, GPS e modifica sede.

Due ulteriori mutation probe manuali rilevati dai test: inversione delle
coordinate GeoJSON e accettazione di una risposta di ricerca obsoleta. Codice
ripristinato e test mirati nuovamente superati. Runner automatico ancora assente.

Browser Chromium: ricerca Photon reale via API locale, selezione, trascinamento
segnaposto, persistenza del punto e del raggio, riapertura della sede, tocco sulla
mappa a 390 px senza overflow. Simulati errore del provider e tile indisponibili:
il GPS rimane utilizzabile. Coordinate ai limiti e 0,0 non bloccano la mappa.
Nessun errore JavaScript. Le tile erano fixture locali per evitare traffico
automatico sul servizio pubblico; il GPS era simulato, non un collaudo sul posto.

## Produzione — prima versione del 2026-09-15

Pubblicazione completata su richiesta dell'utente. La gestione è disponibile su
[www.korsvagen.it/dashboard/badging](https://www.korsvagen.it/dashboard/badging),
con il normale account amministrativo del CMS. I QR generati dalla dashboard
puntano a `https://www.korsvagen.it/badge/:token`.

| Componente | Versione pubblicata |
| --- | --- |
| Supabase | Progetto `xmkbguocqvhhydinlrwg`, PostgreSQL 17.4; migrazione `20260915081623_badging_employee_attendance` |
| Backend Vercel | `dpl_FogSUGw6JhJT3fX7z78jwsXdPjFi`, READY; alias `korsvagen-web-be.vercel.app`; sorgenti `11e70c3` |
| Frontend Vercel | `dpl_4aoCs5Wevr4UYcjvU8bW7QeArXQf`, READY; dominio `www.korsvagen.it`; sorgenti `df49135` |

Lo schema è stato provato prima in una transazione conclusa con ROLLBACK, poi
applicato tramite l'API delle migrazioni Supabase. Verificati i corpi delle sette
funzioni contro il file locale, RLS sulle sei tabelle e privilegi di accesso.
La nuova cronologia delle migrazioni registra il badging: non ricostruisce la
storia precedente del database.

Il deploy carica i file dei commit locali nei due progetti Vercel esistenti,
con directory radice rispettivamente `server` e `client`. Questi commit sono
ancora da sincronizzare con GitHub. Le variabili già presenti includono il
corretto URL API e i segreti del backend; non è stata necessaria una rotazione.

La prima build cloud del frontend ha incontrato i warning preesistenti del sito,
trattati come errori da Create React App con `CI=true`. Il file
[client/vercel.json](../client/vercel.json) imposta `CI=false npm run build`,
come nella build locale validata: i warning rimangono visibili. I gate espliciti
TypeScript, test e lint del modulo conservano i propri criteri bloccanti.
Build locale con URL API di produzione e build Vercel completate.

### Verifiche dopo la pubblicazione

Dodici gruppi di prove sulle API pubblicate, con database e PostgREST reali:
registrazione, account pending, attivazione, login, separazione dei ruoli,
timbrature con coordinate obbligatorie, geofence, precisione GPS, report/CSV,
browser condiviso, chiusura amministrativa, reset password e revoca dei QR.

Le richieste HTTP simultanee hanno confermato sia una sola ricevuta per retry
con lo stesso UUID sia un solo ingresso accettato fra due richieste distinte.
Il report della prova conteneva otto eventi: tre ingressi, due uscite e tre
tentativi respinti. La chiusura amministrativa non ha aggiunto un'uscita.

Dal browser sul dominio pubblico: creazione sede, schede dipendenti e report,
QR decodificato verso il dominio corretto, PDF su una pagina A4, login mobile
a 390 px senza scorrimento orizzontale e redirect al login della dashboard
anonima. Nessun errore JavaScript di esecuzione osservato nelle nuove schermate.
Health del backend e CORS dal dominio pubblico verificati.

Le fixture erano fittizie e sono state rimosse per identificatori univoci.
A fine collaudo: zero sedi, dipendenti, eventi, associazioni browser e audit di
prova; i due amministratori operativi preesistenti sono rimasti attivi.

### Primo utilizzo e punti aperti

Aprire **Presenze → Sedi e QR → Nuova sede** sul posto, impostare la posizione
effettiva e verificare raggio e precisione con i telefoni dei dipendenti prima
di distribuire il QR. L'attivazione degli account rimane manuale.

Restano le prove con GPS fisico su Android/iPhone, la definizione di informativa
e conservazione dei dati e l'eventuale introduzione del mutation runner automatico.
Il collaudo remoto ha verificato coordinate fornite alle API, non il GPS fisico.

Riferimenti per un eventuale ripristino applicativo: frontend precedente
`dpl_CeMuAkhzhcM41EKjz2ZymaZVZz7g`, backend precedente
`dpl_9KuApcvWVuiij25wJ6GFkiMwe8M6`. Il ripristino dei deployment non richiede
di cancellare lo schema o lo storico delle presenze. Il rollback non è stato
eseguito durante questo collaudo.

## Produzione — aggiornamento mappe del 2026-09-15

Aggiornamento pubblicato e verificato sul dominio pubblico, con sorgenti locali
`c154187`. Nessuna migrazione o variazione dei segreti è stata necessaria.

| Componente | Deployment |
| --- | --- |
| Backend | `dpl_4Sc9SizWFyLZXu9oZ9c4Fi2yAbZ1`, READY su `korsvagen-web-be.vercel.app` |
| Frontend | `dpl_DUmnxChTZtasde2tU5CnpuqqW3uD`, READY su `www.korsvagen.it` |

Verificati dal browser pubblicato: accesso admin e rifiuto di query non valide,
ricerca Photon reale, selezione con coordinate automatiche, trascinamento del
segnaposto, creazione della sede e del raggio nel database reale, ricaricamento,
modifica con tocco sulla mappa a 390 px e persistenza delle nuove coordinate.
Nessun errore JavaScript o overflow orizzontale. Tile sostituite da fixture nei
test automatici. Amministratore, sede e audit temporanei rimossi con filtri univoci.

Per annullare il solo aggiornamento mappe, i deployment precedenti funzionanti
sono backend `dpl_FogSUGw6JhJT3fX7z78jwsXdPjFi` e frontend
`dpl_4aoCs5Wevr4UYcjvU8bW7QeArXQf`. I commit rimangono locali, ancora da
sincronizzare con GitHub. Non è stato eseguito un rollback.

## Vista dipendenti responsive — aggiornamento del 2026-09-15

La tabella ereditava una larghezza minima di 850 px: nelle finestre strette le
colonne a destra erano raggiungibili solo scorrendo un contenitore senza una
barra sempre visibile. La prima verifica con intestazione breve non aveva
evidenziato il secondo problema della griglia, descritto sotto.

Con al massimo 900 px disponibili, ogni riga ora diventa una scheda con tutti
i dati etichettati e le azioni visibili. La container query considera anche lo
spazio occupato dalla sidebar. Sopra la soglia resta la tabella; i testi lunghi
possono andare a capo. Ruoli e intestazioni della tabella restano accessibili.

QA riproducibile nell'anteprima locale: aprire Presenze → Dipendenti, provare
viewport da 320 a 1920 px con sidebar aperta e chiusa, compresa la soglia tra
1198 e 1199 px con sidebar aperta. Verificare che celle e pulsanti restino nella
larghezza disponibile, anche con nomi/mansioni senza spazi, browser condivisi,
account attivi/in attesa/sospesi e ingresso aperto. Provare ricerca senza
risultati, sospensione/attivazione e focus sui pulsanti da tastiera.

Verificato in Chromium anche sulla build ottimizzata: nessun overflow in 20
combinazioni di larghezza e sidebar con tre dipendenti fittizi. Un probe CSS
temporaneo (`container-type: normal`) ha riprodotto il taglio a 390 px; dopo il
ripristino tutti i campi sono tornati entro la viewport. `agent-gate full`
superato: 34 test server, 12 client, TypeScript, lint del modulo e build
(warning preesistenti del sito). Il mutation runner automatico resta assente.

Pubblicata su richiesta dell'utente il 2026-09-15: frontend
`dpl_Cnu5KP2mFQZ1fjF8uyM9F51yJm1Y`, stato `READY`, sorgenti `29a7500`,
alias assegnati `www.korsvagen.it` e `korsvagen.it`. CSS responsive presente
negli asset pubblici; il dominio apice redirige a `www`.

Sul dominio pubblico ripetute 20 combinazioni Chromium da 320 a 1920 px,
con sidebar aperta/chiusa, ricerca senza risultati e focus sui pulsanti.
Il collaudo del layout usa risposte API fittizie intercettate nel browser,
senza scritture al database reale: nessun overflow o errore JavaScript.
Rimossa la sessione dimostrativa, verificato il redirect anonimo al login.

Backend invariato, confermato da `/api/health/version` sul commit `c154187`.
Per ripristinare il solo frontend, la versione precedente è
`dpl_DUmnxChTZtasde2tU5CnpuqqW3uD`; nessun rollback eseguito.

## Contenimento della dashboard — correzione del 2026-09-15

Gli screenshot successivi mostravano tagli anche ai filtri e ai riepiloghi del
report. Riprodotto uno spostamento analogo con un nome utente lungo nell'header:
la colonna `1fr` conservava il minimo intrinseco dell'intestazione e allargava
l'intera pagina. Con viewport di 1686 px e un nome di prova di 180 caratteri,
il documento arrivava a 2192 px; il blocco Presenze centrato usciva a destra.
I precedenti collaudi usavano un nome admin breve e non coprivano questo caso.

La griglia comune ora usa `minmax(0, 1fr)` e `min-width: 0` per header e main;
su mobile dichiara una sola colonna anche nelle aree. Il nome utente ha una
larghezza limitata e i puntini di sospensione, con nome completo nel tooltip.
La sidebar chiusa rimuove il testo dal layout: la precedente sola opacità
lasciava le etichette nel flex e schiacciava le icone. Le icone conservano ora
la dimensione, e i link mantengono nomi accessibili e tooltip.

Verifiche locali: 44 combinazioni in Chromium e 44 in Firefox 154, da 320 a
3440 px, Dipendenti/Report e sidebar aperta/chiusa, con nome admin lungo.
Controllati documento, header, filtri, statistiche, azioni, icone e accesso
all'ultima colonna del report tramite lo scorrimento della sola tabella.
Il medesimo controllo fallisce sul deployment precedente del frontend.
`agent-gate full` superato: 34 test server, 12 client, TypeScript, lint e build;
verificato anche il lint dei tre componenti della dashboard modificati.
