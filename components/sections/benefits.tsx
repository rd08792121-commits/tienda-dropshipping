import type { LucideIcon } from "lucide-react";
import { Headset, RotateCcw, Shield, Truck } from "lucide-react";

type Benefit = {
	icon: LucideIcon;
	title: string;
	description: string;
};

// Edit these to match your store's real policies (shipping thresholds, return
// window, support hours) before launch — they render as factual claims.
const benefits: Benefit[] = [
	{
		icon: Truck,
		title: "Fast Worldwide Shipping",
		description: "Tracked delivery on every order, straight to your door.",
	},
	{
		icon: Shield,
		title: "Secure Checkout",
		description: "Payments are encrypted and processed securely.",
	},
	{
		icon: RotateCcw,
		title: "Easy Returns",
		description: "Not the right fit? Return it within 30 days.",
	},
	{
		icon: Headset,
		title: "Real Human Support",
		description: "Questions before or after you buy? We're here to help.",
	},
];

export function Benefits() {
	return (
		<section className="border-y border-border bg-secondary/30">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6">
					{benefits.map((benefit) => (
						<div
							key={benefit.title}
							className="flex flex-col items-center text-center gap-3 sm:flex-row sm:text-left"
						>
							<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-background border border-border">
								<benefit.icon className="h-5 w-5 text-foreground" aria-hidden />
							</div>
							<div>
								<h3 className="text-sm font-semibold text-foreground">{benefit.title}</h3>
								<p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{benefit.description}</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
