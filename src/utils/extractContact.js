export function extractContact(text) {
  const source = String(text || "");

  const emails = source.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/gi) || [];

  const phones =
    source.match(/(\+34[\s-]?)?(\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{3})/g) || [];

  return {
    emails: unique(emails.map(clean)),
    phones: unique(phones.map(clean))
  };
}

function clean(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function unique(arr) {
  return [...new Set(arr.filter(Boolean))];
}
