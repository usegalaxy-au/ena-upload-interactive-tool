<script setup>
import LandingPage from '../components/LandingPage.vue'
</script>

<template>
  <main>
    <LandingPage @template-change="(templateInfo) => $emit('template-change', templateInfo)"/>
  </main>
</template>
