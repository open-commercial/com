import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'sicComFilter'
})
export class SicComFilterPipe implements PipeTransform {

  transform(value, keys: string, term: string): any {
    if (!term) { return value; }
    return (value || []).filter((item) => keys.split(',').some(
      key => item.hasOwnProperty(key) && new RegExp(term, 'gi').test(item[key])));
  }
}
