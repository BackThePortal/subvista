<script setup lang="ts">
import { ref, toRaw, watch } from 'vue';
import { useLastChanged, timestamp, useTimeAgo } from '@vueuse/core';
import Settings from '@/components/Settings.vue';
import Help from '@/components/Help.vue';
import { useSettingsStore } from '@/stores/settings';

const windowVideo = ref<null | Window>(null);
const subInputArea = ref<HTMLTextAreaElement | null>(null);

const subInputValue = ref('Crea la finestra per començar.');

type Pages = 'subs' | 'bg';
const settingsPage = ref<false | Pages>(false);
const setPage = (btn: Pages) => (settingsPage.value === btn ? false : btn);
const toBase64 = (file: File) =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result);
		reader.onerror = reject;
	});

const settings = useSettingsStore();

watch(settings.appearance, () => {
	if (windowVideo.value) updateTheme();
});
async function updateTheme() {
	const el = windowVideo.value?.document.getElementById('subsBoxContainer');
	if (!el) return;
	const bg = windowVideo.value?.document.getElementById('bg')!;
	el.style.backgroundColor =
		'#' +
		[
			...settings.appearance.box.split('').slice(1),
			parseInt(settings.appearance.opacity).toString(16).padStart(2, '0'),
		].join('');
	el.style.color = settings.appearance.subs;
	el.style.fontSize = settings.appearance.size + 'rem';
	el.style.transform = `translateY(${settings.appearance.pos}rem)`;
	bg.style.backgroundColor = settings.appearance.bg;
	el.style.backdropFilter = `blur(${
		settings.appearance.blur ? settings.appearance.blurAmount : '0'
	}px)`;

	const dataClone = structuredClone(toRaw(settings.appearance));
	delete dataClone.img;
	localStorage.setItem('appearance', JSON.stringify(dataClone));
}

function openWindow() {
	if (!windowVideo.value) {
		createWindow();
	}
}

function createWindow() {
	if (windowVideo.value) {
		windowVideo.value.close();
		windowVideo.value = null;
	} else {
		subInputValue.value = '';
		windowVideo.value = window.open(
			'/subvista/host.html',
			undefined,
			'popup,width=1000,height=600,left=1000'
		);

		windowVideo.value!.addEventListener('load', () => {
			updateTheme();
			sendSubs(true);
		});
	}
}

function handleFocus() {
	windowVideo.value!.focus();
}

function handleNewLine() {
	subInputValue.value += '\n';
}

function sendSubs(manual = false) {
	const el = windowVideo.value!.document.getElementById('subs')!;

	el.innerText = subInputValue.value;

	el.scrollTo(0, el.scrollHeight);
}
</script>

<template>
	<div class="space-y-4">
		<header class="rounded-lg bg-gray-700/40">
			<div
				class="mx-auto flex max-w-8xl justify-center space-y-4 p-2 sm:px-6 lg:px-8"
			>
				<h1 class="text-5xl text-slate-300 transition hover:text-slate-100">
					Subvista
				</h1>
			</div>
		</header>
		<nav>
			<div class="mx-auto max-w-8xl space-y-4 p-2 sm:px-6 lg:px-8">
				<div class="flex flex-wrap gap-2">
					<button
						v-if="windowVideo"
						@click="createWindow"
						class="bg-red-700/60 active:bg-red-700 active:ring-red-500"
					>
						Tancar finestra
					</button>
					<button
						v-else
						@click="createWindow"
						class="bg-green-700/60 active:bg-green-700 active:ring-green-500"
					>
						Crear finestra
					</button>
					<button v-if="windowVideo" @click="handleFocus">
						Portar-la al davant
					</button>
					<button @click="settings.ui.settings = !settings.ui.settings">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6 fill-current"
							width="44"
							height="44"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="#2c3e50"
							fill="none"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path stroke="none" d="M0 0h24v24H0z" fill="none" />
							<path
								d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z"
							/>
							<path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
						</svg>
					</button>
					<!-- <button @click="settings.ui.help = !settings.ui.help">Ajuda</button>-->
				</div>
			</div>
		</nav>
		<main>
			<div class="mx-auto max-w-8xl space-y-4 p-2 sm:px-6 lg:px-8">
				<div class="md:grid md:grid-cols-6">
					<div class="col-span-4 md:col-start-2">
						<textarea
							:disabled="!windowVideo"
							rows="2"
							class="w-full rounded-md bg-slate-600 p-2 text-xl text-white shadow-2xl outline-0 ring-slate-300 focus:ring-2 disabled:text-slate-300"
							ref="subInputArea"
							v-model="subInputValue"
							@keydown.enter.alt.prevent="handleNewLine"
							@keydown.enter.shift.prevent="handleNewLine"
							@input="(e: Event) => sendSubs()"
							@click="openWindow"
						></textarea>
					</div>
				</div>
			</div>
		</main>
		<aside>
			<div class="mx-auto max-w-8xl space-y-4 p-2 sm:px-6 lg:px-8">
				<Settings v-if="settings.ui.settings" />
			</div>
		</aside>
	</div>
</template>
