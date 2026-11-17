<script lang="ts">
	/** Figura dell'esagramma: linee dal basso verso l'alto. `highlight` evidenzia una linea (1–6). */
	let {
		lines,
		width = 48,
		highlight,
		label
	}: { lines: number[]; width?: number; highlight?: number; label?: string } = $props();

	const lineH = 6;
	const gap = 5;
	// funziona anche con tre linee (trigrammi)
	const height = $derived(lines.length * lineH + (lines.length - 1) * gap);
	const W = 60;
	const half = (W - 10) / 2;
</script>

<svg
	viewBox="0 0 {W} {height}"
	width={width}
	height={(width * height) / W}
	role={label ? 'img' : undefined}
	aria-label={label}
	aria-hidden={label ? undefined : 'true'}
>
	{#each lines as line, i (i)}
		{@const y = (lines.length - 1 - i) * (lineH + gap)}
		{@const fill = highlight === i + 1 ? 'var(--link)' : 'currentColor'}
		{#if line === 1}
			<rect x="0" {y} width={W} height={lineH} {fill} />
		{:else}
			<rect x="0" {y} width={half} height={lineH} {fill} />
			<rect x={W - half} {y} width={half} height={lineH} {fill} />
		{/if}
	{/each}
</svg>
