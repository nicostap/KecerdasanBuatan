import { browser } from '$app/environment';

export function saveState(id: string, state: unknown) {
	if (!browser) return;
	localStorage.setItem(`state_${id}`, JSON.stringify(state));
}

export function loadState(id: string, defaults: unknown) {
	if (!browser) return defaults;
	const state = localStorage.getItem(`state_${id}`);
	return state !== null ? JSON.parse(state) : defaults;
}
