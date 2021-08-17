export const titleCase = (str, delimiter = " ") => {
  str = str.toLowerCase().split(delimiter);
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }
  return str.join(" ");
};
