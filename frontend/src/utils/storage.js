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

export const storage = {
  set: set,
  get: get,
  clear: clear
}
