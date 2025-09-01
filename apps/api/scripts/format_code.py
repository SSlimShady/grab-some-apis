#!/usr/bin/env python3
"""
Code formatting script for the API project.
Runs Black and autopep8 with proper line length settings.
"""

import subprocess
import sys
from pathlib import Path


def run_command(command: list[str], description: str) -> bool:
    """Run a command and return success status."""
    print(f"Running {description}...")
    try:
        result = subprocess.run(command, check=True, capture_output=True, text=True)
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error running {description}: {e}")
        if e.stderr:
            print(f"Error output: {e.stderr}")
        return False


def main():
    """Main function to format code."""

    # Ensure we're in the right directory
    api_dir = Path(__file__).parent.parent
    if not (api_dir / "app").exists():
        print("Error: Could not find 'app' directory. Make sure you're in the API project root.")
        sys.exit(1)

    print("Formatting Python code...")

    # Run isort to sort imports first
    isort_success = run_command(["poetry", "run", "isort", "."], "isort import sorter")

    # Run Black formatter on app and tests
    black_success = run_command(["poetry", "run", "black", ".", "--line-length", "120"], "Black formatter")

    # Run autopep8 for additional fixes on app and tests
    autopep8_success = run_command(
        [
            "poetry",
            "run",
            "autopep8",
            "--max-line-length=120",
            "--aggressive",
            "--in-place",
            "--recursive",
            ".",
        ],
        "autopep8 formatter",
    )

    if isort_success and black_success and autopep8_success:
        print("Code formatting completed successfully!")
    else:
        print("Some formatting tools failed. Check the output above.")
        sys.exit(1)


if __name__ == "__main__":
    main()
