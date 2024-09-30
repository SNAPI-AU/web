<template>
  <div id="chart"></div>
</template>

<script>
import Plotly from "plotly.js-dist";

export default {
  name: "LineChart",
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
      let chart = document.getElementById("chart");
      Plotly.newPlot(
        chart,
        [
          {
            x: this.data.x,
            y: this.data.y,
            fill: "tonexty",
            name: '',
            mode: "lines+markers",
            hovertemplate: '%{x|%H:%M:%S} || %{x|%d.%m.%Y} || Data: %{y:.0f}',
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
