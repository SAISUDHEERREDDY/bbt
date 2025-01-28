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

@Component({
  selector: 'app-i18n-description-input',
  templateUrl: './i18n-description-input.component.html',
  styleUrls: ['./i18n-description-input.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: I18nDescriptionInputComponent,
      multi: true
    }
  ]
})
export class I18nDescriptionInputComponent
  implements OnInit, ControlValueAccessor
{
  supportedLanguages: any = [];
  descriptionArray: LangInput[] = [];
  @Input()
  descriptions: any = {};
  @Output()
  descriptionsChange: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  isDescValid = new EventEmitter<boolean>();
  private defaultLocale = 'en-US';

  onChange: (_: any) => void;
  onTouched = () => {};

  constructor(
    private languageService: LanguageService,
    public i18nService: I18nService
  ) {}

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  writeValue(obj: any): void {
    if (!this.descriptions) {
      this.descriptionArray = [];
    }
    this.descriptions = obj;
    this.getDescriptions();
  }

  setDisabledState?(isDisabled: boolean): void {}

  ngOnInit(): void {
    this.getLanguages();
    this.getDescriptions();
  }

  checkValidity() {
    let isDescValid = true;
    this.descriptionArray.forEach(function (desc) {
      if (desc.value.length > 1 && desc.code.length < 1) {
        isDescValid = false;
      }
    });
    this.isDescValid.emit(isDescValid);
  }
  /**
   * Method that will parse a JSON string to create the LangInput array
   * @param titleas
   */
  getDescriptions() {
    if (this.descriptions) {
      for (const type in this.descriptions) {
        if (type) {
          const item = {
            code: type,
            value: this.descriptions[type]
          };
          this.descriptionArray.push(item);
        }
      }
    } else {
      this.addLanguage();
    }
    this.checkValidity();
  }

  /**
   * Method to call the service to get the list of available languages.
   */
  getLanguages() {
    this.supportedLanguages = this.i18nService.getMenuLanguages();
  }

  /**
   * Sets the language for a specific description
   * @param language
   * @param index
   */
  selectLanguage(language: string, index: number) {
    this.descriptionArray[index].code = language;
    this.descriptions = this.createDescriptionJson();
    this.descriptionsChange.emit(this.descriptions);
    this.checkValidity();
  }

  /**
   * Adds another description input box with language selection
   */
  addLanguage() {
    const nameInput: LangInput = {
      code: this.supportedLanguages[0].code,
      value: ''
    };
    this.descriptionArray.push(nameInput);
    this.checkValidity();
  }

  /**
   * When the description is entered, it is added to the description array
   * @param event
   * @param index
   */
  addDescription(event: any, index: number) {
    this.descriptionArray[index].value = event.target.value;
    this.descriptions = this.createDescriptionJson();
    this.descriptionsChange.emit(this.descriptions);
    this.checkValidity();
  }

  /**
   * Helper method to remove a description/language pair from array
   * @param index
   */
  removeDescriptionInput(index: number) {
    this.descriptionArray.splice(index, 1);
    this.descriptions = this.createDescriptionJson();
    this.descriptionsChange.emit(this.descriptions);
    this.checkValidity();
  }

  /**
   * Convert the description array into a JSON string, this is stored in the DB.
   */
  createDescriptionJson(): {} {
    let tempDescriptions = {};
    if (this.descriptionArray.length > 0) {
      tempDescriptions = this.descriptionArray.reduce(function (
        pre,
        cur,
        index
      ) {
        if (cur.code.length > 0 && cur.value.length > 0) {
          pre[cur.code] = cur.value;
        }
        return pre;
      },
      {});
    }
    return tempDescriptions;
  }
}
