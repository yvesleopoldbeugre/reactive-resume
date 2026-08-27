-- Promotes info@askoetude.com to admin if the account already exists. A no-op otherwise --
-- new signups from this address still get the admin role automatically via ADMIN_EMAILS
-- (see packages/auth/src/config.ts), so this migration only matters for an account created
-- before that env var was set.
UPDATE "user"
SET role = 'admin'
WHERE lower(email) = lower('info@askoetude.com');
