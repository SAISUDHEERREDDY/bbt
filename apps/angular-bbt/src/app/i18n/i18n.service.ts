import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApplicationState } from '../reducers';
import { Store } from '@ngrx/store';
import { setGlobalLanguage } from '../reducers/i18n/actions';
import { SupportedLanguage, SupportedLocale } from './lang.types';
import { map } from 'rxjs/operators';
import { Language } from '../item-lang/language.interface';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private $: any = (window as any).$;

  private _currentLang: SupportedLanguage = 'en';
  get currentLang() {
    return this._currentLang;
  }

  private _currentMenu: SupportedLocale = 'en-US';
  get currentMenu() {
    this._currentMenu = this.defaultLocales.get(this.currentLang);

    return this._currentMenu;
  }

  private _currentLang$ = new BehaviorSubject<SupportedLanguage>(
    this.currentLang
  );
  public currentLang$: Observable<SupportedLanguage> =
    this._currentLang$.asObservable();

  /**
   * Get the approriate locale based on language.
   * NOTE: This is currently really the way this works. A language has a one to
   * one mapping with a locale and visa versa. This is bad an likely to hurt us
   * in the future.
   */
  public currentLocale$ = this._currentLang$.pipe(
    map(lang => this.defaultLocales.get(lang))
  );

  private assets = {
    en: 'assets/i18n/en.json',
    fr: 'assets/i18n/fr.json',
    es: 'assets/i18n/es.json'
  };

  languages = new Map<SupportedLanguage, string>()
    .set('en', 'ENGLISH')
    .set('fr', 'FRENCH')
    .set('es', 'SPANISH');

  defaultLocales = new Map<SupportedLanguage, SupportedLocale>()
    .set('en', 'en-US')
    .set('fr', 'fr-FR')
    .set('es', 'es-ES');

  get i18n() {
    return this.$.i18n;
  }
  constructor(private store: Store<ApplicationState>) {
    //Looks for a cookie and sets the language
    if (this.$.cookie('language')) {
      this.set_locale(this.$.cookie('language'));
    } else {
      this.$.cookie('language', 'en', { path: '/' });
    }
  }

  /**
   * Typesafe helper to translate
   * @param key   The translation key to use
   * @param args  Arguements to pass
   */
  translate(key: string, ...args: any[]): string | undefined {
    return this.i18n(key, ...args);
  }

  async load() {
    return new Promise<void>((res, rej) => {
      //Loads the language files

      this.i18n()
        .load(this.assets)
        .done(() => {
          this.set_locale();
          const self = this;
          this.$('.lang').on('click', 'a', function (e) {
            e.preventDefault();
            const locale = self.$(this).data('locale');
            if (locale) {
              self.i18n().locale = self.$(this).data('locale');
              self.set_locale(self.i18n().locale);
              self.set_check(self.i18n().locale);
            }
          });
          res();
        })
        .fail(function () {
          rej('Failed to load translations');
        });
    });
  }

  set_cookie(l) {
    this.$.cookie('language', l, { path: '/' });
  }

  set_check(locale) {
    this.$('#language i').hide();
    this.$('#' + locale).show();
  }

  set_locale(locale?: SupportedLanguage) {
    if (locale) {
      this.i18n().locale = locale;
      this.set_cookie(locale);
      this._currentLang = locale;
      this._currentLang$.next(locale);
      this.store.dispatch(
        setGlobalLanguage({
          code: locale as string,
          label: this.languages.get(locale)
        })
      );
    }
    this.$('body').i18n();
  }

  getMenuLanguages() {
    let languages = this.languages;
    let locales = this.defaultLocales;
    let menuLanguages: any[] = [];
    let index = 0;
    for (let [key, value] of locales) {
      menuLanguages[index] = { code: value, description: languages.get(key) };
      index += 1;
    }
    return menuLanguages;
  }
}
