<template>
  <v-app-bar fixed app elevation="0" color="white" class="py-1 px-6 navbar">
    <v-btn
      text
      link
      color="muted"
      v-if="$route.name === 'DeviceInner'"
      :ripple="false"
      plain
      class="px-0"
      @click="
        $router.push({
          name: 'DeviceList',
          query: {
            applicationId: $route.query.applicationId,
            productKey: $route.query.productKey,
          },
        })
      "
    >
      <v-icon>mdi-menu-left</v-icon>
      Back
    </v-btn>

    <v-toolbar-title class="title d-flex font-weight-medium">
      <span v-if="$route.name === 'DeviceList'">Device list</span>
      <span v-if="$route.name === 'CompanyList'">Device summary</span>
    </v-toolbar-title>

    <v-spacer></v-spacer>
    <div
      class="d-flex justify-center align-center"
      v-if="$route.name === 'DeviceInner' && !sidebarLoading"
    >
      <v-btn
        color="muted"
        @click="getPrevItem(itemData)"
        outlined
        small
        class="px-0 me-3 w-auto"
      >
        <v-icon small>mdi-arrow-left</v-icon>
      </v-btn>

      <h4 class="title font-weight-bold">Device Data</h4>
      <v-btn
        :disabled="nextDisabled"
        @click="getNextItem(itemData)"
        color="muted"
        outlined
        small
        class="px-0 ms-3 w-auto"
      >
        <v-icon small>mdi-arrow-right</v-icon>
      </v-btn>
    </div>

    <v-spacer></v-spacer>
    <v-col cols="3">
      <v-select
        v-model="timezone"
        hide-details
        item-text="currentTime"
        @input="changeTimezone"
        item-value="value"
        :items="timezones"
        label="Timezone"
      ></v-select>
    </v-col>
    <v-menu offset-y right>
      <template v-slot:activator="{ on, attrs }">
        <h6 class="subtitle-1 font-weight-bold ms-2" v-bind="attrs" v-on="on">
          {{ userMe.userName }}
        </h6>
        <v-btn
          outlined
          icon
          v-bind="attrs"
          v-on="on"
          color="light"
          class="me-3"
        >
          <v-icon color="muted" small>mdi-account-outline</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item @click="logoutAction" :ripple="false">
          <v-list-item-title> Log Out </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from "vuex";
import moment from "moment";
export default {
  name: "Navbar",

  data: () => {
    return {
      intervalFn: null,

      items: [{ title: "Documentation" }],
      nextDisabled: false,
      timezone: 10,

      timezones: [
        {
          name: "AEST",
          value: 10,
          offset: "+10:00",
          currentTime: 0,
        },
        {
          name: "AWST",
          value: 8,
          offset: "+08:00",
          currentTime: 0,
        },
        {
          name: "ACST",
          value: 9.5,
          offset: "+09:30",
          currentTime: 0,
        },
      ],
    };
  },
  computed: {
    ...mapGetters([
      "userMe",
      "getDeviceDetails",
      "sidebarLoading",
      "getProjectAndDevicesByProductKey",
    ]),

    itemData() {
      return this.getDeviceDetails(
        parseInt(this.$route.query.applicationId),
        this.$route.query.productKey,
        this.$route.query.deviceName
      );
    },
  },


  methods: {
    ...mapMutations(["awaitPromiseCallback", "changeTimezoneMutation"]),
    ...mapActions(["logout"]),


    changeTimezone() {
      this.changeTimezoneMutation(this.timezone);
    },

    getNextItem(activeItem) {
      const { devices } = this.getProjectAndDevicesByProductKey(
        parseInt(this.$route.query.applicationId),
        this.$route.query.productKey
      );
      if (devices.length <= 1) {
        return;
      }
      devices.forEach((device, index) => {
        if (device.deviceName === activeItem.deviceName) {
          let id, deviceName, meterId;
          if (index + 1 <= devices.length - 1) {
            id = devices[index + 1].id;
            deviceName = devices[index + 1].deviceName;
            meterId = devices[index + 1].meterNumber;
          } else {
            id = devices[0].id;
            deviceName = devices[0].deviceName;
            meterId = devices[0].meterNumber;
          }
          this.$router.push({
            name: "DeviceInner",
            params: { id },
            query: {
              applicationId: this.$route.query.applicationId,
              productKey: this.$route.query.productKey,
              deviceName,
              meterId,
            },
          });
        }
      });
    },
    getPrevItem(activeItem) {
      const { devices } = this.getProjectAndDevicesByProductKey(
        parseInt(this.$route.query.applicationId),
        this.$route.query.productKey
      );
      if (devices.length <= 1) {
        return;
      }
      devices.forEach((device, index) => {
        if (device.deviceName === activeItem.deviceName) {
          let id, deviceName, meterId;
          if (index - 1 >= 0) {
            id = devices[index - 1].id;
            deviceName = devices[index - 1].deviceName;
            meterId = devices[index - 1].meterNumber;
          } else {
            const length = devices.length - 1;
            id = devices[length].id;
            deviceName = devices[length].deviceName;
            meterId = devices[length].meterNumber;
          }
          this.$router.push({
            name: "DeviceInner",
            params: { id },
            query: {
              applicationId: this.$route.query.applicationId,
              productKey: this.$route.query.productKey,
              deviceName,
              meterId,
            },
          });
        }
      });
    },

    logoutAction() {
      this.logout();
      this.$router.push("/login");
    },
  },
  mounted() {
    this.intervalFn = setInterval(() => {
      // let selectedTz = this.timezones.find((e) => e.value === this.timezone);
      this.timezones.map((item) => {
        item.currentTime = `Current Time: ${moment(new Date())
          .utcOffset(item.value * 60)
          .format("HH:mm A")} (${item.name})`;
      });
      // selectedTz.currentTime = moment(new Date()).format("HH:mm:ss A");
    }, 1000);
  },

  beforeDestroy() {
    clearInterval(this.intervalFn);
  },
};
</script>

<style lang="scss" scoped>
::v-deep .v-btn.w-auto {
  min-width: auto;
  min-height: 18px !important;
  height: auto !important;
  padding: 5px !important;
}
::v-deep .theme--light.v-list-item::before {
  border-radius: 0 !important;
}
::v-deep .theme--light.v-list-item:hover::before {
  opacity: 0.12 !important;
}
::v-deep.v-menu__content {
  top: 60px !important;
  filter: drop-shadow(0px 2px 8px #e2e2e2);
  border-radius: 12px !important;
  border: none !important;
}
::v-deep .v-list-item__title,
::v-deep .v-select__selection--comma {
  font-size: 14px;
}
::v-deep .v-label {
  opacity: 0;
  transition: opacity .25s ease-in-out;
}

::v-deep.v-input:hover .v-label {
  opacity: 1;

}
</style>
