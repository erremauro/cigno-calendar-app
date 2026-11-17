<script lang="ts">
	/**
	 * Una linea dell'oracolo: 6 yin mobile (×), 7 yang fisso, 8 yin fisso, 9 yang mobile (○).
	 */
	let { value, width = 56 }: { value: 6 | 7 | 8 | 9; width?: number } = $props();

	const W = 60;
	const H = 14;
	const y = 4;
	const h = 6;
	const half = 25;
	const yang = $derived(value === 7 || value === 9);
	const moving = $derived(value === 6 || value === 9);
</script>

<svg viewBox="0 0 {W} {H}" {width} height={(width * H) / W} aria-hidden="true" class:moving>
	{#if yang}
		<rect x="0" {y} width={W} height={h} fill="currentColor" />
	{:else}
		<rect x="0" {y} width={half} height={h} fill="currentColor" />
		<rect x={W - half} {y} width={half} height={h} fill="currentColor" />
	{/if}
	{#if value === 9}
		<circle cx={W / 2} cy={H / 2} r="5.2" fill="var(--card)" stroke="var(--accent)" stroke-width="1.8" />
	{:else if value === 6}
		<path d="M26 2.5 L34 11.5 M34 2.5 L26 11.5" stroke="var(--accent)" stroke-width="1.8" stroke-linecap="round" />
	{/if}
</svg>

<style>
	svg {
		display: block;
		color: var(--text-strong);
		overflow: visible;
	}
</style>
