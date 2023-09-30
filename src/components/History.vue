<script setup lang="ts">
import {useHistoryStore} from "@/stores/History";
import {storeToRefs} from "pinia";

const settings = useHistoryStore()

</script>

<template>

  <article>
    <h3>Historial</h3>
    <div>
        <span class="italic text-slate-400" v-if="history.length === 0"
        >Cap ítem</span
        >
      <div v-else v-for="item in history">
        <span class="text-slate-200">{{ item.timestamp }}</span>
        <span class="ml-2 text-slate-400">{{ item.snapshot }}</span>
      </div>
    </div>
    <button v-if="history.length > 0" @click="handleExport">
      Exportar
    </button>
  </article>

</template>

<style scoped>

</style>