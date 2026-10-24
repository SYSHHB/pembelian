/* Fill these in after the Entra ID app registration and SharePoint site exist. */
window.APT_CONFIG = {
  tenantId: "PASTE-DIRECTORY-TENANT-ID",
  clientId: "PASTE-APPLICATION-CLIENT-ID",
  redirectUri: "https://pembelian.syayasan.edu.bn/",          // must match the Entra ID redirect URI exactly
  siteHost: "YOURTENANT.sharepoint.com",
  sitePath: "/sites/YourSiteName",                  // SharePoint site that holds the data
  folder: "AptData",                                // folder created in the site's Documents library
  admins: ["first.admin@syayasan.edu.bn"]           // always admin; they add everyone else inside the app
};
