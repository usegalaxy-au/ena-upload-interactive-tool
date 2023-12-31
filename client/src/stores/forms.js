import { ref } from 'vue'
import { defineStore } from 'pinia'
import { get } from '@/utils/api'


const EXAMPLE_DATA = {
  study: [
    {
      "alias": "a_cool_study",
      "title": "a cool study",
      "study_type": "Whole Genome Sequencing",
      "new_study_type": "",
      "study_abstract": ""
    }
  ],
  experiment: [{
    "alias": "a_cool_experiment",
    "title": "cool experiment",
    "study_alias": "a_cool_study",
    "sample_alias": "a cool sample",
    "design_description": "",
    "library_name": "",
    "library_strategy": "WGS",
    "library_source": "GENOMIC",
    "library_selection": "RANDOM",
    "library_layout": "Paired",
    "insert_size": "",
    "library_construction_protocol": "",
    "platform": "ILLUMINA",
    "instrument_model": "454 GS"
  }],
  run: [{
    "alias": "my_cool_run",
    "experiment_alias": "my_cool_experiment",
    "file_name": "myrun.sra",
    "file_format": "sra"
  }],
  sample: [{
    "alias": "my_cool_sample",
    "title": "my cool sample",
    "taxon_id": "1234",
    "sample_description": "",
    "cell_type": "",
    "dev_stage": "",
    "germline": "",
    "tissue_lib": "",
    "tissue_type": "",
    "isolation_source": "",
    "lat_lon": "",
    "collected_by": "",
    "collection date": "2020-01-01",
    "geographic location (country and/or sea)": "Afghanistan",
    "geographic location (region and locality)": "",
    "identified_by": "",
    "environmental_sample": "",
    "mating_type": "",
    "sex": "",
    "lab_host": "",
    "host scientific name": "",
    "bio_material": "",
    "culture_collection": "",
    "specimen_voucher": "",
    "cultivar": "",
    "ecotype": "",
    "isolate": "",
    "sub_species": "",
    "variety": "",
    "sub_strain": "",
    "cell_line": "",
    "serotype": "",
    "serovar": "",
    "strain": ""
  }],
}

let fetched = ref(false)

export const useFormStore = defineStore('formData', {
  state: () => ({
    study: [],
    experiment: [],
    run: [],
    sample: [],
    userUpload: null,
    valid: {
      'study': false,
      'experiment': false,
      'run': false,
      'sample': false,
    }
  }),
  actions: {
    fetchUserData() {
      if (!fetched.value) {
        return get('/data').then((data) => {
          const totalRowCount = Object.keys(data).reduce( (count, key) => count + data[key].length, 0 )
          if (!totalRowCount) {
            this.userUpload = false
          } else {
            this.study = data.study
            this.experiment = data.experiment
            this.run = data.run
            this.sample = data.sample
            this.userUpload = true
          }
          fetched.value = true
          return this.userUpload
        })
      }
      return new Promise((resolve) => {
        resolve(this.userUpload)
      })
    },
    getFormData(formName) {
      if (formName) {
        return this[formName]
      }
      return {
        study: this.study,
        experiment: this.experiment,
        run: this.run,
        sample: this.sample,
      }
    },
    setFormData(formName, data) {
      this[formName] = data
    },
    clearFormData(formName) {
      if (formName) {
        this[formName] = []
        return
      }
      this.study = []
      this.experiment = []
      this.run = []
      this.sample = []
    },
    loadExampleData() {
      this.study = EXAMPLE_DATA.study
      this.experiment = EXAMPLE_DATA.experiment
      this.run = EXAMPLE_DATA.run
      this.sample = EXAMPLE_DATA.sample
    },
    hasFormData(formName) {
      if (formName) {
        return this[formName].length > 0
      }
      const cellCount = [
        this.study,
        this.experiment,
        this.run,
        this.sample,
      ].reduce((acc, table) => {
        return acc + table.reduce((acc, row) => {
          return acc + Object.values(row).reduce((count, cellVal) => {
            return count + cellVal.length, 0
          }, 0)
        }, 0)
      }, 0)
      return cellCount > 0
    },
    validate(schema) {
      // Return list of invalid form names
      [
        'study',
        'experiment',
        'run',
        'sample',
      ].forEach((formName) => {
        let hasNonBlankRow = false
        const formIsValid = this[formName].reduce((acc, row) => {
          let isBlankRow = true
          const isValidRow = schema[formName].fields.reduce((acc, field) => {
            const cellVal = row[field.name]
            isBlankRow = isBlankRow && cellVal.length === 0
            const isValidCell = cellVal.length > 0 || field.cardinality === 'optional'
            return acc && isValidCell
          }, true) && this[formName].length
          hasNonBlankRow = !isBlankRow || hasNonBlankRow
          return acc && (isValidRow || isBlankRow)
        }, true)
        this.valid[formName] = formIsValid && hasNonBlankRow
      }, {})
      return Object.keys(this.valid).reduce( (acc, formName) => {
        if (!this.valid[formName]) acc.push(formName)
        return acc
      }, [])
    }
  }
})
