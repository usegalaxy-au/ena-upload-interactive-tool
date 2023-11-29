<template>
    <h1>{{ capitalize(formName) }}</h1>
  
    <p v-if="!this.schema">Loading...</p>
  
    <div v-else>
        
      <p>{{ this.schema.description }}</p>

      <button v-if="templateId === 'ERC000011'" class="btn btn-warning my-5" @click="this.loadExampleData">
        Load example data
      </button>
  
      <EditableTable
        v-if="schema"
        ref="table"
        :schema="schema"
        :formStoreKey="this.formName"
        @focus="tableIsValid = null"
      />
  
      <div class="my-5">
        <div v-if="tableIsValid === false" class="alert alert-warning">
          <table>
            <tr>
              <td class="px-3">
                <span class="material-symbols-outlined" style="transform: translateY(0.25rem);">warning</span>
              </td>
              <td class="px-3">
                The entered data is not valid for ENA submission. You may continue, but
                this should be fixed before proceeding to ENA upload.
              </td>
            </tr>
          </table>
        </div>
  
        <button class="btn btn-primary my-3" @click="validateAndContinue">Continue</button>
      </div>
  
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
    import { capitalize } from '@/utils/text'
  
    const store = useSchemaStore()
    const formStore = useFormStore()
  
    export default {
      name: 'BaseForm',
      components: {
        EditableTable: EditableTable,
      },
      props: {
        formName: {
          type: String,
          required: true,
        },
        nextRoute: {
          type: String,
          required: true,
        },
      },
      data() {
        return {
          schema: null,
          templateId: null,
          tableIsValid: null,
        }
      },
      computed: {
        data() {
          return formStore.getFormData(this.formName)
        },
      },
      mounted() {
        store.getSchema(this.formName).then( schema => {
          if (!schema) {
            return this.$router.push('/')
          }
          this.schema = schema
          if (!this.data.length) {
            const blankRow = schema.fields.reduce( (obj, field) => ({...obj, [field.name]: ''}), {})
            formStore.$patch( (state) => {
              state[this.formName].push(blankRow)
            })
          }
        })
        store.getTemplateId().then( id => this.templateId = id )
      },
      methods: {
        capitalize(text) {
          return capitalize(text)
        },
        setFieldValue(field_name, value) {
          formStore.$patch( (state) => {
            state[this.formName][0][field_name] = value
            state.hasChanged = true
          })
        },
        loadExampleData() {
          formStore.loadExampleData();
        },
        validateAndContinue() {
          if (this.tableIsValid === false) {
            // User has already clicked and seen invalid warning
            this.$router.push(this.nextRoute)
          }
          this.tableIsValid = this.$refs.table.validateTable()
          if (this.tableIsValid === true) {
            this.$router.push(this.nextRoute)
          }
        },
      }
    }
  </script>
  