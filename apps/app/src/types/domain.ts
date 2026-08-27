/** Custom domain plus CNAME/TXT records used for DNS verification. */
export type DomainInfo = {
  id: string
  host: string
  cnameName: string
  cnameTarget: string
  txtName: string
  txtValue: string
  status: "pending" | "verified" | "error"
} | null

export type DNSStatus = "pending" | "verified" | "error"

/** Tailwind text color for DNS verification status. */
export function dnsStatusBadgeClass(status: DNSStatus) {
  if (status === "pending") return "text-orange-500"
  if (status === "verified") return "text-green-500"
  return "text-red-500"
}
