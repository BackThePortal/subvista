import {defineStore} from "pinia";

export const useSettingsStore = defineStore('settings',  {
    state: () => ({
        appearance: (localStorage.getItem('appearance')
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
            }),
        ui: {
            settings: false,
            help:false,
        } as {
            settings: boolean
            help: boolean
        }
    })
})
