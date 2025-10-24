export default function WebsiteCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl animate-pulse">
      {/* Full-bleed hero skeleton */}
      <div className="h-80 sm:h-96 md:h-[28rem] lg:h-[32rem] bg-gray-200 relative">
        {/* Category badge skeleton */}
        <div className="absolute top-4 left-4 z-10">
          <div className="h-6 w-20 bg-gray-300 rounded-full" />
        </div>
        
        
        {/* Content overlay skeleton */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
          <div>
            {/* Title skeleton */}
            <div className="h-7 bg-gray-300 rounded w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
}
