#!/usr/bin/env python3
"""
Scarica dal «Database dei mesi del calendario» del National Astronomical Observatory of Japan
(暦月・節月データベース, https://eco.mtk.nao.ac.jp/cgi-bin/koyomi/caldb_s.cgi)
i mesi storici del calendario giapponese, un anno alla volta, e genera
src/lib/calendar/historical.json.

Fonte dei dati: 内田正男『日本暦日原典』(1975), tramite il NAOJ — (C) 国立天文台.
Le regole del sito consentono il libero uso dei contenuti (https://eco.mtk.nao.ac.jp/koyomi/site/).

Uso:
    python3 -I scripts/fetch_naoj.py [anno_iniziale] [anno_finale]     (predefinito 862 1872)

Ogni anno scaricato resta in scripts/.naoj-cache/ (esclusa da git): se lo script viene
interrotto, alla ripresa scarica solo gli anni mancanti. Tra una richiesta e l'altra
attende 2 secondi, per non pesare sul server.
"""
import html
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / 'scripts' / '.naoj-cache'
OUT = ROOT / 'src' / 'lib' / 'calendar' / 'historical.json'
URL = 'https://eco.mtk.nao.ac.jp/cgi-bin/koyomi/caldb_s.cgi'
DELAY = 2.0


def fetch_year(year: int) -> str:
    data = urllib.parse.urlencode(
        {'gengo': 'a000', 'year': str(year), 'month': '0', 'jg': '2', '表示': '表示'}, encoding='euc_jp'
    ).encode('ascii')
    req = urllib.request.Request(URL, data=data, headers={'User-Agent': 'Mozilla/5.0 (personal calendar build script)'})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read().decode('euc_jp', errors='replace')


def parse_rows(page: str):
    rows = []
    for tb in re.findall(r'<table.*?</table>', page, re.S):
        for tr in re.findall(r'<tr.*?</tr>', tb, re.S):
            cells = [re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', c))).strip()
                     for c in re.findall(r'<t[hd][^>]*>.*?</t[hd]>', tr, re.S)]
            if len(cells) >= 7 and re.match(r'^-?\d+/\d+/\d+$', cells[0]):
                rows.append(cells)
    return rows


WAREKI = re.compile(r'^(.+?)(\d+|元)年(閏)?(\d+)月(\d+)日$')  # 元年 = primo anno dell'era


def jdn(y: int, m: int, d: int, julian: bool) -> int:
    a = (14 - m) // 12
    yy = y + 4800 - a
    mm = m + 12 * a - 3
    if julian:
        return d + (153 * mm + 2) // 5 + 365 * yy + yy // 4 - 32083
    return d + (153 * mm + 2) // 5 + 365 * yy + yy // 4 - yy // 100 + yy // 400 - 32045


def day_number(date_str: str) -> int:
    """Data «AAAA/MM/GG» del NAOJ (giuliana prima del 15/10/1582) → giorni dal 1970-01-01."""
    y, m, d = (int(x) for x in date_str.split('/'))
    julian = (y, m, d) < (1582, 10, 15)
    return jdn(y, m, d, julian) - 2440588


def main():
    start = int(sys.argv[1]) if len(sys.argv) > 1 else 862
    end = int(sys.argv[2]) if len(sys.argv) > 2 else 1872
    CACHE.mkdir(parents=True, exist_ok=True)

    for year in range(start, end + 1):
        f = CACHE / f'{year}.html'
        if f.exists() and parse_rows(f.read_text(encoding='utf-8')):
            continue
        for attempt in range(3):
            try:
                page = fetch_year(year)
                if not parse_rows(page):
                    raise ValueError('nessun mese nella risposta')
                f.write_text(page, encoding='utf-8')
                print(f'{year}: {len(parse_rows(page))} mesi', flush=True)
                break
            except Exception as e:  # noqa: BLE001
                print(f'{year}: errore ({e}), nuovo tentativo', flush=True)
                time.sleep(10 * (attempt + 1))
        else:
            sys.exit(f'Impossibile scaricare il {year}')
        time.sleep(DELAY)

    # ---- assemblaggio
    eras: list[str] = []
    months = []
    for year in range(start, end + 1):
        for cells in parse_rows((CACHE / f'{year}.html').read_text(encoding='utf-8')):
            m = WAREKI.match(cells[1].replace(' ', ''))
            if not m:
                sys.exit(f'Data giapponese non riconosciuta: {cells[1]}')
            era, leap, month, day = m.group(1), bool(m.group(3)), int(m.group(4)), int(m.group(5))
            era_year = 1 if m.group(2) == '元' else int(m.group(2))
            if day != 1:
                sys.exit(f'Atteso il primo del mese: {cells}')
            if era not in eras:
                eras.append(era)
            length = 30 if cells[6] == '大' else 29 if cells[6] == '小' else 0
            months.append([day_number(cells[0]), year, month, int(leap), eras.index(era), era_year, length])

    months.sort(key=lambda r: r[0])
    for a, b in zip(months, months[1:]):
        if b[0] - a[0] != a[6]:
            print(f'ATTENZIONE: durata {a} non coincide con il mese successivo {b}')

    # Formato compatto (circa 30 KB invece di 400):
    #  - start: giorno d'inizio del primo mese (giorni dal 1970-01-01)
    #  - lengths: un carattere per mese, '9' = 29 giorni, '0' = 30
    #  - months: un carattere per mese, 'a'…'l' = mese 1…12, 'A'…'L' = intercalare
    #  - years: anno lunare (numerazione occidentale) del primo mese; poi +1 a ogni 1° mese
    #  - eras: [indice del mese, indice dell'era, anno dell'era] a ogni cambio non deducibile
    #          (l'anno dell'era cresce di uno a ogni nuovo anno lunare)
    lengths = ''.join('9' if m[6] == 29 else '0' for m in months)
    codes = ''.join((chr(ord('A') + m[2] - 1) if m[3] else chr(ord('a') + m[2] - 1)) for m in months)
    era_runs = []
    cur_era = cur_eyear = None
    for i, m in enumerate(months):
        if cur_era is not None and m[2] == 1 and not m[3]:
            cur_eyear += 1
        if m[4] != cur_era or m[5] != cur_eyear:
            era_runs.append([i, m[4], m[5]])
            cur_era, cur_eyear = m[4], m[5]
    year = months[0][1]
    for i, m in enumerate(months):
        if i and m[2] == 1 and not m[3]:
            year += 1
        if m[1] != year:
            sys.exit(f'Numerazione degli anni inattesa al mese {m}')
    OUT.write_text(
        json.dumps(
            {
                'source': '内田正男『日本暦日原典』, via 国立天文台 暦計算室 (https://eco.mtk.nao.ac.jp/cgi-bin/koyomi/caldb_s.cgi). (C) 国立天文台',
                'start': months[0][0],
                'firstYear': months[0][1],
                'lengths': lengths,
                'months': codes,
                'eraNames': eras,
                'eras': era_runs,
            },
            ensure_ascii=False,
            separators=(',', ':'),
        ),
        encoding='utf-8',
    )
    print(f'Scritti {len(months)} mesi ({start}–{end}) in {OUT}')


if __name__ == '__main__':
    main()
