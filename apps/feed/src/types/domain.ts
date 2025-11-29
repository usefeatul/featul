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

export function dnsStatusBadgeClass(status: DNSStatus) {
  if (status === "pending") return "bg-orange-50 text-orange-500"
  if (status === "verified") return "bg-green-50 text-green-500"
  return "bg-card text-accent"
}
