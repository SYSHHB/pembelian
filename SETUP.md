# Sistem Pemantauan Pembelian – Microsoft sign-in + OneDrive (it.helpdesk@syayasan.edu.bn)

Everyone signs in with their own **syayasan.edu.bn** Microsoft account. All data and documents are saved in the OneDrive of **it.helpdesk@syayasan.edu.bn**, in the folder **Sistem Pemantauan Pembelian** (uploaded files go in its **Dokumen** subfolder).

it.helpdesk@syayasan.edu.bn is the owner and is always an admin in the system.

## 1. Entra app registration

Use your existing app registration, or create one (entra.microsoft.com → App registrations → New registration):

- Account types: **Accounts in this organizational directory only**
- Redirect URI: **Single-page application (SPA)** → the exact website address, ending with `/` (e.g. `https://pembelian.syayasan.edu.bn/`)
- **API permissions → Microsoft Graph → Delegated**:
  - `User.Read`
  - `User.ReadBasic.All`
  - `Files.ReadWrite.All`  ← required for OneDrive
- Click **Grant admin consent**.
- Copy the **Application (client) ID**.

## 2. Put the client ID in index.html

Near the top of `index.html`, replace `PASTE_APPLICATION_CLIENT_ID` with your client ID (already done in this copy: 598ea952-e9df-4684-a109-85832dc34e59).

## 3. Upload to the website

Replace the old `index.html` on GitHub Pages with this one.

## 4. First use

1. Sign in **first as it.helpdesk@syayasan.edu.bn**. This creates the folder **Sistem Pemantauan Pembelian** in helpdesk's OneDrive.
2. In helpdesk's OneDrive, share that folder with each staff member:
   **Can view** for Pemerhati, **Can edit** for Penyunting and Pentadbir.
3. Still signed in as helpdesk, open **Pengguna** in the system and add each staff member with their role.
4. Staff can now sign in with their own accounts.

People who haven't been given the folder see "Belum ada akses" after signing in.

## Notes

- Data saved in the Claude version does not move across automatically.
- Document auto-fill uses the built-in reader (PDF and Word); photos/scans are not read. Check details before saving.
- Changes by other users appear within about 30 seconds.

## Adding users from another domain (@yshhb.org.bn)

`index.html` now allows two sign-in domains (see `emailDomains` near the top): `@syayasan.edu.bn` and `@yshhb.org.bn`. To allow another domain later, add it to that list.

For each person from @yshhb.org.bn:

**A. Check which case applies** (Microsoft 365 admin center → Settings → Domains):
- If `yshhb.org.bn` is listed as a domain of your own tenant, the person already has an account in your tenant. Go to step C.
- If it is not listed, `yshhb.org.bn` is a separate Microsoft 365 organisation. Do step B first.

**B. Invite the person as a guest (separate organisation only)**
1. entra.microsoft.com → Users → **New user → Invite external user**.
2. Enter their @yshhb.org.bn email, then **Invite**. They accept the invitation email once.
3. If sharing with guests is blocked, SharePoint admin center → Policies → Sharing → allow **Existing guests** (or **New and existing guests**) for OneDrive.

**C. Share the OneDrive folder**
Sign in to OneDrive as it.helpdesk → open **Sistem Pemantauan Pembelian** → Share → add their email → **Can view** (Pemerhati) or **Can edit** (Penyunting / Pentadbir).

**D. Add them in the system**
Sign in to the system as an admin → **Pengguna** → type their full email (e.g. name@yshhb.org.bn) → choose a role → **Tambah**. A full email from an allowed domain can always be added, even if the directory search does not list it.

The person then opens the system website and signs in with their @yshhb.org.bn account.


## Microsoft sign-in library is built in

`index.html` now contains the Microsoft sign-in library (@azure/msal-browser v2.38.3) inside the file. The website no longer downloads it from jsdelivr, Microsoft or unpkg, so sign-in works even when those addresses are blocked on the school network. The old download addresses are kept only as a backup.

The file is about 0.4 MB larger as a result. Upload it to your website the same way as before.


## Install as an app (no browser bar on phones)

Upload **all** of these files together, to the same place on the website (the main folder, next to index.html):

- `index.html`
- `manifest.json`
- `sw.js`
- `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`
- `apple-touch-icon.png`

Then on each phone:

1. **Remove the old home-screen shortcut.** It was made before the app files existed, so it keeps the browser bar.
2. Open https://pembelian.syayasan.edu.bn/ in Chrome.
3. Menu (three dots) → **Install app** (or **Add to Home screen**, then **Install**).
4. Open the system from the new icon. It opens full screen, with no title and address bar at the top.

iPhone: open the site in Safari → Share → **Add to Home Screen**.

The first sign-in still opens the Microsoft page briefly, then returns to the app. The app files do not store any data; everything still comes from OneDrive.
