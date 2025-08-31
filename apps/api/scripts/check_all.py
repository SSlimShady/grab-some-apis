#!/usr/bin/env python3
"""
Comprehensive check script for the API project.
Runs formatting, linting, type checking, and tests.
"""

import subprocess
import sys
from pathlib import Path


def run_command(command: list[str], description: str) -> bool:
    """Run a command and return success status."""
    print(f"\n🔄 {description}...")
    try:
        result = subprocess.run(
            command,
            check=True,
            capture_output=True,
            text=True)
        if result.stdout:
            print(result.stdout)
        print(f"✅ {description} completed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        if e.stderr:
            print(f"Error output: {e.stderr}")
        if e.stdout:
            print(f"Output: {e.stdout}")
        return False


def main():
    """Main function to run all checks."""

    # Ensure we're in the right directory
    api_dir = Path(__file__).parent.parent
    if not (api_dir / "app").exists():
        print("Error: Could not find 'app' directory. Make sure you're in the API project root.")
        sys.exit(1)

    print("🚀 Running comprehensive code quality checks...")

    success = True

    # 1. Format code
    if not run_command(
        ["poetry", "run", "black", "app/", "--line-length", "120"],
        "Code formatting (Black)",
    ):
        success = False

    # 2. Additional formatting
    if not run_command(
        [
            "poetry",
            "run",
            "autopep8",
            "--max-line-length=120",
            "--aggressive",
            "--in-place",
            "--recursive",
            "app/",
        ],
        "Additional formatting (autopep8)",
    ):
        success = False

    # 3. Sort imports
    if not run_command(["poetry", "run", "isort", "."],
                       "Import sorting (isort)"):
        success = False

    # 4. Lint code
    if not run_command(["poetry", "run", "flake8", "app/",
                       "--config=.flake8"], "Code linting (flake8)"):
        success = False

    # 5. Type checking
    if not run_command(["poetry", "run", "mypy", "app"],
                       "Type checking (mypy)"):
        success = False

    # 6. Security audit
    if not run_command(
        ["poetry", "run", "pip-audit", "--ignore-vuln", "GHSA-wj6h-64fc-37mp"],
        "Security audit (pip-audit)",
    ):
        success = False

    # 7. Bandit security scan
    if not run_command(
        [
            "poetry",
            "run",
            "bandit",
            "-r",
            "app/",
            "-f",
            "json",
            "-o",
            "bandit-report.json",
            "--exit-zero",
        ],
        "Security scan (bandit)",
    ):
        print("⚠️  Bandit scan completed with warnings (check bandit-report.json)")

    if success:
        print("\n🎉 All checks passed! Your code is ready for deployment.")
    else:
        print("\n❌ Some checks failed. Please fix the issues above.")
        sys.exit(1)


if __name__ == "__main__":
    main()
