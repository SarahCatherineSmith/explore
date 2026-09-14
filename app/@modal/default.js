// Fallback for the @modal slot on a hard navigation or refresh at any route
// that isn't the intercepted project view — without this, Next 404s the
// slot instead of just rendering nothing.
export default function Default() {
  return null;
}
