/* Fill these in after the Entra ID app registration and SharePoint site exist. */
window.APT_CONFIG = {
  tenantId: "598ea952-e9df-4684-a109-85832dc34e59",
  clientId: "d3ab4c65-3ba1-4c04-98fd-66a0c7730cdf",
  redirectUri: "https://pembelian.syayasan.edu.bn/",          // must match the Entra ID redirect URI exactly
  siteHost: "YOURTENANT.sharepoint.com",
  sitePath: "/sites/YourSiteName",                  // SharePoint site that holds the data
  folder: "AptData",                                // folder created in the site's Documents library
  admins: ["first.admin@syayasan.edu.bn"]           // always admin; they add everyone else inside the app
};
