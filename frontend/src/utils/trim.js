const lastCharEscape = [".", ",", ";"];
const escapeRegex = /\(([^)]+)\)\s\w+/g;

const TrimText = ({ text, max = 400 }) => {
  if (text.length < max) {
    return <div>{text}</div>;
  }

  let escaped = [];
  escaped = [...escaped, ...text.matchAll(escapeRegex)];
  escaped.forEach((x, i) => {
    const replacer = x[0].replaceAll(/\s/g, "###");
    text = text.replace(x[0], replacer);
  });

  let arrayText = text.split(" ");
  arrayText = arrayText.filter((x) => x.length);
  text = "";
  let startIndex = 0;

  while (text.length < max - 1 && arrayText[startIndex]) {
    text +=
      arrayText[startIndex].replaceAll("###", " ").replaceAll("·", "") + " ";
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

export default TrimText;
