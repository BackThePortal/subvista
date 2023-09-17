<script setup lang="ts">
import { computed, reactive, ref, toRaw, watch } from 'vue';
import {
	useLastChanged,
	timestamp,
	useTimeAgo,
	useRefHistory,
} from '@vueuse/core';

const playing = ref(false);
const windowVideo = ref<null | Window>(null);
const subInput = ref(null);
const subInputArea = ref<HTMLTextAreaElement | null>(null);
const allowEnter = ref(false);

const subInputValue = ref('');
const subsPreSend = ref<string>('Els subtítols apareixeran aquí.');
const subsPreSendLines = computed<string[]>(() =>
	subsPreSend.value.split(/\r\n|\r|\n/g)
);
const { history: subsRawHistory } = useRefHistory(subsPreSend);
const subsHistory = computed<{ timestamp: string; snapshot: string }[]>(() =>
	subsRawHistory.value.slice(0, -1).map((item) => ({
		...item,
		timestamp: new Date(item.timestamp).toLocaleTimeString(),
	}))
);
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

const appearance = reactive(
	localStorage.getItem('appearance')
		? {
				...JSON.parse(localStorage.getItem('appearance')!),
				img: JSON.parse(localStorage.getItem('img')!),
		  }
		: {
				box: '#000000',
				bg: '#181818',
				opacity: '170',
				blur: false,
				blurAmount: '8',
				subs: '#DDDDDD',
				size: '4',
				pos: '0',
				img: '',
		  }
);

const liveUpdate = ref(false);

const lastChange = useLastChanged(subInputValue, {
	initialValue: timestamp() - 1000 * 60 * 5,
});

const lastChangeAgo = useTimeAgo(lastChange);

watch(appearance, () => {
	if (windowVideo.value) updateTheme();
});
async function updateTheme() {
	const el = windowVideo.value?.document.getElementById('subs');
	if (!el) return;
	const bg = windowVideo.value?.document.getElementById('bg')!;
	el.style.backgroundColor =
		'#' +
		[
			...appearance.box.split('').slice(1),
			parseInt(appearance.opacity).toString(16).padStart(2, '0'),
		].join('');
	el.style.color = appearance.subs;
	el.style.fontSize = appearance.size + 'em';
	el.style.transform = `translateY(${appearance.pos}rem)`;
	bg.style.backgroundColor = appearance.bg;
	el.style.backdropFilter = `blur(${
		appearance.blur ? appearance.blurAmount : '0'
	}px)`;

	const dataClone = structuredClone(toRaw(appearance));
	delete dataClone.img;
	localStorage.setItem('appearance', JSON.stringify(dataClone));
}
/*
function getVideoElement() {
	return windowVideo.value?.document.getElementsByTagName('video').item(0);
}

async function handlePlayPause() {
	videoControls[playing.value ? 'pause' : 'play']();
	playing.value = !playing.value;
}

function handleRestart() {
	getVideoElement().currentTime = 0;
}

const videoControls = {
	pause: () => {
		getVideoElement().pause();
		getVideoElement().dataset.playing = 'false';
	},
	play: () => {
		getVideoElement().play();
		getVideoElement().dataset.playing = 'true';
	},
};
*/
function createWindow() {
	if (windowVideo.value) {
		windowVideo.value.close();
		windowVideo.value = null;
	} else {
		windowVideo.value = window.open(
			'/host.html',
			undefined,
			'popup,width=1000,height=600,left=1000'
		);

		windowVideo.value!.addEventListener('load', (e) => {
			updateTheme();
			sendSubs(true);
			setImage();
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
	if (!manual) subsPreSend.value = subInputValue.value;
	windowVideo.value!.document.getElementById('subs')!.innerText =
		subsPreSend.value;
	subInputValue.value = '';
}

function handleSubsClick() {
	subInputValue.value = subsPreSend.value;
}

function setImage() {
	windowVideo.value!.document.body.style.backgroundImage = appearance.img
		? `url(${appearance.img})`
		: '';
}
async function handleImage(e: { target: HTMLInputElement }) {
	if (!e.target.files?.[0]) return;
	appearance.img = e.target.files[0] && (await toBase64(e.target.files[0]));
	setImage();
	localStorage.setItem('img', JSON.stringify(appearance.img));
}

function handleExport() {
	const file = new File(
		[
			subsHistory.value
				.map((item) => `${item.timestamp}\n${item.snapshot}`)
				.join('\n\n'),
		],
		'subs.txt',
		{
			type: 'text/plain',
		}
	);

	const link = document.createElement('a');
	const url = URL.createObjectURL(file);
	link.href = url;
	link.download = file.name;
	link.click();
	window.URL.revokeObjectURL(url);
}

function handlePostprocess(e: { target: HTMLTextAreaElement }) {
	let value = e.target.value;
	e.target.value = value.endsWith('--')
		? value.slice(0, -2).concat('—')
		: value;
	console.log(value);
}
</script>

<template>
	<header class="mb-4 flex flex-col items-center rounded-lg bg-gray-700/40 p-2">
		<h1 class="text-5xl text-slate-300 transition hover:text-slate-100">
			Subvista
		</h1>
	</header>
	<p
		v-html="
			windowVideo
				? ''
				: 'Subvista funciona creant una nova finestra on es mostren els subtítols.' +
				  '<br />El text que escriguis hi anirà apareixent.'
		"
	></p>

	<h3 v-if="windowVideo">Finestra</h3>
	<div
		class="flex flex-wrap gap-2"
		:class="{ 'items-center justify-center': !windowVideo }"
	>
		<button
			:class="
				windowVideo
					? 'bg-red-700/60 active:bg-red-700 active:ring-red-500'
					: 'mt-4  bg-green-700/60 text-xl active:bg-green-700 active:ring-green-500'
			"
			@click="createWindow"
		>
			{{ windowVideo ? 'Tancar' : 'Crear finestra' }}
		</button>
		<template v-if="windowVideo">
			<button @click="handleFocus">Portar-la al davant</button>
		</template>
	</div>
	<template v-if="windowVideo">
		<!--
		<h3>Vídeo</h3>
		<div class="flex gap-2">
			<button @click="handlePlayPause">
				{{ playing ? 'Pausar' : 'Reproduir' }}
			</button>
			<button @click="handleRestart">Des del principi</button>
		</div>
		-->
		<h3>Aparença</h3>
		<!--
		<div class="mb-2 flex gap-2">
			<button class="font-semibold" @click="settingsPage = setPage('subs')">
				Subtítols
			</button>
			<button class="font-semibold" @click="settingsPage = setPage('bg')">
				Fons
			</button>
		</div>-->
		<template
			v-if="
				true //settingsPage === 'subs'
			"
		>
			<label for="colorBg">Color de la pàgina</label>
			<input type="color" id="colorBg" v-model="appearance.bg" />
			<br />
			<label for="colorSubs">Color del text</label>
			<input type="color" id="colorSubs" v-model="appearance.subs" />
			<br />
			<label for="colorBox">Color del fons</label>
			<input type="color" id="colorBox" v-model="appearance.box" />
			<br />
			<label for="bgOpacity">Opacitat del fons</label>
			<input
				id="bgOpacity"
				type="range"
				min="0"
				max="255"
				v-model="appearance.opacity"
			/>
			<!--
			<br />
			<label for="bgBlur">Fons difuminat</label>
			<input
				id="bgBlur"
				type="checkbox"
				:checked="appearance.blur"
				@change="(e) => (appearance.blur = e.target.checked)"
			/>-->
			<br />
			<template v-if="appearance.blur">
				<label for="bgBlurAmount">Opacitat del fons</label>
				<input
					id="bgBlurAmount"
					type="range"
					min="2"
					step="0.1"
					max="12"
					v-model="appearance.blurAmount"
				/>
				<br />
			</template>

			<label for="subSize">Mida</label>
			<input
				id="subSize"
				type="range"
				min="1"
				max="12"
				step="0.25"
				v-model="appearance.size"
			/><!--
			<br />
			<label for="subPos">Posició</label>
			<input
				id="subPos"
				type="range"
				min="-30"
				max="30"
				step="0.25"
				v-model="appearance.pos"
			/>-->
		</template>
		<template v-if="settingsPage === 'bg'">
			<label for="bgImage">Imatge de fons</label>
			<br />
			<input
				ref="bgImage"
				class="mb-2 cursor-pointer rounded-lg bg-slate-700 p-3 text-slate-300 transition file:cursor-pointer file:rounded-md file:border-0 file:!border-b-2 file:!border-r-2 file:border-b-slate-200/100 file:border-r-slate-200/100 file:bg-slate-800 file:font-bold file:text-slate-200 file:transition hover:bg-slate-700 active:bg-slate-600 active:ring active:ring-slate-400 disabled:opacity-40"
				type="file"
				name="Vídeo"
				id="videoInput"
				accept="image/png, image/jpeg"
				@change="handleImage"
			/>
		</template>
		<div class="flex w-full flex-col place-content-center items-center gap-4">
			<textarea
				class="subinput mt-2"
				ref="subInputArea"
				v-model="subInputValue"
				@keydown.enter.exact.prevent="() => sendSubs()"
				@keydown.enter.alt.prevent="handleNewLine"
				@keydown.enter.shift.prevent="handleNewLine"
				@input="handlePostprocess"
			/>
			<div
				class="group text-center text-xl text-slate-300"
				@click="handleSubsClick"
			>
				<p
					class="transition group-hover:text-slate-50"
					v-for="line in subsPreSendLines"
				>
					{{ line }}
				</p>
			</div>
		</div>

		<br />
		<template v-if="!liveUpdate && !allowEnter">
			<h3>Controls</h3>
			<span class="text-slate-300">Mentre escrius...</span>
			<p>
				<kbd>Enter</kbd> &mdash; Mostrar els subtítols. <br />
				<kbd>Alt + Enter</kbd> / <kbd>Shift + Enter</kbd> &mdash; Introduir un
				salt de línia.
				<br />
				<br />
				Doble clic a la finestra &mdash; Pantalla completa. <br />
			</p>
		</template>

		<h3>Historial</h3>
		<div>
			<span class="italic text-slate-400" v-if="subsHistory.length === 0"
				>Cap ítem</span
			>
			<div v-else v-for="item in subsHistory">
				<span class="text-slate-200">{{ item.timestamp }}</span>
				<span class="ml-2 text-slate-400">{{ item.snapshot }}</span>
			</div>
		</div>
		<button v-if="subsHistory.length > 0" @click="handleExport">
			Exportar
		</button>
	</template>
</template>

<style scoped>
.subinput {
	@apply h-24 w-96 rounded-md bg-slate-600 p-2 text-lg text-white shadow-2xl outline-0 ring-slate-300 focus:ring-2;
}
</style>
