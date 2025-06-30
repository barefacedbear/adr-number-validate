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
    let [length, scale] = this.adrNumberValidate().split('.'), regExpString = `^(\\+|\\-)?([\\d]{0,${+length}})`,
      checkPattern: RegExpMatchArray | null = null;
    if (+scale > 0) { regExpString += `((\\.{1})([\\d]{1,${+scale}})?)` }
    checkPattern = String(value).match(new RegExp(`${regExpString}?$`));
    return checkPattern;
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
