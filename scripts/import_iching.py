#!/usr/bin/env python3
"""
Importa il testo dell'I Ching (Wilhelm, ed. Adelphi) da un ePub decompresso.

Uso:
    python3 -I scripts/import_iching.py "<percorso>/Wilhelm Richard - I Ching.epub"

Scrive in src/lib/iching/testo/ (esclusa da git):
    titoli.json   numero → romanizzazione e titolo
    NN.json       per esagramma: html del Libro primo e del Libro terzo,
                  sentenza, immagine e linee in forma strutturata, note.

L'HTML prodotto contiene solo un piccolo insieme di tag generati da questo script:
il contenuto originale viene sempre trattato come testo ed escapato.
"""
import html
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'src' / 'lib' / 'iching' / 'testo'

BOOK1 = ['e9788845980930_c01.html', 'e9788845980930_c02.html']
BOOK3 = ['e9788845980930_c06.html', 'e9788845980930_c06_b.html', 'e9788845980930_c07.html', 'e9788845980930_c07_b.html']
NOTES = 'e9788845980930_ftn01.html'

HEADING_RE = re.compile(r'<h1 class="title-chapter[13]">(\d+)\.\s*(.*?)</h1>', re.S)


def clean_ws(s: str) -> str:
    return re.sub(r'\s+', ' ', s.replace(' ', ' ')).strip()


class BlockParser(HTMLParser):
    """Trasforma un frammento XHTML in una lista di blocchi {kind, cls, html, text, notes}."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.blocks = []
        self.cur = None
        self.stack = []  # tag aperti dentro il blocco: (tag, sostituto)
        self.in_note_ref = False
        self.row = None
        self.cell = None

    # -- utilità
    def _emit(self, s):
        if self.cell is not None:
            self.cell['html'].append(s)
        elif self.cur is not None:
            self.cur['html'].append(s)

    def _text(self, s):
        if self.cell is not None:
            self.cell['text'].append(s)
        elif self.cur is not None:
            self.cur['text'].append(s)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        cls = a.get('class', '')
        if tag == 'p':
            self.cur = {'kind': 'p', 'cls': cls, 'html': [], 'text': [], 'notes': [], 'heading': False, 'only_em': True}
            self.stack = []
        elif tag == 'tr':
            self.row = []
        elif tag == 'td' and self.row is not None:
            self.cell = {'html': [], 'text': []}
        elif tag == 'span':
            if 'copyrights' in cls and self.cur is not None:
                self.cur['heading'] = True
                self.stack.append(('span', None))
            elif cls == 'i':
                self._emit('<em>')
                self.stack.append(('span', '</em>'))
            else:
                self.stack.append(('span', None))
        elif tag == 'a' and 'ftn_fn' in a.get('href', ''):
            m = re.search(r'#ftn_(fn\d+)', a['href'])
            if m and self.cur is not None:
                self.cur['notes'].append(m.group(1))
                self.in_note_ref = m.group(1)
        elif tag == 'br':
            self._emit('<br>')

    def handle_endtag(self, tag):
        if tag == 'p' and self.cur is not None:
            self.cur['html'] = ''.join(self.cur['html']).strip()
            self.cur['text'] = clean_ws(''.join(self.cur['text']))
            self.blocks.append(self.cur)
            self.cur = None
        elif tag == 'td' and self.cell is not None:
            self.row.append(self.cell)
            self.cell = None
        elif tag == 'tr' and self.row is not None:
            if len(self.row) >= 2:
                ref = ' '.join(clean_ws(''.join(c['text'])) for c in self.row[:-1])
                last = self.row[-1]
                self.blocks.append({
                    'kind': 'ref', 'cls': '', 'ref': ref,
                    'html': ''.join(last['html']).strip(), 'text': clean_ws(''.join(last['text'])),
                    'notes': [], 'heading': False, 'only_em': False,
                })
            self.row = None
        elif tag == 'span' and self.stack:
            _, closing = self.stack.pop()
            if closing:
                self._emit(closing)
        elif tag == 'a' and self.in_note_ref:
            self.in_note_ref = False

    def handle_data(self, data):
        if self.in_note_ref:
            # il numero della nota: lo rendiamo come rimando
            num = data.strip()
            if num:
                self._emit(f'<sup class="nota"><a href="#{self.in_note_ref}">{html.escape(num)}</a></sup>')
            return
        if self.cur is None and self.cell is None:
            return
        if data.strip() and self.cur is not None and not any(c for _, c in self.stack if c == '</em>'):
            self.cur['only_em'] = False
        self._emit(html.escape(data.replace(' ', ' ')))
        self._text(data)

    def handle_pi(self, data):
        pass  # <?dp ...?> numeri di pagina


def parse_blocks(fragment: str):
    p = BlockParser()
    p.feed(fragment)
    return p.blocks


def split_hexagrams(files, base: Path):
    """{n: (titolo_raw, frammento)} per tutti i file indicati."""
    out = {}
    for f in files:
        s = (base / f).read_text(encoding='utf-8')
        heads = list(HEADING_RE.finditer(s))
        for i, m in enumerate(heads):
            end = heads[i + 1].start() if i + 1 < len(heads) else s.find('</body>')
            out[int(m.group(1))] = (m.group(2), s[m.end():end])
    return out


def parse_title(raw: str):
    text = clean_ws(re.sub(r'<[^>]+>', '', html.unescape(raw)))
    roman, _, title = text.partition(' - ')
    short = clean_ws(re.sub(r'\s*\(.*?\)', '', title))
    return roman.strip(), title.strip(), short


def classify(b):
    """Classe CSS di uscita per un blocco."""
    if b['kind'] == 'ref':
        return 'citazione rif'
    cls = b['cls']
    if b['heading']:
        return 'sezione'
    if cls == 'p-blocktext':
        return 'sottotitolo' if b['only_em'] and b['text'] else 'etichetta'
    if cls == 'p-blocktext2':
        return 'verso'
    if cls == 'p-blocktext3':
        return 'verso fine'
    if cls in ('p-blocktext0', 'p-blocktext01'):
        return 'citazione'
    if cls == 'p-blanc':
        return None
    return 'commento'


def render(blocks):
    parts = []
    for b in blocks:
        c = classify(b)
        if c is None or not b['text']:
            continue
        if c == 'sezione':
            parts.append(f'<h3 class="sezione">{html.escape(b["text"].rstrip(":"))}</h3>')
        elif c == 'sottotitolo':
            parts.append(f'<h4 class="sottotitolo">{html.escape(b["text"])}</h4>')
        elif c == 'citazione rif':
            parts.append(f'<p class="citazione rif"><span class="rif">{html.escape(b["ref"])}</span> {b["html"]}</p>')
        else:
            parts.append(f'<p class="{c}">{b["html"]}</p>')
    return '\n'.join(parts)


VERSE = ('verso', 'verso fine')


def structure(blocks):
    """Sentenza, immagine e linee dal Libro primo."""
    section = None
    sentenza, immagine, linee = [], [], []
    current_line = None
    for b in blocks:
        c = classify(b)
        if c == 'sezione':
            t = b['text'].upper()
            section = 'sentenza' if 'SENTENZA' in t else 'immagine' if 'IMMAGINE' in t else 'linee' if 'LINEE' in t else None
            current_line = None
            continue
        if section == 'linee' and c == 'etichetta':
            label = b['text'].rstrip(':').strip()
            # ○ signore reggente, □ signore costitutivo del segno
            marks = re.match(r'^[○□\s]*', label).group(0)
            signori = (['reggente'] if '○' in marks else []) + (['costitutivo'] if '□' in marks else [])
            label = re.sub(r'\s*(questo\s+)?significa$', '', label[len(marks):].strip())
            current_line = {'etichetta': label, 'signori': signori, 'testo': []}
            linee.append(current_line)
            continue
        if c in VERSE:
            target = {'sentenza': sentenza, 'immagine': immagine}.get(section)
            if section == 'linee' and current_line is not None:
                target = current_line['testo']
            if target is not None:
                target.append(b['text'])
        elif c == 'commento':
            # il testo oracolare precede sempre il commento: chiudiamo la raccolta
            if section == 'linee':
                current_line = None
            elif section in ('sentenza', 'immagine'):
                section = section + '-commento'
    return sentenza, immagine, linee


def parse_notes(base: Path):
    s = (base / NOTES).read_text(encoding='utf-8')
    notes = {}
    for m in re.finditer(r'id="ftn_(fn\d+)"><span class="footnote_number">(\d+)</span></a>(.*?)</div>', s, re.S):
        parsed = parse_blocks(m.group(3))
        body = ' '.join(f'<p>{b["html"]}</p>' for b in parsed if b['text'])
        notes[m.group(1)] = {'id': m.group(1), 'n': m.group(2), 'html': body}
    return notes


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    base = Path(sys.argv[1]) / 'OEBPS' / 'Text'
    if not base.is_dir():
        sys.exit(f'Cartella non trovata: {base}')

    notes = parse_notes(base)
    book1 = split_hexagrams(BOOK1, base)
    book3 = split_hexagrams(BOOK3, base)
    missing = [n for n in range(1, 65) if n not in book1 or n not in book3]
    if missing:
        sys.exit(f'Esagrammi mancanti: {missing}')

    OUT.mkdir(parents=True, exist_ok=True)
    titoli = {}
    problems = []
    for n in range(1, 65):
        roman, title, short = parse_title(book1[n][0])
        b1 = parse_blocks(book1[n][1])
        b3 = parse_blocks(book3[n][1])
        sentenza, immagine, linee = structure(b1)
        note_ids = [i for b in b1 + b3 for i in b['notes']]
        if not sentenza or not immagine or len(linee) < 6:
            problems.append(f'{n}: sentenza={len(sentenza)} immagine={len(immagine)} linee={len(linee)}')
        titoli[n] = {'romanizzazione': roman, 'titolo': title, 'titoloBreve': short}
        data = {
            'n': n,
            'romanizzazione': roman,
            'titolo': title,
            'sentenza': sentenza,
            'immagine': immagine,
            'linee': linee,
            'testo': render(b1),
            'commenti': render(b3),
            'note': [notes[i] for i in dict.fromkeys(note_ids) if i in notes],
        }
        (OUT / f'{n:02d}.json').write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding='utf-8')

    (OUT / 'titoli.json').write_text(json.dumps(titoli, ensure_ascii=False, indent=1), encoding='utf-8')
    print(f'Scritti 64 esagrammi in {OUT}')
    for p in problems:
        print('ATTENZIONE', p)


if __name__ == '__main__':
    main()
