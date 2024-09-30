import Vue from "vue";
import Vuex from "vuex";
import { userApi } from "@/api/user";
import axios from "axios";
import createPersistedState from "vuex-persistedstate";

Vue.use(Vuex);

function initialState() {
  return {
    company: {},
    awaitPromise: [],
    displaySidebar: true,
    historyCount: null,
    accessToken: "",
    refreshToken: "",
    me: {},
    history: {},
    sidebarload: false,
    currentPage: 1,
    pageSize: 100,
    historyLoading: false,
    timezone: 10,
    applications: { list: [], meta: {} },
    projects: { list: [], meta: {} },
    devices: { list: [], meta: {} },
    publicLibraryCount: null,
    publicLibraryData: {},
    publicLibraryLoading: false,
  };
}

// let baseUrl = process.env.VUE_APP_BASE_URL;
let baseUrl = "https://api.snapi.com.au/gateway";

export default new Vuex.Store({
  state: initialState,

  mutations: {
    awaitPromiseCallback(state, { key, cb }) {
      let current = state.awaitPromise.find((e) => e.key === key);
      if (!current) {
        cb();
      } else {
        current.callbacks.push(cb);
      }
    },
    toggleSidebar(state) {
      state.displaySidebar = !state.displaySidebar;
    },
    setAccessToken(state, payload) {
      state.accessToken = payload;
    },

    setRefreshToken(state, payload) {
      state.refreshToken = payload;
    },
    reset(state) {
      const s = initialState();
      Object.keys(s).forEach((key) => {
        state[key] = s[key];
      });
    },
    updateUser(state, payload) {
      state.me = payload;
      state.me.accessToken = state.accessToken;
    },
    updateCompanyDetails(state, payload) {
      state.company = payload;
    },
    deviceHistory(state, payload) {
      state.history = [];
      state.history = payload;
    },
    changeTimezoneMutation(state, payload) {
      state.timezone = payload;
    },
    addApplications(state, payload) {
      state.applications.list = payload.appList;
      state.applications.meta = payload.meta;
    },
    addProjects(state, payload) {
      state.projects.list = payload.projects;
      state.projects.meta = payload.meta;
    },
    addDevices(state, payload) {
      state.devices.list = payload.devices;
      state.devices.meta = payload.meta;
    },
    updateDeviceDetails(state, payload) {
      state.devices.list = state.devices.list.map((device) => {
        if (
          device.deviceName === payload.deviceName &&
          device.productKey === payload.productKey
        ) {
          return {
            ...device,
            ...payload,
          };
        }
        return device;
      });
    },
    publicLibrary(state, payload) {
      state.publicLibraryData = payload;
    },
    moveDeviceToProject(state, payload) {
      const devices = state.devices.list.map((device) => {
        if (
          device.deviceName === payload.deviceName &&
          device.productKey === payload.fromProject
        ) {
          return {
            ...device,
            productKey: payload.toProject,
          };
        }
        return device;
      });
      state.devices.list = devices;
    },
    addApplication(state, payload) {
      state.applications.list = [payload, ...state.applications.list];
    },
    addProject(state, payload) {
      state.projects.list = [payload, ...state.projects.list];
    },
    addDevice(state, payload) {
      state.devices.list = [payload, ...state.devices.list];
    },
    updateApplication(state, { applicationId, ...payload }) {
      state.applications.list = state.applications.list.map((application) => {
        if (application.id === applicationId) {
          return {
            ...application,
            ...payload,
          };
        }
        return application;
      });
    },
    updateProject(state, { projectId, ...payload }) {
      state.projects.list = state.projects.list.map((project) => {
        if (project.id === projectId) {
          return {
            ...project,
            ...payload,
          };
        }
        return project;
      });
    },
    updateDevice(state, { deviceId, ...payload }) {
      state.devices.list = state.devices.list.map((device) => {
        if (device.id === deviceId) {
          return {
            ...device,
            ...payload,
          };
        }
        return device;
      });
    },
    deleteApplication(state, applicationId) {
      state.applications.list = state.applications.list.filter(
        (application) => application.id !== applicationId
      );
    },
    deleteProject(state, projectId) {
      state.projects.list = state.projects.list.filter(
        (project) => project.id !== projectId
      );
    },
    deleteDevice(state, { productKey, deviceName }) {
      state.devices.list = state.devices.list.filter(
        (device) =>
          device.deviceName !== deviceName && device.productKey === productKey
      );
    },
    updateDeviceReadingHistory(state, { requestId, value }) {
      state.history.list = state.history.list.map((history) => {
        if (history.requestId !== requestId) {
          return history;
        }
        return {
          ...history,
          number: value,
        };
      });
    },
  },
  actions: {
    auth({ commit }, payload) {
      let headers = new Headers();
      headers.append("Content-Type", "application/x-www-form-urlencoded");

      let urlencoded = new URLSearchParams();
      urlencoded.append("username", payload.username);
      urlencoded.append("password", payload.password);
      urlencoded.append("grant_type", "password");

      let requestOptions = {
        method: "POST",
        headers: headers,
        body: urlencoded,
        redirect: "follow",
      };
      return userApi
        .call(`${baseUrl}/oauth/oauth/token`, requestOptions)
        .then((res) => {
          let a = new Date();
          a = a.setSeconds(a.getSeconds() + res.expires_in);
          localStorage.setItem("expires_in", a);
          commit("setAccessToken", res.access_token);
          commit("setRefreshToken", res.refresh_token);
        });
    },

    // test() {
    // let a = new Date()
    // a.setSeconds(a.getSeconds() + localStorage.getItem('expires_in'));
    // let b = new Date()
    // (a - b) / 1000 > expire_token
    // },

    getHistoryData({ state, commit }, payload) {
      state.historyLoading = true;
      axios
        .get(
          `${baseUrl}/data/v1/dataAndPic?productKey=${payload.productKey}&deviceName=${payload.deviceName}&startTimeStamp=${payload.startTime}&endTimeStamp=${payload.endTime}&currentPage=${payload.page}&pageSize=${payload.itemsPerPage}&isChart=true&access_token=${state.accessToken}`
        )
        .then((response) => response)
        .then((res) => {
          state.historyCount = res.data?.data?.total;

          commit("deviceHistory", res.data.data);
        })
        .finally(() => {
          state.historyLoading = false;
        });
    },

    getApplications(
      { commit, state, dispatch },
      {
        companyUser,
        companyId,
        applicationUser,
        applicationId,
        productUser,
        productId,
      }
    ) {
      state.sidebarload = true;

      const path = `${baseUrl}/manage/application`;
      const url = `${path}?currentPage=${state.currentPage}&pageSize=${state.pageSize}&companyId=${companyId}&access_token=${state.accessToken}`;

      return axios
        .get(url)
        .then((response) => response.data.data)
        .then((res) => {
          let appList = [];
          if (applicationUser || productUser) {
            appList = res.list.filter((app) => app.id === applicationId);
          } else {
            appList = res.list;
          }
          dispatch("getProjects", {
            companyUser,
            companyId,
            applicationUser,
            productUser,
            productId,
            appIds: appList.map((app) => app.id),
          });
          // TODO: add pagination support here
          const meta = res.data;
          commit("addApplications", { appList, meta });
        });
    },

    getProjects(
      { commit, state, dispatch },
      {
        companyUser,
        companyId,
        applicationUser,
        productUser,
        productId,
        appIds,
      }
    ) {
      return new Promise((res, rej) => {
        let projects = [];
        if (companyUser || applicationUser) {
          try {
            const getProjectByAppId = (_appId) =>
              `${baseUrl}/manage/product/application?currentPage=1&pageSize=100&applicationId=${_appId}&access_token=${state.accessToken}`;
            Promise.all(
              appIds.map((appId) =>
                axios
                  .get(getProjectByAppId(appId))
                  .then((response) => response.data)
                  .then((response) => response.data.list)
              )
            ).then((appProjects) => {
              projects = appProjects.flat();
              commit("addProjects", { projects, meta: {} });
              res(projects);
            });
          } catch (error) {
            rej(error);
          }
        } else if (productUser) {
          axios
            .get(
              `${baseUrl}/manage/product/id/${productId}?access_token=${state.accessToken}&id=${productId}`
            )
            .then((response) => response.data.data)
            .then((response) => {
              projects = [{ ...response, name: res.productName }];
              commit("addProjects", { projects, meta: {} });
              res(projects);
            });
        }
      }).then((projects) => {
        dispatch("getDevices", { projects, companyId });
      });
    },

    getDevices({ state, commit }, { projects, companyId }) {
      return new Promise((res, rej) => {
        try {
          const getDevicesByProject = (_productKey) =>
            `${baseUrl}/manage/v3/device?currentPage=${state.currentPage}&pageSize=100&productKey=${_productKey}&companyId=${companyId}&access_token=${state.accessToken}`;
          Promise.all(
            projects.map((project) =>
              axios
                .get(getDevicesByProject(project.productKey))
                .then((response) => response.data.data)
                .then((response) =>
                  response.list.map((device) => ({
                    ...device,
                    applicationId: project.applicationId,
                  }))
                )
            )
          ).then((devices) => {
            commit("addDevices", {
              devices: devices.filter((device) => device.length).flat(),
              meta: {},
            });
            res(projects);
          });
        } catch (error) {
          rej(error);
        } finally {
          state.sidebarload = false;
        }
      });
    },

    getUser({ commit, state, dispatch }) {
      let requestOptions = {
        method: "GET",
        redirect: "follow",
      };

      fetch(
        `${baseUrl}/oauth/oauth/userDetail?access_token=${state.accessToken}`,
        requestOptions
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            dispatch("logout", null, { root: true });
          }
        })
        .then((result) => {
          axios
            .get(
              `${baseUrl}/manage/company/companyUser?access_token=${state.accessToken}`
            )
            .then((response) => {
              commit("updateCompanyDetails", response.data.data);
            })

            .catch((e) => console.log(e));
          commit("updateUser", result.data);
          dispatch("getApplications", {
            companyUser: result.data.companyUser, // whether the user can access companies (first level)
            companyId: result.data.companyId,
            applicationUser: result.data.applicationUser, // whether the user can access applications (second level)
            applicationId: result.data.applicationId,
            productUser: result.data.productUser, // whether the user can access product (device)
            productId: result.data.productId,
          });
        })
        .catch((error) => {
          console.log(error);
          dispatch("logout", null, { root: true });
        });
    },

    logout({ dispatch }) {
      dispatch("clearAllState", null, { root: true });
    },

    clearAllState({ state, commit }) {
      state.awaitPromise = [];
      commit("reset");
      // commit("user/reset");
    },

    updateDeviceMeterNumber(
      { state, commit },
      { meterNumber, deviceName, productKey, deviceTypeCode }
    ) {
      return axios
        .put(
          `${baseUrl}/manage/device`,
          new URLSearchParams({
            access_token: state.accessToken,
            deviceName,
            deviceTypeCode,
            meterNumber,
            productKey,
          })
        )
        .then((response) => response.data.data)
        .then((response) => {
          commit("updateDeviceDetails", {
            deviceName: response.deviceName,
            productKey: response.productKey,
            meterNumber,
          });
        });
    },

    updateDeviceDescription(
      { state, commit },
      { description, deviceName, productKey, deviceTypeCode }
    ) {
      return axios
        .put(
          `${baseUrl}/manage/device`,
          new URLSearchParams({
            access_token: state.accessToken,
            deviceName,
            deviceTypeCode,
            description,
            productKey,
          })
        )
        .then((response) => response.data.data)
        .then((response) => {
          commit("updateDeviceDetails", {
            deviceName: response.deviceName,
            productKey: response.productKey,
            description,
          });
        });
    },

    updateDeviceHouseNumber(
      { state, commit },
      { houseNumber, deviceName, productKey, deviceTypeCode }
    ) {
      return axios
        .put(
          `${baseUrl}/manage/device`,
          new URLSearchParams({
            access_token: state.accessToken,
            deviceName,
            deviceTypeCode,
            houseNumber,
            productKey,
          })
        )
        .then((response) => response.data.data)
        .then((response) => {
          commit("updateDeviceDetails", {
            deviceName: response.deviceName,
            productKey: response.productKey,
            houseNumber,
          });
        });
    },
    getPublicLibrary({ state, commit }, payload) {
      state.publicLibraryLoading = true;
      state.publicLibraryData = { list: [] };
      axios
        .get(
          `${baseUrl}/manage/picture?productKey=${payload.productKey}&deviceName=${payload.deviceName}&currentPage=${payload.page}&pageSize=${payload.itemsPerPage}&access_token=${state.accessToken}`
        )
        .then((response) => response)
        .then((res) => {
          state.publicLibraryCount = res.data?.data?.total;

          commit("publicLibrary", res.data.data);
        })
        .finally(() => {
          state.publicLibraryLoading = false;
        });
    },
    migrateDevice({ state, commit }, { fromProject, toProject, deviceName }) {
      const url = `${baseUrl}/manage/device/migrateAustriaDevice`;
      return axios
        .post(
          url,
          new URLSearchParams({
            oldProductKey: fromProject,
            newProductKey: toProject,
            oldDeviceName: deviceName,
            access_token: state.accessToken,
          })
        )
        .then((response) => response.data)
        .then((response) => {
          if (response.code === 200) {
            commit("moveDeviceToProject", {
              fromProject,
              toProject,
              deviceName,
            });
            return toProject;
          }
          return undefined;
        });
    },
    deleteDevice({ state, commit }, { productKey, deviceName }) {
      return axios
        .delete(
          `${baseUrl}/manage/device`,
          new URLSearchParams({
            productKey,
            deviceName,
            access_token: state.accessToken,
          })
        )
        .then((response) => response.data)
        .then((response) => {
          if (response.code === 200) {
            commit("deleteDevice", { deviceName, productKey });
          }
        });
    },
    deleteProject({ state, commit }, { productKey, id }) {
      return axios
        .delete(
          `${baseUrl}/manage/product/${productKey}?access_token=${state.accessToken}`
        )
        .then((response) => response.data)
        .then((response) => {
          if (response.code === 200) {
            commit("deleteProject", id);
            return true;
          }
          return false;
        });
    },
    deleteApplication({ state, commit }, { applicationId }) {
      return axios
        .delete(
          `${baseUrl}/manage/application/${applicationId}?access_token=${state.accessToken}`
        )
        .then((response) => response.data)
        .then((response) => {
          if (response.code === 200) {
            commit("deleteApplication", applicationId);
            return true;
          }
          return false;
        });
    },
    updateDeviceReading(
      { state, commit },
      { requestId, number, deviceName, timeStamp }
    ) {
      return axios
        .put(
          `${baseUrl}/data/v1/cloud/value`,
          new URLSearchParams({
            access_token: state.accessToken,
            deviceName,
            requestId,
            number,
            timeStamp,
          })
        )
        .then((response) => {
          console.log("response from api", response);
         return response.data.data
        })
        .then((response) => {

          commit("updateDeviceReadingHistory", {
            requestId,
            value: response.number,
          });
        });
    },
  },
  getters: {
    getTotalRecords(state) {
      return state.historyCount;
    },
    getAppTree(state) {
      // Sidebar app tree
      const projects = state.projects.list.map((project) => ({
        id: project.id,
        name: project.productName,
        applicationId: project.applicationId,
        productKey: project.productKey,
        description: project.description,
        type: "PROJECT",
      }));

      const devices = state.devices.list.map((device) => ({
        id: device.id,
        name: device.meterNumber,
        productId: device.productId,
        productKey: device.productKey,
        deviceName: device.deviceName,
        applicationId: device.applicationId,
        type: "DEVICE",
      }));

      const list = state.applications.list
        .map((app) => ({
          id: app.id,
          name: app.name,
          children: [],
          type: "APPLICATION",
          description: app.description,
        }))
        .map((application) => {
          const projectList = projects
            .filter((project) => project.applicationId === application.id)
            .map((project) => {
              return {
                ...project,
                children: devices.filter(
                  (d) => d.productKey === project.productKey
                ),
              };
            });
          return {
            ...application,
            children: [...application.children, ...projectList],
          };
        });
      return { list };
    },
    getSidebar(state) {
      return state.displaySidebar;
    },
    getAccessToken(state) {
      return state.accessToken;
    },
    isLoggedIn(state) {
      return !!state.accessToken;
    },
    userMe(state) {
      return state.me;
    },

    sidebarLoading(state) {
      return state.sidebarload;
    },

    getHistoryList(state) {
      return state.history;
    },
    getHistoryLoading(state) {
      return state.historyLoading;
    },
    getCompanyDetails(state) {
      return state.company;
    },
    getTimezone(state) {
      return state.timezone;
    },
    // Get total no devices under a specific application
    getTotalDevices:
      (state) =>
        (applicationId = undefined) => {
          if (applicationId) {
            return state.devices.list.filter(
              (device) =>
                parseInt(device.applicationId) === parseInt(applicationId)
            ).length;
          }
          return state.devices.list.length;
        },
    // Get project and devices by productKey and applicationId
    getProjectAndDevicesByProductKey:
      (state) => (applicationId, productKey) => {
        if (productKey) {
          const projectDetails = state.projects.list.find(
            (project) =>
              project.productKey === productKey &&
              project.applicationId === applicationId
          );
          const devices = state.devices.list.filter(
            (device) =>
              device.productKey === productKey &&
              device.applicationId === applicationId
          );
          return { projectDetails, devices };
        }
        return [];
      },
    getDeviceDetails: (state) => (applicationId, productKey, deviceName) => {
      return state.devices.list.find(
        (device) =>
          parseInt(device.applicationId) === parseInt(applicationId) &&
          device.productKey === productKey &&
          device.deviceName === deviceName
      );
    },
    getPublicLibraryLoading(state) {
      return state.publicLibraryLoading;
    },
    getPublicLibraryList(state) {
      return state.publicLibraryData;
    },
    getDeviceMigrationOptions: (state) => (productKey) => {
      const projects = state.projects.list
        .map((project) => ({
          id: project.id,
          name: project.productName,
          applicationId: project.applicationId,
          productKey: project.productKey,
          type: "PROJECT",
        }))
        .filter((project) => project.productKey !== productKey);

      return state.applications.list
        .map((app) => ({
          value: app.id,
          label: app.name,
          type: "APPLICATION",
        }))
        .map((application) => {
          const projectList = projects
            .filter((project) => project.applicationId === application.value)
            .map((project) => {
              return {
                value: project.productKey,
                label: project.name,
                type: project.type,
              };
            });
          return {
            ...application,
            children: projectList,
          };
        })
        .filter((application) => application.children.length);
    },
    canMigrateDevice(state) {
      return state.projects.list.length > 1;
    },
  },
  plugins: [createPersistedState()],
});
