import { useEffect } from "react";

export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    const previousTitle = document.title;
    const descriptionMeta = document.head.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = descriptionMeta?.getAttribute("content") ?? "";

    document.title = title;

    if (descriptionMeta) {
      descriptionMeta.setAttribute("content", description);
    }

    return () => {
      document.title = previousTitle;
      if (descriptionMeta) {
        descriptionMeta.setAttribute("content", previousDescription);
      }
    };
  }, [title, description]);
}

