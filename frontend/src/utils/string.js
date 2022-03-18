const lastCharEscape = [".", ",", ";"];
const escapeRegex = /\(([^)]+)\)\s\w+/g;
const replace1 = /###/g;
const replace2 = /·/g;

export const TrimText = ({ text, max = 400 }) => {
  if (text && text.length < max) {
    return <div>{text}</div>;
  }

  let escaped = [];
  escaped = (text && text.match(escapeRegex)) || escaped;
  escaped.forEach((x, i) => {
    const replacer = x.replace(/\s/g, "###");
    text = text && text.replace(x, replacer);
  });

  let arrayText = text && text.split(" ");
  arrayText = arrayText && arrayText.filter((x) => x.length);
  text = "";
  let startIndex = 0;

  while (text.length < max - 1 && arrayText && arrayText[startIndex]) {
    text +=
      arrayText[startIndex].replace(replace1, " ").replace(replace2, "") + " ";
    startIndex++;
  }
  text = text.slice(0, -1);

  if (text.slice(-1).match(/[0-9]/)) {
    text = text.slice(0, -1);
  }

  lastCharEscape.forEach((x) => {
    if (text.endsWith(x)) {
      text = text.slice(0, -1);
    }
  });

  if (text.endsWith(")") && arrayText[startIndex + 1]) {
    return (
      <div>
        {text} {arrayText[startIndex + 1]}
        {" ... "}
      </div>
    );
  }

  return (
    <div>
      {text}
      {" ... "}
    </div>
  );
};

export const titleCase = (str, delimiter = " ") => {
  str = str.toLowerCase().split(delimiter);
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }
  return str.join(" ");
};
