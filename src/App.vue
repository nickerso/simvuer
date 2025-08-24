<template>
  <div id="app">
    <div class="app">
      <div class="helper-text">
        <p>
          <b><i>SimVuer</i></b> - a simple test web app for playing with specific simulation experiments. Mathematical models are encoded in <a href="https://cellml.org/">CellML</a>, simulation protocols in <a href="https://sed-ml.org/">SED-ML</a>, and both are packaged together in a <a href="https://doi.org/10.1186/s12859-014-0369-z">COMBINE archive</a>, including the information used to create the user interface displayed below. FAIR implementations of the models and associated resources are persistently archived on the <a href="https://models.physiomeproject.org/">Physiome Model Repository</a>. 
        </p>
        <p>
          This app uses the <a href="https://github.com/ABI-Software/simulationvuer">SimulationVuer component</a> developed for the <a href="https://sparc.science">SPARC Portal</a>. See the relevant documentation for more information on how to use this interface: <a href="https://docs.sparc.science/docs/simulation-viewer-overview">https://docs.sparc.science/docs/simulation-viewer-overview</a>. Note that this is a simple test app, and so does not include all the features of the full SimulationVuer component, such as the ability to upload your own COMBINE archives. The source code for this app is available on <a href="https://github.com/nickerso/simvuer">GitHub</a>. If you find any issues or would like to request specific features or help, please raise them on the <a href="https://github.com/nickerso/simvuer/issues">GitHub issue tracker</a>. 
        </p>
        <p>
          For general background information on the tools and standards used here, please see the <a href="https://tutorial-on-cellml-opencor-and-pmr.readthedocs.io/en/latest/">Tutorial on CellML, OpenCOR, and PMR</a>. The interface below can be used by first selecting the simulation experiment that you would like to explore, and then interacting with the simulation viewer.
        </p>
      </div>
      <div v-if="datasetUrls.length !== 0" class="resource-selector">
        <b>Select a simulation experiment:</b>&nbsp;&nbsp;
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
        <div class="simulation-experiment-header">
          <span>
            <strong>Simulation experiment <a :href="resource.id" target="_blank">{{ resource.label }}</a>:</strong> {{ resource.description }}
          </span>
          <!-- Thumbnail -->
          <img
            src="https://models.physiomeproject.org/e/80c/ten_tusscher_2004.png"
            alt="Thumbnail"
            class="thumbnail"
            @click="modelDialogVisible = true"
          />

          <!-- Dialog -->
          <el-dialog
            v-model="modelDialogVisible"
            width="70%"
            align-center
          >
            <img
              src="https://models.physiomeproject.org/e/80c/ten_tusscher_2004.png"
              alt="Full Image"
              class="full-image"
            />
          </el-dialog>
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
import { ElRadioButton, ElRadioGroup, ElDialog } from "element-plus";
import "@abi-software/plotvuer/dist/style.css";

export default {
  name: "App",
  components: {
    SimulationVuer,
    ElRadioButton,
    ElRadioGroup,
    ElDialog,
  },
  data: function () {
    return {
      apiLocation: "",
      combineArchives: [],
      datasetUrls: [
        { id: "https://raw.githubusercontent.com/opencor/webapp/refs/heads/main/tests/models/ui/135.omex", label: "135", description: "COMBINE archive" },
        { id: "https://raw.githubusercontent.com/opencor/webapp/refs/heads/main/tests/models/ui/157.omex", label: "157", description: "COMBINE archive" },
        { id: "https://raw.githubusercontent.com/opencor/webapp/refs/heads/main/tests/models/ui/lorenz.omex", label: "Lorenz", description: "COMBINE archive" },
        { 
          id: "https://raw.githubusercontent.com/opencor/webapp/refs/heads/main/tests/models/ui/tt04.omex",
          documentation: "https://models.physiomeproject.org/e/80c",
          image: "https://models.physiomeproject.org/e/80c/ten_tusscher_2004.png",
          label: "TT04", 
          description: "ten Tusscher 2004 human ventricular cell model"
        },
        { id: "https://raw.githubusercontent.com/opencor/webapp/refs/heads/main/tests/models/ui/cvs.omex", label: "CVS", description: "COMBINE archive" },
      ],
      activeResource: 0,
      initialisedResources: [],
      modelDialogVisible: false,
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
    }
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

div.simulation-experiment-header {
  position: relative;
  min-height: 80px;
  padding: 10px;
  background-color: #f9f2fc;
}

.thumbnail {
  cursor: pointer;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s;
  height: 100px;
  position: absolute;
  top: 0px;
  right: 0px;
  z-index: 999;
  transform-origin: top right;
  background-color: white;
}
.thumbnail:hover {
  transform: scale(2.5);
}

.full-image {
  width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
}

</style>
