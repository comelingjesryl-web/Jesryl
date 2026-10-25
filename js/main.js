(function () {
  var R = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  var tb = document.getElementById('theme');

  function dark() {
    var t = root.getAttribute('data-theme');
    return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function sync() {
    tb.textContent = dark() ? '☀' : '☾';
  }

  try {
    var s = localStorage.getItem('theme');
    if (s) {
      root.setAttribute('data-theme', s);
    }
  } catch (e) {}

  sync();

  tb.onclick = function () {
    var n = dark() ? 'light' : 'dark';
    root.setAttribute('data-theme', n);
    try {
      localStorage.setItem('theme', n);
    } catch (e) {}
    sync();
  };

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

  var u = '<span>Jesryl Comeling</span><em>✦</em><span>ジェスリル</span><em>✦</em><span>BSIT</span><em>✦</em><span>Programmer</span><em>✦</em>';
  var h = '';

  for (var k = 0; k < 8; k++) {
    h += u;
  }

  document.getElementById('tr').innerHTML = h;

  var q = document.getElementById('q');
  var w = q.textContent.split(' ');
  q.textContent = '';
  var ws = w.map(function (x) {
    var s = document.createElement('span');
    s.textContent = x;
    q.appendChild(s);
    return s;
  });

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

  var ls = [].slice.call(document.querySelectorAll('.links a'));
  var ss = ls.map(function (a) {
    return document.querySelector(a.getAttribute('href'));
  });

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

  var cur = document.getElementById('cur');
  var pv = document.getElementById('pv');
  var pi = document.getElementById('pvi');

  if (matchMedia('(pointer:fine)').matches && !R) {
    addEventListener('pointermove', function (e) {
      cur.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px) translate(-50%,-50%)';
      pv.style.transform = 'translate(' + (e.clientX + 24) + 'px,' + (e.clientY - 90) + 'px)';
    });

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

  document.querySelectorAll('.pvr').forEach(function (r) {
    r.addEventListener('pointerenter', function () {
      pi.textContent = r.dataset.i;
      pi.classList.add('on');
    });
    r.addEventListener('pointerleave', function () {
      pi.classList.remove('on');
    });
  });

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

  var nav = document.querySelector('nav');
  var mb = document.getElementById('menu');

  function closeMenu() {
    nav.classList.remove('open');
    mb.textContent = '☰';
    mb.setAttribute('aria-expanded', 'false');
  }

  mb.onclick = function () {
    var o = nav.classList.toggle('open');
    mb.textContent = o ? '✕' : '☰';
    mb.setAttribute('aria-expanded', o);
  };

  document.querySelectorAll('.links a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });
})();
