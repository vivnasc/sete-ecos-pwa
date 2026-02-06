/**
 * FieldError — Accessible inline validation error display.
 *
 * Usage:
 *   import { inputAriaProps } from '../lib/validacao'
 *   <input {...inputAriaProps('email', erro)} />
 *   <FieldError id="email-error" message={erro} />
 *
 * WCAG: role="alert", aria-live="assertive", linked via aria-describedby
 */
export default function FieldError({ id, message }) {
  if (!message) return null

  return (
    <p
      id={id}
      role="alert"
      aria-live="assertive"
      className="mt-1 text-sm text-red-600 flex items-center gap-1"
    >
      <span aria-hidden="true" className="text-xs">&#x26A0;</span>
      {message}
    </p>
  )
}
