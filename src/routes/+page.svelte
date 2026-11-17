<script lang="ts">
	import { slide } from 'svelte/transition';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { monthView } from '#lib/calendar/day.ts';
	import { lunarMonthOf, nextLunarMonth, previousLunarMonth } from '#lib/calendar/lunisolar.ts';
	import { dayFromIso, isoFromDay, todayLocal, type DayNumber } from '#lib/calendar/time.ts';
	import { formatShort, formatRangeShort, isJulian, lunarMonthLabel, WEEKDAYS_SHORT } from '#lib/format.ts';
	import MoonIcon from '#lib/components/MoonIcon.svelte';
	import HexagramFigure from '#lib/components/HexagramFigure.svelte';
	import DayDetail from '#lib/components/DayDetail.svelte';
	import YearPicker from '#lib/components/YearPicker.svelte';
	import { calendarSystem } from '#lib/calendar/historical.ts';
	import { display, capitalize } from '#lib/display.svelte.ts';

	const today = todayLocal();
	let selected = $state<DayNumber>(dayFromIso(page.url.searchParams.get('d') ?? '') ?? today);

	const monthStart = $derived(lunarMonthOf(selected).startDay);
	const view = $derived(monthView(monthStart));
	const info = $derived(view.days.find((d) => d.day === selected)!);
	/** celle vuote prima del 1° giorno (settimana da lunedì) */
	const lead = $derived((view.days[0].weekday + 6) % 7);
	const lastDay = $derived(view.days[view.days.length - 1].day);

	/** Intestazione in stile giapponese o italiano: la scelta resta memorizzata sul dispositivo. */
	// italiano puro, oppure con i nomi giapponesi (interruttore nella barra in alto)
	const mixed = $derived(display.mixed);
	// anni storici: calendario in uso all'epoca e date giuliane prima del 1582
	const calendar = $derived(calendarSystem(view.month.year));
	const julian = $derived(isJulian(view.month.startDay));
	// avvisi chiusi, uno per calendario storico (memorizzati sul dispositivo)
	function loadDismissed(): string[] {
		try {
			return JSON.parse(localStorage.getItem('avvisi-calendario-chiusi') ?? '[]');
		} catch {
			return [];
		}
	}
	let dismissed = $state<string[]>(loadDismissed());
	function dismiss(key: string) {
		dismissed = [...dismissed, key];
		try {
			localStorage.setItem('avvisi-calendario-chiusi', JSON.stringify(dismissed));
		} catch {}
	}
	let yearPicker: YearPicker;

	function select(d: DayNumber) {
		selected = d;
		const url = d === today ? resolve('/') : `${resolve('/')}?d=${isoFromDay(d)}`;
		goto(url, { replace: true, shallow: true });
	}

	function shiftMonth(dir: 1 | -1) {
		const cur = lunarMonthOf(selected);
		const target = dir === 1 ? nextLunarMonth(cur) : previousLunarMonth(cur);
		const lunarDay = selected - cur.startDay;
		select(target.startDay + Math.min(lunarDay, target.length - 1));
	}

	/** Scorrimento laterale sulla griglia: mese precedente / successivo. */
	let touch: { x: number; y: number } | null = null;
	function touchStart(e: TouchEvent) {
		const t = e.touches[0];
		touch = e.touches.length === 1 ? { x: t.clientX, y: t.clientY } : null;
	}
	function touchEnd(e: TouchEvent) {
		if (!touch) return;
		const t = e.changedTouches[0];
		const dx = t.clientX - touch.x;
		const dy = t.clientY - touch.y;
		touch = null;
		if (Math.abs(dx) > 60 && Math.abs(dx) > 2 * Math.abs(dy)) shiftMonth(dx < 0 ? 1 : -1);
	}

	function onKey(e: KeyboardEvent) {
		if (e.metaKey || e.ctrlKey || e.altKey) return;
		if (document.querySelector('dialog[open]')) return; // un popup è aperto
		if (e.target instanceof HTMLElement && e.target.closest('input, textarea, select, summary')) return;
		const step = ({ ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 } as Record<string, number>)[e.key];
		if (step) {
			e.preventDefault();
			select(selected + step);
		} else if (e.key === 'PageUp') {
			e.preventDefault();
			shiftMonth(-1);
		} else if (e.key === 'PageDown') {
			e.preventDefault();
			shiftMonth(1);
		} else if (e.key === 't' || e.key === 'T') select(today);
	}
</script>

<svelte:window onkeydown={onKey} />

<div class="layout">
	<section class="calendar" aria-label="Mese lunare">
		<header class="month-head">
			<div class="title">
				<button class="year-btn ui" onclick={() => yearPicker.open()} aria-label="Anno {view.month.year}: scegli anno e mese">
					{view.month.year}
					<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
				</button>
				<p class="eyebrow year-line ui">
					{#if mixed}
						<span><span class="ja">{view.yearCycle.kanji}</span> <em>({capitalize(view.yearCycle.reading)})</em></span>
						<span class="sep" aria-hidden="true">·</span>
					{/if}
					<span>{view.yearCycle.animal} di {view.yearCycle.element}</span>
				</p>

				<h1 class="it-main">{lunarMonthLabel(view.month.month, view.month.leap)}</h1>

				<p class="it-name">
					{#if mixed}
						<span class="name-ja">
							<span class="ja">{view.month.leap ? '閏' : ''}{view.nameJa.kanji}</span>
							<span class="romaji">({view.month.leap ? 'Urū-' : ''}{view.nameJa.romaji})</span>
						</span>
						<span class="sep" aria-hidden="true">·</span>
					{/if}
					<span class="name-it">{capitalize(view.nameJa.significato)}</span>
				</p>
				<p class="sub length-line ui">
					{#if mixed}
						<span><span class="ja">{view.month.length === 30 ? '大' : '小'}</span> <em>({view.month.length === 30 ? 'Dai' : 'Shō'})</em></span>
						<span class="sep" aria-hidden="true">·</span>
					{/if}
					<span>{view.month.length === 30 ? 'mese lungo' : 'mese breve'}, {view.month.length} giorni</span>
					<span class="sep dates-sep" aria-hidden="true">·</span>
					<span class="dates">{formatRangeShort(view.month.startDay, lastDay)}</span>
				</p>
			</div>

			<div class="side-col">
				<a class="sovereign" href={resolve('/iching/[n]', { n: String(view.sovereign.n) })}>
					<HexagramFigure lines={view.sovereign.lines} width={40} label="Esagramma {view.sovereign.n}" />
					<span class="s-name">{#if mixed}<span class="ja">{view.sovereign.kanji}</span>{' '}{/if}{view.sovereign.titolo}</span>
					<span class="s-cap ui">esagramma del mese</span>
				</a>
			</div>
		</header>

		<YearPicker
			bind:this={yearPicker}
			year={view.month.year}
			currentMonthStart={view.month.startDay}
			todayMonthStart={lunarMonthOf(today).startDay}
			onselect={select}
		/>

		{#if view.nameJa.nota}
			<div class="note ui">
				<p>
					{view.nameJa.nota}
					{#if view.month.leap}
						È un mese intercalare, aggiunto per riallineare l’anno lunare alle stagioni: ripete il {view.month.month}° mese.
					{/if}
				</p>
				{#if calendar && !dismissed.includes(calendar.kanji)}
					<div class="historic-note" role="note" transition:slide={{ duration: 200 }}>
						<span class="hn-icon" aria-hidden="true">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2 20h20L12 3z" /><path d="M12 10v4" /><path d="M12 17.5v.01" /></svg>
						</span>
						<div class="hn-body">
							<p class="hn-title">
								Calendario storico{#if mixed}{' '}· <span class="ja">{calendar.kanji}</span> <em>({calendar.romaji})</em>{/if}
							</p>
							<p class="hn-text">
								I mesi sono quelli del {calendar.nome}, in uso in Giappone dal {calendar.from} al {calendar.to}{#if mixed}{' '}(era <span class="ja">{view.month.era}</span>, anno {view.month.eraYear}){/if}.
								{#if julian}Le date occidentali sono nel calendario giuliano.{/if}
							</p>
						</div>
						<button class="hn-close" onclick={() => dismiss(calendar.kanji)} aria-label="Chiudi l’avviso">×</button>
					</div>
				{/if}
			</div>
		{/if}

		<div class="controls">
			<button class="btn nav-btn" onclick={() => shiftMonth(-1)} aria-label="Mese lunare precedente">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
			</button>
			<button class="btn" onclick={() => select(today)} disabled={selected === today}>Oggi</button>
			<button class="btn nav-btn" onclick={() => shiftMonth(1)} aria-label="Mese lunare successivo">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
			</button>
		</div>

		<div class="weekdays" aria-hidden="true">
			{#each WEEKDAYS_SHORT as w (w)}
				<div class="wd ui">{w}</div>
			{/each}
		</div>
		<div class="days" role="group" aria-label="Giorni del mese" ontouchstart={touchStart} ontouchend={touchEnd}>
			{#each { length: lead } as _, i (i)}
				<div class="pad" aria-hidden="true"></div>
			{/each}
			{#each view.days as d (d.day)}
				{@const lunarObs = d.observances.filter((o) => o.kind !== 'gregoriana' && o.observance.categoria !== 'mensile')}
				{@const gregObs = d.observances.filter((o) => o.kind === 'gregoriana')}
				{@const monthly = d.observances.some((o) => o.observance.categoria === 'mensile')}
				<button
					class="cell"
					class:selected={d.day === selected}
					class:today={d.day === today}
					class:major={lunarObs.some((o) => o.observance.categoria === 'maggiore')}
					onclick={() => select(d.day)}
					aria-pressed={d.day === selected}
					aria-label="{d.lunar.day} del {lunarMonthLabel(d.lunar.month, d.lunar.leap)}, {formatShort(d.day)}{lunarObs.length ? ', ' + lunarObs.map((o) => o.observance.nome).join(', ') : ''}"
				>
					<span class="cell-top">
						<span class="lday">{d.lunar.day}</span>
						<MoonIcon angle={d.moon.angle} size={16} />
					</span>
					<span class="gday ui">{formatShort(d.day)}</span>
					<span class="marks">
						{#if d.solarTerm}
							{#if mixed}
								<span class="term ja" title={d.solarTerm.info.nome}>{d.solarTerm.info.kanji}</span>
							{:else}
								<span class="term term-it" title={d.solarTerm.info.nome}>
									<span class="term-name">{d.solarTerm.info.nome}</span>
									<span class="term-mark" aria-hidden="true">◆</span>
								</span>
							{/if}
						{/if}
						{#each lunarObs as o (o.observance.id)}
							<span class="obs-name">{o.observance.nome}</span>
						{/each}
						<span class="dots">
							{#if lunarObs.length}<span class="dot lunar"></span>{/if}
							{#if monthly}<span class="dot monthly"></span>{/if}
							{#each gregObs as o (o.observance.id)}
								<span class="dot greg"></span>
							{/each}
						</span>
					</span>
				</button>
			{/each}
		</div>

	</section>

	<aside class="side">
		{#if info}
			<DayDetail {info} {view} />
		{/if}
	</aside>

	<p class="legend ui muted">
		<span><span class="dot lunar"></span> ricorrenza (data lunare)</span>
		<span><span class="dot greg"></span> ricorrenza alla data gregoriana</span>
		<span><span class="dot monthly"></span> cerimonia mensile</span>
		<span class="keys">Tastiera: frecce per i giorni, PagSu/PagGiù per i mesi, T per oggi</span>
		<span class="swipe">Scorri la griglia a destra o a sinistra per cambiare mese</span>
	</p>
</div>

<style>
	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 360px;
		grid-template-areas:
			'cal side'
			'legend side';
		grid-template-rows: auto 1fr;
		gap: 1rem 2rem;
		align-items: start;
		padding-top: 1rem;
	}

	.calendar {
		grid-area: cal;
	}

	.legend {
		grid-area: legend;
	}

	.days {
		touch-action: pan-y;
	}

	.month-head {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
	}

	.title {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.15rem;
		min-width: 0;
	}

	.title p {
		margin: 0;
	}


	/* colonna destra: lingua e esagramma del mese */
	.side-col {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.6rem;
		flex: none;
		width: 6.5rem;
	}

	.s-name {
		font-size: 0.78rem;
		line-height: 1.25;
		color: var(--text-strong);
		text-align: center;
	}

	.s-cap {
		font-size: 0.66rem;
		line-height: 1.2;
		color: var(--text-faint);
		text-align: center;
	}

	.eyebrow {
		color: var(--text-faint);
		line-height: 1.45;
	}

	/* l'anno apre «Vai a…» */
	.year-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		margin: 0 0 0 -0.45rem;
		padding: 0.1rem 0.45rem;
		border: 1px solid transparent;
		border-radius: var(--radius-full);
		background: none;
		color: var(--text-strong);
		font-weight: 700;
		cursor: pointer;
		transition:
			border-color 0.15s,
			background 0.15s;
	}

	.year-btn:hover {
		border-color: var(--btn-border);
		background: var(--btn-bg);
	}

	.year-btn svg {
		color: var(--link);
	}










	.it-main {
		font-size: clamp(1.6rem, 1.3rem + 1.4vw, 2.4rem);
		font-weight: 700;
		line-height: 1.2;
		color: var(--text-strong);
	}

	/* 神無月 (Kannazuki) · Mese degli dèi — su telefono l'italiano va sotto */
	.it-name {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0 0.5rem;
		font-size: 1.2rem;
		color: var(--text-strong);
		line-height: 1.35;
	}

	.name-ja .ja {
		font-size: 1.15em;
	}

	.romaji {
		font-size: 0.85em;
		font-style: italic;
		color: var(--text);
	}

	.sep {
		color: var(--text-faint);
	}

	.name-it {
		font-style: italic;
	}

	.length-line {
		display: flex;
		flex-wrap: wrap;
		gap: 0 0.4rem;
	}

	.year-line {
		display: flex;
		flex-wrap: wrap;
		gap: 0 0.4rem;
	}

	@media (max-width: 640px) {
		.it-name,
		.year-line {
			flex-direction: column;
			gap: 0;
		}
		.it-name .sep,
		.year-line .sep,
		.length-line .dates-sep {
			display: none;
		}
		/* su telefono le date vanno a capo */
		.length-line .dates {
			flex-basis: 100%;
		}
	}

	/* nota sulla tradizione, separata da una riga */
	.note {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid var(--card-border);
		color: var(--text);
		line-height: 1.5;
	}

	.note p {
		margin: 0;
		max-width: 38rem;
	}

	/* avviso per gli anni storici: a tutta larghezza, si può chiudere */
	.note .historic-note {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: start;
		gap: 0.85rem;
		margin-top: 0.9rem;
		padding: 0.85rem 0.75rem 0.85rem 0.9rem;
		border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
		border-left: 4px solid var(--accent);
		border-radius: var(--radius-md);
		background: color-mix(in srgb, var(--accent) 10%, var(--card));
		color: var(--text-strong);
	}

	.hn-icon {
		display: grid;
		place-items: center;
		width: 2.1rem;
		height: 2.1rem;
		border-radius: 50%;
		background: color-mix(in srgb, var(--accent) 22%, transparent);
		color: var(--accent);
	}

	.hn-body p {
		margin: 0;
		max-width: none;
	}

	.hn-title {
		font-weight: 700;
		letter-spacing: 0.01em;
		line-height: 1.4;
	}

	.hn-text {
		margin-top: 0.15rem !important;
		line-height: 1.5;
		color: var(--text);
	}

	.hn-close {
		display: grid;
		place-items: center;
		width: 2rem;
		height: 2rem;
		margin: -0.3rem -0.2rem 0 0;
		padding: 0;
		border: 0;
		border-radius: var(--radius-full);
		background: none;
		color: var(--text);
		font-size: 1.35rem;
		line-height: 1;
		cursor: pointer;
	}

	.hn-close:hover {
		background: color-mix(in srgb, var(--accent) 18%, transparent);
		color: var(--text-strong);
	}

	.sub {
		color: var(--text-faint);
		font-size: var(--fs-ui);
		line-height: 1.45;
	}



	.sovereign {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3rem;
		width: 100%;
		color: var(--text);
		padding: 0.4rem 0.3rem;
		border-radius: var(--radius-md);
	}

	.sovereign:hover {
		text-decoration: none;
		color: var(--link);
		background: var(--link-soft);
	}

	.controls {
		display: flex;
		gap: 0.5rem;
		margin: 1.2rem 0 0.8rem;
	}

	.controls .btn:disabled {
		opacity: 0.45;
		cursor: default;
	}

	/* frecce dei mesi più evidenti */
	.nav-btn {
		min-width: 2.75rem;
		min-height: 2.5rem;
		padding: 0;
		color: var(--text-strong);
		border-color: var(--text-faint);
	}

	.nav-btn:hover {
		color: var(--link);
		border-color: var(--link);
	}

	.weekdays,
	.days {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
		gap: 6px;
	}

	/* tutte le righe alte come la più alta: caselle uniformi */
	.days {
		grid-auto-rows: 1fr;
	}

	.wd {
		text-align: center;
		color: var(--text-faint);
		padding-bottom: 0.3rem;
		text-transform: uppercase;
		font-size: 0.7rem;
		letter-spacing: 0.06em;
	}


	.cell {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 0.1rem;
		min-height: 6.4rem;
		padding: 0.45rem 0.5rem;
		text-align: left;
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition:
			border-color 0.15s,
			background 0.15s;
	}

	.cell:hover {
		border-color: var(--link);
	}

	.cell.major {
		border-top: 2px solid var(--accent);
	}

	.cell.selected {
		border-color: var(--link);
		background: var(--link-soft);
		box-shadow: inset 0 0 0 1px var(--link);
	}

	.cell.today .lday {
		color: var(--bg);
		background: var(--link);
		border-radius: var(--radius-full);
		padding: 0 0.45rem;
	}

	.cell-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.lday {
		font-size: 1.15rem;
		font-weight: 700;
		color: var(--text-strong);
		line-height: 1.5;
	}



	.gday {
		color: var(--text-faint);
		font-size: 0.72rem;
		line-height: 1.2;
	}

	.marks {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		margin-top: auto;
		font-size: 0.7rem;
		line-height: 1.25;
	}

	/* termine solare in italiano: nome su desktop, segno ◆ su telefono */
	.term-it {
		font-family: var(--font-body);
	}

	.term-it .term-name {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		font-size: 0.68rem;
		line-height: 1.2;
	}

	.term-mark {
		display: none;
		font-size: 0.6rem;
	}

	.term {
		color: var(--link);
		font-size: 0.8rem;
	}

	.obs-name {
		color: var(--text-strong);
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.dots {
		display: flex;
		gap: 4px;
		min-height: 7px;
		align-items: center;
	}

	.dot {
		display: inline-block;
		width: 7px;
		height: 7px;
		border-radius: 50%;
		flex: none;
	}

	.dot.lunar {
		background: var(--accent);
	}

	.dot.monthly {
		background: var(--text-faint);
		width: 5px;
		height: 5px;
	}

	.dot.greg {
		border: 1px dashed var(--accent);
	}

	.cell:has(.obs-name) .dot.lunar {
		display: none;
	}

	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem 1.2rem;
		margin: 0;
		font-size: 0.75rem;
	}

	.legend span {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}

	.side {
		grid-area: side;
		position: sticky;
		top: 1rem;
	}

	.legend .swipe {
		display: none;
	}

	@media (hover: none) {
		.legend .keys {
			display: none;
		}
		.legend .swipe {
			display: inline-flex;
		}
	}

	@media (max-width: 960px) {
		.layout {
			grid-template-columns: 1fr;
			grid-template-areas: 'cal' 'side' 'legend';
			grid-template-rows: auto;
			gap: 1.25rem;
		}
		.side {
			position: static;
		}
	}

	@media (max-width: 640px) {
		.weekdays,
		.days {
			gap: 3px;
		}
		/* Su telefono ogni casella ha gli stessi spazi fissi:
		   numero · luna · riga del termine solare · riga dei pallini */
		.days {
			grid-auto-rows: 5rem;
		}
		.cell {
			min-height: 0;
			height: 100%;
			padding: 0.3rem 0.2rem;
			align-items: center;
			justify-content: flex-start;
		}
		.cell-top {
			flex-direction: column;
			gap: 0.1rem;
		}
		.gday,
		.obs-name,
		.term-it .term-name {
			display: none;
		}
		.term-mark {
			display: inline;
		}
		.cell:has(.obs-name) .dot.lunar {
			display: inline-block;
		}
		.lday {
			font-size: 1rem;
		}
		.cell.today .lday {
			padding: 0 0.3rem;
		}
		.marks {
			display: grid;
			grid-template-rows: 1.05rem 7px;
			justify-items: center;
			align-items: center;
			gap: 0.1rem;
			width: 100%;
		}
		.marks .term {
			grid-row: 1;
			line-height: 1.05rem;
			white-space: nowrap;
		}
		.marks .dots {
			grid-row: 2;
			height: 7px;
			min-height: 0;
			justify-content: center;
		}
	}
</style>
