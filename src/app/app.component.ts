import { AdrNumberValidateDirective } from '@dravishek/number-validate';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [AdrNumberValidateDirective, FormsModule],
  template: '<input type="text" [(ngModel)]="abc" adrNumberValidate="2.5" /><button (click)="see()">Abc</button>'
})
export class AppComponent {
  title = 'adr-number-validate';
  abc: string | number | null = null;

  see() {
    console.log(this.abc);
  }
}
