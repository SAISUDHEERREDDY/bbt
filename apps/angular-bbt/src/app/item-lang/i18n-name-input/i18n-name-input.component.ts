import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LangInput } from '../lang-input.interface';
import { Language } from '../language.interface';
import { LanguageService } from '../language.service';
import { I18nService } from '../../i18n/i18n.service';
import { keyValuesToMap } from '@angular/flex-layout/extended/typings/style/style-transforms';

@Component({
  selector: 'app-i18n-name-input',
  templateUrl: './i18n-name-input.component.html',
  styleUrls: ['./i18n-name-input.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: I18nNameInputComponent,
      multi: true
    }
  ]
})
export class I18nNameInputComponent implements OnInit, ControlValueAccessor {
  supportedLanguages: any = [];
  titlesArray: LangInput[] = [];

  @Input()
  titles: any = {};
  @Output()
  titlesChange: EventEmitter<any> = new EventEmitter<any>();
  @Output()
  isTitleValid = new EventEmitter<boolean>();
  private defaultLocale = 'en-US';

  onChange: (_: any) => void;
  onTouched = () => {};

  constructor(
    private languageService: LanguageService,
    public i18nService: I18nService // private locale: DateLocaleSettingsService
  ) {}

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  writeValue(obj: any): void {
    console.log('writeValue has been triggered, obj=' + obj);
    if (this.titles.length < 1) {
      this.titlesArray = [];
    }

    this.titles = obj;
    this.getTitles();
    this.checkValidity();
  }

  setDisabledState?(isDisabled: boolean): void {}

  ngOnInit(): void {
    this.getLanguages();
    this.getTitles();
  }

  checkValidity() {
    console.log('checkValidity');
    let isTitleValid = true;
    this.titlesArray.forEach(function (title) {
      if (title.code.length < 1 || title.value.length < 1) {
        isTitleValid = false;
      }
    });
    this.isTitleValid.emit(isTitleValid);
  }
  /**
   * Method that will parse a JSON string to create the LangInput array
   * @param titles
   */
  getTitles() {
    if (this.titles) {
      for (const type in this.titles) {
        if (type) {
          const item = {
            code: type,
            value: this.titles[type]
          };
          this.titlesArray.push(item);
        }
      }
    } else {
      this.addLanguage();
    }
  }

  /**
   * Method to call the service to get the list of available languages.
   */
  getLanguages() {
    this.supportedLanguages = this.i18nService.getMenuLanguages();
  }

  /**
   * Sets the language for a specific title/name
   * @param language
   * @param index
   */
  selectLanguage(language: string, index: number) {
    this.titlesArray[index].code = language;
    this.titles = this.createTitleJson();
    this.titlesChange.emit(this.titles);
    this.checkValidity();
  }

  /**
   * Adds another title/name input box with language selection
   */
  addLanguage() {
    const nameInput: LangInput = {
      code: this.supportedLanguages[0].code,
      value: ''
    };
    this.titlesArray.push(nameInput);
    this.checkValidity();
  }

  /**
   * When the name is entered, it is added to the titles array
   * @param event
   * @param index
   */
  addName(event: any, index: number) {
    this.titlesArray[index].value = event.target.value;
    this.titles = this.createTitleJson();
    this.titlesChange.emit(this.titles);
    this.checkValidity();
  }
  /**
   * Helper method to remove a name/language pair from array
   * @param index
   */
  removeNameInput(index: number) {
    this.titlesArray.splice(index, 1);
    this.titles = this.createTitleJson();
    this.titlesChange.emit(this.titles);
    this.checkValidity();
  }

  /**
   * Convert descripitons array into a JSON string, this is stored in the DB.
   */
  createTitleJson(): {} {
    console.log('createTitleJson');
    let tempTitles = {};
    if (this.titlesArray.length > 0) {
      tempTitles = this.titlesArray.reduce(function (pre, cur, index) {
        pre[cur.code] = cur.value;
        return pre;
      }, {});
    }
    return tempTitles;
  }
}
