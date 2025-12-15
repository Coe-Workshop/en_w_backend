export class AppErr extends Error {
  public code: number;

  constructor(code: number, message: string) {
    super(message);
    this.code = code;
    Object.setPrototypeOf(this, AppErr.prototype);
  }
}
