<template>
  <v-container fluid>
    <v-row>
      <!--      <v-col cols="12" md="6">-->
      <!--        <v-card class="elevation-0 rounded-10">-->
      <!--          <v-card-text>-->
      <!--            <div class="d-flex align-center mb-5">-->
      <!--              <h3 class="ms-4 text-dark">Device Count</h3>-->
      <!--              <div class="ms-auto">-->
      <!--                <v-btn-->
      <!--                  v-for="item in btnGroup"-->
      <!--                  :key="item.name"-->
      <!--                  elevation="0"-->
      <!--                  :outlined="!item.checked"-->
      <!--                  :color="!item.checked ? 'muted' : 'primary'"-->
      <!--                  :ripple="false"-->
      <!--                  @click="toggleRadios(item, 'btnGroup')"-->
      <!--                  class="py-md-4 py-3 mt-3 mb-3"-->
      <!--                  small-->
      <!--                  :class="-->
      <!--                    item.value === 'week' ? 'border-end-0' : 'border-start-0'-->
      <!--                  "-->
      <!--                >-->
      <!--                  {{ item.name }}-->
      <!--                </v-btn>-->
      <!--              </div>-->
      <!--            </div>-->

      <!--            <LineChart type="line" :data="deviceCountSeries" />-->
      <!--          </v-card-text>-->
      <!--        </v-card>-->
      <!--      </v-col>-->
      <!--      <v-col cols="12" md="6">-->
      <!--        <v-card class="elevation-0 rounded-10 fill-height">-->
      <!--          <v-card-text class="fill-height">-->
      <!--            <div-->
      <!--              :class="-->
      <!--                Object.keys(productCountDifferenceSeries).length === 0-->
      <!--                  ? 'fill-height flex-column'-->
      <!--                  : 'align-center'-->
      <!--              "-->
      <!--              class="d-flex mb-10 mt-5"-->
      <!--            >-->
      <!--              <h3 class="ms-4 text-dark">Daily Reads</h3>-->
      <!--              <div-->
      <!--                v-if="Object.keys(productCountDifferenceSeries).length === 0"-->
      <!--                class="d-flex fill-height align-center justify-center"-->
      <!--              >-->
      <!--                No Available Data-->
      <!--              </div>-->
      <!--            </div>-->
      <!--            <LineChart-->
      <!--              v-if="Object.keys(productCountDifferenceSeries).length > 0"-->
      <!--              type="line"-->
      <!--              :data="productCountDifferenceSeries"-->
      <!--            />-->
      <!--          </v-card-text>-->
      <!--        </v-card>-->
      <!--      </v-col>-->
      <v-col cols="12">
        <v-card class="elevation-0 rounded-10">
          <v-card-text>
            <div class="d-flex align-center mb-10 mt-5">
              <h3 class="ms-4 text-dark">
                Devices {{ getTotalDevices(applicationId) }}
              </h3>
            </div>

            <BarChart type="bar" :data="distributionListSeries" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import BarChart from "@/components/BarChart";
// import LineChart from "@/components/LineChart";
import axios from "axios";
// import { Y } from 'plotly.js-dist'
import { mapGetters } from "vuex";

export default {
  name: "DeviceDist",
  components: {
    // LineChart,
    BarChart,
  },

  data: () => {
    return {
      baseUrl: process.env.VUE_APP_BASE_URL,
      companyId: null,
      showReadChart: false,
      applicationId: 6,
      btnGroup: [
        {
          name: "Week",
          value: "week",
          checked: true,
        },
        {
          name: "Month",
          value: "month",
          checked: false,
        },
      ],

      selected: "week",

      deviceCount: [],
      productCount: [],
      distributionList: [],

      deviceCountSeries: {},

      productCountDifferenceSeries: {},

      distributionListSeries: {},
    };
  },
  computed: {
    ...mapGetters(["getAccessToken", "getTimezone", "getTotalDevices"]),
  },
  //
  watch: {
    $route(to, from) {

      if (from) {
        this.applicationId = this.$route.params.id;
        this.getDeviceCount();
        this.getProductCountDifference();
        this.getDistribution();
      }
    },
  },

  methods: {
    toggleRadios(item, objectName) {
      if (!item.checked) {
        this[objectName].map((e) => {
          if (e.name !== item.name) {
            e.checked = false;
          }
          item.checked = true;
          this.selected = item.value;
        });
      }
      this.getDeviceCount();
    },

    getProductCountDifference() {
      axios
        .get(
          `${this.baseUrl}/manage/queryProductCountDifference?applicationId=${this.applicationId}&access_token=${this.getAccessToken}`
        )
        .then((response) => response.data.data)
        .then((res) => {
          this.productCount = res;
          let data = {};

          if (this.productCount?.length > 0) {
            data.x = [];
            data.y = [];
            this.productCount?.map((item) => {
              data.x.push(item.month);
              data.y.push(item.difference);
            });
          }

          this.productCountDifferenceSeries = data;
        });
    },

    getDeviceCount() {
      axios
        .get(
          `${this.baseUrl}/data/v1/statistic/message/count?startTime=1667246400000&endTime=1669230511053&applicationId=${this.applicationId}&interval=${this.selected}&access_token=${this.getAccessToken}`
        )
        .then((response) => response.data.data)
        .then((res) => {
          this.deviceCount = res;
          let data = {};
          data.x = [];
          data.y = [];
          this.deviceCount?.map((item, index) => {
            data.x.push(item.startTime);
            data.y.push(index + 1);
          });
          this.deviceCountSeries = data;
        });
    },

    getDistribution() {
      axios
        .get(
          `${this.baseUrl}/manage/product/application?currentPage=${this.$store.state.currentPage}&pageSize=999&applicationId=${this.applicationId}&access_token=${this.getAccessToken}`
        )
        .then((response) => response.data.data)
        .then((res) => {
          this.distributionList = res;

          let data = {};
          data.x = [];
          data.y = [];
          this.distributionList?.list?.map((item) => {
            data.x.push(item.productName);
            data.y.push(item.deviceCount);
          });
          this.distributionListSeries = data;
        });
    },
  },

  mounted() {
    this.applicationId = this.$route.params.id;
    this.getDeviceCount();
    this.getProductCountDifference();
    this.getDistribution();
    // this.$watch("$route", route => {
    //   // this.currentRoute = route.path;
    //   console.log('$route is changed', route)
    // });
  },
};
</script>

<style>
.border-start-0 {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.border-end-0 {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
</style>
