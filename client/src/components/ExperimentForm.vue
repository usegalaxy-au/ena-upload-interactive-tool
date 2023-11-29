<template>
  <BaseForm formName="experiment" nextRoute="/run" />
</template>

<script>
  import BaseForm from '@/components/BaseForm.vue'

  export default {
    name: 'ExperimentForm',
    components: {
      BaseForm: BaseForm,
    },
  }
</script>
