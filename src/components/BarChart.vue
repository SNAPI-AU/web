<template>
  <div id="barchart"></div>
</template>

<script>
import Plotly from "plotly.js-dist";

export default {
  name: "BarChart",

  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },

  computed: {
    getData() {
      return this.data;
    },
  },
  watch: {
    getData(oldValue, newValue) {
      if (newValue) {
        this.generateChart();
      }
    },
  },

  methods: {
    generateChart() {
      let chart = document.getElementById("barchart");
      Plotly.newPlot(
        chart,
        [
          {
            x: this.data.x,
            y: this.data.y,
            width: Array.from({ length: this.data.x.length }, () => 0.2),
            type: "bar",
          },
        ],
        {
          margin: { t: 30, l: 50, r: 20 },
          dragmode: "pan",
        },
        { scrollZoom: true, responsive: true }
      );
    },
  },
};
</script>

<style>
.modebar-btn.plotlyjsicon.modebar-btn--logo {
  display: none;
}

.main-svg {
  max-width: 100%;
}
</style>
