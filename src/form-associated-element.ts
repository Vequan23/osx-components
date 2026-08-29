import { defineCustomElement } from "vue";
import type { CustomElementOptions, VueElement, VueElementConstructor } from "vue";

type StateProperty = "checked" | "value";

export type FormControlConfig = {
  controlSelector: string;
  stateProperty: StateProperty;
  stateEvent: "change" | "input";
  resetIndeterminate?: boolean;
};

type FormControlHost = VueElement & {
  checked?: boolean | "";
  disabled?: boolean | "";
  error?: string;
  indeterminate?: boolean;
  invalid?: boolean | "";
  value?: string;
};

const validityKeys = [
  "badInput",
  "customError",
  "patternMismatch",
  "rangeOverflow",
  "rangeUnderflow",
  "stepMismatch",
  "tooLong",
  "tooShort",
  "typeMismatch",
  "valueMissing",
] as const;

function validityFlags(validity: ValidityState): ValidityStateFlags {
  return Object.fromEntries(
    validityKeys.filter((key) => validity[key]).map((key) => [key, true]),
  ) as ValidityStateFlags;
}

export function defineFormAssociatedElement(
  component: unknown,
  config: FormControlConfig,
  options?: CustomElementOptions,
): CustomElementConstructor {
  const VueCustomElement: VueElementConstructor = defineCustomElement(component as never, options);

  return class OsxFormAssociatedElement extends VueCustomElement {
    static formAssociated = true;

    readonly #internals = this.attachInternals();
    #defaultCaptured = false;
    #defaultState: boolean | string = config.stateProperty === "checked" ? false : "";
    #formDisabled = false;
    #customValidityMessage = "";
    #observer?: MutationObserver;

    constructor() {
      super();
      this.addEventListener(config.stateEvent, this.#handleStateEvent, { capture: true });
    }

    connectedCallback(): void {
      super.connectedCallback();
      if (!this.#defaultCaptured) {
        this.#defaultState = this.#readState();
        this.#defaultCaptured = true;
      }
      this.#observer?.disconnect();
      this.#observer = new MutationObserver(() => {
        queueMicrotask(() => this.#sync());
      });
      this.#observer.observe(this, { attributes: true });
      queueMicrotask(() => this.#sync());
    }

    disconnectedCallback(): void {
      this.#observer?.disconnect();
      super.disconnectedCallback();
    }

    get form(): HTMLFormElement | null {
      return this.#internals.form;
    }

    get labels(): NodeList {
      return this.#internals.labels;
    }

    get validity(): ValidityState {
      this.#sync();
      return this.#internals.validity;
    }

    get validationMessage(): string {
      this.#sync();
      return this.#internals.validationMessage;
    }

    get willValidate(): boolean {
      return this.#internals.willValidate;
    }

    checkValidity(): boolean {
      this.#sync();
      return this.#internals.checkValidity();
    }

    reportValidity(): boolean {
      this.#sync();
      return this.#internals.reportValidity();
    }

    setCustomValidity(message: string): void {
      this.#customValidityMessage = String(message);
      this.#sync();
    }

    formDisabledCallback(disabled: boolean): void {
      this.#formDisabled = disabled;
      queueMicrotask(() => this.#sync());
    }

    formResetCallback(): void {
      this.#setState(this.#defaultState);
      if (config.resetIndeterminate) (this as unknown as FormControlHost).indeterminate = false;
      queueMicrotask(() => this.#sync());
    }

    formStateRestoreCallback(state: File | FormData | string | null): void {
      if (config.stateProperty === "checked") {
        this.#setState(state !== null);
      } else if (typeof state === "string") {
        this.#setState(state);
      }
      queueMicrotask(() => this.#sync());
    }

    #handleStateEvent = (): void => {
      this.#sync();
    };

    #readState(): boolean | string {
      const host = this as unknown as FormControlHost;
      if (config.stateProperty === "checked") return host.checked === true || host.checked === "" || this.hasAttribute("checked");
      return String(host.value ?? "");
    }

    #setState(state: boolean | string): void {
      const host = this as unknown as FormControlHost;
      if (config.stateProperty === "checked") host.checked = Boolean(state);
      else host.value = String(state);
    }

    #sync(): void {
      const host = this as unknown as FormControlHost;
      const disabled = this.#formDisabled || host.disabled === true || host.disabled === "" || this.hasAttribute("disabled");
      const control = this.shadowRoot?.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(config.controlSelector) ?? null;

      if (control) control.disabled = disabled;

      if (disabled) {
        this.#internals.setFormValue(null);
        this.#internals.setValidity({});
        return;
      }

      const state = this.#readState();
      if (config.stateProperty === "checked") {
        this.#internals.setFormValue(state ? String(host.value ?? "on") : null, state ? "checked" : null);
      } else {
        this.#internals.setFormValue(String(state), String(state));
      }

      if (this.#customValidityMessage || host.invalid === true || host.invalid === "" || this.hasAttribute("invalid") || host.error) {
        this.#internals.setValidity(
          { customError: true },
          this.#customValidityMessage || host.error || "Invalid value.",
          control ?? undefined,
        );
      } else if (control && !control.validity.valid) {
        this.#internals.setValidity(validityFlags(control.validity), control.validationMessage, control);
      } else {
        this.#internals.setValidity({});
      }
    }
  };
}

export function defineFormButtonElement(
  component: unknown,
  options?: CustomElementOptions,
): CustomElementConstructor {
  const VueCustomElement: VueElementConstructor = defineCustomElement(component as never, options);

  return class OsxFormButtonElement extends VueCustomElement {
    static formAssociated = true;

    readonly #internals = this.attachInternals();
    #formDisabled = false;

    constructor() {
      super();
      this.addEventListener("click", this.#activateForm);
    }

    get form(): HTMLFormElement | null {
      return this.#internals.form;
    }

    formDisabledCallback(disabled: boolean): void {
      this.#formDisabled = disabled;
      const button = this.shadowRoot?.querySelector("button");
      const host = this as unknown as FormControlHost;
      if (button) button.disabled = disabled || host.disabled === true || host.disabled === "" || this.hasAttribute("disabled");
    }

    #activateForm = (): void => {
      const host = this as unknown as FormControlHost & { loading?: boolean | ""; type?: "button" | "reset" | "submit" };
      if (this.#formDisabled || host.disabled === true || host.disabled === "" || this.hasAttribute("disabled") || host.loading || this.hasAttribute("loading") || !this.form) return;
      if (host.type === "submit") this.form.requestSubmit();
      else if (host.type === "reset") this.form.reset();
    };
  };
}
