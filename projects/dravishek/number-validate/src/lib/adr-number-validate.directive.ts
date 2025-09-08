import { DecimalPipe } from '@angular/common';
import { Directive, DoCheck, ElementRef, HostListener, input, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[adrNumberValidate]',
  standalone: true,
  providers: [DecimalPipe]
})
export class AdrNumberValidateDirective implements DoCheck {

  constructor(private el: ElementRef, private decimalPipe: DecimalPipe, @Optional() private control: NgControl) { }

  /**
   * @description Value before the decimal point specifies the number of digits before decimal and value after the decimal specifies the number of digits after decimal.
   * Example: 7.3 (Before decimal 7 digits & 3 digits after decimal)
   * Possible type of patterns allowed: X, X.X
  */
  adrNumberValidate = input<string>('');
  private previousValue: string = '';

  @HostListener("keydown", ["$event"])
  onKeyDown = (event: KeyboardEvent) => this.execute(this.el.nativeElement.value);

  @HostListener("paste", ["$event"])
  onPaste = (event: ClipboardEvent) => this.execute(this.el.nativeElement.value);

  @HostListener('focus')
  onFocus() {
    const input = this.el.nativeElement as HTMLInputElement;
    input.value = input.value.replace(/,/g, '');
  }

  ngDoCheck(): void {
    const currentValue = this.el.nativeElement.value;
    if (currentValue !== this.previousValue) {
      this.execute(this.previousValue);
      this.previousValue = currentValue;
    }
  }

  /**
   * Validates the input string against a dynamically constructed regular expression
   * based on the ADR number format specification.
   *
   * The format is determined by splitting the result of `adrNumberValidate()` into
   * a prefix and scale. The prefix is used to extract the allowed sign and digit length,
   * while the scale determines the number of digits allowed after the decimal point.
   *
   * @param value - The input string to validate.
   * @returns A `RegExpMatchArray` if the input matches the constructed regular expression,
   *          or `null` if it does not match.
   */
  private checkValue(value: string): RegExpMatchArray | null {
    const [prefix, scale] = this.adrNumberValidate().split('.'), { regex, prefix: maxDigitsBeforeDecimal } = this.extractSignWithLength(prefix);
    let regExpString = `^(${regex}{1,${maxDigitsBeforeDecimal}})`;
    if (+scale > 0) {
      regExpString += `(\\.{1}[\\d]{0,${+scale}})?`;
    }
    const fullRegex = new RegExp(`${regExpString}$`);
    return value.match(fullRegex);
  }

  /**
   * Extracts the sign and digit length from a given prefix string and generates a corresponding regex pattern.
   *
   * The prefix should be in the format of an optional sign ('-' or '+') followed by one or more digits (e.g., "-3", "+2", "5").
   * The function returns an object containing:
   * - `regex`: A string representing the regex pattern for the sign and digit.
   * - `prefix`: The number of digits specified in the prefix.
   *
   * If the prefix does not match the expected format, a default regex pattern and prefix value are returned.
   *
   * @param prefix - The string containing an optional sign and digit count.
   * @returns An object with `regex` (string) and `prefix` (number) properties.
   */
  private extractSignWithLength(prefix: string) {
    const signMatch = prefix.match(/^([-+]?)(\d+)$/);
    if (signMatch) {
      const sign = signMatch[1]; // "-" or "+"
      const digitCount = +signMatch[2];
      // Enforce mandatory sign if specified
      const signRegexMap: { [key: string]: string } = { '-': '\\-', '+': '\\+?' },
       signRegex = signRegexMap[sign] ?? '[-+]?';
      return { regex: `${signRegex}\\d`, prefix: digitCount };
    }
    return { regex: '[-+]?\\d', prefix: 0 };
  }

  /**
   * Handles input validation and value patching for ADR number fields.
   *
   * This method enforces sign rules based on the validation pattern:
   * - If a negative sign is required, the value must start with '-'.
   * - If a positive sign is required, the value must not start with '-'.
   * - If no sign is required, any value is allowed.
   *
   * The method allows intermediate input states (e.g., "-", "-.", "-12.") to support user typing.
   * If the input does not meet the required sign rules or is invalid, it reverts to the previous value.
   * Otherwise, it patches the control value with the parsed number or the current string value,
   * preserving intermediate states and empty input.
   * It also formats the input value with thousand separators when appropriate.
   *
   * @param oldValue - The previous valid value of the input, used to revert in case of invalid input.
   */
  private execute(oldValue: string) {
    setTimeout(() => {
      const inputElement = this.el.nativeElement as HTMLInputElement, currentValue: string = inputElement.value.replace(/,/g, ''),
        pattern = this.adrNumberValidate(), requiresNegative = pattern.startsWith('-'), requiresPositive = pattern.startsWith('+');
      // Enforce sign rules:
      // - If negative is required, must start with '-'
      // - If positive is required, must NOT start with '-' (but '+' is optional)
      const hasRequiredSign =
        (!requiresNegative && !requiresPositive) ||
        (requiresNegative && currentValue.startsWith('-')) ||
        (requiresPositive && !currentValue.startsWith('-'));
      // If the sign is missing and required, reject immediately
      if (!hasRequiredSign && currentValue !== '') {
        this.control?.control?.patchValue(0);
        inputElement.value = '';
        return;
      }
      // Allow intermediate states like "-", "-.", "-12.", etc.
      const isIntermediate = /^-?$|^\.$|^-?\.$|^-?\d+\.$|^\d+\.$/.test(currentValue), isValid = this.checkValue(currentValue);
      if (currentValue === '' || isValid || isIntermediate) {
        this.previousValue = currentValue;
        const endsWithDot = currentValue.endsWith('.'),
          patchValue = currentValue === '' ? '' : (!endsWithDot && !isNaN(+currentValue)) ? +currentValue : currentValue;
        this.control?.control?.patchValue(patchValue);
        // Format view only if it's a valid number and not intermediate
        if (!isIntermediate && !isNaN(+currentValue)) {
          const [intPart, decimalPart] = currentValue.split('.');
          const formatted = this.decimalPipe.transform(intPart, '1.0-0');
          inputElement.value = decimalPart
            ? `${formatted}.${decimalPart}`
            : formatted ?? '';
        } else {
          inputElement.value = currentValue;
        }
      } else {
        inputElement.value = oldValue;
        this.control?.control?.patchValue(isNaN(+oldValue) ? oldValue : +oldValue);
      }
    });
  }
}
