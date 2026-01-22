import { addHours } from "date-fns";

// Formatea la fecha a: YYYYMMDDThhmmssZ (Formato UTC requerido por calendarios)
const formatToICSDate = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
};

export const generateGoogleCalendarUrl = (
  startDate: Date,
  title: string,
  description: string,
) => {
  const endDate = addHours(startDate, 1); // Duración por defecto: 1 hora
  const start = formatToICSDate(startDate);
  const end = formatToICSDate(endDate);

  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.append("action", "TEMPLATE");
  url.searchParams.append("text", title);
  url.searchParams.append("dates", `${start}/${end}`);
  url.searchParams.append("details", description);

  return url.toString();
};

export const downloadICSFile = (
  startDate: Date,
  title: string,
  description: string,
) => {
  const endDate = addHours(startDate, 1);
  const start = formatToICSDate(startDate);
  const end = formatToICSDate(endDate);
  const now = formatToICSDate(new Date());

  // Estructura estándar iCalendar (RFC 5545)
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Offset//Global Meeting Planner//EN",
    "BEGIN:VEVENT",
    `UID:${now}-${start}@offset.app`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description.replace(/\n/g, "\\n")}`, // Escapar saltos de línea
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute("download", "meeting.ics");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
