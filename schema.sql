-- Mheen Memory Archive — D1 Schema
-- Run via: wrangler d1 execute <database_name> --remote --file=./schema.sql
-- Or apply via Cloudflare dashboard.

-- =============================================================================
-- NextAuth.js / Auth.js — Standard tables for @auth/d1-adapter
-- =============================================================================

CREATE TABLE IF NOT EXISTS "accounts" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  "oauth_token" TEXT,
  "oauth_token_secret" TEXT,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "sessions" (
  "id" TEXT NOT NULL,
  "sessionToken" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expires" INTEGER NOT NULL,
  PRIMARY KEY ("sessionToken")
);

CREATE TABLE IF NOT EXISTS "users" (
  "id" TEXT NOT NULL,
  "name" TEXT,
  "email" TEXT,
  "emailVerified" INTEGER,
  "image" TEXT,
  "role" TEXT NOT NULL DEFAULT 'public',
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "verification_tokens" (
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires" INTEGER NOT NULL,
  PRIMARY KEY ("token")
);

-- =============================================================================
-- Project-specific tables
-- =============================================================================

CREATE TABLE IF NOT EXISTS "martyrs" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name_ar" TEXT NOT NULL,
  "name_en" TEXT NOT NULL,
  "birth_date" TEXT,
  "death_date" TEXT,
  "bio_ar" TEXT,
  "bio_en" TEXT,
  "image_url" TEXT,
  "status" TEXT NOT NULL DEFAULT 'approved',
  "submitted_by" TEXT
);

CREATE TABLE IF NOT EXISTS "detainees" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name_ar" TEXT NOT NULL,
  "name_en" TEXT NOT NULL,
  "arrest_date" TEXT,
  "status_ar" TEXT,
  "status_en" TEXT,
  "image_url" TEXT,
  "status" TEXT NOT NULL DEFAULT 'approved',
  "submitted_by" TEXT
);

CREATE TABLE IF NOT EXISTS "stories" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "author_name" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "image_url" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "created_at" INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS "community_photos" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "title_ar" TEXT,
  "title_en" TEXT,
  "image_url" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "submitted_by_name" TEXT,
  "submitted_by_email" TEXT,
  "created_at" INTEGER NOT NULL DEFAULT (unixepoch()),
  "updated_at" INTEGER NOT NULL DEFAULT (unixepoch())
);
