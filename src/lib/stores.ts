import { writable } from 'svelte/store';
import type { Theme } from './types';

export const selectedTheme = writable<Theme>('blue');
