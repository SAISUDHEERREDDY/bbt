export type SupportedLanguage = 'en' | 'fr' | 'es';
export type SupportedLocale = 'en-US' | 'fr-FR' | 'es-ES';
export type TranslationMappingObject = {
  [key in SupportedLocale]: string;
};
