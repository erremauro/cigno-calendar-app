<script lang="ts">
	import { resolve } from '$app/paths';
	import type { DayInfo, MonthView } from '../calendar/day';
	import { SOLAR_TERMS, termAt } from '../calendar/solarTerms';
	import { pentadName } from '../calendar/pentads';
	import { RANKS, RANK_ROMAJI } from '../iching/seasonal';
	import { formatLong, formatTime, formatShort, formatRangeShort, isJulian, lunarMonthLabel } from '../format';
	import MoonIcon from './MoonIcon.svelte';
	import HexagramFigure from './HexagramFigure.svelte';
	import JaName from './JaName.svelte';
	import { display, capitalize } from '../display.svelte';
	import InfoDialog from './InfoDialog.svelte';
	import { loadText } from '../iching/text';

	let { info, view }: { info: DayInfo; view: MonthView } = $props();

	const term = $derived(SOLAR_TERMS[info.guaqi.pentad.termIndex]);
	const termRange = $derived(termAt(info.day));
	const pentad = $derived(pentadName(info.guaqi.pentad.longitude));
	const mixed = $derived(display.mixed);
	// animali femminili, per «Giorno della Capra» / «Giorno del Topo»
	const FEMININE = new Set(['Tigre', 'Capra', 'Scimmia']);
	const KIND_LABEL = { lunare: 'data lunare', gregoriana: 'data gregoriana in uso', astronomica: 'data astronomica' };
</script>

<article class="detail card" aria-live="polite">
	<header>
		<p class="lunar-day">
			<span class="num">{info.lunar.day}</span>
			<span class="of">
				{lunarMonthLabel(info.lunar.month, info.lunar.leap)}
			</span>
		</p>
		<p class="greg">{formatLong(info.day)}{#if isJulian(info.day)}{' '}<span class="ui muted">· calendario giuliano</span>{/if}</p>
		<p class="cycle ui">
			{#if mixed}
				Giorno <span class="ja">{info.sexagenary.kanji}</span> <em>({capitalize(info.sexagenary.reading)})</em>
				· {info.sexagenary.animal} di {info.sexagenary.element}
			{:else}
				Giorno {FEMININE.has(info.sexagenary.animal) ? 'della' : 'del'} {info.sexagenary.animal} di {info.sexagenary.element}
			{/if}
		</p>
	</header>

	{#if info.observances.length}
		<section>
			<h3 class="ui">Ricorrenze</h3>
			<ul class="obs">
				{#each info.observances as o (o.observance.id + o.kind + o.giorno)}
					<li class="obs-item {o.kind} {o.observance.categoria}">
						<div class="obs-title">
							<JaName kanji={o.observance.kanji} romaji={o.observance.romaji} it={o.observance.nome} />
							{#if o.durata > 1}<span class="muted ui">· giorno {o.giorno} di {o.durata}</span>{/if}
						</div>
						<div class="obs-meta ui">
							<span class="tag">{KIND_LABEL[o.kind]}</span>
						</div>
						{#if o.kind !== 'gregoriana' || !o.observance.lunare}
							<p class="obs-desc ui">{o.observance.descrizione}</p>
						{/if}
						{#if o.observance.verificare}
							<p class="obs-warn ui">Da verificare: {o.observance.verificare}</p>
						{/if}
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	<section class="moon">
		<h3 class="ui">Luna</h3>
		<div class="moon-row">
			<MoonIcon angle={info.moon.angle} size={56} label={info.moon.nome} />
			<div>
				<div>{info.moon.nome}</div>
				<div class="muted ui">
					illuminata al {Math.round(info.moon.illumination * 100)}% · {info.moon.waxing ? 'crescente' : 'calante'}
				</div>
				{#if info.quarter}
					<div class="quarter ui">
						<div class="quarter-time">{info.quarter.nome} alle {formatTime(info.quarter.time)}</div>
						{#if mixed}
							<div class="muted">
								<JaName kanji={info.quarter.kanji} romaji={info.quarter.romaji} it="«{info.quarter.significato}»" />
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</section>

	<section>
		<h3 class="ui">Stagione</h3>
		<div class="season">
			<div>
				<div class="season-name"><JaName kanji={term.kanji} romaji={term.romaji} it={term.nome} /></div>
				<div class="muted ui">termine solare · {formatRangeShort(termRange.startDay, termRange.endDay - 1)}</div>
			</div>
		</div>
		<div class="season">
			<div>
				<div class="season-name"><JaName kanji={pentad.kanji} romaji={pentad.romaji} it={pentad.nome} /></div>
				<div class="muted ui">
					{info.guaqi.pentad.pentad + 1}ª pentade · {formatRangeShort(info.guaqi.pentad.startDay, info.guaqi.pentad.endDay - 1)}
				</div>
			</div>
		</div>
		{#if info.solarTerm}
			<p class="ui muted today-term">
				Oggi alle {formatTime(info.solarTerm.time)} il Sole raggiunge {info.solarTerm.index * 15}° di longitudine:
				comincia {#if mixed}<span class="ja">{info.solarTerm.info.kanji}</span>{:else}«{info.solarTerm.info.nome}»{/if}.
			</p>
		{/if}
		<InfoDialog label="Cosa sono termini solari e pentadi?" title="Termini solari e pentadi">
			<p>
				Accanto ai mesi lunari, il calendario tradizionale segue il Sole. I <strong>termini solari</strong>
				(<span class="ja">二十四節気</span> <em>nijūshi sekki</em>) dividono l’anno in 24 periodi di circa 15 giorni:
				ne inizia uno ogni volta che il Sole avanza di 15° lungo l’eclittica, e ognuno prende il nome da un fenomeno
				della stagione. Le stagioni cominciano a metà strada tra solstizi ed equinozi: l’inverno con
				<span class="ja">立冬</span> <em>rittō</em>, ai primi di novembre.
			</p>
			<p>
				Ogni termine si divide in tre <strong>pentadi</strong> (<span class="ja">七十二候</span> <em>shichijūni kō</em>)
				di circa 5 giorni, 72 in tutto, con nomi tratti da piccoli segni della natura. Qui si usano i nomi della
				versione giapponese del 1874. Nel sistema guaqi ogni pentade è governata da un esagramma.
			</p>
		</InfoDialog>
	</section>

	<section>
		<h3 class="ui">I Ching</h3>
		<a class="hex" href={resolve('/iching/[n]', { n: String(view.sovereign.n) })}>
			<HexagramFigure lines={view.sovereign.lines} width={40} />
			<span>
				{#if mixed}<span class="ja">{view.sovereign.kanji}</span>{/if}
				{view.sovereign.n}. {view.sovereign.titolo}
				<span class="muted ui block">esagramma sovrano del {lunarMonthLabel(info.lunar.month, false)}</span>
			</span>
		</a>
		{#await loadText(view.sovereign.n) then t}
			{#if t}
				<blockquote class="oracle">
					<span class="ui muted label">L’immagine</span>
					{#each t.immagine as verso, i (i)}<span>{verso}</span>{/each}
				</blockquote>
			{/if}
		{/await}
	</section>

	<section class="guaqi">
		<h3 class="ui">Guaqi{#if mixed}{' '}<span class="ja">卦氣</span>{/if}</h3>
		<a class="hex" href={resolve('/iching/[n]', { n: String(info.guaqi.hexagram.n) })}>
			<HexagramFigure lines={info.guaqi.hexagram.lines} width={32} />
			<span>
				{#if mixed}<span class="ja">{info.guaqi.hexagram.kanji}</span>{/if}
				{info.guaqi.hexagram.n}. {info.guaqi.hexagram.titolo}
				<span class="muted ui block">
					esagramma della pentade · rango <JaName kanji={info.guaqi.rank} romaji={RANK_ROMAJI[info.guaqi.rank]} it={RANKS[info.guaqi.rank]} />{#if info.guaqi.parte}, parte {info.guaqi.parte}{/if}
					· dal {formatShort(info.guaqi.pentad.startDay)} al {formatShort(info.guaqi.pentad.endDay - 1)}
				</span>
			</span>
		</a>
		<a class="hex" href={resolve('/iching/[n]', { n: String(info.guaqi.corner.hexagram.n) })}>
			<HexagramFigure lines={info.guaqi.corner.hexagram.lines} width={32} highlight={info.guaqi.corner.line} />
			<span>
				{#if mixed}<span class="ja">{info.guaqi.corner.hexagram.kanji}</span>{/if}
				{info.guaqi.corner.hexagram.n}. {info.guaqi.corner.hexagram.titolo}
				<span class="muted ui block">
					esagramma angolare dell’{info.guaqi.corner.stagione} ({info.guaqi.corner.direzione}) · la {info.guaqi.corner.line}ª linea governa
					{#if mixed}<span class="ja">{term.kanji}</span>{:else}«{term.nome}»{/if}
				</span>
			</span>
		</a>
		{#await loadText(info.guaqi.corner.hexagram.n) then t}
			{@const line = t?.linee[info.guaqi.corner.line - 1]}
			{#if line}
				<blockquote class="oracle small">
					<span class="ui muted">{line.etichetta}:</span>
					{#each line.testo as verso, i (i)}<span>{verso}</span>{/each}
				</blockquote>
			{/if}
		{/await}
		<InfoDialog label="Cos’è il guaqi?" title="Il guaqi 卦氣">
			<p>
				Il <strong>guaqi</strong> (<span class="ja">卦氣</span> <em>guàqì</em>, «soffi degli esagrammi») è un sistema
				della dinastia Han, attribuito a Meng Xi e Jing Fang, che distribuisce i 64 esagrammi sull’anno solare.
			</p>
			<p>
				Sessanta esagrammi governano le 72 pentadi, cinque per ogni mese, con ranghi che vanno dal duca
				(<span class="ja">公</span>) al sovrano (<span class="ja">辟</span>); l’esagramma del principe
				(<span class="ja">侯</span>) copre due pentadi. I dodici sovrani sono gli stessi esagrammi dei mesi lunari.
			</p>
			<p>
				I quattro esagrammi rimanenti, <span class="ja">坎</span> <span class="ja">震</span>
				<span class="ja">離</span> <span class="ja">兌</span>, governano le quattro stagioni: ciascuna delle loro
				ventiquattro linee governa uno dei termini solari.
			</p>
		</InfoDialog>
	</section>
</article>

<style>
	.detail {
		padding: 1.25rem 1.25rem 0.5rem;
		box-shadow: var(--shadow);
	}

	header {
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--card-border);
	}

	header p {
		margin: 0;
	}

	.lunar-day {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
		color: var(--text-strong);
	}

	.num {
		font-size: 2.6rem;
		line-height: 1;
		font-weight: 700;
	}

	.of {
		font-size: 1.05rem;
	}


	.greg {
		margin-top: 0.35rem !important;
	}

	.greg::first-letter {
		text-transform: uppercase;
	}

	.cycle {
		color: var(--text-faint);
	}

	section {
		padding: 1rem 0;
		border-bottom: 1px solid var(--card-border);
	}

	section:last-child {
		border-bottom: 0;
	}


	h3 {
		color: var(--text-faint);
		font-weight: 400;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-size: 0.72rem;
		margin-bottom: 0.6rem;
	}

	.obs {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.85rem;
	}

	.obs-item {
		padding-left: 0.75rem;
		border-left: 2px solid var(--link);
	}

	.obs-item.maggiore {
		border-left-color: var(--accent);
	}

	.obs-item.gregoriana {
		border-left-style: dashed;
		opacity: 0.8;
	}

	.obs-title {
		color: var(--text-strong);
	}


	.obs-meta {
		display: flex;
		gap: 0.6rem;
		flex-wrap: wrap;
		align-items: center;
	}

	.tag {
		font-size: 0.7rem;
		padding: 0 0.5rem;
		border: 1px solid var(--card-border);
		border-radius: var(--radius-full);
	}

	.obs-desc {
		margin: 0.25rem 0 0;
	}

	.obs-warn {
		margin: 0.25rem 0 0;
		color: var(--accent);
	}

	.moon-row {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.quarter {
		margin-top: 0.5rem;
		line-height: 1.4;
	}


	.quarter-time {
		color: var(--text-strong);
	}

	/* kanji con hiragana sopra, testo italiano sotto: stessa disposizione per ogni giorno */
	.season {
		margin-bottom: 0.8rem;
	}

	.season-name {
		color: var(--text-strong);
	}



	.today-term {
		margin: 0 0 0.6rem;
	}

	.big {
		flex: none;
		white-space: nowrap;
		font-size: 1.4rem;
		color: var(--text-strong);
	}

	.hex {
		display: flex;
		align-items: center;
		gap: 0.85rem;
		color: var(--text-strong);
		padding: 0.4rem 0;
	}

	.hex:hover {
		text-decoration: none;
	}

	.hex:hover > span:last-child {
		color: var(--link);
	}

	.hex :global(svg) {
		flex: none;
		color: var(--text);
	}

	.block {
		display: block;
	}

	.oracle {
		margin: 0.3rem 0 0.6rem;
		padding-left: 0.9rem;
		border-left: 2px solid var(--card-border);
		font-style: italic;
		color: var(--text-strong);
		line-height: 1.55;
	}

	.oracle span {
		display: block;
	}

	.oracle.small {
		font-size: 0.9rem;
	}

	.oracle .ui {
		font-style: normal;
	}

	.oracle .label {
		font-size: 0.72rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		margin-bottom: 0.15rem;
	}
</style>
