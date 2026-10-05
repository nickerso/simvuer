#!/usr/bin/env python3
"""Validate an input JSON file against simulationvuer-ui-schema.json."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


def load_json(path: Path) -> object:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Validate a JSON file against the Simulationvuer UI JSON schema."
    )
    parser.add_argument(
        "input_json",
        type=Path,
        help="Path to the JSON file to validate.",
    )
    parser.add_argument(
        "--schema",
        type=Path,
        default=Path(__file__).parent / "simulationvuer-ui-schema.json",
        help=(
            "Path to the JSON schema file "
            "(default: simulationvuer-ui-schema.json in this folder)."
        ),
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    schema_path = args.schema.resolve()
    input_path = args.input_json.resolve()

    if not schema_path.exists():
        print(f"Schema file not found: {schema_path}", file=sys.stderr)
        return 2

    if not input_path.exists():
        print(f"Input JSON file not found: {input_path}", file=sys.stderr)
        return 2

    try:
        schema = load_json(schema_path)
    except json.JSONDecodeError as exc:
        print(f"Schema is not valid JSON: {schema_path}\n{exc}", file=sys.stderr)
        return 2

    try:
        data = load_json(input_path)
    except json.JSONDecodeError as exc:
        print(f"Input file is not valid JSON: {input_path}\n{exc}", file=sys.stderr)
        return 2

    try:
        from jsonschema import Draft202012Validator
    except ImportError:
        print(
            "Missing dependency: jsonschema\n"
            "Install it with: pip install jsonschema",
            file=sys.stderr,
        )
        return 2

    try:
        validator = Draft202012Validator(schema)
        errors = sorted(validator.iter_errors(data), key=lambda e: list(e.path))
    except Exception as exc:
        print(f"Schema setup failed: {exc}", file=sys.stderr)
        return 2

    if not errors:
        print(f"VALID: {input_path} conforms to {schema_path}")
        return 0

    print(f"INVALID: {input_path} does not conform to {schema_path}")
    for index, err in enumerate(errors, start=1):
        location = "/".join(str(part) for part in err.path) or "<root>"
        print(f"{index}. path={location} | message={err.message}")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
