<template>
  <!-- Form view: -->
  <div v-if="display === 'form'" class="form-group">
    <label :for="field.name">
      {{ this.capitalize(field.name) }}
      <span v-if="requiredField">*</span>
    </label>
    <SelectInput
      v-if="field.field_type === 'TEXT_CHOICE_FIELD'"
      :field="field"
      :selectedValue="inputValue"
      @input="$emit('blur', $event)"
    />
    <input
      v-if="field.field_type === 'TEXT_FIELD'"
      type="text"
      :class="getInputClass(field.field_type)"
      :id="field.name"
      :name="field.name"
      :placeholder="field.placeholder"
      :value="inputValue"
      @blur="$emit('blur', $event)"
    />
    <textarea
      v-if="field.field_type === 'TEXT_AREA_FIELD'"
      class="form-control"
      rows="5"
      :id="field.name"
      :name="field.name"
      :placeholder="field.placeholder"
      :value="inputValue"
      @blur="$emit('blur', $event)"
    ></textarea>
    <small>
      <span v-if="field.units">({{ field.units }})</span>
      {{ field.description }}
    </small>
  </div>

  <!-- Table view: -->
  <template v-if="display === 'table'">
    <SelectInput
      v-if="field.field_type === 'TEXT_CHOICE_FIELD'"
      ref="input"
      :class="valid ? 'noborder' : 'noborder invalid'"
      :field="field"
      :rowIx="rowIx"
      :selectedValue="inputValue"
      @input="$emit('blur', $event)"
      @keydown.exact="$emit('keydown', $event)"
      @paste="$emit('paste', $event)"
    />
    <input
      v-if="field.field_type === 'TEXT_FIELD'"
      ref="input"
      type="text"
      :class="valid ? getInputClass(field.field_type) + ' noborder' : getInputClass(field.field_type) + ' noborder invalid'"
      :id="getCellId(field)"
      :name="getCellId(field)"
      :value="inputValue"
      :placeholder="field.placeholder"
      @blur="$emit('blur', $event)"
      @keydown.exact="$emit('keydown', $event)"
      @paste="$emit('paste', $event)"
    />
    <textarea
      v-if="field.field_type === 'TEXT_AREA_FIELD'"
      ref="input"
      rows="1"
      :class="valid ? 'form-control' : 'form-control invalid'"
      :id="getCellId(field)"
      :name="getCellId(field)"
      :placeholder="field.placeholder"
      :value="inputValue"
      @keydown.exact="$emit('keydown', $event)"
      @blur="$emit('blur', $event)"
    ></textarea>
  </template>
</template>

<script>
import { capitalize } from '@/utils/text'
import SelectInput from './SelectInput.vue'

const VALID_FIELD_TYPES = ['TEXT_FIELD', 'TEXT_AREA_FIELD', 'TEXT_CHOICE_FIELD']

export default {
  name: 'FormField',
  emits: [
    'blur',
    'keydown',
    'paste',
  ],
  props: {
    isBlankRow: Boolean,
    inputValue: String,
    rowIx: Number,
    field: {
      type: Object,
      validator(value) {
        return VALID_FIELD_TYPES.includes(value.field_type)
      }
    },
    display: {
      type: String,
      default: 'form',
      validator(value) {
        return ['form', 'table'].includes(value)
      }
    },
  },
  data() {
    return {
      valid: true,
    }
  },
  watch: {
    inputValue() {
      this.validate()
    }
  },
  components: {
    SelectInput: SelectInput,
  },
  computed: {
    requiredField() {
      return this.field.cardinality === 'mandatory'
    }
  },
  methods: {
    getCellId(field) {
      return `${field.name}-${this.rowIx}`
    },
    capitalize(text) {
      return capitalize(text)
    },
    mapFieldType(type) {
      // Not currently used as all field.field_type values resolve to "text"
      switch (type) {
        case 'string':
          return 'text'
        case 'number':
          return 'number'
        case 'boolean':
          return 'checkbox'
        default:
          return 'text'
      }
    },
    getInputClass(type) {
      switch (type) {
        case 'BOOLEAN_FIELD':
          return 'form-check-input'
        default:
          return 'form-control'
      }
    },
    focus() {
      const input = this.$refs.input
      input && input.focus()
    },
    validate() {
      this.valid = !(
        !this.isBlankRow
        && this.field.cardinality === 'mandatory'
        && !this.inputValue
      )
      return this.valid
    },
  }
}
</script>

<style scoped>
  .form-control {
    padding: 0.35rem;
    font-size: .8rem;
  }
  .invalid {
    box-shadow: 0 0 0 0.2rem rgba(240, 53, 69, 0.5);
  }
  textarea.form-control {
    position: absolute;
    z-index: 1;
    top: 2px;
    left: 2px;
  }
  textarea.form-control:focus {
    z-index: 2;
    height: 145px;
  }
  .noborder {
    border: none;
  }
</style>
