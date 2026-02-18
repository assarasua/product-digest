export function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(new Date(date));
}

export function formatMonth(month: string) {
  const [year, mon] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "long"
  }).format(new Date(year, mon - 1, 1));
}
