const set = (name, data) => {
  window.localStorage.setItem(
    window.btoa(name),
    window.btoa(JSON.stringify(data))
  )
  return data
}

const get = (name) => {
    name = window.btoa(name)
    const data = window.localStorage.getItem(name)
    if (!data) {
        return false
    }
    let response = false;
    try {
        response = JSON.parse(window.atob(data));
    } catch (err) {
        console.error("Unauthenticated");
        window.localStorage.clear();
    }
    return response;
}

const clear = () => {
  return window.localStorage.clear()
}

const getCookie = (cname) => {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

export const storage = {
  set: set,
  get: get,
  getCookie: getCookie,
  clear: clear
}
