import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import checker from "vite-plugin-checker";
import UnoCSS from 'unocss/vite';

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue(), UnoCSS(), vueDevTools({
        launchEditor: 'webstorm'
    }), checker({
        typescript: true,
    })], resolve: {
        alias: {
            '@': '/src',
        }
    }
})
