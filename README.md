# Sistem Pemantauan Pembelian (GitHub Pages + Microsoft + SharePoint)

1. Entra ID > App registrations > New: single tenant, platform "Single-page application", redirect URI https://pembelian.syayasan.edu.bn/
2. API permissions (delegated, Microsoft Graph): User.Read, User.ReadBasic.All, Sites.ReadWrite.All. Grant admin consent.
3. Create a SharePoint site; give staff access to it (this is the real access control).
4. Fill in config.js (tenant ID, client ID, site host/path, first admin email).
5. GitHub: new repo, upload these files, Settings > Pages > deploy from branch, set custom domain pembelian.syayasan.edu.bn, enable HTTPS.
6. DNS: at whoever manages syayasan.edu.bn, point the pembelian record to GitHub with a CNAME to <username>.github.io (replace any existing record for pembelian).
