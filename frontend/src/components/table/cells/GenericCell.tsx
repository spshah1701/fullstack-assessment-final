/*
Generic cell component for rendering table cell values with type-specific formatting.
Supports multiple data types (string, number, date, phone, email, boolean) with
appropriate styling and rendering logic for each type.
*/
import React from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { EMAIL_REGEX } from "../../../constants/constants";

type SupportedTypes = "string" | "number" | "date" | "phone" | "boolean" | "email";

/*
Type-safe props interface using conditional types.
The value type is inferred based on the generic type parameter T:
- If T is "boolean", value must be boolean
- If T is "number", value must be number
- If T is "date", value can be string | Date
- If T is "phone" or "email", value must be string
- Otherwise, value can be string | number | boolean
All types also allow null | undefined for optional/missing values.
*/
interface GenericCellProps<T extends SupportedTypes = "string"> {
  value:
  | (T extends "boolean"
    ? boolean
    : T extends "number"
    ? number
    : T extends "date"
    ? string | Date
    : T extends "phone"
    ? string
    : T extends "email"
    ? string
    : string | number | boolean)
  | null
  | undefined;
  type?: T;

  multiline?: boolean;
}

// Date formatter for consistent date display across the application
const DateFmt = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
});

/*
Renderer functions for each data type. Each renderer handles the specific
formatting, styling, and display logic for its type.
*/
const Renderers = {
  // Renders a placeholder dash for null/undefined values
  nullish: (multiline?: boolean) => (
    <span
      className={`${multiline
        ? "text-[var(--cell-multiline-size)] text-gray-700 line-clamp-2 max-w-[800px]"
        : "text-[var(--cell-base-size)] sm:text-[var(--cell-base-size-md)] whitespace-nowrap"
        } text-gray-400 italic`}
    >
      —
    </span>
  ),
  // Renders boolean values as checkmark (green) or X (red) icons
  boolean: (v: boolean) => (
    <span className="text-[var(--cell-base-size)] sm:text-[var(--cell-base-size-md)] whitespace-nowrap">
      {v ? (
        <CheckCircle className="text-green-500 w-5 h-5" strokeWidth={2.5} />
      ) : (
        <XCircle className="text-red-500 w-5 h-5" strokeWidth={2.5} />
      )}
    </span>
  ),
  // Renders numbers with medium font weight for better readability
  number: (v: number | string) => (
    <span className="text-[var(--cell-base-size)] sm:text-[var(--cell-base-size-md)] whitespace-nowrap text-gray-700 font-medium">
      {String(v)}
    </span>
  ),
  // Formats dates using Intl.DateTimeFormat, handles invalid dates gracefully
  date: (v: string | Date) => {
    const d = v instanceof Date ? v : new Date(v);
    return (
      <span
        className="text-[var(--cell-base-size)] sm:text-[var(--cell-base-size-md)] whitespace-nowrap text-gray-600 font-medium select-none"
        suppressHydrationWarning
      >
        {isNaN(d.getTime()) ? "—" : DateFmt.format(d)}
      </span>
    );
  },
  // Renders phone numbers in monospace font 
  phone: (v: string) => (
    <span className="text-[var(--cell-base-size)] sm:text-[var(--cell-base-size-md)] whitespace-nowrap font-mono text-gray-600">
      {v}
    </span>
  ),
  // Renders email addresses as clickable mailto links
  email: (v: string) => (
    <a
      href={`mailto:${v}`}
      className="!text-blue-600 hover:!text-blue-700 hover:underline text-[var(--cell-base-size)] sm:text-[var(--cell-base-size-md)] whitespace-nowrap"
    >
      {v}
    </a>
  ),
  // Default text renderer, supports multiline with line clamping
  text: (v: string | number | boolean, multiline?: boolean) => (
    <span
      className={
        multiline
          ? "text-[var(--cell-multiline-size)] line-clamp-2 max-w-[800px] text-gray-900"
          : "text-[var(--cell-base-size)] sm:text-[var(--cell-base-size-md)] whitespace-nowrap text-gray-900"
      }
    >
      {String(v)}
    </span>
  ),
};

/*
Main component that determines the appropriate renderer based on value type and props.
Rendering priority:
1. Null/undefined → nullish renderer
2. Explicit boolean type or boolean value → boolean renderer
3. Explicit number type or number value → number renderer
4. Explicit date type → date renderer
5. Explicit phone type → phone renderer
6. Explicit email type OR string matching email regex → email renderer
7. Default → text renderer (supports multiline)
*/

const GenericCellCmp = <T extends SupportedTypes = "string">({
  value,
  type,
  multiline = false
}: GenericCellProps<T>) => {
  if (value === null || value === undefined) return Renderers.nullish();
  if (type === "boolean" || typeof value === "boolean")
    return Renderers.boolean(Boolean(value));
  if (type === "number" || typeof value === "number")
    return Renderers.number(value as number);
  if (type === "date") return Renderers.date(value as string | Date);
  if (type === "phone") return Renderers.phone(String(value));
  if (type === "email" || (typeof value === "string" && EMAIL_REGEX.test(value)))
    return Renderers.email(String(value));

  return Renderers.text(value as string | number | boolean, multiline);
};

// Memoized export to prevent unnecessary re-renders when props haven't changed
export const GenericCell = React.memo(GenericCellCmp);
