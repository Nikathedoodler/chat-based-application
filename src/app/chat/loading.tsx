import { Skeleton } from "@/components/ui/skeleton";

export default function ChatLoading() {
  return (
    <div className="h-screen flex flex-col">
      {/* Fixed header skeleton */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-background border-b">
        <div className="max-w-7xl mx-auto">
          <div className="p-4">
            <Skeleton className="h-8 w-64 mx-auto mb-2" />
            <div className="flex justify-center items-center gap-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable content area skeleton */}
      <div className="pt-32 pb-0">
        <div className="max-w-7xl mx-auto">
          <div className="p-4 space-y-4">
            {/* Message skeletons */}
            <div className="flex justify-start">
              <Skeleton className="h-16 w-[70%] max-w-md rounded-lg" />
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-16 w-[70%] max-w-md rounded-lg" />
            </div>
            <div className="flex justify-start">
              <Skeleton className="h-20 w-[70%] max-w-md rounded-lg" />
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-12 w-[70%] max-w-md rounded-lg" />
            </div>
            <div className="flex justify-start">
              <Skeleton className="h-16 w-[70%] max-w-md rounded-lg" />
            </div>
          </div>

          {/* Input area skeleton */}
          <div className="fixed bottom-0 left-0 right-0 z-20 pb-4 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="bg-background rounded-2xl shadow-lg border p-4">
                <div className="flex gap-2">
                  <Skeleton className="h-10 flex-1 rounded-md" />
                  <Skeleton className="h-10 w-20 rounded-md" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

