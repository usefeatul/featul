
export function parseUserAgent(userAgent: string | null | undefined): string {
    const ua = String(userAgent || "Unknown Device")
    let browser = "Unknown Browser"
    let os = "Unknown OS"

    if (ua.indexOf("Firefox") > -1) browser = "Firefox"
    else if (ua.indexOf("SamsungBrowser") > -1) browser = "Samsung Internet"
    else if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) browser = "Opera"
    else if (ua.indexOf("Trident") > -1) browser = "Internet Explorer"
    else if (ua.indexOf("Edge") > -1) browser = "Edge"
    else if (ua.indexOf("Chrome") > -1) browser = "Chrome"
    else if (ua.indexOf("Safari") > -1) browser = "Safari"

    if (ua.indexOf("Mac") > -1) os = "macOS"
    else if (ua.indexOf("Win") > -1) os = "Windows"
    else if (ua.indexOf("Android") > -1) os = "Android"
    else if (ua.indexOf("Linux") > -1) os = "Linux"
    else if (ua.indexOf("iPhone") > -1 || ua.indexOf("iPad") > -1) os = "iOS"

    if (browser !== "Unknown Browser" || os !== "Unknown OS") {
        return `${browser} on ${os}`
    }

    return ua.slice(0, 30)
}
