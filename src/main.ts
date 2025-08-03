import { createApp } from "vue";
import App from "@/src/App.vue";
import router from "@/src/router";
import vuetify from "@/src/config/vuetify";
import "@/src/styles/main.scss";

const app = createApp(App);
app.use(router);
app.use(vuetify);
app.mount("#app");
