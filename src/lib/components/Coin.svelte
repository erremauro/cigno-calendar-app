<script lang="ts">
	/**
	 * Moneta cinese con il foro quadrato.
	 * Faccia con l'iscrizione = testa (3, yang); faccia liscia = croce (2, yin).
	 */
	import type { CoinFace } from '../iching/oracle';

	let {
		face,
		size = 72,
		flipping = false,
		onclick,
		label
	}: { face: CoinFace; size?: number; flipping?: boolean; onclick?: () => void; label: string } = $props();

	// 開元通寶: l'iscrizione più comune sulle monete cinesi antiche (alto, basso, destra, sinistra)
	const CHARS = [
		{ c: '開', x: 50, y: 25 },
		{ c: '元', x: 50, y: 83 },
		{ c: '通', x: 79, y: 54 },
		{ c: '寶', x: 21, y: 54 }
	];
</script>

<button type="button" class="coin" class:flipping class:yang={face === 3} {onclick} aria-label={label} aria-pressed={face === 3}>
	<svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
		<circle cx="50" cy="50" r="47" class="disc" />
		<circle cx="50" cy="50" r="40" class="rim" />
		<rect x="38" y="38" width="24" height="24" class="hole-rim" />
		<rect x="41" y="41" width="18" height="18" class="hole" />
		{#if face === 3}
			{#each CHARS as ch (ch.c)}
				<text x={ch.x} y={ch.y} class="char">{ch.c}</text>
			{/each}
		{/if}
	</svg>
	<span class="caption ui">{face === 3 ? 'testa · 3' : 'croce · 2'}</span>
</button>

<style>
	.coin {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		gap: 0.35rem;
		padding: 0.3rem;
		background: none;
		border: 0;
		border-radius: var(--radius-md);
		cursor: pointer;
		color: var(--text);
		-webkit-tap-highlight-color: transparent;
	}

	.coin:focus-visible {
		outline: 2px solid var(--link);
		outline-offset: 2px;
	}

	svg {
		display: block;
		transition: transform 0.25s ease;
		filter: drop-shadow(0 2px 4px rgb(0 0 0 / 0.25));
	}

	.coin:active svg {
		transform: scale(0.94);
	}

	.disc {
		fill: color-mix(in srgb, var(--accent) 32%, var(--card));
		stroke: var(--accent);
		stroke-width: 2;
	}

	.yang .disc {
		fill: color-mix(in srgb, var(--accent) 55%, var(--card));
	}

	.rim {
		fill: none;
		stroke: color-mix(in srgb, var(--accent) 70%, transparent);
		stroke-width: 1.2;
	}

	.hole-rim {
		fill: none;
		stroke: color-mix(in srgb, var(--accent) 70%, transparent);
		stroke-width: 1.2;
	}

	.hole {
		fill: var(--bg);
	}

	.char {
		font-family: var(--font-mincho);
		font-size: 17px;
		font-weight: 600;
		fill: color-mix(in srgb, var(--accent) 35%, var(--bg));
		text-anchor: middle;
		dominant-baseline: middle;
	}

	.caption {
		font-size: 0.72rem;
		color: var(--text-faint);
	}

	.yang .caption {
		color: var(--text-strong);
	}

	.flipping svg {
		animation: flip 0.7s cubic-bezier(0.3, 0.7, 0.4, 1);
	}

	@keyframes flip {
		0% {
			transform: translateY(0) rotateX(0);
		}
		45% {
			transform: translateY(-18px) rotateX(540deg);
		}
		100% {
			transform: translateY(0) rotateX(1080deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.flipping svg {
			animation: none;
		}
	}
</style>
