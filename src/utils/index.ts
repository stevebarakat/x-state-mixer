export function array(length: number, filler?: unknown) {
  return Array(length).fill(filler || null);
}

export function updateCurrentMix(setting: object) {
  const currentMixString = localStorage.getItem("currentMix");
  const currentMix = currentMixString && JSON.parse(currentMixString);
  Object.keys(setting).map(() =>
    localStorage.setItem(
      "currentMix",
      JSON.stringify({
        ...currentMix,
        ...setting,
      })
    )
  );
}

export function getRandomNumber(min: number, max: number) {
  return (Math.random() * (max - min) + min).toFixed(0);
}

export function formatSeconds(seconds: number) {
  let s: string | number = Math.floor(seconds % 60);
  let m: string | number = Math.floor(((seconds * 1000) / (1000 * 60)) % 60);
  let str: string = "";

  s = s < 10 ? "0" + s : s;
  m = m < 10 ? "0" + m : m;
  str += m + ":";
  str += s;
  return str;
}

export function formatMilliseconds(seconds: number) {
  let ms: string | number = Math.floor((seconds * 1000) % 1000);
  let s: string | number = Math.floor(seconds % 60);
  let m: string | number = Math.floor(((seconds * 1000) / (1000 * 60)) % 60);
  let str = "";

  s = s < 10 ? "0" + s : s;
  m = m < 10 ? "0" + m : m;
  ms = ms < 10 ? "0" + ms : ms;
  str += m + ":";
  str += s + ":";
  str += ms.toString().slice(0, 2);
  return str;
}

export function unSlugify(string: string) {
  return string
    .replace(/-/g, " ")
    .toLowerCase()
    .split(" ")
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join(" ");
}
