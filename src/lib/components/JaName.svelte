<script lang="ts">
	/**
	 * Un nome con la sua forma giapponese:
	 *  - italiano puro:   «Inizio dell'inverno»
	 *  - nomi giapponesi: «立冬 (Rittō) · Inizio dell'inverno»
	 */
	import { display, capitalize } from '../display.svelte';

	let { kanji, romaji, it }: { kanji: string; romaji: string; it: string } = $props();
</script>

{#if display.mixed}<span class="ja">{kanji}</span> <em class="romaji">({capitalize(romaji)})</em> <span
		class="sep"
		aria-hidden="true">·</span
	> {it}{:else}{it}{/if}

<style>
	.romaji {
		font-size: 0.88em;
		color: var(--text);
	}

	.sep {
		color: var(--text-faint);
	}
</style>
