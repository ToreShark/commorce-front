interface ThinPeopleProps {
  className?: string;
}

export default function ThinPeople({ className }: ThinPeopleProps) {
  return (
    <svg
      width="18"
      height="19"
      viewBox="0 0 18 19"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 9.5C11.4853 9.5 13.5 7.48528 13.5 5C13.5 2.51472 11.4853 0.5 9 0.5C6.51472 0.5 4.5 2.51472 4.5 5C4.5 7.48528 6.51472 9.5 9 9.5Z"
        fill="currentColor"
      />
      <path
        d="M9 11C4.02944 11 0 13.6863 0 17V18.5H18V17C18 13.6863 13.9706 11 9 11Z"
        fill="currentColor"
      />
    </svg>
  );
}
