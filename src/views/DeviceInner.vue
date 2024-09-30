<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card v-if="!sidebarLoading" class="rounded-10 elevation-0 mt-2">
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4" sm="6">
                <v-list dense>
                  <v-list-item>
                    <span class="font-weight-bold body-2 me-3">
                      Meter ID:
                    </span>
                    <div contenteditable @blur="handleUpdateDeviceMeterNumber" ref="editableMeterNumber"
                      class="editable-content">
                      {{ meterNumber }}
                    </div>
                  </v-list-item>
                  <v-list-item>
                    <span class="font-weight-bold body-2 me-3">
                      Reader ID:
                    </span>
                    {{ deviceName }}
                  </v-list-item>
                </v-list>
              </v-col>
              <v-col cols="12" md="4" sm="6">
                <v-list dense>
                  <v-list-item>
                    <span class="font-weight-bold body-2 me-3"> Name: </span>
                    <div contenteditable @blur="handleUpdateDeviceHouseNumber" ref="editableDeviceHouseNumber"
                      class="editable-content">
                      {{ houseNumber }}
                    </div>
                  </v-list-item>
                  <v-list-item>
                    <span class="font-weight-bold body-2 me-3">
                      Description:
                    </span>
                    <div contenteditable @blur="handleUpdateDeviceDescription" ref="editableDeviceDescripion"
                      class="editable-content">
                      {{ description }}
                    </div>
                  </v-list-item>
                </v-list>
              </v-col>
              <v-col cols="12" md="4" sm="6">
                <v-list dense>
                  <v-list-item>
                    <span class="font-weight-bold body-2 me-3">Status:</span>
                    <v-chip :class="`item-${deviceStatus}`" :color="getColor(deviceStatus)" class="px-5 py-4"
                      elevation="0" label style="border-radius: 8px">
                      <span v-if="deviceStatus === 1">Reading</span>
                      <span v-if="deviceStatus === 3">Offline</span>
                      <span v-if="deviceStatus === 2">Sleep</span>
                    </v-chip>
                  </v-list-item>
                  <v-list-item>
                    <span class="font-weight-bold body-2 me-3">
                      Signal Strength:
                    </span>
                    <v-icon class="mdi mdi-signal me-2" small></v-icon>
                    {{ signal }}
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
            <v-row v-if="canMigrateDevice">
              <v-col cols="2">
                <Menu name="Move Reader" :menu-items="getDeviceMigrationOptions($route.query.productKey)
                  " @menu-click="onMenuItemClick" />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="rounded-10 elevation-0">
          <v-card-text class="pa-0">
            <v-tabs v-model="tab" class="rounded-10">
              <v-tab v-for="item in items" :key="item" class="font-weight-bold text-capitalize">
                {{ item }}
              </v-tab>
            </v-tabs>
            <v-tabs-items v-model="tab" class="rounded-10">
              <v-tab-item v-for="item in items" :key="item">
                <v-card v-if="item === 'Read Data'" flat>
                  <v-card-text class="px-0">
                    <v-row class="px-4">
                      <v-col cols="12" sm="6">
                        <v-menu ref="menu" v-model="menu" :close-on-content-click="false" :return-value.sync="date"
                          min-width="auto" offset-y transition="scale-transition">
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field v-model="dateRangeText" append-icon="mdi-calendar" dense hide-details
                              label="Start Date    —    End date" outlined readonly v-bind="attrs"
                              v-on="on"></v-text-field>
                          </template>
                          <v-date-picker v-model="date" no-title range scrollable>
                            <v-spacer></v-spacer>
                            <v-btn color="primary" text @click="menu = false">
                              Cancel
                            </v-btn>
                            <v-btn color="primary" text @click="saveHistory(date)">
                              OK
                            </v-btn>
                            <v-btn v-if="date.length > 0" text color="primary" @click="$refs.menu[0].save([])">Clear
                            </v-btn>
                          </v-date-picker>
                        </v-menu>
                      </v-col>
                      <v-col class="text-end" cols="12" sm="6">
                        <ExportDialog v-if="!getHistoryLoading" :data="deviceHistory" :itemData="itemData()"
                          :title="dateRangeText" innerPage />
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col class="pb-0" cols="12">
                        <v-data-table ref="dataTable" v-model="selected" :footer-props="{
                          'items-per-page-options': [10, 25, 50, 100, 500, 1000, 2500, 5000],
                        }" :headers="headers" :items="deviceHistory" :items-per-page="25" :loading="getHistoryLoading"
                          :options.sync="options" :server-items-length="getTotalRecords" checkbox-color="success"
                          class="elevation-0 bg-transparent" item-key="lastTime">
                          <template v-slot:item.cloudIncrement="{ item }">
                            <p>{{ item.data.cloudIncrement }}</p>
                          </template>
                          <template v-slot:item.path="{ item }">
                            <v-tooltip :nudge-top="-150" allow-overflow color="transparent" top>
                              <template v-slot:activator="{ on, attrs }">
                                <img :src="getImageAbsUrl(item.path)" :style="`transform: rotate(${item.angle}deg)`"
                                  alt="" height="120" style="object-fit: contain" v-bind="attrs" width="50" v-on="on" />
                              </template>
                              <div :style="`transform: rotate(${item.angle}deg)`" style="padding: 10px">
                                <img :src="getImageAbsUrl(item.path)" alt="" height="440" style="object-fit: contain"
                                  width="200" />
                              </div>
                            </v-tooltip>
                          </template>
                          <template v-slot:item.data="{ item }">
                            <div class="py-2 d-flex">
                              <div v-if="editableReading === item.requestId"
                                @input="updateItem(item, 'number', $event)" 
                                contenteditable 
                                @blur="stopEditing"
                                @keydown.enter.prevent="stopEditing" 
                                @keydown.esc="cancelEditing">
                                {{ item.data.number }}
                              </div>
                              <div v-else @click="startEditing(item.requestId)">
                                {{ item.data.number }}
                              </div>
                            </div>
                          </template>
                          <template v-slot:item.createTime="{ item }">
                            <div class="py-2 text-left">
                              <p class="mb-0" style="white-space: nowrap">
                                Date:
                                <span class="body-2 font-weight-bold ms-1">
                                  {{ getDate(item.createTime) }}
                                </span>
                              </p>
                              <p class="mb-0">
                                Time:
                                <span class="body-2 font-weight-bold ms-1">
                                  {{ getTime(item.createTime) }}
                                </span>
                              </p>
                            </div>
                          </template>
                          <template v-slot:item.electricity="{ item }">{{
                            getPeriod(item)
                          }}</template>
                        </v-data-table>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
                <v-card v-if="item === 'Device Configuration'" class="px-10" flat>
                  <v-card-text class="px-0">
                    <v-select :items="wakeUpItems" v-model="wakeUpInterval" item-text="name" item-value="value" dense
                      label="Wake-up mode" outlined></v-select>
                    <div v-if="wakeUpInterval === 2">
                      <v-row>
                        <v-col cols="12" md="6"><v-text-field outlined dense type="number" label="Every" min="1"
                            v-model="interval"></v-text-field></v-col>
                        <v-col cols="12" md="6"><v-select outlined dense :items="timeIntervals" item-text="name"
                            item-value="value" v-model="selectedInterval"></v-select></v-col>
                      </v-row>
                    </div>
                    <div v-if="wakeUpInterval === 1">
                      <v-row class="align-center">
                        <v-col cols="auto">
                          <span class="font-weight-bold">at</span>
                        </v-col>
                        <v-col>
                          <v-text-field hide-details min="0" type="number" outlined dense v-model="hours"
                            label="Hours"></v-text-field>
                        </v-col>
                        <v-col cols="auto" class="text-center">
                          <div class="d-flex align-center">
                            <span class="mx-2 font-weight-bold">:</span>
                          </div>
                        </v-col>
                        <v-col>
                          <v-text-field hide-details min="0" type="number" outlined dense v-model="minutes"
                            label="Minutes"></v-text-field>
                        </v-col>
                        <v-col cols="auto">
                          <span class="font-weight-bold">
                            (AEDT)
                          </span>
                        </v-col>
                      </v-row>
                    </div>
                  </v-card-text>
                  <v-card-actions class="pb-5">
                    <v-spacer></v-spacer>
                    <v-btn small text @click="tab = 0">Cancel</v-btn>
                    <v-btn small elevation="0" color="primary" @click="configDevice">Save</v-btn>
                  </v-card-actions>
                </v-card>
                <!-- Public library container begins -->
                <v-card v-if="item === 'Image Library'" class="px-10" flat>
                  <v-container grid-list-md v-if="!getPublicLibraryLoading">
                    <v-layout row wrap>
                      <v-row>
                        <v-col v-for="publicLib in publicLibraryPics" :key="publicLib.id" cols="12" md="6" lg="4">
                          <v-card>
                            <v-tooltip :nudge-top="20" allow-overflow top color="#F3F8FF">
                              <template v-slot:activator="{ on, attrs }">
                                <v-img :src="getImageAbsUrl(publicLib.path)" aspect-ratio="1" contain max-height="100"
                                  min-height="100" v-bind="attrs" v-on="on">
                                </v-img>
                              </template>
                              <div style="padding: 5px">
                                <v-img :src="getImageAbsUrl(publicLib.path)" contain aspect-ratio="1" max-height="350"
                                  min-height="100" height="350" width="350">
                                </v-img>
                              </div>
                            </v-tooltip>
                            <v-card-title>{{ publicLib.value }}</v-card-title>
                            <div class="d-flex flex-column mb-6 bg-surface-variant align-center">
                              <v-sheet class="mb-2">
                                <v-icon small>mdi-calendar</v-icon>
                                {{ getDate(publicLib.createTime) }}
                              </v-sheet>
                              <v-sheet class="mb-2">
                                <v-icon small>mdi-clock</v-icon>
                                {{ getTime(publicLib.createTime) }}
                              </v-sheet>
                            </div>
                          </v-card>
                        </v-col>
                      </v-row>
                    </v-layout>
                  </v-container>
                  <v-card-text v-else>
                    <v-progress-circular indeterminate selectable color="primary"></v-progress-circular>
                  </v-card-text>
                </v-card>
                <!-- Public library container  ends -->
              </v-tab-item>
            </v-tabs-items>
          </v-card-text>
        </v-card>
      </v-col>
      <deviceInnerChart />
    </v-row>
  </v-container>
</template>

<script>
import deviceInnerChart from "@/components/DeviceInnerChart";
import ExportDialog from "@/components/ExoprtDialog";
// import LineChart from '@/components/LineChart'
import moment from "moment";
import { mapActions, mapGetters } from "vuex";
import axios from "axios";
import Menu from "@/components/Menu";

export default {
  name: "DeviceInner",
  components: {
    ExportDialog,
    // LineChart,
    deviceInnerChart,
    Menu,
  },
  data: () => {
    return {
      baseUrl: process.env.VUE_APP_BASE_URL,
      editableReading: null,

      interval: 1,
      selectedInterval: 1,

      hours: "",
      minutes: "",

      meterNumber: "",
      deviceName: "",
      description: "",
      houseNumber: "",
      deviceStatus: "",
      signal: "",
      productKey: "",
      deviceTypeCode: "",

      options: {},
      date: [],
      menu: false,
      tab: null,
      items: ["Read Data", "Device Configuration", "Image Library"],

      selected: [],
      //   singleSelect: '',
      headers: [
        { text: "Data", value: "data", sortable: false, align: "center" },
        {
          text: "Increment",
          value: "cloudIncrement",
          sortable: false,
          align: "center",
        },
        { text: "Time", value: "createTime", sortable: false, align: "center" },
        {
          text: "Interval (hr)",
          value: "electricity",
          sortable: false,
          align: "center",
        },
        {
          text: "Image",
          value: "path",
          sortable: false,
          align: "center",
          width: "150px",
        },
      ],

      wakeUpInterval: 2,

      wakeUpItems: [
        {
          name: "Wake-up at intervals",
          value: 2,
        },
        {
          name: "Wake-up at daily",
          value: 1,
        },
      ],

      historySeries: {},
    };
  },

  computed: {
    ...mapGetters([
      "sidebarLoading",
      "getHistoryLoading",
      "getHistoryList",
      "getTotalRecords",
      "getTimezone",
      "getAccessToken",
      "getDeviceDetails",
      "getPublicLibraryLoading",
      "getPublicLibraryList",
      "getDeviceMigrationOptions",
      "canMigrateDevice",
    ]),


    timeIntervals() {
      if (this.interval <= 1) {
        return [
          {
            name: "day",
            value: 24 * 60,
          },
          {
            name: "hour",
            value: 60,
          },
          {
            name: "minute",
            value: 1,
          },
        ]
      }
      return [
        {
          name: "days",
          value: 24 * 60,
        },
        {
          name: "hours",
          value: 60,
        },
        {
          name: "minutes",
          value: 1,
        },
      ]

    },


    intervalForCall() {
      if (this.wakeUpInterval == 2) {
        return this.selectedInterval * this.interval;
      }
      return "";
    },


    deviceHistory() {
      return this.getHistoryList?.list;
    },
    // getFullHistory() {
    //   return this.getHistoryList
    // },
    dateRangeText() {
      return this.date.join(" - ");
    },
    publicLibraryPics() {
      return this.getPublicLibraryList?.list || [];
    },
  },

  watch: {
    hours(newVal) {
      // Ensure the value is within 0 and 23
      this.hours = Math.min(Math.max(parseInt(newVal, 10) || 0, 0), 23)
        .toString()
        .padStart(2, "0");
    },
    minutes(newVal) {
      // Ensure the value is within 0 and 59
      this.minutes = Math.min(Math.max(parseInt(newVal, 10) || 0, 0), 59)
        .toString()
        .padStart(2, "0");
    },

    $route(newVal) {
      this.getHistory();
      this.fetchPublicLibrary(this.tab);
      if (newVal) {
        this.date = []
        setTimeout(() => {
          this.getAwakeConfig(newVal.query.productKey, newVal.query.deviceName);
          this.itemData()
        }, 300)
      }

    },

    options: {
      handler() {
        this.getHistory();
      },
      deep: true,
    },

    deviceHistory() {
      this.fillChart();
    },
    tab(activeTabIndex) {
      this.fetchPublicLibrary(activeTabIndex)
    },
  },

  methods: {
    ...mapActions([
      "getHistoryData",
      "updateDeviceMeterNumber",
      "updateDeviceDescription",
      "updateDeviceHouseNumber",
      "migrateDevice",
      "updateDeviceReading",
    ]),

    updateItem(item, field, event) {
      console.log("item", item);
      console.log("field", field);
      console.log("event", event);


      // Update the property directly using the item
      item.data[field] = event.target.textContent;
      console.log("text content", event.target.textContent);
      
      this.updateDeviceReading({
        requestId: item.requestId,
        number: event.target.textContent,
        deviceName: this.deviceName,
        timeStamp: moment(item.createTime)
          .utcOffset(this.getTimezone * 60)
          .valueOf() / 1000,
        // "2024-01-29 22:21:06"
      });
    },
    stopEditing() {
      this.editableReading = null;
    },
    cancelEditing() {
      this.editableReading = null;
      // fetch the original value from a backup or API call
    },
    startEditing(reqId) {
      console.log(reqId);
      this.editableReading = reqId;
    },

    fetchPublicLibrary(activeTabIndex) {
      if (this.items[activeTabIndex] === "Image Library") {
        this.$store.dispatch("getPublicLibrary", {
          productKey: this.$route.query.productKey,
          deviceName: this.$route.query.deviceName,
          page: 1,
          itemsPerPage: 12,
        });
      }
    },

    handleUpdateDeviceMeterNumber() {
      this.updateDeviceMeterNumber({
        meterNumber: this.$refs.editableMeterNumber.innerText,
        deviceName: this.deviceName,
        productKey: this.productKey,
        deviceTypeCode: this.deviceTypeCode,
      });
    },

    handleUpdateDeviceDescription() {
      this.updateDeviceDescription({
        description: this.$refs.editableDeviceDescripion.innerText,
        deviceName: this.deviceName,
        productKey: this.productKey,
        deviceTypeCode: this.deviceTypeCode,
      });
    },

    handleUpdateDeviceHouseNumber() {
      this.updateDeviceHouseNumber({
        houseNumber: this.$refs.editableDeviceHouseNumber.innerText,
        deviceName: this.deviceName,
        productKey: this.productKey,
        deviceTypeCode: this.deviceTypeCode,
      });
    },

    itemData() {
      const deviceData = this.getDeviceDetails(
        this.$route.query.applicationId,
        this.$route.query.productKey,
        this.$route.query.deviceName
      );
      if (!deviceData) {
        return {};
      }
      this.meterNumber = deviceData.meterNumber;
      this.deviceName = deviceData.deviceName;
      this.description = deviceData.description;
      this.houseNumber = deviceData.houseNumber;
      this.deviceStatus = deviceData.deviceStatus;
      this.signal = deviceData.signal;
      this.productKey = deviceData.productKey;
      this.deviceTypeCode = deviceData.deviceTypeCode;

      return deviceData;
    },

    configDevice() {
      axios
        .put(
          `${this.baseUrl}/manage/wakeConfig?productKey=${this.$route.query.productKey
          }&mode=${this.wakeUpInterval}&interval=${this.wakeUpInterval === 2 ? this.intervalForCall : 1440
          }&hour=${this.wakeUpInterval === 1 ? this.hours : " "}&minute=${this.wakeUpInterval === 1 ? this.minutes : " "
          }&deviceName=${this.deviceName}&access_token=${this.getAccessToken
          }&timeZone=11`
        )
        .then((response) => response.data.data)
        .then((res) => {
          console.log(res);
        });
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
    getHistory() {
      let obj = {
        productKey: this.$route.query.productKey,
        deviceName: this.$route.query.deviceName,
        startTime: this.date[0]
          ? Date.parse(
            this.date[0].split("-").join("/") + ", " + "12:00:00 AM"
          ) / 1000
          : Date.parse("10/20/2018, 12:00:00 AM") / 1000,
        endTime: this.date[1]
          ? Date.parse(
            this.date[1].split("-").join("/") + ", " + "11:59:59 PM"
          ) / 1000
          : parseInt((Date.now() / 1000).toFixed()),
        itemsPerPage: this.options ? this.options.itemsPerPage : 10,
        page: this.options ? this.options.page : 1,
      };
      this.getHistoryData(obj);
    },

    fillChart() {
      // this.historySeries.labels = []
      // this.historySeries.datasets[0].data = []
      let data = {};
      data.x = [];
      data.y = [];

      this.deviceHistory?.map((item) => {
        data.x.push(item.createTime);
        data.y.push(item.data.number);
      });
      this.historySeries = data;
    },

    saveHistory(date) {
      this.$refs.menu[0].save(date);
      this.getHistory();
    },

    getDate(item) {
      return moment(item)
        .utcOffset(this.getTimezone * 60)
        .format("DD-MM-YYYY");
    },

    getPeriod(item) {
      let index = this.deviceHistory.indexOf(item);
      // if (index  1 >= 0) {
      if (this.deviceHistory[index + 1]) {


        let date1 = moment(
          this.convertTime(item.createTime),
          "DD-MM-YYYY HH:mm:ss"
        );
        let date2 = moment(
          this.convertTime(this.deviceHistory[index + 1].createTime),
          "DD-MM-YYYY HH:mm:ss"
        );

        let difference = date1.diff(date2, "hours");

        return difference;
      }

      return "0";
    },

    convertTime(item) {
      return moment(item)
        .utcOffset(this.getTimezone * 60)
        .format("DD-MM-YYYY HH:mm:ss");
    },

    getTime(item) {
      return moment(item)
        .utcOffset(this.getTimezone * 60)
        .format("HH:mm:ss");
    },
    getAwakeConfig(prodkey, deviceName) {
      axios
        .get(`${this.baseUrl}/manage/wakeConfig/keyAndName?productKey=${prodkey}&deviceName=${deviceName}&access_token=${this.getAccessToken}`)
        .then((response) => response.data.data)
        .then((res) => {

          this.wakeUpInterval = res.mode
          this.interval = res.interval

          if (this.interval >= 60) {
            this.selectedInterval = 60
            this.interval = (res.interval / 60).toFixed(0)
          }
          if (this.interval >= 1440) {
            this.selectedInterval = 24 * 60
            this.interval = (res.interval / (24 * 60)).toFixed(0)
          }
          this.hours = res.hour
          this.minutes = res.minute
          // console.log(res)
        });
    },
    getImageAbsUrl(imgPath) {
      return `${this.baseUrl.replace("/gateway", "")}${imgPath}`;
    },
    onMenuItemClick(item) {
      if (item.value) {
        this.$store
          .dispatch("migrateDevice", {
            toProject: item.value,
            fromProject: this.$route.query.productKey,
            deviceName: this.deviceName,
          })
          .then((toProject) => {
            if (toProject) {
              this.$router.push({
                name: "DeviceInner",
                params: { id: this.$route.params.id },
                query: {
                  applicationId: this.$route.query.applicationId,
                  deviceName: this.deviceName,
                  productKey: toProject,
                },
              });
            }
          });
      }
    },
  },

  mounted() {
    this.getHistory();
    this.getAwakeConfig(this.$route.query.productKey, this.$route.query.deviceName);

  },
};
</script>

<style scoped>
::v-deep .v-data-table__wrapper {
  border-radius: 0 !important;
}

::v-deep .v-tab {
  letter-spacing: 0.03rem;
}
</style>

<style lang="scss">
.v-tooltip__content.menuable__content__active {
  opacity: 1 !important;
}

.v-slide-group__content::before {
  content: "";
  position: absolute;
  width: 100%;
  height: 2px;
  background-color: #ccc;
  bottom: 0;
}
</style>
