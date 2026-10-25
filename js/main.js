(function () {
  /* ======================================================================
     0. SHARED SETUP
     Reduced-motion flag and the root <html> element, used by many sections.
     ====================================================================== */
  var R = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  var tb = document.getElementById('theme');


  /* ======================================================================
     1. DARK / LIGHT THEME TOGGLE
     ====================================================================== */

  // Returns true if the page is currently dark (manual choice wins over OS setting)
  function dark() {
    var t = root.getAttribute('data-theme');
    return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  }

  // Updates the toggle button icon (sun in dark mode, moon in light mode)
  function sync() {
    tb.textContent = dark() ? '☀' : '☾';
  }

  // Restore the saved theme from the last visit
  try {
    var s = localStorage.getItem('theme');
    if (s) {
      root.setAttribute('data-theme', s);
    }
  } catch (e) {}

  sync();

  // Click handler: switch theme and remember it
  tb.onclick = function () {
    var n = dark() ? 'light' : 'dark';
    root.setAttribute('data-theme', n);
    try {
      localStorage.setItem('theme', n);
    } catch (e) {}
    sync();
  };


  /* ======================================================================
     2. HERO NAME LETTERS + LOADING SCREEN
     Builds one <span> per letter of the big name, then starts the
     animations (body.go) after the loading screen.
     ====================================================================== */
  'JESRYL'.split('').forEach(function (c, i) {
    var s = document.createElement('span');
    s.className = 'ch';
    s.textContent = c;
    s.style.setProperty('--i', i);
    document.getElementById('n1').appendChild(s);
  });

  setTimeout(function () {
    document.body.classList.add('go');
  }, R ? 0 : 2300);


  /* ======================================================================
     3. RIBBON (scrolling marquee)
     Repeats the text 8 times so the loop looks seamless.
     ====================================================================== */
  var u = '<span>Jesryl Comeling</span><em>✦</em><span>ジェスリル</span><em>✦</em><span>BSIT</span><em>✦</em><span>Programmer</span><em>✦</em>';
  var h = '';

  for (var k = 0; k < 8; k++) {
    h += u;
  }

  document.getElementById('tr').innerHTML = h;


  /* ======================================================================
     4. QUOTE SECTION (word-by-word reveal)
     Splits the quote into one <span> per word.
     ====================================================================== */
  var q = document.getElementById('q');
  var w = q.textContent.split(' ');
  q.textContent = '';
  var ws = w.map(function (x) {
    var s = document.createElement('span');
    s.textContent = x;
    q.appendChild(s);
    return s;
  });


  /* ======================================================================
     5. NUMBER COUNTER (stats section)
     Counts up from 0 to the data-n value with an ease-out curve.
     ====================================================================== */
  function count(e) {
    var n = +e.dataset.n;
    var sx = e.dataset.s;
    var t0 = 0;

    if (R) {
      e.textContent = n + sx;
      return;
    }

    (function f(t) {
      if (!t0) {
        t0 = t;
      }
      var p = Math.min((t - t0) / 1500, 1);
      e.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))) + sx;
      if (p < 1) {
        requestAnimationFrame(f);
      }
    })(performance.now());
  }


  /* ======================================================================
     6. SCROLL-IN ANIMATIONS (IntersectionObserver)
     Adds the .in class to headings and rows when they scroll into view,
     and starts the counters.
     ====================================================================== */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (x) {
      if (x.isIntersecting) {
        x.target.classList.add('in');
        if (x.target.dataset.n) {
          count(x.target);
        }
        io.unobserve(x.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('h2,.row,[data-n]').forEach(function (e) {
    io.observe(e);
  });


  /* ======================================================================
     7. SCROLL HANDLER (quote reveal + active nav link)
     ====================================================================== */
  var ls = [].slice.call(document.querySelectorAll('.links a'));
  var ss = ls.map(function (a) {
    return document.querySelector(a.getAttribute('href'));
  });

  // Runs on every scroll: lights up quote words and highlights the current nav link
  function sc() {
    var p = (innerHeight * 0.8 - q.getBoundingClientRect().top) / (innerHeight * 0.5);
    ws.forEach(function (s, i) {
      s.classList.toggle('on', p > i / ws.length);
    });

    var c = -1;
    ss.forEach(function (s, i) {
      if (s && s.getBoundingClientRect().top < innerHeight * 0.4) {
        c = i;
      }
    });

    ls.forEach(function (a, i) {
      a.classList.toggle('on', i === c);
    });
  }

  addEventListener('scroll', sc, { passive: true });
  sc();


  /* ======================================================================
     8. CUSTOM CURSOR + HOVER PREVIEW CARD
     Only runs on devices with a mouse. Hidden on touch screens.
     ====================================================================== */
  var cur = document.getElementById('cur');
  var pv = document.getElementById('pv');
  var pi = document.getElementById('pvi');

  if (matchMedia('(pointer:fine)').matches && !R) {
    // Move the ring cursor and the preview card with the mouse
    addEventListener('pointermove', function (e) {
      cur.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px) translate(-50%,-50%)';
      pv.style.transform = 'translate(' + (e.clientX + 24) + 'px,' + (e.clientY - 90) + 'px)';
    });

    // Cursor grows over links, buttons, rows and gallery cards
    document.querySelectorAll('a,button,.row,.gc').forEach(function (e) {
      e.addEventListener('pointerenter', function () {
        cur.classList.add('big');
      });
      e.addEventListener('pointerleave', function () {
        cur.classList.remove('big');
      });
    });
  } else {
    cur.style.display = 'none';
  }

  // Small preview card appears while hovering a "Featured works" row
  document.querySelectorAll('.pvr').forEach(function (r) {
    r.addEventListener('pointerenter', function () {
      pi.textContent = r.dataset.i;
      pi.classList.add('on');
    });
    r.addEventListener('pointerleave', function () {
      pi.classList.remove('on');
    });
  });


  /* ======================================================================
     9. TOOLKIT GALLERY (mouse drag-to-scroll)
     Touch screens scroll natively, so this only handles the mouse.
     ====================================================================== */
  var g = document.getElementById('g');
  var dn = false;
  var sx = 0;
  var sl = 0;

  g.addEventListener('pointerdown', function (e) {
    dn = true;
    sx = e.clientX;
    sl = g.scrollLeft;
    g.style.cursor = 'grabbing';
  });

  addEventListener('pointerup', function () {
    dn = false;
    g.style.cursor = '';
  });

  g.addEventListener('pointermove', function (e) {
    if (dn && e.pointerType === 'mouse') {
      g.scrollLeft = sl - (e.clientX - sx);
    }
  });


  /* ======================================================================
     10. MOBILE MENU (hamburger button)
     Needs <button id="menu"> inside <nav> in index.html.
     ====================================================================== */
  var nav = document.querySelector('nav');
  var mb = document.getElementById('menu');

  // Closes the dropdown menu and resets the button icon
  function closeMenu() {
    nav.classList.remove('open');
    if (mb) {
      mb.textContent = '☰';
      mb.setAttribute('aria-expanded', 'false');
    }
  }

  // Hamburger button: open / close the menu
  if (mb) {
    mb.onclick = function () {
      var o = nav.classList.toggle('open');
      mb.textContent = o ? '✕' : '☰';
      mb.setAttribute('aria-expanded', o);
    };
  }

  // Close the menu after tapping any nav link
  document.querySelectorAll('.links a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });


  /* ======================================================================
     11. PROJECT POPUP (Featured works)
     Needs <div id="pj"> in index.html (right before the script tag).
     EDIT YOUR PROJECT INFO HERE: title, image, description, tags, link.
     The key (IMS, YF) must match data-i on each work row in the HTML.
     ====================================================================== */
  var P = {
    IMS: {
      title: 'Inventory Management System',
      img: 'images/proj/ims.png',
      desc: 'A GUI-based inventory management system built with Java NetBeans. Also include inputing informations and exporting it into pdfs ',
      tags: ['Java', 'NetBeans', 'MySQL'],
      link: 'https://github.com/comelingjesryl-web/Inventory-Management-System.git'
    },
    YF: {
      title: 'Ecommerce based System (YourFit)',
      img: 'images/proj/yourfit.png',
      desc: 'A CRUD application built with HTML and CSS. Its about ordering system that includes different types of clothing that are only exclusive here at Panabo City',
      tags: ['HTML', 'CSS', 'JavaScript'],
      link: 'https://github.com/comelingjesryl-web/E-Commerce.git'
    },
    TT: {                                // ← "TT" must match data-i="TT" in your HTML
    title: 'Budget Manager (TipidTrack)',
    img: 'images/proj/tipidtrack.png',
    desc: 'A budget tracking web app built for college students.Is a web application where you can manage all of your Allowance, Transactions, Budgets, Savings Goals.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    link: 'https://tipidtrack.vercel.app/#overview'                           // add a GitHub or live demo URL, or leave empty to hide the button
  }
  };

  var pj = document.getElementById('pj');
  var pjImg = document.getElementById('pj-i');
  var pjFrom = null;                 // remembers which row opened the popup

  // Opens the popup and fills it with the project's info
  function openPj(k, from) {
    var d = P[k];
    if (!d || !pj) { return; }
    pjFrom = from;
    pi.classList.remove('on');       // hide the hover preview card
    document.getElementById('pj-n').textContent = 'Featured work';
    document.getElementById('pj-t').textContent = d.title;
    document.getElementById('pj-d').textContent = d.desc;

    // Build the tag pills
    var g2 = document.getElementById('pj-g');
    g2.textContent = '';
    d.tags.forEach(function (t) {
      var s2 = document.createElement('span');
      s2.className = 'tg';
      s2.textContent = t;
      g2.appendChild(s2);
    });

    // Show the link button only if a link is set
    var l = document.getElementById('pj-l');
    l.style.display = d.link ? '' : 'none';
    l.href = d.link || '#';

    // Load the image
    pjImg.style.display = '';
    pjImg.alt = d.title;
    pjImg.src = d.img;

    pj.classList.add('open');
    pj.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';   // stop the page scrolling behind
    pj.querySelector('.pj-x').focus();
  }

  // Closes the popup and returns focus to the row that opened it
  function closePj() {
    pj.classList.remove('open');
    pj.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (pjFrom) { pjFrom.focus(); }
  }

  if (pj) {
    // Hide the image area if the file is missing (text still shows)
    pjImg.onerror = function () { pjImg.style.display = 'none'; };

    // Make each work row clickable and keyboard-accessible
    document.querySelectorAll('.pvr').forEach(function (r) {
      r.tabIndex = 0;
      r.setAttribute('role', 'button');
      r.addEventListener('click', function () { openPj(r.dataset.i, r); });
      r.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openPj(r.dataset.i, r);
        }
      });
    });

    // Close when clicking the X button or the blurred area outside the card
    pj.addEventListener('click', function (e) {
      if (e.target === pj || e.target.closest('.pj-x')) { closePj(); }
    });

    // Close with the Esc key
    addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && pj.classList.contains('open')) { closePj(); }
    });
  }
})();