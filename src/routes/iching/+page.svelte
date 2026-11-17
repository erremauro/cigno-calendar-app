<script lang="ts">
	import { resolve } from '$app/paths';
	import { HEXAGRAMS } from '#lib/iching/hexagrams.ts';
	import { calendarRole } from '#lib/iching/seasonal.ts';
	import HexagramFigure from '#lib/components/HexagramFigure.svelte';
</script>

<svelte:head>
	<title>I Ching · Calendario Cigno Zen</title>
</svelte:head>

<header class="head">
	<h1>I Ching <span class="ja">易經</span></h1>
	<p class="muted ui">
		I 64 esagrammi nella sequenza di re Wen. In oro i dodici sovrani, uno per mese lunare; in blu i quattro
		esagrammi angolari che governano le stagioni.
	</p>
	<a class="consult card" href={resolve('/iching/oracolo')}>
		<span class="consult-icon" aria-hidden="true">
			<HexagramFigure lines={[1, 0, 1, 1, 0, 0]} width={30} />
		</span>
		<span class="consult-text">
			<strong>Consulta l’oracolo</strong>
			<span class="ui muted">Lancia le monete o registra i tuoi lanci, e leggi la risposta</span>
		</span>
		<span class="consult-arrow" aria-hidden="true">→</span>
	</a>
	<a class="howto ui" href={resolve('/iching/consultazione')}>Come si consulta: monete, steli di millefoglie e lettura della risposta →</a>
</header>

<ol class="grid">
	{#each HEXAGRAMS as h (h.n)}
		{@const role = calendarRole(h)}
		<li>
			<a
				class="hex card"
				class:sovereign={role.sovereignMonth}
				class:corner={role.corner}
				href={resolve('/iching/[n]', { n: String(h.n) })}
			>
				<span class="n ui">{h.n}</span>
				<HexagramFigure lines={h.lines} width={52} />
				<span class="ja kanji">{h.kanji}</span>
				<span class="title ui">{h.titolo}</span>
			</a>
		</li>
	{/each}
</ol>

<style>
	.head {
		padding: 1rem 0 1.5rem;
		max-width: 46rem;
	}

	h1 {
		font-size: clamp(1.7rem, 1.4rem + 1.4vw, 2.4rem);
		margin-bottom: 0.5rem;
	}

	.consult {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-top: 1.2rem;
		padding: 0.9rem 1.1rem;
		color: var(--text);
		transition: border-color 0.15s;
	}

	.consult:hover {
		text-decoration: none;
		border-color: var(--link);
	}

	.consult-icon {
		flex: none;
		color: var(--accent);
	}

	.consult-text {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		line-height: 1.35;
	}

	.consult-text strong {
		color: var(--text-strong);
	}

	.howto {
		display: inline-block;
		margin-top: 0.6rem;
		font-size: 0.82rem;
	}

	.consult-arrow {
		margin-left: auto;
		font-size: 1.3rem;
		color: var(--link);
	}

	h1 .ja {
		font-size: 0.75em;
		color: var(--text);
		margin-left: 0.3rem;
	}

	.grid {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
		gap: 0.75rem;
	}

	.hex {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		height: 100%;
		padding: 1.2rem 0.6rem 0.9rem;
		color: var(--text);
		text-align: center;
		transition: border-color 0.15s;
	}

	.hex:hover {
		text-decoration: none;
		border-color: var(--link);
	}

	.hex.sovereign {
		border-top: 2px solid var(--accent);
	}

	.hex.corner {
		border-top: 2px solid var(--link);
	}

	.n {
		position: absolute;
		top: 0.4rem;
		left: 0.6rem;
		color: var(--text-faint);
		font-size: 0.72rem;
	}

	.kanji {
		font-size: 1.3rem;
		color: var(--text-strong);
		line-height: 1.2;
	}

	.title {
		line-height: 1.3;
		font-size: 0.78rem;
	}

	@media (max-width: 480px) {
		.grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
			gap: 0.4rem;
		}
		.hex {
			padding: 1rem 0.3rem 0.6rem;
			gap: 0.35rem;
		}
		.title {
			font-size: 0.68rem;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			line-clamp: 2;
			-webkit-box-orient: vertical;
			overflow: hidden;
		}
	}
</style>
