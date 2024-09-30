<template>
  <v-menu :close-on-content-click="false" :value="openMenu" class="custom-menu">
    <template v-slot:activator="{ on }">
      <v-btn v-if="icon" :color="color" v-on="on" block>
        <v-icon>{{ icon }}</v-icon>
      </v-btn>
      <v-list-item
        v-else-if="hasChildren"
        class="d-flex justify-space-between"
        v-on="on"
      >
        {{ name }}
        <div class="flex-grow-1"></div>
        <v-icon>mdi-chevron-right</v-icon>
      </v-list-item>
      <v-btn v-else :color="color" v-on="on" @click="openMenu = true" text>{{
        name
      }}</v-btn>
    </template>
    <v-list>
      <template v-for="(item, index) in menuItems">
        <v-divider v-if="item.isDivider" :key="'divider-' + index" />
        <template v-else-if="item.type === 'APPLICATION'">
          <Menu
            :key="'application-' + item.value"
            :name="item.label"
            :menu-items="item.children"
            @menu-click="emitClickEvent"
            :is-open-on-hover="false"
            :is-offset-x="true"
            :is-offset-y="false"
          />
        </template>
        <template v-else>
          <v-list-item
            :key="'list-item-' + index"
            @click="emitClickEvent(item)"
          >
            <v-list-item-title>{{ item.label }}</v-list-item-title>
          </v-list-item>
        </template>
      </template>
    </v-list>
  </v-menu>
</template>

<script>
export default {
  name: "Menu",
  components: {},
  props: {
    name: String,
    icon: String,
    menuItems: Array,
    color: { type: String, default: "primary" },
  },
  data() {
    return {
      openMenu: false,
    };
  },
  methods: {
    emitClickEvent(item) {
      this.$emit("menu-click", item);
      this.openMenu = false;
    },
  },
  computed: {
    hasChildren() {
      return this.menuItems.some((item) => item.type === "APPLICATION");
    },
  },
};
</script>

<style scoped>
.custom-menu {
  max-width: 200px;
}

.v-btn {
  display: block;
  width: 100%;
}
</style>
