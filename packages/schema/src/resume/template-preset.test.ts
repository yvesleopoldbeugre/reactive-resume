import { describe, expect, it } from "vitest";
import { defaultResumeData } from "./default";
import { presetConfigSchema } from "./template-preset";

describe("presetConfigSchema", () => {
	it("accepts an empty config", () => {
		expect(presetConfigSchema.safeParse({}).success).toBe(true);
	});

	it("accepts a config with only colors set", () => {
		const result = presetConfigSchema.safeParse({ colors: defaultResumeData.metadata.design.colors });
		expect(result.success).toBe(true);
	});

	it("accepts a config with every field set", () => {
		const result = presetConfigSchema.safeParse({
			colors: defaultResumeData.metadata.design.colors,
			typography: defaultResumeData.metadata.typography,
			styleRules: [],
			layout: defaultResumeData.metadata.layout,
		});
		expect(result.success).toBe(true);
	});

	it("rejects an invalid color shape", () => {
		const result = presetConfigSchema.safeParse({ colors: { primary: 123 } });
		expect(result.success).toBe(false);
	});

	it("rejects unknown top-level keys", () => {
		const result = presetConfigSchema.safeParse({ notAField: true });
		expect(result.success).toBe(false);
	});
});
