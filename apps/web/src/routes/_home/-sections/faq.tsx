import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { m } from "motion/react";
import { BRAND } from "@reactive-resume/brand";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@reactive-resume/ui/components/accordion";
import { cn } from "@reactive-resume/utils/style";

type FAQItemData = {
	question: string;
	answer: React.ReactNode;
};

const getFaqItems = (): FAQItemData[] => [
	{
		question: t`How is my data protected?`,
		answer: t`Your data is stored securely and is never shared with third parties. You stay in control of your resume and your information at all times.`,
	},
	{
		question: t`Can I export my resume to PDF?`,
		answer: t`Absolutely! You can export your resume to PDF with a single click. The exported PDF maintains all your formatting and styling perfectly.`,
	},
	{
		question: t`Can I also create a cover letter?`,
		answer: t`Yes! Cover letters are managed as their own documents, separate from your resumes, using the same templates, colors, and export options.`,
	},
	{
		question: t`Is ${BRAND.name} available in multiple languages?`,
		answer: t`Yes, ${BRAND.name} is available in multiple languages. You can choose your preferred language in the settings page, or using the language switcher in the top right corner.`,
	},
	{
		question: t`What makes ${BRAND.name} different from other resume builders?`,
		answer: t`${BRAND.name} is fast, focused, and built to help you get noticed: pick a template, fill in your details, and export a polished PDF in minutes — no clutter, no distractions.`,
	},
	{
		question: t`How do I share my resume?`,
		answer: t`You can share your resume via a unique public URL, protect it with a password, or download it as a PDF to share directly. The choice is yours!`,
	},
];

export function Faq() {
	const faqItems = getFaqItems();

	return (
		<section
			id="frequently-asked-questions"
			className="flex flex-col gap-x-16 gap-y-6 p-4 md:p-8 lg:flex-row lg:gap-x-18 xl:py-16"
		>
			<m.h2
				className={cn(
					"flex-1 font-semibold text-2xl tracking-tight will-change-[transform,opacity] md:text-4xl xl:text-5xl",
					"flex shrink-0 flex-wrap items-center gap-x-1.5 lg:flex-col lg:items-start",
				)}
				initial={{ opacity: 0, x: -20 }}
				whileInView={{ opacity: 1, x: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.45 }}
			>
				<Trans context="Home page FAQ section heading with each word visually separated into individual spans">
					<span>Frequently</span>
					<span>Asked</span>
					<span>Questions</span>
				</Trans>
			</m.h2>

			<m.div
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.45, delay: 0.08 }}
				className="max-w-2xl flex-2 will-change-[transform,opacity] lg:ml-auto 2xl:max-w-3xl"
			>
				<Accordion multiple>
					{faqItems.map((item, index) => (
						<FAQItemComponent key={item.question} item={item} index={index} />
					))}
				</Accordion>
			</m.div>
		</section>
	);
}

type FAQItemComponentProps = {
	item: FAQItemData;
	index: number;
};

function FAQItemComponent({ item, index }: FAQItemComponentProps) {
	return (
		<m.div
			className="will-change-[transform,opacity] last:border-b"
			initial={{ opacity: 0, y: 10 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.24, delay: Math.min(0.16, index * 0.03) }}
		>
			<AccordionItem value={item.question} className="group border-t">
				<AccordionTrigger className="py-5">{item.question}</AccordionTrigger>
				<AccordionContent className="pb-5 text-muted-foreground leading-relaxed">{item.answer}</AccordionContent>
			</AccordionItem>
		</m.div>
	);
}
