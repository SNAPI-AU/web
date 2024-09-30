import Vue from "vue";
import Vuetify from "vuetify/lib/framework";

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: "#477FF6",
        secondary: "#f6f7f9",
        muted: "#949CB0",
        accent: "#8c9eff",
        error: "#F26868",
        danger: "#F26868",
        light: "#E6E8EC",
      },
    },
  },
});
