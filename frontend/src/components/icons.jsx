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
    <path d="M16 13L22 7L16 1" stroke="white" strokeWidth="2" />
    <path d="M-1 7H22" stroke="white" strokeWidth="2" />
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
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16.1417 16.1407L12.2969 12.2959"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
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
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.99823 1.25V4.49076"
      stroke="#020A5B"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M1.25 10H4.49012"
      stroke="#020A5B"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.99823 18.7498V15.509"
      stroke="#020A5B"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18.75 10H15.5099"
      stroke="#020A5B"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.99807 12.5929C11.4296 12.5929 12.5902 11.4322 12.5902 10.0003C12.5902 8.56847 11.4296 7.40771 9.99807 7.40771C8.56649 7.40771 7.40598 8.56847 7.40598 10.0003C7.40598 11.4322 8.56649 12.5929 9.99807 12.5929Z"
      stroke="#020A5B"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
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
    <g clipPath="url(#clip0_1_4249)">
      <path d="M9.75 18L15.75 12L9.75 6" stroke="#020A5B" strokeWidth="1.5" />
      <path d="M0.75 12L15.75 12" stroke="#020A5B" strokeWidth="1.5" />
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
    <g clipPath="url(#clip0_1_3089)">
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
    <g clipPath="url(#clip0_905_2455)">
      <path d="M16 18L22 12L16 6" stroke="white" strokeWidth="2" />
      <path d="M-1 12H22" stroke="white" strokeWidth="2" />
    </g>
    <defs>
      <clipPath id="clip0_905_2455">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
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
    <g clipPath="url(#clip0_841_3554)">
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
    <g clipPath="url(#clip0_841_4454)">
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

export const ChevronDown = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="9"
    viewBox="0 0 14 9"
    fill="none"
  >
    <path d="M1 0.999999L7 7L13 1" stroke="currentColor" strokeWidth="2" />
  </svg>
)

export const ShareIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.5 -0.5 14 14"
    height="14"
    width="14"
  >
    <g id="share-link--share-transmit">
      <path
        id="Vector"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.553571428571429 8.589285714285715C3.707451428571429 8.589285714285715 4.642857142857143 7.65388 4.642857142857143 6.5S3.707451428571429 4.410714285714286 2.553571428571429 4.410714285714286 0.4642857142857143 5.34612 0.4642857142857143 6.5s0.9354057142857144 2.0892857142857144 2.0892857142857144 2.0892857142857144Z"
        strokeWidth="2"
      ></path>
      <path
        id="Vector_2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.446428571428571 12.535714285714286c1.1538428571428572 0 2.0892857142857144 -0.9354428571428572 2.0892857142857144 -2.0892857142857144S11.600271428571428 8.357142857142858 10.446428571428571 8.357142857142858 8.357142857142858 9.292585714285716 8.357142857142858 10.446428571428571s0.9354428571428572 2.0892857142857144 2.0892857142857144 2.0892857142857144Z"
        strokeWidth="2"
      ></path>
      <path
        id="Vector_3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.446428571428571 4.642857142857143c1.1538428571428572 0 2.0892857142857144 -0.9354057142857144 2.0892857142857144 -2.0892857142857144S11.600271428571428 0.4642857142857143 10.446428571428571 0.4642857142857143 8.357142857142858 1.3996914285714286 8.357142857142858 2.553571428571429 9.292585714285716 4.642857142857143 10.446428571428571 4.642857142857143Z"
        strokeWidth="2"
      ></path>
      <path
        id="Vector_4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m4.420009285714286 5.571428571428571 4.16 -2.0892857142857144"
        strokeWidth="2"
      ></path>
      <path
        id="Vector_5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m4.420009285714286 7.428571428571429 4.16 2.0892857142857144"
        strokeWidth="2"
      ></path>
    </g>
  </svg>
)

export const BookmarkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 14 14"
    height="14"
    width="14"
  >
    <g id="bookmark--bookmarks-tags-favorite">
      <path
        id="Union"
        fill="currentColor"
        d="M4 0a1.5 1.5 0 0 0 -1.5 1.5v12a0.5 0.5 0 0 0 0.854 0.354L7 10.207l3.646 3.647a0.5 0.5 0 0 0 0.854 -0.354v-12A1.5 1.5 0 0 0 10 0H4Z"
        strokeWidth="1"
      ></path>
    </g>
  </svg>
)

export const NewFileIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
  >
    <g clipPath="url(#clip0_952_3869)">
      <path
        d="M2 6H6C6.17681 6 6.34638 5.92976 6.47141 5.80473C6.59643 5.67971 6.66667 5.51014 6.66667 5.33333V1.33333H13.3347C13.702 1.33333 14 1.63666 14 1.99466V14.0053C13.9998 14.1808 13.93 14.349 13.8059 14.473C13.6817 14.597 13.5135 14.6667 13.338 14.6667H2.662C2.57445 14.6661 2.48788 14.6482 2.40723 14.6141C2.32658 14.5801 2.25343 14.5304 2.19196 14.4681C2.13049 14.4058 2.08189 14.3319 2.04896 14.2508C2.01602 14.1697 1.99939 14.0829 2 13.9953V6ZM2 4.66666L5.33333 1.33533V4.66666H2Z"
        fill="currentColor"
      />
    </g>
    <defs>
      <clipPath id="clip0_952_3869">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
)

export const SolidFilterIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    height="16"
    width="16"
  >
    <g id="filter-2--funnel-filter-angle-oil">
      <path
        id="Union"
        fill="currentColor"
        fillRule="evenodd"
        d="M23 1H1v4.914l8 8v9.39l6 -3.75v-5.64l8 -8V1Z"
        clipRule="evenodd"
        strokeWidth="1"
      ></path>
    </g>
  </svg>
)
