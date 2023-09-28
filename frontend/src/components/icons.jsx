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

export const ArrowRight = ({
  width = 23,
  height = 24,
  viewBox = '0 0 23 24',
}) => (
  <svg
    width={width}
    height={height}
    viewBox={viewBox}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clip-path="url(#clip0_1_4249)">
      <path d="M9.75 18L15.75 12L9.75 6" stroke="#020A5B" stroke-width="1.5" />
      <path d="M0.75 12L15.75 12" stroke="#020A5B" stroke-width="1.5" />
    </g>
    <defs>
      <clipPath id="clip0_1_4249">
        <rect width="19" height="24" fill="white" transform="translate(0.75)" />
      </clipPath>
    </defs>
  </svg>
)

export const LinkedinIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="33"
    height="32"
    viewBox="0 0 33 32"
    fill="none"
  >
    <g clip-path="url(#clip0_1_3089)">
      <path
        d="M16.7654 0C7.93018 0 0.765381 7.16479 0.765381 16C0.765381 24.8352 7.93018 32 16.7654 32C25.6006 32 32.7654 24.8352 32.7654 16C32.7654 7.16479 25.6006 0 16.7654 0ZM12.116 24.1875H8.21924V12.4641H12.116V24.1875ZM10.1677 10.8633H10.1423C8.83472 10.8633 7.98901 9.96313 7.98901 8.83813C7.98901 7.68774 8.8606 6.8125 10.1936 6.8125C11.5266 6.8125 12.3469 7.68774 12.3723 8.83813C12.3723 9.96313 11.5266 10.8633 10.1677 10.8633ZM26.1667 24.1875H22.2705V17.9158C22.2705 16.3396 21.7063 15.2646 20.2964 15.2646C19.22 15.2646 18.5789 15.9897 18.2971 16.6897C18.1941 16.9402 18.1689 17.2903 18.1689 17.6406V24.1875H14.2725C14.2725 24.1875 14.3235 13.564 14.2725 12.4641H18.1689V14.124C18.6868 13.3252 19.6133 12.189 21.6807 12.189C24.2444 12.189 26.1667 13.8645 26.1667 17.4653V24.1875Z"
        fill="currentColor"
      />
    </g>
    <defs>
      <clipPath id="clip0_1_3089">
        <rect
          width="32"
          height="32"
          fill="white"
          transform="translate(0.765381)"
        />
      </clipPath>
    </defs>
  </svg>
)
export const YoutubeIcon = () => (
  <svg
    width="33"
    height="32"
    viewBox="0 0 33 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M16.332 32C25.1686 32 32.332 24.8366 32.332 16C32.332 7.16344 25.1686 0 16.332 0C7.49548 0 0.332031 7.16344 0.332031 16C0.332031 24.8366 7.49548 32 16.332 32ZM5.18054 15.8484C5.18257 14.411 5.23995 12.9743 5.35254 11.5414C5.41481 10.6443 5.79933 9.79994 6.43521 9.16406C7.07109 8.52818 7.91543 8.14365 8.81254 8.08139C10.5895 7.95539 13.0165 7.84839 16.1805 7.84839C19.3445 7.84839 21.7705 7.95539 23.5485 8.08139C24.4457 8.14365 25.29 8.52818 25.9259 9.16406C26.5618 9.79994 26.9463 10.6443 27.0085 11.5414C27.1065 12.7884 27.1805 14.2724 27.1805 15.8484C27.1805 17.4804 27.1005 19.0154 26.9985 20.2884C26.8525 22.1054 25.4675 23.4944 23.6805 23.6184C21.8865 23.7434 19.3755 23.8484 16.1805 23.8484C12.9855 23.8484 10.4745 23.7434 8.68054 23.6184C6.89354 23.4944 5.50854 22.1054 5.36254 20.2884C5.26054 19.0154 5.18054 17.4804 5.18054 15.8484ZM14.1805 12.8484L19.6805 15.8484L14.1805 18.8484V12.8484Z"
      fill="currentColor"
    />
  </svg>
)

export const LongArrowRight = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clip-path="url(#clip0_905_2455)">
      <path d="M16 18L22 12L16 6" stroke="white" stroke-width="2" />
      <path d="M-1 12H22" stroke="white" stroke-width="2" />
    </g>
    <defs>
      <clipPath id="clip0_905_2455">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
)

export const DownArrow = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="9"
    viewBox="0 0 15 9"
    fill="none"
  >
    <path
      d="M1.5 0.999999L7.5 7L13.5 1"
      stroke="currentColor"
      stroke-width="2"
    />
  </svg>
)

export const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M6 18.228L18.7279 5.50011"
      stroke="white"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M19 18.228L6.27208 5.50011"
      stroke="white"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
)
