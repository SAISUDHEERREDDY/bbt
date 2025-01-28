import { Pipe, PipeTransform } from '@angular/core';

/**
 * Removes the last part of an xpath
 * @param xpath             The xpath to modify
 * @param discountFirst     If true strip the first part as well if it is alone
 */
export const removeOneLayer = (xpath: string, discountFirst = false) => {
  if (xpath === null) {
    return null;
  }

  if (xpath === '') {
    return '';
  }

  const delimiter = '/';
  const pieces = xpath.split(delimiter);
  pieces.pop();

  // Handle discount first
  if (discountFirst && pieces.length === 1) {
    return '';
  }

  return pieces.join(delimiter);
};

@Pipe({
  name: 'removeXPathLayer'
})
export class RemoveXPathLayerPipe implements PipeTransform {
  transform(xpath: string) {
    return removeOneLayer(xpath);
  }
}
