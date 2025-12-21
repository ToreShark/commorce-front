interface QuickViewIcoProps {
  className?: string;
}

export default function QuickViewIco({ className }: QuickViewIcoProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 3.5C3 3.5 0 10 0 10C0 10 3 16.5 10 16.5C17 16.5 20 10 20 10C20 10 17 3.5 10 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 13.5C11.933 13.5 13.5 11.933 13.5 10C13.5 8.067 11.933 6.5 10 6.5C8.067 6.5 6.5 8.067 6.5 10C6.5 11.933 8.067 13.5 10 13.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
