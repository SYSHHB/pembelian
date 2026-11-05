/* Service worker for the SYSHHB IT Purchase Tracker.
   It lets the browser install the website as an app that opens full screen, without the browser bar.
   It does not store any data: every request still goes to the network. */
self.addEventListener("install", ()=>self.skipWaiting());
self.addEventListener("activate", e=>e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e=>{
  if(e.request.mode === "navigate") e.respondWith(fetch(e.request));
});
