import { Star } from "lucide-react";
import { testimonials } from "@/components/sections/testimonials-data";
import { cn } from "@/lib/utils";

function StarRow({ rating }: { rating: number }) {
	return (
		<div className="flex gap-0.5" aria-hidden>
			{Array.from({ length: 5 }, (_, i) => (
				<Star
					key={i}
					className={cn("h-4 w-4", i < rating ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted")}
				/>
			))}
		</div>
	);
}

export function Testimonials() {
	if (testimonials.length === 0) {
		return null;
	}

	return (
		<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
			<div className="max-w-2xl mb-12">
				<h2 className="text-2xl sm:text-3xl font-medium text-foreground">What customers say</h2>
				<p className="mt-2 text-muted-foreground">Real feedback from people who shopped with us</p>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{testimonials.map((testimonial) => (
					<figure
						key={`${testimonial.name}-${testimonial.quote}`}
						className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6"
					>
						<div>
							<StarRow rating={testimonial.rating} />
							<blockquote className="mt-4 text-sm leading-relaxed text-foreground">
								&ldquo;{testimonial.quote}&rdquo;
							</blockquote>
						</div>
						<figcaption className="mt-6 text-sm">
							<span className="font-medium text-foreground">{testimonial.name}</span>
							<span className="text-muted-foreground"> — {testimonial.location}</span>
						</figcaption>
					</figure>
				))}
			</div>
		</section>
	);
}
