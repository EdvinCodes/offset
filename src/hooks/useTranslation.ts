import { useSettingsStore } from "@/store/useSettingsStore";
import { translations } from "@/data/i18n";

export function useTranslation() {
  const language = useSettingsStore((state) => state.language);

  // Devuelve el objeto de traducciones según el idioma seleccionado
  const t = translations[language];

  return { t, language };
}
