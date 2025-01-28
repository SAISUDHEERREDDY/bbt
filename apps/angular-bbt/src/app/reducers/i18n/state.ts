export interface LanguagePair {
  /**
   * An LCID string showing the language to use
   */
  code: string;

  /**
   * A human readable label expressing the language/locale pair
   */
  label?: string;
}

export interface I18nState {
  /**
   * The language set for the whole application.
   */
  global: LanguagePair;
}
