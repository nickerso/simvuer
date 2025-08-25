<template>
  <div id="app">
    <div class="app">
      <div class="helper-text">
        <p>
          <b><i>SimVuer</i></b> - a simple test web app for playing with specific simulation experiments. Mathematical models are encoded in <el-link v-external href="https://cellml.org/">CellML</el-link>, simulation protocols in <el-link v-external href="https://sed-ml.org/">SED-ML</el-link>, and both are packaged together in a <el-link v-external href="https://doi.org/10.1186/s12859-014-0369-z">COMBINE archive</el-link>, including the information used to create the user interface displayed below. FAIR implementations of the models and associated resources are persistently archived on the <el-link v-external href="https://models.physiomeproject.org/">Physiome Model Repository</el-link>. 
        </p>
        <p>
          This app uses the <el-link v-external href="https://github.com/ABI-Software/simulationvuer">SimulationVuer component</el-link> developed for the <el-link v-external href="https://sparc.science">SPARC Portal</el-link>. See the relevant documentation for more information on how to use this interface: <el-link v-external href="https://docs.sparc.science/docs/simulation-viewer-overview">https://docs.sparc.science/docs/simulation-viewer-overview</el-link>. Note that this is a simple test app, and so does not include all the features of the full SimulationVuer component, such as the ability to upload your own COMBINE archives. The source code for this app is available on <el-link v-external href="https://github.com/nickerso/simvuer">GitHub</el-link>. If you find any issues or would like to request specific features or help, please raise them on the <el-link v-external href="https://github.com/nickerso/simvuer/issues">GitHub issue tracker</el-link>. 
        </p>
        <p>
          For general background information on the tools and standards used here, please see the <el-link v-external href="https://tutorial-on-cellml-opencor-and-pmr.readthedocs.io/en/latest/">Tutorial on CellML, OpenCOR, and PMR</el-link>. The interface below can be used by first selecting the simulation experiment that you would like to explore, and then interacting with the simulation viewer.
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
        <div class="simulation-experiment-header">
          <div class="simulation-experiment-description">
            <strong>Simulation experiment <el-link v-external :href="resource.documentation">{{ resource.label }}</el-link>:</strong> {{ resource.description }}
          </div>
          <!-- Thumbnail -->
          <img
            :src="resource.image"
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
              :src="resource.image"
              alt="Full Image"
              class="full-image"
            />
          </el-dialog>
        </div>
        <SimulationVuer :apiLocation="apiLocation" :id="resource.omex" style="height: 640px;" />
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
import "@abi-software/simulationvuer/dist/style.css";

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
        { id: "sparc-dataset-135", 
          omex: "https://raw.githubusercontent.com/opencor/webapp/refs/heads/main/tests/models/ui/135.omex", 
          label: "Human SAN", 
          description: "We use the COMBINE archive for an action potential model of the human sinoatrial node cell model and simulation experiment from a dataset published on the SPARC Portal. In this simulation experiment, the effect of stellate or vagal nerve stimulation on the action potential is explored.",
          documentation: "https://doi.org/10.26275/r4zj-yyzw",
          image: "https://assets.discover.pennsieve.io/dataset-assets/135/8/banner.jpg"
        },
        { 
          id: "sparc-dataset-157", 
          omex: "https://raw.githubusercontent.com/opencor/webapp/refs/heads/main/tests/models/ui/157.omex", 
          label: "SAN + brain stem", 
          description: "CellML version of the Fabbri et al. 2017 human sinoatrial node (SAN) cell model and an ODE-based version of the Gerstner & Kistler 2002 brain stem (spike response) model combined to demonstrate the effect of brain stem activity on heart rate. Here we can explore the effect of changing the level of brain stem activity on the SAN action potential.",
          documentation: "https://doi.org/10.26275/lj3f-erhp",
          image: "https://assets.discover.pennsieve.io/dataset-assets/135/8/banner.jpg"
        },
        /*
        { id: "lorenz-p", omex: "https://raw.githubusercontent.com/opencor/webapp/refs/heads/main/tests/models/ui/lorenz.omex", label: "Lorenz", description: "COMBINE archive" },*/
        { 
          id: "ttnp04-p",
          omex: "https://raw.githubusercontent.com/opencor/webapp/refs/heads/main/tests/models/ui/tt04.omex",
          documentation: "https://models.physiomeproject.org/e/80c",
          image: "https://models.physiomeproject.org/e/80c/ten_tusscher_2004.png",
          label: "Human ventricular cell", 
          description: "A model for human ventricular tissue, K.H.W.J. ten Tusscher, D. Noble, P.J. Noble, and A.V. Panfilov, 2004, American Journal of Physiology , 286, H1573-H1589. PubMed ID: 14656705. Here we explore the response to changing the stimulation frequency."
        },
        /*
        { id: "cvs-p", omex: "https://raw.githubusercontent.com/opencor/webapp/refs/heads/main/tests/models/ui/cvs.omex", label: "CVS", description: "COMBINE archive" },*/
        {
          id: "glut-p",
          omex: "https://corsproxy.io/?url=https://models.physiomeproject.org/e/d5d/GLUT_ss_oi_flat.cellml/download_omex",
          documentation: "https://models.physiomeproject.org/e/d5d",
          image: "https://models.physiomeproject.org/e/d5d/GLUT_BG.png",
          label: "GLUT",
          description: "Explore this glucose transporter model in the following ways: 1) As 𝜅₁ increases, 𝑘ₘ¹ and 𝑘ₘ² also increase, and the Michaelis-Menten curve saturates at high extracellular glucose concentrations; 2) As the intracelluar glucose concentration increases, the flow v shifts from positive (indicating transport from extracellular to intracellular) to negative (indicating transport from intracellular to extracellular); and 3) As K_Ai increases, a negative flow rate (from intracellular to extracellular) is observed when gᵢ = gₒ, indicating thermodynamically inconsistent parameters."
        }
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

div.simulation-experiment-description {
  margin-right: 220px;
  font-size: 14px;
  text-align: left;
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
  transform: scale(4);
}

.full-image {
  width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
}

</style>
