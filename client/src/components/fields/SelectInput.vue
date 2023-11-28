<template>
  <select
    ref="select"
    class="custom-select"
    :id="getCellId()"
    :name="getCellId()"
    @keydown.exact="$event.preventDefault() && $emit('keydown', $event)"
    @blur="$emit('blur', $event)"
  >
    <option value=""></option>
    <option v-for="option in field.cv" :key="option" :value="option" :selected="option === this.selectedValue">{{ option }}</option>
  </select>
</template>

<script>
import { capitalize } from '@/utils/text'

export default {
  name: 'SelectInput',
  props: {
    rowIx: Number,
    field: Object,
    selectedValue: String,
  },
  watch: {
    selectedValue() {
      if (!this.field.cv.includes(this.selectedValue)) {
        this.$emit('input', { target: { value: '' } })
      }
    }
  },
  methods: {
    getCellId() {
      return `${this.field.name}-${this.rowIx}`
    },
    capitalize(text) {
      return capitalize(text)
    },
    focus() {
      this.$refs.select.focus()
    },
  }
}
</script>
