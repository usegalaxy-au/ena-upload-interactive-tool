<template>
  <BaseForm formName="sample" nextRoute="/submit" />
</template>

<script>
  import BaseForm from '@/components/BaseForm.vue'

  export default {
    name: 'SampleForm',
    components: {
      BaseForm: BaseForm,
    },
  }
</script>
