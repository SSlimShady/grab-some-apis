#!/usr/bin/env python3
"""
Type checking script for the API project.
Runs mypy with proper configuration.
"""

import subprocess
import sys
from pathlib import Path


def main():
    """Main function to run type checking."""

    # Ensure we're in the right directory
    api_dir = Path(__file__).parent.parent
    if not (api_dir / "app").exists():
        print("Error: Could not find 'app' directory. Make sure you're in the API project root.")
        sys.exit(1)

    print("📝 Running type checking...")

    try:
        result = subprocess.run(
            ["poetry", "run", "mypy", "app"], check=True, capture_output=True, text=True)
        if result.stdout:
            print(result.stdout)
        print("✅ Type checking completed successfully!")
    except subprocess.CalledProcessError as e:
        print(f"❌ Type checking failed: {e}")
        if e.stderr:
            print(f"Error output: {e.stderr}")
        if e.stdout:
            print(f"Output: {e.stdout}")
        sys.exit(1)


if __name__ == "__main__":
    main()
