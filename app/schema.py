"""Fetch ENA forms schema from remote."""

import json
import requests

SCHEMA_LIST_URL = (
    'https://raw.githubusercontent.com/ELIXIR-Belgium/ENA-metadata-templates/'
    'main/checklist_overview.json'
)
SCHEMA_TEMPLATE_URL = (
    'https://raw.githubusercontent.com/ELIXIR-Belgium/ENA-metadata-templates/'
    'main/templates/{identifier}/{identifier}.json'
)


def fetch_template_list():
    """Fetch and parse schema list from JSON."""
    r = requests.get(SCHEMA_LIST_URL)
    data = json.loads(r.text)
    return data


def fetch_template(identifier):
    """Fetch and parse schema definition from YAML."""
    r = requests.get(SCHEMA_TEMPLATE_URL.format(identifier=identifier))
    data = json.loads(r.text)
    data['identifier'] = identifier
    return data
