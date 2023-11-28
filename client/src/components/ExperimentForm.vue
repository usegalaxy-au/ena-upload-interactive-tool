<template>
  <h1 class="mb-5">Experiment</h1>

  <p v-if="!schema">Loading...</p>

  <div v-else>
    <p>{{ schema.description }}</p>

    <EditableTable v-if="schema" :schema="schema" :formStoreKey="this.formName" />

    <RouterLink class="btn btn-primary my-5" to="/run">Continue</RouterLink>
  </div>
</template>


<script>
  import { useSchemaStore } from '@/stores/schema'
  import EditableTable from './EditableTable.vue'

  const schemaStore = useSchemaStore()

  export default {
    name: 'ExperimentForm',
    components: {
      EditableTable: EditableTable,
    },
    data() {
      return {
        schema: null,
        formName: 'experiment',
      }
    },
    mounted() {
      schemaStore.getSchema(this.formName)
        .then( data => {
          if (!data) {
            return this.$router.push('/')
          }
          this.schema = data
        })
    },
    methods: {},
  }
</script>
