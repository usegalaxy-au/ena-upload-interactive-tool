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

    <p class="alert alert-warning">
      <span class="material-symbols-outlined" style="transform: translateY(0.25rem);">warning</span>
      Do not refresh your browser while using this tool. Data is not saved until you generate files in the "Finish" tab.
      If you want to save your work, you can generate with incomplete tables and continue later with a new instance of the tool.
    </p>

    <p v-if="hasFormData" class="alert alert-danger">
      You have entered data for this form. Changing the template will result in loss of data.
    </p>


    <div class="my-5">
      <select class="custom-select" id="templateSelect" @input="selectTemplate($event)" v-model="this.selectedTemplate">
        <option :value="null">Select a template</option>
        <option v-for="template in templateList" :key="template.accession" :value="template.accession">
          {{ template.accession + ': ' + template.name }}
        </option>
      </select>
    </div>
  </div>

  <div class="my-5" v-if="selectedTemplateInfo && selectedTemplateInfo.accession">
    <div class="selected-template-info">
      <h3>
        {{ selectedTemplateInfo.accession }}:
        {{ selectedTemplateInfo.name }}
      </h3>
      <p>
        {{ selectedTemplateInfo.description }}
      </p>
    </div>

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

<style scoped>
.selected-template-info {
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 0.25rem;
}
</style>