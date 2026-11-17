<script lang="ts">
	import { resolve } from '$app/paths';
	import { TRIGRAMS, hexagram, hexagramFromLines, hexagramFromTrigrams, type Trigram } from '#lib/iching/hexagrams.ts';
	import HexagramFigure from '#lib/components/HexagramFigure.svelte';
	import LineGlyph from '#lib/components/LineGlyph.svelte';

	type LineValue = 6 | 7 | 8 | 9;

	const LINE_INFO: { value: LineValue; nome: string; tipo: string; mobile: boolean }[] = [
		{ value: 6, nome: 'Yin vecchio', tipo: 'linea spezzata mobile: diventa intera', mobile: true },
		{ value: 7, nome: 'Yang giovane', tipo: 'linea intera fissa', mobile: false },
		{ value: 8, nome: 'Yin giovane', tipo: 'linea spezzata fissa', mobile: false },
		{ value: 9, nome: 'Yang vecchio', tipo: 'linea intera mobile: diventa spezzata', mobile: true }
	];

	/** Combinazioni delle tre monete: testa = 3 (yang), croce = 2 (yin). */
	const COINS: { faces: string; sum: LineValue; prob: string }[] = [
		{ faces: 'croce · croce · croce', sum: 6, prob: '1 su 8' },
		{ faces: 'testa · croce · croce', sum: 7, prob: '3 su 8' },
		{ faces: 'testa · testa · croce', sum: 8, prob: '3 su 8' },
		{ faces: 'testa · testa · testa', sum: 9, prob: '1 su 8' }
	];

	/** Probabilità di ciascuna linea con i due metodi, in sedicesimi. */
	const PROB: { value: LineValue; monete: number; steli: number }[] = [
		{ value: 6, monete: 2, steli: 1 },
		{ value: 7, monete: 6, steli: 5 },
		{ value: 8, monete: 6, steli: 7 },
		{ value: 9, monete: 2, steli: 3 }
	];

	// Esempio: il 56 con il nove al quarto posto mobile
	const example = hexagram(56);
	const exampleValues: LineValue[] = example.lines.map((l, i) => (i === 3 ? 9 : l ? 7 : 8));
	const exampleResult = hexagramFromLines(exampleValues.map((v) => (v === 9 ? 0 : v === 6 ? 1 : v === 7 ? 1 : 0)));

	// Ordine dei trigrammi nella tavola, come nell'edizione di Wilhelm
	const ORDER: Trigram[] = ['qian', 'zhen', 'kan', 'gen', 'kun', 'xun', 'li', 'dui'];

	const pct = (n: number) => `${Math.round((n / 16) * 1000) / 10}%`;
</script>

<svelte:head>
	<title>Consultare l’oracolo · I Ching</title>
</svelte:head>

<nav class="crumbs ui">
	<a href={resolve('/iching')}>I Ching</a>
</nav>

<article class="guide">
	<header class="intro">
		<h1>Consultare l’oracolo</h1>
		<p class="lead">
			Si costruisce un esagramma linea per linea, dal basso verso l’alto, con tre monete oppure con cinquanta steli
			di millefoglie. Ogni linea ha un valore — 6, 7, 8 o 9 — che dice se è yin o yang e se è ferma o in movimento.
		</p>
		<ol class="toc ui">
			<li><a href="#prima">Prima di cominciare</a></li>
			<li><a href="#monete">Le tre monete</a></li>
			<li><a href="#steli">Gli steli di millefoglie</a></li>
			<li><a href="#risposta">Leggere la risposta</a></li>
			<li><a href="#tavola">Trovare l’esagramma</a></li>
		</ol>
		<a class="btn cta" href={resolve('/iching/oracolo')}>Consulta l’oracolo →</a>
	</header>

	<!-- ------------------------------------------------------------------ -->
	<section id="prima">
		<h2>Prima di cominciare</h2>
		<ul class="points">
			<li>
				<strong>Una domanda sola, chiara.</strong> Meglio chiedere «Che cosa devo considerare se…» che una domanda a cui
				si risponde sì o no.
			</li>
			<li><strong>Un momento di quiete.</strong> Tradizionalmente si consulta l’oracolo con raccoglimento, non per gioco.</li>
			<li>
				<strong>Carta e penna.</strong> Si annota ogni linea appena ottenuta, partendo dal basso: la prima linea è quella
				più in basso, la sesta quella in alto.
			</li>
		</ul>

		<h3>I quattro tipi di linea</h3>
		<div class="lines-table">
			{#each LINE_INFO as l (l.value)}
				<div class="line-row" class:mobile={l.mobile}>
					<span class="num">{l.value}</span>
					<LineGlyph value={l.value} />
					<span class="desc">
						<strong>{l.nome}</strong>
						<span class="muted ui">{l.tipo}</span>
					</span>
				</div>
			{/each}
		</div>
		<p class="note ui">
			Le linee <strong>mobili</strong> (6 e 9) sono quelle in trasformazione: si segnano con × e ○ e sono le più
			importanti nella risposta.
		</p>
	</section>

	<!-- ------------------------------------------------------------------ -->
	<section id="monete">
		<h2>Il metodo delle tre monete</h2>
		<p>È il metodo più semplice e il più usato. Bastano tre monete uguali.</p>
		<ol class="steps">
			<li>Stabilisci che una faccia, per esempio la testa, vale <strong>3</strong> (yang) e l’altra <strong>2</strong> (yin).</li>
			<li>Lancia insieme le tre monete e somma i valori: ottieni 6, 7, 8 o 9.</li>
			<li>Disegna la linea corrispondente. È la prima, quella in basso.</li>
			<li>Ripeti altre cinque volte, disegnando ogni nuova linea sopra la precedente.</li>
		</ol>

		<div class="coins">
			{#each COINS as c (c.sum)}
				<div class="coin-row">
					<span class="faces ui">{c.faces}</span>
					<span class="sum">= {c.sum}</span>
					<LineGlyph value={c.sum} width={48} />
					<span class="prob ui muted">{c.prob}</span>
				</div>
			{/each}
		</div>
	</section>

	<!-- ------------------------------------------------------------------ -->
	<section id="steli">
		<h2>Il metodo degli steli di millefoglie</h2>
		<p>
			È il metodo antico, lento e meditativo: per ogni linea servono tre conteggi, e un esagramma richiede una ventina di
			minuti. Servono cinquanta steli di millefoglie, o in mancanza cinquanta bastoncini sottili.
		</p>

		<ol class="steps">
			<li>Prendi i cinquanta steli e mettine <strong>uno da parte</strong>: non verrà più usato. Ne restano 49.</li>
			<li>Dividi i 49 steli in <strong>due mucchi</strong>, senza contarli.</li>
			<li>Prendi uno stelo dal mucchio di destra e tienilo nella mano sinistra, tra il mignolo e l’anulare.</li>
			<li>
				Conta il mucchio di sinistra togliendo gli steli <strong>a gruppi di quattro</strong>, finché ne restano da 1 a 4.
				Tieni il resto tra l’anulare e il medio.
			</li>
			<li>Fai lo stesso con il mucchio di destra e tieni il resto tra il medio e l’indice.</li>
			<li>
				Gli steli che hai in mano sono <strong>5 oppure 9</strong>. Mettili da parte e annota il valore:
				<span class="pill">5 vale 3</span> <span class="pill">9 vale 2</span>
			</li>
			<li>
				Riunisci gli steli rimasti (44 o 40) e ripeti i passi da 2 a 5. Ora in mano ne avrai
				<strong>4 oppure 8</strong>: <span class="pill">4 vale 3</span> <span class="pill">8 vale 2</span>
			</li>
			<li>Ripeti una terza volta con gli steli rimasti: di nuovo 4 vale 3 e 8 vale 2.</li>
			<li>
				<strong>Somma i tre valori</strong>: ottieni 6, 7, 8 o 9, cioè la prima linea. Riparti dal passo 1 con tutti i 49
				steli per ciascuna delle altre cinque linee.
			</li>
		</ol>
	</section>

	<!-- ------------------------------------------------------------------ -->
	<section id="confronto">
		<h3>I due metodi non sono equivalenti</h3>
		<p>
			Con le monete le due linee mobili escono con la stessa frequenza. Con gli steli lo yang vecchio (9) esce tre volte
			più spesso dello yin vecchio (6): il mutamento parte più facilmente dallo yang che dallo yin.
		</p>
		<div class="prob-table">
			<div class="prob-head ui muted">
				<span></span><span>monete</span><span>steli</span>
			</div>
			{#each PROB as p (p.value)}
				<div class="prob-row">
					<span class="prob-label"><LineGlyph value={p.value} width={36} /> {p.value}</span>
					<span class="bar-cell">
						<span class="bar" style:width={`${(p.monete / 8) * 100}%`}></span>
						<span class="ui">{pct(p.monete)}</span>
					</span>
					<span class="bar-cell">
						<span class="bar steli" style:width={`${(p.steli / 8) * 100}%`}></span>
						<span class="ui">{pct(p.steli)}</span>
					</span>
				</div>
			{/each}
		</div>
	</section>

	<!-- ------------------------------------------------------------------ -->
	<section id="risposta">
		<h2>Leggere la risposta</h2>
		<ol class="steps">
			<li>
				<strong>Trova l’esagramma</strong> nella <a href="#tavola">tavola qui sotto</a>: le tre linee in basso formano il
				trigramma inferiore, le tre in alto quello superiore.
			</li>
			<li>Leggi la <strong>Sentenza</strong> e l’<strong>Immagine</strong>: descrivono la situazione nel suo insieme.</li>
			<li>
				Se ci sono <strong>linee mobili</strong>, leggi anche il loro testo: per esempio «Nove al quarto posto» se la quarta
				linea è un 9. Le linee ferme non si leggono.
			</li>
			<li>
				Trasforma le linee mobili nel loro opposto — il 9 diventa spezzato, il 6 diventa intero — e ottieni un
				<strong>secondo esagramma</strong>, che indica dove la situazione sta andando. Di questo si leggono Sentenza e
				Immagine, ma non le linee.
			</li>
		</ol>
		<p class="note ui">
			Se tutte e sei le linee sono mobili negli esagrammi 1 e 2, si legge anche il testo speciale «Quando compaiono tutti
			nove» o «Quando compaiono tutti sei».
		</p>

		<figure class="example card">
			<figcaption class="ui muted">Esempio</figcaption>
			<div class="example-row">
				<div class="example-hex">
					<div class="glyph-stack">
						{#each [...exampleValues].reverse() as v, i (i)}
							<LineGlyph value={v} width={64} />
						{/each}
					</div>
					<a href={resolve('/iching/[n]', { n: String(example.n) })}>
						<span class="ja">{example.kanji}</span>
						{example.n}. {example.titolo}
					</a>
				</div>
				<span class="arrow" aria-hidden="true">→</span>
				<div class="example-hex">
					<HexagramFigure lines={exampleResult.lines} width={64} />
					<a href={resolve('/iching/[n]', { n: String(exampleResult.n) })}>
						<span class="ja">{exampleResult.kanji}</span>
						{exampleResult.n}. {exampleResult.titolo}
					</a>
				</div>
			</div>
			<p class="ui">
				Dai lanci esce il {example.n} con un 9 al quarto posto. Si leggono Sentenza e Immagine del {example.n}, poi il
				testo «Nove al quarto posto». La quarta linea si trasforma e nasce il {exampleResult.n}, di cui si leggono
				Sentenza e Immagine.
			</p>
		</figure>
	</section>

	<!-- ------------------------------------------------------------------ -->
	<section id="tavola">
		<h2>Trovare l’esagramma</h2>
		<p>
			Cerca nella colonna il trigramma superiore (linee 4–6) e nella riga quello inferiore (linee 1–3): l’incrocio è il
			numero dell’esagramma. Tocca il numero per aprirlo.
		</p>
		<div class="lookup-wrap">
			<table class="lookup">
				<thead>
					<tr>
						<th class="corner ui muted">
							<span>sopra →</span>
							<span>sotto ↓</span>
						</th>
						{#each ORDER as up (up)}
							<th scope="col">
								<HexagramFigure lines={TRIGRAMS[up].lines} width={22} />
								<span class="ja">{TRIGRAMS[up].kanji}</span>
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each ORDER as low (low)}
						<tr>
							<th scope="row">
								<HexagramFigure lines={TRIGRAMS[low].lines} width={22} />
								<span class="ja">{TRIGRAMS[low].kanji}</span>
							</th>
							{#each ORDER as up (up)}
								{@const h = hexagramFromTrigrams(low, up)}
								<td>
									<a href={resolve('/iching/[n]', { n: String(h.n) })} title="{h.n}. {h.titolo}">{h.n}</a>
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p class="end-cta"><a class="btn cta" href={resolve('/iching/oracolo')}>Consulta l’oracolo →</a></p>
		<ul class="trigram-legend ui muted">
			{#each ORDER as t (t)}
				<li><span class="ja">{TRIGRAMS[t].kanji}</span> {TRIGRAMS[t].nome}, {TRIGRAMS[t].immagine}</li>
			{/each}
		</ul>
	</section>
</article>

<style>
	.crumbs {
		padding: 1rem 0;
	}

	.guide {
		max-width: 46rem;
		font-size: clamp(1.02rem, 0.98rem + 0.2vw, 1.1rem);
		line-height: 1.7;
	}

	.intro h1 {
		font-size: clamp(1.7rem, 1.4rem + 1.4vw, 2.4rem);
		margin-bottom: 0.6rem;
	}

	.lead {
		color: var(--text-strong);
	}

	.toc {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		list-style: none;
		margin: 1.2rem 0 0;
		padding: 0;
	}

	.toc a {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border: 1px solid var(--btn-border);
		border-radius: var(--radius-full);
		background: var(--btn-bg);
		color: var(--text);
		font-size: 0.82rem;
	}

	.toc a:hover {
		text-decoration: none;
		border-color: var(--link);
		color: var(--link);
	}

	.cta {
		margin-top: 1rem;
		min-height: 2.5rem;
		padding: 0 1.2rem;
		background: var(--link);
		border-color: var(--link);
		color: var(--bg);
		font-weight: 700;
	}

	.cta:hover {
		text-decoration: none;
		background: color-mix(in srgb, var(--link) 85%, var(--text-strong));
	}

	.end-cta {
		margin: 0.5rem 0 1.2rem;
	}

	section {
		padding-top: 2.4rem;
		scroll-margin-top: 1rem;
	}

	h2 {
		font-size: clamp(1.3rem, 1.15rem + 0.7vw, 1.6rem);
		margin-bottom: 0.8rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--card-border);
	}

	h3 {
		font-size: 1.05rem;
		margin: 1.6rem 0 0.8rem;
	}

	#confronto {
		padding-top: 0.6rem;
	}

	.points {
		padding-left: 1.1rem;
		margin: 0;
	}

	.points li {
		margin-bottom: 0.6rem;
	}

	strong {
		color: var(--text-strong);
	}

	/* passi numerati */
	.steps {
		counter-reset: step;
		list-style: none;
		margin: 1rem 0;
		padding: 0;
	}

	.steps li {
		counter-increment: step;
		position: relative;
		padding: 0 0 0.9rem 2.6rem;
	}

	.steps li::before {
		content: counter(step);
		position: absolute;
		left: 0;
		top: 0.15rem;
		width: 1.75rem;
		height: 1.75rem;
		display: grid;
		place-items: center;
		border-radius: 50%;
		border: 1px solid var(--card-border);
		background: var(--card);
		color: var(--text-strong);
		font-size: 0.8rem;
		font-weight: 700;
	}

	.pill {
		display: inline-block;
		margin: 0.15rem 0.2rem 0 0;
		padding: 0 0.55rem;
		border-radius: var(--radius-full);
		background: var(--link-soft);
		color: var(--text-strong);
		font-size: 0.85rem;
		white-space: nowrap;
	}

	.note {
		padding: 0.6rem 0.9rem;
		border-left: 2px solid var(--accent);
		background: var(--card);
		border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
	}

	/* tipi di linea */
	.lines-table {
		display: grid;
		gap: 0.6rem;
		margin-bottom: 1rem;
	}

	.line-row {
		display: grid;
		grid-template-columns: 1.6rem 56px 1fr;
		align-items: center;
		gap: 0.9rem;
	}

	.line-row .num,
	.sum {
		font-weight: 700;
		color: var(--text-strong);
		text-align: center;
	}

	.line-row.mobile .num {
		color: var(--accent);
	}

	.desc {
		display: flex;
		flex-direction: column;
		line-height: 1.35;
	}

	/* monete */
	.coins {
		display: grid;
		gap: 0.5rem;
		padding: 0.8rem 1rem;
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		border-radius: var(--radius-md);
	}

	.coin-row {
		display: grid;
		grid-template-columns: 1fr auto 48px 4.5rem;
		align-items: center;
		gap: 0.8rem;
	}

	.prob {
		text-align: right;
	}

	/* probabilità */
	.prob-table {
		display: grid;
		gap: 0.45rem;
	}

	.prob-head,
	.prob-row {
		display: grid;
		grid-template-columns: 4.5rem 1fr 1fr;
		gap: 0.8rem;
		align-items: center;
	}

	.prob-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 700;
		color: var(--text-strong);
	}

	.bar-cell {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.bar {
		height: 0.55rem;
		border-radius: var(--radius-full);
		background: var(--text-faint);
	}

	.bar.steli {
		background: var(--accent);
	}

	/* esempio */
	.example {
		margin: 1.4rem 0 0;
		padding: 1rem 1.2rem;
	}

	.example figcaption {
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-size: 0.72rem;
		margin-bottom: 0.8rem;
	}

	.example-row {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1.5rem;
		margin-bottom: 0.8rem;
	}

	.example-hex {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.6rem;
		color: var(--text-strong);
		text-align: center;
		font-size: 0.9rem;
	}

	.glyph-stack {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.arrow {
		font-size: 1.6rem;
		color: var(--text-faint);
	}

	.example p {
		margin: 0;
	}

	/* tavola */
	.lookup-wrap {
		overflow-x: auto;
		margin: 1rem 0;
	}

	.lookup {
		width: 100%;
		border-collapse: separate;
		border-spacing: 3px;
		table-layout: fixed;
	}

	.lookup th {
		font-weight: 400;
		color: var(--text);
		padding: 0.3rem 0;
	}

	.lookup thead th,
	.lookup tbody th {
		text-align: center;
	}

	.lookup th :global(svg) {
		margin: 0 auto 0.2rem;
		color: var(--text-strong);
	}

	.lookup th .ja {
		display: block;
		font-size: 0.85rem;
		line-height: 1;
	}

	.corner {
		width: 3.4rem;
		font-size: 0.62rem;
		line-height: 1.3;
		vertical-align: bottom;
	}

	.corner span {
		display: block;
	}

	.lookup td a {
		display: grid;
		place-items: center;
		height: 2.4rem;
		border-radius: var(--radius-sm);
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		color: var(--text-strong);
		font-weight: 700;
		font-size: 0.9rem;
	}

	.lookup td a:hover {
		text-decoration: none;
		border-color: var(--link);
		color: var(--link);
	}

	.trigram-legend {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
		gap: 0.2rem 1rem;
		list-style: none;
		margin: 0;
		padding: 0;
		font-size: 0.8rem;
	}

	@media (max-width: 520px) {
		.coin-row {
			grid-template-columns: 1fr auto 40px;
		}
		.coin-row .prob {
			grid-column: 1 / -1;
			text-align: left;
			margin-top: -0.4rem;
		}
		.lookup {
			border-spacing: 2px;
		}
		.corner {
			width: 2.4rem;
		}
		.lookup td a {
			height: 2.1rem;
			font-size: 0.8rem;
		}
		.lookup th .ja {
			font-size: 0.75rem;
		}
	}
</style>
