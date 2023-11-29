<template>
  <BaseForm formName="run" nextRoute="/sample" />
</template>

<script>
  import BaseForm from '@/components/BaseForm.vue'

  export default {
    name: 'RunForm',
    components: {
      BaseForm: BaseForm,
    },
  }
</script>
