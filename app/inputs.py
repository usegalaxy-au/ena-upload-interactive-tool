"""Handle optional input data from user."""

import os
import csv

INPUT_FILE_PATHS = {
    'study': os.getenv('ENA_INPUT_STUDY'),
    'experiment': os.getenv('ENA_INPUT_EXPERIMENT'),
    'run': os.getenv('ENA_INPUT_RUN'),
    'sample': os.getenv('ENA_INPUT_SAMPLE'),
}


def get_input_data():
    """Parse input data from user."""
    input_data = {}
    for key, path in INPUT_FILE_PATHS.items():
        if path:
            print(f"Loading {key} data from {path}...")
            input_data[key] = _read_table(path)
        else:
            input_data[key] = []
    return input_data


def _read_table(path):
    """Read input data table from tsv file to array of dicts."""
    with open(path, 'r') as f:
        reader = csv.DictReader(f, delimiter='\t')
        return [row for row in reader]
