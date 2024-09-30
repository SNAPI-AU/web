<template>
  <v-navigation-drawer :value="getSidebar" floating fixed app>
    <v-list-item class="py-2 ps-4 pe-10">
      <v-list-item-avatar v-if="getCompanyDetails.iconPath">{{
        getCompanyDetails.iconPath
      }}</v-list-item-avatar>
      <v-list-item-title class="font-weight-bold">
        {{ getCompanyDetails.companyName }}
      </v-list-item-title>
    </v-list-item>
    <div class="px-5 pt-2">
      <v-text-field
        clearable
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        label="Search"
        hide-details
        single-line
      ></v-text-field>
    </div>
    <div class="px-5 pt-2">
      <v-btn @click="openDialog('CreateApplication')">Create Application</v-btn>
    </div>
    <v-progress-circular
      v-if="sidebarLoading"
      indeterminate
      selectable
      color="primary"
    ></v-progress-circular>

    <template v-else>
      <v-treeview
        ref="tree"
        :items="getAppTree.list"
        active-class="primary--text"
        item-key="name"
        :search="search"
        :filter="filter"
        open-on-click
        hoverable
        class="getCompanyDetails.iconPath"
        expand-icon="mdi-chevron-down"
      >
        <template v-slot:label="{ item }">
          <v-list-item class="px-2" :ripple="false">
            <!-- Item content -->
            <span class="item-title" @click="goTo(item)">{{ item.name }}</span>

            <v-spacer></v-spacer>
            <v-menu offset-y>
              <template v-slot:activator="{ on, attrs }">
                <v-icon v-on="on" v-bind="attrs" class="ml-auto"
                  >mdi-dots-vertical</v-icon
                >
              </template>

              <!-- Menu items -->
              <v-list>
                <v-list-item
                  v-if="item.type === 'APPLICATION'"
                  @click="openDialog('CreateProduct', item)"
                  >Create Product</v-list-item
                >
                <v-list-item
                  v-if="item.type !== 'DEVICE'"
                  @click="
                    openDialog(
                      item.type === 'APPLICATION'
                        ? 'UpdateApplication'
                        : 'UpdateProduct',
                      item
                    )
                  "
                  >Update</v-list-item
                >
                <v-list-item @click="openDialog('Delete', item)"
                  >Delete</v-list-item
                >
              </v-list>
            </v-menu>
          </v-list-item>
        </template>
      </v-treeview>

      <!-- Dialog for Create Application action -->
      <v-dialog v-model="createApplicationDialog" persistent max-width="500">
        <v-card>
          <v-card-title class="text-h6 lighten-2">
            Create Item
            <!-- Additional title styling if needed -->
          </v-card-title>
          <!-- Your create form or content goes here -->
          <v-divider></v-divider>
          <v-form ref="form" @submit.prevent="handleCreateApplication()">
            <v-divider></v-divider>
            <!-- Mandatory Fields -->
            <v-card-text class="px-7">
              <v-text-field
                v-model="applicationName"
                label="Name"
                required
                placeholder="e.g., Address"
              ></v-text-field>
              <v-textarea
                v-model="applicationDescription"
                label="Description"
                required
                placeholder="e.g., Business Description"
              ></v-textarea>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions class="px-7">
              <v-spacer></v-spacer>
              <v-btn
                color="muted"
                outlined
                elevation="0"
                small
                @click="closeDialog('CreateApplication')"
              >
                Cancel
              </v-btn>
              <v-btn type="submit" color="primary" elevation="0" small>
                Ok
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card>
      </v-dialog>

      <!-- Dialog for Create Product action -->
      <v-dialog v-model="createProductDialog" persistent max-width="500">
        <v-card>
          <v-card-title class="text-h6 lighten-2">
            Create Item
            <!-- Additional title styling if needed -->
          </v-card-title>
          <!-- Your create form or content goes here -->
          <v-divider></v-divider>
          <v-form ref="form" @submit.prevent="handleCreateProduct()">
            <v-divider></v-divider>
            <!-- Mandatory Fields -->
            <v-card-text class="px-7">
              <v-text-field
                v-model="productName"
                label="Name"
                required
                placeholder="e.g., Product Name"
              ></v-text-field>
              <v-textarea
                v-model="productDescription"
                label="Product Description"
                required
                placeholder="e.g., ProductDescription"
              ></v-textarea>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions class="px-7">
              <v-spacer></v-spacer>
              <v-btn
                color="muted"
                outlined
                elevation="0"
                small
                @click="closeDialog('CreateProduct')"
              >
                Cancel
              </v-btn>
              <v-btn type="submit" color="primary" elevation="0" small>
                Ok
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card>
      </v-dialog>

      <v-dialog v-model="updateApplicationDialog" persistent max-width="500">
        <v-card>
          <v-card-title class="text-h6 lighten-2">
            Update Application
          </v-card-title>
          <v-divider></v-divider>
          <v-form ref="form" @submit.prevent="handleUpdateApplication()">
            <v-divider></v-divider>
            <!-- Mandatory Fields -->
            <v-card-text class="px-7">
              <v-text-field
                v-model="applicationName"
                label="Name"
                required
                placeholder="e.g., Address"
                >{{ this.applicationName }}</v-text-field
              >
              <v-textarea
                v-model="applicationDescription"
                label="Description"
                required
                placeholder="e.g., Business Description"
                >{{ this.applicationDescription }}</v-textarea
              >
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions class="px-7">
              <v-spacer></v-spacer>
              <v-btn
                color="muted"
                outlined
                elevation="0"
                small
                @click="closeDialog('UpdateApplication')"
              >
                Cancel
              </v-btn>
              <v-btn type="submit" color="primary" elevation="0" small>
                Ok
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card>
      </v-dialog>

      <v-dialog v-model="updateProductDialog" persistent max-width="500">
        <v-card>
          <v-card-title class="text-h6 lighten-2">
            Update Product
          </v-card-title>
          <v-divider></v-divider>
          <v-form ref="form" @submit.prevent="handleUpdateProduct()">
            <v-divider></v-divider>
            <!-- Mandatory Fields -->
            <v-card-text class="px-7">
              <v-text-field
                v-model="productName"
                label="Product Name"
                required
                placeholder="e.g., Product Name"
                >{{ this.productName }}</v-text-field
              >
              <v-textarea
                v-model="productDescription"
                label="Product Description"
                required
                placeholder="e.g., Product Description"
                >{{ this.productDescription }}</v-textarea
              >
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions class="px-7">
              <v-spacer></v-spacer>
              <v-btn
                color="muted"
                outlined
                elevation="0"
                small
                @click="closeDialog('UpdateProduct')"
              >
                Cancel
              </v-btn>
              <v-btn type="submit" color="primary" elevation="0" small>
                Ok
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card>
      </v-dialog>

      <!-- Dialog for Delete action -->
      <v-dialog v-model="deleteDialog" max-width="500">
        <v-card>
          <template v-if="dialogOptions.type === 'APPLICATION'">
            <v-card-title>Delete Application</v-card-title>
            <v-card-subtitle>
              Are you sure you want to delete application :
              {{ dialogOptions.name }} ?
            </v-card-subtitle>
            <v-card-subtitle v-if="dialogOptions.children.length > 0">
              Please delete the projects to proceed further
            </v-card-subtitle>
          </template>
          <template v-if="dialogOptions.type === 'PROJECT'">
            <v-card-title>Delete Project</v-card-title>
            <v-card-subtitle>
              Are you sure you want to delete project :
              {{ dialogOptions.name }} ?
            </v-card-subtitle>
            <v-card-subtitle v-if="dialogOptions.children.length > 0">
              Please delete the devices to proceed further
            </v-card-subtitle>
          </template>
          <template v-if="dialogOptions.type === 'DEVICE'">
            <v-card-title>Delete Device</v-card-title>
            <v-card-subtitle>
              Are you sure you want to delete device :
              {{ dialogOptions.meterNumber }} ?
            </v-card-subtitle>
          </template>
          <v-card-actions>
            <v-btn color="primary" elevation="0" small @click="handleDelete()">
              Yes
            </v-btn>
            <v-btn small @click="closeDialog('Delete')">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>

    <template v-slot:append>
      <v-pagination
        v-if="getAppTree && getAppTree.pages > 1"
        v-model="getAppTree.pageNum"
        :length="getAppTree.pages"
        prev-icon="mdi-menu-left"
        next-icon="mdi-menu-right"
        @input="changePage($event)"
        @next="next"
        @previous="prev"
        circle
      ></v-pagination>
      <v-divider class="my-3"></v-divider>
      <div
        class="pt-1 pb-2 px-2 mb-2 text-center justify-center d-flex align-center"
      >
        <p class="mb-0 text-center caption ms-4 text--disabled">
          Copyright &copy; 2023
          <br />
          SNAPI Control Centre
        </p>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from "vuex";
import axios from "axios";

export default {
  name: "Sidebar",
  data: () => ({
    model: 1,
    drawer: false,
    search: "",
    caseSensitive: true,
    createApplicationDialog: false,
    createProductDialog: false,
    updateApplicationDialog: false,
    updateProductDialog: false,
    deleteDialog: false,
    applicationName: "",
    applicationDescription: "",
    productName: "",
    productDescription: "",
    itemType: "",

    baseUrl: process.env.VUE_APP_BASE_URL,
    openNodes: [],
    dialogOptions: {},
  }),

  computed: {
    ...mapGetters([
      "getSidebar",
      "userMe",
      "getAppTree",
      "getAccessToken",
      "sidebarLoading",
      "getCompanyDetails",
    ]),

    filter() {
      return this.caseSensitive
        ? (item, search, textKey) => item[textKey]?.indexOf(search) > -1
        : undefined;
    },
  },

  watch: {
    $route() {
      this.toggleActive();
    },
  },
  methods: {
    ...mapMutations(["awaitPromiseCallback", "addApplication"]),
    ...mapActions([
      "logout",
      "deleteApplication",
      "deleteProject",
      "deleteDevice",
    ]),
    //
    // updateOpen(node) {
    //   console.log('this function is working')
    //   const index = this.openNodes.indexOf(node.id);
    //   if (index > -1) {
    //     this.openNodes.splice(index, 1);
    //   } else {
    //     this.openNodes = [node.id];
    //   }
    // },

    openDialog(action, options = {}) {
      // Open the corresponding dialog based on the action
      this.dialogOptions = options;
      console.log("The options are ", options);
      if (action === "CreateApplication") {
        this.createApplicationDialog = true;
      } else if (action === "CreateProduct") {
        this.createProductDialog = true;
      } else if (action === "UpdateApplication") {
        this.updateApplicationDialog = true;
        this.applicationName = options.name;
        this.applicationDescription = options.description;
      } else if (action === "UpdateProduct") {
        this.updateProductDialog = true;
        this.productName = options.name;
        this.productDescription = options.description;
      } else if (action === "Delete") {
        this.deleteDialog = true;
      }
    },

    closeDialog(action) {
      // Close the corresponding dialog based on the action
      if (action === "CreateApplication") {
        this.createApplicationDialog = false;
        this.applicationName = "";
        this.applicationDescription = "";
      } else if (action === "CreateProduct") {
        this.createProductDialog = false;
        this.productName = "";
        this.productDescription = "";
      } else if (action === "UpdateApplication") {
        this.updateApplicationDialog = false;

      } else if (action === "UpdateProduct") {
        this.updateProductDialog = false;
      } else if (action === "Delete") {
        this.deleteDialog = false;
      }
      this.dialogOptions = {};
    },

    changePage(page) {
      this.$store.state.currentPage = page;
      this.getApplications({
        companyUser: this.user.companyUser, // whether the user can access companies (first level)
        companyId: this.userMe.companyId,
        applicationUser: this.user.applicationUser, // whether the user can access applications (second level)
        applicationId: this.user.applicationId,
        productUser: this.user.productUser, // whether the user can access product (device)
        productId: this.user.productId,
      });
    },

    next() {
      this.$store.state.currentPage = this.$store.state.currentPage + 1;
    },

    prev() {
      this.$store.state.currentPage = this.$store.state.currentPage - 1;
    },

    goTo(item) {
      if (item.type === "APPLICATION") {
        if (
          this.$route.name !== "CompanyList" ||
          (this.$route.name === "CompanyList" &&
            this.$route.params.id !== item.id)
        ) {
          this.$router.push({ name: "CompanyList", params: { id: item.id } });
        }
      } else if (item.type === "PROJECT") {
        if (
          this.$route.name !== "DeviceList" ||
          (this.$route.name === "DeviceList" &&
            this.$route.params.id !== item.id)
        ) {
          this.$router.push({
            name: "DeviceList",
            params: { id: item.id },
            query: {
              applicationId: item.applicationId,
              productKey: item.productKey,
            },
          });
        }
      } else if (item.type === "DEVICE") {
        if (
          this.$route.name !== "DeviceInner" ||
          (this.$route.name === "DeviceInner" &&
            this.$route.params.id !== item.id)
        ) {
          this.$router.push({
            name: "DeviceInner",
            params: { id: item.id },
            query: {
              applicationId: item.applicationId,
              deviceName: item.deviceName,
              productKey: item.productKey,
              meterId: item.meterNumber,
            },
          });
        }
      }
    },

    handleCreateApplication() {
      console.log("item type is ", this.itemType);
      // Create payload using mandatory fields
      const payload = {
        name: this.applicationName,
        description: this.applicationDescription,
        companyId: this.userMe.companyId,
        accessToken: this.getAccessToken,
      };

      // Make POST request
      axios
        .post(
          `${this.baseUrl}/manage/application?access_token=${this.getAccessToken}`,
          new URLSearchParams(payload)
        )
        .then((res) => res.data)
        .then((response) => {
          // Handle success response
          console.log("Item created successfully:", response.data);
          // Close the dialog if needed
          this.closeDialog("CreateApplication");
          this.$store.commit("addApplication", response.data);
        })
        .catch((error) => {
          // Handle error response
          console.error("Error creating item:", error);
          // Optionally, show an error message to the user
          // You can use a Snackbar or any other method
        });
    },

    handleCreateProduct() {
      // Validate the form
      if (this.$refs.form.validate()) {
        const payload = {
          productName: this.productName,
          description: this.productDescription,
          companyId: this.userMe.companyId,
          accessToken: this.getAccessToken,
          applicationId: this.dialogOptions.id,
        };
        axios
          .post(
            `${this.baseUrl}/manage/product?access_token=${this.getAccessToken}`,
            new URLSearchParams(payload)
          )
          .then((res) => res.data)
          .then((response) => {
            // Handle success response
            console.log("Item created successfully:", response.data);

            // Close the dialog if needed
            this.closeDialog("CreateProduct");
            this.$store.commit("addProject", response.data);
            this.dialogOptions = {};
          })
          .catch((error) => {
            // Handle error response
            console.error("Error creating item:", error);
            // Optionally, show an error message to the user
            // You can use a Snackbar or any other method
          });
      }
    },
    handleUpdateApplication() {
      console.log("item type is ", this.itemType);
      // Create payload using mandatory fields

      // Make PUT request
      axios
        .put(
          `${this.baseUrl}/manage/application`,
          new URLSearchParams({
            access_token: this.getAccessToken,
            description: this.applicationDescription,
            name: this.applicationName,
            id: this.dialogOptions.id,
          })
        )
        .then((response) => response.data.data)
        .then((response) => {
          this.$store.commit("updateApplication", {
            applicationId: response.id,
            name: response.name,
            description: response.description,
          });
        });

      this.closeDialog("UpdateApplication");
    },

    handleUpdateProduct() {
      console.log("item type is ", this.itemType);
      // Create payload using mandatory fields

      const project = this.$store.state.projects.list.find(project => project.id === this.dialogOptions.id)

      // Make PUT request
      axios
        .put(
          `${this.baseUrl}/manage/product`,
          new URLSearchParams({
            access_token: this.getAccessToken,
            productKey: this.dialogOptions.productKey,
            description: this.productDescription,
            productName: this.productName,
            deviceTypeCode: project.deviceTypeCode,
            companyId: this.userMe.companyId,
            applicationId: this.dialogOptions.applicationId,
          })
        )
        .then((response) => response.data.data)
        .then((response) => {
          this.$store.commit("updateProject", {
            projectId: response.id,
            name: response.name,
            description: response.description,
          });
        });

      this.closeDialog("UpdateProduct");
    },

    handleDelete() {
      if (this.dialogOptions.type === "APPLICATION") {
        this.deleteApplication({
          applicationId: this.dialogOptions.id,
        }).then((isDeleted) => {
          this.$router.push({ path: "/" });
          if (isDeleted) {
            this.dialogOptions = {};
            this.closeDialog("Delete");
          }
        });
      } else if (this.dialogOptions.type === "PROJECT") {
        // redirecting to parent item, to avoid errors in current project (device-list) page.
        this.$router.push({
          name: "CompanyList",
          params: { id: this.dialogOptions.id },
        });
        this.deleteProject({
          productKey: this.dialogOptions.productKey,
          id: this.dialogOptions.id,
        }).then((isDeleted) => {
          if (isDeleted) {
            this.dialogOptions = {};
            this.closeDialog("Delete");
          }
        });
      } else if (this.dialogOptions.type === "DEVICE") {
        // redirecting to parent item, to avoid errors in current project (device-list) page.
        this.$router.push({
          name: "DeviceList",
          params: { id: this.dialogOptions.id },
          query: {
            applicationId: this.dialogOptions.applicationId,
            productKey: this.dialogOptions.productKey,
          },
          });
        this.deleteDevice({
          productKey: this.dialogOptions.productKey,
          deviceName: this.dialogOptions.deviceName,
        }).then((isDeleted) => {
          if (isDeleted) {
            this.dialogOptions = {};
            this.closeDialog("Delete");
          }
        });
      }
    },

    toggleActive() {
      this.$refs.tree.active.push(this.$route.query.meterId);
    },
  },

  created() {
    this.awaitPromiseCallback({
      key: "accessToken",
      cb: () => {
        if (!this.getAccessToken) {
          this.logout();
          this.$router.push("/login");
        }
      },
    });
  },
};
</script>

<style>
.v-treeview-node__toggle--open,
.v-treeview-node__toggle--open + .v-treeview-node__content {
  color: #4776ff !important;
}
.theme--light.v-list-item:not(.v-list-item--active):not(.v-list-item--disabled) {
  color: inherit !important;
}
.v-list-item .v-list-item__title {
  font-weight: 600 !important;
}
.v-list-group__header.v-list-item--active:not(:hover):not(:focus):before {
  opacity: 0 !important;
}
.theme--light.v-list-item:hover::before,
.theme--light.v-list-item--active:hover::before,
.theme--light.v-list-item--active::before {
  opacity: 0 !important;
}
.v-progress-circular {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.v-pagination {
  scale: 0.75;
}
.item-title {
  width: 100%;
}
</style>
