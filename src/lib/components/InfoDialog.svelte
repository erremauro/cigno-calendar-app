<script lang="ts">
	/**
	 * Pulsante che apre una finestra con una spiegazione.
	 * Usa <dialog>: si chiude con Esc, con il pulsante × o toccando fuori.
	 */
	import type { Snippet } from 'svelte';

	let { label, title, children }: { label: string; title: string; children: Snippet } = $props();

	let dialog: HTMLDialogElement;
	const id = `dlg-${Math.random().toString(36).slice(2, 8)}`;

	function onDialogClick(e: MouseEvent) {
		// il tocco sullo sfondo arriva al <dialog> stesso, non al suo contenuto
		if (e.target === dialog) dialog.close();
	}
</script>

<button class="info-btn ui" type="button" onclick={() => dialog.showModal()}>
	<span class="i" aria-hidden="true">i</span>
	{label}
</button>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog bind:this={dialog} onclick={onDialogClick} aria-labelledby={id}>
	<div class="body">
		<header>
			<h2 {id}>{title}</h2>
			<button class="close" type="button" onclick={() => dialog.close()} aria-label="Chiudi">×</button>
		</header>
		<div class="content ui">
			{@render children()}
		</div>
	</div>
</dialog>

<style>
	.info-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.3rem 0;
		background: none;
		border: 0;
		color: var(--link);
		cursor: pointer;
		text-align: left;
	}

	.i {
		display: inline-grid;
		place-items: center;
		width: 1.05rem;
		height: 1.05rem;
		flex: none;
		border: 1px solid currentColor;
		border-radius: 50%;
		font-size: 0.7rem;
		font-style: italic;
		font-weight: 700;
		line-height: 1;
	}

	dialog {
		width: min(34rem, calc(100vw - 2rem));
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
		padding: 1.1rem 1.25rem 1.25rem;
	}

	header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 0.6rem;
	}

	h2 {
		font-size: 1.15rem;
		color: var(--text-strong);
		line-height: 1.3;
	}

	.close {
		flex: none;
		width: 2.25rem;
		height: 2.25rem;
		margin: -0.4rem -0.6rem 0 0;
		border: 0;
		border-radius: var(--radius-full);
		background: none;
		color: var(--text);
		font-size: 1.5rem;
		line-height: 1;
		cursor: pointer;
	}

	.close:hover {
		background: var(--btn-bg-hover);
	}

	.content {
		line-height: 1.65;
	}

	.content :global(p) {
		margin: 0 0 0.8rem;
	}

	.content :global(p:last-child) {
		margin-bottom: 0;
	}

	.content :global(.ja) {
		white-space: nowrap;
	}
</style>
