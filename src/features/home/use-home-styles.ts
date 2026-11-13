import { useLanguage } from "@/lib/providers/language-provider";
import { createHomeStyles } from "./home.styles";

export function useHomeStyles() {
  const { language } = useLanguage();

  return createHomeStyles(language);
}
