<script setup lang="ts">
import {useSettingsStore} from "@/stores/Settings";
import {storeToRefs} from "pinia";

const settings = useSettingsStore()

</script>

<template>

  <article class="border p-4 rounded dark:border-gray-600 space-y-4">
    <header>
      <h3>Aparença</h3>
    </header>
    <div class="space-y-2">
      <div class="grid grid-cols-6 items-center">
        <label for="colorBg" class="col-span-2">Color de la pàgina</label>
        <input type="color" id="colorBg" v-model="settings.appearance.bg" />
      </div>
      <div class="grid grid-cols-6 items-center">
        <label for="colorSubs" class="col-span-2">Color del text</label>
        <input type="color" id="colorSubs" v-model="settings.appearance.subs" />
      </div>
      <div class="grid grid-cols-6 items-center">
      <label for="colorBox" class="col-span-2">Color del fons</label>
      <input type="color" id="colorBox" v-model="settings.appearance.box" />
      </div>
      <div class="grid grid-cols-6 items-center">
        <label for="bgOpacity" class="col-span-2">Opacitat del fons</label>
        <input
            id="bgOpacity"
            type="range"
            min="0"
            max="255"
            v-model="settings.appearance.opacity"
        />
      </div>
  </div>
</article>


</template>

<style scoped>

</style>