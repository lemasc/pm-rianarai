if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let s=Promise.resolve();return a[e]||(s=new Promise((async s=>{if("document"in self){const a=document.createElement("script");a.src=e,document.head.appendChild(a),a.onload=s}else importScripts(e),s()}))),s.then((()=>{if(!a[e])throw new Error(`Module ${e} didn’t register its module`);return a[e]}))},s=(s,a)=>{Promise.all(s.map(e)).then((e=>a(1===e.length?e[0]:e)))},a={require:Promise.resolve(s)};self.define=(s,n,r)=>{a[s]||(a[s]=Promise.resolve().then((()=>{let a={};const i={uri:location.origin+s.slice(1)};return Promise.all(n.map((s=>{switch(s){case"exports":return a;case"module":return i;default:return e(s)}}))).then((e=>{const s=r(...e);return a.default||(a.default=s),a}))})))}}define("./sw.js",["./workbox-ea903bce"],(function(e){"use strict";importScripts("fallback-e7sxvbaza5_7D9qRGE5ZZ.js"),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/server/middleware-manifest.json",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/085b72e5.2dc8e2834bd6be2d.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/190.001bd20c8e7e982b.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/221-3e55f3fb5d1a8909.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/261.32eba8559acce57f.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/270.3585855f0adaa363.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/283-20d15e2312f42dbd.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/321-ffb32557986403e1.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/322-b5e85cd720b4ea3f.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/330-881c649e68d7c80d.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/394-3e26bba6e0cd11b4.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/416-8b3b08fa14c82309.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/485.50393248e1c8638f.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/49.ae6d8985d3fe26f4.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/498-a155c6d8256d7f68.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/4afafdf3-c9f9f9194b3cbcdd.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/506.70793b24cfceeb5f.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/552.168b550572077a42.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/645.9eb838f947d38114.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/671.5266bac04d139cf9.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/685-034a7ce4efafc243.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/697-a0e462fab6e37259.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/70-bb22cdf86427570f.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/723-790340ef51e3fac1.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/759-39ca1582b22e5b9a.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/760.2a702aa951b1ede7.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/791.e227f5d8b298f3aa.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/83.0db77f9ea7ffdfdb.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/830.139588a4d58f4bb6.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/850-c0e806d66f37bd18.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/959-78a4b5c6c95ec4b6.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/framework-8957c350a55da097.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/main-4d515d292cece3e7.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/pages/_app-d2cf43a84031f468.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/pages/_error-2280fa386d040b66.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/pages/_offline-ad4c72f57fd0a027.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/pages/about-2baebdedf7a8604d.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/pages/chumnum-aa793a9417380faa.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/pages/client-login-255d57555523f5fc.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/pages/index-197a08e08a8bdecb.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/pages/install-42ba5dd3c49e8d75.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/pages/maintenance-86bcdc40f2dad50c.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/pages/settings-923767d9c38a728f.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/pages/support-d5ac5242634a0a82.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/pages/timetable-967ab280e5ba1a17.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/pages/work-dd2075a9557a258d.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/polyfills-5cd94c89d3acac5f.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/chunks/webpack-861616b4525e3980.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/css/e9df2461ae248d8c.css",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/e7sxvbaza5_7D9qRGE5ZZ/_buildManifest.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/e7sxvbaza5_7D9qRGE5ZZ/_middlewareManifest.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/e7sxvbaza5_7D9qRGE5ZZ/_ssgManifest.js",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/media/circle.176edb4e.png",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/media/default.c2b1d496.webp",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_next/static/media/hero.740b32eb.webp",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/_offline",revision:"e7sxvbaza5_7D9qRGE5ZZ"},{url:"/android-chrome-192x192.png",revision:"97cf937989da0771e482e136b3eb121b"},{url:"/android-chrome-512x512.png",revision:"7000c2a522e7ae917e88bdbc9216cf08"},{url:"/apple-touch-icon.png",revision:"672f190295a348a7cda006bed613ae17"},{url:"/banner_3105.jpg",revision:"97cc9b93d5d5fb0873b2dd3c23871b61"},{url:"/favicon-16x16.png",revision:"932263f097ba5dd3220d4d9fa75eba97"},{url:"/favicon-32x32.png",revision:"a9595c5fa6cd1df2ba5bd70eeb5bf318"},{url:"/favicon.ico",revision:"ca63d5d9c7bbfe3053005a52febb170c"},{url:"/install/chrome_prompt.jpg",revision:"37ca16495c39b2c2160bda327d67bfb9"},{url:"/install/chrome_pwa.mp4",revision:"f7af0b3ed35c922080700d62230ac105"},{url:"/install/facebook.jpg",revision:"700e7e59e12d6a5114106f276c944d4b"},{url:"/install/instagram.jpg",revision:"45e3561571a20860245337a64b0e34bf"},{url:"/install/installpromo.png",revision:"44249a99fb9e765d09b81c959b06d2e6"},{url:"/install/installpromo_mobile.png",revision:"a36b7b26f723535bc39291e94d7b3713"},{url:"/install/ios.mp4",revision:"90d649240377e3a52e1cd89a2ab98cf0"},{url:"/install/launcher.jpg",revision:"a4a2b7508b685fdc619db6c0c8f98f44"},{url:"/install/line.jpg",revision:"c96ae95569ecd9cfc440e69570c1b9d9"},{url:"/install/messenger.jpg",revision:"fb48d6008e9a42a87fd9e48e2827058f"},{url:"/install/pc1.png",revision:"7e684518b3b38fecab6d2707612bb7ea"},{url:"/install/pc2.png",revision:"981acf94dcc887a60cfef35d9340f766"},{url:"/install/samsung_prompt.jpg",revision:"eca95de45ee0a8ae61b6ae4e90bb478b"},{url:"/install/samsung_pwa.mp4",revision:"bca1434fe1f46f2e29f5224ac43a34bb"},{url:"/install/shortcut.png",revision:"5b0e7147430f770a07270b3ae1861e01"},{url:"/install/start.png",revision:"f20ba708a1e606470a3886b72ffae89c"},{url:"/logo.png",revision:"7000c2a522e7ae917e88bdbc9216cf08"},{url:"/logo_white.svg",revision:"1edfbde9ce3f1671a1f2fccb0a862064"},{url:"/safari-pinned-tab.svg",revision:"a0f1c4b7e9eb70214c027994df95f0b9"},{url:"/site.webmanifest",revision:"3b55fde922f3d1191a67ed98a591caeb"},{url:"/v2/chumnum.png",revision:"e8a35b8e7778eab39ea75da964510768"},{url:"/v2/home_large.mp4",revision:"55eba3d476a1219e8755cdb4ca5b3f72"},{url:"/v2/v2_bg.jpg",revision:"bd2fa80ec120e18e0cfb9474dcdc3b2d"},{url:"/v2/work_square.jpeg",revision:"d554466f076c543f487399619b93419b"},{url:"/v2/work_v2.2.png",revision:"0565889aaf5dd4f535c63f4504003f95"},{url:"/v2_large.jpeg",revision:"040b32d0d3693366ba53d49cc38e982d"},{url:"/vercel.svg",revision:"4b4f1876502eb6721764637fe5c41702"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:a,state:n})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s},{handlerDidError:async({request:e})=>self.fallback(e)}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts",plugins:[{handlerDidError:async({request:e})=>self.fallback(e)},new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3,purgeOnQuotaError:!0})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[{handlerDidError:async({request:e})=>self.fallback(e)},new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800,purgeOnQuotaError:!0})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[{handlerDidError:async({request:e})=>self.fallback(e)},new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400,purgeOnQuotaError:!0})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[{handlerDidError:async({request:e})=>self.fallback(e)},new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400,purgeOnQuotaError:!0})]}),"GET"),e.registerRoute(/\.(?:mp3|mp4)$/i,new e.StaleWhileRevalidate({cacheName:"static-media-assets",plugins:[{handlerDidError:async({request:e})=>self.fallback(e)},new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400,purgeOnQuotaError:!0})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[{handlerDidError:async({request:e})=>self.fallback(e)},new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400,purgeOnQuotaError:!0})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[{handlerDidError:async({request:e})=>self.fallback(e)},new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400,purgeOnQuotaError:!0})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[{handlerDidError:async({request:e})=>self.fallback(e)},new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400,purgeOnQuotaError:!0})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[{handlerDidError:async({request:e})=>self.fallback(e)},new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400,purgeOnQuotaError:!0})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const s=e.pathname;return!s.startsWith("/api/auth/")&&!!s.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[{handlerDidError:async({request:e})=>self.fallback(e)},new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400,purgeOnQuotaError:!0})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[{handlerDidError:async({request:e})=>self.fallback(e)},new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400,purgeOnQuotaError:!0})]}),"GET")}));
