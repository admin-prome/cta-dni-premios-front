import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberToPipe'
})
export class NumberToPipePipe implements PipeTransform {

  transform(value: string | undefined): number {
    return value !== undefined ? parseFloat(value) : 0;
  }
}
