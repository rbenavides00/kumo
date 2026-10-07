import { useEffect } from "react";

function usePageTitle(title?: string): void {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} | Kumo` : "Kumo";

    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}

export default usePageTitle;
