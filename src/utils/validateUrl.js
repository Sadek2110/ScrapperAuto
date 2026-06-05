import net from "node:net";

export function validatePublicUrl(inputUrl) {
  let parsed;

  try {
    parsed = new URL(inputUrl);
  } catch {
    return {
      ok: false,
      error: "URL no válida"
    };
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return {
      ok: false,
      error: "Solo se permiten URLs HTTP o HTTPS"
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  if (
    hostname === "localhost" ||
    hostname.endsWith(".local") ||
    hostname === "0.0.0.0"
  ) {
    return {
      ok: false,
      error: "No se permiten hosts locales"
    };
  }

  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) {
      return {
        ok: false,
        error: "No se permiten IPs privadas"
      };
    }
  }

  return {
    ok: true,
    url: parsed.href,
    domain: hostname.replace(/^www\./, "")
  };
}

function isPrivateIp(ip) {
  if (ip.startsWith("10.")) return true;
  if (ip.startsWith("192.168.")) return true;
  if (ip.startsWith("127.")) return true;
  if (ip.startsWith("169.254.")) return true;

  const parts = ip.split(".").map(Number);

  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) {
    return true;
  }

  return false;
}
