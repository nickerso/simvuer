<template>
  <div id="app">
    <div class="app">
      <h1>SimulationVuer</h1>
      <div v-if="datasetUrls.length !== 0">
        <h3>Dataset URLs (run in the browser):</h3>
        <el-radio-group v-model="activeResource" size="small">
          <el-radio-button :class="className(datasetUrl.id)" v-for="datasetUrl in datasetUrls" v-bind:key="datasetUrl.id" :label="datasetUrl.label" :value="datasetUrl.id" />
        </el-radio-group>
      </div>
    </div>
    <hr />
    <div v-for="resource in resources()" v-bind:key="resource.id">
      <div v-if="isResourceInitialised(resource.id)" v-show="resource.id === activeResource">
        <div v-if="typeof resource.id === 'number'">
          <span>
            <strong>Dataset <a :href="datasetUrl(resource.id)" target="_blank">{{ resource.id }}</a>:</strong> {{ resource.description }}
          </span>
          <hr />
        </div>
        <SimulationVuer :apiLocation="apiLocation" :id="resource.id" style="height: 640px;" />
      </div>
    </div>
    <div v-if="activeResource === -1">
      <div v-for="combineArchive in combineArchives" v-bind:key="combineArchive">
        <SimulationVuer :apiLocation="apiLocation" :id="combineArchive" style="height: 640px;" />
      </div>
    </div>
    <hr />
  </div>
</template>

<script>
import { SimulationVuer } from "@abi-software/simulationvuer";
import { ElRadioButton, ElRadioGroup } from "element-plus";
import "@abi-software/plotvuer/dist/style.css";

export default {
  name: "App",
  components: {
    SimulationVuer,
    ElRadioButton,
    ElRadioGroup,
  },
  data: function () {
    return {
      apiLocation: "",
      combineArchives: [],
      datasetUrls: [
        { id: "https://raw.githubusercontent.com/opencor/webapp/refs/heads/main/tests/models/ui/invalid.omex", label: "Invalid", description: "COMBINE archive" },
        { id: "https://raw.githubusercontent.com/opencor/webapp/refs/heads/main/tests/models/ui/135.omex", label: "135", description: "COMBINE archive" },
        { id: "https://raw.githubusercontent.com/opencor/webapp/refs/heads/main/tests/models/ui/157.omex", label: "157", description: "COMBINE archive" },
        { id: "https://raw.githubusercontent.com/opencor/webapp/refs/heads/main/tests/models/ui/lorenz.omex", label: "Lorenz", description: "COMBINE archive" },
        { id: "https://raw.githubusercontent.com/opencor/webapp/refs/heads/main/tests/models/ui/tt04.omex", label: "TT04", description: "COMBINE archive" },
        { id: "https://raw.githubusercontent.com/opencor/webapp/refs/heads/main/tests/models/ui/cvs.omex", label: "CVS", description: "COMBINE archive" },
      ],
      activeResource: 0,
      initialisedResources: [],
    };
  },
  methods: {
    className(id) {
      return ((this.datasetUrls.length !== 0) && (id === this.datasetUrls[0].id)) ?
              "first-resource" :
              "not-first-resource";
    },
    resources() {
      return this.datasetUrls;
    },
    isResourceInitialised(resource) {
      if (this.initialisedResources.includes(resource)) {
        return true;
      }

      if (this.activeResource === resource) {
        this.initialisedResources.push(resource);
      }

      return this.initialisedResources.includes(resource);
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.drop-area {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 192px;
  height: 48px;
  border: 2px dashed #8300bf;
  background-color: #f9f2fc;
  color: #8300bf;
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
}

.drop-area-active {
  background-color: #8300bf;
  color: white;
}

.el-button,
.el-button:hover {
  border-color: #8300bf;
  background-color: #8300bf;
}

.el-radio-button__inner {
  background-color: #f9f2fc;
  border-color: #8300bf;
  box-shadow: -1px 0 0 0 #8300bf !important;
  color: #8300bf;
}

.first-resource>.el-radio-button__inner {
  border-left: 1px solid #8300bf !important;
}

.not-first-resource>.el-radio-button__inner {
  border-left: 0 !important;
}

.el-radio-button__original-radio:checked+.el-radio-button__inner {
  background-color: #8300bf !important;
  border-color: #8300bf !important;
  color: white;
}

.el-radio-button__inner:hover {
  color: #8300bf;
}

a {
  color: #2c3e50;
}

div.app {
  text-align: center;
}

h3 {
  margin-bottom: 0;
}


</style>
