"""Basic Flask app."""

from flask import request, jsonify

from . import schema
from .app import app
from .outputs import write_forms_to_file
from .inputs import get_input_data


@app.route('/api/data', methods=['GET'])
def get_user_data(identifier):
    """Get pre-filled data from user input. May be null."""
    return jsonify(get_input_data())


@app.route('/api/schema/template/<identifier>', methods=['GET'])
def get_template(identifier):
    return jsonify({
        "schema": schema.fetch_template(identifier),
    })


@app.route('/api/schema/list', methods=['GET'])
def get_template_list():
    return jsonify({
        "templates": schema.fetch_template_list(),
    })


@app.route('/api/submit', methods=['POST'])
def submit():
    """Handle request to submit form and write to CSV."""
    print("Writing forms to files...")
    write_forms_to_file(request.json)
    return jsonify({"status": "success"})

    # TODO: Handle formatting errors etc
    return jsonify({
        "status": "error",
        "message": "Form data was invalid..."
    })
