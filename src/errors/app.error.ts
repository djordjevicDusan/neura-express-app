export class NeuraAppError extends Error {
  constructor(public name: string, public message: string, public isTrusted = true, public cause?: unknown) {
    super(message)
  }
}
