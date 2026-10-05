# Simulationvuer JSON Validator (uv)

This folder is set up as a small `uv` Python project to validate JSON files against `simulationvuer-ui-schema.json`.

## Prerequisites

- `uv` installed (`uv --version`)
- Python 3.10+ (managed by uv)

## Setup

From this folder (`simulationvuer-json`):

```powershell
uv sync
```

This creates a virtual environment and installs dependencies.

## Run the CLI

Validate an input JSON file using the default schema in this folder:

```powershell
uv run python .\validate_json.py .\your-input.json
```

Use a custom schema path:

```powershell
uv run python .\validate_json.py .\your-input.json --schema .\simulationvuer-ui-schema.json
```

You can also run it from the workspace root:

```powershell
uv run python .\simulationvuer-json\validate_json.py .\path\to\input.json
```

## Exit Codes

- `0`: valid JSON for schema
- `1`: JSON is well-formed but fails schema validation
- `2`: setup/runtime issues (missing file, malformed JSON, missing dependency, etc.)
