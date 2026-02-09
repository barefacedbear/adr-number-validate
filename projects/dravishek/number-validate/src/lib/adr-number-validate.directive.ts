import { Directive, ElementRef, HostListener, input, OnDestroy, OnInit, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[adrNumberValidate]',
  standalone: true
})
export class AdrNumberValidateDirective implements OnInit, OnDestroy {

  constructor(private el: ElementRef, @Optional() private control: NgControl) { }

  /**
   * @description Value before the decimal point specifies the number of digits before decimal and value after the decimal specifies the number of digits after decimal.
   * Example: 7.3 (Before decimal 7 digits & 3 digits after decimal)
   * Possible type of patterns allowed: X, X.X
  */
  adrNumberValidate = input<string>('');
  private previousValue: string = '';
  private valueChangeSub?: Subscription;

  @HostListener("keydown", ["$event"])
  onKeyDown = (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && ['a', 'c', 'x', 'v', 'z', 'y'].includes(event.key.toLowerCase())) {
      return;
    }
    const navKeys = new Set([
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End', 'Tab', 'Shift', 'Control', 'Alt', 'Meta',
    ]);
    if (navKeys.has(event.key)) return;
    this.execute(this.el.nativeElement.value)
  };

  @HostListener("paste", ["$event"])
  onPaste(_e: ClipboardEvent) {
    setTimeout(() => this.execute(this.el.nativeElement.value), 0);
  }

  /**
   * Lifecycle hook that is called after data-bound properties of a directive are initialized.
   * Subscribes to value changes of the associated form control, and executes custom logic
   * whenever the value changes and is different from the previous value.
   *
   * @remarks
   * This method sets up a subscription to the form control's `valueChanges` observable.
   * When the value changes, it checks if the new value is different from the previous value.
   * If so, it calls the `execute` method with the previous value and updates the `previousValue`.
   */
  ngOnInit(): void {
    if (this.control?.control) {
      this.valueChangeSub = this.control.control.valueChanges.subscribe(
        (value: any) => {
          const currentValue = value?.toString() ?? '';
          if (currentValue !== this.previousValue) {
            this.execute(this.previousValue);
            this.previousValue = currentValue;
          }
        }
      );
    }
  }

  ngOnDestroy(): void {
    this.valueChangeSub?.unsubscribe();
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
  private checkValue(value: string, prefix: string, scale: string): RegExpMatchArray | null {
    const { regex, prefix: maxDigitsBeforeDecimal } = this.extractSignWithLength(prefix);
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
      const inputElement = this.el.nativeElement as HTMLInputElement, pattern = this.adrNumberValidate(),
        requiresNegative = pattern.startsWith('-'), requiresPositive = pattern.startsWith('+'),
        [prefix, scale] = pattern.split('.'), currentValue: string = inputElement.value.replace(/,/g, '');
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
      const isIntermediate = /^-?$|^\.$|^-?\.$|^-?\d+\.$|^\d+\.$/.test(currentValue), isValid = this.checkValue(this.formatNumber(currentValue, +scale).replace(/,/g, ''), prefix, scale);
      if (currentValue === '' || isValid || isIntermediate) {
        this.previousValue = currentValue;
        const endsWithDot = currentValue.endsWith('.'),
          patchValue = currentValue === '' ? '' : (!endsWithDot && !isNaN(+currentValue)) ? +currentValue : currentValue;
        this.control?.control?.patchValue(patchValue);
        // Format view only if it's a valid number and not intermediate
        if (!isIntermediate && !isNaN(+currentValue)) {
          inputElement.value = this.formatNumber(currentValue, +scale || 0);
        } else {
          inputElement.value = currentValue;
        }
      } else {
        inputElement.value = oldValue;
        this.control?.control?.patchValue(isNaN(+oldValue) ? oldValue : +oldValue);
      }
    });
  }

  private formatNumber(value: string, scale = 0): string {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: scale }).format(+value);
  }
}
