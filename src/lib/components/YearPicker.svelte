<script lang="ts">
	/**
	 * «Vai a…»: si sceglie l'anno lunare e uno dei suoi mesi, oppure un giorno qualsiasi.
	 */
	import { monthsOfLunarYear, FIRST_YEAR } from '../calendar/lunisolar';
	import { calendarSystem } from '../calendar/historical';
	import { yearSexagenary, MONTH_NAMES_JA } from '../calendar/sexagenary';
	import { dayFromCivil, type DayNumber } from '../calendar/time';
	import { formatShort } from '../format';
	import { display, capitalize } from '../display.svelte';

	let {
		year,
		currentMonthStart,
		todayMonthStart,
		onselect
	}: {
		year: number;
		currentMonthStart: DayNumber;
		todayMonthStart: DayNumber;
		onselect: (day: DayNumber) => void;
	} = $props();

	const MIN = FIRST_YEAR;
	const MAX = 2199;

	let dialog: HTMLDialogElement;
	// anno mostrato nel pannello: parte da quello del calendario ogni volta che si apre
	let shown = $state(1901);
	let dateValue = $state('');

	const months = $derived(monthsOfLunarYear(shown));
	const cycle = $derived(yearSexagenary(shown));
	const calendar = $derived(calendarSystem(shown));

	export function open() {
		shown = year;
		dateValue = '';
		dialog.showModal();
	}

	function pick(day: DayNumber) {
		dialog.close();
		onselect(day);
	}

	// la data scritta si intende come la scriverebbe una fonte dell'epoca: giuliana prima del 1582
	function goToDate() {
		const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);
		if (!m) return;
		const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
		if (y < MIN || y > MAX) return;
		pick(dayFromCivil(y, mo, d));
	}

	function onDialogClick(e: MouseEvent) {
		if (e.target === dialog) dialog.close();
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog bind:this={dialog} onclick={onDialogClick} aria-labelledby="year-picker-title">
	<div class="body">
		<header>
			<button class="nav" onclick={() => (shown = Math.max(MIN, shown - 1))} disabled={shown <= MIN} aria-label="Anno precedente">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
			</button>
			<div class="year-title" id="year-picker-title">
				<span class="y">{shown}</span>
				<span class="ui muted">
					{#if display.mixed}<span class="ja">{cycle.kanji}</span> <em>({capitalize(cycle.reading)})</em> ·{' '}{/if}{cycle.animal} di {cycle.element}
				</span>
				{#if calendar}
					<span class="ui historic">
						{#if display.mixed}<span class="ja">{calendar.kanji}</span> · {/if}{capitalize(calendar.nome)}{#if shown < 1583}{' '}· date giuliane{/if}
					</span>
				{/if}
			</div>
			<button class="nav" onclick={() => (shown = Math.min(MAX, shown + 1))} disabled={shown >= MAX} aria-label="Anno successivo">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
			</button>
			<button class="close" onclick={() => dialog.close()} aria-label="Chiudi">×</button>
		</header>

		<div class="months">
			{#each months as m (m.startDay)}
				<button
					class="month"
					class:current={m.startDay === currentMonthStart}
					class:leap={m.leap}
					onclick={() => pick(m.startDay)}
				>
					<span class="m-num">{m.month}°{#if m.leap}{' '}<span class="ui">int.</span>{/if}</span>
					<span class="m-name ui">
						{#if display.mixed}<span class="ja">{m.leap ? '閏' : ''}{MONTH_NAMES_JA[m.month - 1].kanji}</span>{:else}{capitalize(MONTH_NAMES_JA[m.month - 1].significato)}{/if}
					</span>
					<span class="m-date ui">{formatShort(m.startDay)}</span>
					{#if m.startDay === todayMonthStart}<span class="today-dot" title="Mese di oggi"></span>{/if}
				</button>
			{/each}
		</div>

		<p class="hint ui muted">
			L’anno lunare comincia con il capodanno, tra fine gennaio e febbraio: i mesi 11° e 12° cadono in genere a cavallo
			del nuovo anno. Fino al 1872 i mesi sono quelli dei calendari storici giapponesi (fonte: 国立天文台); prima del
			1582 le date sono nel calendario giuliano.
		</p>

		<footer class="ui">
			<button class="btn" onclick={() => pick(todayMonthStart)}>Mese di oggi</button>
			<form
				class="go-date"
				onsubmit={(e) => {
					e.preventDefault();
					goToDate();
				}}
			>
				<label for="go-date-input">Vai al giorno</label>
				<input id="go-date-input" type="date" bind:value={dateValue} min="0862-01-01" max="2199-12-31" />
				<button class="btn" type="submit" disabled={!dateValue}>Vai</button>
			</form>
		</footer>
	</div>
</dialog>

<style>
	dialog {
		width: min(32rem, calc(100vw - 1.5rem));
		max-height: calc(100dvh - 2rem);
		padding: 0;
		border: 1px solid var(--card-border);
		border-radius: var(--radius-md);
		background: var(--card);
		color: var(--text);
		box-shadow: 0 10px 40px rgb(0 0 0 / 0.35);
	}

	dialog::backdrop {
		background: rgb(0 0 0 / 0.55);
	}

	.body {
		padding: 1rem 1rem 1.1rem;
	}

	header {
		display: grid;
		grid-template-columns: auto 1fr auto auto;
		align-items: center;
		gap: 0.4rem;
		margin-bottom: 0.9rem;
	}

	.year-title {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		line-height: 1.25;
	}

	.historic {
		font-size: 0.72rem;
		color: var(--text-faint);
	}

	.y {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--text-strong);
	}

	.nav,
	.close {
		display: grid;
		place-items: center;
		width: 2.4rem;
		height: 2.4rem;
		padding: 0;
		border: 1px solid var(--btn-border);
		border-radius: var(--radius-full);
		background: var(--btn-bg);
		color: var(--text-strong);
		cursor: pointer;
	}

	.nav:disabled {
		opacity: 0.35;
		cursor: default;
	}

	.close {
		border-color: transparent;
		background: none;
		font-size: 1.5rem;
		color: var(--text);
	}

	.months {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 6px;
	}

	.month {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.1rem;
		min-height: 4.4rem;
		padding: 0.45rem 0.5rem;
		text-align: left;
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		border-radius: var(--radius-md);
		color: var(--text);
		cursor: pointer;
		transition: border-color 0.15s;
	}

	.month:hover {
		border-color: var(--link);
	}

	.month.current {
		border-color: var(--link);
		background: var(--link-soft);
		box-shadow: inset 0 0 0 1px var(--link);
	}

	.month.leap {
		border-style: dashed;
	}

	.m-num {
		font-weight: 700;
		color: var(--text-strong);
		line-height: 1.2;
	}

	.m-num .ui {
		font-weight: 400;
		font-size: 0.7rem;
	}

	.m-name {
		font-size: 0.68rem;
		line-height: 1.2;
		color: var(--text);
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.m-date {
		margin-top: auto;
		font-size: 0.68rem;
		color: var(--text-faint);
	}

	.today-dot {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--link);
	}

	.hint {
		margin: 0.8rem 0 0.9rem;
		font-size: 0.72rem;
		line-height: 1.45;
	}

	footer {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.6rem;
		padding-top: 0.8rem;
		border-top: 1px solid var(--card-border);
	}

	.go-date {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.4rem;
	}

	.go-date label {
		font-size: 0.8rem;
	}

	.go-date input {
		min-height: 2.25rem;
		padding: 0 0.5rem;
		font: inherit;
		font-size: 0.85rem;
		color: var(--text-strong);
		background: var(--bg);
		border: 1px solid var(--btn-border);
		border-radius: var(--radius-sm);
	}

	.btn:disabled {
		opacity: 0.45;
		cursor: default;
	}

	@media (max-width: 420px) {
		.months {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}
</style>
