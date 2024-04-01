export function getStyle(elem, attr, pseudo=null) {
  return window.getComputedStyle(elem, pseudo).getPropertyValue(attr)
}

export function pixelToNumber(str) {
  return str.endsWith("px") ? Number(str.replace("px","")) : 0
}
