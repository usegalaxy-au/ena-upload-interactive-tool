<template>
  <BaseForm formName="study" nextRoute="/experiment" />
</template>

<script>
  import BaseForm from '@/components/BaseForm.vue'

  export default {
    name: 'StudyForm',
    components: {
      BaseForm: BaseForm,
    },
  }
</script>
