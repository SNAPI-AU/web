<template>
  <div class="text-end">
    <v-dialog v-model="dialog" persistent width="500">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          v-bind="attrs"
          v-on="on"
          color="muted"
          elevation="0"
          outlined
          class="rounded-10"
        >
          <v-icon left>mdi-export</v-icon>
          Export
        </v-btn>
      </template>

      <v-card class="pb-3">
        <v-card-title class="text-h6 lighten-2">
          Export
          <span v-if="title"
            >&nbsp;data
            <small class="ms-2 font-weight-bold text-muted grey--text"
              >({{ title }})</small
            ></span
          >
          <span v-else>&nbsp;all data</span>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="px-7">
          <v-radio-group
            v-model="row"
            class="my-5"
            hide-details
            v-if="selected"
            mandatory
            row
            @change="changeData"
          >
            <v-radio
              :ripple="false"
              :label="`Selection (${data.length})`"
              value="selection"
            ></v-radio>
            <v-radio
              :ripple="false"
              label="Export All"
              value="exportAll"
            ></v-radio>
          </v-radio-group>

          <v-autocomplete
            prepend-icon="mdi-file-outline"
            v-model="fileType"
            :items="fileTypes"
            label="File type:"
          ></v-autocomplete>
        </v-card-text>

        <v-card-actions class="px-7">
          <v-spacer></v-spacer>
          <v-btn
            color="muted"
            outlined
            elevation="0"
            small
            class="me-3"
            @click="cancelExport"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            elevation="0"
            small
            @click="innerPage ? exportInnerPageData() : exportToExcel()"
          >
            Ok
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { export_json_to_excel } from "@/helpers/js2excel";
import moment from "moment";
import { mapGetters } from "vuex";

export default {
  name: "ExoprtDialog",
  props: {
    data: {
      required: true,
    },
    selected: {
      type: Boolean,
      default: false,
    },
    dataSelection: {
      type: Array,
      default: () => [],
    },
    innerPage: {
      type: Boolean,
      default: false,
    },
    itemData: {
      type: Object,
      default: () => {},
    },
    listName: {
      type: String,
      default: () => "",
    },
    title: {
      type: String,
      default: () => "",
    },
  },
  data: () => {
    return {
      dialog: false,
      dataForExport: [],

      menu: false,
      row: "radio-1",

      fileType: "xlsx",
      fileTypes: ["xlsx", "txt", "csv"],
    };
  },

  computed: {
    ...mapGetters(["getTimezone"]),
  },

  methods: {
    changeData() {
      if (this.row === "exportAll") {
        this.dataForExport = this.dataSelection;
      } else {
        this.dataForExport = this.data;
      }
    },

    cancelExport() {
      // this.exportType = ''
      this.dialog = false;
    },

    /* eslint-disable */
    exportInnerPageData() {
      this.changeData();

      let tHeader1 = ["Meter ID", "Name", "Description", "Reader ID", " "];
      // const filterVal = ['data.cloudIncrement', 'houseNumber', 'description', 'deviceName'];
      const topHeaders = [
        this.itemData.meterNumber,
        this.itemData.houseNumber,
        this.itemData.description,
        this.itemData.deviceName,
      ];

      let tHeaders2 = ["Date", "Time", "Data", "Increment", "Image"];

      let tHeaders3 = [
        "Export Date",
        `${moment(new Date()).format("DD/MM/YYYY")}`,
      ];

      let data = [];
      data.push(topHeaders);

      data = data.concat(
        new Array(2)
          .fill()
          .map((e, i) => new Array(5).fill().map((e, i) => " "))
      );

      data.push(tHeaders3);

      data = data.concat(
        new Array(2)
          .fill()
          .map((e, i) => new Array(5).fill().map((e, i) => " "))
      );

      data.push(tHeaders2);

      data = data.concat(
        this.dataForExport.map((i, z) => {
          let filteredData = [];
          // let date = i.createTime.split(" ")[0];
          let date = moment(i.createTime)
            .utcOffset(this.getTimezone * 60)
            .format("DD-MM-YYYY");
          // let time = i.createTime.split(" ")[1];
          let time = moment(i.createTime)
            .utcOffset(this.getTimezone * 60)
            .format("HH:mm:ss");
          filteredData.push(
            date,
            time,
            i.data.number,
            i.data.cloudIncrement,
            `=IMAGE("https://api.snapi.com.au${i.path}")`
          );
          return filteredData;
        })
      );

      export_json_to_excel({
        header: tHeader1, //Header Required
        data, //Specific data Required
        filename: `SNAPI Export Data - Meter ${
          this.itemData.meterNumber
        } (${moment(this.itemData.gmtCreate).format("DD.MMM.YY")} - ${moment(
          this.itemData.lastTime
        ).format("DD.MMM.YY")})`, //Optional
        autoWidth: true, //Optional
        bookType: this.fileType, //Optional
      });
    },

    exportToExcel() {
      this.changeData();

      const tHeader = [
        "Device List Name",
        "Export Date",
        " ",
        " ",
        " ",
        " ",
        " ",
        " ",
        " ",
      ];

      const topHeaders = [
        this.listName,
        moment(new Date()).format("DD/MM/YYYY"),
      ];

      let tHeaders2 = [
        "Meter ID",
        "Name",
        "Description",
        "Latest Read Time - AEDT",
        "Last Read Value",
        "Image",
        "Reader ID",
        "Status",
        "Signal",
      ];

      let data = [];
      data.push(topHeaders);

      data = data.concat(
        new Array(3)
          .fill()
          .map((e, i) => new Array(9).fill().map((e, i) => " "))
      );

      data.push(tHeaders2);

      data = data.concat(
        this.dataForExport.map((i) => {
          let filteredData = [];

          filteredData.push(
            i.meterNumber,
            i.houseNumber,
            i.description,
            i.lastTime,
            i.cValue,
            `=IMAGE("https://api.snapi.com.au${i.recentPicPath}")`,
            i.deviceName,
            i.deviceStatus,
            i.signal
          );
          return filteredData;
        })
      );

      export_json_to_excel({
        header: tHeader, //Header Required
        data, //Specific data Required
        filename: `SNAPI Export Data - ${this.listName} Device List`, //Optional
        autoWidth: true, //Optional
        bookType: this.fileType, //Optional
      });
    },
  },
};
</script>
