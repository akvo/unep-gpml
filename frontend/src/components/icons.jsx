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

export const PointerDepr = () => (
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
export const Pointer = () => (
  <svg
    width="14"
    height="9"
    viewBox="0 0 14 9"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M1 0.999999L7 7L13 1" stroke="#020A5B" stroke-width="2" />
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
  width = 20,
  height = 24,
  viewBox = '0 0 20 24',
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

export const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
  >
    <path
      d="M14.0252 12.8469L17.5943 16.4152L16.4152 17.5943L12.8469 14.0252C11.5191 15.0895 9.86768 15.6684 8.16602 15.666C4.02602 15.666 0.666016 12.306 0.666016 8.16602C0.666016 4.02602 4.02602 0.666016 8.16602 0.666016C12.306 0.666016 15.666 4.02602 15.666 8.16602C15.6684 9.86768 15.0895 11.5191 14.0252 12.8469ZM12.3535 12.2285C13.4111 11.1409 14.0017 9.68304 13.9993 8.16602C13.9993 4.94268 11.3885 2.33268 8.16602 2.33268C4.94268 2.33268 2.33268 4.94268 2.33268 8.16602C2.33268 11.3885 4.94268 13.9993 8.16602 13.9993C9.68304 14.0017 11.1409 13.4111 12.2285 12.3535L12.3535 12.2285Z"
      fill="#020A5B"
    />
  </svg>
)

export const BookmarkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="17"
    height="16"
    viewBox="0 0 17 16"
    fill="none"
  >
    <path
      d="M9.08236 1.36208L10.9213 5.07468C10.9631 5.16891 11.0289 5.25053 11.1121 5.31141C11.1953 5.37229 11.293 5.4103 11.3955 5.42165L15.4551 6.02307C15.5726 6.03817 15.6834 6.08641 15.7746 6.16215C15.8657 6.23789 15.9335 6.33799 15.9698 6.45078C16.0062 6.56357 16.0098 6.68438 15.9801 6.7991C15.9503 6.91383 15.8886 7.01773 15.802 7.09868L12.8759 10.0017C12.8012 10.0714 12.7452 10.1588 12.7129 10.2557C12.6805 10.3527 12.673 10.4562 12.6909 10.5568L13.3964 14.6395C13.4168 14.7568 13.4039 14.8775 13.3591 14.9879C13.3143 15.0982 13.2395 15.1938 13.1431 15.2637C13.0467 15.3335 12.9326 15.375 12.8138 15.3832C12.695 15.3915 12.5763 15.3662 12.4711 15.3103L8.81635 13.3789C8.72276 13.3329 8.61989 13.309 8.51564 13.309C8.41138 13.309 8.30852 13.3329 8.21493 13.3789L4.56016 15.3103C4.45502 15.3662 4.33629 15.3915 4.2175 15.3832C4.09871 15.375 3.98462 15.3335 3.88821 15.2637C3.7918 15.1938 3.71695 15.0982 3.67217 14.9879C3.62739 14.8775 3.61448 14.7568 3.6349 14.6395L4.34041 10.5106C4.35829 10.4099 4.35073 10.3064 4.31841 10.2095C4.28609 10.1125 4.23004 10.0252 4.15536 9.95541L1.19454 7.09868C1.10694 7.01552 1.04534 6.90874 1.01719 6.79128C0.989048 6.67382 0.995565 6.55072 1.03596 6.43689C1.07635 6.32305 1.14888 6.22338 1.24477 6.14993C1.34066 6.07648 1.45578 6.03242 1.57621 6.02307L5.63577 5.42165C5.73824 5.4103 5.83595 5.37229 5.91915 5.31141C6.00235 5.25053 6.06814 5.16891 6.10997 5.07468L7.94892 1.36208C7.999 1.25395 8.07896 1.16241 8.17938 1.09825C8.2798 1.03409 8.39648 1 8.51564 1C8.6348 1 8.75148 1.03409 8.8519 1.09825C8.95231 1.16241 9.03228 1.25395 9.08236 1.36208Z"
      fill="#FFFAEB"
      stroke="#344170"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
)

export const FieldErrorIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="24"
    viewBox="0 -2 16 16"
    fill="none"
  >
    <g clip-path="url(#clip0_841_3554)">
      <path
        d="M8.00065 14.6667C4.31865 14.6667 1.33398 11.682 1.33398 8.00004C1.33398 4.31804 4.31865 1.33337 8.00065 1.33337C11.6827 1.33337 14.6673 4.31804 14.6673 8.00004C14.6673 11.682 11.6827 14.6667 8.00065 14.6667ZM7.33398 10V11.3334H8.66732V10H7.33398ZM7.33398 4.66671V8.66671H8.66732V4.66671H7.33398Z"
        fill="#E00909"
      />
    </g>
    <defs>
      <clipPath id="clip0_841_3554">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
)

export const FieldSuccessIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="24"
    viewBox="0 -2 16 16"
    fill="none"
  >
    <g clip-path="url(#clip0_841_4454)">
      <path
        d="M8.00065 14.6667C4.31865 14.6667 1.33398 11.682 1.33398 8.00004C1.33398 4.31804 4.31865 1.33337 8.00065 1.33337C11.6827 1.33337 14.6673 4.31804 14.6673 8.00004C14.6673 11.682 11.6827 14.6667 8.00065 14.6667ZM7.33598 10.6667L12.0493 5.95271L11.1067 5.01004L7.33598 8.78137L5.44998 6.89537L4.50732 7.83804L7.33598 10.6667Z"
        fill="#06D1A7"
      />
    </g>
    <defs>
      <clipPath id="clip0_841_4454">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
)

export const DropDownIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M6 9.55469L12 15.5547L18 9.55469"
      stroke="#5D53CC"
      stroke-width="2"
    />
  </svg>
)
