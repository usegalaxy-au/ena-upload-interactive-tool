<template>
  <h1>Forms created successfully</h1>
  <p>You should find the ENA forms in your Galaxy history in a few seconds.</p>
  <p>You can now close this page and return to Galaxy.</p>

  <p class="lead">
    App terminating in {{ secondsToTerminate }}...
  </p>

</template>

<script>
export default {
  name: 'SuccessPage',
  data: function () {
    return {
      secondsToTerminate: 5
    }
  },
  mounted: function () {
    this.terminateApp()
  },
  methods: {
    terminateApp: function () {
      setTimeout(() => {
        this.secondsToTerminate--
        if (this.secondsToTerminate > 0) {
          this.terminateApp()
        }
      }, 1000)
    }
  }
}
</script>

<style scoped>
</style>
