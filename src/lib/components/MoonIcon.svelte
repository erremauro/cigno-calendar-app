<script lang="ts">
	/**
	 * Disco lunare disegnato dall'angolo di fase (0 = nuova, 180 = piena),
	 * come appare dall'emisfero nord: crescente illuminata a destra.
	 */
	let { angle, size = 20, label }: { angle: number; size?: number; label?: string } = $props();

	const R = 10;
	const path = $derived.by(() => {
		const a = ((angle % 360) + 360) % 360;
		const rx = Math.abs(Math.cos((a * Math.PI) / 180)) * R;
		const waxing = a < 180;
		const crescent = a < 90 || a > 270;
		const outerSweep = waxing ? 1 : 0;
		const termSweep = waxing ? (crescent ? 0 : 1) : crescent ? 1 : 0;
		return `M 0 ${-R} A ${R} ${R} 0 0 ${outerSweep} 0 ${R} A ${rx} ${R} 0 0 ${termSweep} 0 ${-R} Z`;
	});
</script>

<svg
	width={size}
	height={size}
	viewBox="-11 -11 22 22"
	role={label ? 'img' : undefined}
	aria-label={label}
	aria-hidden={label ? undefined : 'true'}
>
	<circle r={R} fill="var(--moon-dark)" />
	<path d={path} fill="var(--moon-lit)" />
	<circle r={R} fill="none" stroke="var(--moon-dark)" stroke-width="0.6" />
</svg>
