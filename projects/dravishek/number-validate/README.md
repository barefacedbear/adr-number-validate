
# @dravishek/number-validate

Angular 16+ directive to validate number length before and after decimal point.

## Installation

1. Install the NPM package

```bash
npm install @dravishek/number-validate
```

2. In your application, import the Directive. This directive is standalone so you need to declare it in the `import[]`.

Example:

- For standalone components:

```typescript
import { AdrNumberValidateDirective } from '@dravishek/number-validate';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AdrNumberValidateDirective]
})
export class AppComponent {
  title = 'adr-number-validate';
}
```

- For non-standalone components:

```typescript
import { AdrNumberValidateDirective } from '@dravishek/number-validate';

@NgModule({
  declarations: [],
  imports: [AdrNumberValidateDirective]
})
export class AppModule { }
```

## Usage

### Accepting both positive & negative numbers (including 0)

- For decimal numbers

```html
<input type="text" adrNumberValidate="2.5" />
```

- For non decimal numbers

```html
<input type="text" adrNumberValidate="2" />
```

### Accepting only positive numbers (including 0)

- For decimal numbers

```html
<input type="text" adrNumberValidate="+2.5" />
```

- For non decimal numbers

```html
<input type="text" adrNumberValidate="+2" />
```

### Accepting only negative numbers (excluding 0)

- For decimal numbers

```html
<input type="text" adrNumberValidate="-2.5" />
```

- For non decimal numbers

```html
<input type="text" adrNumberValidate="-2" />
```

## Social

[![@barefacedbear](https://skillicons.dev/icons?i=github)](https://github.com/barefacedbear)
[![mailto:barefaced.bear2018@gmail.com](https://skillicons.dev/icons?i=gmail)](mailto:barefaced.bear2018@gmail.com)
[![Avishek Datta Ray](https://skillicons.dev/icons?i=linkedin)](https://www.linkedin.com/in/avishekdr-2611)
[![https://stackoverflow.com/users/11954878/avishekdr](https://skillicons.dev/icons?i=stackoverflow)](https://stackoverflow.com/users/11954878/avishekdr)

## License

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
