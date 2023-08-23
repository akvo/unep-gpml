export const CirclePointer = ({ rotate = 0 }) => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    transform={`rotate(${rotate})`}
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
)

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
)

export const Magnifier = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7.90121 13.9433C9.50361 13.9433 11.0404 13.3067 12.1734 12.1737C13.3065 11.0406 13.943 9.50385 13.943 7.90146C13.943 6.29906 13.3065 4.7623 12.1734 3.62923C11.0404 2.49617 9.50361 1.85962 7.90121 1.85962C6.29882 1.85962 4.76205 2.49617 3.62899 3.62923C2.49592 4.7623 1.85938 6.29906 1.85938 7.90146C1.85938 9.50385 2.49592 11.0406 3.62899 12.1737C4.76205 13.3067 6.29882 13.9433 7.90121 13.9433Z"
      stroke="#000647"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M16.1417 16.1407L12.2969 12.2959"
      stroke="#000647"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
)

export const Localiser = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10.0018 17.1297C13.9386 17.1297 17.13 13.9377 17.13 10C17.13 6.06243 13.9386 2.87036 10.0018 2.87036C6.06496 2.87036 2.87354 6.06243 2.87354 10C2.87354 13.9377 6.06496 17.1297 10.0018 17.1297Z"
      stroke="#020A5B"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M9.99823 1.25V4.49076"
      stroke="#020A5B"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M1.25 10H4.49012"
      stroke="#020A5B"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M9.99823 18.7498V15.509"
      stroke="#020A5B"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M18.75 10H15.5099"
      stroke="#020A5B"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M9.99807 12.5929C11.4296 12.5929 12.5902 11.4322 12.5902 10.0003C12.5902 8.56847 11.4296 7.40771 9.99807 7.40771C8.56649 7.40771 7.40598 8.56847 7.40598 10.0003C7.40598 11.4322 8.56649 12.5929 9.99807 12.5929Z"
      stroke="#020A5B"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
)
