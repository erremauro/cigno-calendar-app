<script lang="ts">
	import { browser } from '$app/env';
	import { resolve } from '$app/paths';
	import { TRIGRAMS, HEXAGRAMS } from '#lib/iching/hexagrams.ts';
	import { calendarRole, RANKS } from '#lib/iching/seasonal.ts';
	import { SOLAR_TERMS, crossingsInDays } from '#lib/calendar/solarTerms.ts';
	import { pentadName } from '#lib/calendar/pentads.ts';
	import { lunarMonthOf, nextLunarMonth } from '#lib/calendar/lunisolar.ts';
	import { isoFromDay, todayLocal } from '#lib/calendar/time.ts';
	import { formatShortYear, lunarMonthLabel } from '#lib/format.ts';
	import HexagramFigure from '#lib/components/HexagramFigure.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const h = $derived(data.hexagram);
	const text = $derived(data.text);
	let tab = $state<'testo' | 'commenti'>('testo');
	const role = $derived(calendarRole(h));
	const prev = $derived(HEXAGRAMS[(h.n + 62) % 64]);
	const next = $derived(HEXAGRAMS[h.n % 64]);

	/** Prossime date nel calendario: calcolate solo nel browser, a partire da oggi. */
	const upcoming = $derived.by(() => {
		if (!browser) return null;
		const today = todayLocal();
		let sovereign: { start: number; label: string } | undefined;
		if (role.sovereignMonth) {
			let m = lunarMonthOf(today);
			while (m.month !== role.sovereignMonth || m.leap) m = nextLunarMonth(m);
			sovereign = { start: m.startDay, label: lunarMonthLabel(m.month, false) };
		}
		const lons = new Set(role.pentads.map((p) => p.longitude));
		const pentads = crossingsInDays(today - 6, today + 370)
			.filter((c) => lons.has(c.longitude))
			.slice(0, role.pentads.length);
		return { sovereign, pentads };
	});

	const calendarHref = (day: number) => `${resolve('/')}?d=${isoFromDay(day)}`;
</script>

<svelte:head>
	<title>{h.n}. {h.kanji} {h.titolo} · I Ching</title>
</svelte:head>

<nav class="crumbs ui">
	<a href={resolve('/iching')}>I Ching</a>
	<span class="pager">
		<a href={resolve('/iching/[n]', { n: String(prev.n) })} aria-label="Esagramma precedente">‹ {prev.n}</a>
		<a href={resolve('/iching/[n]', { n: String(next.n) })} aria-label="Esagramma successivo">{next.n} ›</a>
	</span>
</nav>

<article class="hexagram">
	<header>
		<HexagramFigure lines={h.lines} width={96} label="Figura dell'esagramma {h.n}" />
		<div>
			<p class="muted ui">Esagramma {h.n}</p>
			<h1><span class="ja">{h.kanji}</span> {h.titoloCompleto}</h1>
			<p class="pinyin">
				{h.pinyin}
				{#if h.romanizzazione}<span class="muted ui">· {h.romanizzazione} nella trascrizione di Wilhelm</span>{/if}
			</p>
			<p class="ui trigrams">
				Sopra <span class="ja">{TRIGRAMS[h.upper].kanji}</span> {TRIGRAMS[h.upper].nome}, {TRIGRAMS[h.upper].immagine}
				<br />
				Sotto <span class="ja">{TRIGRAMS[h.lower].kanji}</span> {TRIGRAMS[h.lower].nome}, {TRIGRAMS[h.lower].immagine}
			</p>
		</div>
	</header>

	<section class="card calendar-role">
		<h2 class="ui">Nel calendario</h2>
		{#if role.sovereignMonth}
			<p>
				<strong>Esagramma sovrano</strong> del {lunarMonthLabel(role.sovereignMonth, false)} lunare.
				{#if upcoming?.sovereign}
					<span class="muted">Prossimo inizio:</span>
					<a href={calendarHref(upcoming.sovereign.start)}>{formatShortYear(upcoming.sovereign.start)}</a>.
				{/if}
			</p>
		{/if}
		{#if role.corner}
			<p>
				<strong>Esagramma angolare</strong> dell’{role.corner.stagione} ({role.corner.direzione}): ciascuna delle sue sei linee
				governa uno dei sei termini solari della stagione, a partire da
				<span class="ja">{SOLAR_TERMS[role.corner.fromLongitude / 15].kanji}</span>.
			</p>
		{/if}
		{#if role.pentads.length}
			<p class="muted ui">Guaqi 卦氣 <em>guàqì</em>, «soffi degli esagrammi» · pentadi governate:</p>
			<ul class="pentads">
				{#each role.pentads as p, i (p.longitude)}
					{@const t = SOLAR_TERMS[p.termIndex]}
					{@const when = upcoming?.pentads.find((c) => c.longitude === p.longitude)}
					{@const name = pentadName(p.longitude)}
					<li>
						<span class="ja">{name.kanji}</span> «{name.nome}»
						<span class="muted">
							· {p.pentad + 1}ª pentade di <span class="ja">{t.kanji}</span> {t.nome}
							· rango <span class="ja">{p.rank}</span> ({RANKS[p.rank]}){#if p.parte}, parte {p.parte}{/if}
						</span>
						{#if when}
							· <a href={calendarHref(when.day)}>{formatShortYear(when.day)}</a>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	{#if text}
		<div class="tabs ui" role="tablist" aria-label="Libro">
			<button role="tab" class="tab" aria-selected={tab === 'testo'} onclick={() => (tab = 'testo')}>Il testo</button>
			<button role="tab" class="tab" aria-selected={tab === 'commenti'} onclick={() => (tab = 'commenti')}>I commenti</button>
		</div>
		<section class="testo" role="tabpanel">
			<!-- HTML generato da scripts/import_iching.py: il contenuto del libro è escapato -->
			{@html tab === 'testo' ? text.testo : text.commenti}
		</section>
		{#if text.note.length}
			<section class="note ui">
				<h2 class="ui">Note</h2>
				{#each text.note as nota (nota.id)}
					<div class="nota" id={nota.id}>
						<span class="num">{nota.n}</span>
						<div>{@html nota.html}</div>
					</div>
				{/each}
			</section>
		{/if}
	{:else}
		<p class="muted placeholder">
			Testo non presente: eseguire <code>scripts/import_iching.py</code> (vedi README).
		</p>
	{/if}
</article>

<style>
	.crumbs {
		display: flex;
		justify-content: space-between;
		padding: 1rem 0;
	}

	.pager {
		display: flex;
		gap: 1rem;
	}

	.hexagram {
		max-width: 46rem;
	}

	header {
		display: flex;
		gap: 2rem;
		align-items: center;
		margin-bottom: 2rem;
		color: var(--text);
	}

	header p {
		margin: 0;
	}

	h1 {
		font-size: clamp(1.6rem, 1.35rem + 1.2vw, 2.2rem);
		margin: 0.2rem 0;
	}

	.pinyin {
		font-style: italic;
	}

	.trigrams {
		margin-top: 0.6rem !important;
		line-height: 1.6;
	}

	.calendar-role {
		padding: 1rem 1.25rem;
		margin-bottom: 2rem;
	}

	.calendar-role h2 {
		color: var(--text-faint);
		font-weight: 400;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-size: 0.72rem;
		margin-bottom: 0.7rem;
	}

	.calendar-role p:last-child {
		margin-bottom: 0;
	}

	.pentads {
		margin: 0;
		padding-left: 1.1rem;
	}

	.placeholder {
		font-style: italic;
	}

	.tabs {
		display: flex;
		gap: 1.5rem;
		border-bottom: 1px solid var(--card-border);
		margin-bottom: 1.5rem;
	}

	.tab {
		background: none;
		border: 0;
		border-bottom: 2px solid transparent;
		padding: 0.5rem 0;
		margin-bottom: -1px;
		cursor: pointer;
		color: var(--text);
	}

	.tab[aria-selected='true'] {
		color: var(--text-strong);
		border-bottom-color: var(--link);
	}

	.testo {
		font-size: clamp(1.02rem, 0.98rem + 0.2vw, 1.1rem);
		line-height: 1.75;
	}

	.testo :global(p) {
		margin: 0 0 1em;
	}

	.testo :global(.sezione) {
		margin: 2.4rem 0 1rem;
		font-size: 0.75rem;
		font-weight: 400;
		letter-spacing: 0.14em;
		color: var(--text-faint);
	}

	.testo :global(.sottotitolo) {
		margin: 1.8rem 0 0.6rem;
		font-size: 1rem;
		font-weight: 400;
		font-style: italic;
		color: var(--text-strong);
	}

	.testo :global(.etichetta) {
		margin: 1.8rem 0 0.4rem;
		color: var(--text-strong);
		font-weight: 700;
	}

	.testo :global(.verso) {
		margin: 0;
		padding-left: 1.5rem;
		color: var(--text-strong);
		font-style: italic;
	}

	.testo :global(.verso.fine) {
		margin-bottom: 1.2em;
	}

	.testo :global(.citazione) {
		padding-left: 1.5rem;
		border-left: 2px solid var(--card-border);
		color: var(--text-strong);
		font-style: italic;
	}

	.testo :global(.rif) {
		font-style: normal;
		font-size: 0.75rem;
		color: var(--text-faint);
		margin-right: 0.3rem;
	}

	.testo :global(.verso + .commento),
	.testo :global(.etichetta + .commento) {
		margin-top: 0.8rem;
	}

	:global(sup.nota) {
		font-size: 0.7em;
		line-height: 0;
		margin-left: 0.1em;
	}

	.note {
		margin-top: 3rem;
		padding-top: 1rem;
		border-top: 1px solid var(--card-border);
	}

	.note h2 {
		color: var(--text-faint);
		font-weight: 400;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-size: 0.72rem;
		margin-bottom: 0.8rem;
	}

	.nota {
		display: flex;
		gap: 0.6rem;
		margin-bottom: 0.6rem;
	}

	.nota .num {
		color: var(--text-faint);
		min-width: 1.4rem;
	}

	.nota :global(p) {
		margin: 0 0 0.4em;
	}

	.nota:target {
		background: var(--link-soft);
	}

	@media (max-width: 520px) {
		header {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}
	}
</style>
