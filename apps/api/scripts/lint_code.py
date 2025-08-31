#!/usr/bin/env python3
"""
Linting script for the API project.
Runs flake8, mypy, and other code quality checks.
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
    """Main function to run linting."""

    # Ensure we're in the right directory
    api_dir = Path(__file__).parent.parent
    if not (api_dir / "app").exists():
        print("Error: Could not find 'app' directory. Make sure you're in the API project root.")
        sys.exit(1)

    print("🔍 Running code quality checks...")

    success = True

    # Run flake8
    if not run_command(["poetry", "run", "flake8", "app/", "--config=.flake8"], "flake8 linting"):
        success = False

    # Run mypy
    if not run_command(["poetry", "run", "mypy", "app"], "mypy type checking"):
        success = False

    # Run isort check
    if not run_command(["poetry", "run", "isort", "--check-only", "."], "isort import sorting check"):
        success = False

    if success:
        print("All code quality checks passed!")
    else:
        print("Some code quality checks failed. Check the output above.")
        sys.exit(1)


if __name__ == "__main__":
    main()
