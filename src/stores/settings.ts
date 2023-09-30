import { defineStore } from 'pinia';
interface Apperance {
	box: string;
	bg: string;
	opacity: string;
	blur: boolean;
	blurAmount: string;
	subs: string;
	size: string;
	pos: string;
	img: string;
}

const defaults: Apperance = {
	box: '#000000',
	bg: '#181818',
	opacity: '170',
	blur: false,
	blurAmount: '8',
	subs: '#DDDDDD',
	size: '4',
	pos: '0',
	img: '',
};

export const useSettingsStore = defineStore('settings', {
	state: () => ({
		appearance: localStorage.getItem('appearance')
			? {
					...JSON.parse(localStorage.getItem('appearance')!),
					img: JSON.parse(localStorage.getItem('img')!),
			  }
			: structuredClone(defaults),
		ui: {
			settings: false,
			help: false,
		} as {
			settings: boolean;
			help: boolean;
		},
	}),
	actions: {
		reset() {
			this.appearance = structuredClone(defaults);
		},
	},
});
