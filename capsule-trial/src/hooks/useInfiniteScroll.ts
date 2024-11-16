import { TokenData } from "@/types/tokens";
import type { MutableRefObject } from "react";
import { useEffect, useRef, useState } from "react";

interface UseInfiniteScrollProps {
  tokensData: TokenData[];
  batchSize: number;
}

const useInfiniteScroll = ({
  tokensData,
  batchSize,
  containerRef,
}: UseInfiniteScrollProps & {
  containerRef: MutableRefObject<HTMLDivElement | null>;
}) => {
  const [visibleTokens, setVisibleTokens] = useState<TokenData[]>([]);
  const [startIndex, setStartIndex] = useState(0);
  const [allTokensLoaded, setAllTokensLoaded] = useState(false);
  const visibleTokensLoading = useRef<boolean>(true);

  useEffect(() => {
    visibleTokensLoading.current = true;
    const updatedTokenList = tokensData.slice(0, batchSize);
    setVisibleTokens(updatedTokenList);
    setStartIndex(Object.values(updatedTokenList).length);
    visibleTokensLoading.current = false;
  }, [tokensData, batchSize]);

  const loadTokens = (start: number, count: number) => {
    visibleTokensLoading.current = true;
    const tokensToLoad = tokensData.slice(start, start + count);
    if (tokensToLoad.length > 0) {
      setVisibleTokens((prevTokens) => [
        ...new Set([...prevTokens, ...tokensToLoad]),
      ]);
      setStartIndex(start + count);
    }
    if (tokensToLoad.length < count) {
      setAllTokensLoaded(true);
    }
    visibleTokensLoading.current = false;
  };

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (
        Number(scrollTop + clientHeight) >= Number(scrollHeight - 20) &&
        !allTokensLoaded
      ) {
        loadTokens(startIndex, batchSize);
      }
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => {
        container.removeEventListener("scroll", handleScroll);
      };
    }
  }, [visibleTokens, containerRef, "scroll", allTokensLoaded]);

  return {
    visibleTokens,
    allTokensLoaded,
    visibleTokensLoading: visibleTokensLoading.current,
  };
};

export default useInfiniteScroll;
