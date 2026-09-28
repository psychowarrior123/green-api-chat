export const formatTime = new Intl.DateTimeFormat("ru", {
  hour: "2-digit",
  minute: "2-digit",
}).format;

export const formatDate = new Intl.DateTimeFormat("ru", {
  day: "numeric",
  month: "long",
}).format;
