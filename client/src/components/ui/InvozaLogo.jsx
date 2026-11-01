// Invoza mark (a document with a check) followed by the wordmark
function InvozaLogo({ className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-[1.4em] w-[1.4em] shrink-0"
      >
        <rect width="24" height="24" rx="6" fill="#0B1730" />
        <path
          d="M8.5 6.5H14L17 9.5V17A1.5 1.5 0 0 1 15.5 18.5H8.5A1.5 1.5 0 0 1 7 17V8A1.5 1.5 0 0 1 8.5 6.5Z"
          fill="none"
          stroke="#12B8A6"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M9.5 13L11.3 14.8L14.5 11.2"
          fill="none"
          stroke="#12B8A6"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <span className="font-bold tracking-tight text-[#0B1730]">
        Invoza<span className="text-[#12B8A6]">.</span>
      </span>
    </span>
  );
}

export default InvozaLogo;