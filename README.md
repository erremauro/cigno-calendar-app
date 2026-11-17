# Calendario Cigno Zen

Calendario lunisolare con fasi lunari, ricorrenze Sōtō Zen e I Ching. Uso privato.
Destinazione prevista: `calendar.cignozen.it`.

## Comandi

```bash
npm run dev      # sviluppo (http://localhost:5173)
npm test         # test del motore di calcolo
npm run check    # controllo dei tipi
npm run build    # sito statico in build/
```

## Pubblicazione

Il sito è su **https://cal.cigno.app** (server di cignozen, Apache su CentOS).

- Configurazione: `/etc/httpd/conf.d/cal.cigno.app.conf` (porta 80, solo ACME e redirect) e
  `/etc/httpd/conf.d/cal.cigno.app-ssl.conf` (HTTPS); certificato Let's Encrypt con rinnovo automatico.
- File del sito: `/var/www/html/calendar`.

Per aggiornare il sito dopo una modifica:

```bash
npm run deploy
```

## Scelte

- **SvelteKit 3 + adapter-static**: tutto statico, nessun backend. Il calendario è calcolato nel browser
  (dipende dalla data e dal fuso di chi guarda); le 64 pagine dell'I Ching sono prerenderizzate.
- **astronomy-engine** per noviluni, quarti di luna e longitudine solare.
- **Calendario lunisolare**: regole del kyūreki (天保暦, Sole e Luna veri) sull'ora di Tokyo (UTC+9);
  mese intercalare secondo la regola "cinese" (primo mese senza 中気 in un anno di 13 lune), che risolve
  il problema del 2033 come raccomandato (閏11月). Vedi `src/lib/calendar/lunisolar.ts`.
- **Fasi lunari** nel fuso locale di chi guarda (mezzogiorno locale; orari dei quarti in ora locale).
- **I Ching nel calendario**: 12 esagrammi sovrani per mese lunare (livello principale);
  guaqi 卦氣 del calendario Dayan (60 esagrammi sulle 72 pentadi + 4 angolari sulle stagioni) come approfondimento.
- **Ricorrenze**: data lunare principale, data gregoriana in uso segnalata come secondaria
  (`src/lib/zen/observances.ts`; il campo `verificare` indica le date da confermare).

## Calendari storici (862–1872)

Fino al 1872 i mesi lunari non si calcolano: vengono dalle tavole storiche del *Nihon rekijitsu genten*
(内田正男, 1975), messe a disposizione dal National Astronomical Observatory of Japan nel
[暦月・節月データベース](https://eco.mtk.nao.ac.jp/cgi-bin/koyomi/caldb_s.cgi) — (C) 国立天文台.
Le [regole del sito](https://eco.mtk.nao.ac.jp/koyomi/site/) ne consentono il libero uso.

Così ogni anno segue il calendario in vigore all'epoca: Senmyō (862–1684), Jōkyō (1685–1754),
Hōreki (1755–1797), Kansei (1798–1843), Tenpō (1844–1872). Dal 1873 i mesi si calcolano con le
regole del kyūreki. Prima del 15 ottobre 1582 le date occidentali sono nel calendario giuliano.

Il file `src/lib/calendar/historical.json` è già nel repository. Per rigenerarlo (circa mezz'ora,
una richiesta ogni 2 secondi):

```bash
python3 -I scripts/fetch_naoj.py 862 1872
```

## Testo dell'I Ching

Il testo (Wilhelm, ed. Adelphi: Libro primo e commenti del Libro terzo, con le note) si importa dall'ePub
decompresso e finisce in `src/lib/iching/testo/`, **esclusa da git** perché coperta da diritti:

```bash
python3 -I scripts/import_iching.py "~/Library/Mobile Documents/iCloud~com~apple~iBooks/Documents/Wilhelm Richard - I Ching.epub"
```

Va rieseguito su ogni macchina dove si fa la build. Senza testo l'app funziona con titoli provvisori.
Un test verifica che le linee «nove/sei» del libro coincidano con le figure calcolate.

## Da fare

- Nomi delle 72 pentadi (七十二候).
- Post di cignozen.it per la giornata (REST API WordPress + CORS).
- Protezione dell'accesso alla pubblicazione (il sito è privato).
