import { useEffect, useRef } from "react";

export function useAutoScroll(depsLength: number) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [depsLength]);

  return scrollRef;
}
