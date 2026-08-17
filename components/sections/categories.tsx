import { cacheLife } from "next/cache";
import Link from "next/link";
import { commerce } from "@/lib/commerce";
import { YNSMedia } from "@/lib/yns-media";

const CATEGORIES_LIMIT = 4;

export async function Categories() {
	"use cache";
	cacheLife("minutes");

	const { data: collections } = await commerce.collectionBrowse({ limit: CATEGORIES_LIMIT });

	if (collections.length === 0) {
		return null;
	}

	return (
		<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
			<div className="mb-12">
				<h2 className="text-2xl sm:text-3xl font-medium text-foreground">Shop by Category</h2>
				<p className="mt-2 text-muted-foreground">Find exactly what you're looking for</p>
			</div>
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
				{collections.map((collection) => (
					<Link
						key={collection.id}
						href={`/collection/${collection.slug}`}
						className="group relative aspect-4/5 overflow-hidden rounded-2xl bg-secondary"
					>
						{collection.image ? (
							<YNSMedia
								src={collection.image}
								alt={collection.name}
								fill
								sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
								className="object-cover transition-transform duration-500 group-hover:scale-105"
							/>
						) : null}
						<div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/0 to-black/0" />
						<span className="absolute bottom-4 left-4 right-4 text-base sm:text-lg font-medium text-white">
							{collection.name}
						</span>
					</Link>
				))}
			</div>
		</section>
	);
}
