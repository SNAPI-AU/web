<template>
  <v-container fluid>
    <v-sheet color="white" class="rounded-12 mx-auto">
      <v-container>
        <v-row>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              color="primary"
              outlined
              dense
              label="Search..."
              class="mx-4 caption"
              hide-details
            ></v-text-field>
          </v-col>
          <v-col md="auto" class="ms-auto me-2">
            <ExportDialog
              :listName="listName"
              :selected="selected.length > 0 ? true : false"
              :dataSelection="itemData()"
              :data="selected.length > 0 ? selected : itemData()"
            />
          </v-col>
          <v-col cols="12" class="px-5 py-0">
            <v-divider></v-divider>
          </v-col>
        </v-row>
      </v-container>
      <v-data-table
        :loading="sidebarLoading"
        checkbox-color="success"
        v-model="selected"
        :headers="headers"
        :items="itemData()"
        item-key="deviceName"
        class="elevation-0 bg-transparent pa-5"
        show-select
        :search="search"
        :custom-filter="filterOnlyCapsText"
      >
        <template v-slot:item.recentPicPath="{ item }">
          <div class="py-2 d-flex justify-center">
            <v-tooltip
              v-if="item.recentPicPath"
              top
              :nudge-top="-100"
              color="transparent"
              allow-overflow
            >
              <template v-slot:activator="{ on, attrs }">
                <img
                  :src="`//api.snapi.com.au${item.recentPicPath}`"
                  alt=""
                  v-bind="attrs"
                  v-on="on"
                  width="50"
                  height="120"
                  style="object-fit: contain"
                  :style="`transform: rotate(${item.angle}deg)`"
                />
              </template>

              <div
                :style="`transform: rotate(${item.angle}deg)`"
                style="padding: 10px"
              >
                <img
                  :src="`//api.snapi.com.au${item.recentPicPath}`"
                  alt=""
                  width="200"
                  height="440"
                  style="object-fit: contain"
                />
              </div>
            </v-tooltip>
            <span v-else>-</span>
          </div>
        </template>
        <template v-slot:item.lastTime="{ item }">
          <div class="py-2">
            <p class="mb-0" style="white-space: nowrap">
              Date:
              <span class="body-2 font-weight-bold ms-1">
                {{ getDate(item.lastTime) }}
              </span>
            </p>
            <p class="mb-0">
              Time:
              <span class="body-2 font-weight-bold ms-1">
                {{ getTime(item.lastTime) }}
              </span>
            </p>
          </div>
        </template>
        <template v-slot:item.description="{ item }">
          {{ item.description || "-" }}
        </template>
        <template v-slot:item.meterNumber="{ item }">
          <v-btn
            :to="{
              name: 'DeviceInner',
              params: { id: item.id },
              query: {
                applicationId: $route.query.applicationId,
                deviceName: item.deviceName,
                productKey: $route.query.productKey,
                meterId: item.meterNumber,
              },
            }"
            class="letter-spacing-normal"
            plain
            :ripple="false"
            text
            link
            color="primary"
          >
            {{ item.meterNumber || "-" }}
          </v-btn>
        </template>
        <template v-slot:item.deviceStatus="{ item }">
          <v-chip
            label
            elevation="0"
            style="border-radius: 8px"
            class="px-5 py-4"
            :color="getColor(item.status)"
            :class="`item-${item.deviceStatus}`"
          >
            <span v-if="item.deviceStatus === 1">Reading</span>
            <span v-if="item.deviceStatus === 3">Offline</span>
            <span v-if="item.deviceStatus === 2">Sleep</span>
          </v-chip>
        </template>
      </v-data-table>
    </v-sheet>
  </v-container>
</template>

<script>
import ExportDialog from "@/components/ExoprtDialog";
import { mapGetters } from "vuex";
import moment from "moment/moment";

export default {
  name: "DeviceList",
  components: {
    ExportDialog,
  },
  data() {
    return {
      selected: [],
      applicationId: null,
      productKey: null,
      listName: "",
      deviceList: [],
      search: "",

      headers: [
        // { text: 'Reader ID', value: 'deviceName', align: 'center' },
        { text: "Meter ID", value: "meterNumber", align: "center" },
        {
          text: "Name",
          value: "houseNumber",
          align: "center",
        },
        { text: "Description", value: "description", align: "center" },
        { text: "Date Time", value: "lastTime" },

        { text: "Data", value: "cValue", align: "center" },
        { text: "Image", value: "recentPicPath", align: "center" },
        {
          text: "Status",
          value: "deviceStatus",
          align: "center",
        },
      ],
    };
  },

  computed: {
    ...mapGetters([
      "sidebarLoading",
      "getTimezone",
      "getProjectAndDevicesByProductKey",
    ]),
  },

  watch: {
    $route() {
      this.itemData;
    },
  },

  methods: {
    itemData() {
      const info = this.getProjectAndDevicesByProductKey(
        parseInt(this.$route.query.applicationId),
        this.$route.query.productKey
      );
      this.listName = info.projectDetails.description;
      return info.devices;
    },

    getColor(item) {
      if (item === "Reading") {
        return "#F4FDF1";
      }
      if (item === "Sleep") {
        return "#F4F7FE";
      }
      if (item === "Offline") {
        return "#F8E7ED";
      }
    },

    filterOnlyCapsText(value, search) {
      return (
        value != null &&
        typeof value !== "undefined" &&
        search != null &&
        typeof value === "string" &&
        (value.toString().toLocaleLowerCase().indexOf(search) !== -1 ||
          value.toString().toLocaleUpperCase().indexOf(search) !== -1 ||
          value.toString().indexOf(search) !== -1)
      );
    },

    getDate(item) {
      return moment(item)
        .utcOffset(this.getTimezone * 60)
        .format("DD-MM-YYYY");
    },

    getTime(item) {
      return moment(item)
        .utcOffset(this.getTimezone * 60)
        .format("HH:mm:ss");
    },
  },

  mounted() {
    this.itemData();
  },
};
</script>

<style scoped>
/* ::v-deep .v-data-table tbody tr {
  cursor: pointer !important;
} */

::v-deep .v-data-footer {
  position: relative;
  bottom: -100px;
  border: 1px solid #e6e8ec;
  background: white;
  margin-top: -60px !important;
  width: calc(100% + 40px);
  left: -20px;
  padding-right: 20px !important;
  border-radius: 12px;
}
</style>

<style>
.letter-spacing-normal {
  letter-spacing: 0.03rem !important;
}
</style>
