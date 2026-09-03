-- Seeds the "plan" table from the previously-static catalog in
-- packages/schema/src/billing/plans.ts, so it has a starting row to edit. ON CONFLICT DO NOTHING
-- makes this safe to leave in place even if a row somehow already exists (e.g. a manual insert
-- during testing) -- it never overwrites already-configured values.
INSERT INTO "plan" ("id", "name", "price_xof", "billing_period", "document_limit", "allowed_templates")
VALUES
	('free', 'Gratuit', 0, NULL, 3, ARRAY['azurill', 'bronzor', 'onyx', 'kakuna', 'eevee', 'vulpix']),
	('pro-monthly', 'Pro mensuel', 2500, 'monthly', NULL, ARRAY[
		'azurill', 'bronzor', 'chikorita', 'custom', 'ditgar', 'ditto', 'eevee', 'espeon', 'gengar',
		'glalie', 'kakuna', 'lapras', 'leafish', 'meowth', 'onyx', 'pikachu', 'rhyhorn', 'scizor',
		'snorlax', 'togepi', 'vulpix'
	]),
	('pro-yearly', 'Pro annuel', 25000, 'yearly', NULL, ARRAY[
		'azurill', 'bronzor', 'chikorita', 'custom', 'ditgar', 'ditto', 'eevee', 'espeon', 'gengar',
		'glalie', 'kakuna', 'lapras', 'leafish', 'meowth', 'onyx', 'pikachu', 'rhyhorn', 'scizor',
		'snorlax', 'togepi', 'vulpix'
	])
ON CONFLICT ("id") DO NOTHING;
