#!/bin/bash

# ==============================================================================
# SSL Certificate Setup Script for localhost development
# ==============================================================================
#
# This script automates the creation of SSL certificates for local HTTPS 
# development. It generates a Certificate Authority (CA) and domain certificates
# that can be used with Next.js and other development servers.
#
# WHAT THIS SCRIPT CREATES:
# -------------------------
# 1. Certificate Authority (CA) files:
#    - RootCA.key (private key - excluded from git)
#    - RootCA.pem (certificate - excluded from git) 
#    - RootCA.crt (certificate in CRT format - committed to git)
#
# 2. Domain certificate files:
#    - localhost.key (private key - committed to git, safe for dev)
#    - localhost.csr (certificate signing request - excluded from git)
#    - localhost.crt (signed certificate - committed to git)
#    - domains.ext (domain configuration - committed to git)
#
# USAGE:
# ------
# 1. Run this script: ./setup.sh
# 2. Follow the interactive prompts to customize certificate details
# 3. Trust the Root CA on your system (see instructions after completion)
# 4. Use the certificates with your development server
#
# SECURITY NOTES:
# ---------------
# - The Root CA private key (RootCA.key) should NEVER be committed to git
# - The localhost private key is safe for development as it's only for localhost
# - .pem files contain sensitive data and are excluded from git
# - .crt files are public certificates and safe to commit
#
# SUPPORTED DOMAINS (by default):
# --------------------------------
# - localhost
# - app.localhost  
# - *.app.localhost (wildcard for subdomains)
# - Any additional domains you specify during setup
#
# NEXT.JS USAGE EXAMPLE:
# ----------------------
# next dev --experimental-https \
#   --experimental-https-ca "./config/ssl/certificates/RootCA.crt" \
#   --experimental-https-key "./config/ssl/certificates/localhost.key" \
#   --experimental-https-cert "./config/ssl/certificates/localhost.crt"
#
# TRUSTING THE CERTIFICATE:
# --------------------------
# macOS: 
#   sudo security add-trusted-cert -d -r trustRoot -p ssl -p codeSign \
#     -k "./config/ssl/certificates/RootCA.crt"
#
# Windows: 
#   Right-click RootCA.crt > Install > Trusted Root Certification Authorities
#
# Firefox (alternative):
#   about:preferences#privacy > Certificates > Import > RootCA.crt
#
# ==============================================================================

set -e  # Exit on any error

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

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CERT_DIR="$SCRIPT_DIR/certificates"

# Create certificates directory if it doesn't exist
mkdir -p "$CERT_DIR"
cd "$CERT_DIR"

echo_info "🔐 Setting up SSL certificates for localhost development..."
echo_info "Working directory: $CERT_DIR"

# Check if openssl is available
if ! command -v openssl &> /dev/null; then
    echo "❌ Error: openssl is not installed or not in PATH"
    echo "Please install openssl first:"
    echo "  macOS: brew install openssl"
    echo "  Ubuntu/Debian: sudo apt-get install openssl"
    exit 1
fi

echo ""
echo_info "📝 Certificate Configuration"
echo_info "Please provide the following information for your certificates:"
echo ""

# Prompt for CA information
read -p "Certificate Authority Name [MyCompany-Root-CA]: " ca_name
ca_name=${ca_name:-"MyCompany-Root-CA"}

read -p "Country Code (2 letters) [US]: " country
country=${country:-"US"}

read -p "State/Province [California]: " state
state=${state:-"California"}

read -p "City [San Francisco]: " city
city=${city:-"San Francisco"}

read -p "Organization [MyCompany-Dev]: " organization
organization=${organization:-"MyCompany-Dev"}

# Prompt for additional domains
echo ""
echo "Default domains that will be included:"
echo "  - localhost"
echo "  - app.localhost"
echo "  - *.app.localhost"
echo ""
read -p "Add additional domains? (comma-separated, e.g., api.localhost,admin.localhost) [none]: " additional_domains

echo ""
echo "Configuration summary:"
echo "  CA Name: $ca_name"
echo "  Country: $country"
echo "  State: $state"
echo "  City: $city"
echo "  Organization: $organization"
if [ -n "$additional_domains" ]; then
    echo "  Additional domains: $additional_domains"
fi
echo ""
read -p "Continue with this configuration? [Y/n]: " confirm
confirm=${confirm:-"Y"}

if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 0
fi

echo ""
echo "📝 Step 1: Generating Certificate Authority (CA)..."

# Generate RootCA.pem, RootCA.key & RootCA.crt
openssl req -x509 -nodes -new -sha256 -days 1024 -newkey rsa:2048 \
    -keyout ./RootCA.key \
    -out ./RootCA.pem \
    -subj "/C=$country/CN=$ca_name"

openssl x509 -outform pem -in ./RootCA.pem -out ./RootCA.crt

echo_success "✅ Certificate Authority files generated:"
echo_success "   - RootCA.key"
echo_success "   - RootCA.pem"
echo_success "   - RootCA.crt"

echo ""
echo "📝 Step 2: Creating domain configuration..."

# Create domains.ext file
cat > domains.ext << EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names
[alt_names]
DNS.1 = localhost
DNS.2 = .localhost
DNS.3 = *.localhost
EOF

# Add additional domains if provided
if [ -n "$additional_domains" ]; then
    dns_counter=4
    IFS=',' read -ra DOMAINS <<< "$additional_domains"
    for domain in "${DOMAINS[@]}"; do
        domain=$(echo "$domain" | xargs)  # trim whitespace
        if [ -n "$domain" ]; then
            echo "DNS.$dns_counter = $domain" >> domains.ext
            ((dns_counter++))
        fi
    done
fi

echo_success "✅ Domain configuration file created: domains.ext"

echo ""
echo "📝 Step 3: Generating domain certificate..."

# Generate localhost.key, localhost.csr, and localhost.crt
openssl req -new -nodes -newkey rsa:2048 \
    -keyout ./localhost.key \
    -out ./localhost.csr \
    -subj "/C=$country/ST=$state/L=$city/O=$organization/CN=*.app.localhost"

openssl x509 -req -sha256 -days 1024 \
    -in ./localhost.csr \
    -CA ./RootCA.pem \
    -CAkey ./RootCA.key \
    -CAcreateserial \
    -CAserial ./RootCA.srl \
    -extfile ./domains.ext \
    -out ./localhost.crt

echo_success "✅ Domain certificate files generated:"
echo_success "   - localhost.key"
echo_success "   - localhost.csr"
echo_success "   - localhost.crt"

echo ""
echo "📝 Step 4: Updating .gitignore..."

# Path to gitignore from the certificates directory
GITIGNORE_PATH="$SCRIPT_DIR/../../.gitignore"

# Create .gitignore if it doesn't exist
if [ ! -f "$GITIGNORE_PATH" ]; then
    touch "$GITIGNORE_PATH"
fi

# Check if SSL section already exists
if ! grep -q "# SSL certificates" "$GITIGNORE_PATH"; then
    # Remove any existing similar entries
    if grep -q "^\*\.pem$" "$GITIGNORE_PATH"; then
        # Remove standalone *.pem entry
        sed -i '' '/^*\.pem$/d' "$GITIGNORE_PATH"
    fi
    
    # Remove any existing SSL-related entries
    sed -i '' '/config\/ssl\/certificates\/localhost\.csr/d' "$GITIGNORE_PATH"
    sed -i '' '/config\/ssl\/certificates\/RootCA\.key/d' "$GITIGNORE_PATH"
    sed -i '' '/config\/ssl\/certificates\/RootCA\.srl/d' "$GITIGNORE_PATH"
    
    # Add SSL section with proper spacing
    echo "" >> "$GITIGNORE_PATH"
    echo "# SSL certificates" >> "$GITIGNORE_PATH"
    echo "*.pem" >> "$GITIGNORE_PATH"
    echo "config/ssl/certificates/localhost.csr" >> "$GITIGNORE_PATH"
    echo "config/ssl/certificates/RootCA.key" >> "$GITIGNORE_PATH"
    echo "config/ssl/certificates/RootCA.srl" >> "$GITIGNORE_PATH"
    
    echo_success "✅ Updated .gitignore with SSL certificate exclusions"
    else
        echo_success "✅ .gitignore already contains SSL certificate section"
fi

echo ""
# Ask the user whether to update package.json with predev:ssl and dev:ssl
read -p "Would you like to update package.json to add predev:ssl and dev:ssl scripts? [Y/n]: " update_pkg
update_pkg=${update_pkg:-"Y"}
if [[ "$update_pkg" =~ ^[Yy]$ ]]; then
    # ---------------------------------------------------------------------------
    # Step 5: Update package.json scripts (predev:ssl and dev:ssl)
    # - predev:ssl runs the trust.sh helper
    # - dev:ssl reuses the existing dev script and appends HTTPS flags if needed
    # ---------------------------------------------------------------------------

    REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
    PACKAGE_JSON="$REPO_ROOT/package.json"

    if [ -f "$PACKAGE_JSON" ]; then
        echo "🛠️  Updating package.json scripts (predev:ssl and dev:ssl)..."

        flags='--experimental-https --experimental-https-ca ./config/ssl/certificates/RootCA.crt --experimental-https-key ./config/ssl/certificates/localhost.key --experimental-https-cert ./config/ssl/certificates/localhost.crt'
        predev_cmd='bash ./config/ssl/trust.sh'

        if command -v jq >/dev/null 2>&1; then
            current_dev=$(jq -r '.scripts.dev // ""' "$PACKAGE_JSON")
            if [ -z "$current_dev" ] || [ "$current_dev" = "null" ]; then
                current_dev="next dev"
            fi

            if [[ "$current_dev" == *"--experimental-https"* ]]; then
                new_devssl="$current_dev"
            else
                new_devssl="$current_dev $flags"
            fi

            tmpfile=$(mktemp)
            jq --arg newdev "$new_devssl" --arg newpre "$predev_cmd" '.scripts["dev:ssl"]=$newdev | .scripts["predev:ssl"]=$newpre' "$PACKAGE_JSON" > "$tmpfile" && mv "$tmpfile" "$PACKAGE_JSON"
            echo "✅ package.json scripts updated (using jq)."
        else
            # Fallback to Node.js for safe JSON editing
            node - <<'NODE' "$PACKAGE_JSON" "$flags" "$predev_cmd"
const fs = require('fs');
const p = process.argv[2];
const flags = process.argv[3];
const pre = process.argv[4];
const pkg = JSON.parse(fs.readFileSync(p,'utf8'));
pkg.scripts = pkg.scripts || {};
if(!pkg.scripts.dev) pkg.scripts.dev = 'next dev';
if(pkg.scripts.dev.includes('--experimental-https')) pkg.scripts['dev:ssl'] = pkg.scripts.dev;
else pkg.scripts['dev:ssl'] = pkg.scripts.dev + ' ' + flags;
pkg.scripts['predev:ssl'] = pre;
fs.writeFileSync(p, JSON.stringify(pkg, null, 2) + '\n');
NODE
            echo "✅ package.json scripts updated (using node)."
        fi
    else
        echo "ℹ️ package.json not found at $PACKAGE_JSON; skipping scripts update."
    fi
fi

echo ""
echo_info "🚀 SSL certificates setup complete!"
echo ""
echo_info "📋 Next steps:"
echo_info "1. Trust the Root CA certificate on your system:"
echo_info "   macOS: sudo security add-trusted-cert -d -r trustRoot -p ssl -p codeSign -k \"./config/ssl/certificates/RootCA.crt\""
echo_info "   Windows: Right-click RootCA.crt > Install > Trusted Root Certification Authorities"
echo ""
echo_info "2. Start your Next.js app with HTTPS:"
echo_info "   next dev --experimental-https \\\n+     --experimental-https-ca \"./config/ssl/certificates/RootCA.crt\" \\\n+     --experimental-https-key \"./config/ssl/certificates/localhost.key\" \\\n+     --experimental-https-cert \"./config/ssl/certificates/localhost.crt\""
echo ""
echo_info "3. Or add this to your package.json scripts:"
echo_info "   \"dev:https\": \"next dev --experimental-https --experimental-https-ca ./config/ssl/certificates/RootCA.crt --experimental-https-key ./config/ssl/certificates/localhost.key --experimental-https-cert ./config/ssl/certificates/localhost.crt\""
echo ""
echo_success "🔒 Your localhost development environment is now ready for HTTPS!"