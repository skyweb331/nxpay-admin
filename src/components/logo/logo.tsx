import { cn } from "@/lib/utils";

function Mark({ gradientID }: { gradientID: string }) {
  return (
    <>
      <rect width="28" height="28" rx="8" fill={`url(#${gradientID})`} />
      <path
        d="M8.5 20.5V8.5L19.5 19.5V7.5M15.75 11.25L19.5 7.5L23.25 11.25"
        fill="none"
        stroke="white"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}

function Gradient({ id }: { id: string }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
      <stop style={{ stopColor: "hsl(var(--primary-light))" }} />
      <stop offset="1" style={{ stopColor: "hsl(var(--primary-dark))" }} />
    </linearGradient>
  );
}

export default function Logo({ classNameFull, classNameMobile }: { classNameFull?: string; classNameMobile?: string }) {
  const gradientID = crypto.randomUUID();
  const gradientIDText = crypto.randomUUID();
  const gradientIDMobile = crypto.randomUUID();
  return (
    <>
      <svg
        className={cn("fill-current", classNameFull)}
        width="104"
        height="28"
        viewBox="0 0 104 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="NxPay"
      >
        <Mark gradientID={gradientID} />
        <g fill="none" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="stroke-text-primary">
          <path d="M37 21V7L47 21V7" />
          <path d="M63 21V7H68.5A4.25 4.25 0 0 1 68.5 15.5H63" />
          <circle cx="82" cy="16" r="5" />
          <path d="M87 11V21" />
          <path d="M91 11L96 21M101 11L94 25" />
        </g>
        <path
          d="M51 11L59 21M59 11L51 21"
          fill="none"
          stroke={`url(#${gradientIDText})`}
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <defs>
          <Gradient id={gradientID} />
          <Gradient id={gradientIDText} />
        </defs>
      </svg>

      <svg
        className={cn("fill-current", classNameMobile)}
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="NxPay"
      >
        <Mark gradientID={gradientIDMobile} />
        <defs>
          <Gradient id={gradientIDMobile} />
        </defs>
      </svg>
    </>
  );
}
