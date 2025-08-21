-- Initialize the grab_apis_dev database
-- This script runs automatically when the PostgreSQL container starts
-- Minimal setup - tables will be created by FastAPI when the app starts

-- Create essential extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Ensure public schema exists (it usually does by default)
CREATE SCHEMA IF NOT EXISTS public;

-- Set default privileges
GRANT ALL ON SCHEMA public TO postgres;

-- Database is ready for FastAPI to create its own tables via SQLAlchemy/Alembic
