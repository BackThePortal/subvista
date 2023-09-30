import {defineStore} from "pinia";
import {computed} from "vue/dist/vue";



const subsHistory = computed<{ timestamp: string; snapshot: string }[]>(() =>
    subsRawHistory.value.slice(0, -1).map((item) => ({
        ...item,
        timestamp: new Date(item.timestamp).toLocaleTimeString(),
    }))
);




export const useHistoryStore = defineStore('history',  {
    state: () => ({

    })
})
