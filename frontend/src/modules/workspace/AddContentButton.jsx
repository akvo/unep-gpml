import React from "react";

const AddContentButton = () => {
  return (
    <div className="workspace-button-wrapper">
      <div className="button-container">
        <button className="default-button">
          <svg
            width="46"
            height="44"
            viewBox="0 0 46 44"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="19.0615"
              y="1"
              width="6.91343"
              height="41.0944"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2"
            />
            <rect
              x="1"
              y="24.8118"
              width="6.52901"
              height="43.0363"
              transform="rotate(-90 1 24.8118)"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          <span>Add content</span>
        </button>

        {/* Mask, only appear when hovered */}
        <button className="button-mask">
          <svg
            width="46"
            height="44"
            viewBox="0 0 46 44"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="19.0615"
              y="1"
              width="6.91343"
              height="41.0944"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2"
            />
            <rect
              x="1"
              y="24.8118"
              width="6.52901"
              height="43.0363"
              transform="rotate(-90 1 24.8118)"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          <span>Add content</span>
        </button>
      </div>
    </div>
  );
};

export default AddContentButton;