/**
 * Borrowed from https://github.com/ng-bootstrap/core/blob/master/src/dropdown/dropdown.ts
 * and fixed by me
 *
 * Communication with other components:
 * http://stackoverflow.com/questions/36076700/what-is-the-proper-use-of-an-eventemitter
 * http://stackoverflow.com/questions/34376854/delegation-eventemitter-or-observable-in-angular2/35568924#35568924
 *
 * Listen to global events:
 * http://stackoverflow.com/questions/35080387/dynamically-add-event-listener-in-angular-2
 */
import {Directive, Input, HostListener, OnDestroy, Renderer} from 'angular2/core';


/**
 * Implements the dropdown component for bootstrap 4.
 *
 * Attributes "auto-close" and "is-open" follow
 * http://angular-ui.github.io/bootstrap/#/dropdown
 *
 * Always listens to keyboard: ESC closes, Enter toggles menu.
 *
 * Use anchor tag (<a>) or similar, and set tabindex >= 0 to allow
 * activating the ngb-dropdown-toggle element by tabbing.
 *
 * TODO Keyboard ArrowUp, ArrowDown (How to enumerate the children with class "dropdown-item" without using the browser
 * DOM directly?)
 * TODO Implement message broker service: client can subscribe to 'ngbDropdownOpened', 'ngbDropdownClosed' there.
 *
 * Quirks:
 *  - If ngb-dropdown-toggle is button, Enter has no effect, Space does it (at least in FF)
 */
@Directive({selector: '[ngbDropdown]', exportAs: 'ngbDropdown', host: {'class': 'dropdown', '[class.open]': 'isOpen'}})
export class NgbDropdown implements OnDestroy {
  @Input('auto-close') autoClose = 'always';

  private _removeGlobalClickListener;
  private _localTarget;
  private _isOpen: boolean = false;

  get isOpen() { return this._isOpen; }
  @Input('is-open') set isOpen(v: boolean) {
    if (v) {
      this.openMenu();
    }
    else {
      this.closeMenu();
    }
  };

  constructor(private _renderer: Renderer) {}

  @HostListener('click', ['$event'])
  onClick($event) {
    this._localTarget = $event.target;
    if ($event.target.attributes.getNamedItem('ngbDropdownToggle')) {
      this.toggleOpen();
      $event.stopPropagation();
    } else {
      let cssClass = $event.target.getAttribute('class').split(/ +/);
      if (cssClass.indexOf('dropdown-item') >= 0) {
        if (this.autoClose === 'always') {
          this.closeMenu();
        }
      }
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown($event) {
    let k = $event.key || $event.which;
    console.log('Key ', k);
    if (k === 'Escape' || k === 27) {
      this.closeMenu();
    } else if (k === 'Enter' || k === 13) {
      this.toggleOpen();
    }
  }

  onGlobalClick($event) {
    if ($event.target === this._localTarget) {
      return;
    }
    this.closeMenu();
  }

  ngOnDestroy() {
    if (this._removeGlobalClickListener) {
      this._removeGlobalClickListener();
    }
  }

  _addGlobalClickListener() {
    if (!this._removeGlobalClickListener) {
      this._removeGlobalClickListener =
          this._renderer.listenGlobal('document', 'click', ($event) => { this.onGlobalClick($event); });
    }
  }

  closeOnOutsideClick() { return (this.autoClose === 'always' || this.autoClose === 'outsideClick'); }

  closeMenu() {
    this._isOpen = false;
    if (this._removeGlobalClickListener) {
      this._removeGlobalClickListener();
      this._removeGlobalClickListener = null;
    }
  }

  openMenu() {
    this._isOpen = true;
    if (this.closeOnOutsideClick()) {
      this._addGlobalClickListener();
    }
  }

  toggleOpen() {
    this.isOpen = ! this.isOpen;
  }
}

@Directive({
  selector: '[ngbDropdownToggle]',
  host: {'class': 'dropdown-toggle', 'aria-haspopup': 'true', '[attr.aria-expanded]': '_dropdown.isOpen'}
})
export class NgbDropdownToggle {
  constructor(private _dropdown: NgbDropdown) {}
}

@Directive({
  selector: '[ngbDropdownMenu]',
  host: {'class': 'dropdown-menu', 'role': 'menu', '[attr.aria-labelledby]': '_dropdown.id'}
})
export class NgbDropdownMenu {
  constructor(private _dropdown: NgbDropdown) {}
}
