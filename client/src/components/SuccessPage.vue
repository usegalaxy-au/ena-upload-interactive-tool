<template>
  <h1>Tables created successfully</h1>

  <p class="alert alert-success">
    You should find the ENA tables in your Galaxy history in a few seconds.
    <br>
    You can now close this page and return to Galaxy.
  </p>

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
