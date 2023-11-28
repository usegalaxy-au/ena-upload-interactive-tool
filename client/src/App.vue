<template>
  <main>
    <header>
      <div class="wrapper">
        <nav>
          <RouterLink to="/">Intro</RouterLink>
          <component :is="templateInfo ? 'RouterLink' : 'a'" to="/study">Study</component>
          <component :is="templateInfo ? 'RouterLink' : 'a'" to="/experiment">Experiment</component>
          <component :is="templateInfo ? 'RouterLink' : 'a'" to="/run">Run</component>
          <component :is="templateInfo ? 'RouterLink' : 'a'" to="/sample">Sample</component>
          <component :is="templateInfo ? 'RouterLink' : 'a'" to="/submit">Finish</component>

          <span v-if="this.templateInfo" class="template-details">
            {{ this.templateInfo.accession }}
            <v-tooltip
              activator="parent"
              location="bottom"
              :max-width="this.templateInfo.description.length < 200 ? 300 : 600"
              style="overflow-wrap: break-word;"
            >
              <p class="lead">
                {{ this.templateInfo.name }}
              </p>
              {{ this.templateInfo.description }}
            </v-tooltip>
          </span>
        </nav>
      </div>
    </header>

    <RouterView @template-change="templateChange"/>

  </main>
</template>

<script>
import { RouterLink, RouterView } from 'vue-router';

export default {
  name: 'App',
  components: {
    RouterLink,
    RouterView,
  },
  data() {
    return {
      templateInfo: null,
    }
  },
  methods: {
    templateChange(templateInfo) {
      this.templateInfo = templateInfo;
    }
  }
};
</script>

<style scoped>
main {
  padding: 0 1rem;
  margin: 0 auto;
  max-width: 1000px;
}
nav {
  padding: 1rem 0;
  border-bottom: 1px solid grey;
  margin-bottom: 1rem;
}
nav > a {
  margin: .25rem .5rem;
  padding: .25rem .5rem;
  text-decoration: none;
}
nav > a.router-link-active {
  color: white;
  background-color: cornflowerblue;
}
.template-details {
  float: right;
  background: #ddddea;
  padding: .5rem 1rem;
  margin-top: -.5rem;
  border-radius: .5rem;
  user-select: none;
  cursor: default;
}
</style>
