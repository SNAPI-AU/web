<template>
  <v-col cols="12" md="6">
    <v-card class="rounded-10 elevation-0">
      <v-card-text>
        <LineChart type="line" :data="historySeries" />
      </v-card-text>
    </v-card>
  </v-col>
</template>

<script>
// import ExportDialog from '@/components/ExoprtDialog'
import axios from "axios";
import LineChart from "@/components/LineChart";
import { mapGetters } from "vuex";

export default {
  name: "deviceInnerChart",
  components: {
    // ExportDialog,
    LineChart,
  },
  data: () => {
    return {
      // options: {},
      // date: [],
      // menu: false,
      // tab: null,
      // items: ['History Data', 'Device Configuration'],

      // selected: [],
      //   singleSelect: '',
      // headers: [
      //     { text: 'Data', value: 'data', sortable: false, align: 'center' },
      //     {
      //         text: 'Increment',
      //         value: 'cloudIncrement',
      //         sortable: false,
      //         align: 'center',
      //     },
      //     { text: 'Time', value: 'createTime', sortable: false, align: 'center' },
      //     {
      //         text: 'Period (hr)',
      //         value: 'electricity',
      //         sortable: false,
      //         align: 'center',
      //     },
      //     { text: 'Image', value: 'path', sortable: false, align: 'center', width: '150px' },
      // ],

      historySeries: {},
      getHistoryList: [],
    };
  },

  computed: {
    ...mapGetters([
      "getAccessToken",
      // 'getDataLevels',
      // 'sidebarLoading',
      // 'getHistoryLoading',
      // 'getHistoryList',
      // 'getTotalRecords',
    ]),

    itemData() {
      let item = {};
      if (this.getDataLevels?.list) {
        this.getDataLevels?.list?.filter((e) => {
          if (e.id === parseInt(this.$route.query.applicationId)) {
            e?.children?.filter((subItem) => {
              if (
                subItem.applicationId ===
                  parseInt(this.$route.query.applicationId) &&
                subItem.productKey == this.$route.query.productKey
              ) {
                subItem.children?.map((i) => {
                  if (i.deviceName === this.$route.query.deviceName) {
                    item = i;
                  }
                });
              }
            });
          }
        });
      }
      return item;
    },

    deviceHistory() {
      return this.getHistoryList?.list;
    },
    // getFullHistory() {
    //   return this.getHistoryList
    // },
    dateRangeText() {
      return this.date.join(" ~ ");
    },
  },

  watch: {
    $route() {
      this.getHistory();
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
  },

  methods: {
    // ...mapActions(['getHistoryData']),

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
        startTime:
          Date.parse(
            new Date(new Date().setFullYear(2018))
              .toISOString()
              .split("T")[0]
              .split("-")
              .join("/") + ", 12:00:00 AM"
          ) / 1000,
        endTime:
          Date.parse(
            new Date().toISOString().split("T")[0].split("-").join("/") +
              ", 11:59:59 PM"
          ) / 1000,
        itemsPerPage: 2000,
        page: this.options ? this.options.page : 1,
      };
      this.getHistoryData(obj);
    },

    getHistoryData(payload) {
      let baseUrl = process.env.VUE_APP_BASE_URL;
      axios
        .get(
          `${baseUrl}/data/v1/dataAndPic?productKey=${payload.productKey}&deviceName=${payload.deviceName}&startTimeStamp=${payload.startTime}&endTimeStamp=${payload.endTime}&currentPage=${payload.page}&pageSize=${payload.itemsPerPage}&isChart=true&access_token=${this.getAccessToken}`
        )
        .then((response) => response)
        .then((res) => {
          this.getHistoryList = res.data.data;
        })
        .finally(() => {});
    },

    fillChart() {
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
  },

  mounted() {
    this.getHistory();
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

/* ::v-deep .v-menu__content.menuable__content__active {
  
} */
</style>

<style>
/* .fit-to-img {
  margin-bottom: -7px;
} */
/* .v-input--is-disabled.v-text-field > .v-input__control > .v-input__slot,
.v-input--is-disabled.v-text-field:hover
  > .v-input__control:hover
  > .v-input__slot:hover {
  cursor: not-allowed !important;
  pointer-events: all !important;
}
.v-label--is-disabled,
.v-input--selection-controls__ripple,
.v-input--selection-controls .v-input__slot,
[disabled] {
  cursor: not-allowed !important;
} */

.v-slide-group__content::before {
  content: "";
  position: absolute;
  width: 100%;
  height: 2px;
  background-color: #ccc;
  bottom: 0;
}
</style>

<div>
  <canvas id="myChart"></canvas>
</div>
