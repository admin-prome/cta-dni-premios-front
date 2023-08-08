import { CurrencyPipe } from '@angular/common';
import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Pipe({
    name: 'currencyFormat'
})
@Injectable()
export class CurrencyFormatPipe implements PipeTransform {
    transform(value: string | undefined): string {
        if (!value) {
            return '';
        }

        const numberValue = parseFloat(value.replace(/,/g, ''));
        const formattedValue = numberValue.toLocaleString('en-US', { minimumFractionDigits: 2 });

        return `$${formattedValue}`;
    }
}