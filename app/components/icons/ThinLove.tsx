interface ThinLoveProps {
  className?: string;
}

export default function ThinLove({ className }: ThinLoveProps) {
  return (
    <svg
      width="21"
      height="18"
      viewBox="0 0 21 18"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.4999 17.0858L2.06091 8.64679C-0.602624 5.98326 0.0547426 1.92306 3.60163 0.730498C5.48509 0.092398 7.63298 0.544728 9.07417 1.86401L10.4999 3.16202L11.9257 1.86401C13.3669 0.544728 15.5148 0.092398 17.3982 0.730498C20.9451 1.92306 21.6025 5.98326 18.939 8.64679L10.4999 17.0858Z"
        fill="currentColor"
      />
    </svg>
  );
}
