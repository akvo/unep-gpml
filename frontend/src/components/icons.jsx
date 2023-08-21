export const CirclePointer = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx={16}
      cy={16}
      r={15}
      fill="#020A5B"
      stroke="#020A5B"
      strokeWidth={2}
    />
    <path
      d="M13.5566 22L19.5566 16L13.5566 10"
      stroke="white"
      strokeWidth="2"
    />
  </svg>
);

export const Pointer = () => (
  <svg
    width="24"
    height="14"
    viewBox="0 0 24 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M16 13L22 7L16 1" stroke="white" stroke-width="2" />
    <path d="M-1 7H22" stroke="white" stroke-width="2" />
  </svg>
);

export const ArrowRight = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="24"
    viewBox="0 0 18 24"
    fill="none"
  >
    <g clip-path="url(#clip0_1028_2040)">
      <path d="M9.5 18L15.5 12L9.5 6" stroke="white" stroke-width="1.5" />
      <path d="M0.5 12L15.5 12" stroke="white" stroke-width="1.5" />
    </g>
    <defs>
      <clipPath id="clip0_1028_2040">
        <rect width="17" height="24" fill="white" transform="translate(0.5)" />
      </clipPath>
    </defs>
  </svg>
);
