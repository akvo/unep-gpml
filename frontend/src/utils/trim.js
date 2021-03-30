const PUNCTUATION_LIST = [".", ",", ";"];

const TrimText = ({ text, min = 200, ideal = 300, max = 300 }) => {
  if (max < min || ideal > max || ideal < min) {
    throw new Error(
      "The minimum length must be less than the maximum, and the ideal must be between the minimum and maximum."
    );
  }

  if (text.length < ideal) {
    return <div>{text.slice(0, -1)} ...</div>;
  }

  let pointerOne = ideal;
  let pointerTwo = ideal;
  let firstSpace, resultIdx;

  const setSpace = (idx) => {
    if (spaceMatch(text[idx])) {
      firstSpace = firstSpace || idx;
    }
  };

  while (pointerOne < max || pointerTwo > min) {
    if (checkMatch(pointerOne, text, max, min)) {
      resultIdx = pointerOne + 1;
      break;
    } else if (checkMatch(pointerTwo, text, max, min)) {
      resultIdx = pointerTwo + 1;
      break;
    } else {
      setSpace(pointerOne);
      setSpace(pointerTwo);
    }

    pointerOne++;
    pointerTwo--;
  }

  if (resultIdx === undefined) {
    if (firstSpace && firstSpace >= min && firstSpace <= max) {
      resultIdx = firstSpace;
    } else if (ideal - min < max - ideal) {
      resultIdx = min;
    } else {
      resultIdx = max;
    }
  }
  return <div>{text.slice(0, resultIdx).slice(0, -1)} ... </div>;
};

const spaceMatch = (character) => {
  if (character === " ") {
    return true;
  }
};

const punctuationMatch = (idx, text) => {
  let punctuationIdx = PUNCTUATION_LIST.indexOf(text[idx]);
  if (punctuationIdx >= 0 && spaceMatch(text[idx + 1])) {
    return true;
  }
};

const checkMatch = (idx, text, max, min) => {
  if (idx < max && idx > min && punctuationMatch(idx, text)) {
    return true;
  }
};

export default TrimText;
