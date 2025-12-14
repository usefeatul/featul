#!/bin/bash

# trust.sh
# ----------
# Install and trust the local development Root CA and domain certificate on macOS.
# This script adds the CA and domain certificate to the System and Login keychains
# so GUI browsers (Chrome, Safari) and CLI tools pick them up.
#
# Usage:
#   ./trust.sh [--cert-dir <path>] [--ca-file <file>] [--domain-file <file>]
#
# Defaults (relative to repository root):
#   cert-dir: ./config/ssl/certificates
#   ca-file: RootCA.crt
#   domain-file: localhost.crt
#
# The script requires sudo to add to the System keychain. It will also add to
# the Login keychain to make certs visible to GUI apps.

set -euo pipefail

# --- Colors/helpers ---------------------------------------------------------
if [ -t 1 ]; then
  C_RESET="\033[0m"
  C_BOLD="\033[1m"
  C_RED="\033[31m"
  C_GREEN="\033[32m"
  C_YELLOW="\033[33m"
  C_BLUE="\033[34m"
else
  C_RESET=""
  C_BOLD=""
  C_RED=""
  C_GREEN=""
  C_YELLOW=""
  C_BLUE=""
fi

echo_info(){ printf "%b\n" "${C_BLUE}${1}${C_RESET}"; }
echo_success(){ printf "%b\n" "${C_GREEN}${1}${C_RESET}"; }
echo_warn(){ printf "%b\n" "${C_YELLOW}${1}${C_RESET}"; }
echo_error(){ printf "%b\n" "${C_RED}${1}${C_RESET}"; }

# --- Paths/defaults -------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

CERT_DIR_DEFAULT="$REPO_ROOT/config/ssl/certificates"
CA_FILE_DEFAULT="RootCA.crt"
DOMAIN_FILE_DEFAULT="localhost.crt"

CERT_DIR="$CERT_DIR_DEFAULT"
CA_FILE="$CA_FILE_DEFAULT"
DOMAIN_FILE="$DOMAIN_FILE_DEFAULT"

# --- Arg parsing -----------------------------------------------------------
while [[ $# -gt 0 ]]; do
  case "$1" in
    --cert-dir) CERT_DIR="$2"; shift 2;;
    --ca-file) CA_FILE="$2"; shift 2;;
    --domain-file) DOMAIN_FILE="$2"; shift 2;;
    *) echo_error "Unknown option: $1"; exit 1;;
  esac
done

if [[ "$CERT_DIR" != /* ]]; then
  CERT_DIR="$REPO_ROOT/${CERT_DIR#./}"
fi

echo_info "🔏 Checking if SSL certificates are trusted..."

sudo_ran=false

# --- Helpers ---------------------------------------------------------------
resolve_cert_files(){
  if [ ! -f "$CERT_DIR/$CA_FILE" ]; then
    for f in "$CERT_DIR"/*.crt; do
      [ -e "$f" ] || continue
      if openssl x509 -in "$f" -noout -text 2>/dev/null | grep -q "CA:TRUE"; then
        CA_FILE="$(basename "$f")"
        break
      fi
    done
  fi

  if [ ! -f "$CERT_DIR/$DOMAIN_FILE" ]; then
    for f in "$CERT_DIR"/*.crt; do
      [ -e "$f" ] || continue
      if openssl x509 -in "$f" -noout -text 2>/dev/null | grep -q -E "DNS:localhost|localhost"; then
        if [ "$(basename "$f")" != "$CA_FILE" ]; then
          DOMAIN_FILE="$(basename "$f")"
          break
        fi
      fi
    done
  fi
}

extract_cn(){
  local cert="$1"
  local san
  san=$(openssl x509 -in "$cert" -noout -text 2>/dev/null | awk '/Subject Alternative Name:/{getline; print}' | sed 's/ //g' || true)
  if [[ -n "$san" ]]; then
    echo "$san" | tr ',' '\n' | sed -n 's/DNS://p' | head -n1
    return
  fi
  local subj
  subj=$(openssl x509 -in "$cert" -noout -subject -nameopt RFC2253 2>/dev/null || true)
  if [[ "$subj" =~ CN=([^,]+) ]]; then
    echo "${BASH_REMATCH[1]}"
    return
  fi
  basename "$cert"
}

is_trusted(){
  local cn="$1"
  if security find-certificate -c "$cn" /Library/Keychains/System.keychain >/dev/null 2>&1; then
    return 0
  fi
  if security find-certificate -c "$cn" "$HOME/Library/Keychains/login.keychain-db" >/dev/null 2>&1; then
    return 0
  fi
  return 1
}

add_trusted(){
  local cert_path="$1"
  local trustflag="$2"
  echo_info "  - Adding $cert_path to System keychain (requires sudo)"
  sudo security add-trusted-cert -d -r "$trustflag" -p ssl -p codeSign -k /Library/Keychains/System.keychain "$cert_path"
  echo_info "  - Adding $cert_path to Login keychain"
  security add-trusted-cert -d -r "$trustflag" -p ssl -p codeSign -k "$HOME/Library/Keychains/login.keychain-db" "$cert_path" || true
}

# --- Resolve files and validate ------------------------------------------------
resolve_cert_files

if [ ! -f "$CERT_DIR/$CA_FILE" ]; then
  echo_error "❌ CA certificate not found: $CERT_DIR/$CA_FILE"
  exit 1
fi
if [ ! -f "$CERT_DIR/$DOMAIN_FILE" ]; then
  echo_error "❌ Domain certificate not found: $CERT_DIR/$DOMAIN_FILE"
  exit 1
fi

CA_PATH="$CERT_DIR/$CA_FILE"
DOMAIN_PATH="$CERT_DIR/$DOMAIN_FILE"

CA_CN=$(extract_cn "$CA_PATH")
DOMAIN_CN=$(extract_cn "$DOMAIN_PATH")

# --- Install/trust ---------------------------------------------------------
if is_trusted "$CA_CN"; then
  echo_success "  - ✅ Root CA (\"$CA_CN\") is already trusted."
else
  echo_warn "  - 🔐 Root CA (\"$CA_CN\") is not trusted. Installing..."
  sudo true
  sudo_ran=true
  add_trusted "$CA_PATH" "trustRoot"
  if is_trusted "$CA_CN"; then
    echo_success "  - ✅ Root CA is now trusted."
  else
    echo_error "  - ❌ Failed to trust the Root CA. Try restarting your browser or logging out/in."
    exit 1
  fi
fi

if is_trusted "$DOMAIN_CN"; then
  echo_success "  - ✅ Domain cert (\"$DOMAIN_CN\") is already trusted."
else
  if [ "$sudo_ran" = false ]; then
    echo_warn "  - 🔐 Adding Domain certificate requires sudo."
    sudo true
  fi
  add_trusted "$DOMAIN_PATH" "trustAsRoot"
  if is_trusted "$DOMAIN_CN"; then
    echo_success "  - ✅ Domain certificate is now trusted."
  else
    echo_error "  - ❌ Failed to trust the Domain certificate. Try restarting your browser or logging out/in."
    exit 1
  fi
fi

echo
echo_success "✅ All done. You can now run your development server with HTTPS."