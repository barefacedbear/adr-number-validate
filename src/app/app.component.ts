import { AdrNumberValidateDirective } from '@dravishek/number-validate';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [AdrNumberValidateDirective],
  template: '<input type="text" adrNumberValidate="2.5" />'
})
export class AppComponent {
  title = 'adr-number-validate';
}
