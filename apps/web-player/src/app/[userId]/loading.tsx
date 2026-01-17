
export default function Loading() {
    return (
        <div className="animate-pulse space-y-6">
            {/* Hero Skeleton */}
            <div className="h-48 w-full bg-white/5 rounded-2xl border border-white/10" />

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-2 gap-4">
                <div className="h-32 bg-white/5 rounded-2xl border border-white/10" />
                <div className="h-32 bg-white/5 rounded-2xl border border-white/10" />
            </div>

            {/* List Skeleton */}
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 w-full bg-white/5 rounded-xl border border-white/10" />
                ))}
            </div>
        </div>
    );
}
