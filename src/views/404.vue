<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="page-404-content primary--text text-center">
          <h2 class="mb-30">404</h2>
          <h4 class="mb-40">Page Not Found!</h4>
          <v-btn :to="{ name: 'DeviceList' }" color="primary" outlined x-large
            >Back to Home</v-btn
          >
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "404",
};
</script>

<style>
.page-404-content h2 {
  font-size: 120px;
  font-weight: 900;
}
.page-404-content h4 {
  font-size: 40px;
  color: #6a7c92;
}
.mb-30 {
  margin-bottom: 30px;
}
.mb-40 {
  margin-bottom: 40px;
}
</style>
