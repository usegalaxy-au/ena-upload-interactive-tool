<template>
  <h1>Generate tables</h1>
  <p>
    After submission, your metadata will be written to tabular output
    files which will be available in your Galaxy history after the tool
    terminates (&lt; 10 seconds).
  </p>

  <div v-if="invalidForms.length" class="alert alert-warning">
    <table>
      <tr>
        <td class="px-3">
          <span class="material-symbols-outlined">warning</span>
        </td>
        <td class="px-3">
          <b>Invalid tables: "{{ invalidForms.join('", "') }}"</b>.
          The entered data is not valid for ENA submission. You can still generate
          these tables, but they must be completed before proceeding to ENA upload.
          To continue editing these table with this tool, you will need to remember
          the template ID that was used to generate them.
        </td>
      </tr>
    </table>
  </div>

  <div v-else>
    <p class="alert alert-success">
      Your data are valid for ENA submission
    </p>
  </div>

  <button class="btn btn-primary" @click="submitForm">Generate</button>

  <!-- For debugging state: -->
  <!-- <p class="my-5">Data:</p><pre>{{ data }}</pre> -->

</template>

<script>
import { useFormStore } from '@/stores/forms.js';
import { useSchemaStore } from '@/stores/schema.js';
import { post } from '@/utils/api.js';

const formStore = useFormStore()
const schemaStore = useSchemaStore()

export default {
  name: 'SubmitPage',
  data() {
    return {
      data: null,
      schema: null,
      invalidForms: [],
    }
  },
  mounted() {
    this.getData().then( data => {
      this.data = data
      this.invalidForms = formStore.validate(data.schema)
    })

  },
  methods: {
    async getData() {
      this.schema = await schemaStore.getSchema()

      if (!this.schema) {
        return this.$router.push('/')
      }

      const formState = await formStore.getFormData()
      const cleaned_forms = this.clean_forms(formState)
      return {
        ...cleaned_forms,
        schema: this.schema,
      }
    },
    clean_forms(forms) {
      const cleaned_forms = {}
      Object.keys(forms).forEach( formKey => {
        const cleaned_rows = forms[formKey].filter( row => {
          return Object.keys(row).reduce(
            (acc, fieldName) => acc || row[fieldName] !== '',
            false)
        })
        cleaned_forms[formKey] = cleaned_rows
      })
      return cleaned_forms
    },
    async submitForm() {
      post('/submit', this.data).then((res) => {
        if (res.status === 'success') {
          return this.$router.push('/success');
        } else {
          alert("Error submitting form")
        }
      })
    },
  },
};
</script>
