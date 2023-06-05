<script setup>
import { nextTick, ref, watch, watchEffect } from 'vue';
import { useLastChanged, timestamp, useTimeAgo } from '@vueuse/core';

const playing = ref(false);
const videoInput = ref(null);
const windowVideo = ref();
const subInput = ref(null);
const subInputArea = ref(null);
const allowEnter = ref(false);

const subInputValue = ref('');

const liveUpdate = ref(false);

const lastChange = useLastChanged(subInputValue, {
	initialValue: timestamp() - 1000 * 60 * 5,
});

const lastChangeAgo = useTimeAgo(lastChange);

watch([liveUpdate, subInputValue], () => {
	if (liveUpdate.value) {
		sendSubs();
	}
});

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
	play: () => {
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
			'/videoHost.html',
			undefined,
			'popup,width=800,height=600,left=800'
		);
	}
}

function handleFocus(e) {
	windowVideo.value.focus();
}

function handleControlsOption(e) {
	if (e.target.checked) {
		windowVideo.value.document
			.getElementById('video')
			.setAttribute('controls', '');
		windowVideo.value.document.getElementById('subs').style.transform =
			'translateY(-2rem)';
	} else {
		windowVideo.value.document
			.getElementById('video')
			.removeAttribute('controls');
		windowVideo.value.document.getElementById('subs').style.transform =
			'translateY(-5rem)';
	}
}

function sendSubs(e) {
	windowVideo.value.document.getElementById('subs').innerText = (
		allowEnter.value ? subInputArea : subInput
	).value.value;
}

function focusSubInput() {
	if (allowEnter.value) {
		subInputArea.value.focus();
	} else {
		subInput.value.focus();
	}
}
</script>

<template>
	<header class="mb-4 flex flex-col items-center rounded-lg bg-gray-700/40 p-2">
		<h1 class="text-5xl text-slate-300 transition hover:text-slate-100">
			Subvista
		</h1>
		<p class="text-xl text-slate-300">El subtitulador en viu multifinestra.</p>
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
		<button @click="createWindow">
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
		<label class="mr-2 mt-2 text-slate-300" for="controlsOption"
			>Mostrar controls a la finestra</label
		>
		<input
			class="text-slate-300"
			type="checkbox"
			id="controlsOption"
			@change="handleControlsOption"
		/>
		<h3>Subtítols</h3>
		<!--
		<label class="mr-2 mt-2 text-slate-300" for="enterOption"
			>Permetre salts de línia</label
		>
		<input
			class="text-slate-300"
			type="checkbox"
			id="enterOption"
			v-model="allowEnter"
			@change="focusSubInput"
		/>
		-->
		<br />
		<label class="mr-2 text-slate-300" for="liveOption">Subtítols en viu</label>
		<input
			class="text-slate-300"
			type="checkbox"
			id="liveOption"
			v-model="liveUpdate"
		/>
		<br />
		<div class="flex w-full flex-col place-content-center items-center gap-4">
			<textarea
				class="subinput mt-2"
				ref="subInputArea"
				v-model="subInputValue"
				@keydown.enter.exact.prevent="sendSubs"
			/>
		</div>

		<br />
		<p v-if="!liveUpdate && !allowEnter">
			Utilitza la tecla <kbd>Enter</kbd> per mostrar els subtítols. Utilitza
			<kbd>Alt + Enter</kbd> per introduir un salt de línia.
		</p>
		<p class="text-white">Últim canvi: {{ lastChangeAgo }}</p>
	</template>
</template>

<style scoped>
.subinput {
	@apply h-24 w-96 rounded-md bg-slate-600 p-2 text-lg text-white outline-0 ring-slate-300 focus:ring-2;
}
</style>
