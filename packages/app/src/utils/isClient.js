export default () => {
  return !(typeof window === "undefined") && !window.isSsr
}
