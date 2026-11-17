<script lang="ts">
	import '../app.css';
	import favicon from '#lib/assets/favicon.svg';
	import SiteLogo from '#lib/components/SiteLogo.svelte';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { applyTheme, currentTheme, writeOverride } from '#lib/theme.ts';
	import { display, setMixed } from '#lib/display.svelte.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	// Tema come su cignozen.it: segue l'ora del giorno, il pulsante lo cambia fino a mezzanotte.
	// come su cignozen.it: l'icona che entra arriva da destra, quella che esce va a sinistra
	let anim = $state<'' | 'anim-to-dark' | 'anim-to-light'>('');
	let animTimer: ReturnType<typeof setTimeout>;
	function toggleTheme() {
		const next = currentTheme() === 'dark' ? 'light' : 'dark';
		anim = next === 'dark' ? 'anim-to-dark' : 'anim-to-light';
		requestAnimationFrame(() => {
			applyTheme(next);
			writeOverride(next);
			clearTimeout(animTimer);
			animTimer = setTimeout(() => (anim = ''), 720);
		});
	}

	// Riallinea il tema quando l'app torna in primo piano e, se resta aperta, ogni minuto
	// (per esempio alle 18 passa da sola al tema scuro).
	$effect(() => {
		const sync = () => {
			if (document.visibilityState === 'visible') applyTheme(currentTheme());
		};
		document.addEventListener('visibilitychange', sync);
		const timer = setInterval(sync, 60_000);
		return () => {
			document.removeEventListener('visibilitychange', sync);
			clearInterval(timer);
		};
	});

	// l'interruttore dei nomi giapponesi compare solo nel calendario, e solo nel browser
	// (la scelta è salvata sul dispositivo)
	let mounted = $state(false);
	$effect(() => {
		mounted = true;
	});
	const isCalendar = $derived(page.url.pathname === '/' || page.url.pathname === '');

	const isIching = $derived(page.url.pathname.startsWith('/iching'));
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Calendario · Cigno Zen</title>
</svelte:head>

<header class="top">
	<a class="brand" href={resolve('/')} aria-label="Calendario Cigno Zen">
		<SiteLogo width={42} label="" />
	</a>
	<nav aria-label="Sezioni">
		<a href={resolve('/')} aria-current={!isIching ? 'page' : undefined}>Calendario</a>
		<a href={resolve('/iching')} aria-current={isIching ? 'page' : undefined}>I Ching</a>
	</nav>
	<div class="tools">
	{#if mounted && isCalendar}
		<button
			class="btn jp-toggle ja"
			aria-pressed={display.mixed}
			onclick={() => setMixed(!display.mixed)}
			aria-label={display.mixed ? 'Nascondi i nomi giapponesi' : 'Mostra i nomi giapponesi'}
			title={display.mixed ? 'Nascondi i nomi giapponesi' : 'Mostra i nomi giapponesi'}
		>和</button>
	{/if}
	<button class="btn theme {anim}" onclick={toggleTheme} aria-label="Cambia tema chiaro/scuro">
		<!-- icone del tema cigno-zen (parts/svg/sun.php, moon.php) -->
		<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			<circle cx="12" cy="12" r="5" />
			<line x1="12" y1="1" x2="12" y2="3" />
			<line x1="12" y1="21" x2="12" y2="23" />
			<line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
			<line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
			<line x1="1" y1="12" x2="3" y2="12" />
			<line x1="21" y1="12" x2="23" y2="12" />
			<line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
			<line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
		</svg>
		<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
		</svg>
	</button>
	</div>
</header>

<main>
	{@render children()}
</main>

<style>
	/* barra più alta e fuori dalla zona dell'orologio e della «Dynamic Island»
	   quando il calendario è aperto come app dalla schermata Home */
	.top {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		max-width: 1200px;
		margin: 0 auto;
		padding: calc(env(safe-area-inset-top, 0px) + 1.25rem) max(1rem, env(safe-area-inset-right, 0px)) 1.25rem
			max(1rem, env(safe-area-inset-left, 0px));
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		color: var(--text-strong);
		font-weight: 700;
	}

	.brand:hover {
		text-decoration: none;
	}

	nav {
		display: flex;
		gap: 1.2rem;
		margin-left: auto;
		font-size: var(--fs-ui);
	}

	nav a {
		color: var(--text);
		padding: 0.2rem 0;
		border-bottom: 1px solid transparent;
	}

	nav a[aria-current='page'] {
		color: var(--text-strong);
		border-bottom-color: var(--link);
	}

	nav a:hover {
		text-decoration: none;
		color: var(--link);
	}

	.tools {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	/* pulsanti rotondi: nomi giapponesi e tema */
	.jp-toggle,
	.theme {
		width: 2.25rem;
		height: 2.25rem;
		min-width: 0;
		padding: 0;
		flex: none;
	}




	/* ---- icona sole/luna, con l'animazione del tema cigno-zen ---- */
	.theme {
		position: relative;
		overflow: hidden;
	}

	.theme svg {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 18px;
		height: 18px;
		transform: translate(-50%, -50%);
		transition:
			transform 0.7s cubic-bezier(0.36, 0.66, 0.04, 1),
			opacity 0.7s ease,
			fill 0.3s ease;
		opacity: 0;
		pointer-events: none;
	}

	:global(html[data-theme='light']) .theme .icon-sun,
	:global(html[data-theme='dark']) .theme .icon-moon {
		fill: var(--bg);
		transform: translate(-50%, -50%);
		opacity: 1;
	}

	:global(html[data-theme='light']) .theme:hover .icon-sun,
	:global(html[data-theme='dark']) .theme:hover .icon-moon {
		fill: currentColor;
	}

	:global(html[data-theme='dark']) .theme .icon-sun,
	:global(html[data-theme='light']) .theme .icon-moon {
		transform: translate(-50%, -50%) translateX(160%) rotate(40deg);
		opacity: 0;
	}

	/* chiaro → scuro: entra la luna da destra, il sole esce a sinistra */
	.theme.anim-to-dark .icon-moon {
		transform: translate(-50%, -50%) translateX(160%) rotate(40deg);
		opacity: 0;
	}
	:global(html[data-theme='dark']) .theme.anim-to-dark .icon-sun {
		transform: translate(-50%, -50%) translateX(-160%) rotate(-40deg);
		opacity: 0;
	}

	/* scuro → chiaro: entra il sole da destra, la luna esce a sinistra */
	.theme.anim-to-light .icon-sun {
		transform: translate(-50%, -50%) translateX(160%) rotate(40deg);
		opacity: 0;
	}
	:global(html[data-theme='light']) .theme.anim-to-light .icon-moon {
		transform: translate(-50%, -50%) translateX(-160%) rotate(-40deg);
		opacity: 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.theme svg {
			transition: none;
		}
	}

	.jp-toggle {
		font-size: 0.95rem;
		color: var(--text);
	}

	.jp-toggle[aria-pressed='true'] {
		background: var(--link);
		border-color: var(--link);
		color: var(--bg);
	}

	main {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 max(1rem, env(safe-area-inset-right, 0px)) calc(env(safe-area-inset-bottom, 0px) + 4rem)
			max(1rem, env(safe-area-inset-left, 0px));
	}

	@media (max-width: 520px) {
		.top {
			gap: 1rem;
		}
	}
</style>
