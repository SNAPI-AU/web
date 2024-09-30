<template>
  <div>
    <Navbar />
    <Sidebar />
    <div class="toggler-wrapper" :class="getSidebar ? 'open' : ''">
      <v-btn
        color="white"
        small
        elevation="0"
        class="px-0 toggler-button"
        @click="toggleNavbar"
      >
        <v-icon v-if="getSidebar" small>mdi-chevron-left</v-icon>
        <v-icon v-else small>mdi-chevron-right</v-icon>
      </v-btn>
    </div>
    <v-container fluid style="height: calc(100vh - 80px); overflow-y: auto">
      <router-view />
    </v-container>
  </div>
</template>

<script>
import Navbar from "@/components/Navbar.vue";
import Sidebar from "@/components/Sidebar.vue";
import { mapMutations, mapGetters, mapActions } from "vuex";

export default {
  name: "Base",
  components: {
    Navbar,
    Sidebar,
  },

  computed: {
    ...mapGetters(["getSidebar", "isLoggedIn", "userMe"]),
  },

  methods: {
    ...mapActions(["getUser"]),
    ...mapMutations(["toggleSidebar"]),

    toggleNavbar() {
      this.toggleSidebar();
    },
  },

  mounted() {
    this.getUser();
  },
};
</script>

<style lang="scss" scoped>
.toggler-wrapper {
  z-index: 12;
  position: absolute;
  left: 0;
  top: 30px;
  &.open {
    transform: translateX(-50%);
  }
}

.toggler-button.v-btn::v-deep {
  border-radius: 50px;
  filter: drop-shadow(0px 2px 8px #e2e2e2);
  height: 24px !important;
  min-width: 24px !important;
}
</style>
