Obiettivo:

Nella dashboard nella sezione impostazioni ci deve essere una sezione dove è posisbile impostare i dati generali dell'app
Questi dati andranno poi richiamati dal client ad avvio app e salvait in uno stato globale per poi essere condivisi in tutto l'applicativo
Le modifiche a codice dovranno essere tutte documentate tramite commenti file to file

Steps:
Analizzare il codice attuale, client e server, cercare quali sono i dati condivisi in più sezioni
(Email di contatto, indirizzo, telefono ecc)
Cercare anche componenti e funzioni già esistenti riutilizzabili

Creare la quaery sql per supabase

Aggiornare il back end per far funzionare questa implementazione

Creare la sezione in settings con form compilabile per aggiornare i dati nell'applicativo

Implementare nell'applicativo il recupero di queste informazioni dal back end e condivise tramite stato globale in tutto l'applicativo, utilizzando un loading centralizzato e fluido.

Deliverable:
Una corretta implementazione client server, con funzioni centralizate e riutilizzabili, con un design fluido con loading funzionanti. Commentatato in ogni file.
