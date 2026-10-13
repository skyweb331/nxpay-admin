import { NextureIconsProps, sizeHelper, strokeSizeHelper } from "../icon-props";

export default function NiNxpay({ className, variant = "outlined", size = "medium" }: NextureIconsProps) {
  const iconSize = sizeHelper(size);
  const iconStrokeWidth = strokeSizeHelper(iconSize);
  if (variant === "outlined") {
    return (
      <svg
        width={iconSize}
        height={iconSize}
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="none" stroke="currentColor" strokeWidth={iconStrokeWidth} />
        <path
          d="M7.5 17V7.5L16 16V7M13.25 9.75L16 7L18.75 9.75"
          fill="none"
          stroke="currentColor"
          strokeWidth={iconStrokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  } else {
    const maskID = crypto.randomUUID();
    return (
      <svg
        width={iconSize}
        height={iconSize}
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <mask id={maskID}>
          <rect x="2" y="2" width="20" height="20" rx="6" fill="white" />
          <path
            d="M7.5 17V7.5L16 16V7M13.25 9.75L16 7L18.75 9.75"
          fill="none"
            stroke="black"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </mask>
        <rect x="2" y="2" width="20" height="20" rx="6" fill="currentColor" mask={`url(#${maskID})`} />
      </svg>
    );
  }
}
