# Changelog

Tutte le modifiche rilevanti di questo progetto sono documentate in questo file.

Il formato segue [Keep a Changelog](https://keepachangelog.com/it-IT/1.1.0/)
e il progetto adotta il [Versionamento Semantico](https://semver.org/lang/it/).

## [Unreleased]

## [0.1.0] - 2026-11-17

Prima versione, pubblicata su https://cal.cigno.app.

### Added

#### Calendario lunisolare
- Calendario lunisolare giapponese (kyūreki) calcolato con le regole del calendario Tenpō sull'ora di Tokyo, con mesi intercalari secondo la regola «cinese» (risolve il problema del 2033).
- Mesi storici dal 862 al 1872 presi dalle tavole del *Nihon rekijitsu genten* tramite il database del National Astronomical Observatory of Japan (script `scripts/fetch_naoj.py`): calendari Senmyō, Jōkyō, Hōreki, Kansei e Tenpō, con avviso «Calendario storico» chiudibile.
- Date occidentali nel calendario giuliano prima del 15 ottobre 1582.
- Fasi lunari per giorno nel fuso del dispositivo, con l'ora esatta dei quarti.
- 24 termini solari e 72 pentadi (nomi giapponesi del 1874 con traduzione italiana).
- Ciclo sessagesimale di anni e giorni (es. «Giorno della Capra di Legno»).
- Nomi tradizionali e significato dei dodici mesi lunari, con una nota per ciascuno.
- Navigazione per mese (frecce, «Oggi», tastiera, scorrimento laterale sul telefono)
  e pannello «Vai a…» per scegliere anno, mese o una data precisa.

#### Ricorrenze Sōtō Zen
- Ricorrenze con la data lunare tradizionale come principale e la data gregoriana in uso
  come secondaria (solo dal 1873); ricorrenze astronomiche (Higan, Setsubun) e cerimonie mensili.
- Date verificate sulle fonti Sōtōshū e dell'Università Komazawa, compreso il Ryōso-ki del 29 settembre.

#### I Ching
- I 64 esagrammi con figura, trigrammi e ruolo nel calendario.
- Esagrammi sovrani dei mesi lunari e sistema guaqi (pentadi, ranghi, esagrammi angolari).
- Importazione del testo di Wilhelm (Libro primo e Libro terzo, con le note) dall'ePub con `scripts/import_iching.py`; il testo resta fuori da git.
- Pagina «Consultare l'oracolo» con le istruzioni per monete e steli di millefoglie.
- Consultazione dell'oracolo con monete virtuali o inserimento dei valori, testi delle linee mobili, esagramma derivato e cronologia sul dispositivo.

#### Interfaccia
- Interfaccia in italiano; interruttore 和 per aggiungere i nomi giapponesi nella forma «kanji (romaji) · italiano».
- Stile e logo di Cigno Zen; tema chiaro/scuro in base all'ora come su cignozen.it, con il pulsante sole/luna.
- Pensato anche per lo smartphone: icona per la schermata Home e barra superiore che rispetta la zona dell'orologio.

#### Pubblicazione
- Comando `npm run deploy` per pubblicare su cal.cigno.app.

[Unreleased]: https://github.com/erremauro/cigno-calendar-app/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/erremauro/cigno-calendar-app/releases/tag/v0.1.0
