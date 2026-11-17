<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import {
		coinsToValue,
		isMoving,
		lineOrdinal,
		parse,
		reading as makeReading,
		serialize,
		throwCoins,
		type CoinFace,
		type LineValue
	} from '#lib/iching/oracle.ts';
	import { loadText } from '#lib/iching/text.ts';
	import type { Hexagram } from '#lib/iching/hexagrams.ts';
	import HexagramFigure from '#lib/components/HexagramFigure.svelte';
	import LineGlyph from '#lib/components/LineGlyph.svelte';
	import Coin from '#lib/components/Coin.svelte';

	const LINE_NAMES: Record<LineValue, string> = {
		6: 'Yin vecchio, mobile',
		7: 'Yang giovane',
		8: 'Yin giovane',
		9: 'Yang vecchio, mobile'
	};

	const reduceMotion =
		typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const dur = (ms: number) => (reduceMotion ? 0 : ms);

	// ---------------------------------------------------------------- stato
	const fromUrl = parse(page.url.searchParams.get('l'));
	let values = $state<LineValue[]>(fromUrl ?? []);
	let question = $state(page.url.searchParams.get('q') ?? '');
	let coins = $state<CoinFace[]>([3, 3, 3]);
	let flipping = $state(false);

	function savedMode(): 'monete' | 'valori' {
		try {
			return localStorage.getItem('oracolo-modo') === 'valori' ? 'valori' : 'monete';
		} catch {
			return 'monete';
		}
	}
	let mode = $state<'monete' | 'valori'>(savedMode());
	function setMode(m: 'monete' | 'valori') {
		mode = m;
		try {
			localStorage.setItem('oracolo-modo', m);
		} catch {}
	}

	const complete = $derived(values.length === 6);
	const result = $derived(complete ? makeReading(values) : null);
	const nextPosition = $derived(values.length + 1);
	const coinValue = $derived(coinsToValue(coins));

	// ---------------------------------------------------------------- cronologia
	interface Entry {
		t: string;
		q: string;
		l: string;
	}
	function loadHistory(): Entry[] {
		try {
			return JSON.parse(localStorage.getItem('oracolo-storia') ?? '[]');
		} catch {
			return [];
		}
	}
	let history = $state<Entry[]>(loadHistory());
	function saveHistory() {
		try {
			localStorage.setItem('oracolo-storia', JSON.stringify(history));
		} catch {}
	}
	function clearHistory() {
		history = [];
		saveHistory();
	}

	// ---------------------------------------------------------------- azioni
	function syncUrl() {
		const base = resolve('/iching/oracolo');
		const params = new URLSearchParams();
		if (complete) {
			params.set('l', serialize(values));
			if (question.trim()) params.set('q', question.trim());
		}
		const qs = params.toString();
		goto(qs ? `${base}?${qs}` : base, { replace: true, shallow: true });
	}

	function addLine(v: LineValue) {
		if (complete) return;
		values = [...values, v];
		if (values.length === 6) {
			history = [{ t: new Date().toISOString(), q: question.trim(), l: serialize(values) }, ...history].slice(0, 30);
			saveHistory();
			syncUrl();
			setTimeout(() => document.getElementById('risultato')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }), 150);
		}
	}

	function virtualThrow() {
		if (flipping || complete) return;
		flipping = true;
		setTimeout(() => {
			coins = throwCoins();
		}, dur(300));
		setTimeout(() => {
			flipping = false;
			addLine(coinsToValue(coins));
		}, dur(750));
	}

	function toggleCoin(i: number) {
		coins[i] = coins[i] === 3 ? 2 : 3;
	}

	function undo() {
		values = values.slice(0, -1);
		syncUrl();
	}

	function restart() {
		values = [];
		coins = [3, 3, 3];
		question = '';
		syncUrl();
		window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
	}

	function open(e: Entry) {
		values = parse(e.l) ?? [];
		question = e.q;
		syncUrl();
		setTimeout(() => document.getElementById('risultato')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }), 50);
	}

	const dateFmt = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
	const hexLink = (h: Hexagram) => resolve('/iching/[n]', { n: String(h.n) });
</script>

<svelte:head>
	<title>Consulta l’oracolo · I Ching</title>
</svelte:head>

<nav class="crumbs ui">
	<a href={resolve('/iching')}>I Ching</a>
	<a href={resolve('/iching/consultazione')}>Come si consulta →</a>
</nav>

<div class="oracle">
	<header class="intro">
		<h1>Consulta l’oracolo</h1>
		<p class="lead">
			Registra le sei linee dal basso verso l’alto, lanciando monete vere oppure qui, con il lancio virtuale.
		</p>
	</header>

	<label class="question">
		<span class="ui muted">La tua domanda <span class="optional">(facoltativa)</span></span>
		<textarea
			bind:value={question}
			rows="2"
			placeholder="Che cosa devo considerare se…"
			disabled={complete}
		></textarea>
	</label>

	<!-- ------------------------------------------------------------ costruzione -->
	<section class="builder" aria-label="Costruzione dell’esagramma">
		<div class="figure card" aria-live="polite">
			{#each [6, 5, 4, 3, 2, 1] as pos (pos)}
				{@const v = values[pos - 1]}
				<div class="slot" class:current={!complete && pos === nextPosition} class:filled={v !== undefined}>
					<span class="pos ui">{pos}</span>
					<span class="line">
						{#if v !== undefined}
							<span in:fly={{ y: 10, duration: dur(280) }}>
								<LineGlyph value={v} width={150} />
							</span>
						{:else}
							<span class="placeholder"></span>
						{/if}
					</span>
					<span class="val ui" class:moving={v !== undefined && isMoving(v)}>{v ?? ''}</span>
				</div>
			{/each}
		</div>

		{#if !complete}
			<div class="controls card" in:fade={{ duration: dur(200) }}>
				<p class="step-title">
					Linea {nextPosition} <span class="muted">di 6 · la {lineOrdinal(nextPosition)}, dal basso</span>
				</p>

				<div class="segmented ui" role="tablist" aria-label="Modo di inserimento">
					<button role="tab" aria-selected={mode === 'monete'} onclick={() => setMode('monete')}>Monete</button>
					<button role="tab" aria-selected={mode === 'valori'} onclick={() => setMode('valori')}>Valore (steli)</button>
				</div>

				{#if mode === 'monete'}
					<p class="hint ui muted">Tocca le monete per riprodurre il tuo lancio, oppure usa il lancio virtuale.</p>
					<div class="coins">
						{#each coins as face, i (i)}
							<Coin
								{face}
								{flipping}
								onclick={() => toggleCoin(i)}
								label="Moneta {i + 1}: {face === 3 ? 'testa, vale 3' : 'croce, vale 2'}"
							/>
						{/each}
					</div>
					<div class="preview">
						<span class="sum">= {coinValue}</span>
						<LineGlyph value={coinValue} width={64} />
						<span class="ui muted">{LINE_NAMES[coinValue]}</span>
					</div>
					<div class="actions">
						<button class="btn primary" onclick={() => addLine(coinValue)} disabled={flipping}>
							Aggiungi la linea {nextPosition}
						</button>
						<button class="btn" onclick={virtualThrow} disabled={flipping}>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
								<circle cx="12" cy="12" r="8.5" /><rect x="9.5" y="9.5" width="5" height="5" />
							</svg>
							Lancio virtuale
						</button>
					</div>
				{:else}
					<p class="hint ui muted">Scegli il valore ottenuto con gli steli (o con qualsiasi altro metodo).</p>
					<div class="values">
						{#each [6, 7, 8, 9] as const as v (v)}
							<button class="value-btn" class:moving={isMoving(v)} onclick={() => addLine(v)}>
								<span class="num">{v}</span>
								<LineGlyph value={v} width={56} />
								<span class="ui muted">{LINE_NAMES[v]}</span>
							</button>
						{/each}
					</div>
				{/if}

				<div class="secondary-actions ui">
					<button class="link-btn" onclick={undo} disabled={values.length === 0}>↶ Annulla l’ultima linea</button>
					{#if values.length}
						<button class="link-btn" onclick={restart}>Ricomincia</button>
					{/if}
				</div>
			</div>
		{/if}
	</section>

	<!-- ------------------------------------------------------------ risultato -->
	{#if result}
		<section id="risultato" class="result" in:fade={{ duration: dur(300) }}>
			{#if question.trim()}
				<blockquote class="asked">«{question.trim()}»</blockquote>
			{/if}

			<div class="pair">
				<a class="hex-card" href={hexLink(result.primary)}>
					<span class="stack">
						{#each [...result.values].reverse() as v, i (i)}<LineGlyph value={v} width={64} />{/each}
					</span>
					<span class="hex-title"><span class="ja">{result.primary.kanji}</span> {result.primary.n}. {result.primary.titolo}</span>
				</a>
				{#if result.secondary}
					<span class="arrow" aria-hidden="true">→</span>
					<a class="hex-card" href={hexLink(result.secondary)}>
						<span class="stack">
							{#each [...result.secondary.lines].reverse() as l, i (i)}<LineGlyph value={l ? 7 : 8} width={64} />{/each}
						</span>
						<span class="hex-title"><span class="ja">{result.secondary.kanji}</span> {result.secondary.n}. {result.secondary.titolo}</span>
					</a>
				{/if}
			</div>

			<p class="summary ui">
				{#if result.moving.length === 0}
					Nessuna linea mobile: la risposta è nell’esagramma nel suo insieme, nella Sentenza e nell’Immagine.
				{:else if result.moving.length === 1}
					Una linea mobile, la {lineOrdinal(result.moving[0])}: leggi il suo testo, poi l’esagramma che ne deriva.
				{:else}
					{result.moving.length} linee mobili ({result.moving.map(lineOrdinal).join(', ')}): leggi i loro testi, poi
					l’esagramma che ne deriva.
				{/if}
			</p>

			{#await loadText(result.primary.n) then t}
				{#if t}
					<article class="reading card">
						<h2><span class="ja">{result.primary.kanji}</span> {result.primary.n}. {result.primary.titoloCompleto}</h2>
						<h3 class="ui">La Sentenza</h3>
						<p class="verse">{#each t.sentenza as v, i (i)}<span>{v}</span>{/each}</p>
						<h3 class="ui">L’Immagine</h3>
						<p class="verse">{#each t.immagine as v, i (i)}<span>{v}</span>{/each}</p>

						{#if result.moving.length}
							<h3 class="ui">{result.moving.length === 1 ? 'La linea mobile' : 'Le linee mobili'}</h3>
							{#each result.moving as pos (pos)}
								{@const line = t.linee[pos - 1]}
								<div class="moving-line">
									<LineGlyph value={result.values[pos - 1]} width={44} />
									<div>
										<p class="label">{line.etichetta}</p>
										<p class="verse">{#each line.testo as v, i (i)}<span>{v}</span>{/each}</p>
									</div>
								</div>
							{/each}
							{#if result.allMoving && t.linee[6]}
								<div class="moving-line all">
									<div>
										<p class="label">{t.linee[6].etichetta}</p>
										<p class="verse">{#each t.linee[6].testo as v, i (i)}<span>{v}</span>{/each}</p>
									</div>
								</div>
							{/if}
						{/if}
						<a class="more ui" href={hexLink(result.primary)}>Testo e commenti completi →</a>
					</article>
				{/if}
			{/await}

			{#if result.secondary}
				{#await loadText(result.secondary.n) then t}
					{#if t}
						<article class="reading card second">
							<p class="kicker ui">Diventa</p>
							<h2><span class="ja">{result.secondary.kanji}</span> {result.secondary.n}. {result.secondary.titoloCompleto}</h2>
							<h3 class="ui">La Sentenza</h3>
							<p class="verse">{#each t.sentenza as v, i (i)}<span>{v}</span>{/each}</p>
							<h3 class="ui">L’Immagine</h3>
							<p class="verse">{#each t.immagine as v, i (i)}<span>{v}</span>{/each}</p>
							<a class="more ui" href={hexLink(result.secondary)}>Testo e commenti completi →</a>
						</article>
					{/if}
				{/await}
			{/if}

			<div class="again">
				<button class="btn primary" onclick={restart}>Nuova consultazione</button>
			</div>
		</section>
	{/if}

	<!-- ------------------------------------------------------------ cronologia -->
	{#if history.length}
		<section class="history">
			<div class="history-head">
				<h2 class="ui">Consultazioni precedenti</h2>
				<button class="link-btn ui" onclick={clearHistory}>Cancella</button>
			</div>
			<ul>
				{#each history as e (e.t)}
					{@const r = makeReading(parse(e.l) ?? [7, 7, 7, 7, 7, 7])}
					<li>
						<button class="history-item" onclick={() => open(e)}>
							<HexagramFigure lines={r.primary.lines} width={26} />
							<span class="h-text">
								<span class="h-q">{e.q || 'Senza domanda'}</span>
								<span class="ui muted">
									{r.primary.n}{#if r.secondary} → {r.secondary.n}{/if} · {dateFmt.format(new Date(e.t))}
								</span>
							</span>
						</button>
					</li>
				{/each}
			</ul>
			<p class="ui muted small">Le consultazioni restano solo su questo dispositivo.</p>
		</section>
	{/if}
</div>

<style>
	.crumbs {
		display: flex;
		justify-content: space-between;
		padding: 1rem 0;
	}

	.oracle {
		max-width: 46rem;
	}

	.intro h1 {
		font-size: clamp(1.7rem, 1.4rem + 1.4vw, 2.4rem);
		margin-bottom: 0.4rem;
	}

	.lead {
		color: var(--text-strong);
		line-height: 1.6;
	}

	/* domanda */
	.question {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		margin: 1.2rem 0 1.4rem;
	}

	.optional {
		font-style: italic;
	}

	textarea {
		width: 100%;
		resize: vertical;
		padding: 0.7rem 0.9rem;
		font: inherit;
		font-style: italic;
		color: var(--text-strong);
		background: var(--card);
		border: 1px solid var(--card-border);
		border-radius: var(--radius-md);
		line-height: 1.5;
	}

	textarea:focus {
		outline: 2px solid var(--link);
		outline-offset: 1px;
	}

	textarea:disabled {
		opacity: 0.75;
	}

	/* costruzione */
	.builder {
		display: grid;
		grid-template-columns: minmax(0, 15rem) minmax(0, 1fr);
		gap: 1rem;
		align-items: start;
	}

	.figure {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 1rem 0.9rem;
	}

	.slot {
		display: grid;
		grid-template-columns: 1rem 1fr 1.2rem;
		align-items: center;
		gap: 0.6rem;
		height: 1.85rem;
		padding: 0 0.3rem;
		border-radius: var(--radius-sm);
		transition: background 0.2s;
	}

	.slot.current {
		background: var(--link-soft);
	}

	.pos {
		font-size: 0.7rem;
		color: var(--text-faint);
		text-align: right;
	}

	.line {
		display: flex;
		justify-content: center;
	}

	.line :global(svg) {
		max-width: 100%;
		height: auto;
	}

	.placeholder {
		display: block;
		width: 100%;
		height: 0.55rem;
		border: 1px dashed var(--card-border);
		border-radius: 2px;
	}

	.current .placeholder {
		border-color: var(--link);
		animation: pulse 1.6s ease-in-out infinite;
	}

	@keyframes pulse {
		50% {
			opacity: 0.35;
		}
	}

	.val {
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--text-faint);
	}

	.val.moving {
		color: var(--accent);
	}

	.controls {
		padding: 1rem 1.1rem 0.9rem;
	}

	.step-title {
		margin: 0 0 0.8rem;
		color: var(--text-strong);
		font-weight: 700;
	}

	.step-title .muted {
		font-weight: 400;
	}

	.segmented {
		display: inline-flex;
		padding: 3px;
		border: 1px solid var(--btn-border);
		border-radius: var(--radius-full);
		background: var(--btn-bg);
	}

	.segmented button {
		padding: 0.3rem 0.9rem;
		border: 0;
		border-radius: var(--radius-full);
		background: none;
		color: var(--text);
		font-size: 0.82rem;
		cursor: pointer;
	}

	.segmented button[aria-selected='true'] {
		background: var(--link);
		color: var(--bg);
	}

	.hint {
		margin: 0.7rem 0 0.5rem;
		font-size: 0.8rem;
	}

	.coins {
		display: flex;
		justify-content: center;
		gap: 0.6rem;
		margin: 0.4rem 0 0.2rem;
	}

	.preview {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.7rem;
		margin: 0.4rem 0 1rem;
		min-height: 1.6rem;
	}

	.sum {
		font-weight: 700;
		color: var(--text-strong);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.actions .btn {
		flex: 1 1 10rem;
		min-height: 2.6rem;
	}

	.btn.primary {
		background: var(--link);
		border-color: var(--link);
		color: var(--bg);
		font-weight: 700;
	}

	.btn.primary:hover {
		background: color-mix(in srgb, var(--link) 85%, var(--text-strong));
	}

	.btn:disabled {
		opacity: 0.55;
		cursor: default;
	}

	.values {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
		margin-top: 0.4rem;
	}

	.value-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.35rem;
		padding: 0.7rem 0.4rem;
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		border-radius: var(--radius-md);
		cursor: pointer;
		color: var(--text);
		font-size: 0.78rem;
		transition: border-color 0.15s;
	}

	.value-btn:hover {
		border-color: var(--link);
	}

	.value-btn .num {
		font-size: 1.2rem;
		font-weight: 700;
		color: var(--text-strong);
	}

	.value-btn.moving .num {
		color: var(--accent);
	}

	.secondary-actions {
		display: flex;
		justify-content: space-between;
		margin-top: 0.9rem;
		padding-top: 0.6rem;
		border-top: 1px solid var(--card-border);
	}

	.link-btn {
		padding: 0.3rem 0;
		background: none;
		border: 0;
		color: var(--link);
		cursor: pointer;
		font-size: 0.82rem;
	}

	.link-btn:disabled {
		color: var(--text-faint);
		cursor: default;
	}

	/* risultato */
	.result {
		margin-top: 2rem;
		scroll-margin-top: 1rem;
	}

	.asked {
		margin: 0 0 1.4rem;
		text-align: center;
		font-style: italic;
		font-size: 1.1rem;
		color: var(--text-strong);
	}

	.pair {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1.2rem;
		margin-bottom: 1rem;
	}

	.hex-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3rem;
		min-width: 8rem;
		color: var(--text-strong);
		text-align: center;
	}

	.hex-card:hover {
		text-decoration: none;
	}

	.hex-card:hover .hex-title {
		color: var(--link);
	}

	.stack {
		display: flex;
		flex-direction: column;
		gap: 3px;
		margin-bottom: 0.5rem;
	}

	.hex-title {
		font-weight: 700;
		line-height: 1.3;
	}

	.arrow {
		font-size: 1.6rem;
		color: var(--text-faint);
	}

	.summary {
		text-align: center;
		margin: 0 auto 1.4rem;
		max-width: 32rem;
		line-height: 1.55;
	}

	.reading {
		padding: 1.2rem 1.3rem 1rem;
		margin-bottom: 1rem;
	}

	.reading h2 {
		font-size: 1.25rem;
		margin-bottom: 0.4rem;
	}

	.reading h3 {
		margin: 1.2rem 0 0.4rem;
		font-size: 0.72rem;
		font-weight: 400;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--text-faint);
	}

	.verse {
		margin: 0;
		padding-left: 0.9rem;
		border-left: 2px solid var(--card-border);
		font-style: italic;
		color: var(--text-strong);
		line-height: 1.6;
	}

	.verse span {
		display: block;
	}

	.moving-line {
		display: grid;
		grid-template-columns: 44px 1fr;
		gap: 0.9rem;
		align-items: start;
		margin: 0.6rem 0 0.9rem;
		padding: 0.7rem 0.8rem;
		border-radius: var(--radius-md);
		background: color-mix(in srgb, var(--accent) 9%, transparent);
	}

	.moving-line :global(svg) {
		margin-top: 0.45rem;
	}

	.moving-line.all {
		grid-template-columns: 1fr;
	}

	.moving-line .label {
		margin: 0 0 0.25rem;
		font-weight: 700;
		color: var(--text-strong);
	}

	.moving-line .verse {
		border-left-color: var(--accent);
	}

	.kicker {
		margin: 0 0 0.2rem;
		font-size: 0.72rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--accent);
	}

	.more {
		display: inline-block;
		margin-top: 1rem;
	}

	.again {
		display: flex;
		justify-content: center;
		margin: 1.4rem 0 0;
	}

	.again .btn {
		min-height: 2.6rem;
		padding: 0 1.4rem;
	}

	/* cronologia */
	.history {
		margin-top: 2.8rem;
		padding-top: 1rem;
		border-top: 1px solid var(--card-border);
	}

	.history-head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}

	.history h2 {
		font-size: 0.72rem;
		font-weight: 400;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--text-faint);
	}

	.history ul {
		list-style: none;
		margin: 0.6rem 0;
		padding: 0;
		display: grid;
		gap: 0.3rem;
	}

	.history-item {
		display: flex;
		align-items: center;
		gap: 0.9rem;
		width: 100%;
		padding: 0.55rem 0.6rem;
		background: none;
		border: 1px solid transparent;
		border-radius: var(--radius-md);
		color: var(--text);
		text-align: left;
		cursor: pointer;
	}

	.history-item:hover {
		border-color: var(--card-border);
		background: var(--card);
	}

	.history-item :global(svg) {
		flex: none;
		color: var(--text);
	}

	.h-text {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.h-q {
		color: var(--text-strong);
		font-style: italic;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.small {
		font-size: 0.75rem;
	}

	@media (max-width: 640px) {
		.builder {
			grid-template-columns: 1fr;
		}
		.figure {
			padding: 0.7rem 0.8rem;
		}
		.slot {
			height: 1.6rem;
		}
		.pair {
			gap: 0.6rem;
		}
		.hex-card {
			min-width: 0;
			flex: 1;
		}
	}
</style>
