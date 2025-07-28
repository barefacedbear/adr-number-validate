import { Directive, DoCheck, ElementRef, HostListener, input, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[adrNumberValidate]',
  standalone: true
})
export class AdrNumberValidateDirective implements DoCheck {

  constructor(private el: ElementRef, @Optional() private control: NgControl) { }

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

  ngDoCheck(): void {
    const currentValue = this.el.nativeElement.value;
    if (currentValue !== this.previousValue) {
      this.execute(this.previousValue);
      this.previousValue = currentValue;
    }
  }

  private checkValue(value: string): RegExpMatchArray | null {
    const [prefix, scale] = this.adrNumberValidate().split('.'), PREFIX_DETAIL = this.extractSignWithLength(prefix);
    let regExpString = `^(${PREFIX_DETAIL.symbol})?([\\d]{0,${PREFIX_DETAIL.prefix}})`, checkPattern: RegExpMatchArray | null = null;
    if (+scale > 0) { regExpString += `((\\.{1})([\\d]{1,${+scale}})?)` }
    checkPattern = String(value).match(new RegExp(`${regExpString}?$`));
    return checkPattern;
  }

  private extractSignWithLength(prefix: string) {
    const char = prefix.charAt(0);
    if (char) {
      const sign: Record<string, string> = { '+': '\\+', '-': '\\-' }, symbol = sign[char] ?? '\\+|\\-', firstChar = +(sign[char] ? prefix[1] : prefix[0]);
      return { symbol, prefix: firstChar };
    }
    return { symbol: '\\+|\\-', prefix: 0 };
  }

  private execute(oldValue: string) {
    setTimeout(() => {
      let currentValue: string = this.el.nativeElement.value;
      if (currentValue && !this.checkValue(currentValue)) {
        this.control?.control && this.control.control.patchValue(+oldValue);
        this.el.nativeElement.value = oldValue;
      }
    });
  }
}
