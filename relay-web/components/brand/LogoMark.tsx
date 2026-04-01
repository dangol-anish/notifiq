type Props = {
  className?: string;
  title?: string;
};

export default function LogoMark({ className, title = "Notifiq" }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      role="img"
      aria-label={title}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="4"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8 16V8L16 16V8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

