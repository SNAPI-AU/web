<template>
  <v-container fill-height class="bg-dark pa-md-15 px-10" fluid>
    <v-row class="fill-height">
      <v-col
        cols="12"
        md="6"
        class="d-flex align-center justify-center mx-auto text-center"
      >
        <v-row>
          <v-col cols="12" md="6" class="mx-auto">
            <div
              class="logo-container pa-10 mb-12 d-flex align-center justify-center"
            >
              <img
                src="//snapi.com.au/media/logo/snapi-logo-black-transparent-screen.png"
                width="150"
                alt=""
              />
            </div>

            <v-form v-model="valid" @submit.prevent="validate" ref="form">
              <v-text-field
                name="username"
                v-model="form.username"
                :rules="usernameRules"
                label="User Name"
                type="text"
                outlined
                required
              ></v-text-field>
              <v-text-field
                name="current-password"
                v-model="form.password"
                :rules="passwordRules"
                label="Password"
                :append-icon="value ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append="() => (value = !value)"
                :type="value ? 'password' : 'text'"
                outlined
                required
              ></v-text-field>
              <v-alert v-if="errorLogin" color="error" class="mb-6 white--text"
                >Invalid User Name or Password. Please try again.</v-alert
              >
              <v-btn
                type="submit"
                :disabled="!valid"
                color="primary"
                elevation="0"
                block
                large
                rounded
                :loading="loading"
              >
                Login
              </v-btn>
            </v-form>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "Login",
  data: () => {
    return {
      form: {
        username: "",
        password: "",
      },
      value: true,
      loading: false,

      valid: false,
      errorLogin: false,

      passwordRules: [(v) => !!v || "Password required"],
      usernameRules: [(v) => !!v || "User Name required"],
    };
  },
  computed: {
    ...mapGetters(["isLoggedIn"]),
  },

  methods: {
    ...mapActions(["auth"]),

    async validate() {
      this.$refs.form.validate();
      this.loading = true;
      if (this.valid) {
        await this.auth(this.form);
        this.$router.push({ name: "Home" }).catch(() => {
          this.errorLogin = true;
        });
      }
      this.loading = false;
    },
  },

  mounted() {
    if (this.isLoggedIn) {
      this.$router.push({ name: "Home" });
    }
  },
};
</script>

<style>
.logo-container {
  background-color: #d9d9d9;
  border-radius: 25px;
}
</style>
