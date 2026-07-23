export function playBeep() {
  new Audio("/sounds/beep.mp3").play().catch(() => {});
}

export function playError() {
  new Audio("/sounds/error.mp3").play().catch(() => {});
}

export function playSuccess() {
  new Audio("/sounds/success.mp3").play().catch(() => {});
}