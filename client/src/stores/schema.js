import { ref } from 'vue'
import { defineStore } from 'pinia'
import { get } from '@/utils/api'

let fetched = ref(false)
let fetchedList = ref(false)
let data = ref({
  schema: null,
  templates: null,
  selectedTemplate: null,
  selectedTemplateInfo: null,
})

export const useSchemaStore = defineStore('schemaData', () => {
  async function getSchema(key) {
    if (!data.value.selectedTemplate) {
      return null
    }
    if (!fetched.value) {
      data.value.schema = await get(`/schema/template/${data.value.selectedTemplate}`).then(
        data => data.schema
      )
      fetched.value = true
    }
    if (key) {
      return data.value.schema[key]
    }
    return data.value.schema
  }

  async function getTemplateList() {
    if (!fetchedList.value) {
      data.value.templates = await get(`/schema/list`).then(data => data.templates)
      fetchedList.value = true
    }
    return data.value.templates
  }

  async function setTemplateId(identifier) {
    console.log(`Called setTemplateId with identifier: ${identifier}`)
    data.value.selectedTemplate = identifier
    if (identifier.length) {
      data.value.selectedTemplateInfo = await getTemplateInfo(identifier)
    } else {
      data.value.selectedTemplateInfo = null
    }
  }

  async function getTemplateId() {
    return data.value.selectedTemplate
  }

  async function getTemplateInfo(identifier) {
    if (identifier && data.value.templates) {
      return data.value.templates.filter(
        template => template.accession === identifier
      )[0]
    }
  }

  return { getSchema, getTemplateList, getTemplateId, getTemplateInfo, setTemplateId }
})
