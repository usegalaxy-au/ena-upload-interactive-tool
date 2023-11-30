<template>
  <h1>ENA upload metadata table builder</h1>

  <div class="my-5">
    <p>
      This app allows you to create metadata tables for ENA upload with specified templates
      which ensure that the data are valid for ENA upload.
      Once completed, this tool will output four tables (Study, Experiment, Run and Sample)
      to your Galaxy History, which can be used as inputs for the ENA upload tool.
      First choose a metadata template, then fill out the metadata for your dataset(s)
      in the proceeding tabs.
    </p>


    <div class="alert alert-warning">
      <table>
        <tr>
          <td class="px-3">
            <span class="material-symbols-outlined">warning</span>
          </td>
          <td class="px-3">
            Do not refresh your browser while using this tool. Data is not saved
            until you generate files in the "Finish" tab. If you want to save
            your work, you can generate with incomplete tables and continue
            later with a new instance of the tool.
          </td>
        </tr>
      </table>
    </div>

    <p v-if="!userUpload && hasFormData" class="alert alert-danger">
      You have entered data for this template. Changing the template will result in loss of data if the schema does not match.
    </p>

    <p v-if="userUpload && !templateMatchErrorMsg" class="alert alert-success">
      <span v-if="templateMatchErrorMsg === false">
        <span class="material-symbols-outlined align">check_circle</span>
        The selected schema matches your data.
      </span>
      <span v-else>
        Tables have been successfully populated with your provided data. Please select the metadata template which matches your tables before proceeding to edit these data.
      </span>
    </p>

    <p v-if="userUpload && templateMatchErrorMsg" class="alert alert-danger" v-html="templateMatchErrorMsg"></p>

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


function validateUploadedSchema(schema, formData) {
  let matchErrorMsg = false
  Object.keys(formData).forEach( (formName) => {
    if (matchErrorMsg) return
    if (formData[formName].length) {
      const schemaKeys = schema[formName].fields.map( field => field.name )
      const formKeys = Object.keys(formData[formName][0])
      const missingKeys = schemaKeys.filter( key => !formKeys.includes(key) )
      const extraKeys = formKeys.filter( key => !schemaKeys.includes(key) )
      if (missingKeys.length || extraKeys.length) {
        matchErrorMsg = "Selected template schema does not match uploaded tables. Please select a different template."
        if (missingKeys.length) {
          if (missingKeys.length > 10) {
            const extraText = String(missingKeys.length - 10)
            missingKeys.length = 10
            missingKeys.push('+ ' + extraText + ' more...')
          }
          matchErrorMsg += `<br><br>Table '${formName}': missing fields: ${missingKeys.join(', ')}`
        }
        if (extraKeys.length) {
          if (extraKeys.length > 10) {
            const extraText = String(extraKeys.length - 10)
            extraKeys.length = 10
            extraKeys.push('+ ' + extraText + ' more...')
          }
          matchErrorMsg += `<br><br>Table '${formName}': has unmatched fields: ${extraKeys.join(', ')}`
        }
      }
    }
  })
  return matchErrorMsg
}


export default {
  name: 'LandingPage',
  emits: ['template-change'],
  data() {
    return {
      templateList: [],
      hasFormData: null,
      selectedTemplate: null,
      selectedTemplateInfo: null,
      userUpload: null,
      templateMatchErrorMsg: null,
    }
  },
  mounted() {
    const schemaStore = useSchemaStore()
    const formStore = useFormStore()
    schemaStore.getTemplateList().then( data => this.templateList = data )
    formStore.fetchUserData().then( (data) => {
      this.userUpload = data
      this.hasFormData = formStore.hasFormData()
    })
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
      this.templateMatchErrorMsg = null
      schemaStore.setTemplateId(event.target.value).then( async () => {
        this.selectedTemplate = await schemaStore.getTemplateId()
        this.selectedTemplateInfo = await schemaStore.getTemplateInfo(this.selectedTemplate)
        this.$emit('template-change', this.selectedTemplateInfo)

        if (this.userUpload) {
          const schema = await schemaStore.getSchema()
          const formData = formStore.getFormData()
          this.templateMatchErrorMsg = validateUploadedSchema(schema, formData)
        } else {
          formStore.clearFormData()
        }
      })
    },
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