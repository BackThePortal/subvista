<script setup>
import { nextTick, reactive, ref, watch, watchEffect } from 'vue';
import { useLastChanged, timestamp, useTimeAgo } from '@vueuse/core';

const playing = ref(false);
const videoInput = ref(null);
const windowVideo = ref();
const subInput = ref(null);
const subInputArea = ref(null);
const allowEnter = ref(false);

const subInputValue = ref('');

const showAppearance = ref(false);

const appearance = reactive(localStorage.getItem('appearance') ? JSON.parse(localStorage.getItem('appearance')) : {
	bg: '#000000', opacity: '170', blur: false, subs: '#DDDDDD', size: '18', pos: '5'
})

const liveUpdate = ref(false);

const lastChange = useLastChanged(subInputValue, {
	initialValue: timestamp() - 1000 * 60 * 5,
});

const lastChangeAgo = useTimeAgo(lastChange);


watch(appearance, () => {
	if (windowVideo.value) updateTheme()
})

function updateTheme() {
	const el = windowVideo.value?.document.getElementById('subs');
	let bgColor = appearance.bg.split('').slice(1);
	bgColor.push(parseInt(appearance.opacity).toString(16))
	el.style.backgroundColor = '#' + bgColor.join('')
	el.style.color = appearance.subs;
	el.style.fontSize = appearance.size + 'px';
	el.style.transform = `translateY(-${appearance.pos}rem)`;
	el.style.backdropFilter = `blur(${appearance.blur ? '8' : '0'}px)`;

	localStorage.setItem('appearance', JSON.stringify(appearance));
}

function getVideoElement() {
	return windowVideo.value?.document.getElementsByTagName('video').item(0);
}

async function handlePlayPause(e) {
	videoControls[playing.value ? 'pause' : 'play']();
	playing.value = !playing.value;
}

function handleRestart(e) {
	getVideoElement().currentTime = 0;
}

const videoControls = {
	pause: () => {
		getVideoElement().pause();
		getVideoElement().dataset.playing = 'false';
	},
	play:  () => {
		getVideoElement().play();
		getVideoElement().dataset.playing = 'true';
	},
};

function createWindow(e) {
	console.log(windowVideo.value);
	if (windowVideo.value) {
		windowVideo.value.close();
		windowVideo.value = null;
	} else {
		windowVideo.value = window.open(
				"/videoHost.html",
				undefined,
				'popup,width=800,height=600,left=800'
		);
		setTimeout(() => {
			updateTheme()
		}, 100)

	}
}

function handleFocus(e) {
	windowVideo.value.focus();
}

function handleNewLine(e) {
	subInputValue.value += '\n'
}


function sendSubs(e) {
	windowVideo.value.document.getElementById('subs').innerText = subInputValue.value;
}

function focusSubInput() {
	if (allowEnter.value) {
		subInputArea.value.focus();
	} else {
		subInput.value.focus();
	}
}

function handleTemp(e) {
	console.log(e.target.checked)
}
</script>

<template>
	<header class="mb-4 flex flex-col items-center rounded-lg bg-gray-700/40 p-2">
		<h1 class="text-5xl text-slate-300 transition hover:text-slate-100">
			Subvista
		</h1>
		<p class="text-xl text-slate-300">{{ windowVideo }}</p>
	</header>
	<p
			v-html="
			windowVideo
				? `La finestra s'ha creat. Pots controlar el vídeo des d'aquí mateix.`
				: 'Subvista funciona creant una nova finestra on es reprodueix el vídeo. ' +
				  'Els subtítols que escriguis hi aniran apareixent. <br>Comença pujant el vídeo que vulguis subtitular.'
		"
	></p>
	<input
			v-if="!windowVideo"
			ref="videoInput"
			class="my-2 cursor-pointer rounded-lg bg-slate-700 p-3 text-slate-300 transition file:cursor-pointer file:rounded-md file:border file:border-0 file:!border-b-2 file:!border-r-2 file:!border-r-2 file:!border-r-2 file:border-b-slate-200/100 file:border-r-slate-200/100 file:border-r-slate-200/100 file:border-r-slate-200/100 file:bg-slate-800 file:font-bold file:text-slate-200 file:transition hover:bg-slate-700 hover:bg-slate-800 active:bg-slate-600 active:ring active:ring-slate-400"
			type="file"
			name="Vídeo"
			id="videoInput"
	/>
	<h3 v-else>Finestra</h3>
	<div class="flex gap-2">
		<button
				:class="windowVideo ? 'bg-red-700/60 active:bg-red-700 active:ring-red-500' : 'bg-green-700/60 active:bg-green-700 active:ring-green-500'"
				@click="createWindow">
			{{ windowVideo ? 'Tancar' : 'Crear finestra' }}
		</button>
		<button v-if="windowVideo" @click="handleFocus">Portar-la al davant</button>
	</div>
	<template v-if="windowVideo">
		<h3>Vídeo</h3>
		<div class="flex gap-2">
			<button @click="handlePlayPause">
				{{ playing ? 'Pausar' : 'Reproduir' }}
			</button>
			<button @click="handleRestart">Des del principi</button>
		</div>
		<h3>Subtítols</h3>
		<button class=" font-semibold" @click="showAppearance = !showAppearance">Aparença</button><br />
		<template v-if="showAppearance">
			<label for="colorSubs">Color del text</label>
			<input type="color" id="colorSubs" v-model="appearance.subs"/>
			<br/>
			<label for="colorBg">Color del fons</label>
			<input type="color" id="colorBg" v-model="appearance.bg"/>
			<br/>
			<label for="bgOpacity">Opacitat del fons</label>
			<input id="bgOpacity" type="range" min="0" max="255" v-model="appearance.opacity">
			<br/>
			<label for="bgBlur">Fons difuminat</label>
			<input id="bgBlur" type="checkbox" @change="(e) => appearance.blur = e.target.checked">
			<br/>
			<label for="subSize">Mida del text</label>
			<input id="subSize" type="range" min="8" max="24" v-model="appearance.size"/>
			<br/>
			<label for="subPos">Posició del text</label>
			<input id="subPos" type="range" min="0" max="30" step="0.25" v-model="appearance.pos"/>
		</template>

		<div class="flex w-full flex-col place-content-center items-center gap-4">
			<textarea
					class="subinput mt-2"
					ref="subInputArea"
					v-model="subInputValue"
					@keydown.enter.exact.prevent="sendSubs"
					@keydown.enter.alt.prevent="handleNewLine"
			/>
		</div>

		<br/>
		<p v-if="!liveUpdate && !allowEnter">
			Utilitza la tecla <kbd>Enter</kbd> per mostrar els subtítols. Utilitza
			<kbd>Alt + Enter</kbd> per introduir un salt de línia.
		</p>
		<p class="text-white">Últim canvi: {{ lastChangeAgo }}</p>
	</template>
</template>

<style scoped>
.subinput {
	@apply h-24 w-96 rounded-md bg-slate-600 p-2 text-lg text-white outline-0 ring-slate-300 focus:ring-2 shadow-2xl;
}

</style>
