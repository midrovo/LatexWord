(function(){
    var pdf2htmlEX = window.pdf2htmlEX = window.pdf2htmlEX || {},
    CSS_CLASS_NAMES = {
        page_frame: "pf",
        page_content_box: "pc",
        page_data: "pi",
        background_image: "bi",
        link: "l",
        input_radio: "ir",
        __dummy__: "no comma"
    },
    DEFAULT_CONFIG = {
        container_id: "page-container",
        sidebar_id: "sidebar",
        outline_id: "outline",
        loading_indicator_cls: "loading-indicator",
        preload_pages: 3,
        render_timeout: 100,
        scale_step: 0.9,
        key_handler: true,
        hashchange_handler: true,
        view_history_handler: true,
        __dummy__: "no comma"
    },
    EPS = 1E-6;

    function invert(a) {
        var b = a[0] * a[3] - a[1] * a[2];
        return [a[3] / b, -a[1] / b, -a[2] / b, a[0] / b, (a[2] * a[5] - a[3] * a[4]) / b, (a[1] * a[4] - a[0] * a[5]) / b];
    }

    function transform(a, b) {
        return [a[0] * b[0] + a[2] * b[1] + a[4], a[1] * b[0] + a[3] * b[1] + a[5]];
    }

    function get_page_number(a) {
        return parseInt(a.getAttribute("data-page-no"), 16);
    }

    function disable_dragstart(a) {
        for (var b = 0, c = a.length; b < c; ++b)
            a[b].addEventListener("dragstart", function() {
                return false;
            }, false);
    }

    function clone_and_extend_objs(a) {
        for (var b = {}, c = 0, e = arguments.length; c < e; ++c) {
            var h = arguments[c],
            d;
            for (d in h)
                h.hasOwnProperty(d) && (b[d] = h[d]);
        }
        return b;
    }

    function Page(a) {
        if (a) {
            this.shown = this.loaded = false;
            this.page = a;
            this.num = get_page_number(a);
            this.original_height = a.clientHeight;
            this.original_width = a.clientWidth;
            var b = a.getElementsByClassName(CSS_CLASS_NAMES.page_content_box)[0];
            if (b) {
                this.content_box = b;
                this.original_scale = this.cur_scale = this.original_height / b.clientHeight;
                this.page_data = JSON.parse(a.getElementsByClassName(CSS_CLASS_NAMES.page_data)[0].getAttribute("data-data"));
                this.ctm = this.page_data.ctm;
                this.ictm = invert(this.ctm);
                this.loaded = true;
            }
        }
    }

    Page.prototype = {
        hide: function() {
            if (this.loaded && this.shown) {
                this.content_box.classList.remove("opened");
                this.shown = false;
            }
        },
        show: function() {
            if (this.loaded && !this.shown) {
                this.content_box.classList.add("opened");
                this.shown = true;
            }
        },
        rescale: function(a) {
            this.cur_scale = a === 0 ? this.original_scale : a;
            if (this.loaded) {
                var a = this.content_box.style;
                a.msTransform = a.webkitTransform = a.transform = "scale(" + this.cur_scale.toFixed(3) + ")";
            }
            var a = this.page.style;
            a.height = this.original_height * this.cur_scale + "px";
            a.width = this.original_width * this.cur_scale + "px";
        },
        view_position: function() {
            var a = this.page,
            b = a.parentNode;
            return [b.scrollLeft - a.offsetLeft - a.clientLeft, b.scrollTop - a.offsetTop - a.clientTop];
        },
        height: function() {
            return this.page.clientHeight;
        },
        width: function() {
            return this.page.clientWidth;
        }
    };

    function Viewer(a) {
        this.config = clone_and_extend_objs(DEFAULT_CONFIG, arguments.length > 0 ? a : {});
        this.pages_loading = [];
        this.init_before_loading_content();
        var b = this;
        document.addEventListener("DOMContentLoaded", function() {
            b.init_after_loading_content();
        }, false);
    }

    Viewer.prototype = {
        scale: 1,
        cur_page_idx: 0,
        first_page_idx: 0,
        init_before_loading_content: function() {
            this.pre_hide_pages();
        },
        initialize_radio_button: function() {
            for (var a = document.getElementsByClassName(CSS_CLASS_NAMES.input_radio), b = 0; b < a.length; b++)
                a[b].addEventListener("click", function() {
                    this.classList.toggle("checked");
                });
        },
        init_after_loading_content: function() {
            this.sidebar = document.getElementById(this.config.sidebar_id);
            this.outline = document.getElementById(this.config.outline_id);
            this.container = document.getElementById(this.config.container_id);
            this.loading_indicator = document.getElementsByClassName(this.config.loading_indicator_cls)[0];
            for (var a = true, b = this.outline.childNodes, c = 0, e = b.length; c < e; ++c)
                if (b[c].nodeName.toLowerCase() === "ul") {
                    a = false;
                    break;
                }
            a || this.sidebar.classList.add("opened");
            this.find_pages();
            if (this.pages.length != 0) {
                disable_dragstart(document.getElementsByClassName(CSS_CLASS_NAMES.background_image));
                if (this.config.key_handler)
                    this.register_key_handler();
                var h = this;
                if (this.config.hashchange_handler)
                    window.addEventListener("hashchange", function(a) {
                        h.navigate_to_dest(document.location.hash.substring(1));
                    }, false);
                if (this.config.view_history_handler)
                    window.addEventListener("popstate", function(a) {
                        a.state && h.navigate_to_dest(a.state);
                    }, false);
                var d = this;
                this.container.addEventListener("scroll", function() {
                    d.update_page_idx();
                    d.schedule_render(true);
                }, false);
                [this.container, this.outline].forEach(function(a) {
                    a.addEventListener("click", d.link_handler.bind(d), false);
                });
                this.initialize_radio_button();
                this.render();
            }
        },
        find_pages: function() {
            for (var a = [], b = {}, c = this.container.childNodes, e = 0, h = c.length; e < h; ++e) {
                var d = c[e];
                if (d.nodeType === Node.ELEMENT_NODE && d.classList.contains(CSS_CLASS_NAMES.page_frame)) {
                    d = new Page(d);
                    a.push(d);
                    b[d.num] = a.length - 1;
                }
            }
            this.pages = a;
            this.page_map = b;
        },
        load_page: function(a, b, c) {
            var e = this.pages;
            if (!(a >= e.length || (e = e[a], e.loaded || this.pages_loading[a]))) {
                var e = e.page,
                h = e.getAttribute("data-page-url");
                if (h) {
                    this.pages_loading[a] = true;
                    var d = e.getElementsByClassName(this.config.loading_indicator_cls)[0];
                    if (typeof d === "undefined") {
                        d = this.loading_indicator.cloneNode(true);
                        d.classList.add("active");
                        e.appendChild(d);
                    }
                    var f = this,
                    g = new XMLHttpRequest;
                    g.open("GET", h, true);
                    g.onload = function() {
                        if (g.status === 200 || g.status === 0) {
                            var b = document.createElement("div");
                            b.innerHTML = g.responseText;
                            for (var d = null, b = b.childNodes, h = 0, p = b.length; h < p; ++h) {
                                var q = b[h];
                                if (q.nodeType === Node.ELEMENT_NODE && q.classList.contains(CSS_CLASS_NAMES.page_frame)) {
                                    d = q;
                                    break;
                                }
                            }
                            b = f.pages[a];
                            f.container.replaceChild(d, b.page);
                            b = new Page(d);
                            f.pages[a] = b;
                            b.hide();
                            b.rescale(f.scale);
                            disable_dragstart(d.getElementsByClassName(CSS_CLASS_NAMES.background_image));
                            f.schedule_render(false);
                            c && c(b);
                        }
                        delete f.pages_loading[a];
                    };
                    g.send(null);
                }
                typeof b === "undefined" && (b = this.config.preload_pages);
                if (--b > 0) {
                    var l = this;
                    setTimeout(function() {
                        l.load_page(a + 1, b);
                    }, 0);
                }
            }
        },
        pre_hide_pages: function() {
            var a = "@media screen{." + CSS_CLASS_NAMES.page_content_box + "{display:none;}}",
            b = document.createElement("style");
            if (b.styleSheet)
                b.styleSheet.cssText = a;
            else
                b.appendChild(document.createTextNode(a));
            document.head.appendChild(b);
        },
        render: function() {
            for (var a = this.container, b = a.scrollTop, c = a.clientHeight, a = b - c, b = b + c + c, c = this.pages, e = 0, h = c.length; e < h; ++e) {
                var d = c[e],
                f = d.page,
                g = f.offsetTop + f.clientTop,
                f = g + f.clientHeight;
                if (g <= b && f >= a)
                    d.loaded ? d.show() : this.load_page(e);
                else
                    d.hide();
            }
        },
        update_page_idx: function() {
            for (var a = this.pages, b = a.length, c = this.container, e = c.scrollTop, c = e + c.clientHeight, h = -1, d = b - h, f = d; f > 1;) {
                var g = h + Math.floor(f / 2),
                f = a[g].page,
                g = f.offsetTop + f.clientTop + f.clientHeight >= e ? d = g : h = g;
            }
            this.first_page_idx = d;
            for (var k = h = this.cur_page_idx, k = 0; d < b; ++d) {
                var f = a[d].page,
                l = f.offsetTop + f.clientTop,
                f = f.clientHeight;
                if (l > c)
                    break;
                f = (Math.min(c, l + f) - Math.max(e, l)) / f;
                if (d === h && Math.abs(f - 1) <= EPS) {
                    k = h;
                    break;
                }
                f > k && (k = f);
            }
            this.cur_page_idx = k;
        },
        schedule_render: function(a) {
            if (typeof this.render_timer !== "undefined") {
                if (!a)
                    return;
                clearTimeout(this.render_timer);
            }
            var b = this;
            this.render_timer = delete b.render_timer;
            b.render();
        },
        register_key_handler: function() {
            var a = this;
            window.addEventListener("DOMMouseScroll", function(b) {
                if (b.ctrlKey) {
                    b.preventDefault();
                    var c = a.container,
                    e = c.getBoundingClientRect(),
                    c = [b.clientX - e.left - c.clientLeft, b.clientY - e.top - c.clientTop];
                    a.rescale(Math.pow(a.config.scale_step, b.detail), true, c);
                }
            }, false);
            window.addEventListener("keydown", function(b) {
                var c = false,
                e = b.ctrlKey || b.metaKey,
                h = b.altKey;
                switch (b.keyCode) {
                    case 61:
                    case 107:
                    case 187:
                        if (e) {
                            a.rescale(1 / a.config.scale_step, true);
                            c = true;
                        }
                        break;
                    case 173:
                    case 109:
                    case 189:
                        if (e) {
                            a.rescale(a.config.scale_step, true);
                            c = true;
                        }
                        break;
                    case 48:
                        if (e) {
                            a.rescale(0, false);
                            c = true;
                        }
                        break;
                    case 33:
                        if (h)
                            a.scroll_to(a.cur_page_idx - 1);
                        else
                            a.container.scrollTop -= a.container.clientHeight;
                        c = true;
                        break;
                    case 34:
                        if (h)
                            a.scroll_to(a.cur_page_idx + 1);
                        else
                            a.container.scrollTop += a.container.clientHeight;
                        c = true;
                        break;
                    case 35:
                        a.container.scrollTop = a.container.scrollHeight;
                        c = true;
                        break;
                    case 36:
                        a.container.scrollTop = 0;
                        c = true;
                        break;
                }
                if (c)
                    b.preventDefault();
            }, false);
        },
        rescale: function(a, b, c) {
            var e = this.scale;
            this.scale = a = a === 0 ? 1 : b ? e * a : a;
            c || (c = [0, 0]);
            b = this.container;
            c[0] += b.scrollLeft;
            c[1] += b.scrollTop;
            for (var h = this.pages, d = h.length, f = this.first_page_idx; f < d; ++f) {
                var g = h[f].page;
                if (g.offsetTop + g.clientTop >= c[1])
                    break;
            }
            g = f - 1;
            g < 0 && (g = 0);
            var g = h[g].page,
            k = g.clientWidth,
            f = g.clientHeight,
            l = g.offsetLeft + g.clientLeft,
            m = c[0] - l;
            m < 0 ? m = 0 : m > k && (m = k);
            k = g.offsetTop + g.clientTop;
            c = c[1] - k;
            c < 0 ? c = 0 : c > f && (c = f);
            for (f = 0; f < d; ++f)
                h[f].rescale(a);
            b.scrollLeft += m / e * a + g.offsetLeft + g.clientLeft - m - l;
            b.scrollTop += c / e * a + k + g.clientTop - c - k;
            this.schedule_render(true);
        },
        fit_width: function() {
            var a = this.cur_page_idx;
            this.rescale(this.container.clientWidth / this.pages[a].width(), true);
            this.scroll_to(a);
        },
        fit_height: function() {
            var a = this.cur_page_idx;
            this.rescale(this.container.clientHeight / this.pages[a].height(), true);
            this.scroll_to(a);
        },
        get_containing_page: function(a) {
            for (; a;) {
                if (a.nodeType === Node.ELEMENT_NODE && a.classList.contains(CSS_CLASS_NAMES.page_frame)) {
                    a = get_page_number(a);
                    var b = this.page_map;
                    return a in b ? this.pages[b[a]] : null;
                }
                a = a.parentNode;
            }
            return null;
        },
        link_handler: function(a) {
            var b = a.target,
            c = b.getAttribute("data-dest-detail");
            if (c) {
                if (this.config.view_history_handler)
                    try {
                        var e = this.get_current_view_hash();
                        window.history.replaceState(e, "", "#" + e);
                        window.history.pushState(c, "", "#" + c);
                    } catch (h) {}
                this.navigate_to_dest(c, this.get_containing_page(b));
                a.preventDefault();
            }
        },
        navigate_to_dest: function(a, b) {
            try {
                var c = JSON.parse(a);
            } catch (e) {
                return;
            }
            if (c instanceof Array) {
                var h = c[0],
                d = this.page_map;
                if (h in d) {
                    var f = d[h],
                    g = this.pages[f],
                    k = g.view_position(),
                    k = transform(g.ictm, [k[0], g.height() - k[1]]),
                    g = this.scale,
                    l = [0, 0],
                    m = true,
                    n = false,
                    p = this.scale;
                    switch (c[1]) {
                        case "XYZ":
                            l = [c[2] === null ? k[0] : c[2] * p, c[3] === null ? k[1] : c[3] * p];
                            g = c[4];
                            if (g === null || g === 0)
                                g = this.scale;
                            n = true;
                            break;
                        case "Fit":
                        case "FitB":
                            l = [0, 0];
                            n = true;
                            break;
                        case "FitH":
                        case "FitBH":
                            l = [0, c[2] === null ? k[1] : c[2] * p];
                            n = true;
                            break;
                        case "FitV":
                        case "FitBV":
                            l = [c[2] === null ? k[0] : c[2] * p, 0];
                            n = true;
                            break;
                        case "FitR":
                            l = [c[2] * p, c[5] * p];
                            m = false;
                            n = true;
                            break;
                    }
                    if (n) {
                        this.rescale(g, false);
                        var q = this,
                        r = function(a) {
                            l = transform(a.ctm, l);
                            if (m)
                                l[1] = a.height() - l[1];
                            q.scroll_to(f, l);
                        };
                        g = g.loaded ? r : function() {
                            q.load_page(f, void 0, r);
                            q.scroll_to(f);
                        };
                        g();
                    }
                }
            }
        },
        scroll_to: function(a, b) {
            var c = this.pages;
            if (!(a < 0 || a >= c.length)) {
                c = c[a].view_position();
                if (typeof b === "undefined")
                    b = [0, 0];
                var e = this.container;
                e.scrollLeft += b[0] - c[0];
                e.scrollTop += b[1] - c[1];
            }
        },
        get_current_view_hash: function() {
            var a = [],
            b = this.pages[this.cur_page_idx];
            a.push(b.num);
            a.push("XYZ");
            var c = b.view_position(),
            c = transform(b.ictm, [c[0], b.height() - c[1]]);
            a.push(c[0] / this.scale);
            a.push(c[1] / this.scale);
            a.push(this.scale);
            return JSON.stringify(a);
        }
    };

    pdf2htmlEX.Viewer = Viewer;
})();
