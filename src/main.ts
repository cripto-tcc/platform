import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import vuetify from "./config/vuetify";
import "./styles/main.scss";

const app = createApp(App);
app.use(router);
app.use(vuetify);
app.mount("#app");
