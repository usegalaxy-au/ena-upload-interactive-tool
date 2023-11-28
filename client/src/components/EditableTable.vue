<template>
  <div class="editableTable">
    <div class="table-wrapper" ref="tableWrapper">
      <table v-if="schema">
        <thead>
          <tr>
            <th v-for="field in schema.fields" :key="field.name">
              <div class="d-flex">
                <div class="col p-0">
                  {{ idToTitle(field.name) }}
                  <span v-if="field.units">({{ field.units }})</span>
                  <span v-if="field.cardinality === 'mandatory'" class="ml-1" style="user-select: none;">*</span>
                </div>
                <div class="col-auto p-0 ml-2">
                  <span class="info">
                    i
                    <v-tooltip
                      activator="parent"
                      location="top"
                      style="overflow-wrap: break-word;"
                      :max-width="field.description.length < 200 ? 300 : 600"
                    >
                      <p class="my-1">
                        <span v-if="field.cardinality === 'mandatory'" class="tip required">Required</span>
                        <span v-if="field.cardinality === 'optional'" class="tip optional">Optional</span>
                      </p>
                      <p class="my-1">
                        {{ field.description }}
                      </p>
                    </v-tooltip>
                  </span>
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIx) in data" :key="rowIx">
            <td
              v-for="field in schema.fields"
              :key="field.name + rowIx"
              :class="field.field_type === 'TEXT_AREA_FIELD' ? 'textarea' : ''"
            >
              <FormField
                display="table"
                :field="field"
                :ref="getInputRef(rowIx, field.name)"
                :inputValue="row[field.name]"
                :isBlankRow="isBlankRow(row)"
                :rowIx="rowIx"
                @focus="setFocusedCell(rowIx, field.name)"
                @blur="setCellData(rowIx, field.name, $event.target.value)"
                @keydown.exact="inputKeydown($event, rowIx, field.name)"
                @paste="pasteTable($event, rowIx, field.name)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="table-row-controls" :style="tableControlCssProps">
      <button class="btn btn-primary" @click="this.addRows(1)">
        +
      </button>
      <button class="btn btn-danger" @click="this.deleteRow()">
        -
      </button>
      <v-tooltip
        activator="parent"
        location="left"
      >
        Add/delete row
      </v-tooltip>
    </div>
  </div>

  <div class="table-toolbar">
    <button class="btn btn-tool" @click="copyToClipboard">
      <span class="material-symbols-outlined">content_copy</span>
      <v-tooltip
        activator="parent"
        location="bottom"
      >
        Copy table content to clipboard
      </v-tooltip>
    </button>

    <div class="clear-buttons">
      <button class="btn btn-tool">
        <span class="material-symbols-outlined">block</span>
      </button>
      <div class="options">
        <button class="btn btn-tool" @click="clearAll">
          Clear all
        </button>
        <button class="btn btn-tool" @click="clearRow">
          Clear selected row
        </button>
        <button class="btn btn-tool" @click="clearColumn">
          Clear selected column
        </button>
      </div>
    </div>

    <button class="btn btn-tool" @click="fillDownCell">
      <span class="material-symbols-outlined">arrow_downward</span>
      <v-tooltip
        activator="parent"
        location="bottom"
      >
        Fill selected cell down
      </v-tooltip>
    </button>

    <button class="btn btn-tool" @click="showHelpModal = true">
      <span class="material-symbols-outlined">question_mark</span>
      <v-tooltip
        activator="parent"
        location="bottom"
      >
        Navigation tips
      </v-tooltip>
    </button>
  </div>

  <div class="row my-3 px-4">
    <button class="btn btn-primary" @click="validateTable">Validate</button>
    <span class="validity-result">
      <span v-if="dataIsValid" class="material-symbols-outlined text-success">check_circle</span>
      <span v-else-if="dataIsValid === false" class="material-symbols-outlined text-danger">error</span>
      <span v-else class="material-symbols-outlined text-muted">help</span>
    </span>
  </div>

  <Teleport to="body">
    <modal :show="showHelpModal" @close="showHelpModal = false">
      <template #header>
        <h3>Table navigation</h3>
      </template>
      <template #body>
        <table class="modal-help">
          <tr>
            <td>
              <code>Enter</code>
            </td>
            <td>
              Cell down
            </td>
          </tr>
          <tr>
            <td>
              <code>&uparrow;</code>
              <code>&downarrow;</code>
              <code>&leftarrow;</code>
              <code>&rightarrow;</code>
            </td>
            <td>
              Navigate cells
            </td>
          </tr>
          <tr>
            <td>
              <code>Ctrl</code>
              +
              <code>&leftarrow;</code>
              <code>&rightarrow;</code>
            </td>
            <td>
              Move cursor in cell
            </td>
          </tr>
          <tr>
            <td>
              <code>Shift</code>
              +
              <code>&leftarrow;</code>
              <code>&rightarrow;</code>
            </td>
            <td>
              Select text in cell
            </td>
          </tr>
          <tr>
            <td>
              <code>Ctrl</code>
              +
              <code>z</code>
            </td>
            <td>Undo</td>
          </tr>
        </table>

        <hr>

        <p class="lead">Text area fields</p>

        <table class="modal-help">
          <tr>
            <td>
              <code>Shift</code>
              +
              <code>Enter</code>
            </td>
            <td>
              New line
            </td>
          </tr>
        </table>
      </template>
    </modal>
  </Teleport>

  <!-- For debugging state: -->
  <!-- <div><p>Row 1 data:</p><pre>{{ data[0] }}</pre></div> -->

</template>

<script>
import FormField from './fields/FormField.vue'
import Modal from './Modal.vue'
import { useFormStore } from '@/stores/forms'

const INIT_ROWS = 5
const UNDO_CHECKPOINT_LIMIT = 10
const formStore = useFormStore()

export default {
  name: 'EditableTable',
  components: {
    Modal: Modal,
    FormField: FormField,
  },
  props: {
    schema: Object,
    formStoreKey: String,
  },
  data() {
    return {
      undoData: [],
      tableOverflow: false,
      lastFocused: {
        row: null,
        field: null,
      },
      showHelpModal: false,
      dataIsValid: true,
    }
  },
  computed: {
    data() {
      return formStore.getFormData(this.formStoreKey)
    },
    tableControlCssProps() {
      const topRem = 2.44 * this.data.length
      return {
        'top': `${topRem}rem`,
      }
    }
  },
  mounted() {
    if (!this.data.length) {
      this.initRows()
    }
    this.$nextTick(() => {
      this.tableOverflow = this.$refs.tableWrapper.scrollWidth > this.$refs.tableWrapper.clientWidth
    })
    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.key === 'z') {
        event.preventDefault()
        this.setDataUndo()
      }
    })
  },
  methods: {
    setFocusedCell(rowIx, fieldName) {
      console.log("setFocusedCell rowIx:")
      console.log(rowIx)
      console.log("setFocusedCell fieldName:")
      console.log(fieldName)
      this.lastFocused = {
        row: rowIx,
        field: fieldName,
      }
    },
    setData(data) {
      this.makeUndoCheckpoint()
      formStore.$patch( (state) => {
        state[this.formStoreKey] = data
        state.hasChanged = true
      })
    },
    setDataUndo() {
      if (this.undoData.length) {
        formStore.$patch( (state) => {
          state[this.formStoreKey] = this.undoData.shift()
          state.hasChanged = true
        })
      }
    },
    setCellData(rowIx, fieldName, value) {
      this.makeUndoCheckpoint()
      formStore.$patch( (state) => {
        state[this.formStoreKey][rowIx][fieldName] = value
        state.hasChanged = true
      })
      this.dataIsValid = null
    },
    makeUndoCheckpoint() {
      if (!this.data.length) {
        return
      }
      // Convert vue data to plain js array
      const thisCheckpoint = this.data.map( (row) => ({...row}) )
      if (thisCheckpoint !== this.undoData[0]) {
        this.undoData = [thisCheckpoint, ...this.undoData.slice(0, UNDO_CHECKPOINT_LIMIT)]
      }
    },
    idToTitle(id) {
      return id
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    },
    initRows() {
      this.addRows(INIT_ROWS)
    },
    addRows(num_rows) {
      const blankRows = []
      this.blankRow = this.schema.fields.reduce( (obj, field) => {
        obj[field.name] = ''
        return obj
      }, {})
      for (let i = 0; i < num_rows; i++) {
        blankRows.push({...this.blankRow})
      }
      const newData = [...this.data, ...blankRows]
      this.setData(newData)
    },
    deleteRow() {
      if (this.data.length > 1) {
        const newData = this.data.slice(0, this.data.length - 1)
        this.setData(newData)
      }
    },
    clearAll() {
      if (!confirm('Clear all data in this table?')) {
        return
      }
      const newData = this.data.map( () => {
        return this.schema.fields.reduce( (obj, field) => {
          obj[field.name] = ''
          return obj
        }, {})
      })
      this.setData(newData)
      this.validateTable()
    },
    clearRow() {
      const newData = this.data.map( (row, rowIx) => {
        return this.schema.fields.reduce( (obj, field) => {
          if (rowIx === this.lastFocused.row) {
            obj[field.name] = ''
            return obj
          }
          obj[field.name] = row[field.name]
          return obj
        }, {})
      })
      this.setData(newData)
      this.validateTableRow(this.lastFocused.row)
    },
    clearColumn() {
      const newData = this.data.map( (row) => {
        return this.schema.fields.reduce( (obj, field) => {
          if (field.name === this.lastFocused.field) {
            obj[field.name] = ''
            return obj
          }
          obj[field.name] = row[field.name]
          return obj
        }, {})
      })
      this.setData(newData)
    },
    fillDownCell() {
      const newData = this.data.map( (row, rowIx) => {
        return this.schema.fields.reduce( (obj, field) => {
          if (rowIx >= this.lastFocused.row && field.name === this.lastFocused.field) {
            obj[field.name] = this.data[this.lastFocused.row][field.name]
            return obj
          }
          obj[field.name] = row[field.name]
          return obj
        }, {})
      })
      this.setData(newData)
    },
    getInputRef(rowIx, fieldName) {
      return `input_row${rowIx}_${fieldName}`
    },
    inputKeydown(event, rowIx, fieldName) {
      let newRowIx
      let newFieldName
      switch (event.key) {
        case 'Enter':
          // navigate cell down
          newRowIx = Math.min(rowIx + 1, this.data.length - 1)
          newFieldName = fieldName
          break
        case 'ArrowUp':
          // navigate cell up
          newRowIx = Math.max(rowIx - 1, 0)
          newFieldName = fieldName
          break
        case 'ArrowDown':
          // navigate cell down
          newRowIx = Math.min(rowIx + 1, this.data.length - 1)
          newFieldName = fieldName
          break
        case 'ArrowLeft':
          // navigate cell left
          newRowIx = rowIx
          newFieldName = this.schema.fields[Math.max(
            this.schema.fields.findIndex((val) => val.name === fieldName) - 1,
            0)].name
          break
        case 'ArrowRight':
          // navigate cell right
          newRowIx = rowIx
          newFieldName = this.schema.fields[Math.min(
            this.schema.fields.findIndex((val) => val.name === fieldName) + 1,
            this.schema.fields.length - 1)].name
          break
        default:
          return
      }
      event.preventDefault()
      this.$refs[this.getInputRef(newRowIx, newFieldName)][0].focus()
    },
    copyToClipboard() {
      const clipboardString = this.data.map(
        (row) => this.schema.fields.map(
          (field) => row[field.name]
        ).join('\t')
      ).join('\n')
      navigator.clipboard.writeText(clipboardString)
    },
    pasteTable(event, cursorRowIx, cursorFieldName) {
      const clipboardData = event.clipboardData.getData('text/plain')
      if (clipboardData.includes('\t') || clipboardData.includes('\n')) {
        event.preventDefault();

        // Collect field name arrays that the data can be mapped to
        const numPastedCols = clipboardData.split('\n')[0].split('\t').length
        const fieldNames = this.schema.fields.map((field) => field.name)
        const cursorFieldIx = fieldNames.indexOf(cursorFieldName)
        const prevFieldNames = fieldNames.slice(0, cursorFieldIx)
        const pastedFieldNames = fieldNames.slice(cursorFieldIx, cursorFieldIx + numPastedCols)
        const afterFieldNames = fieldNames.slice(cursorFieldIx + numPastedCols, fieldNames.length)

        const pastedRows = clipboardData.split('\n')
          .filter( (row) => row.length )
          .map((row) => row.split('\t'))

        const newData = this.data.map((row, ix) => {
          if (ix < cursorRowIx || ix > cursorRowIx + pastedRows.length - 1) {
            return row
          }
          const pastedColsData = pastedFieldNames.reduce((obj, fieldName, fieldIx) => {
            obj[fieldName] = pastedRows[ix - cursorRowIx][fieldIx]
            return obj
          }, {})
          const prevColsData = prevFieldNames.reduce((obj, fieldName) => {
            obj[fieldName] = row[fieldName]
            return obj
          }, {})
          const afterColsData = afterFieldNames.reduce((obj, fieldName) => {
            obj[fieldName] = row[fieldName]
            return obj
          }, {})
          return {
            ...pastedColsData,
            ...prevColsData,
            ...afterColsData,
          }
        })
        this.setData(newData)
      }
    },
    isBlankRow(row) {
      return this.schema.fields.every( (field) => !row[field.name] )
    },
    validateTableRow(rowIx) {
      // Validate given row index
      this.schema.fields.forEach( (field) => {
        const ref = this.getInputRef(rowIx, field.name)
        const formField = this.$refs[ref][0]
        this.isBlankRow(this.data[rowIx])
          ? formField.valid = true
          : formField.validate()
        })
    },
    validateTable() {
      // Validate all rows
      this.dataIsValid = true
      this.data.forEach( (row, rowIx) => {
        this.schema.fields.forEach( (field) => {
          const ref = this.getInputRef(rowIx, field.name)
          const formField = this.$refs[ref][0]
          const validity = this.isBlankRow(row)
            ? formField.valid = true
            : formField.validate()
          this.dataIsValid && !validity && formField.focus()
          this.dataIsValid = this.dataIsValid && validity
        })
      })
    },
  },
}
</script>

<style scoped>
  .editableTable {
    position: relative;
    overflow-x: visible;
  }
  .editableTable .table-wrapper {
    max-width: 100%;
    min-height: 200px;
    overflow-x: auto;
    font-size: .8rem;
    white-space: nowrap;
  }
  .editableTable table {
    width: 100%;
  }
  .editableTable th {
    padding: 0.5rem;
    background: #eee;
  }
  .editableTable th, .editableTable td {
    border: 1px solid #dee2e6;
    min-width: 150px;
    width: fit-content;
  }
  .editableTable td {
    position: relative;
    padding: 0 2px;
    height: 2rem;
    overflow: visible;
    min-width: 200px;
  }
  .editableTable td.textarea {
    min-width: 300px;
  }
  span.info {
    color: #aaa;
    font-size: 1rem;
    border: 1px solid #aaa;
    border-radius: 50%;
    line-height: 1.1;
    padding: 0 .4rem;
    cursor: default;
    user-select: none;
  }
  .tip {
    color: white;
    padding: .1rem .5rem;
    border-radius: .5rem;
    line-height: 1.1;
    cursor: default;
    user-select: none;
    margin-bottom: 1rem;
  }
  .tip.required {
    background: #e35027;
  }
  .tip.optional {
    background: #888;
  }
  .table-row-controls {
    position: absolute;
    left: -70px;
    /* bottom set with computed */
  }
  .table-row-controls .btn {
    width: 1.5rem;
    margin: .2rem;
    padding: .2rem;
    line-height: 1;
    text-align: center;
  }
  .table-toolbar {
    display: flex;
    flex-direction: row;
    margin-top: .5rem;
  }
  .btn-tool {
    color: white;
    background: var(--secondary);
    margin: .2rem;
    padding: .2rem;
    line-height: 1;
  }
  .clear-buttons {
    position: relative;
  }
  .clear-buttons .options {
    display: none;
    position: absolute;
    z-index: 1;
    top: 2.3rem;
    left: 4px;
    transform: translateY(3px);
    background: #424242;
    border-top-right-radius: .5rem;
    border-bottom-right-radius: .5rem;
  }
  .clear-buttons:hover .options {
    display: flex;
    flex-direction: column;
  }
  .clear-buttons .options .btn {
    color: white;
    background-color: #424242;
  }
  .clear-buttons .options .btn:hover {
    background: var(--secondary);
  }
  .validity-result {
    margin-left: .5rem;
    transform: translateY(.2rem);
  }
  .validity-result .material-symbols-outlined {
    font-size: 2rem;
  }
  .modal-help code {
    background: #eee;
    padding: .1rem .3rem;
    border-radius: .3rem;
    margin: .2rem;
  }
  .modal-help td {
    padding: .2rem .5rem;
  }
  </style>
