<template>
  <h1>ENA upload metadata templates</h1>

  <div class="my-5">
    <p>
      This app allows you to create metadata tables for ENA upload with specified templates.
      Once completed, this tool will output four tables (Study, Experiment, Run and Sample)
      to your Galaxy History, which can be used as inputs for the ENA upload tool.
      First choose a metadata template, then continue to fill out the metadata for your dataset(s)
      in the proceeding tabs.
    </p>

    <p v-if="hasFormData" class="alert alert-danger">
      You have entered data for this form. Changing the template will result in loss of data.
    </p>


    <div class="my-5">
      <label for="templateSelect">Please select a metadata template</label>
      <select class="custom-select" id="templateSelect" @input="selectTemplate($event)" v-model="this.selectedTemplate">
        <option value=""></option>
        <option v-for="template in templateList" :key="template.accession" :value="template.accession">
          {{ template.accession + ': ' + template.name }}
        </option>
      </select>
    </div>
  </div>

  <div class="my-5" v-if="selectedTemplateInfo && selectedTemplateInfo.accession">
    <h3>
      {{ selectedTemplateInfo.accession }}:
      {{ selectedTemplateInfo.name }}
    </h3>
    <p>
      {{ selectedTemplateInfo.description }}
    </p>

    <RouterLink class="btn btn-primary my-5" to="/study">Continue</RouterLink>
  </div>

</template>


<script>
import { useSchemaStore } from '@/stores/schema.js'
import { useFormStore } from '@/stores/forms.js'

export default {
  name: 'LandingPage',
  emits: ['template-change'],
  data() {
    return {
      templateList: [],
      hasFormData: null,
      selectedTemplate: null,
      selectedTemplateInfo: null,
    }
  },
  mounted() {
    const schemaStore = useSchemaStore()
    const formStore = useFormStore()
    schemaStore.getTemplateList().then( data => this.templateList = data )
    this.hasFormData = formStore.hasFormData()
    schemaStore.getTemplateId().then( templateId => {
      this.selectedTemplate = templateId
      schemaStore.getTemplateInfo(templateId)
        .then( templateInfo => this.selectedTemplateInfo = templateInfo )
    })
  },
  methods: {
    async selectTemplate(event) {
      console.log("selectTemplate called...")
      const schemaStore = useSchemaStore()
      const formStore = useFormStore()
      formStore.clearFormData()
      schemaStore.setTemplateId(event.target.value).then( async () => {
        this.selectedTemplate = await schemaStore.getTemplateId()
        this.selectedTemplateInfo = await schemaStore.getTemplateInfo(this.selectedTemplate)
        this.$emit('template-change', this.selectedTemplateInfo)
      })
    }
  }
}
</script>
