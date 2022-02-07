import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-color-picker',
    template: '<p>Mock Product Settings Component</p>',
})
// tslint:disable-next-line: component-class-suffix
export class ColorPickerMock {
    @Input() isImplementedFromToolBar: boolean;
}
