# Development Scripts

This directory contains Python scripts for maintaining code quality in the API project. All scripts
are configured to work with the 120-character line length standard.

## Available Scripts

### Poetry Commands

Use these Poetry commands to run the development scripts:

```bash
# Run all quality checks (comprehensive)
poetry run check

# Format code with Black and autopep8
poetry run format

# Run linting with flake8, mypy, and isort
poetry run lint

# Run type checking with mypy
poetry run typecheck

# Development server
poetry run dev

# Production server
poetry run start
```

### Script Details

#### `check_all.py` - Comprehensive Quality Check

- **Command**: `poetry run check`
- **Purpose**: Runs all code quality checks in sequence
- **Includes**:
  - Code formatting (Black, autopep8)
  - Import sorting (isort)
  - Linting (flake8)
  - Type checking (mypy)
  - Security audit (pip-audit)
  - Security scanning (bandit)
- **Exit Code**: 0 if all checks pass, 1 if any fail

#### `format_code.py` - Code Formatting

- **Command**: `poetry run format`
- **Purpose**: Automatically format code to comply with standards
- **Tools**: Black (120 chars), autopep8 (120 chars)
- **Target**: All Python files in `app/` directory

#### `lint_code.py` - Code Linting

- **Command**: `poetry run lint`
- **Purpose**: Check code quality and style compliance
- **Tools**: flake8 (120 chars), mypy, isort
- **Configuration**: Uses `.flake8` and `pyproject.toml` settings

#### `typecheck.py` - Type Checking

- **Command**: `poetry run typecheck`
- **Purpose**: Verify type annotations and catch type errors
- **Tool**: mypy with strict configuration
- **Target**: All Python files in `app/` directory

## Configuration

All tools are configured for 120-character line length:

- **Black**: `--line-length 120`
- **autopep8**: `--max-line-length=120`
- **flake8**: `max-line-length = 120` (in `.flake8`)
- **mypy**: Uses `pyproject.toml` configuration

## CI Integration

These scripts are integrated into the GitHub Actions CI pipeline in `.github/workflows/ci.yml`. The
CI runs the same quality checks to ensure code standards are maintained.

## Usage Examples

```bash
# Before committing, run all checks
poetry run check

# Fix formatting issues automatically
poetry run format

# Check only linting without fixing
poetry run lint

# Verify type annotations
poetry run typecheck
```

## Error Handling

Each script provides:

- Clear progress indicators (🔄, ✅, ❌)
- Detailed error messages
- Proper exit codes for CI integration
- Captured output from all tools

## Dependencies

Scripts require the following development dependencies:

- black
- autopep8
- flake8
- mypy
- isort
- pip-audit
- bandit

All dependencies are managed through Poetry in `pyproject.toml`.
