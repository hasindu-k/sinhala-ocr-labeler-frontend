type ToastVariant = "success" | "error" | "info";

type ToastEventDetail = {
  message: string;
  variant?: ToastVariant;
  duration?: number;
};

export function showToast(detail: ToastEventDetail) {
  if (typeof window === "undefined") return;
  const event = new CustomEvent<ToastEventDetail>("app:toast", { detail });
  window.dispatchEvent(event);
}
