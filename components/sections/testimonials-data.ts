export type Testimonial = {
	name: string;
	location: string;
	rating: 1 | 2 | 3 | 4 | 5;
	quote: string;
};

// Placeholder testimonials — replace every entry with real customer quotes
// (e.g. pulled from your product reviews or support inbox) before launch.
// Publishing fabricated testimonials as genuine customer feedback is misleading
// advertising in most jurisdictions.
export const testimonials: Testimonial[] = [
	{
		name: "Customer name",
		location: "City, Country",
		rating: 5,
		quote: "Replace this with a real quote from a verified customer review or order.",
	},
	{
		name: "Customer name",
		location: "City, Country",
		rating: 5,
		quote: "Replace this with a real quote from a verified customer review or order.",
	},
	{
		name: "Customer name",
		location: "City, Country",
		rating: 4,
		quote: "Replace this with a real quote from a verified customer review or order.",
	},
];
