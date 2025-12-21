interface YoutubeProps {
  className?: string;
}

export default function Youtube({ className }: YoutubeProps) {
  return (
    <svg
      width="16"
      height="12"
      viewBox="0 0 16 12"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.84 2.24C15.66 1.54 15.1 0.98 14.4 0.8C13.14 0.48 8 0.48 8 0.48C8 0.48 2.86 0.48 1.6 0.8C0.9 0.98 0.34 1.54 0.16 2.24C0 3.5 0 6 0 6C0 6 0 8.52 0.18 9.76C0.36 10.46 0.92 11.02 1.62 11.2C2.86 11.52 8 11.52 8 11.52C8 11.52 13.14 11.52 14.4 11.2C15.1 11.02 15.66 10.46 15.84 9.76C16 8.52 16 6 16 6C16 6 16 3.5 15.84 2.24ZM6.4 8.4V3.6L10.56 6L6.4 8.4Z"
        fill="currentColor"
      />
    </svg>
  );
}
