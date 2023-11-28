<template>
  <h1>Study</h1>

  <button class="btn btn-primary my-5" @click="this.loadExampleData">
    Load example data
  </button>

  <p v-if="!this.schema">Loading...</p>

  <div v-else>
    <p>{{ this.schema.description }}</p>


    <EditableTable v-if="schema" :schema="schema" :formStoreKey="this.formName" />

    <RouterLink class="btn btn-primary my-5" to="/experiment">Continue</RouterLink>

    <!-- For debugging state: -->
    <!-- <p>Data:</p><pre>{{ data }}</pre> -->

    <!-- From debugging schema: -->
    <!-- <p><em>Rendered from the following spec:</em></p>
    <pre style="color: grey;">{{ this.schema }}</pre> -->

  </div>
</template>

<script>
  import { useSchemaStore } from '@/stores/schema'
  import { useFormStore } from '@/stores/forms'
  import EditableTable from '@/components/EditableTable.vue'

  const store = useSchemaStore()
  const formStore = useFormStore()

  export default {
    name: 'StudyForm',
    components: {
      EditableTable: EditableTable,
    },
    data() {
      return {
        schema: null,
        formName: 'study',
        selectedTemplate: null,
      }
    },
    computed: {
      data() {
        return formStore.getFormData(this.formName)
      },
    },
    mounted() {
      store.getSchema('study').then( schema => {
        this.schema = schema
        if (!this.data.length) {
          const blankRow = schema.fields.reduce( (obj, field) => ({...obj, [field.name]: ''}), {})
          formStore.$patch( (state) => {
            state[this.formName].push(blankRow)
          })
        }
      })
      store.getTemplateId().then( id => this.selectedTemplate = id )
    },
    methods: {
      setFieldValue(field_name, value) {
        formStore.$patch( (state) => {
          state[this.formName][0][field_name] = value
          state.hasChanged = true
        })
      },
      loadExampleData() {
        formStore.loadExampleData();
      }
    }
  }
</script>
