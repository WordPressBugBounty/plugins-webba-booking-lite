/* START custom select */

/*  jQuery Nice Select - v1.1.0
    https://github.com/hernansartorio/jquery-nice-select
    Made by Hernán Sartorio  */

(function ($) {
    $.fn.niceSelect = function (method) {
        // Methods
        if (typeof method == 'string') {
            if (method == 'update') {
                this.each(function () {
                    var $select = $(this);
                    var $dropdown = $(this).next('.nice-select');
                    var open = $dropdown.hasClass('open');

                    if ($dropdown.length) {
                        $dropdown.remove();
                        create_nice_select($select);

                        if (open) {
                            $select.next().trigger('click');
                        }
                    }
                });
            } else if (method == 'destroy') {
                this.each(function () {
                    var $select = $(this);
                    var $dropdown = $(this).next('.nice-select');

                    if ($dropdown.length) {
                        $dropdown.remove();
                        $select.css('display', '');
                    }
                });
                if ($('.nice-select').length == 0) {
                    $(document).off('.nice_select');
                }
            } else {
                console.log('Method "' + method + '" does not exist.');
            }
            return this;
        }

        // Hide native select
        this.hide();

        // Create custom markup
        this.each(function () {
            var $select = $(this);

            if (!$select.next().hasClass('nice-select')) {
                create_nice_select($select);
            }
        });

        function create_nice_select($select) {
            $select.after(
                $('<div></div>')
                    .addClass('nice-select')
                    .addClass($select.attr('class') || '')
                    .addClass($select.attr('disabled') ? 'disabled' : '')
                    .attr('tabindex', $select.attr('disabled') ? null : '0')
                    .html('<span class="current"></span><ul class="list"></ul>')
            );

            var $dropdown = $select.next();
            var $options = $select.find('option');
            var $selected = $select.find('option:selected');

            $dropdown
                .find('.current')
                .html($selected.data('display') || $selected.text());

            $options.each(function (i) {
                var $option = $(this);
                var display = $option.data('display');

                $dropdown.find('ul').append(
                    $('<li></li>')
                        .attr('data-value', $option.val())
                        .attr('data-display', display || null)
                        .addClass(
                            'option' +
                                ($option.is(':selected') ? ' selected' : '') +
                                ($option.is(':disabled') ? ' disabled' : '')
                        )
                        .html($option.text())
                );
            });
        }

        /* Event listeners */

        // Unbind existing events in case that the plugin has been initialized before
        $(document).off('.nice_select');

        // Open/close
        $(document).on('click.nice_select', '.nice-select', function (event) {
            var $dropdown = $(this);

            $('.nice-select').not($dropdown).removeClass('open');
            $dropdown.toggleClass('open');

            if ($dropdown.hasClass('open')) {
                $dropdown.find('.option');
                $dropdown.find('.focus').removeClass('focus');
                $dropdown.find('.selected').addClass('focus');
            } else {
                $dropdown.focus();
                $(document).trigger('nice-select-close');
            }
        });

        // Close when clicking outside
        $(document).on('click.nice_select', function (event) {
            if ($(event.target).closest('.nice-select').length === 0) {
                $('.nice-select').removeClass('open').find('.option');
                $(document).trigger('nice-select-close');

            }
        });

        // Option click
        $(document).on(
            'click.nice_select',
            '.nice-select .option:not(.disabled)',
            function (event) {
                var $option = $(this);
                var $dropdown = $option.closest('.nice-select');

                $dropdown.find('.selected').removeClass('selected');
                $option.addClass('selected');

                var text = $option.data('display') || $option.text();
                $dropdown.find('.current').text(text);

                $dropdown
                    .prev('select')
                    .val($option.data('value'))
                    .trigger('change');
            }
        );

        // Keyboard events
        $(document).on('keydown.nice_select', '.nice-select', function (event) {
            var $dropdown = $(this);
            var $focused_option = $(
                $dropdown.find('.focus') ||
                    $dropdown.find('.list .option.selected')
            );

            // Space or Enter
            if (event.keyCode == 32 || event.keyCode == 13) {
                if ($dropdown.hasClass('open')) {
                    $focused_option.trigger('click');
                } else {
                    $dropdown.trigger('click');
                }
                return false;
                // Down
            } else if (event.keyCode == 40) {
                if (!$dropdown.hasClass('open')) {
                    $dropdown.trigger('click');
                } else {
                    var $next = $focused_option
                        .nextAll('.option:not(.disabled)')
                        .first();
                    if ($next.length > 0) {
                        $dropdown.find('.focus').removeClass('focus');
                        $next.addClass('focus');
                    }
                }
                return false;
                // Up
            } else if (event.keyCode == 38) {
                if (!$dropdown.hasClass('open')) {
                    $dropdown.trigger('click');
                } else {
                    var $prev = $focused_option
                        .prevAll('.option:not(.disabled)')
                        .first();
                    if ($prev.length > 0) {
                        $dropdown.find('.focus').removeClass('focus');
                        $prev.addClass('focus');
                    }
                }
                return false;
                // Esc
            } else if (event.keyCode == 27) {
                if ($dropdown.hasClass('open')) {
                    $dropdown.trigger('click');
                }
                // Tab
            } else if (event.keyCode == 9) {
                if ($dropdown.hasClass('open')) {
                    return false;
                }
            }
        });

        // Detect CSS pointer-events support, for IE <= 10. From Modernizr.
        var style = document.createElement('a').style;
        style.cssText = 'pointer-events:auto';
        if (style.pointerEvents !== 'auto') {
            $('html').addClass('no-csspointerevents');
        }

        return this;
    };
})(jQuery);

/* END custom select */

/* START smooth scrollbar 8.8.1 */

/* START smooth scrollbar 8.8.1 */

!(function (t, e) {
    'object' == typeof exports && 'object' == typeof module
        ? (module.exports = e())
        : 'function' == typeof define && define.amd
        ? define([], e)
        : 'object' == typeof exports
        ? (exports.Scrollbar = e())
        : (t.Scrollbar = e());
})(this, function () {
    return (function (t) {
        var e = {};
        function n(r) {
            if (e[r]) return e[r].exports;
            var o = (e[r] = { i: r, l: !1, exports: {} });
            return t[r].call(o.exports, o, o.exports, n), (o.l = !0), o.exports;
        }
        return (
            (n.m = t),
            (n.c = e),
            (n.d = function (t, e, r) {
                n.o(t, e) ||
                    Object.defineProperty(t, e, { enumerable: !0, get: r });
            }),
            (n.r = function (t) {
                'undefined' != typeof Symbol &&
                    Symbol.toStringTag &&
                    Object.defineProperty(t, Symbol.toStringTag, {
                        value: 'Module',
                    }),
                    Object.defineProperty(t, '__esModule', { value: !0 });
            }),
            (n.t = function (t, e) {
                if ((1 & e && (t = n(t)), 8 & e)) return t;
                if (4 & e && 'object' == typeof t && t && t.__esModule)
                    return t;
                var r = Object.create(null);
                if (
                    (n.r(r),
                    Object.defineProperty(r, 'default', {
                        enumerable: !0,
                        value: t,
                    }),
                    2 & e && 'string' != typeof t)
                )
                    for (var o in t)
                        n.d(
                            r,
                            o,
                            function (e) {
                                return t[e];
                            }.bind(null, o)
                        );
                return r;
            }),
            (n.n = function (t) {
                var e =
                    t && t.__esModule
                        ? function () {
                              return t.default;
                          }
                        : function () {
                              return t;
                          };
                return n.d(e, 'a', e), e;
            }),
            (n.o = function (t, e) {
                return Object.prototype.hasOwnProperty.call(t, e);
            }),
            (n.p = ''),
            n((n.s = 68))
        );
    })([
        function (t, e) {
            var n = /^\s+|\s+$/g,
                r = /^[-+]0x[0-9a-f]+$/i,
                o = /^0b[01]+$/i,
                i = /^0o[0-7]+$/i,
                u = parseInt,
                c = Object.prototype.toString;
            function a(t) {
                var e = typeof t;
                return !!t && ('object' == e || 'function' == e);
            }
            function s(t) {
                if ('number' == typeof t) return t;
                if (
                    (function (t) {
                        return (
                            'symbol' == typeof t ||
                            ((function (t) {
                                return !!t && 'object' == typeof t;
                            })(t) &&
                                '[object Symbol]' == c.call(t))
                        );
                    })(t)
                )
                    return NaN;
                if (a(t)) {
                    var e = 'function' == typeof t.valueOf ? t.valueOf() : t;
                    t = a(e) ? e + '' : e;
                }
                if ('string' != typeof t) return 0 === t ? t : +t;
                t = t.replace(n, '');
                var s = o.test(t);
                return s || i.test(t)
                    ? u(t.slice(2), s ? 2 : 8)
                    : r.test(t)
                    ? NaN
                    : +t;
            }
            t.exports = function (t, e, n) {
                return (
                    void 0 === n && ((n = e), (e = void 0)),
                    void 0 !== n && (n = (n = s(n)) == n ? n : 0),
                    void 0 !== e && (e = (e = s(e)) == e ? e : 0),
                    (function (t, e, n) {
                        return (
                            t == t &&
                                (void 0 !== n && (t = t <= n ? t : n),
                                void 0 !== e && (t = t >= e ? t : e)),
                            t
                        );
                    })(s(t), e, n)
                );
            };
        },
        function (t, e, n) {
            (function (e) {
                var n = function (t) {
                    return t && t.Math == Math && t;
                };
                t.exports =
                    n('object' == typeof globalThis && globalThis) ||
                    n('object' == typeof window && window) ||
                    n('object' == typeof self && self) ||
                    n('object' == typeof e && e) ||
                    Function('return this')();
            }).call(this, n(45));
        },
        function (t, e, n) {
            var r = n(1),
                o = n(53),
                i = n(4),
                u = n(31),
                c = n(58),
                a = n(77),
                s = o('wks'),
                f = r.Symbol,
                l = a ? f : (f && f.withoutSetter) || u;
            t.exports = function (t) {
                return (
                    i(s, t) ||
                        (c && i(f, t)
                            ? (s[t] = f[t])
                            : (s[t] = l('Symbol.' + t))),
                    s[t]
                );
            };
        },
        function (t, e) {
            t.exports = function (t) {
                return 'object' == typeof t
                    ? null !== t
                    : 'function' == typeof t;
            };
        },
        function (t, e) {
            var n = {}.hasOwnProperty;
            t.exports = function (t, e) {
                return n.call(t, e);
            };
        },
        function (t, e) {
            t.exports = function (t) {
                try {
                    return !!t();
                } catch (t) {
                    return !0;
                }
            };
        },
        function (t, e, n) {
            var r = n(7),
                o = n(48),
                i = n(8),
                u = n(27),
                c = Object.defineProperty;
            e.f = r
                ? c
                : function (t, e, n) {
                      if ((i(t), (e = u(e, !0)), i(n), o))
                          try {
                              return c(t, e, n);
                          } catch (t) {}
                      if ('get' in n || 'set' in n)
                          throw TypeError('Accessors not supported');
                      return 'value' in n && (t[e] = n.value), t;
                  };
        },
        function (t, e, n) {
            var r = n(5);
            t.exports = !r(function () {
                return (
                    7 !=
                    Object.defineProperty({}, 1, {
                        get: function () {
                            return 7;
                        },
                    })[1]
                );
            });
        },
        function (t, e, n) {
            var r = n(3);
            t.exports = function (t) {
                if (!r(t)) throw TypeError(String(t) + ' is not an object');
                return t;
            };
        },
        function (t, e, n) {
            var r = n(7),
                o = n(6),
                i = n(15);
            t.exports = r
                ? function (t, e, n) {
                      return o.f(t, e, i(1, n));
                  }
                : function (t, e, n) {
                      return (t[e] = n), t;
                  };
        },
        function (t, e, n) {
            var r,
                o,
                i,
                u = n(52),
                c = n(1),
                a = n(3),
                s = n(9),
                f = n(4),
                l = n(29),
                p = n(17),
                h = c.WeakMap;
            if (u) {
                var d = new h(),
                    v = d.get,
                    y = d.has,
                    m = d.set;
                (r = function (t, e) {
                    return m.call(d, t, e), e;
                }),
                    (o = function (t) {
                        return v.call(d, t) || {};
                    }),
                    (i = function (t) {
                        return y.call(d, t);
                    });
            } else {
                var g = l('state');
                (p[g] = !0),
                    (r = function (t, e) {
                        return s(t, g, e), e;
                    }),
                    (o = function (t) {
                        return f(t, g) ? t[g] : {};
                    }),
                    (i = function (t) {
                        return f(t, g);
                    });
            }
            t.exports = {
                set: r,
                get: o,
                has: i,
                enforce: function (t) {
                    return i(t) ? o(t) : r(t, {});
                },
                getterFor: function (t) {
                    return function (e) {
                        var n;
                        if (!a(e) || (n = o(e)).type !== t)
                            throw TypeError(
                                'Incompatible receiver, ' + t + ' required'
                            );
                        return n;
                    };
                },
            };
        },
        function (t, e, n) {
            var r = n(1);
            t.exports = r;
        },
        function (t, e, n) {
            var r = n(1),
                o = n(9),
                i = n(4),
                u = n(28),
                c = n(50),
                a = n(10),
                s = a.get,
                f = a.enforce,
                l = String(String).split('String');
            (t.exports = function (t, e, n, c) {
                var a = !!c && !!c.unsafe,
                    s = !!c && !!c.enumerable,
                    p = !!c && !!c.noTargetGet;
                'function' == typeof n &&
                    ('string' != typeof e || i(n, 'name') || o(n, 'name', e),
                    (f(n).source = l.join('string' == typeof e ? e : ''))),
                    t !== r
                        ? (a ? !p && t[e] && (s = !0) : delete t[e],
                          s ? (t[e] = n) : o(t, e, n))
                        : s
                        ? (t[e] = n)
                        : u(e, n);
            })(Function.prototype, 'toString', function () {
                return ('function' == typeof this && s(this).source) || c(this);
            });
        },
        function (t, e) {
            t.exports = {};
        },
        function (t, e, n) {
            var r = n(1),
                o = n(46).f,
                i = n(9),
                u = n(12),
                c = n(28),
                a = n(71),
                s = n(56);
            t.exports = function (t, e) {
                var n,
                    f,
                    l,
                    p,
                    h,
                    d = t.target,
                    v = t.global,
                    y = t.stat;
                if ((n = v ? r : y ? r[d] || c(d, {}) : (r[d] || {}).prototype))
                    for (f in e) {
                        if (
                            ((p = e[f]),
                            (l = t.noTargetGet
                                ? (h = o(n, f)) && h.value
                                : n[f]),
                            !s(v ? f : d + (y ? '.' : '#') + f, t.forced) &&
                                void 0 !== l)
                        ) {
                            if (typeof p == typeof l) continue;
                            a(p, l);
                        }
                        (t.sham || (l && l.sham)) && i(p, 'sham', !0),
                            u(n, f, p, t);
                    }
            };
        },
        function (t, e) {
            t.exports = function (t, e) {
                return {
                    enumerable: !(1 & t),
                    configurable: !(2 & t),
                    writable: !(4 & t),
                    value: e,
                };
            };
        },
        function (t, e, n) {
            var r = n(24),
                o = n(26);
            t.exports = function (t) {
                return r(o(t));
            };
        },
        function (t, e) {
            t.exports = {};
        },
        function (t, e, n) {
            var r = n(33),
                o = Math.min;
            t.exports = function (t) {
                return t > 0 ? o(r(t), 9007199254740991) : 0;
            };
        },
        function (t, e, n) {
            var r = n(17),
                o = n(3),
                i = n(4),
                u = n(6).f,
                c = n(31),
                a = n(76),
                s = c('meta'),
                f = 0,
                l =
                    Object.isExtensible ||
                    function () {
                        return !0;
                    },
                p = function (t) {
                    u(t, s, { value: { objectID: 'O' + ++f, weakData: {} } });
                },
                h = (t.exports = {
                    REQUIRED: !1,
                    fastKey: function (t, e) {
                        if (!o(t))
                            return 'symbol' == typeof t
                                ? t
                                : ('string' == typeof t ? 'S' : 'P') + t;
                        if (!i(t, s)) {
                            if (!l(t)) return 'F';
                            if (!e) return 'E';
                            p(t);
                        }
                        return t[s].objectID;
                    },
                    getWeakData: function (t, e) {
                        if (!i(t, s)) {
                            if (!l(t)) return !0;
                            if (!e) return !1;
                            p(t);
                        }
                        return t[s].weakData;
                    },
                    onFreeze: function (t) {
                        return a && h.REQUIRED && l(t) && !i(t, s) && p(t), t;
                    },
                });
            r[s] = !0;
        },
        function (t, e, n) {
            var r = n(78);
            t.exports = function (t, e, n) {
                if ((r(t), void 0 === e)) return t;
                switch (n) {
                    case 0:
                        return function () {
                            return t.call(e);
                        };
                    case 1:
                        return function (n) {
                            return t.call(e, n);
                        };
                    case 2:
                        return function (n, r) {
                            return t.call(e, n, r);
                        };
                    case 3:
                        return function (n, r, o) {
                            return t.call(e, n, r, o);
                        };
                }
                return function () {
                    return t.apply(e, arguments);
                };
            };
        },
        function (t, e, n) {
            var r = n(26);
            t.exports = function (t) {
                return Object(r(t));
            };
        },
        function (t, e, n) {
            (function (e) {
                var n = /^\s+|\s+$/g,
                    r = /^[-+]0x[0-9a-f]+$/i,
                    o = /^0b[01]+$/i,
                    i = /^0o[0-7]+$/i,
                    u = parseInt,
                    c = 'object' == typeof e && e && e.Object === Object && e,
                    a =
                        'object' == typeof self &&
                        self &&
                        self.Object === Object &&
                        self,
                    s = c || a || Function('return this')(),
                    f = Object.prototype.toString,
                    l = Math.max,
                    p = Math.min,
                    h = function () {
                        return s.Date.now();
                    };
                function d(t) {
                    var e = typeof t;
                    return !!t && ('object' == e || 'function' == e);
                }
                function v(t) {
                    if ('number' == typeof t) return t;
                    if (
                        (function (t) {
                            return (
                                'symbol' == typeof t ||
                                ((function (t) {
                                    return !!t && 'object' == typeof t;
                                })(t) &&
                                    '[object Symbol]' == f.call(t))
                            );
                        })(t)
                    )
                        return NaN;
                    if (d(t)) {
                        var e =
                            'function' == typeof t.valueOf ? t.valueOf() : t;
                        t = d(e) ? e + '' : e;
                    }
                    if ('string' != typeof t) return 0 === t ? t : +t;
                    t = t.replace(n, '');
                    var c = o.test(t);
                    return c || i.test(t)
                        ? u(t.slice(2), c ? 2 : 8)
                        : r.test(t)
                        ? NaN
                        : +t;
                }
                t.exports = function (t, e, n) {
                    var r,
                        o,
                        i,
                        u,
                        c,
                        a,
                        s = 0,
                        f = !1,
                        y = !1,
                        m = !0;
                    if ('function' != typeof t)
                        throw new TypeError('Expected a function');
                    function g(e) {
                        var n = r,
                            i = o;
                        return (r = o = void 0), (s = e), (u = t.apply(i, n));
                    }
                    function b(t) {
                        var n = t - a;
                        return (
                            void 0 === a || n >= e || n < 0 || (y && t - s >= i)
                        );
                    }
                    function x() {
                        var t = h();
                        if (b(t)) return w(t);
                        c = setTimeout(
                            x,
                            (function (t) {
                                var n = e - (t - a);
                                return y ? p(n, i - (t - s)) : n;
                            })(t)
                        );
                    }
                    function w(t) {
                        return (
                            (c = void 0), m && r ? g(t) : ((r = o = void 0), u)
                        );
                    }
                    function S() {
                        var t = h(),
                            n = b(t);
                        if (((r = arguments), (o = this), (a = t), n)) {
                            if (void 0 === c)
                                return (function (t) {
                                    return (
                                        (s = t),
                                        (c = setTimeout(x, e)),
                                        f ? g(t) : u
                                    );
                                })(a);
                            if (y) return (c = setTimeout(x, e)), g(a);
                        }
                        return void 0 === c && (c = setTimeout(x, e)), u;
                    }
                    return (
                        (e = v(e) || 0),
                        d(n) &&
                            ((f = !!n.leading),
                            (i = (y = 'maxWait' in n)
                                ? l(v(n.maxWait) || 0, e)
                                : i),
                            (m = 'trailing' in n ? !!n.trailing : m)),
                        (S.cancel = function () {
                            void 0 !== c && clearTimeout(c),
                                (s = 0),
                                (r = a = o = c = void 0);
                        }),
                        (S.flush = function () {
                            return void 0 === c ? u : w(h());
                        }),
                        S
                    );
                };
            }).call(this, n(45));
        },
        function (t, e, n) {
            'use strict';
            var r = n(14),
                o = n(1),
                i = n(56),
                u = n(12),
                c = n(19),
                a = n(35),
                s = n(37),
                f = n(3),
                l = n(5),
                p = n(62),
                h = n(38),
                d = n(79);
            t.exports = function (t, e, n) {
                var v = -1 !== t.indexOf('Map'),
                    y = -1 !== t.indexOf('Weak'),
                    m = v ? 'set' : 'add',
                    g = o[t],
                    b = g && g.prototype,
                    x = g,
                    w = {},
                    S = function (t) {
                        var e = b[t];
                        u(
                            b,
                            t,
                            'add' == t
                                ? function (t) {
                                      return (
                                          e.call(this, 0 === t ? 0 : t), this
                                      );
                                  }
                                : 'delete' == t
                                ? function (t) {
                                      return (
                                          !(y && !f(t)) &&
                                          e.call(this, 0 === t ? 0 : t)
                                      );
                                  }
                                : 'get' == t
                                ? function (t) {
                                      return y && !f(t)
                                          ? void 0
                                          : e.call(this, 0 === t ? 0 : t);
                                  }
                                : 'has' == t
                                ? function (t) {
                                      return (
                                          !(y && !f(t)) &&
                                          e.call(this, 0 === t ? 0 : t)
                                      );
                                  }
                                : function (t, n) {
                                      return (
                                          e.call(this, 0 === t ? 0 : t, n), this
                                      );
                                  }
                        );
                    };
                if (
                    i(
                        t,
                        'function' != typeof g ||
                            !(
                                y ||
                                (b.forEach &&
                                    !l(function () {
                                        new g().entries().next();
                                    }))
                            )
                    )
                )
                    (x = n.getConstructor(e, t, v, m)), (c.REQUIRED = !0);
                else if (i(t, !0)) {
                    var O = new x(),
                        _ = O[m](y ? {} : -0, 1) != O,
                        E = l(function () {
                            O.has(1);
                        }),
                        T = p(function (t) {
                            new g(t);
                        }),
                        A =
                            !y &&
                            l(function () {
                                for (var t = new g(), e = 5; e--; ) t[m](e, e);
                                return !t.has(-0);
                            });
                    T ||
                        (((x = e(function (e, n) {
                            s(e, x, t);
                            var r = d(new g(), e, x);
                            return null != n && a(n, r[m], r, v), r;
                        })).prototype = b),
                        (b.constructor = x)),
                        (E || A) && (S('delete'), S('has'), v && S('get')),
                        (A || _) && S(m),
                        y && b.clear && delete b.clear;
                }
                return (
                    (w[t] = x),
                    r({ global: !0, forced: x != g }, w),
                    h(x, t),
                    y || n.setStrong(x, t, v),
                    x
                );
            };
        },
        function (t, e, n) {
            var r = n(5),
                o = n(25),
                i = ''.split;
            t.exports = r(function () {
                return !Object('z').propertyIsEnumerable(0);
            })
                ? function (t) {
                      return 'String' == o(t) ? i.call(t, '') : Object(t);
                  }
                : Object;
        },
        function (t, e) {
            var n = {}.toString;
            t.exports = function (t) {
                return n.call(t).slice(8, -1);
            };
        },
        function (t, e) {
            t.exports = function (t) {
                if (null == t) throw TypeError("Can't call method on " + t);
                return t;
            };
        },
        function (t, e, n) {
            var r = n(3);
            t.exports = function (t, e) {
                if (!r(t)) return t;
                var n, o;
                if (
                    e &&
                    'function' == typeof (n = t.toString) &&
                    !r((o = n.call(t)))
                )
                    return o;
                if ('function' == typeof (n = t.valueOf) && !r((o = n.call(t))))
                    return o;
                if (
                    !e &&
                    'function' == typeof (n = t.toString) &&
                    !r((o = n.call(t)))
                )
                    return o;
                throw TypeError("Can't convert object to primitive value");
            };
        },
        function (t, e, n) {
            var r = n(1),
                o = n(9);
            t.exports = function (t, e) {
                try {
                    o(r, t, e);
                } catch (n) {
                    r[t] = e;
                }
                return e;
            };
        },
        function (t, e, n) {
            var r = n(53),
                o = n(31),
                i = r('keys');
            t.exports = function (t) {
                return i[t] || (i[t] = o(t));
            };
        },
        function (t, e) {
            t.exports = !1;
        },
        function (t, e) {
            var n = 0,
                r = Math.random();
            t.exports = function (t) {
                return (
                    'Symbol(' +
                    String(void 0 === t ? '' : t) +
                    ')_' +
                    (++n + r).toString(36)
                );
            };
        },
        function (t, e, n) {
            var r = n(11),
                o = n(1),
                i = function (t) {
                    return 'function' == typeof t ? t : void 0;
                };
            t.exports = function (t, e) {
                return arguments.length < 2
                    ? i(r[t]) || i(o[t])
                    : (r[t] && r[t][e]) || (o[t] && o[t][e]);
            };
        },
        function (t, e) {
            var n = Math.ceil,
                r = Math.floor;
            t.exports = function (t) {
                return isNaN((t = +t)) ? 0 : (t > 0 ? r : n)(t);
            };
        },
        function (t, e) {
            t.exports = [
                'constructor',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'toLocaleString',
                'toString',
                'valueOf',
            ];
        },
        function (t, e, n) {
            var r = n(8),
                o = n(57),
                i = n(18),
                u = n(20),
                c = n(59),
                a = n(61),
                s = function (t, e) {
                    (this.stopped = t), (this.result = e);
                };
            (t.exports = function (t, e, n, f, l) {
                var p,
                    h,
                    d,
                    v,
                    y,
                    m,
                    g,
                    b = u(e, n, f ? 2 : 1);
                if (l) p = t;
                else {
                    if ('function' != typeof (h = c(t)))
                        throw TypeError('Target is not iterable');
                    if (o(h)) {
                        for (d = 0, v = i(t.length); v > d; d++)
                            if (
                                (y = f ? b(r((g = t[d]))[0], g[1]) : b(t[d])) &&
                                y instanceof s
                            )
                                return y;
                        return new s(!1);
                    }
                    p = h.call(t);
                }
                for (m = p.next; !(g = m.call(p)).done; )
                    if (
                        'object' == typeof (y = a(p, b, g.value, f)) &&
                        y &&
                        y instanceof s
                    )
                        return y;
                return new s(!1);
            }).stop = function (t) {
                return new s(!0, t);
            };
        },
        function (t, e, n) {
            var r = {};
            (r[n(2)('toStringTag')] = 'z'),
                (t.exports = '[object z]' === String(r));
        },
        function (t, e) {
            t.exports = function (t, e, n) {
                if (!(t instanceof e))
                    throw TypeError(
                        'Incorrect ' + (n ? n + ' ' : '') + 'invocation'
                    );
                return t;
            };
        },
        function (t, e, n) {
            var r = n(6).f,
                o = n(4),
                i = n(2)('toStringTag');
            t.exports = function (t, e, n) {
                t &&
                    !o((t = n ? t : t.prototype), i) &&
                    r(t, i, { configurable: !0, value: e });
            };
        },
        function (t, e, n) {
            var r,
                o = n(8),
                i = n(81),
                u = n(34),
                c = n(17),
                a = n(82),
                s = n(49),
                f = n(29)('IE_PROTO'),
                l = function () {},
                p = function (t) {
                    return '<script>' + t + '</script>';
                },
                h = function () {
                    try {
                        r = document.domain && new ActiveXObject('htmlfile');
                    } catch (t) {}
                    h = r
                        ? (function (t) {
                              t.write(p('')), t.close();
                              var e = t.parentWindow.Object;
                              return (t = null), e;
                          })(r)
                        : (function () {
                              var t,
                                  e = s('iframe');
                              return (
                                  (e.style.display = 'none'),
                                  a.appendChild(e),
                                  (e.src = String('javascript:')),
                                  (t = e.contentWindow.document).open(),
                                  t.write(p('document.F=Object')),
                                  t.close(),
                                  t.F
                              );
                          })();
                    for (var t = u.length; t--; ) delete h.prototype[u[t]];
                    return h();
                };
            (c[f] = !0),
                (t.exports =
                    Object.create ||
                    function (t, e) {
                        var n;
                        return (
                            null !== t
                                ? ((l.prototype = o(t)),
                                  (n = new l()),
                                  (l.prototype = null),
                                  (n[f] = t))
                                : (n = h()),
                            void 0 === e ? n : i(n, e)
                        );
                    });
        },
        function (t, e, n) {
            var r = n(12);
            t.exports = function (t, e, n) {
                for (var o in e) r(t, o, e[o], n);
                return t;
            };
        },
        function (t, e, n) {
            'use strict';
            var r = n(14),
                o = n(83),
                i = n(67),
                u = n(63),
                c = n(38),
                a = n(9),
                s = n(12),
                f = n(2),
                l = n(30),
                p = n(13),
                h = n(66),
                d = h.IteratorPrototype,
                v = h.BUGGY_SAFARI_ITERATORS,
                y = f('iterator'),
                m = function () {
                    return this;
                };
            t.exports = function (t, e, n, f, h, g, b) {
                o(n, e, f);
                var x,
                    w,
                    S,
                    O = function (t) {
                        if (t === h && j) return j;
                        if (!v && t in T) return T[t];
                        switch (t) {
                            case 'keys':
                            case 'values':
                            case 'entries':
                                return function () {
                                    return new n(this, t);
                                };
                        }
                        return function () {
                            return new n(this);
                        };
                    },
                    _ = e + ' Iterator',
                    E = !1,
                    T = t.prototype,
                    A = T[y] || T['@@iterator'] || (h && T[h]),
                    j = (!v && A) || O(h),
                    P = ('Array' == e && T.entries) || A;
                if (
                    (P &&
                        ((x = i(P.call(new t()))),
                        d !== Object.prototype &&
                            x.next &&
                            (l ||
                                i(x) === d ||
                                (u
                                    ? u(x, d)
                                    : 'function' != typeof x[y] && a(x, y, m)),
                            c(x, _, !0, !0),
                            l && (p[_] = m))),
                    'values' == h &&
                        A &&
                        'values' !== A.name &&
                        ((E = !0),
                        (j = function () {
                            return A.call(this);
                        })),
                    (l && !b) || T[y] === j || a(T, y, j),
                    (p[e] = j),
                    h)
                )
                    if (
                        ((w = {
                            values: O('values'),
                            keys: g ? j : O('keys'),
                            entries: O('entries'),
                        }),
                        b)
                    )
                        for (S in w) (!v && !E && S in T) || s(T, S, w[S]);
                    else r({ target: e, proto: !0, forced: v || E }, w);
                return w;
            };
        },
        function (t, e, n) {
            var r = n(36),
                o = n(12),
                i = n(86);
            r || o(Object.prototype, 'toString', i, { unsafe: !0 });
        },
        function (t, e, n) {
            'use strict';
            var r = n(87).charAt,
                o = n(10),
                i = n(41),
                u = o.set,
                c = o.getterFor('String Iterator');
            i(
                String,
                'String',
                function (t) {
                    u(this, {
                        type: 'String Iterator',
                        string: String(t),
                        index: 0,
                    });
                },
                function () {
                    var t,
                        e = c(this),
                        n = e.string,
                        o = e.index;
                    return o >= n.length
                        ? { value: void 0, done: !0 }
                        : ((t = r(n, o)),
                          (e.index += t.length),
                          { value: t, done: !1 });
                }
            );
        },
        function (t, e, n) {
            var r = n(1),
                o = n(88),
                i = n(89),
                u = n(9),
                c = n(2),
                a = c('iterator'),
                s = c('toStringTag'),
                f = i.values;
            for (var l in o) {
                var p = r[l],
                    h = p && p.prototype;
                if (h) {
                    if (h[a] !== f)
                        try {
                            u(h, a, f);
                        } catch (t) {
                            h[a] = f;
                        }
                    if ((h[s] || u(h, s, l), o[l]))
                        for (var d in i)
                            if (h[d] !== i[d])
                                try {
                                    u(h, d, i[d]);
                                } catch (t) {
                                    h[d] = i[d];
                                }
                }
            }
        },
        function (t, e) {
            var n;
            n = (function () {
                return this;
            })();
            try {
                n = n || new Function('return this')();
            } catch (t) {
                'object' == typeof window && (n = window);
            }
            t.exports = n;
        },
        function (t, e, n) {
            var r = n(7),
                o = n(47),
                i = n(15),
                u = n(16),
                c = n(27),
                a = n(4),
                s = n(48),
                f = Object.getOwnPropertyDescriptor;
            e.f = r
                ? f
                : function (t, e) {
                      if (((t = u(t)), (e = c(e, !0)), s))
                          try {
                              return f(t, e);
                          } catch (t) {}
                      if (a(t, e)) return i(!o.f.call(t, e), t[e]);
                  };
        },
        function (t, e, n) {
            'use strict';
            var r = {}.propertyIsEnumerable,
                o = Object.getOwnPropertyDescriptor,
                i = o && !r.call({ 1: 2 }, 1);
            e.f = i
                ? function (t) {
                      var e = o(this, t);
                      return !!e && e.enumerable;
                  }
                : r;
        },
        function (t, e, n) {
            var r = n(7),
                o = n(5),
                i = n(49);
            t.exports =
                !r &&
                !o(function () {
                    return (
                        7 !=
                        Object.defineProperty(i('div'), 'a', {
                            get: function () {
                                return 7;
                            },
                        }).a
                    );
                });
        },
        function (t, e, n) {
            var r = n(1),
                o = n(3),
                i = r.document,
                u = o(i) && o(i.createElement);
            t.exports = function (t) {
                return u ? i.createElement(t) : {};
            };
        },
        function (t, e, n) {
            var r = n(51),
                o = Function.toString;
            'function' != typeof r.inspectSource &&
                (r.inspectSource = function (t) {
                    return o.call(t);
                }),
                (t.exports = r.inspectSource);
        },
        function (t, e, n) {
            var r = n(1),
                o = n(28),
                i = r['__core-js_shared__'] || o('__core-js_shared__', {});
            t.exports = i;
        },
        function (t, e, n) {
            var r = n(1),
                o = n(50),
                i = r.WeakMap;
            t.exports = 'function' == typeof i && /native code/.test(o(i));
        },
        function (t, e, n) {
            var r = n(30),
                o = n(51);
            (t.exports = function (t, e) {
                return o[t] || (o[t] = void 0 !== e ? e : {});
            })('versions', []).push({
                version: '3.6.4',
                mode: r ? 'pure' : 'global',
                copyright: '© 2020 Denis Pushkarev (zloirock.ru)',
            });
        },
        function (t, e, n) {
            var r = n(4),
                o = n(16),
                i = n(74).indexOf,
                u = n(17);
            t.exports = function (t, e) {
                var n,
                    c = o(t),
                    a = 0,
                    s = [];
                for (n in c) !r(u, n) && r(c, n) && s.push(n);
                for (; e.length > a; )
                    r(c, (n = e[a++])) && (~i(s, n) || s.push(n));
                return s;
            };
        },
        function (t, e) {
            e.f = Object.getOwnPropertySymbols;
        },
        function (t, e, n) {
            var r = n(5),
                o = /#|\.prototype\./,
                i = function (t, e) {
                    var n = c[u(t)];
                    return (
                        n == s ||
                        (n != a && ('function' == typeof e ? r(e) : !!e))
                    );
                },
                u = (i.normalize = function (t) {
                    return String(t).replace(o, '.').toLowerCase();
                }),
                c = (i.data = {}),
                a = (i.NATIVE = 'N'),
                s = (i.POLYFILL = 'P');
            t.exports = i;
        },
        function (t, e, n) {
            var r = n(2),
                o = n(13),
                i = r('iterator'),
                u = Array.prototype;
            t.exports = function (t) {
                return void 0 !== t && (o.Array === t || u[i] === t);
            };
        },
        function (t, e, n) {
            var r = n(5);
            t.exports =
                !!Object.getOwnPropertySymbols &&
                !r(function () {
                    return !String(Symbol());
                });
        },
        function (t, e, n) {
            var r = n(60),
                o = n(13),
                i = n(2)('iterator');
            t.exports = function (t) {
                if (null != t) return t[i] || t['@@iterator'] || o[r(t)];
            };
        },
        function (t, e, n) {
            var r = n(36),
                o = n(25),
                i = n(2)('toStringTag'),
                u =
                    'Arguments' ==
                    o(
                        (function () {
                            return arguments;
                        })()
                    );
            t.exports = r
                ? o
                : function (t) {
                      var e, n, r;
                      return void 0 === t
                          ? 'Undefined'
                          : null === t
                          ? 'Null'
                          : 'string' ==
                            typeof (n = (function (t, e) {
                                try {
                                    return t[e];
                                } catch (t) {}
                            })((e = Object(t)), i))
                          ? n
                          : u
                          ? o(e)
                          : 'Object' == (r = o(e)) &&
                            'function' == typeof e.callee
                          ? 'Arguments'
                          : r;
                  };
        },
        function (t, e, n) {
            var r = n(8);
            t.exports = function (t, e, n, o) {
                try {
                    return o ? e(r(n)[0], n[1]) : e(n);
                } catch (e) {
                    var i = t.return;
                    throw (void 0 !== i && r(i.call(t)), e);
                }
            };
        },
        function (t, e, n) {
            var r = n(2)('iterator'),
                o = !1;
            try {
                var i = 0,
                    u = {
                        next: function () {
                            return { done: !!i++ };
                        },
                        return: function () {
                            o = !0;
                        },
                    };
                (u[r] = function () {
                    return this;
                }),
                    Array.from(u, function () {
                        throw 2;
                    });
            } catch (t) {}
            t.exports = function (t, e) {
                if (!e && !o) return !1;
                var n = !1;
                try {
                    var i = {};
                    (i[r] = function () {
                        return {
                            next: function () {
                                return { done: (n = !0) };
                            },
                        };
                    }),
                        t(i);
                } catch (t) {}
                return n;
            };
        },
        function (t, e, n) {
            var r = n(8),
                o = n(80);
            t.exports =
                Object.setPrototypeOf ||
                ('__proto__' in {}
                    ? (function () {
                          var t,
                              e = !1,
                              n = {};
                          try {
                              (t = Object.getOwnPropertyDescriptor(
                                  Object.prototype,
                                  '__proto__'
                              ).set).call(n, []),
                                  (e = n instanceof Array);
                          } catch (t) {}
                          return function (n, i) {
                              return (
                                  r(n),
                                  o(i),
                                  e ? t.call(n, i) : (n.__proto__ = i),
                                  n
                              );
                          };
                      })()
                    : void 0);
        },
        function (t, e, n) {
            'use strict';
            var r = n(6).f,
                o = n(39),
                i = n(40),
                u = n(20),
                c = n(37),
                a = n(35),
                s = n(41),
                f = n(85),
                l = n(7),
                p = n(19).fastKey,
                h = n(10),
                d = h.set,
                v = h.getterFor;
            t.exports = {
                getConstructor: function (t, e, n, s) {
                    var f = t(function (t, r) {
                            c(t, f, e),
                                d(t, {
                                    type: e,
                                    index: o(null),
                                    first: void 0,
                                    last: void 0,
                                    size: 0,
                                }),
                                l || (t.size = 0),
                                null != r && a(r, t[s], t, n);
                        }),
                        h = v(e),
                        y = function (t, e, n) {
                            var r,
                                o,
                                i = h(t),
                                u = m(t, e);
                            return (
                                u
                                    ? (u.value = n)
                                    : ((i.last = u =
                                          {
                                              index: (o = p(e, !0)),
                                              key: e,
                                              value: n,
                                              previous: (r = i.last),
                                              next: void 0,
                                              removed: !1,
                                          }),
                                      i.first || (i.first = u),
                                      r && (r.next = u),
                                      l ? i.size++ : t.size++,
                                      'F' !== o && (i.index[o] = u)),
                                t
                            );
                        },
                        m = function (t, e) {
                            var n,
                                r = h(t),
                                o = p(e);
                            if ('F' !== o) return r.index[o];
                            for (n = r.first; n; n = n.next)
                                if (n.key == e) return n;
                        };
                    return (
                        i(f.prototype, {
                            clear: function () {
                                for (
                                    var t = h(this), e = t.index, n = t.first;
                                    n;

                                )
                                    (n.removed = !0),
                                        n.previous &&
                                            (n.previous = n.previous.next =
                                                void 0),
                                        delete e[n.index],
                                        (n = n.next);
                                (t.first = t.last = void 0),
                                    l ? (t.size = 0) : (this.size = 0);
                            },
                            delete: function (t) {
                                var e = h(this),
                                    n = m(this, t);
                                if (n) {
                                    var r = n.next,
                                        o = n.previous;
                                    delete e.index[n.index],
                                        (n.removed = !0),
                                        o && (o.next = r),
                                        r && (r.previous = o),
                                        e.first == n && (e.first = r),
                                        e.last == n && (e.last = o),
                                        l ? e.size-- : this.size--;
                                }
                                return !!n;
                            },
                            forEach: function (t) {
                                for (
                                    var e,
                                        n = h(this),
                                        r = u(
                                            t,
                                            arguments.length > 1
                                                ? arguments[1]
                                                : void 0,
                                            3
                                        );
                                    (e = e ? e.next : n.first);

                                )
                                    for (
                                        r(e.value, e.key, this);
                                        e && e.removed;

                                    )
                                        e = e.previous;
                            },
                            has: function (t) {
                                return !!m(this, t);
                            },
                        }),
                        i(
                            f.prototype,
                            n
                                ? {
                                      get: function (t) {
                                          var e = m(this, t);
                                          return e && e.value;
                                      },
                                      set: function (t, e) {
                                          return y(this, 0 === t ? 0 : t, e);
                                      },
                                  }
                                : {
                                      add: function (t) {
                                          return y(
                                              this,
                                              (t = 0 === t ? 0 : t),
                                              t
                                          );
                                      },
                                  }
                        ),
                        l &&
                            r(f.prototype, 'size', {
                                get: function () {
                                    return h(this).size;
                                },
                            }),
                        f
                    );
                },
                setStrong: function (t, e, n) {
                    var r = e + ' Iterator',
                        o = v(e),
                        i = v(r);
                    s(
                        t,
                        e,
                        function (t, e) {
                            d(this, {
                                type: r,
                                target: t,
                                state: o(t),
                                kind: e,
                                last: void 0,
                            });
                        },
                        function () {
                            for (
                                var t = i(this), e = t.kind, n = t.last;
                                n && n.removed;

                            )
                                n = n.previous;
                            return t.target &&
                                (t.last = n = n ? n.next : t.state.first)
                                ? 'keys' == e
                                    ? { value: n.key, done: !1 }
                                    : 'values' == e
                                    ? { value: n.value, done: !1 }
                                    : { value: [n.key, n.value], done: !1 }
                                : ((t.target = void 0),
                                  { value: void 0, done: !0 });
                        },
                        n ? 'entries' : 'values',
                        !n,
                        !0
                    ),
                        f(e);
                },
            };
        },
        function (t, e, n) {
            var r = n(54),
                o = n(34);
            t.exports =
                Object.keys ||
                function (t) {
                    return r(t, o);
                };
        },
        function (t, e, n) {
            'use strict';
            var r,
                o,
                i,
                u = n(67),
                c = n(9),
                a = n(4),
                s = n(2),
                f = n(30),
                l = s('iterator'),
                p = !1;
            [].keys &&
                ('next' in (i = [].keys())
                    ? (o = u(u(i))) !== Object.prototype && (r = o)
                    : (p = !0)),
                null == r && (r = {}),
                f ||
                    a(r, l) ||
                    c(r, l, function () {
                        return this;
                    }),
                (t.exports = {
                    IteratorPrototype: r,
                    BUGGY_SAFARI_ITERATORS: p,
                });
        },
        function (t, e, n) {
            var r = n(4),
                o = n(21),
                i = n(29),
                u = n(84),
                c = i('IE_PROTO'),
                a = Object.prototype;
            t.exports = u
                ? Object.getPrototypeOf
                : function (t) {
                      return (
                          (t = o(t)),
                          r(t, c)
                              ? t[c]
                              : 'function' == typeof t.constructor &&
                                t instanceof t.constructor
                              ? t.constructor.prototype
                              : t instanceof Object
                              ? a
                              : null
                      );
                  };
        },
        function (t, e, n) {
            t.exports = n(106);
        },
        function (t, e, n) {
            n(70), n(42), n(43), n(44);
            var r = n(11);
            t.exports = r.Map;
        },
        function (t, e, n) {
            'use strict';
            var r = n(23),
                o = n(64);
            t.exports = r(
                'Map',
                function (t) {
                    return function () {
                        return t(
                            this,
                            arguments.length ? arguments[0] : void 0
                        );
                    };
                },
                o
            );
        },
        function (t, e, n) {
            var r = n(4),
                o = n(72),
                i = n(46),
                u = n(6);
            t.exports = function (t, e) {
                for (var n = o(e), c = u.f, a = i.f, s = 0; s < n.length; s++) {
                    var f = n[s];
                    r(t, f) || c(t, f, a(e, f));
                }
            };
        },
        function (t, e, n) {
            var r = n(32),
                o = n(73),
                i = n(55),
                u = n(8);
            t.exports =
                r('Reflect', 'ownKeys') ||
                function (t) {
                    var e = o.f(u(t)),
                        n = i.f;
                    return n ? e.concat(n(t)) : e;
                };
        },
        function (t, e, n) {
            var r = n(54),
                o = n(34).concat('length', 'prototype');
            e.f =
                Object.getOwnPropertyNames ||
                function (t) {
                    return r(t, o);
                };
        },
        function (t, e, n) {
            var r = n(16),
                o = n(18),
                i = n(75),
                u = function (t) {
                    return function (e, n, u) {
                        var c,
                            a = r(e),
                            s = o(a.length),
                            f = i(u, s);
                        if (t && n != n) {
                            for (; s > f; ) if ((c = a[f++]) != c) return !0;
                        } else
                            for (; s > f; f++)
                                if ((t || f in a) && a[f] === n)
                                    return t || f || 0;
                        return !t && -1;
                    };
                };
            t.exports = { includes: u(!0), indexOf: u(!1) };
        },
        function (t, e, n) {
            var r = n(33),
                o = Math.max,
                i = Math.min;
            t.exports = function (t, e) {
                var n = r(t);
                return n < 0 ? o(n + e, 0) : i(n, e);
            };
        },
        function (t, e, n) {
            var r = n(5);
            t.exports = !r(function () {
                return Object.isExtensible(Object.preventExtensions({}));
            });
        },
        function (t, e, n) {
            var r = n(58);
            t.exports = r && !Symbol.sham && 'symbol' == typeof Symbol.iterator;
        },
        function (t, e) {
            t.exports = function (t) {
                if ('function' != typeof t)
                    throw TypeError(String(t) + ' is not a function');
                return t;
            };
        },
        function (t, e, n) {
            var r = n(3),
                o = n(63);
            t.exports = function (t, e, n) {
                var i, u;
                return (
                    o &&
                        'function' == typeof (i = e.constructor) &&
                        i !== n &&
                        r((u = i.prototype)) &&
                        u !== n.prototype &&
                        o(t, u),
                    t
                );
            };
        },
        function (t, e, n) {
            var r = n(3);
            t.exports = function (t) {
                if (!r(t) && null !== t)
                    throw TypeError(
                        "Can't set " + String(t) + ' as a prototype'
                    );
                return t;
            };
        },
        function (t, e, n) {
            var r = n(7),
                o = n(6),
                i = n(8),
                u = n(65);
            t.exports = r
                ? Object.defineProperties
                : function (t, e) {
                      i(t);
                      for (var n, r = u(e), c = r.length, a = 0; c > a; )
                          o.f(t, (n = r[a++]), e[n]);
                      return t;
                  };
        },
        function (t, e, n) {
            var r = n(32);
            t.exports = r('document', 'documentElement');
        },
        function (t, e, n) {
            'use strict';
            var r = n(66).IteratorPrototype,
                o = n(39),
                i = n(15),
                u = n(38),
                c = n(13),
                a = function () {
                    return this;
                };
            t.exports = function (t, e, n) {
                var s = e + ' Iterator';
                return (
                    (t.prototype = o(r, { next: i(1, n) })),
                    u(t, s, !1, !0),
                    (c[s] = a),
                    t
                );
            };
        },
        function (t, e, n) {
            var r = n(5);
            t.exports = !r(function () {
                function t() {}
                return (
                    (t.prototype.constructor = null),
                    Object.getPrototypeOf(new t()) !== t.prototype
                );
            });
        },
        function (t, e, n) {
            'use strict';
            var r = n(32),
                o = n(6),
                i = n(2),
                u = n(7),
                c = i('species');
            t.exports = function (t) {
                var e = r(t),
                    n = o.f;
                u &&
                    e &&
                    !e[c] &&
                    n(e, c, {
                        configurable: !0,
                        get: function () {
                            return this;
                        },
                    });
            };
        },
        function (t, e, n) {
            'use strict';
            var r = n(36),
                o = n(60);
            t.exports = r
                ? {}.toString
                : function () {
                      return '[object ' + o(this) + ']';
                  };
        },
        function (t, e, n) {
            var r = n(33),
                o = n(26),
                i = function (t) {
                    return function (e, n) {
                        var i,
                            u,
                            c = String(o(e)),
                            a = r(n),
                            s = c.length;
                        return a < 0 || a >= s
                            ? t
                                ? ''
                                : void 0
                            : (i = c.charCodeAt(a)) < 55296 ||
                              i > 56319 ||
                              a + 1 === s ||
                              (u = c.charCodeAt(a + 1)) < 56320 ||
                              u > 57343
                            ? t
                                ? c.charAt(a)
                                : i
                            : t
                            ? c.slice(a, a + 2)
                            : u - 56320 + ((i - 55296) << 10) + 65536;
                    };
                };
            t.exports = { codeAt: i(!1), charAt: i(!0) };
        },
        function (t, e) {
            t.exports = {
                CSSRuleList: 0,
                CSSStyleDeclaration: 0,
                CSSValueList: 0,
                ClientRectList: 0,
                DOMRectList: 0,
                DOMStringList: 0,
                DOMTokenList: 1,
                DataTransferItemList: 0,
                FileList: 0,
                HTMLAllCollection: 0,
                HTMLCollection: 0,
                HTMLFormElement: 0,
                HTMLSelectElement: 0,
                MediaList: 0,
                MimeTypeArray: 0,
                NamedNodeMap: 0,
                NodeList: 1,
                PaintRequestList: 0,
                Plugin: 0,
                PluginArray: 0,
                SVGLengthList: 0,
                SVGNumberList: 0,
                SVGPathSegList: 0,
                SVGPointList: 0,
                SVGStringList: 0,
                SVGTransformList: 0,
                SourceBufferList: 0,
                StyleSheetList: 0,
                TextTrackCueList: 0,
                TextTrackList: 0,
                TouchList: 0,
            };
        },
        function (t, e, n) {
            'use strict';
            var r = n(16),
                o = n(90),
                i = n(13),
                u = n(10),
                c = n(41),
                a = u.set,
                s = u.getterFor('Array Iterator');
            (t.exports = c(
                Array,
                'Array',
                function (t, e) {
                    a(this, {
                        type: 'Array Iterator',
                        target: r(t),
                        index: 0,
                        kind: e,
                    });
                },
                function () {
                    var t = s(this),
                        e = t.target,
                        n = t.kind,
                        r = t.index++;
                    return !e || r >= e.length
                        ? ((t.target = void 0), { value: void 0, done: !0 })
                        : 'keys' == n
                        ? { value: r, done: !1 }
                        : 'values' == n
                        ? { value: e[r], done: !1 }
                        : { value: [r, e[r]], done: !1 };
                },
                'values'
            )),
                (i.Arguments = i.Array),
                o('keys'),
                o('values'),
                o('entries');
        },
        function (t, e, n) {
            var r = n(2),
                o = n(39),
                i = n(6),
                u = r('unscopables'),
                c = Array.prototype;
            null == c[u] && i.f(c, u, { configurable: !0, value: o(null) }),
                (t.exports = function (t) {
                    c[u][t] = !0;
                });
        },
        function (t, e, n) {
            n(92), n(42), n(43), n(44);
            var r = n(11);
            t.exports = r.Set;
        },
        function (t, e, n) {
            'use strict';
            var r = n(23),
                o = n(64);
            t.exports = r(
                'Set',
                function (t) {
                    return function () {
                        return t(
                            this,
                            arguments.length ? arguments[0] : void 0
                        );
                    };
                },
                o
            );
        },
        function (t, e, n) {
            n(42), n(94), n(44);
            var r = n(11);
            t.exports = r.WeakMap;
        },
        function (t, e, n) {
            'use strict';
            var r,
                o = n(1),
                i = n(40),
                u = n(19),
                c = n(23),
                a = n(95),
                s = n(3),
                f = n(10).enforce,
                l = n(52),
                p = !o.ActiveXObject && 'ActiveXObject' in o,
                h = Object.isExtensible,
                d = function (t) {
                    return function () {
                        return t(
                            this,
                            arguments.length ? arguments[0] : void 0
                        );
                    };
                },
                v = (t.exports = c('WeakMap', d, a));
            if (l && p) {
                (r = a.getConstructor(d, 'WeakMap', !0)), (u.REQUIRED = !0);
                var y = v.prototype,
                    m = y.delete,
                    g = y.has,
                    b = y.get,
                    x = y.set;
                i(y, {
                    delete: function (t) {
                        if (s(t) && !h(t)) {
                            var e = f(this);
                            return (
                                e.frozen || (e.frozen = new r()),
                                m.call(this, t) || e.frozen.delete(t)
                            );
                        }
                        return m.call(this, t);
                    },
                    has: function (t) {
                        if (s(t) && !h(t)) {
                            var e = f(this);
                            return (
                                e.frozen || (e.frozen = new r()),
                                g.call(this, t) || e.frozen.has(t)
                            );
                        }
                        return g.call(this, t);
                    },
                    get: function (t) {
                        if (s(t) && !h(t)) {
                            var e = f(this);
                            return (
                                e.frozen || (e.frozen = new r()),
                                g.call(this, t)
                                    ? b.call(this, t)
                                    : e.frozen.get(t)
                            );
                        }
                        return b.call(this, t);
                    },
                    set: function (t, e) {
                        if (s(t) && !h(t)) {
                            var n = f(this);
                            n.frozen || (n.frozen = new r()),
                                g.call(this, t)
                                    ? x.call(this, t, e)
                                    : n.frozen.set(t, e);
                        } else x.call(this, t, e);
                        return this;
                    },
                });
            }
        },
        function (t, e, n) {
            'use strict';
            var r = n(40),
                o = n(19).getWeakData,
                i = n(8),
                u = n(3),
                c = n(37),
                a = n(35),
                s = n(96),
                f = n(4),
                l = n(10),
                p = l.set,
                h = l.getterFor,
                d = s.find,
                v = s.findIndex,
                y = 0,
                m = function (t) {
                    return t.frozen || (t.frozen = new g());
                },
                g = function () {
                    this.entries = [];
                },
                b = function (t, e) {
                    return d(t.entries, function (t) {
                        return t[0] === e;
                    });
                };
            (g.prototype = {
                get: function (t) {
                    var e = b(this, t);
                    if (e) return e[1];
                },
                has: function (t) {
                    return !!b(this, t);
                },
                set: function (t, e) {
                    var n = b(this, t);
                    n ? (n[1] = e) : this.entries.push([t, e]);
                },
                delete: function (t) {
                    var e = v(this.entries, function (e) {
                        return e[0] === t;
                    });
                    return ~e && this.entries.splice(e, 1), !!~e;
                },
            }),
                (t.exports = {
                    getConstructor: function (t, e, n, s) {
                        var l = t(function (t, r) {
                                c(t, l, e),
                                    p(t, { type: e, id: y++, frozen: void 0 }),
                                    null != r && a(r, t[s], t, n);
                            }),
                            d = h(e),
                            v = function (t, e, n) {
                                var r = d(t),
                                    u = o(i(e), !0);
                                return (
                                    !0 === u ? m(r).set(e, n) : (u[r.id] = n), t
                                );
                            };
                        return (
                            r(l.prototype, {
                                delete: function (t) {
                                    var e = d(this);
                                    if (!u(t)) return !1;
                                    var n = o(t);
                                    return !0 === n
                                        ? m(e).delete(t)
                                        : n && f(n, e.id) && delete n[e.id];
                                },
                                has: function (t) {
                                    var e = d(this);
                                    if (!u(t)) return !1;
                                    var n = o(t);
                                    return !0 === n
                                        ? m(e).has(t)
                                        : n && f(n, e.id);
                                },
                            }),
                            r(
                                l.prototype,
                                n
                                    ? {
                                          get: function (t) {
                                              var e = d(this);
                                              if (u(t)) {
                                                  var n = o(t);
                                                  return !0 === n
                                                      ? m(e).get(t)
                                                      : n
                                                      ? n[e.id]
                                                      : void 0;
                                              }
                                          },
                                          set: function (t, e) {
                                              return v(this, t, e);
                                          },
                                      }
                                    : {
                                          add: function (t) {
                                              return v(this, t, !0);
                                          },
                                      }
                            ),
                            l
                        );
                    },
                });
        },
        function (t, e, n) {
            var r = n(20),
                o = n(24),
                i = n(21),
                u = n(18),
                c = n(97),
                a = [].push,
                s = function (t) {
                    var e = 1 == t,
                        n = 2 == t,
                        s = 3 == t,
                        f = 4 == t,
                        l = 6 == t,
                        p = 5 == t || l;
                    return function (h, d, v, y) {
                        for (
                            var m,
                                g,
                                b = i(h),
                                x = o(b),
                                w = r(d, v, 3),
                                S = u(x.length),
                                O = 0,
                                _ = y || c,
                                E = e ? _(h, S) : n ? _(h, 0) : void 0;
                            S > O;
                            O++
                        )
                            if ((p || O in x) && ((g = w((m = x[O]), O, b)), t))
                                if (e) E[O] = g;
                                else if (g)
                                    switch (t) {
                                        case 3:
                                            return !0;
                                        case 5:
                                            return m;
                                        case 6:
                                            return O;
                                        case 2:
                                            a.call(E, m);
                                    }
                                else if (f) return !1;
                        return l ? -1 : s || f ? f : E;
                    };
                };
            t.exports = {
                forEach: s(0),
                map: s(1),
                filter: s(2),
                some: s(3),
                every: s(4),
                find: s(5),
                findIndex: s(6),
            };
        },
        function (t, e, n) {
            var r = n(3),
                o = n(98),
                i = n(2)('species');
            t.exports = function (t, e) {
                var n;
                return (
                    o(t) &&
                        ('function' != typeof (n = t.constructor) ||
                        (n !== Array && !o(n.prototype))
                            ? r(n) && null === (n = n[i]) && (n = void 0)
                            : (n = void 0)),
                    new (void 0 === n ? Array : n)(0 === e ? 0 : e)
                );
            };
        },
        function (t, e, n) {
            var r = n(25);
            t.exports =
                Array.isArray ||
                function (t) {
                    return 'Array' == r(t);
                };
        },
        function (t, e, n) {
            n(43), n(100);
            var r = n(11);
            t.exports = r.Array.from;
        },
        function (t, e, n) {
            var r = n(14),
                o = n(101);
            r(
                {
                    target: 'Array',
                    stat: !0,
                    forced: !n(62)(function (t) {
                        Array.from(t);
                    }),
                },
                { from: o }
            );
        },
        function (t, e, n) {
            'use strict';
            var r = n(20),
                o = n(21),
                i = n(61),
                u = n(57),
                c = n(18),
                a = n(102),
                s = n(59);
            t.exports = function (t) {
                var e,
                    n,
                    f,
                    l,
                    p,
                    h,
                    d = o(t),
                    v = 'function' == typeof this ? this : Array,
                    y = arguments.length,
                    m = y > 1 ? arguments[1] : void 0,
                    g = void 0 !== m,
                    b = s(d),
                    x = 0;
                if (
                    (g && (m = r(m, y > 2 ? arguments[2] : void 0, 2)),
                    null == b || (v == Array && u(b)))
                )
                    for (n = new v((e = c(d.length))); e > x; x++)
                        (h = g ? m(d[x], x) : d[x]), a(n, x, h);
                else
                    for (
                        p = (l = b.call(d)).next, n = new v();
                        !(f = p.call(l)).done;
                        x++
                    )
                        (h = g ? i(l, m, [f.value, x], !0) : f.value),
                            a(n, x, h);
                return (n.length = x), n;
            };
        },
        function (t, e, n) {
            'use strict';
            var r = n(27),
                o = n(6),
                i = n(15);
            t.exports = function (t, e, n) {
                var u = r(e);
                u in t ? o.f(t, u, i(0, n)) : (t[u] = n);
            };
        },
        function (t, e, n) {
            n(104);
            var r = n(11);
            t.exports = r.Object.assign;
        },
        function (t, e, n) {
            var r = n(14),
                o = n(105);
            r(
                { target: 'Object', stat: !0, forced: Object.assign !== o },
                { assign: o }
            );
        },
        function (t, e, n) {
            'use strict';
            var r = n(7),
                o = n(5),
                i = n(65),
                u = n(55),
                c = n(47),
                a = n(21),
                s = n(24),
                f = Object.assign,
                l = Object.defineProperty;
            t.exports =
                !f ||
                o(function () {
                    if (
                        r &&
                        1 !==
                            f(
                                { b: 1 },
                                f(
                                    l({}, 'a', {
                                        enumerable: !0,
                                        get: function () {
                                            l(this, 'b', {
                                                value: 3,
                                                enumerable: !1,
                                            });
                                        },
                                    }),
                                    { b: 2 }
                                )
                            ).b
                    )
                        return !0;
                    var t = {},
                        e = {},
                        n = Symbol();
                    return (
                        (t[n] = 7),
                        'abcdefghijklmnopqrst'.split('').forEach(function (t) {
                            e[t] = t;
                        }),
                        7 != f({}, t)[n] ||
                            'abcdefghijklmnopqrst' != i(f({}, e)).join('')
                    );
                })
                    ? function (t, e) {
                          for (
                              var n = a(t),
                                  o = arguments.length,
                                  f = 1,
                                  l = u.f,
                                  p = c.f;
                              o > f;

                          )
                              for (
                                  var h,
                                      d = s(arguments[f++]),
                                      v = l ? i(d).concat(l(d)) : i(d),
                                      y = v.length,
                                      m = 0;
                                  y > m;

                              )
                                  (h = v[m++]),
                                      (r && !p.call(d, h)) || (n[h] = d[h]);
                          return n;
                      }
                    : f;
        },
        function (t, e, n) {
            'use strict';
            n.r(e);
            var r = {};
            n.r(r),
                n.d(r, 'keyboardHandler', function () {
                    return R;
                }),
                n.d(r, 'mouseHandler', function () {
                    return C;
                }),
                n.d(r, 'resizeHandler', function () {
                    return F;
                }),
                n.d(r, 'selectHandler', function () {
                    return H;
                }),
                n.d(r, 'touchHandler', function () {
                    return W;
                }),
                n.d(r, 'wheelHandler', function () {
                    return B;
                });
            /*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
            var o = function (t, e) {
                    return (o =
                        Object.setPrototypeOf ||
                        ({ __proto__: [] } instanceof Array &&
                            function (t, e) {
                                t.__proto__ = e;
                            }) ||
                        function (t, e) {
                            for (var n in e)
                                e.hasOwnProperty(n) && (t[n] = e[n]);
                        })(t, e);
                },
                i = function () {
                    return (i =
                        Object.assign ||
                        function (t) {
                            for (var e, n = 1, r = arguments.length; n < r; n++)
                                for (var o in (e = arguments[n]))
                                    Object.prototype.hasOwnProperty.call(
                                        e,
                                        o
                                    ) && (t[o] = e[o]);
                            return t;
                        }).apply(this, arguments);
                };
            function u(t, e, n, r) {
                var o,
                    i = arguments.length,
                    u =
                        i < 3
                            ? e
                            : null === r
                            ? (r = Object.getOwnPropertyDescriptor(e, n))
                            : r;
                if (
                    'object' == typeof Reflect &&
                    'function' == typeof Reflect.decorate
                )
                    u = Reflect.decorate(t, e, n, r);
                else
                    for (var c = t.length - 1; c >= 0; c--)
                        (o = t[c]) &&
                            (u =
                                (i < 3 ? o(u) : i > 3 ? o(e, n, u) : o(e, n)) ||
                                u);
                return i > 3 && u && Object.defineProperty(e, n, u), u;
            }
            n(69), n(91), n(93), n(99), n(103);
            var c = n(0),
                a = n.n(c);
            function s(t, e) {
                return (
                    void 0 === t && (t = -1 / 0),
                    void 0 === e && (e = 1 / 0),
                    function (n, r) {
                        var o = '_' + r;
                        Object.defineProperty(n, r, {
                            get: function () {
                                return this[o];
                            },
                            set: function (n) {
                                Object.defineProperty(this, o, {
                                    value: a()(n, t, e),
                                    enumerable: !1,
                                    writable: !0,
                                    configurable: !0,
                                });
                            },
                            enumerable: !0,
                            configurable: !0,
                        });
                    }
                );
            }
            function f(t, e) {
                var n = '_' + e;
                Object.defineProperty(t, e, {
                    get: function () {
                        return this[n];
                    },
                    set: function (t) {
                        Object.defineProperty(this, n, {
                            value: !!t,
                            enumerable: !1,
                            writable: !0,
                            configurable: !0,
                        });
                    },
                    enumerable: !0,
                    configurable: !0,
                });
            }
            var l = n(22),
                p = n.n(l);
            function h() {
                for (var t = [], e = 0; e < arguments.length; e++)
                    t[e] = arguments[e];
                return function (e, n, r) {
                    var o = r.value;
                    return {
                        get: function () {
                            return (
                                this.hasOwnProperty(n) ||
                                    Object.defineProperty(this, n, {
                                        value: p.a.apply(
                                            void 0,
                                            (function () {
                                                for (
                                                    var t = 0,
                                                        e = 0,
                                                        n = arguments.length;
                                                    e < n;
                                                    e++
                                                )
                                                    t += arguments[e].length;
                                                var r = Array(t),
                                                    o = 0;
                                                for (e = 0; e < n; e++)
                                                    for (
                                                        var i = arguments[e],
                                                            u = 0,
                                                            c = i.length;
                                                        u < c;
                                                        u++, o++
                                                    )
                                                        r[o] = i[u];
                                                return r;
                                            })([o], t)
                                        ),
                                    }),
                                this[n]
                            );
                        },
                    };
                };
            }
            var d,
                v = (function () {
                    function t(t) {
                        var e = this;
                        void 0 === t && (t = {}),
                            (this.damping = 0.1),
                            (this.thumbMinSize = 20),
                            (this.renderByPixels = !0),
                            (this.alwaysShowTracks = !1),
                            (this.continuousScrolling = !0),
                            (this.delegateTo = null),
                            (this.plugins = {}),
                            Object.keys(t).forEach(function (n) {
                                e[n] = t[n];
                            });
                    }
                    return (
                        Object.defineProperty(t.prototype, 'wheelEventTarget', {
                            get: function () {
                                return this.delegateTo;
                            },
                            set: function (t) {
                                console.warn(
                                    '[smooth-scrollbar]: `options.wheelEventTarget` is deprecated and will be removed in the future, use `options.delegateTo` instead.'
                                ),
                                    (this.delegateTo = t);
                            },
                            enumerable: !0,
                            configurable: !0,
                        }),
                        u([s(0, 1)], t.prototype, 'damping', void 0),
                        u([s(0, 1 / 0)], t.prototype, 'thumbMinSize', void 0),
                        u([f], t.prototype, 'renderByPixels', void 0),
                        u([f], t.prototype, 'alwaysShowTracks', void 0),
                        u([f], t.prototype, 'continuousScrolling', void 0),
                        t
                    );
                })(),
                y = new WeakMap();
            function m() {
                if (void 0 !== d) return d;
                var t = !1;
                try {
                    var e = function () {},
                        n = Object.defineProperty({}, 'passive', {
                            get: function () {
                                t = !0;
                            },
                        });
                    window.addEventListener('testPassive', e, n),
                        window.removeEventListener('testPassive', e, n);
                } catch (t) {}
                return (d = !!t && { passive: !1 });
            }
            function g(t) {
                var e = y.get(t) || [];
                return (
                    y.set(t, e),
                    function (t, n, r) {
                        function o(t) {
                            t.defaultPrevented || r(t);
                        }
                        n.split(/\s+/g).forEach(function (n) {
                            e.push({ elem: t, eventName: n, handler: o }),
                                t.addEventListener(n, o, m());
                        });
                    }
                );
            }
            function b(t) {
                var e = (function (t) {
                    return t.touches ? t.touches[t.touches.length - 1] : t;
                })(t);
                return { x: e.clientX, y: e.clientY };
            }
            function x(t, e) {
                return (
                    void 0 === e && (e = []),
                    e.some(function (e) {
                        return t === e;
                    })
                );
            }
            var w = ['webkit', 'moz', 'ms', 'o'],
                S = new RegExp('^-(?!(?:' + w.join('|') + ')-)');
            function O(t, e) {
                (e = (function (t) {
                    var e = {};
                    return (
                        Object.keys(t).forEach(function (n) {
                            if (S.test(n)) {
                                var r = t[n];
                                (n = n.replace(/^-/, '')),
                                    (e[n] = r),
                                    w.forEach(function (t) {
                                        e['-' + t + '-' + n] = r;
                                    });
                            } else e[n] = t[n];
                        }),
                        e
                    );
                })(e)),
                    Object.keys(e).forEach(function (n) {
                        var r = n
                            .replace(/^-/, '')
                            .replace(/-([a-z])/g, function (t, e) {
                                return e.toUpperCase();
                            });
                        t.style[r] = e[n];
                    });
            }
            var _,
                E = (function () {
                    function t(t) {
                        (this.velocityMultiplier = window.devicePixelRatio),
                            (this.updateTime = Date.now()),
                            (this.delta = { x: 0, y: 0 }),
                            (this.velocity = { x: 0, y: 0 }),
                            (this.lastPosition = { x: 0, y: 0 }),
                            (this.lastPosition = b(t));
                    }
                    return (
                        (t.prototype.update = function (t) {
                            var e = this.velocity,
                                n = this.updateTime,
                                r = this.lastPosition,
                                o = Date.now(),
                                i = b(t),
                                u = { x: -(i.x - r.x), y: -(i.y - r.y) },
                                c = o - n || 16.7,
                                a = (u.x / c) * 16.7,
                                s = (u.y / c) * 16.7;
                            (e.x = a * this.velocityMultiplier),
                                (e.y = s * this.velocityMultiplier),
                                (this.delta = u),
                                (this.updateTime = o),
                                (this.lastPosition = i);
                        }),
                        t
                    );
                })(),
                T = (function () {
                    function t() {
                        this._touchList = {};
                    }
                    return (
                        Object.defineProperty(t.prototype, '_primitiveValue', {
                            get: function () {
                                return { x: 0, y: 0 };
                            },
                            enumerable: !0,
                            configurable: !0,
                        }),
                        (t.prototype.isActive = function () {
                            return void 0 !== this._activeTouchID;
                        }),
                        (t.prototype.getDelta = function () {
                            var t = this._getActiveTracker();
                            return t ? i({}, t.delta) : this._primitiveValue;
                        }),
                        (t.prototype.getVelocity = function () {
                            var t = this._getActiveTracker();
                            return t ? i({}, t.velocity) : this._primitiveValue;
                        }),
                        (t.prototype.getEasingDistance = function (t) {
                            var e = 1 - t,
                                n = { x: 0, y: 0 },
                                r = this.getVelocity();
                            return (
                                Object.keys(r).forEach(function (t) {
                                    for (
                                        var o = Math.abs(r[t]) <= 10 ? 0 : r[t];
                                        0 !== o;

                                    )
                                        (n[t] += o), (o = (o * e) | 0);
                                }),
                                n
                            );
                        }),
                        (t.prototype.track = function (t) {
                            var e = this,
                                n = t.targetTouches;
                            return (
                                Array.from(n).forEach(function (t) {
                                    e._add(t);
                                }),
                                this._touchList
                            );
                        }),
                        (t.prototype.update = function (t) {
                            var e = this,
                                n = t.touches,
                                r = t.changedTouches;
                            return (
                                Array.from(n).forEach(function (t) {
                                    e._renew(t);
                                }),
                                this._setActiveID(r),
                                this._touchList
                            );
                        }),
                        (t.prototype.release = function (t) {
                            var e = this;
                            delete this._activeTouchID,
                                Array.from(t.changedTouches).forEach(function (
                                    t
                                ) {
                                    e._delete(t);
                                });
                        }),
                        (t.prototype._add = function (t) {
                            this._has(t) && this._delete(t);
                            var e = new E(t);
                            this._touchList[t.identifier] = e;
                        }),
                        (t.prototype._renew = function (t) {
                            this._has(t) &&
                                this._touchList[t.identifier].update(t);
                        }),
                        (t.prototype._delete = function (t) {
                            delete this._touchList[t.identifier];
                        }),
                        (t.prototype._has = function (t) {
                            return this._touchList.hasOwnProperty(t.identifier);
                        }),
                        (t.prototype._setActiveID = function (t) {
                            this._activeTouchID = t[t.length - 1].identifier;
                        }),
                        (t.prototype._getActiveTracker = function () {
                            return this._touchList[this._activeTouchID];
                        }),
                        t
                    );
                })();
            !(function (t) {
                (t.X = 'x'), (t.Y = 'y');
            })(_ || (_ = {}));
            var A = (function () {
                    function t(t, e) {
                        void 0 === e && (e = 0),
                            (this._direction = t),
                            (this._minSize = e),
                            (this.element = document.createElement('div')),
                            (this.displaySize = 0),
                            (this.realSize = 0),
                            (this.offset = 0),
                            (this.element.className =
                                'scrollbar-thumb scrollbar-thumb-' + t);
                    }
                    return (
                        (t.prototype.attachTo = function (t) {
                            t.appendChild(this.element);
                        }),
                        (t.prototype.update = function (t, e, n) {
                            (this.realSize = Math.min(e / n, 1) * e),
                                (this.displaySize = Math.max(
                                    this.realSize,
                                    this._minSize
                                )),
                                (this.offset =
                                    (t / n) *
                                    (e + (this.realSize - this.displaySize))),
                                O(this.element, this._getStyle());
                        }),
                        (t.prototype._getStyle = function () {
                            switch (this._direction) {
                                case _.X:
                                    return {
                                        width: this.displaySize + 'px',
                                        '-transform':
                                            'translate3d(' +
                                            this.offset +
                                            'px, 0, 0)',
                                    };
                                case _.Y:
                                    return {
                                        height: this.displaySize + 'px',
                                        '-transform':
                                            'translate3d(0, ' +
                                            this.offset +
                                            'px, 0)',
                                    };
                                default:
                                    return null;
                            }
                        }),
                        t
                    );
                })(),
                j = (function () {
                    function t(t, e) {
                        void 0 === e && (e = 0),
                            (this.element = document.createElement('div')),
                            (this._isShown = !1),
                            (this.element.className =
                                'scrollbar-track scrollbar-track-' + t),
                            (this.thumb = new A(t, e)),
                            this.thumb.attachTo(this.element);
                    }
                    return (
                        (t.prototype.attachTo = function (t) {
                            t.appendChild(this.element);
                        }),
                        (t.prototype.show = function () {
                            this._isShown ||
                                ((this._isShown = !0),
                                this.element.classList.add('show_wb'));
                        }),
                        (t.prototype.hide = function () {
                            this._isShown &&
                                ((this._isShown = !1),
                                this.element.classList.remove('show_wb'));
                        }),
                        (t.prototype.update = function (t, e, n) {
                            O(this.element, {
                                display: n <= e ? 'none' : 'block',
                            }),
                                this.thumb.update(t, e, n);
                        }),
                        t
                    );
                })(),
                P = (function () {
                    function t(t) {
                        this._scrollbar = t;
                        var e = t.options.thumbMinSize;
                        (this.xAxis = new j(_.X, e)),
                            (this.yAxis = new j(_.Y, e)),
                            this.xAxis.attachTo(t.containerEl),
                            this.yAxis.attachTo(t.containerEl),
                            t.options.alwaysShowTracks &&
                                (this.xAxis.show(), this.yAxis.show());
                    }
                    return (
                        (t.prototype.update = function () {
                            var t = this._scrollbar,
                                e = t.size,
                                n = t.offset;
                            this.xAxis.update(
                                n.x,
                                e.container.width,
                                e.content.width
                            ),
                                this.yAxis.update(
                                    n.y,
                                    e.container.height,
                                    e.content.height
                                );
                        }),
                        (t.prototype.autoHideOnIdle = function () {
                            this._scrollbar.options.alwaysShowTracks ||
                                (this.xAxis.hide(), this.yAxis.hide());
                        }),
                        u([h(300)], t.prototype, 'autoHideOnIdle', null),
                        t
                    );
                })(),
                M = new WeakMap();
            function k(t) {
                return Math.pow(t - 1, 3) + 1;
            }
            var D,
                z,
                L,
                I = (function () {
                    function t(t, e) {
                        var n = this.constructor;
                        (this.scrollbar = t),
                            (this.name = n.pluginName),
                            (this.options = i(i({}, n.defaultOptions), e));
                    }
                    return (
                        (t.prototype.onInit = function () {}),
                        (t.prototype.onDestroy = function () {}),
                        (t.prototype.onUpdate = function () {}),
                        (t.prototype.onRender = function (t) {}),
                        (t.prototype.transformDelta = function (t, e) {
                            return i({}, t);
                        }),
                        (t.pluginName = ''),
                        (t.defaultOptions = {}),
                        t
                    );
                })(),
                N = { order: new Set(), constructors: {} };
            function R(t) {
                var e = g(t),
                    n = t.containerEl;
                e(n, 'keydown', function (e) {
                    var r = document.activeElement;
                    if (
                        (r === n || n.contains(r)) &&
                        !(function (t) {
                            return (
                                !(
                                    'INPUT' !== t.tagName &&
                                    'SELECT' !== t.tagName &&
                                    'TEXTAREA' !== t.tagName &&
                                    !t.isContentEditable
                                ) && !t.disabled
                            );
                        })(r)
                    ) {
                        var o = (function (t, e) {
                            var n = t.size,
                                r = t.limit,
                                o = t.offset;
                            switch (e) {
                                case D.TAB:
                                    return (function (t) {
                                        requestAnimationFrame(function () {
                                            t.scrollIntoView(
                                                document.activeElement,
                                                {
                                                    offsetTop:
                                                        t.size.container
                                                            .height / 2,
                                                    offsetLeft:
                                                        t.size.container.width /
                                                        2,
                                                    onlyScrollIfNeeded: !0,
                                                }
                                            );
                                        });
                                    })(t);
                                case D.SPACE:
                                    return [0, 200];
                                case D.PAGE_UP:
                                    return [0, 40 - n.container.height];
                                case D.PAGE_DOWN:
                                    return [0, n.container.height - 40];
                                case D.END:
                                    return [0, r.y - o.y];
                                case D.HOME:
                                    return [0, -o.y];
                                case D.LEFT:
                                    return [-40, 0];
                                case D.UP:
                                    return [0, -40];
                                case D.RIGHT:
                                    return [40, 0];
                                case D.DOWN:
                                    return [0, 40];
                                default:
                                    return null;
                            }
                        })(t, e.keyCode || e.which);
                        if (o) {
                            var i = o[0],
                                u = o[1];
                            t.addTransformableMomentum(i, u, e, function (n) {
                                n
                                    ? e.preventDefault()
                                    : (t.containerEl.blur(),
                                      t.parent && t.parent.containerEl.focus());
                            });
                        }
                    }
                });
            }
            function C(t) {
                var e,
                    n,
                    r,
                    o,
                    i,
                    u = g(t),
                    c = t.containerEl,
                    s = t.track,
                    f = s.xAxis,
                    l = s.yAxis;
                function p(e, n) {
                    var r = t.size,
                        o = t.limit,
                        i = t.offset;
                    if (e === z.X) {
                        var u =
                            r.container.width +
                            (f.thumb.realSize - f.thumb.displaySize);
                        return a()((n / u) * r.content.width, 0, o.x) - i.x;
                    }
                    if (e === z.Y) {
                        var c =
                            r.container.height +
                            (l.thumb.realSize - l.thumb.displaySize);
                        return a()((n / c) * r.content.height, 0, o.y) - i.y;
                    }
                    return 0;
                }
                function h(t) {
                    return x(t, [f.element, f.thumb.element])
                        ? z.X
                        : x(t, [l.element, l.thumb.element])
                        ? z.Y
                        : void 0;
                }
                u(c, 'click', function (e) {
                    if (!n && x(e.target, [f.element, l.element])) {
                        var r = e.target,
                            o = h(r),
                            i = r.getBoundingClientRect(),
                            u = b(e);
                        if (o === z.X) {
                            var c = u.x - i.left - f.thumb.displaySize / 2;
                            t.setMomentum(p(o, c), 0);
                        }
                        o === z.Y &&
                            ((c = u.y - i.top - l.thumb.displaySize / 2),
                            t.setMomentum(0, p(o, c)));
                    }
                }),
                    u(c, 'mousedown', function (n) {
                        if (x(n.target, [f.thumb.element, l.thumb.element])) {
                            e = !0;
                            var u = n.target,
                                a = b(n),
                                s = u.getBoundingClientRect();
                            (o = h(u)),
                                (r = { x: a.x - s.left, y: a.y - s.top }),
                                (i = c.getBoundingClientRect()),
                                O(t.containerEl, { '-user-select': 'none' });
                        }
                    }),
                    u(window, 'mousemove', function (u) {
                        if (e) {
                            n = !0;
                            var c = b(u);
                            if (o === z.X) {
                                var a = c.x - r.x - i.left;
                                t.setMomentum(p(o, a), 0);
                            }
                            o === z.Y &&
                                ((a = c.y - r.y - i.top),
                                t.setMomentum(0, p(o, a)));
                        }
                    }),
                    u(window, 'mouseup blur', function () {
                        (e = n = !1), O(t.containerEl, { '-user-select': '' });
                    });
            }
            function F(t) {
                g(t)(window, 'resize', p()(t.update.bind(t), 300));
            }
            function H(t) {
                var e,
                    n = g(t),
                    r = t.containerEl,
                    o = t.contentEl,
                    i = !1,
                    u = !1;
                n(window, 'mousemove', function (n) {
                    i &&
                        (cancelAnimationFrame(e),
                        (function n(r) {
                            var o = r.x,
                                i = r.y;
                            if (o || i) {
                                var u = t.offset,
                                    c = t.limit;
                                t.setMomentum(
                                    a()(u.x + o, 0, c.x) - u.x,
                                    a()(u.y + i, 0, c.y) - u.y
                                ),
                                    (e = requestAnimationFrame(function () {
                                        n({ x: o, y: i });
                                    }));
                            }
                        })(
                            (function (t, e) {
                                var n = t.bounding,
                                    r = n.top,
                                    o = n.right,
                                    i = n.bottom,
                                    u = n.left,
                                    c = b(e),
                                    a = c.x,
                                    s = c.y,
                                    f = { x: 0, y: 0 };
                                return (
                                    (0 === a && 0 === s) ||
                                        (a > o - 20
                                            ? (f.x = a - o + 20)
                                            : a < u + 20 && (f.x = a - u - 20),
                                        s > i - 20
                                            ? (f.y = s - i + 20)
                                            : s < r + 20 && (f.y = s - r - 20),
                                        (f.x *= 2),
                                        (f.y *= 2)),
                                    f
                                );
                            })(t, n)
                        ));
                }),
                    n(o, 'contextmenu', function () {
                        (u = !0), cancelAnimationFrame(e), (i = !1);
                    }),
                    n(o, 'mousedown', function () {
                        u = !1;
                    }),
                    n(o, 'selectstart', function () {
                        u || (cancelAnimationFrame(e), (i = !0));
                    }),
                    n(window, 'mouseup blur', function () {
                        cancelAnimationFrame(e), (i = !1), (u = !1);
                    }),
                    n(r, 'scroll', function (t) {
                        t.preventDefault(), (r.scrollTop = r.scrollLeft = 0);
                    });
            }
            function W(t) {
                var e,
                    n = t.options.delegateTo || t.containerEl,
                    r = new T(),
                    o = g(t),
                    i = 0;
                o(n, 'touchstart', function (n) {
                    r.track(n),
                        t.setMomentum(0, 0),
                        0 === i &&
                            ((e = t.options.damping),
                            (t.options.damping = Math.max(e, 0.5))),
                        i++;
                }),
                    o(n, 'touchmove', function (e) {
                        if (!L || L === t) {
                            r.update(e);
                            var n = r.getDelta(),
                                o = n.x,
                                i = n.y;
                            t.addTransformableMomentum(o, i, e, function (n) {
                                n &&
                                    e.cancelable &&
                                    (e.preventDefault(), (L = t));
                            });
                        }
                    }),
                    o(n, 'touchcancel touchend', function (n) {
                        var o = r.getEasingDistance(e);
                        t.addTransformableMomentum(o.x, o.y, n),
                            0 == --i && (t.options.damping = e),
                            r.release(n),
                            (L = null);
                    });
            }
            function B(t) {
                g(t)(
                    t.options.delegateTo || t.containerEl,
                    'onwheel' in window ||
                        document.implementation.hasFeature(
                            'Events.wheel',
                            '3.0'
                        )
                        ? 'wheel'
                        : 'mousewheel',
                    function (e) {
                        var n = (function (t) {
                                if ('deltaX' in t) {
                                    var e = U(t.deltaMode);
                                    return {
                                        x: (t.deltaX / G.STANDARD) * e,
                                        y: (t.deltaY / G.STANDARD) * e,
                                    };
                                }
                                return 'wheelDeltaX' in t
                                    ? {
                                          x: t.wheelDeltaX / G.OTHERS,
                                          y: t.wheelDeltaY / G.OTHERS,
                                      }
                                    : { x: 0, y: t.wheelDelta / G.OTHERS };
                            })(e),
                            r = n.x,
                            o = n.y;
                        t.addTransformableMomentum(r, o, e, function (t) {
                            t && e.preventDefault();
                        });
                    }
                );
            }
            !(function (t) {
                (t[(t.TAB = 9)] = 'TAB'),
                    (t[(t.SPACE = 32)] = 'SPACE'),
                    (t[(t.PAGE_UP = 33)] = 'PAGE_UP'),
                    (t[(t.PAGE_DOWN = 34)] = 'PAGE_DOWN'),
                    (t[(t.END = 35)] = 'END'),
                    (t[(t.HOME = 36)] = 'HOME'),
                    (t[(t.LEFT = 37)] = 'LEFT'),
                    (t[(t.UP = 38)] = 'UP'),
                    (t[(t.RIGHT = 39)] = 'RIGHT'),
                    (t[(t.DOWN = 40)] = 'DOWN');
            })(D || (D = {})),
                (function (t) {
                    (t[(t.X = 0)] = 'X'), (t[(t.Y = 1)] = 'Y');
                })(z || (z = {}));
            var G = { STANDARD: 1, OTHERS: -3 },
                X = [1, 28, 500],
                U = function (t) {
                    return X[t] || X[0];
                },
                V = new Map(),
                Y = (function () {
                    function t(t, e) {
                        var n = this;
                        (this.offset = { x: 0, y: 0 }),
                            (this.limit = { x: 1 / 0, y: 1 / 0 }),
                            (this.bounding = {
                                top: 0,
                                right: 0,
                                bottom: 0,
                                left: 0,
                            }),
                            (this._plugins = []),
                            (this._momentum = { x: 0, y: 0 }),
                            (this._listeners = new Set()),
                            (this.containerEl = t);
                        var r = (this.contentEl =
                            document.createElement('div'));
                        (this.options = new v(e)),
                            t.setAttribute('data-scrollbar', 'true'),
                            t.setAttribute('tabindex', '-1'),
                            O(t, { overflow: 'hidden', outline: 'none' }),
                            window.navigator.msPointerEnabled &&
                                (t.style.msTouchAction = 'none'),
                            (r.className = 'scroll-content'),
                            Array.from(t.childNodes).forEach(function (t) {
                                r.appendChild(t);
                            }),
                            t.appendChild(r),
                            (this.track = new P(this)),
                            (this.size = this.getSize()),
                            (this._plugins = (function (t, e) {
                                return Array.from(N.order)
                                    .filter(function (t) {
                                        return !1 !== e[t];
                                    })
                                    .map(function (n) {
                                        var r = new (0, N.constructors[n])(
                                            t,
                                            e[n]
                                        );
                                        return (e[n] = r.options), r;
                                    });
                            })(this, this.options.plugins));
                        var o = t.scrollLeft,
                            i = t.scrollTop;
                        (t.scrollLeft = t.scrollTop = 0),
                            this.setPosition(o, i, { withoutCallbacks: !0 });
                        var u = window.ResizeObserver;
                        'function' == typeof u &&
                            ((this._observer = new u(function () {
                                n.update();
                            })),
                            this._observer.observe(r)),
                            V.set(t, this),
                            requestAnimationFrame(function () {
                                n._init();
                            });
                    }
                    return (
                        Object.defineProperty(t.prototype, 'parent', {
                            get: function () {
                                for (
                                    var t = this.containerEl.parentElement;
                                    t;

                                ) {
                                    var e = V.get(t);
                                    if (e) return e;
                                    t = t.parentElement;
                                }
                                return null;
                            },
                            enumerable: !0,
                            configurable: !0,
                        }),
                        Object.defineProperty(t.prototype, 'scrollTop', {
                            get: function () {
                                return this.offset.y;
                            },
                            set: function (t) {
                                this.setPosition(this.scrollLeft, t);
                            },
                            enumerable: !0,
                            configurable: !0,
                        }),
                        Object.defineProperty(t.prototype, 'scrollLeft', {
                            get: function () {
                                return this.offset.x;
                            },
                            set: function (t) {
                                this.setPosition(t, this.scrollTop);
                            },
                            enumerable: !0,
                            configurable: !0,
                        }),
                        (t.prototype.getSize = function () {
                            return (function (t) {
                                var e = t.containerEl,
                                    n = t.contentEl,
                                    r = getComputedStyle(e),
                                    o = [
                                        'paddingTop',
                                        'paddingBottom',
                                        'paddingLeft',
                                        'paddingRight',
                                    ].map(function (t) {
                                        return r[t] ? parseFloat(r[t]) : 0;
                                    }),
                                    i = o[0] + o[1],
                                    u = o[2] + o[3];
                                return {
                                    container: {
                                        width: e.clientWidth,
                                        height: e.clientHeight,
                                    },
                                    content: {
                                        width:
                                            n.offsetWidth -
                                            n.clientWidth +
                                            n.scrollWidth +
                                            u,
                                        height:
                                            n.offsetHeight -
                                            n.clientHeight +
                                            n.scrollHeight +
                                            i,
                                    },
                                };
                            })(this);
                        }),
                        (t.prototype.update = function () {
                            !(function (t) {
                                var e = t.getSize(),
                                    n = {
                                        x: Math.max(
                                            e.content.width - e.container.width,
                                            0
                                        ),
                                        y: Math.max(
                                            e.content.height -
                                                e.container.height,
                                            0
                                        ),
                                    },
                                    r = t.containerEl.getBoundingClientRect(),
                                    o = {
                                        top: Math.max(r.top, 0),
                                        right: Math.min(
                                            r.right,
                                            window.innerWidth
                                        ),
                                        bottom: Math.min(
                                            r.bottom,
                                            window.innerHeight
                                        ),
                                        left: Math.max(r.left, 0),
                                    };
                                (t.size = e),
                                    (t.limit = n),
                                    (t.bounding = o),
                                    t.track.update(),
                                    t.setPosition();
                            })(this),
                                this._plugins.forEach(function (t) {
                                    t.onUpdate();
                                });
                        }),
                        (t.prototype.isVisible = function (t) {
                            return (function (t, e) {
                                var n = t.bounding,
                                    r = e.getBoundingClientRect(),
                                    o = Math.max(n.top, r.top),
                                    i = Math.max(n.left, r.left),
                                    u = Math.min(n.right, r.right);
                                return (
                                    o < Math.min(n.bottom, r.bottom) && i < u
                                );
                            })(this, t);
                        }),
                        (t.prototype.setPosition = function (t, e, n) {
                            var r = this;
                            void 0 === t && (t = this.offset.x),
                                void 0 === e && (e = this.offset.y),
                                void 0 === n && (n = {});
                            var o = (function (t, e, n) {
                                var r = t.options,
                                    o = t.offset,
                                    u = t.limit,
                                    c = t.track,
                                    s = t.contentEl;
                                return (
                                    r.renderByPixels &&
                                        ((e = Math.round(e)),
                                        (n = Math.round(n))),
                                    (e = a()(e, 0, u.x)),
                                    (n = a()(n, 0, u.y)),
                                    e !== o.x && c.xAxis.show(),
                                    n !== o.y && c.yAxis.show(),
                                    r.alwaysShowTracks || c.autoHideOnIdle(),
                                    e === o.x && n === o.y
                                        ? null
                                        : ((o.x = e),
                                          (o.y = n),
                                          O(s, {
                                              '-transform':
                                                  'translate3d(' +
                                                  -e +
                                                  'px, ' +
                                                  -n +
                                                  'px, 0)',
                                          }),
                                          c.update(),
                                          { offset: i({}, o), limit: i({}, u) })
                                );
                            })(this, t, e);
                            o &&
                                !n.withoutCallbacks &&
                                this._listeners.forEach(function (t) {
                                    t.call(r, o);
                                });
                        }),
                        (t.prototype.scrollTo = function (t, e, n, r) {
                            void 0 === t && (t = this.offset.x),
                                void 0 === e && (e = this.offset.y),
                                void 0 === n && (n = 0),
                                void 0 === r && (r = {}),
                                (function (t, e, n, r, o) {
                                    void 0 === r && (r = 0);
                                    var i = void 0 === o ? {} : o,
                                        u = i.easing,
                                        c = void 0 === u ? k : u,
                                        s = i.callback,
                                        f = t.options,
                                        l = t.offset,
                                        p = t.limit;
                                    f.renderByPixels &&
                                        ((e = Math.round(e)),
                                        (n = Math.round(n)));
                                    var h = l.x,
                                        d = l.y,
                                        v = a()(e, 0, p.x) - h,
                                        y = a()(n, 0, p.y) - d,
                                        m = Date.now();
                                    cancelAnimationFrame(M.get(t)),
                                        (function e() {
                                            var n = Date.now() - m,
                                                o = r
                                                    ? c(Math.min(n / r, 1))
                                                    : 1;
                                            if (
                                                (t.setPosition(
                                                    h + v * o,
                                                    d + y * o
                                                ),
                                                n >= r)
                                            )
                                                'function' == typeof s &&
                                                    s.call(t);
                                            else {
                                                var i =
                                                    requestAnimationFrame(e);
                                                M.set(t, i);
                                            }
                                        })();
                                })(this, t, e, n, r);
                        }),
                        (t.prototype.scrollIntoView = function (t, e) {
                            void 0 === e && (e = {}),
                                (function (t, e, n) {
                                    var r = void 0 === n ? {} : n,
                                        o = r.alignToTop,
                                        i = void 0 === o || o,
                                        u = r.onlyScrollIfNeeded,
                                        c = void 0 !== u && u,
                                        s = r.offsetTop,
                                        f = void 0 === s ? 0 : s,
                                        l = r.offsetLeft,
                                        p = void 0 === l ? 0 : l,
                                        h = r.offsetBottom,
                                        d = void 0 === h ? 0 : h,
                                        v = t.containerEl,
                                        y = t.bounding,
                                        m = t.offset,
                                        g = t.limit;
                                    if (e && v.contains(e)) {
                                        var b = e.getBoundingClientRect();
                                        if (!c || !t.isVisible(e)) {
                                            var x = i
                                                ? b.top - y.top - f
                                                : b.bottom - y.bottom + d;
                                            t.setMomentum(
                                                b.left - y.left - p,
                                                a()(x, -m.y, g.y - m.y)
                                            );
                                        }
                                    }
                                })(this, t, e);
                        }),
                        (t.prototype.addListener = function (t) {
                            if ('function' != typeof t)
                                throw new TypeError(
                                    '[smooth-scrollbar] scrolling listener should be a function'
                                );
                            this._listeners.add(t);
                        }),
                        (t.prototype.removeListener = function (t) {
                            this._listeners.delete(t);
                        }),
                        (t.prototype.addTransformableMomentum = function (
                            t,
                            e,
                            n,
                            r
                        ) {
                            this._updateDebounced();
                            var o = this._plugins.reduce(
                                    function (t, e) {
                                        return e.transformDelta(t, n) || t;
                                    },
                                    { x: t, y: e }
                                ),
                                i = !this._shouldPropagateMomentum(o.x, o.y);
                            i && this.addMomentum(o.x, o.y),
                                r && r.call(this, i);
                        }),
                        (t.prototype.addMomentum = function (t, e) {
                            this.setMomentum(
                                this._momentum.x + t,
                                this._momentum.y + e
                            );
                        }),
                        (t.prototype.setMomentum = function (t, e) {
                            0 === this.limit.x && (t = 0),
                                0 === this.limit.y && (e = 0),
                                this.options.renderByPixels &&
                                    ((t = Math.round(t)), (e = Math.round(e))),
                                (this._momentum.x = t),
                                (this._momentum.y = e);
                        }),
                        (t.prototype.updatePluginOptions = function (t, e) {
                            this._plugins.forEach(function (n) {
                                n.name === t && Object.assign(n.options, e);
                            });
                        }),
                        (t.prototype.destroy = function () {
                            var t = this.containerEl,
                                e = this.contentEl;
                            !(function (t) {
                                var e = y.get(t);
                                e &&
                                    (e.forEach(function (t) {
                                        var e = t.elem,
                                            n = t.eventName,
                                            r = t.handler;
                                        e.removeEventListener(n, r, m());
                                    }),
                                    y.delete(t));
                            })(this),
                                this._listeners.clear(),
                                this.setMomentum(0, 0),
                                cancelAnimationFrame(this._renderID),
                                this._observer && this._observer.disconnect(),
                                V.delete(this.containerEl);
                            for (
                                var n = Array.from(e.childNodes);
                                t.firstChild;

                            )
                                t.removeChild(t.firstChild);
                            n.forEach(function (e) {
                                t.appendChild(e);
                            }),
                                O(t, { overflow: '' }),
                                (t.scrollTop = this.scrollTop),
                                (t.scrollLeft = this.scrollLeft),
                                this._plugins.forEach(function (t) {
                                    t.onDestroy();
                                }),
                                (this._plugins.length = 0);
                        }),
                        (t.prototype._init = function () {
                            var t = this;
                            this.update(),
                                Object.keys(r).forEach(function (e) {
                                    r[e](t);
                                }),
                                this._plugins.forEach(function (t) {
                                    t.onInit();
                                }),
                                this._render();
                        }),
                        (t.prototype._updateDebounced = function () {
                            this.update();
                        }),
                        (t.prototype._shouldPropagateMomentum = function (
                            t,
                            e
                        ) {
                            void 0 === t && (t = 0), void 0 === e && (e = 0);
                            var n = this.options,
                                r = this.offset,
                                o = this.limit;
                            if (!n.continuousScrolling) return !1;
                            0 === o.x && 0 === o.y && this._updateDebounced();
                            var i = a()(t + r.x, 0, o.x),
                                u = a()(e + r.y, 0, o.y),
                                c = !0;
                            return (
                                (c = (c = c && i === r.x) && u === r.y) &&
                                (r.x === o.x ||
                                    0 === r.x ||
                                    r.y === o.y ||
                                    0 === r.y)
                            );
                        }),
                        (t.prototype._render = function () {
                            var t = this._momentum;
                            if (t.x || t.y) {
                                var e = this._nextTick('x'),
                                    n = this._nextTick('y');
                                (t.x = e.momentum),
                                    (t.y = n.momentum),
                                    this.setPosition(e.position, n.position);
                            }
                            var r = i({}, this._momentum);
                            this._plugins.forEach(function (t) {
                                t.onRender(r);
                            }),
                                (this._renderID = requestAnimationFrame(
                                    this._render.bind(this)
                                ));
                        }),
                        (t.prototype._nextTick = function (t) {
                            var e = this.options,
                                n = this.offset,
                                r = this._momentum,
                                o = n[t],
                                i = r[t];
                            if (Math.abs(i) <= 0.1)
                                return { momentum: 0, position: o + i };
                            var u = i * (1 - e.damping);
                            return (
                                e.renderByPixels && (u |= 0),
                                { momentum: u, position: o + i - u }
                            );
                        }),
                        u(
                            [h(100, { leading: !0 })],
                            t.prototype,
                            '_updateDebounced',
                            null
                        ),
                        t
                    );
                })(),
                q = 'smooth-scrollbar-style',
                $ = !1;
            function Q() {
                if (!$ && 'undefined' != typeof window) {
                    var t = document.createElement('style');
                    (t.id = q),
                        (t.textContent =
                            '\n[data-scrollbar] {\n  display: block;\n  position: relative;\n}\n\n.scroll-content {\n  display: flow-root;\n  -webkit-transform: translate3d(0, 0, 0);\n          transform: translate3d(0, 0, 0);\n}\n\n.scrollbar-track {\n  position: absolute;\n  opacity: 0;\n  z-index: 1;\n  background: rgba(222, 222, 222, .75);\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  -webkit-transition: opacity 0.5s 0.5s ease-out;\n          transition: opacity 0.5s 0.5s ease-out;\n}\n.scrollbar-track.show_wb,\n.scrollbar-track:hover {\n  opacity: 1;\n  -webkit-transition-delay: 0s;\n          transition-delay: 0s;\n}\n\n.scrollbar-track-x {\n  bottom: 0;\n  left: 0;\n  width: 100%;\n  height: 8px;\n}\n.scrollbar-track-y {\n  top: 0;\n  right: 0;\n  width: 8px;\n  height: 100%;\n}\n.scrollbar-thumb {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 8px;\n  height: 8px;\n  background: rgba(0, 0, 0, .5);\n  border-radius: 4px;\n}\n'),
                        document.head && document.head.appendChild(t),
                        ($ = !0);
                }
            }
            n.d(e, 'ScrollbarPlugin', function () {
                return I;
            });
            var K = (function (t) {
                function e() {
                    return (null !== t && t.apply(this, arguments)) || this;
                }
                return (
                    (function (t, e) {
                        function n() {
                            this.constructor = t;
                        }
                        o(t, e),
                            (t.prototype =
                                null === e
                                    ? Object.create(e)
                                    : ((n.prototype = e.prototype), new n()));
                    })(e, t),
                    (e.init = function (t, e) {
                        if (!t || 1 !== t.nodeType)
                            throw new TypeError(
                                'expect element to be DOM Element, but got ' + t
                            );
                        return Q(), V.has(t) ? V.get(t) : new Y(t, e);
                    }),
                    (e.initAll = function (t) {
                        return Array.from(
                            document.querySelectorAll('[data-scrollbar]'),
                            function (n) {
                                return e.init(n, t);
                            }
                        );
                    }),
                    (e.has = function (t) {
                        return V.has(t);
                    }),
                    (e.get = function (t) {
                        return V.get(t);
                    }),
                    (e.getAll = function () {
                        return Array.from(V.values());
                    }),
                    (e.destroy = function (t) {
                        var e = V.get(t);
                        e && e.destroy();
                    }),
                    (e.destroyAll = function () {
                        V.forEach(function (t) {
                            t.destroy();
                        });
                    }),
                    (e.use = function () {
                        for (var t = [], e = 0; e < arguments.length; e++)
                            t[e] = arguments[e];
                        return function () {
                            for (var t = [], e = 0; e < arguments.length; e++)
                                t[e] = arguments[e];
                            t.forEach(function (t) {
                                var e = t.pluginName;
                                if (!e)
                                    throw new TypeError(
                                        'plugin name is required'
                                    );
                                N.order.add(e), (N.constructors[e] = t);
                            });
                        }.apply(void 0, t);
                    }),
                    (e.attachStyle = function () {
                        return Q();
                    }),
                    (e.detachStyle = function () {
                        return (function () {
                            if ($ && 'undefined' != typeof window) {
                                var t = document.getElementById(q);
                                t &&
                                    t.parentNode &&
                                    (t.parentNode.removeChild(t), ($ = !1));
                            }
                        })();
                    }),
                    (e.version = '8.8.1'),
                    (e.ScrollbarPlugin = I),
                    e
                );
            })(Y);
            e.default = K;
        },
    ]).default;
});

/* END smooth scrollbar 8.8.1 */


/* END smooth scrollbar 8.8.1 */

/* START datepicker */

/*! jQuery UI - v1.13.2 - 2022-10-05
 * http://jqueryui.com
 * Includes: keycode.js, widgets/datepicker.js
 * Copyright jQuery Foundation and other contributors; Licensed MIT */

!(function (e) {
    'use strict';
    'function' == typeof define && define.amd
        ? define(['jquery'], e)
        : e(jQuery);
})(function (V) {
    'use strict';
    V.ui = V.ui || {};
    var n;
    (V.ui.version = '1.13.2'),
        (V.ui.keyCode = {
            BACKSPACE: 8,
            COMMA: 188,
            DELETE: 46,
            DOWN: 40,
            END: 35,
            ENTER: 13,
            ESCAPE: 27,
            HOME: 36,
            LEFT: 37,
            PAGE_DOWN: 34,
            PAGE_UP: 33,
            PERIOD: 190,
            RIGHT: 39,
            SPACE: 32,
            TAB: 9,
            UP: 38,
        });
    function e() {
        (this._curInst = null),
            (this._keyEvent = !1),
            (this._disabledInputs = []),
            (this._datepickerShowing = !1),
            (this._inDialog = !1),
            (this._mainDivId = 'ui-datepicker-div'),
            (this._inlineClass = 'ui-datepicker-inline'),
            (this._appendClass = 'ui-datepicker-append'),
            (this._triggerClass = 'ui-datepicker-trigger'),
            (this._dialogClass = 'ui-datepicker-dialog'),
            (this._disableClass = 'ui-datepicker-disabled'),
            (this._unselectableClass = 'ui-datepicker-unselectable'),
            (this._currentClass = 'ui-datepicker-current-day'),
            (this._dayOverClass = 'ui-datepicker-days-cell-over'),
            (this.regional = []),
            (this.regional[''] = {
                closeText: 'Done',
                prevText: 'Prev',
                nextText: 'Next',
                currentText: 'Today',
                monthNames: [
                    'January',
                    'February',
                    'March',
                    'April',
                    'May',
                    'June',
                    'July',
                    'August',
                    'September',
                    'October',
                    'November',
                    'December',
                ],
                monthNamesShort: [
                    'Jan',
                    'Feb',
                    'Mar',
                    'Apr',
                    'May',
                    'Jun',
                    'Jul',
                    'Aug',
                    'Sep',
                    'Oct',
                    'Nov',
                    'Dec',
                ],
                dayNames: [
                    'Sunday',
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                ],
                dayNamesShort: [
                    'Sun',
                    'Mon',
                    'Tue',
                    'Wed',
                    'Thu',
                    'Fri',
                    'Sat',
                ],
                dayNamesMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
                weekHeader: 'Wk',
                dateFormat: 'mm/dd/yy',
                firstDay: 0,
                isRTL: !1,
                showMonthAfterYear: !1,
                yearSuffix: '',
                selectMonthLabel: 'Select month',
                selectYearLabel: 'Select year',
            }),
            (this._defaults = {
                showOn: 'focus',
                showAnim: 'fadeIn',
                showOptions: {},
                defaultDate: null,
                appendText: '',
                buttonText: '...',
                buttonImage: '',
                buttonImageOnly: !1,
                hideIfNoPrevNext: !1,
                navigationAsDateFormat: !1,
                gotoCurrent: !1,
                changeMonth: !1,
                changeYear: !1,
                yearRange: 'c-10:c+10',
                showOtherMonths: !1,
                selectOtherMonths: !1,
                showWeek: !1,
                calculateWeek: this.iso8601Week,
                shortYearCutoff: '+10',
                minDate: null,
                maxDate: null,
                duration: 'fast',
                beforeShowDay: null,
                beforeShow: null,
                onSelect: null,
                onChangeMonthYear: null,
                onClose: null,
                onUpdateDatepicker: null,
                numberOfMonths: 1,
                showCurrentAtPos: 0,
                stepMonths: 1,
                stepBigMonths: 12,
                altField: '',
                altFormat: '',
                constrainInput: !0,
                showButtonPanel: !1,
                autoSize: !1,
                disabled: !1,
            }),
            V.extend(this._defaults, this.regional['']),
            (this.regional.en = V.extend(!0, {}, this.regional[''])),
            (this.regional['en-US'] = V.extend(!0, {}, this.regional.en)),
            (this.dpDiv = a(
                V(
                    "<div id='" +
                        this._mainDivId +
                        "' class='ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all'></div>"
                )
            ));
    }
    function a(e) {
        var t =
            'button, .ui-datepicker-prev, .ui-datepicker-next, .ui-datepicker-calendar td a';
        return e
            .on('mouseout', t, function () {
                V(this).removeClass('ui-state-hover'),
                    -1 !== this.className.indexOf('ui-datepicker-prev') &&
                        V(this).removeClass('ui-datepicker-prev-hover'),
                    -1 !== this.className.indexOf('ui-datepicker-next') &&
                        V(this).removeClass('ui-datepicker-next-hover');
            })
            .on('mouseover', t, d);
    }
    function d() {
        V.datepicker._isDisabledDatepicker(
            (n.inline ? n.dpDiv.parent() : n.input)[0]
        ) ||
            (V(this)
                .parents('.ui-datepicker-calendar')
                .find('a')
                .removeClass('ui-state-hover'),
            V(this).addClass('ui-state-hover'),
            -1 !== this.className.indexOf('ui-datepicker-prev') &&
                V(this).addClass('ui-datepicker-prev-hover'),
            -1 !== this.className.indexOf('ui-datepicker-next') &&
                V(this).addClass('ui-datepicker-next-hover'));
    }
    function o(e, t) {
        for (var a in (V.extend(e, t), t)) null == t[a] && (e[a] = t[a]);
        return e;
    }
    V.extend(V.ui, { datepicker: { version: '1.13.2' } }),
        V.extend(e.prototype, {
            markerClassName: 'hasDatepicker',
            maxRows: 4,
            _widgetDatepicker: function () {
                return this.dpDiv;
            },
            setDefaults: function (e) {
                return o(this._defaults, e || {}), this;
            },
            _attachDatepicker: function (e, t) {
                var a,
                    i = e.nodeName.toLowerCase(),
                    s = 'div' === i || 'span' === i;
                e.id || ((this.uuid += 1), (e.id = 'dp' + this.uuid)),
                    ((a = this._newInst(V(e), s)).settings = V.extend(
                        {},
                        t || {}
                    )),
                    'input' === i
                        ? this._connectDatepicker(e, a)
                        : s && this._inlineDatepicker(e, a);
            },
            _newInst: function (e, t) {
                return {
                    id: e[0].id.replace(/([^A-Za-z0-9_\-])/g, '\\\\$1'),
                    input: e,
                    selectedDay: 0,
                    selectedMonth: 0,
                    selectedYear: 0,
                    drawMonth: 0,
                    drawYear: 0,
                    inline: t,
                    dpDiv: t
                        ? a(
                              V(
                                  "<div class='" +
                                      this._inlineClass +
                                      " ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all'></div>"
                              )
                          )
                        : this.dpDiv,
                };
            },
            _connectDatepicker: function (e, t) {
                var a = V(e);
                (t.append = V([])),
                    (t.trigger = V([])),
                    a.hasClass(this.markerClassName) ||
                        (this._attachments(a, t),
                        a
                            .addClass(this.markerClassName)
                            .on('keydown', this._doKeyDown)
                            .on('keypress', this._doKeyPress)
                            .on('keyup', this._doKeyUp),
                        this._autoSize(t),
                        V.data(e, 'datepicker', t),
                        t.settings.disabled && this._disableDatepicker(e));
            },
            _attachments: function (e, t) {
                var a,
                    i = this._get(t, 'appendText'),
                    s = this._get(t, 'isRTL');
                t.append && t.append.remove(),
                    i &&
                        ((t.append = V('<span>')
                            .addClass(this._appendClass)
                            .text(i)),
                        e[s ? 'before' : 'after'](t.append)),
                    e.off('focus', this._showDatepicker),
                    t.trigger && t.trigger.remove(),
                    ('focus' !== (a = this._get(t, 'showOn')) &&
                        'both' !== a) ||
                        e.on('focus', this._showDatepicker),
                    ('button' !== a && 'both' !== a) ||
                        ((i = this._get(t, 'buttonText')),
                        (a = this._get(t, 'buttonImage')),
                        this._get(t, 'buttonImageOnly')
                            ? (t.trigger = V('<img>')
                                  .addClass(this._triggerClass)
                                  .attr({ src: a, alt: i, title: i }))
                            : ((t.trigger = V(
                                  "<button type='button'>"
                              ).addClass(this._triggerClass)),
                              a
                                  ? t.trigger.html(
                                        V('<img>').attr({
                                            src: a,
                                            alt: i,
                                            title: i,
                                        })
                                    )
                                  : t.trigger.text(i)),
                        e[s ? 'before' : 'after'](t.trigger),
                        t.trigger.on('click', function () {
                            return (
                                V.datepicker._datepickerShowing &&
                                V.datepicker._lastInput === e[0]
                                    ? V.datepicker._hideDatepicker()
                                    : (V.datepicker._datepickerShowing &&
                                          V.datepicker._lastInput !== e[0] &&
                                          V.datepicker._hideDatepicker(),
                                      V.datepicker._showDatepicker(e[0])),
                                !1
                            );
                        }));
            },
            _autoSize: function (e) {
                var t, a, i, s, r, n;
                this._get(e, 'autoSize') &&
                    !e.inline &&
                    ((r = new Date(2009, 11, 20)),
                    (n = this._get(e, 'dateFormat')).match(/[DM]/) &&
                        ((t = function (e) {
                            for (s = i = a = 0; s < e.length; s++)
                                e[s].length > a && ((a = e[s].length), (i = s));
                            return i;
                        }),
                        r.setMonth(
                            t(
                                this._get(
                                    e,
                                    n.match(/MM/)
                                        ? 'monthNames'
                                        : 'monthNamesShort'
                                )
                            )
                        ),
                        r.setDate(
                            t(
                                this._get(
                                    e,
                                    n.match(/DD/) ? 'dayNames' : 'dayNamesShort'
                                )
                            ) +
                                20 -
                                r.getDay()
                        )),
                    e.input.attr('size', this._formatDate(e, r).length));
            },
            _inlineDatepicker: function (e, t) {
                var a = V(e);
                a.hasClass(this.markerClassName) ||
                    (a.addClass(this.markerClassName).append(t.dpDiv),
                    V.data(e, 'datepicker', t),
                    this._setDate(t, this._getDefaultDate(t), !0),
                    this._updateDatepicker(t),
                    this._updateAlternate(t),
                    t.settings.disabled && this._disableDatepicker(e),
                    t.dpDiv.css('display', 'block'));
            },
            _dialogDatepicker: function (e, t, a, i, s) {
                var r,
                    n = this._dialogInst;
                return (
                    n ||
                        ((this.uuid += 1),
                        (r = 'dp' + this.uuid),
                        (this._dialogInput = V(
                            "<input type='text' id='" +
                                r +
                                "' style='position: absolute; top: -100px; width: 0px;'/>"
                        )),
                        this._dialogInput.on('keydown', this._doKeyDown),
                        V('body').append(this._dialogInput),
                        ((n = this._dialogInst =
                            this._newInst(this._dialogInput, !1)).settings =
                            {}),
                        V.data(this._dialogInput[0], 'datepicker', n)),
                    o(n.settings, i || {}),
                    (t =
                        t && t.constructor === Date
                            ? this._formatDate(n, t)
                            : t),
                    this._dialogInput.val(t),
                    (this._pos = s
                        ? s.length
                            ? s
                            : [s.pageX, s.pageY]
                        : null),
                    this._pos ||
                        ((r = document.documentElement.clientWidth),
                        (i = document.documentElement.clientHeight),
                        (t =
                            document.documentElement.scrollLeft ||
                            document.body.scrollLeft),
                        (s =
                            document.documentElement.scrollTop ||
                            document.body.scrollTop),
                        (this._pos = [r / 2 - 100 + t, i / 2 - 150 + s])),
                    this._dialogInput
                        .css('left', this._pos[0] + 20 + 'px')
                        .css('top', this._pos[1] + 'px'),
                    (n.settings.onSelect = a),
                    (this._inDialog = !0),
                    this.dpDiv.addClass(this._dialogClass),
                    this._showDatepicker(this._dialogInput[0]),
                    V.blockUI && V.blockUI(this.dpDiv),
                    V.data(this._dialogInput[0], 'datepicker', n),
                    this
                );
            },
            _destroyDatepicker: function (e) {
                var t,
                    a = V(e),
                    i = V.data(e, 'datepicker');
                a.hasClass(this.markerClassName) &&
                    ((t = e.nodeName.toLowerCase()),
                    V.removeData(e, 'datepicker'),
                    'input' === t
                        ? (i.append.remove(),
                          i.trigger.remove(),
                          a
                              .removeClass(this.markerClassName)
                              .off('focus', this._showDatepicker)
                              .off('keydown', this._doKeyDown)
                              .off('keypress', this._doKeyPress)
                              .off('keyup', this._doKeyUp))
                        : ('div' !== t && 'span' !== t) ||
                          a.removeClass(this.markerClassName).empty(),
                    n === i && ((n = null), (this._curInst = null)));
            },
            _enableDatepicker: function (t) {
                var e,
                    a = V(t),
                    i = V.data(t, 'datepicker');
                a.hasClass(this.markerClassName) &&
                    ('input' === (e = t.nodeName.toLowerCase())
                        ? ((t.disabled = !1),
                          i.trigger
                              .filter('button')
                              .each(function () {
                                  this.disabled = !1;
                              })
                              .end()
                              .filter('img')
                              .css({ opacity: '1.0', cursor: '' }))
                        : ('div' !== e && 'span' !== e) ||
                          ((a = a.children('.' + this._inlineClass))
                              .children()
                              .removeClass('ui-state-disabled'),
                          a
                              .find(
                                  'select.ui-datepicker-month, select.ui-datepicker-year'
                              )
                              .prop('disabled', !1)),
                    (this._disabledInputs = V.map(
                        this._disabledInputs,
                        function (e) {
                            return e === t ? null : e;
                        }
                    )));
            },
            _disableDatepicker: function (t) {
                var e,
                    a = V(t),
                    i = V.data(t, 'datepicker');
                a.hasClass(this.markerClassName) &&
                    ('input' === (e = t.nodeName.toLowerCase())
                        ? ((t.disabled = !0),
                          i.trigger
                              .filter('button')
                              .each(function () {
                                  this.disabled = !0;
                              })
                              .end()
                              .filter('img')
                              .css({ opacity: '0.5', cursor: 'default' }))
                        : ('div' !== e && 'span' !== e) ||
                          ((a = a.children('.' + this._inlineClass))
                              .children()
                              .addClass('ui-state-disabled'),
                          a
                              .find(
                                  'select.ui-datepicker-month, select.ui-datepicker-year'
                              )
                              .prop('disabled', !0)),
                    (this._disabledInputs = V.map(
                        this._disabledInputs,
                        function (e) {
                            return e === t ? null : e;
                        }
                    )),
                    (this._disabledInputs[this._disabledInputs.length] = t));
            },
            _isDisabledDatepicker: function (e) {
                if (!e) return !1;
                for (var t = 0; t < this._disabledInputs.length; t++)
                    if (this._disabledInputs[t] === e) return !0;
                return !1;
            },
            _getInst: function (e) {
                try {
                    return V.data(e, 'datepicker');
                } catch (e) {
                    throw 'Missing instance data for this datepicker';
                }
            },
            _optionDatepicker: function (e, t, a) {
                var i,
                    s,
                    r = this._getInst(e);
                if (2 === arguments.length && 'string' == typeof t)
                    return 'defaults' === t
                        ? V.extend({}, V.datepicker._defaults)
                        : r
                        ? 'all' === t
                            ? V.extend({}, r.settings)
                            : this._get(r, t)
                        : null;
                (i = t || {}),
                    'string' == typeof t && ((i = {})[t] = a),
                    r &&
                        (this._curInst === r && this._hideDatepicker(),
                        (s = this._getDateDatepicker(e, !0)),
                        (t = this._getMinMaxDate(r, 'min')),
                        (a = this._getMinMaxDate(r, 'max')),
                        o(r.settings, i),
                        null !== t &&
                            void 0 !== i.dateFormat &&
                            void 0 === i.minDate &&
                            (r.settings.minDate = this._formatDate(r, t)),
                        null !== a &&
                            void 0 !== i.dateFormat &&
                            void 0 === i.maxDate &&
                            (r.settings.maxDate = this._formatDate(r, a)),
                        'disabled' in i &&
                            (i.disabled
                                ? this._disableDatepicker(e)
                                : this._enableDatepicker(e)),
                        this._attachments(V(e), r),
                        this._autoSize(r),
                        this._setDate(r, s),
                        this._updateAlternate(r),
                        this._updateDatepicker(r));
            },
            _changeDatepicker: function (e, t, a) {
                this._optionDatepicker(e, t, a);
            },
            _refreshDatepicker: function (e) {
                e = this._getInst(e);
                e && this._updateDatepicker(e);
            },
            _setDateDatepicker: function (e, t) {
                e = this._getInst(e);
                e &&
                    (this._setDate(e, t),
                    this._updateDatepicker(e),
                    this._updateAlternate(e));
            },
            _getDateDatepicker: function (e, t) {
                e = this._getInst(e);
                return (
                    e && !e.inline && this._setDateFromField(e, t),
                    e ? this._getDate(e) : null
                );
            },
            _doKeyDown: function (e) {
                var t,
                    a,
                    i = V.datepicker._getInst(e.target),
                    s = !0,
                    r = i.dpDiv.is('.ui-datepicker-rtl');
                if (((i._keyEvent = !0), V.datepicker._datepickerShowing))
                    switch (e.keyCode) {
                        case 9:
                            V.datepicker._hideDatepicker(), (s = !1);
                            break;
                        case 13:
                            return (
                                (a = V(
                                    'td.' +
                                        V.datepicker._dayOverClass +
                                        ':not(.' +
                                        V.datepicker._currentClass +
                                        ')',
                                    i.dpDiv
                                ))[0] &&
                                    V.datepicker._selectDay(
                                        e.target,
                                        i.selectedMonth,
                                        i.selectedYear,
                                        a[0]
                                    ),
                                (t = V.datepicker._get(i, 'onSelect'))
                                    ? ((a = V.datepicker._formatDate(i)),
                                      t.apply(i.input ? i.input[0] : null, [
                                          a,
                                          i,
                                      ]))
                                    : V.datepicker._hideDatepicker(),
                                !1
                            );
                        case 27:
                            V.datepicker._hideDatepicker();
                            break;
                        case 33:
                            V.datepicker._adjustDate(
                                e.target,
                                e.ctrlKey
                                    ? -V.datepicker._get(i, 'stepBigMonths')
                                    : -V.datepicker._get(i, 'stepMonths'),
                                'M'
                            );
                            break;
                        case 34:
                            V.datepicker._adjustDate(
                                e.target,
                                e.ctrlKey
                                    ? +V.datepicker._get(i, 'stepBigMonths')
                                    : +V.datepicker._get(i, 'stepMonths'),
                                'M'
                            );
                            break;
                        case 35:
                            (e.ctrlKey || e.metaKey) &&
                                V.datepicker._clearDate(e.target),
                                (s = e.ctrlKey || e.metaKey);
                            break;
                        case 36:
                            (e.ctrlKey || e.metaKey) &&
                                V.datepicker._gotoToday(e.target),
                                (s = e.ctrlKey || e.metaKey);
                            break;
                        case 37:
                            (e.ctrlKey || e.metaKey) &&
                                V.datepicker._adjustDate(
                                    e.target,
                                    r ? 1 : -1,
                                    'D'
                                ),
                                (s = e.ctrlKey || e.metaKey),
                                e.originalEvent.altKey &&
                                    V.datepicker._adjustDate(
                                        e.target,
                                        e.ctrlKey
                                            ? -V.datepicker._get(
                                                  i,
                                                  'stepBigMonths'
                                              )
                                            : -V.datepicker._get(
                                                  i,
                                                  'stepMonths'
                                              ),
                                        'M'
                                    );
                            break;
                        case 38:
                            (e.ctrlKey || e.metaKey) &&
                                V.datepicker._adjustDate(e.target, -7, 'D'),
                                (s = e.ctrlKey || e.metaKey);
                            break;
                        case 39:
                            (e.ctrlKey || e.metaKey) &&
                                V.datepicker._adjustDate(
                                    e.target,
                                    r ? -1 : 1,
                                    'D'
                                ),
                                (s = e.ctrlKey || e.metaKey),
                                e.originalEvent.altKey &&
                                    V.datepicker._adjustDate(
                                        e.target,
                                        e.ctrlKey
                                            ? +V.datepicker._get(
                                                  i,
                                                  'stepBigMonths'
                                              )
                                            : +V.datepicker._get(
                                                  i,
                                                  'stepMonths'
                                              ),
                                        'M'
                                    );
                            break;
                        case 40:
                            (e.ctrlKey || e.metaKey) &&
                                V.datepicker._adjustDate(e.target, 7, 'D'),
                                (s = e.ctrlKey || e.metaKey);
                            break;
                        default:
                            s = !1;
                    }
                else
                    36 === e.keyCode && e.ctrlKey
                        ? V.datepicker._showDatepicker(this)
                        : (s = !1);
                s && (e.preventDefault(), e.stopPropagation());
            },
            _doKeyPress: function (e) {
                var t,
                    a = V.datepicker._getInst(e.target);
                if (V.datepicker._get(a, 'constrainInput'))
                    return (
                        (t = V.datepicker._possibleChars(
                            V.datepicker._get(a, 'dateFormat')
                        )),
                        (a = String.fromCharCode(
                            null == e.charCode ? e.keyCode : e.charCode
                        )),
                        e.ctrlKey ||
                            e.metaKey ||
                            a < ' ' ||
                            !t ||
                            -1 < t.indexOf(a)
                    );
            },
            _doKeyUp: function (e) {
                e = V.datepicker._getInst(e.target);
                if (e.input.val() !== e.lastVal)
                    try {
                        V.datepicker.parseDate(
                            V.datepicker._get(e, 'dateFormat'),
                            e.input ? e.input.val() : null,
                            V.datepicker._getFormatConfig(e)
                        ) &&
                            (V.datepicker._setDateFromField(e),
                            V.datepicker._updateAlternate(e),
                            V.datepicker._updateDatepicker(e));
                    } catch (e) {}
                return !0;
            },
            _showDatepicker: function (e) {
                var t, a, i, s;
                'input' !== (e = e.target || e).nodeName.toLowerCase() &&
                    (e = V('input', e.parentNode)[0]),
                    V.datepicker._isDisabledDatepicker(e) ||
                        V.datepicker._lastInput === e ||
                        ((s = V.datepicker._getInst(e)),
                        V.datepicker._curInst &&
                            V.datepicker._curInst !== s &&
                            (V.datepicker._curInst.dpDiv.stop(!0, !0),
                            s &&
                                V.datepicker._datepickerShowing &&
                                V.datepicker._hideDatepicker(
                                    V.datepicker._curInst.input[0]
                                )),
                        !1 !==
                            (a = (i = V.datepicker._get(s, 'beforeShow'))
                                ? i.apply(e, [e, s])
                                : {}) &&
                            (o(s.settings, a),
                            (s.lastVal = null),
                            (V.datepicker._lastInput = e),
                            V.datepicker._setDateFromField(s),
                            V.datepicker._inDialog && (e.value = ''),
                            V.datepicker._pos ||
                                ((V.datepicker._pos = V.datepicker._findPos(e)),
                                (V.datepicker._pos[1] += e.offsetHeight)),
                            (t = !1),
                            V(e)
                                .parents()
                                .each(function () {
                                    return !(t |=
                                        'fixed' === V(this).css('position'));
                                }),
                            (i = {
                                left: V.datepicker._pos[0],
                                top: V.datepicker._pos[1],
                            }),
                            (V.datepicker._pos = null),
                            s.dpDiv.empty(),
                            s.dpDiv.css({
                                position: 'absolute',
                                display: 'block',
                                top: '-1000px',
                            }),
                            V.datepicker._updateDatepicker(s),
                            (i = V.datepicker._checkOffset(s, i, t)),
                            s.dpDiv.css({
                                position:
                                    V.datepicker._inDialog && V.blockUI
                                        ? 'static'
                                        : t
                                        ? 'fixed'
                                        : 'absolute',
                                display: 'none',
                                left: i.left + 'px',
                                top: i.top + 'px',
                            }),
                            s.inline ||
                                ((a = V.datepicker._get(s, 'showAnim')),
                                (i = V.datepicker._get(s, 'duration')),
                                s.dpDiv.css(
                                    'z-index',
                                    (function (e) {
                                        for (
                                            var t, a;
                                            e.length && e[0] !== document;

                                        ) {
                                            if (
                                                ('absolute' ===
                                                    (t = e.css('position')) ||
                                                    'relative' === t ||
                                                    'fixed' === t) &&
                                                ((a = parseInt(
                                                    e.css('zIndex'),
                                                    10
                                                )),
                                                !isNaN(a) && 0 !== a)
                                            )
                                                return a;
                                            e = e.parent();
                                        }
                                        return 0;
                                    })(V(e)) + 1
                                ),
                                (V.datepicker._datepickerShowing = !0),
                                V.effects && V.effects.effect[a]
                                    ? s.dpDiv.show(
                                          a,
                                          V.datepicker._get(s, 'showOptions'),
                                          i
                                      )
                                    : s.dpDiv[a || 'show'](a ? i : null),
                                V.datepicker._shouldFocusInput(s) &&
                                    s.input.trigger('focus'),
                                (V.datepicker._curInst = s))));
            },
            _updateDatepicker: function (e) {
                (this.maxRows = 4),
                    (n = e).dpDiv.empty().append(this._generateHTML(e)),
                    this._attachHandlers(e);
                var t,
                    a = this._getNumberOfMonths(e),
                    i = a[1],
                    s = e.dpDiv.find('.' + this._dayOverClass + ' a'),
                    r = V.datepicker._get(e, 'onUpdateDatepicker');
                0 < s.length && d.apply(s.get(0)),
                    e.dpDiv
                        .removeClass(
                            'ui-datepicker-multi-2 ui-datepicker-multi-3 ui-datepicker-multi-4'
                        )
                        .width(''),
                    1 < i &&
                        e.dpDiv
                            .addClass('ui-datepicker-multi-' + i)
                            .css('width', 17 * i + 'em'),
                    e.dpDiv[
                        (1 !== a[0] || 1 !== a[1] ? 'add' : 'remove') + 'Class'
                    ]('ui-datepicker-multi'),
                    e.dpDiv[
                        (this._get(e, 'isRTL') ? 'add' : 'remove') + 'Class'
                    ]('ui-datepicker-rtl'),
                    e === V.datepicker._curInst &&
                        V.datepicker._datepickerShowing &&
                        V.datepicker._shouldFocusInput(e) &&
                        e.input.trigger('focus'),
                    e.yearshtml &&
                        ((t = e.yearshtml),
                        setTimeout(function () {
                            t === e.yearshtml &&
                                e.yearshtml &&
                                e.dpDiv
                                    .find('select.ui-datepicker-year')
                                    .first()
                                    .replaceWith(e.yearshtml),
                                (t = e.yearshtml = null);
                        }, 0)),
                    r && r.apply(e.input ? e.input[0] : null, [e]);
            },
            _shouldFocusInput: function (e) {
                return (
                    e.input &&
                    e.input.is(':visible') &&
                    !e.input.is(':disabled') &&
                    !e.input.is(':focus')
                );
            },
            _checkOffset: function (e, t, a) {
                var i = e.dpDiv.outerWidth(),
                    s = e.dpDiv.outerHeight(),
                    r = e.input ? e.input.outerWidth() : 0,
                    n = e.input ? e.input.outerHeight() : 0,
                    d =
                        document.documentElement.clientWidth +
                        (a ? 0 : V(document).scrollLeft()),
                    o =
                        document.documentElement.clientHeight +
                        (a ? 0 : V(document).scrollTop());
                return (
                    (t.left -= this._get(e, 'isRTL') ? i - r : 0),
                    (t.left -=
                        a && t.left === e.input.offset().left
                            ? V(document).scrollLeft()
                            : 0),
                    (t.top -=
                        a && t.top === e.input.offset().top + n
                            ? V(document).scrollTop()
                            : 0),
                    (t.left -= Math.min(
                        t.left,
                        t.left + i > d && i < d ? Math.abs(t.left + i - d) : 0
                    )),
                    (t.top -= Math.min(
                        t.top,
                        t.top + s > o && s < o ? Math.abs(s + n) : 0
                    )),
                    t
                );
            },
            _findPos: function (e) {
                for (
                    var t = this._getInst(e), a = this._get(t, 'isRTL');
                    e &&
                    ('hidden' === e.type ||
                        1 !== e.nodeType ||
                        V.expr.pseudos.hidden(e));

                )
                    e = e[a ? 'previousSibling' : 'nextSibling'];
                return [(t = V(e).offset()).left, t.top];
            },
            _hideDatepicker: function (e) {
                var t,
                    a,
                    i = this._curInst;
                !i ||
                    (e && i !== V.data(e, 'datepicker')) ||
                    (this._datepickerShowing &&
                        ((t = this._get(i, 'showAnim')),
                        (a = this._get(i, 'duration')),
                        (e = function () {
                            V.datepicker._tidyDialog(i);
                        }),
                        V.effects && (V.effects.effect[t] || V.effects[t])
                            ? i.dpDiv.hide(
                                  t,
                                  V.datepicker._get(i, 'showOptions'),
                                  a,
                                  e
                              )
                            : i.dpDiv[
                                  'slideDown' === t
                                      ? 'slideUp'
                                      : 'fadeIn' === t
                                      ? 'fadeOut'
                                      : 'hide'
                              ](t ? a : null, e),
                        t || e(),
                        (this._datepickerShowing = !1),
                        (e = this._get(i, 'onClose')) &&
                            e.apply(i.input ? i.input[0] : null, [
                                i.input ? i.input.val() : '',
                                i,
                            ]),
                        (this._lastInput = null),
                        this._inDialog &&
                            (this._dialogInput.css({
                                position: 'absolute',
                                left: '0',
                                top: '-100px',
                            }),
                            V.blockUI &&
                                (V.unblockUI(), V('body').append(this.dpDiv))),
                        (this._inDialog = !1)));
            },
            _tidyDialog: function (e) {
                e.dpDiv
                    .removeClass(this._dialogClass)
                    .off('.ui-datepicker-calendar');
            },
            _checkExternalClick: function (e) {
                var t;
                V.datepicker._curInst &&
                    ((t = V(e.target)),
                    (e = V.datepicker._getInst(t[0])),
                    ((t[0].id === V.datepicker._mainDivId ||
                        0 !== t.parents('#' + V.datepicker._mainDivId).length ||
                        t.hasClass(V.datepicker.markerClassName) ||
                        t.closest('.' + V.datepicker._triggerClass).length ||
                        !V.datepicker._datepickerShowing ||
                        (V.datepicker._inDialog && V.blockUI)) &&
                        (!t.hasClass(V.datepicker.markerClassName) ||
                            V.datepicker._curInst === e)) ||
                        V.datepicker._hideDatepicker());
            },
            _adjustDate: function (e, t, a) {
                var i = V(e),
                    e = this._getInst(i[0]);
                this._isDisabledDatepicker(i[0]) ||
                    (this._adjustInstDate(e, t, a), this._updateDatepicker(e));
            },
            _gotoToday: function (e) {
                var t = V(e),
                    a = this._getInst(t[0]);
                this._get(a, 'gotoCurrent') && a.currentDay
                    ? ((a.selectedDay = a.currentDay),
                      (a.drawMonth = a.selectedMonth = a.currentMonth),
                      (a.drawYear = a.selectedYear = a.currentYear))
                    : ((e = new Date()),
                      (a.selectedDay = e.getDate()),
                      (a.drawMonth = a.selectedMonth = e.getMonth()),
                      (a.drawYear = a.selectedYear = e.getFullYear())),
                    this._notifyChange(a),
                    this._adjustDate(t);
            },
            _selectMonthYear: function (e, t, a) {
                var i = V(e),
                    e = this._getInst(i[0]);
                (e['selected' + ('M' === a ? 'Month' : 'Year')] = e[
                    'draw' + ('M' === a ? 'Month' : 'Year')
                ] =
                    parseInt(t.options[t.selectedIndex].value, 10)),
                    this._notifyChange(e),
                    this._adjustDate(i);
            },
            _selectDay: function (e, t, a, i) {
                var s = V(e);
                V(i).hasClass(this._unselectableClass) ||
                    this._isDisabledDatepicker(s[0]) ||
                    (((s = this._getInst(s[0])).selectedDay = s.currentDay =
                        parseInt(V('a', i).attr('data-date'))),
                    (s.selectedMonth = s.currentMonth = t),
                    (s.selectedYear = s.currentYear = a),
                    this._selectDate(
                        e,
                        this._formatDate(
                            s,
                            s.currentDay,
                            s.currentMonth,
                            s.currentYear
                        )
                    ));
            },
            _clearDate: function (e) {
                e = V(e);
                this._selectDate(e, '');
            },
            _selectDate: function (e, t) {
                var a = V(e),
                    e = this._getInst(a[0]);
                (t = null != t ? t : this._formatDate(e)),
                    e.input && e.input.val(t),
                    this._updateAlternate(e),
                    (a = this._get(e, 'onSelect'))
                        ? a.apply(e.input ? e.input[0] : null, [t, e])
                        : e.input && e.input.trigger('change'),
                    e.inline
                        ? this._updateDatepicker(e)
                        : (this._hideDatepicker(),
                          (this._lastInput = e.input[0]),
                          'object' != typeof e.input[0] &&
                              e.input.trigger('focus'),
                          (this._lastInput = null));
            },
            _updateAlternate: function (e) {
                var t,
                    a,
                    i = this._get(e, 'altField');
                i &&
                    ((t =
                        this._get(e, 'altFormat') ||
                        this._get(e, 'dateFormat')),
                    (a = this._getDate(e)),
                    (e = this.formatDate(t, a, this._getFormatConfig(e))),
                    V(document).find(i).val(e));
            },
            noWeekends: function (e) {
                e = e.getDay();
                return [0 < e && e < 6, ''];
            },
            iso8601Week: function (e) {
                var t = new Date(e.getTime());
                return (
                    t.setDate(t.getDate() + 4 - (t.getDay() || 7)),
                    (e = t.getTime()),
                    t.setMonth(0),
                    t.setDate(1),
                    Math.floor(Math.round((e - t) / 864e5) / 7) + 1
                );
            },
            parseDate: function (t, s, e) {
                if (null == t || null == s) throw 'Invalid arguments';
                if ('' === (s = 'object' == typeof s ? s.toString() : s + ''))
                    return null;
                for (
                    var a,
                        i,
                        r,
                        n = 0,
                        d =
                            (e ? e.shortYearCutoff : null) ||
                            this._defaults.shortYearCutoff,
                        d =
                            'string' != typeof d
                                ? d
                                : (new Date().getFullYear() % 100) +
                                  parseInt(d, 10),
                        o =
                            (e ? e.dayNamesShort : null) ||
                            this._defaults.dayNamesShort,
                        c = (e ? e.dayNames : null) || this._defaults.dayNames,
                        l =
                            (e ? e.monthNamesShort : null) ||
                            this._defaults.monthNamesShort,
                        h =
                            (e ? e.monthNames : null) ||
                            this._defaults.monthNames,
                        u = -1,
                        p = -1,
                        g = -1,
                        _ = -1,
                        f = !1,
                        k = function (e) {
                            e = v + 1 < t.length && t.charAt(v + 1) === e;
                            return e && v++, e;
                        },
                        D = function (e) {
                            var t = k(e),
                                t =
                                    '@' === e
                                        ? 14
                                        : '!' === e
                                        ? 20
                                        : 'y' === e && t
                                        ? 4
                                        : 'o' === e
                                        ? 3
                                        : 2,
                                t = new RegExp(
                                    '^\\d{' +
                                        ('y' === e ? t : 1) +
                                        ',' +
                                        t +
                                        '}'
                                ),
                                t = s.substring(n).match(t);
                            if (!t) throw 'Missing number at position ' + n;
                            return (n += t[0].length), parseInt(t[0], 10);
                        },
                        m = function (e, t, a) {
                            var i = -1,
                                t = V.map(k(e) ? a : t, function (e, t) {
                                    return [[t, e]];
                                }).sort(function (e, t) {
                                    return -(e[1].length - t[1].length);
                                });
                            if (
                                (V.each(t, function (e, t) {
                                    var a = t[1];
                                    if (
                                        s.substr(n, a.length).toLowerCase() ===
                                        a.toLowerCase()
                                    )
                                        return (i = t[0]), (n += a.length), !1;
                                }),
                                -1 !== i)
                            )
                                return i + 1;
                            throw 'Unknown name at position ' + n;
                        },
                        y = function () {
                            if (s.charAt(n) !== t.charAt(v))
                                throw 'Unexpected literal at position ' + n;
                            n++;
                        },
                        v = 0;
                    v < t.length;
                    v++
                )
                    if (f) "'" !== t.charAt(v) || k("'") ? y() : (f = !1);
                    else
                        switch (t.charAt(v)) {
                            case 'd':
                                g = D('d');
                                break;
                            case 'D':
                                m('D', o, c);
                                break;
                            case 'o':
                                _ = D('o');
                                break;
                            case 'm':
                                p = D('m');
                                break;
                            case 'M':
                                p = m('M', l, h);
                                break;
                            case 'y':
                                u = D('y');
                                break;
                            case '@':
                                (u = (r = new Date(D('@'))).getFullYear()),
                                    (p = r.getMonth() + 1),
                                    (g = r.getDate());
                                break;
                            case '!':
                                (u = (r = new Date(
                                    (D('!') - this._ticksTo1970) / 1e4
                                )).getFullYear()),
                                    (p = r.getMonth() + 1),
                                    (g = r.getDate());
                                break;
                            case "'":
                                k("'") ? y() : (f = !0);
                                break;
                            default:
                                y();
                        }
                if (n < s.length && ((i = s.substr(n)), !/^\s+/.test(i)))
                    throw 'Extra/unparsed characters found in date: ' + i;
                if (
                    (-1 === u
                        ? (u = new Date().getFullYear())
                        : u < 100 &&
                          (u +=
                              new Date().getFullYear() -
                              (new Date().getFullYear() % 100) +
                              (u <= d ? 0 : -100)),
                    -1 < _)
                )
                    for (p = 1, g = _; ; ) {
                        if (g <= (a = this._getDaysInMonth(u, p - 1))) break;
                        p++, (g -= a);
                    }
                if (
                    (r = this._daylightSavingAdjust(
                        new Date(u, p - 1, g)
                    )).getFullYear() !== u ||
                    r.getMonth() + 1 !== p ||
                    r.getDate() !== g
                )
                    throw 'Invalid date';
                return r;
            },
            ATOM: 'yy-mm-dd',
            COOKIE: 'D, dd M yy',
            ISO_8601: 'yy-mm-dd',
            RFC_822: 'D, d M y',
            RFC_850: 'DD, dd-M-y',
            RFC_1036: 'D, d M y',
            RFC_1123: 'D, d M yy',
            RFC_2822: 'D, d M yy',
            RSS: 'D, d M y',
            TICKS: '!',
            TIMESTAMP: '@',
            W3C: 'yy-mm-dd',
            _ticksTo1970:
                24 *
                (718685 +
                    Math.floor(492.5) -
                    Math.floor(19.7) +
                    Math.floor(4.925)) *
                60 *
                60 *
                1e7,
            formatDate: function (t, e, a) {
                if (!e) return '';
                function i(e, t, a) {
                    var i = '' + t;
                    if (l(e)) for (; i.length < a; ) i = '0' + i;
                    return i;
                }
                function s(e, t, a, i) {
                    return (l(e) ? i : a)[t];
                }
                var r,
                    n =
                        (a ? a.dayNamesShort : null) ||
                        this._defaults.dayNamesShort,
                    d = (a ? a.dayNames : null) || this._defaults.dayNames,
                    o =
                        (a ? a.monthNamesShort : null) ||
                        this._defaults.monthNamesShort,
                    c = (a ? a.monthNames : null) || this._defaults.monthNames,
                    l = function (e) {
                        e = r + 1 < t.length && t.charAt(r + 1) === e;
                        return e && r++, e;
                    },
                    h = '',
                    u = !1;
                if (e)
                    for (r = 0; r < t.length; r++)
                        if (u)
                            "'" !== t.charAt(r) || l("'")
                                ? (h += t.charAt(r))
                                : (u = !1);
                        else
                            switch (t.charAt(r)) {
                                case 'd':
                                    h += i('d', e.getDate(), 2);
                                    break;
                                case 'D':
                                    h += s('D', e.getDay(), n, d);
                                    break;
                                case 'o':
                                    h += i(
                                        'o',
                                        Math.round(
                                            (new Date(
                                                e.getFullYear(),
                                                e.getMonth(),
                                                e.getDate()
                                            ).getTime() -
                                                new Date(
                                                    e.getFullYear(),
                                                    0,
                                                    0
                                                ).getTime()) /
                                                864e5
                                        ),
                                        3
                                    );
                                    break;
                                case 'm':
                                    h += i('m', e.getMonth() + 1, 2);
                                    break;
                                case 'M':
                                    h += s('M', e.getMonth(), o, c);
                                    break;
                                case 'y':
                                    h += l('y')
                                        ? e.getFullYear()
                                        : (e.getFullYear() % 100 < 10
                                              ? '0'
                                              : '') +
                                          (e.getFullYear() % 100);
                                    break;
                                case '@':
                                    h += e.getTime();
                                    break;
                                case '!':
                                    h += 1e4 * e.getTime() + this._ticksTo1970;
                                    break;
                                case "'":
                                    l("'") ? (h += "'") : (u = !0);
                                    break;
                                default:
                                    h += t.charAt(r);
                            }
                return h;
            },
            _possibleChars: function (t) {
                for (
                    var e = '',
                        a = !1,
                        i = function (e) {
                            e = s + 1 < t.length && t.charAt(s + 1) === e;
                            return e && s++, e;
                        },
                        s = 0;
                    s < t.length;
                    s++
                )
                    if (a)
                        "'" !== t.charAt(s) || i("'")
                            ? (e += t.charAt(s))
                            : (a = !1);
                    else
                        switch (t.charAt(s)) {
                            case 'd':
                            case 'm':
                            case 'y':
                            case '@':
                                e += '0123456789';
                                break;
                            case 'D':
                            case 'M':
                                return null;
                            case "'":
                                i("'") ? (e += "'") : (a = !0);
                                break;
                            default:
                                e += t.charAt(s);
                        }
                return e;
            },
            _get: function (e, t) {
                return (void 0 !== e.settings[t] ? e.settings : this._defaults)[
                    t
                ];
            },
            _setDateFromField: function (e, t) {
                if (e.input.val() !== e.lastVal) {
                    var a = this._get(e, 'dateFormat'),
                        i = (e.lastVal = e.input ? e.input.val() : null),
                        s = this._getDefaultDate(e),
                        r = s,
                        n = this._getFormatConfig(e);
                    try {
                        r = this.parseDate(a, i, n) || s;
                    } catch (e) {
                        i = t ? '' : i;
                    }
                    (e.selectedDay = r.getDate()),
                        (e.drawMonth = e.selectedMonth = r.getMonth()),
                        (e.drawYear = e.selectedYear = r.getFullYear()),
                        (e.currentDay = i ? r.getDate() : 0),
                        (e.currentMonth = i ? r.getMonth() : 0),
                        (e.currentYear = i ? r.getFullYear() : 0),
                        this._adjustInstDate(e);
                }
            },
            _getDefaultDate: function (e) {
                return this._restrictMinMax(
                    e,
                    this._determineDate(
                        e,
                        this._get(e, 'defaultDate'),
                        new Date()
                    )
                );
            },
            _determineDate: function (d, e, t) {
                var a,
                    i,
                    e =
                        null == e || '' === e
                            ? t
                            : 'string' == typeof e
                            ? (function (e) {
                                  try {
                                      return V.datepicker.parseDate(
                                          V.datepicker._get(d, 'dateFormat'),
                                          e,
                                          V.datepicker._getFormatConfig(d)
                                      );
                                  } catch (e) {}
                                  for (
                                      var t =
                                              (e.toLowerCase().match(/^c/)
                                                  ? V.datepicker._getDate(d)
                                                  : null) || new Date(),
                                          a = t.getFullYear(),
                                          i = t.getMonth(),
                                          s = t.getDate(),
                                          r =
                                              /([+\-]?[0-9]+)\s*(d|D|w|W|m|M|y|Y)?/g,
                                          n = r.exec(e);
                                      n;

                                  ) {
                                      switch (n[2] || 'd') {
                                          case 'd':
                                          case 'D':
                                              s += parseInt(n[1], 10);
                                              break;
                                          case 'w':
                                          case 'W':
                                              s += 7 * parseInt(n[1], 10);
                                              break;
                                          case 'm':
                                          case 'M':
                                              (i += parseInt(n[1], 10)),
                                                  (s = Math.min(
                                                      s,
                                                      V.datepicker._getDaysInMonth(
                                                          a,
                                                          i
                                                      )
                                                  ));
                                              break;
                                          case 'y':
                                          case 'Y':
                                              (a += parseInt(n[1], 10)),
                                                  (s = Math.min(
                                                      s,
                                                      V.datepicker._getDaysInMonth(
                                                          a,
                                                          i
                                                      )
                                                  ));
                                      }
                                      n = r.exec(e);
                                  }
                                  return new Date(a, i, s);
                              })(e)
                            : 'number' == typeof e
                            ? isNaN(e)
                                ? t
                                : ((a = e),
                                  (i = new Date()).setDate(i.getDate() + a),
                                  i)
                            : new Date(e.getTime());
                return (
                    (e = e && 'Invalid Date' === e.toString() ? t : e) &&
                        (e.setHours(0),
                        e.setMinutes(0),
                        e.setSeconds(0),
                        e.setMilliseconds(0)),
                    this._daylightSavingAdjust(e)
                );
            },
            _daylightSavingAdjust: function (e) {
                return e
                    ? (e.setHours(12 < e.getHours() ? e.getHours() + 2 : 0), e)
                    : null;
            },
            _setDate: function (e, t, a) {
                var i = !t,
                    s = e.selectedMonth,
                    r = e.selectedYear,
                    t = this._restrictMinMax(
                        e,
                        this._determineDate(e, t, new Date())
                    );
                (e.selectedDay = e.currentDay = t.getDate()),
                    (e.drawMonth =
                        e.selectedMonth =
                        e.currentMonth =
                            t.getMonth()),
                    (e.drawYear =
                        e.selectedYear =
                        e.currentYear =
                            t.getFullYear()),
                    (s === e.selectedMonth && r === e.selectedYear) ||
                        a ||
                        this._notifyChange(e),
                    this._adjustInstDate(e),
                    e.input && e.input.val(i ? '' : this._formatDate(e));
            },
            _getDate: function (e) {
                return !e.currentYear || (e.input && '' === e.input.val())
                    ? null
                    : this._daylightSavingAdjust(
                          new Date(e.currentYear, e.currentMonth, e.currentDay)
                      );
            },
            _attachHandlers: function (e) {
                var t = this._get(e, 'stepMonths'),
                    a = '#' + e.id.replace(/\\\\/g, '\\');
                e.dpDiv.find('[data-handler]').map(function () {
                    var e = {
                        prev: function () {
                            V.datepicker._adjustDate(a, -t, 'M');
                        },
                        next: function () {
                            V.datepicker._adjustDate(a, +t, 'M');
                        },
                        hide: function () {
                            V.datepicker._hideDatepicker();
                        },
                        today: function () {
                            V.datepicker._gotoToday(a);
                        },
                        selectDay: function () {
                            return (
                                V.datepicker._selectDay(
                                    a,
                                    +this.getAttribute('data-month'),
                                    +this.getAttribute('data-year'),
                                    this
                                ),
                                !1
                            );
                        },
                        selectMonth: function () {
                            return (
                                V.datepicker._selectMonthYear(a, this, 'M'), !1
                            );
                        },
                        selectYear: function () {
                            return (
                                V.datepicker._selectMonthYear(a, this, 'Y'), !1
                            );
                        },
                    };
                    V(this).on(
                        this.getAttribute('data-event'),
                        e[this.getAttribute('data-handler')]
                    );
                });
            },
            _generateHTML: function (e) {
                var t,
                    a,
                    i,
                    s,
                    r,
                    n,
                    d,
                    o,
                    c,
                    l,
                    h,
                    u,
                    p,
                    g,
                    _,
                    f,
                    k,
                    D,
                    m,
                    y,
                    v,
                    M,
                    b,
                    w,
                    C,
                    I,
                    x,
                    Y,
                    S,
                    N,
                    T,
                    F,
                    A = new Date(),
                    K = this._daylightSavingAdjust(
                        new Date(A.getFullYear(), A.getMonth(), A.getDate())
                    ),
                    j = this._get(e, 'isRTL'),
                    O = this._get(e, 'showButtonPanel'),
                    E = this._get(e, 'hideIfNoPrevNext'),
                    L = this._get(e, 'navigationAsDateFormat'),
                    R = this._getNumberOfMonths(e),
                    H = this._get(e, 'showCurrentAtPos'),
                    A = this._get(e, 'stepMonths'),
                    P = 1 !== R[0] || 1 !== R[1],
                    W = this._daylightSavingAdjust(
                        e.currentDay
                            ? new Date(
                                  e.currentYear,
                                  e.currentMonth,
                                  e.currentDay
                              )
                            : new Date(9999, 9, 9)
                    ),
                    U = this._getMinMaxDate(e, 'min'),
                    z = this._getMinMaxDate(e, 'max'),
                    B = e.drawMonth - H,
                    J = e.drawYear;
                if ((B < 0 && ((B += 12), J--), z))
                    for (
                        t = this._daylightSavingAdjust(
                            new Date(
                                z.getFullYear(),
                                z.getMonth() - R[0] * R[1] + 1,
                                z.getDate()
                            )
                        ),
                            t = U && t < U ? U : t;
                        this._daylightSavingAdjust(new Date(J, B, 1)) > t;

                    )
                        --B < 0 && ((B = 11), J--);
                for (
                    e.drawMonth = B,
                        e.drawYear = J,
                        H = this._get(e, 'prevText'),
                        H = L
                            ? this.formatDate(
                                  H,
                                  this._daylightSavingAdjust(
                                      new Date(J, B - A, 1)
                                  ),
                                  this._getFormatConfig(e)
                              )
                            : H,
                        a = this._canAdjustMonth(e, -1, J, B)
                            ? V('<a>')
                                  .attr({
                                      class: 'ui-datepicker-prev ui-corner-all',
                                      'data-handler': 'prev',
                                      'data-event': 'click',
                                      title: H,
                                  })
                                  .append(
                                      V('<span>')
                                          .addClass(
                                              'ui-icon ui-icon-circle-triangle-' +
                                                  (j ? 'e' : 'w')
                                          )
                                          .text(H)
                                  )[0].outerHTML
                            : E
                            ? ''
                            : V('<a>')
                                  .attr({
                                      class: 'ui-datepicker-prev ui-corner-all ui-state-disabled',
                                      title: H,
                                  })
                                  .append(
                                      V('<span>')
                                          .addClass(
                                              'ui-icon ui-icon-circle-triangle-' +
                                                  (j ? 'e' : 'w')
                                          )
                                          .text(H)
                                  )[0].outerHTML,
                        H = this._get(e, 'nextText'),
                        H = L
                            ? this.formatDate(
                                  H,
                                  this._daylightSavingAdjust(
                                      new Date(J, B + A, 1)
                                  ),
                                  this._getFormatConfig(e)
                              )
                            : H,
                        i = this._canAdjustMonth(e, 1, J, B)
                            ? V('<a>')
                                  .attr({
                                      class: 'ui-datepicker-next ui-corner-all',
                                      'data-handler': 'next',
                                      'data-event': 'click',
                                      title: H,
                                  })
                                  .append(
                                      V('<span>')
                                          .addClass(
                                              'ui-icon ui-icon-circle-triangle-' +
                                                  (j ? 'w' : 'e')
                                          )
                                          .text(H)
                                  )[0].outerHTML
                            : E
                            ? ''
                            : V('<a>')
                                  .attr({
                                      class: 'ui-datepicker-next ui-corner-all ui-state-disabled',
                                      title: H,
                                  })
                                  .append(
                                      V('<span>')
                                          .attr(
                                              'class',
                                              'ui-icon ui-icon-circle-triangle-' +
                                                  (j ? 'w' : 'e')
                                          )
                                          .text(H)
                                  )[0].outerHTML,
                        A = this._get(e, 'currentText'),
                        E = this._get(e, 'gotoCurrent') && e.currentDay ? W : K,
                        A = L
                            ? this.formatDate(A, E, this._getFormatConfig(e))
                            : A,
                        H = '',
                        e.inline ||
                            (H = V('<button>')
                                .attr({
                                    type: 'button',
                                    class: 'ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all',
                                    'data-handler': 'hide',
                                    'data-event': 'click',
                                })
                                .text(this._get(e, 'closeText'))[0].outerHTML),
                        L = '',
                        O &&
                            (L = V(
                                "<div class='ui-datepicker-buttonpane ui-widget-content'>"
                            )
                                .append(j ? H : '')
                                .append(
                                    this._isInRange(e, E)
                                        ? V('<button>')
                                              .attr({
                                                  type: 'button',
                                                  class: 'ui-datepicker-current ui-state-default ui-priority-secondary ui-corner-all',
                                                  'data-handler': 'today',
                                                  'data-event': 'click',
                                              })
                                              .text(A)
                                        : ''
                                )
                                .append(j ? '' : H)[0].outerHTML),
                        s = parseInt(this._get(e, 'firstDay'), 10),
                        s = isNaN(s) ? 0 : s,
                        r = this._get(e, 'showWeek'),
                        n = this._get(e, 'dayNames'),
                        d = this._get(e, 'dayNamesMin'),
                        o = this._get(e, 'monthNames'),
                        c = this._get(e, 'monthNamesShort'),
                        l = this._get(e, 'beforeShowDay'),
                        h = this._get(e, 'showOtherMonths'),
                        u = this._get(e, 'selectOtherMonths'),
                        p = this._getDefaultDate(e),
                        g = '',
                        f = 0;
                    f < R[0];
                    f++
                ) {
                    for (k = '', this.maxRows = 4, D = 0; D < R[1]; D++) {
                        if (
                            ((m = this._daylightSavingAdjust(
                                new Date(J, B, e.selectedDay)
                            )),
                            (y = ' ui-corner-all'),
                            (v = ''),
                            P)
                        ) {
                            if (
                                ((v += "<div class='ui-datepicker-group"),
                                1 < R[1])
                            )
                                switch (D) {
                                    case 0:
                                        (v += ' ui-datepicker-group-first'),
                                            (y =
                                                ' ui-corner-' +
                                                (j ? 'right' : 'left'));
                                        break;
                                    case R[1] - 1:
                                        (v += ' ui-datepicker-group-last'),
                                            (y =
                                                ' ui-corner-' +
                                                (j ? 'left' : 'right'));
                                        break;
                                    default:
                                        (v += ' ui-datepicker-group-middle'),
                                            (y = '');
                                }
                            v += "'>";
                        }
                        for (
                            v +=
                                "<div class='ui-datepicker-header ui-widget-header ui-helper-clearfix" +
                                y +
                                "'>" +
                                (/all|left/.test(y) && 0 === f
                                    ? j
                                        ? i
                                        : a
                                    : '') +
                                (/all|right/.test(y) && 0 === f
                                    ? j
                                        ? a
                                        : i
                                    : '') +
                                this._generateMonthYearHeader(
                                    e,
                                    B,
                                    J,
                                    U,
                                    z,
                                    0 < f || 0 < D,
                                    o,
                                    c
                                ) +
                                "</div><table class='ui-datepicker-calendar'><thead><tr>",
                                M = r
                                    ? "<th class='ui-datepicker-week-col'>" +
                                      this._get(e, 'weekHeader') +
                                      '</th>'
                                    : '',
                                _ = 0;
                            _ < 7;
                            _++
                        )
                            M +=
                                "<th scope='col'" +
                                (5 <= (_ + s + 6) % 7
                                    ? " class='ui-datepicker-week-end'"
                                    : '') +
                                "><span title='" +
                                n[(b = (_ + s) % 7)] +
                                "'>" +
                                d[b] +
                                '</span></th>';
                        for (
                            v += M + '</tr></thead><tbody>',
                                C = this._getDaysInMonth(J, B),
                                J === e.selectedYear &&
                                    B === e.selectedMonth &&
                                    (e.selectedDay = Math.min(
                                        e.selectedDay,
                                        C
                                    )),
                                w =
                                    (this._getFirstDayOfMonth(J, B) - s + 7) %
                                    7,
                                C = Math.ceil((w + C) / 7),
                                I = P && this.maxRows > C ? this.maxRows : C,
                                this.maxRows = I,
                                x = this._daylightSavingAdjust(
                                    new Date(J, B, 1 - w)
                                ),
                                Y = 0;
                            Y < I;
                            Y++
                        ) {
                            for (
                                v += '<tr>',
                                    S = r
                                        ? "<td class='ui-datepicker-week-col'>" +
                                          this._get(e, 'calculateWeek')(x) +
                                          '</td>'
                                        : '',
                                    _ = 0;
                                _ < 7;
                                _++
                            )
                                (N = l
                                    ? l.apply(e.input ? e.input[0] : null, [x])
                                    : [!0, '']),
                                    (F =
                                        ((T = x.getMonth() !== B) && !u) ||
                                        !N[0] ||
                                        (U && x < U) ||
                                        (z && z < x)),
                                    (S +=
                                        "<td class='" +
                                        (5 <= (_ + s + 6) % 7
                                            ? ' ui-datepicker-week-end'
                                            : '') +
                                        (T
                                            ? ' ui-datepicker-other-month'
                                            : '') +
                                        ((x.getTime() === m.getTime() &&
                                            B === e.selectedMonth &&
                                            e._keyEvent) ||
                                        (p.getTime() === x.getTime() &&
                                            p.getTime() === m.getTime())
                                            ? ' ' + this._dayOverClass
                                            : '') +
                                        (F
                                            ? ' ' +
                                              this._unselectableClass +
                                              ' ui-state-disabled'
                                            : '') +
                                        (T && !h
                                            ? ''
                                            : ' ' +
                                              N[1] +
                                              (x.getTime() === W.getTime()
                                                  ? ' ' + this._currentClass
                                                  : '') +
                                              (x.getTime() === K.getTime()
                                                  ? ' ui-datepicker-today'
                                                  : '')) +
                                        "'" +
                                        ((T && !h) || !N[2]
                                            ? ''
                                            : " title='" +
                                              N[2].replace(/'/g, '&#39;') +
                                              "'") +
                                        (F
                                            ? ''
                                            : " data-handler='selectDay' data-event='click' data-month='" +
                                              x.getMonth() +
                                              "' data-year='" +
                                              x.getFullYear() +
                                              "'") +
                                        '>' +
                                        (T && !h
                                            ? '&#xa0;'
                                            : F
                                            ? "<span class='ui-state-default'>" +
                                              x.getDate() +
                                              '</span>'
                                            : "<a class='ui-state-default" +
                                              (x.getTime() === K.getTime()
                                                  ? ' ui-state-highlight'
                                                  : '') +
                                              (x.getTime() === W.getTime()
                                                  ? ' ui-state-active'
                                                  : '') +
                                              (T
                                                  ? ' ui-priority-secondary'
                                                  : '') +
                                              "' href='#' aria-current='" +
                                              (x.getTime() === W.getTime()
                                                  ? 'true'
                                                  : 'false') +
                                              "' data-date='" +
                                              x.getDate() +
                                              "'>" +
                                              x.getDate() +
                                              '</a>') +
                                        '</td>'),
                                    x.setDate(x.getDate() + 1),
                                    (x = this._daylightSavingAdjust(x));
                            v += S + '</tr>';
                        }
                        11 < ++B && ((B = 0), J++),
                            (k += v +=
                                '</tbody></table>' +
                                (P
                                    ? '</div>' +
                                      (0 < R[0] && D === R[1] - 1
                                          ? "<div class='ui-datepicker-row-break'></div>"
                                          : '')
                                    : ''));
                    }
                    g += k;
                }
                return (g += L), (e._keyEvent = !1), g;
            },
            _generateMonthYearHeader: function (e, t, a, i, s, r, n, d) {
                var o,
                    c,
                    l,
                    h,
                    u,
                    p,
                    g = this._get(e, 'changeMonth'),
                    _ = this._get(e, 'changeYear'),
                    f = this._get(e, 'showMonthAfterYear'),
                    k = this._get(e, 'selectMonthLabel'),
                    D = this._get(e, 'selectYearLabel'),
                    m = "<div class='ui-datepicker-title'>",
                    y = '';
                if (r || !g)
                    y +=
                        "<span class='ui-datepicker-month'>" + n[t] + '</span>';
                else {
                    for (
                        o = i && i.getFullYear() === a,
                            c = s && s.getFullYear() === a,
                            y +=
                                "<select class='ui-datepicker-month' aria-label='" +
                                k +
                                "' data-handler='selectMonth' data-event='change'>",
                            l = 0;
                        l < 12;
                        l++
                    )
                        (!o || l >= i.getMonth()) &&
                            (!c || l <= s.getMonth()) &&
                            (y +=
                                "<option value='" +
                                l +
                                "'" +
                                (l === t ? " selected='selected'" : '') +
                                '>' +
                                d[l] +
                                '</option>');
                    y += '</select>';
                }
                if (
                    (f || (m += y + (!r && g && _ ? '' : '&#xa0;')),
                    !e.yearshtml)
                )
                    if (((e.yearshtml = ''), r || !_))
                        m +=
                            "<span class='ui-datepicker-year'>" + a + '</span>';
                    else {
                        for (
                            n = this._get(e, 'yearRange').split(':'),
                                h = new Date().getFullYear(),
                                u = (k = function (e) {
                                    e = e.match(/c[+\-].*/)
                                        ? a + parseInt(e.substring(1), 10)
                                        : e.match(/[+\-].*/)
                                        ? h + parseInt(e, 10)
                                        : parseInt(e, 10);
                                    return isNaN(e) ? h : e;
                                })(n[0]),
                                p = Math.max(u, k(n[1] || '')),
                                u = i ? Math.max(u, i.getFullYear()) : u,
                                p = s ? Math.min(p, s.getFullYear()) : p,
                                e.yearshtml +=
                                    "<select class='ui-datepicker-year' aria-label='" +
                                    D +
                                    "' data-handler='selectYear' data-event='change'>";
                            u <= p;
                            u++
                        )
                            e.yearshtml +=
                                "<option value='" +
                                u +
                                "'" +
                                (u === a ? " selected='selected'" : '') +
                                '>' +
                                u +
                                '</option>';
                        (e.yearshtml += '</select>'),
                            (m += e.yearshtml),
                            (e.yearshtml = null);
                    }
                return (
                    (m += this._get(e, 'yearSuffix')),
                    f && (m += (!r && g && _ ? '' : '&#xa0;') + y),
                    (m += '</div>')
                );
            },
            _adjustInstDate: function (e, t, a) {
                var i = e.selectedYear + ('Y' === a ? t : 0),
                    s = e.selectedMonth + ('M' === a ? t : 0),
                    t =
                        Math.min(e.selectedDay, this._getDaysInMonth(i, s)) +
                        ('D' === a ? t : 0),
                    t = this._restrictMinMax(
                        e,
                        this._daylightSavingAdjust(new Date(i, s, t))
                    );
                (e.selectedDay = t.getDate()),
                    (e.drawMonth = e.selectedMonth = t.getMonth()),
                    (e.drawYear = e.selectedYear = t.getFullYear()),
                    ('M' !== a && 'Y' !== a) || this._notifyChange(e);
            },
            _restrictMinMax: function (e, t) {
                var a = this._getMinMaxDate(e, 'min'),
                    e = this._getMinMaxDate(e, 'max'),
                    t = a && t < a ? a : t;
                return e && e < t ? e : t;
            },
            _notifyChange: function (e) {
                var t = this._get(e, 'onChangeMonthYear');
                t &&
                    t.apply(e.input ? e.input[0] : null, [
                        e.selectedYear,
                        e.selectedMonth + 1,
                        e,
                    ]);
            },
            _getNumberOfMonths: function (e) {
                e = this._get(e, 'numberOfMonths');
                return null == e ? [1, 1] : 'number' == typeof e ? [1, e] : e;
            },
            _getMinMaxDate: function (e, t) {
                return this._determineDate(e, this._get(e, t + 'Date'), null);
            },
            _getDaysInMonth: function (e, t) {
                return (
                    32 -
                    this._daylightSavingAdjust(new Date(e, t, 32)).getDate()
                );
            },
            _getFirstDayOfMonth: function (e, t) {
                return new Date(e, t, 1).getDay();
            },
            _canAdjustMonth: function (e, t, a, i) {
                var s = this._getNumberOfMonths(e),
                    s = this._daylightSavingAdjust(
                        new Date(a, i + (t < 0 ? t : s[0] * s[1]), 1)
                    );
                return (
                    t < 0 &&
                        s.setDate(
                            this._getDaysInMonth(s.getFullYear(), s.getMonth())
                        ),
                    this._isInRange(e, s)
                );
            },
            _isInRange: function (e, t) {
                var a = this._getMinMaxDate(e, 'min'),
                    i = this._getMinMaxDate(e, 'max'),
                    s = null,
                    r = null,
                    n = this._get(e, 'yearRange');
                return (
                    n &&
                        ((e = n.split(':')),
                        (n = new Date().getFullYear()),
                        (s = parseInt(e[0], 10)),
                        (r = parseInt(e[1], 10)),
                        e[0].match(/[+\-].*/) && (s += n),
                        e[1].match(/[+\-].*/) && (r += n)),
                    (!a || t.getTime() >= a.getTime()) &&
                        (!i || t.getTime() <= i.getTime()) &&
                        (!s || t.getFullYear() >= s) &&
                        (!r || t.getFullYear() <= r)
                );
            },
            _getFormatConfig: function (e) {
                var t = this._get(e, 'shortYearCutoff');
                return {
                    shortYearCutoff: (t =
                        'string' != typeof t
                            ? t
                            : (new Date().getFullYear() % 100) +
                              parseInt(t, 10)),
                    dayNamesShort: this._get(e, 'dayNamesShort'),
                    dayNames: this._get(e, 'dayNames'),
                    monthNamesShort: this._get(e, 'monthNamesShort'),
                    monthNames: this._get(e, 'monthNames'),
                };
            },
            _formatDate: function (e, t, a, i) {
                t ||
                    ((e.currentDay = e.selectedDay),
                    (e.currentMonth = e.selectedMonth),
                    (e.currentYear = e.selectedYear));
                t = t
                    ? 'object' == typeof t
                        ? t
                        : this._daylightSavingAdjust(new Date(i, a, t))
                    : this._daylightSavingAdjust(
                          new Date(e.currentYear, e.currentMonth, e.currentDay)
                      );
                return this.formatDate(
                    this._get(e, 'dateFormat'),
                    t,
                    this._getFormatConfig(e)
                );
            },
        }),
        (V.fn.datepicker = function (e) {
            if (!this.length) return this;
            V.datepicker.initialized ||
                (V(document).on('mousedown', V.datepicker._checkExternalClick),
                (V.datepicker.initialized = !0)),
                0 === V('#' + V.datepicker._mainDivId).length &&
                    V('body').append(V.datepicker.dpDiv);
            var t = Array.prototype.slice.call(arguments, 1);
            return ('string' == typeof e &&
                ('isDisabled' === e || 'getDate' === e || 'widget' === e)) ||
                ('option' === e &&
                    2 === arguments.length &&
                    'string' == typeof arguments[1])
                ? V.datepicker['_' + e + 'Datepicker'].apply(
                      V.datepicker,
                      [this[0]].concat(t)
                  )
                : this.each(function () {
                      'string' == typeof e
                          ? V.datepicker['_' + e + 'Datepicker'].apply(
                                V.datepicker,
                                [this].concat(t)
                            )
                          : V.datepicker._attachDatepicker(this, e);
                  });
        }),
        (V.datepicker = new e()),
        (V.datepicker.initialized = !1),
        (V.datepicker.uuid = new Date().getTime()),
        (V.datepicker.version = '1.13.2');
    V.datepicker;
});

/* END datepicker */

/* START select country phone code
 * International Telephone Input v17.0.19
 * https://github.com/jackocnr/intl-tel-input.git
 * Licensed under the MIT license
 */

!(function (a) {
    'object' == typeof module && module.exports
        ? (module.exports = a())
        : (window.intlTelInput = a());
})(function (a) {
    'use strict';
    return (function () {
        function b(a, b) {
            if (!(a instanceof b))
                throw new TypeError('Cannot call a class as a function');
        }
        function c(a, b) {
            for (var c = 0; c < b.length; c++) {
                var d = b[c];
                (d.enumerable = d.enumerable || !1),
                    (d.configurable = !0),
                    'value' in d && (d.writable = !0),
                    Object.defineProperty(a, d.key, d);
            }
        }
        function d(a, b, d) {
            return b && c(a.prototype, b), d && c(a, d), a;
        }
        for (
            var e = [
                    ['Afghanistan (‫افغانستان‬‎)', 'af', '93'],
                    ['Albania (Shqipëri)', 'al', '355'],
                    ['Algeria (‫الجزائر‬‎)', 'dz', '213'],
                    ['American Samoa', 'as', '1', 5, ['684']],
                    ['Andorra', 'ad', '376'],
                    ['Angola', 'ao', '244'],
                    ['Anguilla', 'ai', '1', 6, ['264']],
                    ['Antigua and Barbuda', 'ag', '1', 7, ['268']],
                    ['Argentina', 'ar', '54'],
                    ['Armenia (Հայաստան)', 'am', '374'],
                    ['Aruba', 'aw', '297'],
                    ['Ascension Island', 'ac', '247'],
                    ['Australia', 'au', '61', 0],
                    ['Austria (Österreich)', 'at', '43'],
                    ['Azerbaijan (Azərbaycan)', 'az', '994'],
                    ['Bahamas', 'bs', '1', 8, ['242']],
                    ['Bahrain (‫البحرين‬‎)', 'bh', '973'],
                    ['Bangladesh (বাংলাদেশ)', 'bd', '880'],
                    ['Barbados', 'bb', '1', 9, ['246']],
                    ['Belarus (Беларусь)', 'by', '375'],
                    ['Belgium (België)', 'be', '32'],
                    ['Belize', 'bz', '501'],
                    ['Benin (Bénin)', 'bj', '229'],
                    ['Bermuda', 'bm', '1', 10, ['441']],
                    ['Bhutan (འབྲུག)', 'bt', '975'],
                    ['Bolivia', 'bo', '591'],
                    [
                        'Bosnia and Herzegovina (Босна и Херцеговина)',
                        'ba',
                        '387',
                    ],
                    ['Botswana', 'bw', '267'],
                    ['Brazil (Brasil)', 'br', '55'],
                    ['British Indian Ocean Territory', 'io', '246'],
                    ['British Virgin Islands', 'vg', '1', 11, ['284']],
                    ['Brunei', 'bn', '673'],
                    ['Bulgaria (България)', 'bg', '359'],
                    ['Burkina Faso', 'bf', '226'],
                    ['Burundi (Uburundi)', 'bi', '257'],
                    ['Cambodia (កម្ពុជា)', 'kh', '855'],
                    ['Cameroon (Cameroun)', 'cm', '237'],
                    [
                        'Canada',
                        'ca',
                        '1',
                        1,
                        [
                            '204',
                            '226',
                            '236',
                            '249',
                            '250',
                            '289',
                            '306',
                            '343',
                            '365',
                            '387',
                            '403',
                            '416',
                            '418',
                            '431',
                            '437',
                            '438',
                            '450',
                            '506',
                            '514',
                            '519',
                            '548',
                            '579',
                            '581',
                            '587',
                            '604',
                            '613',
                            '639',
                            '647',
                            '672',
                            '705',
                            '709',
                            '742',
                            '778',
                            '780',
                            '782',
                            '807',
                            '819',
                            '825',
                            '867',
                            '873',
                            '902',
                            '905',
                        ],
                    ],
                    ['Cape Verde (Kabu Verdi)', 'cv', '238'],
                    ['Caribbean Netherlands', 'bq', '599', 1, ['3', '4', '7']],
                    ['Cayman Islands', 'ky', '1', 12, ['345']],
                    [
                        'Central African Republic (République centrafricaine)',
                        'cf',
                        '236',
                    ],
                    ['Chad (Tchad)', 'td', '235'],
                    ['Chile', 'cl', '56'],
                    ['China (中国)', 'cn', '86'],
                    ['Christmas Island', 'cx', '61', 2, ['89164']],
                    ['Cocos (Keeling) Islands', 'cc', '61', 1, ['89162']],
                    ['Colombia', 'co', '57'],
                    ['Comoros (‫جزر القمر‬‎)', 'km', '269'],
                    [
                        'Congo (DRC) (Jamhuri ya Kidemokrasia ya Kongo)',
                        'cd',
                        '243',
                    ],
                    ['Congo (Republic) (Congo-Brazzaville)', 'cg', '242'],
                    ['Cook Islands', 'ck', '682'],
                    ['Costa Rica', 'cr', '506'],
                    ['Côte d’Ivoire', 'ci', '225'],
                    ['Croatia (Hrvatska)', 'hr', '385'],
                    ['Cuba', 'cu', '53'],
                    ['Curaçao', 'cw', '599', 0],
                    ['Cyprus (Κύπρος)', 'cy', '357'],
                    ['Czech Republic (Česká republika)', 'cz', '420'],
                    ['Denmark (Danmark)', 'dk', '45'],
                    ['Djibouti', 'dj', '253'],
                    ['Dominica', 'dm', '1', 13, ['767']],
                    [
                        'Dominican Republic (República Dominicana)',
                        'do',
                        '1',
                        2,
                        ['809', '829', '849'],
                    ],
                    ['Ecuador', 'ec', '593'],
                    ['Egypt (‫مصر‬‎)', 'eg', '20'],
                    ['El Salvador', 'sv', '503'],
                    ['Equatorial Guinea (Guinea Ecuatorial)', 'gq', '240'],
                    ['Eritrea', 'er', '291'],
                    ['Estonia (Eesti)', 'ee', '372'],
                    ['Eswatini', 'sz', '268'],
                    ['Ethiopia', 'et', '251'],
                    ['Falkland Islands (Islas Malvinas)', 'fk', '500'],
                    ['Faroe Islands (Føroyar)', 'fo', '298'],
                    ['Fiji', 'fj', '679'],
                    ['Finland (Suomi)', 'fi', '358', 0],
                    ['France', 'fr', '33'],
                    ['French Guiana (Guyane française)', 'gf', '594'],
                    ['French Polynesia (Polynésie française)', 'pf', '689'],
                    ['Gabon', 'ga', '241'],
                    ['Gambia', 'gm', '220'],
                    ['Georgia (საქართველო)', 'ge', '995'],
                    ['Germany (Deutschland)', 'de', '49'],
                    ['Ghana (Gaana)', 'gh', '233'],
                    ['Gibraltar', 'gi', '350'],
                    ['Greece (Ελλάδα)', 'gr', '30'],
                    ['Greenland (Kalaallit Nunaat)', 'gl', '299'],
                    ['Grenada', 'gd', '1', 14, ['473']],
                    ['Guadeloupe', 'gp', '590', 0],
                    ['Guam', 'gu', '1', 15, ['671']],
                    ['Guatemala', 'gt', '502'],
                    [
                        'Guernsey',
                        'gg',
                        '44',
                        1,
                        ['1481', '7781', '7839', '7911'],
                    ],
                    ['Guinea (Guinée)', 'gn', '224'],
                    ['Guinea-Bissau (Guiné Bissau)', 'gw', '245'],
                    ['Guyana', 'gy', '592'],
                    ['Haiti', 'ht', '509'],
                    ['Honduras', 'hn', '504'],
                    ['Hong Kong (香港)', 'hk', '852'],
                    ['Hungary (Magyarország)', 'hu', '36'],
                    ['Iceland (Ísland)', 'is', '354'],
                    ['India (भारत)', 'in', '91'],
                    ['Indonesia', 'id', '62'],
                    ['Iran (‫ایران‬‎)', 'ir', '98'],
                    ['Iraq (‫العراق‬‎)', 'iq', '964'],
                    ['Ireland', 'ie', '353'],
                    [
                        'Isle of Man',
                        'im',
                        '44',
                        2,
                        ['1624', '74576', '7524', '7924', '7624'],
                    ],
                    ['Israel (‫ישראל‬‎)', 'il', '972'],
                    ['Italy (Italia)', 'it', '39', 0],
                    ['Jamaica', 'jm', '1', 4, ['876', '658']],
                    ['Japan (日本)', 'jp', '81'],
                    [
                        'Jersey',
                        'je',
                        '44',
                        3,
                        ['1534', '7509', '7700', '7797', '7829', '7937'],
                    ],
                    ['Jordan (‫الأردن‬‎)', 'jo', '962'],
                    ['Kazakhstan (Казахстан)', 'kz', '7', 1, ['33', '7']],
                    ['Kenya', 'ke', '254'],
                    ['Kiribati', 'ki', '686'],
                    ['Kosovo', 'xk', '383'],
                    ['Kuwait (‫الكويت‬‎)', 'kw', '965'],
                    ['Kyrgyzstan (Кыргызстан)', 'kg', '996'],
                    ['Laos (ລາວ)', 'la', '856'],
                    ['Latvia (Latvija)', 'lv', '371'],
                    ['Lebanon (‫لبنان‬‎)', 'lb', '961'],
                    ['Lesotho', 'ls', '266'],
                    ['Liberia', 'lr', '231'],
                    ['Libya (‫ليبيا‬‎)', 'ly', '218'],
                    ['Liechtenstein', 'li', '423'],
                    ['Lithuania (Lietuva)', 'lt', '370'],
                    ['Luxembourg', 'lu', '352'],
                    ['Macau (澳門)', 'mo', '853'],
                    ['North Macedonia (Македонија)', 'mk', '389'],
                    ['Madagascar (Madagasikara)', 'mg', '261'],
                    ['Malawi', 'mw', '265'],
                    ['Malaysia', 'my', '60'],
                    ['Maldives', 'mv', '960'],
                    ['Mali', 'ml', '223'],
                    ['Malta', 'mt', '356'],
                    ['Marshall Islands', 'mh', '692'],
                    ['Martinique', 'mq', '596'],
                    ['Mauritania (‫موريتانيا‬‎)', 'mr', '222'],
                    ['Mauritius (Moris)', 'mu', '230'],
                    ['Mayotte', 'yt', '262', 1, ['269', '639']],
                    ['Mexico (México)', 'mx', '52'],
                    ['Micronesia', 'fm', '691'],
                    ['Moldova (Republica Moldova)', 'md', '373'],
                    ['Monaco', 'mc', '377'],
                    ['Mongolia (Монгол)', 'mn', '976'],
                    ['Montenegro (Crna Gora)', 'me', '382'],
                    ['Montserrat', 'ms', '1', 16, ['664']],
                    ['Morocco (‫المغرب‬‎)', 'ma', '212', 0],
                    ['Mozambique (Moçambique)', 'mz', '258'],
                    ['Myanmar (Burma) (မြန်မာ)', 'mm', '95'],
                    ['Namibia (Namibië)', 'na', '264'],
                    ['Nauru', 'nr', '674'],
                    ['Nepal (नेपाल)', 'np', '977'],
                    ['Netherlands (Nederland)', 'nl', '31'],
                    ['New Caledonia (Nouvelle-Calédonie)', 'nc', '687'],
                    ['New Zealand', 'nz', '64'],
                    ['Nicaragua', 'ni', '505'],
                    ['Niger (Nijar)', 'ne', '227'],
                    ['Nigeria', 'ng', '234'],
                    ['Niue', 'nu', '683'],
                    ['Norfolk Island', 'nf', '672'],
                    ['North Korea (조선 민주주의 인민 공화국)', 'kp', '850'],
                    ['Northern Mariana Islands', 'mp', '1', 17, ['670']],
                    ['Norway (Norge)', 'no', '47', 0],
                    ['Oman (‫عُمان‬‎)', 'om', '968'],
                    ['Pakistan (‫پاکستان‬‎)', 'pk', '92'],
                    ['Palau', 'pw', '680'],
                    ['Palestine (‫فلسطين‬‎)', 'ps', '970'],
                    ['Panama (Panamá)', 'pa', '507'],
                    ['Papua New Guinea', 'pg', '675'],
                    ['Paraguay', 'py', '595'],
                    ['Peru (Perú)', 'pe', '51'],
                    ['Philippines', 'ph', '63'],
                    ['Poland (Polska)', 'pl', '48'],
                    ['Portugal', 'pt', '351'],
                    ['Puerto Rico', 'pr', '1', 3, ['787', '939']],
                    ['Qatar (‫قطر‬‎)', 'qa', '974'],
                    ['Réunion (La Réunion)', 're', '262', 0],
                    ['Romania (România)', 'ro', '40'],
                    ['Russia (Россия)', 'ru', '7', 0],
                    ['Rwanda', 'rw', '250'],
                    ['Saint Barthélemy', 'bl', '590', 1],
                    ['Saint Helena', 'sh', '290'],
                    ['Saint Kitts and Nevis', 'kn', '1', 18, ['869']],
                    ['Saint Lucia', 'lc', '1', 19, ['758']],
                    [
                        'Saint Martin (Saint-Martin (partie française))',
                        'mf',
                        '590',
                        2,
                    ],
                    [
                        'Saint Pierre and Miquelon (Saint-Pierre-et-Miquelon)',
                        'pm',
                        '508',
                    ],
                    [
                        'Saint Vincent and the Grenadines',
                        'vc',
                        '1',
                        20,
                        ['784'],
                    ],
                    ['Samoa', 'ws', '685'],
                    ['San Marino', 'sm', '378'],
                    [
                        'São Tomé and Príncipe (São Tomé e Príncipe)',
                        'st',
                        '239',
                    ],
                    ['Saudi Arabia (‫المملكة العربية السعودية‬‎)', 'sa', '966'],
                    ['Senegal (Sénégal)', 'sn', '221'],
                    ['Serbia (Србија)', 'rs', '381'],
                    ['Seychelles', 'sc', '248'],
                    ['Sierra Leone', 'sl', '232'],
                    ['Singapore', 'sg', '65'],
                    ['Sint Maarten', 'sx', '1', 21, ['721']],
                    ['Slovakia (Slovensko)', 'sk', '421'],
                    ['Slovenia (Slovenija)', 'si', '386'],
                    ['Solomon Islands', 'sb', '677'],
                    ['Somalia (Soomaaliya)', 'so', '252'],
                    ['South Africa', 'za', '27'],
                    ['South Korea (대한민국)', 'kr', '82'],
                    ['South Sudan (‫جنوب السودان‬‎)', 'ss', '211'],
                    ['Spain (España)', 'es', '34'],
                    ['Sri Lanka (ශ්‍රී ලංකාව)', 'lk', '94'],
                    ['Sudan (‫السودان‬‎)', 'sd', '249'],
                    ['Suriname', 'sr', '597'],
                    ['Svalbard and Jan Mayen', 'sj', '47', 1, ['79']],
                    ['Sweden (Sverige)', 'se', '46'],
                    ['Switzerland (Schweiz)', 'ch', '41'],
                    ['Syria (‫سوريا‬‎)', 'sy', '963'],
                    ['Taiwan (台灣)', 'tw', '886'],
                    ['Tajikistan', 'tj', '992'],
                    ['Tanzania', 'tz', '255'],
                    ['Thailand (ไทย)', 'th', '66'],
                    ['Timor-Leste', 'tl', '670'],
                    ['Togo', 'tg', '228'],
                    ['Tokelau', 'tk', '690'],
                    ['Tonga', 'to', '676'],
                    ['Trinidad and Tobago', 'tt', '1', 22, ['868']],
                    ['Tunisia (‫تونس‬‎)', 'tn', '216'],
                    ['Turkey (Türkiye)', 'tr', '90'],
                    ['Turkmenistan', 'tm', '993'],
                    ['Turks and Caicos Islands', 'tc', '1', 23, ['649']],
                    ['Tuvalu', 'tv', '688'],
                    ['U.S. Virgin Islands', 'vi', '1', 24, ['340']],
                    ['Uganda', 'ug', '256'],
                    ['Ukraine (Україна)', 'ua', '380'],
                    [
                        'United Arab Emirates (‫الإمارات العربية المتحدة‬‎)',
                        'ae',
                        '971',
                    ],
                    ['United Kingdom', 'gb', '44', 0],
                    ['United States', 'us', '1', 0],
                    ['Uruguay', 'uy', '598'],
                    ['Uzbekistan (Oʻzbekiston)', 'uz', '998'],
                    ['Vanuatu', 'vu', '678'],
                    [
                        'Vatican City (Città del Vaticano)',
                        'va',
                        '39',
                        1,
                        ['06698'],
                    ],
                    ['Venezuela', 've', '58'],
                    ['Vietnam (Việt Nam)', 'vn', '84'],
                    ['Wallis and Futuna (Wallis-et-Futuna)', 'wf', '681'],
                    [
                        'Western Sahara (‫الصحراء الغربية‬‎)',
                        'eh',
                        '212',
                        1,
                        ['5288', '5289'],
                    ],
                    ['Yemen (‫اليمن‬‎)', 'ye', '967'],
                    ['Zambia', 'zm', '260'],
                    ['Zimbabwe', 'zw', '263'],
                    ['Åland Islands', 'ax', '358', 1, ['18']],
                ],
                f = 0;
            f < e.length;
            f++
        ) {
            var g = e[f];
            e[f] = {
                name: g[0],
                iso2: g[1],
                dialCode: g[2],
                priority: g[3] || 0,
                areaCodes: g[4] || null,
            };
        }
        var h = {
            getInstance: function (a) {
                var b = a.getAttribute('data-intl-tel-input-id');
                return window.intlTelInputGlobals.instances[b];
            },
            instances: {},
            documentReady: function () {
                return 'complete' === document.readyState;
            },
        };
        'object' == typeof window && (window.intlTelInputGlobals = h);
        var i = 0,
            j = {
                allowDropdown: !0,
                autoHideDialCode: !0,
                autoPlaceholder: 'polite',
                customContainer: '',
                customPlaceholder: null,
                dropdownContainer: null,
                excludeCountries: [],
                formatOnDisplay: !0,
                geoIpLookup: null,
                hiddenInput: '',
                initialCountry: '',
                localizedCountries: null,
                nationalMode: !0,
                onlyCountries: [],
                placeholderNumberType: 'MOBILE',
                preferredCountries: ['us', 'gb'],
                separateDialCode: !1,
                utilsScript: '',
            },
            k = [
                '800',
                '822',
                '833',
                '844',
                '855',
                '866',
                '877',
                '880',
                '881',
                '882',
                '883',
                '884',
                '885',
                '886',
                '887',
                '888',
                '889',
            ],
            l = function (a, b) {
                for (var c = Object.keys(a), d = 0; d < c.length; d++)
                    b(c[d], a[c[d]]);
            },
            m = function (a) {
                l(window.intlTelInputGlobals.instances, function (b) {
                    window.intlTelInputGlobals.instances[b][a]();
                });
            },
            n = (function () {
                function c(a, d) {
                    var e = this;
                    b(this, c),
                        (this.id = i++),
                        (this.a = a),
                        (this.b = null),
                        (this.c = null);
                    var f = d || {};
                    (this.d = {}),
                        l(j, function (a, b) {
                            e.d[a] = f.hasOwnProperty(a) ? f[a] : b;
                        }),
                        (this.e = Boolean(a.getAttribute('placeholder')));
                }
                return (
                    d(c, [
                        {
                            key: '_init',
                            value: function () {
                                var a = this;
                                if (
                                    (this.d.nationalMode &&
                                        (this.d.autoHideDialCode = !1),
                                    this.d.separateDialCode &&
                                        (this.d.autoHideDialCode =
                                            this.d.nationalMode =
                                                !1),
                                    (this.g =
                                        /Android.+Mobile|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                                            navigator.userAgent
                                        )),
                                    this.g &&
                                        (document.body.classList.add(
                                            'iti-mobile'
                                        ),
                                        this.d.dropdownContainer ||
                                            (this.d.dropdownContainer =
                                                document.body)),
                                    'undefined' != typeof Promise)
                                ) {
                                    var b = new Promise(function (b, c) {
                                            (a.h = b), (a.i = c);
                                        }),
                                        c = new Promise(function (b, c) {
                                            (a.i0 = b), (a.i1 = c);
                                        });
                                    this.promise = Promise.all([b, c]);
                                } else
                                    (this.h = this.i = function () {}),
                                        (this.i0 = this.i1 = function () {});
                                (this.s = {}),
                                    this._b(),
                                    this._f(),
                                    this._h(),
                                    this._i(),
                                    this._i3();
                            },
                        },
                        {
                            key: '_b',
                            value: function () {
                                this._d(),
                                    this._d2(),
                                    this._e(),
                                    this.d.localizedCountries && this._d0(),
                                    (this.d.onlyCountries.length ||
                                        this.d.localizedCountries) &&
                                        this.p.sort(this._d1);
                            },
                        },
                        {
                            key: '_c',
                            value: function (b, c, d) {
                                c.length > this.countryCodeMaxLen &&
                                    (this.countryCodeMaxLen = c.length),
                                    this.q.hasOwnProperty(c) ||
                                        (this.q[c] = []);
                                for (var e = 0; e < this.q[c].length; e++)
                                    if (this.q[c][e] === b) return;
                                var f = d !== a ? d : this.q[c].length;
                                this.q[c][f] = b;
                            },
                        },
                        {
                            key: '_d',
                            value: function () {
                                if (this.d.onlyCountries.length) {
                                    var a = this.d.onlyCountries.map(function (
                                        a
                                    ) {
                                        return a.toLowerCase();
                                    });
                                    this.p = e.filter(function (b) {
                                        return a.indexOf(b.iso2) > -1;
                                    });
                                } else if (this.d.excludeCountries.length) {
                                    var b = this.d.excludeCountries.map(
                                        function (a) {
                                            return a.toLowerCase();
                                        }
                                    );
                                    this.p = e.filter(function (a) {
                                        return -1 === b.indexOf(a.iso2);
                                    });
                                } else this.p = e;
                            },
                        },
                        {
                            key: '_d0',
                            value: function () {
                                for (var a = 0; a < this.p.length; a++) {
                                    var b = this.p[a].iso2.toLowerCase();
                                    this.d.localizedCountries.hasOwnProperty(
                                        b
                                    ) &&
                                        (this.p[a].name =
                                            this.d.localizedCountries[b]);
                                }
                            },
                        },
                        {
                            key: '_d1',
                            value: function (a, b) {
                                return a.name.localeCompare(b.name);
                            },
                        },
                        {
                            key: '_d2',
                            value: function () {
                                (this.countryCodeMaxLen = 0),
                                    (this.dialCodes = {}),
                                    (this.q = {});
                                for (var a = 0; a < this.p.length; a++) {
                                    var b = this.p[a];
                                    this.dialCodes[b.dialCode] ||
                                        (this.dialCodes[b.dialCode] = !0),
                                        this._c(b.iso2, b.dialCode, b.priority);
                                }
                                for (var c = 0; c < this.p.length; c++) {
                                    var d = this.p[c];
                                    if (d.areaCodes)
                                        for (
                                            var e = this.q[d.dialCode][0],
                                                f = 0;
                                            f < d.areaCodes.length;
                                            f++
                                        ) {
                                            for (
                                                var g = d.areaCodes[f], h = 1;
                                                h < g.length;
                                                h++
                                            ) {
                                                var i =
                                                    d.dialCode + g.substr(0, h);
                                                this._c(e, i),
                                                    this._c(d.iso2, i);
                                            }
                                            this._c(d.iso2, d.dialCode + g);
                                        }
                                }
                            },
                        },
                        {
                            key: '_e',
                            value: function () {
                                this.preferredCountries = [];
                                for (
                                    var a = 0;
                                    a < this.d.preferredCountries.length;
                                    a++
                                ) {
                                    var b =
                                            this.d.preferredCountries[
                                                a
                                            ].toLowerCase(),
                                        c = this._y(b, !1, !0);
                                    c && this.preferredCountries.push(c);
                                }
                            },
                        },
                        {
                            key: '_e2',
                            value: function (a, b, c) {
                                var d = document.createElement(a);
                                return (
                                    b &&
                                        l(b, function (a, b) {
                                            return d.setAttribute(a, b);
                                        }),
                                    c && c.appendChild(d),
                                    d
                                );
                            },
                        },
                        {
                            key: '_f',
                            value: function () {
                                this.a.hasAttribute('autocomplete') ||
                                    (this.a.form &&
                                        this.a.form.hasAttribute(
                                            'autocomplete'
                                        )) ||
                                    this.a.setAttribute('autocomplete', 'off');
                                var a = 'iti';
                                this.d.allowDropdown &&
                                    (a += ' iti--allow-dropdown'),
                                    this.d.separateDialCode &&
                                        (a += ' iti--separate-dial-code'),
                                    this.d.customContainer &&
                                        ((a += ' '),
                                        (a += this.d.customContainer));
                                var b = this._e2('div', { class: a });
                                if (
                                    (this.a.parentNode.insertBefore(b, this.a),
                                    (this.k = this._e2(
                                        'div',
                                        { class: 'iti__flag-container' },
                                        b
                                    )),
                                    b.appendChild(this.a),
                                    (this.selectedFlag = this._e2(
                                        'div',
                                        {
                                            class: 'iti__selected-flag',
                                            role: 'combobox',
                                            'aria-controls': 'iti-'.concat(
                                                this.id,
                                                '__country-listbox'
                                            ),
                                            'aria-owns': 'iti-'.concat(
                                                this.id,
                                                '__country-listbox'
                                            ),
                                            'aria-expanded': 'false',
                                        },
                                        this.k
                                    )),
                                    (this.l = this._e2(
                                        'div',
                                        { class: 'iti__flag' },
                                        this.selectedFlag
                                    )),
                                    this.d.separateDialCode &&
                                        (this.t = this._e2(
                                            'div',
                                            {
                                                class: 'iti__selected-dial-code',
                                            },
                                            this.selectedFlag
                                        )),
                                    this.d.allowDropdown &&
                                        (this.selectedFlag.setAttribute(
                                            'tabindex',
                                            '0'
                                        ),
                                        (this.u = this._e2(
                                            'div',
                                            { class: 'iti__arrow' },
                                            this.selectedFlag
                                        )),
                                        (this.m = this._e2('ul', {
                                            class: 'iti__country-list iti__hide',
                                            id: 'iti-'.concat(
                                                this.id,
                                                '__country-listbox'
                                            ),
                                            role: 'listbox',
                                            'aria-label': 'List of countries',
                                        })),
                                        this.preferredCountries.length &&
                                            (this._g(
                                                this.preferredCountries,
                                                'iti__preferred',
                                                !0
                                            ),
                                            this._e2(
                                                'li',
                                                {
                                                    class: 'iti__divider',
                                                    role: 'separator',
                                                    'aria-disabled': 'true',
                                                },
                                                this.m
                                            )),
                                        this._g(this.p, 'iti__standard'),
                                        this.d.dropdownContainer
                                            ? ((this.dropdown = this._e2(
                                                  'div',
                                                  {
                                                      class: 'iti iti--container',
                                                  }
                                              )),
                                              this.dropdown.appendChild(this.m))
                                            : this.k.appendChild(this.m)),
                                    this.d.hiddenInput)
                                ) {
                                    var c = this.d.hiddenInput,
                                        d = this.a.getAttribute('name');
                                    if (d) {
                                        var e = d.lastIndexOf('[');
                                        -1 !== e &&
                                            (c = ''
                                                .concat(d.substr(0, e), '[')
                                                .concat(c, ']'));
                                    }
                                    (this.hiddenInput = this._e2('input', {
                                        type: 'hidden',
                                        name: c,
                                    })),
                                        b.appendChild(this.hiddenInput);
                                }
                            },
                        },
                        {
                            key: '_g',
                            value: function (a, b, c) {
                                for (var d = '', e = 0; e < a.length; e++) {
                                    var f = a[e],
                                        g = c ? '-preferred' : '';
                                    (d += "<li class='iti__country "
                                        .concat(b, "' tabIndex='-1' id='iti-")
                                        .concat(this.id, '__item-')
                                        .concat(f.iso2)
                                        .concat(
                                            g,
                                            "' role='option' data-dial-code='"
                                        )
                                        .concat(
                                            f.dialCode,
                                            "' data-country-code='"
                                        )
                                        .concat(
                                            f.iso2,
                                            "' aria-selected='false'>"
                                        )),
                                        (d +=
                                            "<div class='iti__flag-box'><div class='iti__flag iti__".concat(
                                                f.iso2,
                                                "'></div></div>"
                                            )),
                                        (d +=
                                            "<span class='iti__country-name'>".concat(
                                                f.name,
                                                '</span>'
                                            )),
                                        (d +=
                                            "<span class='iti__dial-code'>+".concat(
                                                f.dialCode,
                                                '</span>'
                                            )),
                                        (d += '</li>');
                                }
                                this.m.insertAdjacentHTML('beforeend', d);
                            },
                        },
                        {
                            key: '_h',
                            value: function () {
                                var a = this.a.getAttribute('value'),
                                    b = this.a.value,
                                    c =
                                        a &&
                                        '+' === a.charAt(0) &&
                                        (!b || '+' !== b.charAt(0)),
                                    d = c ? a : b,
                                    e = this._5(d),
                                    f = this._w(d),
                                    g = this.d,
                                    h = g.initialCountry,
                                    i = g.nationalMode,
                                    j = g.autoHideDialCode,
                                    k = g.separateDialCode;
                                e && !f
                                    ? this._v(d)
                                    : 'auto' !== h &&
                                      (h
                                          ? this._z(h.toLowerCase())
                                          : e && f
                                          ? this._z('us')
                                          : ((this.j = this.preferredCountries
                                                .length
                                                ? this.preferredCountries[0]
                                                      .iso2
                                                : this.p[0].iso2),
                                            d || this._z(this.j)),
                                      d ||
                                          i ||
                                          j ||
                                          k ||
                                          (this.a.value = '+'.concat(
                                              this.s.dialCode
                                          ))),
                                    d && this._u(d);
                            },
                        },
                        {
                            key: '_i',
                            value: function () {
                                this._j(),
                                    this.d.autoHideDialCode && this._l(),
                                    this.d.allowDropdown && this._i2(),
                                    this.hiddenInput && this._i0();
                            },
                        },
                        {
                            key: '_i0',
                            value: function () {
                                var a = this;
                                (this._a14 = function () {
                                    a.hiddenInput.value = a.getNumber();
                                }),
                                    this.a.form &&
                                        this.a.form.addEventListener(
                                            'submit',
                                            this._a14
                                        );
                            },
                        },
                        {
                            key: '_i1',
                            value: function () {
                                for (
                                    var a = this.a;
                                    a && 'LABEL' !== a.tagName;

                                )
                                    a = a.parentNode;
                                return a;
                            },
                        },
                        {
                            key: '_i2',
                            value: function () {
                                var a = this;
                                this._a9 = function (b) {
                                    a.m.classList.contains('iti__hide')
                                        ? a.a.focus()
                                        : b.preventDefault();
                                };
                                var b = this._i1();
                                b && b.addEventListener('click', this._a9),
                                    (this._a10 = function () {
                                        !a.m.classList.contains('iti__hide') ||
                                            a.a.disabled ||
                                            a.a.readOnly ||
                                            a._n();
                                    }),
                                    this.selectedFlag.addEventListener(
                                        'click',
                                        this._a10
                                    ),
                                    (this._a11 = function (b) {
                                        a.m.classList.contains('iti__hide') &&
                                            -1 !==
                                                [
                                                    'ArrowUp',
                                                    'Up',
                                                    'ArrowDown',
                                                    'Down',
                                                    ' ',
                                                    'Enter',
                                                ].indexOf(b.key) &&
                                            (b.preventDefault(),
                                            b.stopPropagation(),
                                            a._n()),
                                            'Tab' === b.key && a._2();
                                    }),
                                    this.k.addEventListener(
                                        'keydown',
                                        this._a11
                                    );
                            },
                        },
                        {
                            key: '_i3',
                            value: function () {
                                var a = this;
                                this.d.utilsScript && !window.intlTelInputUtils
                                    ? window.intlTelInputGlobals.documentReady()
                                        ? window.intlTelInputGlobals.loadUtils(
                                              this.d.utilsScript
                                          )
                                        : window.addEventListener(
                                              'load',
                                              function () {
                                                  window.intlTelInputGlobals.loadUtils(
                                                      a.d.utilsScript
                                                  );
                                              }
                                          )
                                    : this.i0(),
                                    'auto' === this.d.initialCountry
                                        ? this._i4()
                                        : this.h();
                            },
                        },
                        {
                            key: '_i4',
                            value: function () {
                                window.intlTelInputGlobals.autoCountry
                                    ? this.handleAutoCountry()
                                    : window.intlTelInputGlobals
                                          .startedLoadingAutoCountry ||
                                      ((window.intlTelInputGlobals.startedLoadingAutoCountry =
                                          !0),
                                      'function' == typeof this.d.geoIpLookup &&
                                          this.d.geoIpLookup(
                                              function (a) {
                                                  (window.intlTelInputGlobals.autoCountry =
                                                      a.toLowerCase()),
                                                      setTimeout(function () {
                                                          return m(
                                                              'handleAutoCountry'
                                                          );
                                                      });
                                              },
                                              function () {
                                                  return m(
                                                      'rejectAutoCountryPromise'
                                                  );
                                              }
                                          ));
                            },
                        },
                        {
                            key: '_j',
                            value: function () {
                                var a = this;
                                (this._a12 = function () {
                                    a._v(a.a.value) && a._m2CountryChange();
                                }),
                                    this.a.addEventListener('keyup', this._a12),
                                    (this._a13 = function () {
                                        setTimeout(a._a12);
                                    }),
                                    this.a.addEventListener('cut', this._a13),
                                    this.a.addEventListener('paste', this._a13);
                            },
                        },
                        {
                            key: '_j2',
                            value: function (a) {
                                var b = this.a.getAttribute('maxlength');
                                return b && a.length > b ? a.substr(0, b) : a;
                            },
                        },
                        {
                            key: '_l',
                            value: function () {
                                var a = this;
                                (this._a8 = function () {
                                    a._l2();
                                }),
                                    this.a.form &&
                                        this.a.form.addEventListener(
                                            'submit',
                                            this._a8
                                        ),
                                    this.a.addEventListener('blur', this._a8);
                            },
                        },
                        {
                            key: '_l2',
                            value: function () {
                                if ('+' === this.a.value.charAt(0)) {
                                    var a = this._m(this.a.value);
                                    (a && this.s.dialCode !== a) ||
                                        (this.a.value = '');
                                }
                            },
                        },
                        {
                            key: '_m',
                            value: function (a) {
                                return a.replace(/\D/g, '');
                            },
                        },
                        {
                            key: '_m2',
                            value: function (a) {
                                var b = document.createEvent('Event');
                                b.initEvent(a, !0, !0), this.a.dispatchEvent(b);
                            },
                        },
                        {
                            key: '_n',
                            value: function () {
                                this.m.classList.remove('iti__hide'),
                                    this.selectedFlag.setAttribute(
                                        'aria-expanded',
                                        'true'
                                    ),
                                    this._o(),
                                    this.b &&
                                        (this._x(this.b, !1),
                                        this._3(this.b, !0)),
                                    this._p(),
                                    this.u.classList.add('iti__arrow--up'),
                                    this._m2('open:countrydropdown');
                            },
                        },
                        {
                            key: '_n2',
                            value: function (a, b, c) {
                                c && !a.classList.contains(b)
                                    ? a.classList.add(b)
                                    : !c &&
                                      a.classList.contains(b) &&
                                      a.classList.remove(b);
                            },
                        },
                        {
                            key: '_o',
                            value: function () {
                                var a = this;
                                if (
                                    (this.d.dropdownContainer &&
                                        this.d.dropdownContainer.appendChild(
                                            this.dropdown
                                        ),
                                    !this.g)
                                ) {
                                    var b = this.a.getBoundingClientRect(),
                                        c =
                                            window.pageYOffset ||
                                            document.documentElement.scrollTop,
                                        d = b.top + c,
                                        e = this.m.offsetHeight,
                                        f =
                                            d + this.a.offsetHeight + e <
                                            c + window.innerHeight,
                                        g = d - e > c;
                                    if (
                                        (this._n2(
                                            this.m,
                                            'iti__country-list--dropup',
                                            !f && g
                                        ),
                                        this.d.dropdownContainer)
                                    ) {
                                        var h =
                                            !f && g ? 0 : this.a.offsetHeight;
                                        (this.dropdown.style.top = ''.concat(
                                            d + h,
                                            'px'
                                        )),
                                            (this.dropdown.style.left =
                                                ''.concat(
                                                    b.left +
                                                        document.body
                                                            .scrollLeft,
                                                    'px'
                                                )),
                                            (this._a4 = function () {
                                                return a._2();
                                            }),
                                            window.addEventListener(
                                                'scroll',
                                                this._a4
                                            );
                                    }
                                }
                            },
                        },
                        {
                            key: '_o2',
                            value: function (a) {
                                for (
                                    var b = a;
                                    b &&
                                    b !== this.m &&
                                    !b.classList.contains('iti__country');

                                )
                                    b = b.parentNode;
                                return b === this.m ? null : b;
                            },
                        },
                        {
                            key: '_p',
                            value: function () {
                                var a = this;
                                (this._a0 = function (b) {
                                    var c = a._o2(b.target);
                                    c && a._x(c, !1);
                                }),
                                    this.m.addEventListener(
                                        'mouseover',
                                        this._a0
                                    ),
                                    (this._a1 = function (b) {
                                        var c = a._o2(b.target);
                                        c && a._1(c);
                                    }),
                                    this.m.addEventListener('click', this._a1);
                                var b = !0;
                                (this._a2 = function () {
                                    b || a._2(), (b = !1);
                                }),
                                    document.documentElement.addEventListener(
                                        'click',
                                        this._a2
                                    );
                                var c = '',
                                    d = null;
                                (this._a3 = function (b) {
                                    b.preventDefault(),
                                        'ArrowUp' === b.key ||
                                        'Up' === b.key ||
                                        'ArrowDown' === b.key ||
                                        'Down' === b.key
                                            ? a._q(b.key)
                                            : 'Enter' === b.key
                                            ? a._r()
                                            : 'Escape' === b.key
                                            ? a._2()
                                            : /^[a-zA-ZÀ-ÿа-яА-Я ]$/.test(
                                                  b.key
                                              ) &&
                                              (d && clearTimeout(d),
                                              (c += b.key.toLowerCase()),
                                              a._s(c),
                                              (d = setTimeout(function () {
                                                  c = '';
                                              }, 1e3)));
                                }),
                                    document.addEventListener(
                                        'keydown',
                                        this._a3
                                    );
                            },
                        },
                        {
                            key: '_q',
                            value: function (a) {
                                var b =
                                    'ArrowUp' === a || 'Up' === a
                                        ? this.c.previousElementSibling
                                        : this.c.nextElementSibling;
                                b &&
                                    (b.classList.contains('iti__divider') &&
                                        (b =
                                            'ArrowUp' === a || 'Up' === a
                                                ? b.previousElementSibling
                                                : b.nextElementSibling),
                                    this._x(b, !0));
                            },
                        },
                        {
                            key: '_r',
                            value: function () {
                                this.c && this._1(this.c);
                            },
                        },
                        {
                            key: '_s',
                            value: function (a) {
                                for (var b = 0; b < this.p.length; b++)
                                    if (this._t(this.p[b].name, a)) {
                                        var c = this.m.querySelector(
                                            '#iti-'
                                                .concat(this.id, '__item-')
                                                .concat(this.p[b].iso2)
                                        );
                                        this._x(c, !1), this._3(c, !0);
                                        break;
                                    }
                            },
                        },
                        {
                            key: '_t',
                            value: function (a, b) {
                                return (
                                    a.substr(0, b.length).toLowerCase() === b
                                );
                            },
                        },
                        {
                            key: '_u',
                            value: function (a) {
                                var b = a;
                                if (
                                    this.d.formatOnDisplay &&
                                    window.intlTelInputUtils &&
                                    this.s
                                ) {
                                    var c =
                                            !this.d.separateDialCode &&
                                            (this.d.nationalMode ||
                                                '+' !== b.charAt(0)),
                                        d = intlTelInputUtils.numberFormat,
                                        e = d.NATIONAL,
                                        f = d.INTERNATIONAL,
                                        g = c ? e : f;
                                    b = intlTelInputUtils.formatNumber(
                                        b,
                                        this.s.iso2,
                                        g
                                    );
                                }
                                (b = this._7(b)), (this.a.value = b);
                            },
                        },
                        {
                            key: '_v',
                            value: function (a) {
                                var b = a,
                                    c = this.s.dialCode,
                                    d = '1' === c;
                                b &&
                                    this.d.nationalMode &&
                                    d &&
                                    '+' !== b.charAt(0) &&
                                    ('1' !== b.charAt(0) && (b = '1'.concat(b)),
                                    (b = '+'.concat(b))),
                                    this.d.separateDialCode &&
                                        c &&
                                        '+' !== b.charAt(0) &&
                                        (b = '+'.concat(c).concat(b));
                                var e = this._5(b, !0),
                                    f = this._m(b),
                                    g = null;
                                if (e) {
                                    var h = this.q[this._m(e)],
                                        i =
                                            -1 !== h.indexOf(this.s.iso2) &&
                                            f.length <= e.length - 1;
                                    if (!('1' === c && this._w(f)) && !i)
                                        for (var j = 0; j < h.length; j++)
                                            if (h[j]) {
                                                g = h[j];
                                                break;
                                            }
                                } else
                                    '+' === b.charAt(0) && f.length
                                        ? (g = '')
                                        : (b && '+' !== b) || (g = this.j);
                                return null !== g && this._z(g);
                            },
                        },
                        {
                            key: '_w',
                            value: function (a) {
                                var b = this._m(a);
                                if ('1' === b.charAt(0)) {
                                    var c = b.substr(1, 3);
                                    return -1 !== k.indexOf(c);
                                }
                                return !1;
                            },
                        },
                        {
                            key: '_x',
                            value: function (a, b) {
                                var c = this.c;
                                c && c.classList.remove('iti__highlight'),
                                    (this.c = a),
                                    this.c.classList.add('iti__highlight'),
                                    b && this.c.focus();
                            },
                        },
                        {
                            key: '_y',
                            value: function (a, b, c) {
                                for (
                                    var d = b ? e : this.p, f = 0;
                                    f < d.length;
                                    f++
                                )
                                    if (d[f].iso2 === a) return d[f];
                                if (c) return null;
                                throw new Error(
                                    "No country data for '".concat(a, "'")
                                );
                            },
                        },
                        {
                            key: '_z',
                            value: function (a) {
                                var b = this.s.iso2 ? this.s : {};
                                (this.s = a ? this._y(a, !1, !1) : {}),
                                    this.s.iso2 && (this.j = this.s.iso2),
                                    this.l.setAttribute(
                                        'class',
                                        'iti__flag iti__'.concat(a)
                                    );
                                var c = a
                                    ? ''
                                          .concat(this.s.name, ': +')
                                          .concat(this.s.dialCode)
                                    : 'Unknown';
                                if (
                                    (this.selectedFlag.setAttribute('title', c),
                                    this.d.separateDialCode)
                                ) {
                                    var d = this.s.dialCode
                                        ? '+'.concat(this.s.dialCode)
                                        : '';
                                    this.t.innerHTML = d;
                                    var e =
                                        this.selectedFlag.offsetWidth ||
                                        this._z2();
                                    this.a.style.paddingLeft = ''.concat(
                                        e + 6,
                                        'px'
                                    );
                                }
                                if ((this._0(), this.d.allowDropdown)) {
                                    var f = this.b;
                                    if (
                                        (f &&
                                            (f.classList.remove('iti__active'),
                                            f.setAttribute(
                                                'aria-selected',
                                                'false'
                                            )),
                                        a)
                                    ) {
                                        var g =
                                            this.m.querySelector(
                                                '#iti-'
                                                    .concat(this.id, '__item-')
                                                    .concat(a, '-preferred')
                                            ) ||
                                            this.m.querySelector(
                                                '#iti-'
                                                    .concat(this.id, '__item-')
                                                    .concat(a)
                                            );
                                        g.setAttribute('aria-selected', 'true'),
                                            g.classList.add('iti__active'),
                                            (this.b = g),
                                            this.selectedFlag.setAttribute(
                                                'aria-activedescendant',
                                                g.getAttribute('id')
                                            );
                                    }
                                }
                                return b.iso2 !== a;
                            },
                        },
                        {
                            key: '_z2',
                            value: function () {
                                var a = this.a.parentNode.cloneNode();
                                (a.style.visibility = 'hidden'),
                                    document.body.appendChild(a);
                                var b = this.k.cloneNode();
                                a.appendChild(b);
                                var c = this.selectedFlag.cloneNode(!0);
                                b.appendChild(c);
                                var d = c.offsetWidth;
                                return a.parentNode.removeChild(a), d;
                            },
                        },
                        {
                            key: '_0',
                            value: function () {
                                var a =
                                    'aggressive' === this.d.autoPlaceholder ||
                                    (!this.e &&
                                        'polite' === this.d.autoPlaceholder);
                                if (window.intlTelInputUtils && a) {
                                    var b =
                                            intlTelInputUtils.numberType[
                                                this.d.placeholderNumberType
                                            ],
                                        c = this.s.iso2
                                            ? intlTelInputUtils.getExampleNumber(
                                                  this.s.iso2,
                                                  this.d.nationalMode,
                                                  b
                                              )
                                            : '';
                                    (c = this._7(c)),
                                        'function' ==
                                            typeof this.d.customPlaceholder &&
                                            (c = this.d.customPlaceholder(
                                                c,
                                                this.s
                                            )),
                                        this.a.setAttribute('placeholder', c);
                                }
                            },
                        },
                        {
                            key: '_1',
                            value: function (a) {
                                var b = this._z(
                                    a.getAttribute('data-country-code')
                                );
                                this._2(),
                                    this._4(
                                        a.getAttribute('data-dial-code'),
                                        !0
                                    ),
                                    this.a.focus();
                                var c = this.a.value.length;
                                this.a.setSelectionRange(c, c),
                                    b && this._m2CountryChange();
                            },
                        },
                        {
                            key: '_2',
                            value: function () {
                                this.m.classList.add('iti__hide'),
                                    this.selectedFlag.setAttribute(
                                        'aria-expanded',
                                        'false'
                                    ),
                                    this.u.classList.remove('iti__arrow--up'),
                                    document.removeEventListener(
                                        'keydown',
                                        this._a3
                                    ),
                                    document.documentElement.removeEventListener(
                                        'click',
                                        this._a2
                                    ),
                                    this.m.removeEventListener(
                                        'mouseover',
                                        this._a0
                                    ),
                                    this.m.removeEventListener(
                                        'click',
                                        this._a1
                                    ),
                                    this.d.dropdownContainer &&
                                        (this.g ||
                                            window.removeEventListener(
                                                'scroll',
                                                this._a4
                                            ),
                                        this.dropdown.parentNode &&
                                            this.dropdown.parentNode.removeChild(
                                                this.dropdown
                                            )),
                                    this._m2('close:countrydropdown');
                            },
                        },
                        {
                            key: '_3',
                            value: function (a, b) {
                                var c = this.m,
                                    d =
                                        window.pageYOffset ||
                                        document.documentElement.scrollTop,
                                    e = c.offsetHeight,
                                    f = c.getBoundingClientRect().top + d,
                                    g = f + e,
                                    h = a.offsetHeight,
                                    i = a.getBoundingClientRect().top + d,
                                    j = i + h,
                                    k = i - f + c.scrollTop,
                                    l = e / 2 - h / 2;
                                if (i < f) b && (k -= l), (c.scrollTop = k);
                                else if (j > g) {
                                    b && (k += l);
                                    var m = e - h;
                                    c.scrollTop = k - m;
                                }
                            },
                        },
                        {
                            key: '_4',
                            value: function (a, b) {
                                var c,
                                    d = this.a.value,
                                    e = '+'.concat(a);
                                if ('+' === d.charAt(0)) {
                                    var f = this._5(d);
                                    c = f ? d.replace(f, e) : e;
                                } else {
                                    if (
                                        this.d.nationalMode ||
                                        this.d.separateDialCode
                                    )
                                        return;
                                    if (d) c = e + d;
                                    else {
                                        if (!b && this.d.autoHideDialCode)
                                            return;
                                        c = e;
                                    }
                                }
                                this.a.value = c;
                            },
                        },
                        {
                            key: '_5',
                            value: function (a, b) {
                                var c = '';
                                if ('+' === a.charAt(0))
                                    for (var d = '', e = 0; e < a.length; e++) {
                                        var f = a.charAt(e);
                                        if (!isNaN(parseInt(f, 10))) {
                                            if (((d += f), b))
                                                this.q[d] &&
                                                    (c = a.substr(0, e + 1));
                                            else if (this.dialCodes[d]) {
                                                c = a.substr(0, e + 1);
                                                break;
                                            }
                                            if (
                                                d.length ===
                                                this.countryCodeMaxLen
                                            )
                                                break;
                                        }
                                    }
                                return c;
                            },
                        },
                        {
                            key: '_6',
                            value: function () {
                                var a = this.a.value.trim(),
                                    b = this.s.dialCode,
                                    c = this._m(a);
                                return (
                                    (this.d.separateDialCode &&
                                    '+' !== a.charAt(0) &&
                                    b &&
                                    c
                                        ? '+'.concat(b)
                                        : '') + a
                                );
                            },
                        },
                        {
                            key: '_7',
                            value: function (a) {
                                var b = a;
                                if (this.d.separateDialCode) {
                                    var c = this._5(b);
                                    if (c) {
                                        c = '+'.concat(this.s.dialCode);
                                        var d =
                                            ' ' === b[c.length] ||
                                            '-' === b[c.length]
                                                ? c.length + 1
                                                : c.length;
                                        b = b.substr(d);
                                    }
                                }
                                return this._j2(b);
                            },
                        },
                        {
                            key: '_m2CountryChange',
                            value: function () {
                                this._m2('countrychange');
                            },
                        },
                        {
                            key: 'handleAutoCountry',
                            value: function () {
                                'auto' === this.d.initialCountry &&
                                    ((this.j =
                                        window.intlTelInputGlobals.autoCountry),
                                    this.a.value || this.setCountry(this.j),
                                    this.h());
                            },
                        },
                        {
                            key: 'handleUtils',
                            value: function () {
                                window.intlTelInputUtils &&
                                    (this.a.value && this._u(this.a.value),
                                    this._0()),
                                    this.i0();
                            },
                        },
                        {
                            key: 'destroy',
                            value: function () {
                                var a = this.a.form;
                                if (this.d.allowDropdown) {
                                    this._2(),
                                        this.selectedFlag.removeEventListener(
                                            'click',
                                            this._a10
                                        ),
                                        this.k.removeEventListener(
                                            'keydown',
                                            this._a11
                                        );
                                    var b = this._i1();
                                    b &&
                                        b.removeEventListener(
                                            'click',
                                            this._a9
                                        );
                                }
                                this.hiddenInput &&
                                    a &&
                                    a.removeEventListener('submit', this._a14),
                                    this.d.autoHideDialCode &&
                                        (a &&
                                            a.removeEventListener(
                                                'submit',
                                                this._a8
                                            ),
                                        this.a.removeEventListener(
                                            'blur',
                                            this._a8
                                        )),
                                    this.a.removeEventListener(
                                        'keyup',
                                        this._a12
                                    ),
                                    this.a.removeEventListener(
                                        'cut',
                                        this._a13
                                    ),
                                    this.a.removeEventListener(
                                        'paste',
                                        this._a13
                                    ),
                                    this.a.removeAttribute(
                                        'data-intl-tel-input-id'
                                    );
                                var c = this.a.parentNode;
                                c.parentNode.insertBefore(this.a, c),
                                    c.parentNode.removeChild(c),
                                    delete window.intlTelInputGlobals.instances[
                                        this.id
                                    ];
                            },
                        },
                        {
                            key: 'getExtension',
                            value: function () {
                                return window.intlTelInputUtils
                                    ? intlTelInputUtils.getExtension(
                                          this._6(),
                                          this.s.iso2
                                      )
                                    : '';
                            },
                        },
                        {
                            key: 'getNumber',
                            value: function (a) {
                                if (window.intlTelInputUtils) {
                                    var b = this.s.iso2;
                                    return intlTelInputUtils.formatNumber(
                                        this._6(),
                                        b,
                                        a
                                    );
                                }
                                return '';
                            },
                        },
                        {
                            key: 'getNumberType',
                            value: function () {
                                return window.intlTelInputUtils
                                    ? intlTelInputUtils.getNumberType(
                                          this._6(),
                                          this.s.iso2
                                      )
                                    : -99;
                            },
                        },
                        {
                            key: 'getSelectedCountryData',
                            value: function () {
                                return this.s;
                            },
                        },
                        {
                            key: 'getValidationError',
                            value: function () {
                                if (window.intlTelInputUtils) {
                                    var a = this.s.iso2;
                                    return intlTelInputUtils.getValidationError(
                                        this._6(),
                                        a
                                    );
                                }
                                return -99;
                            },
                        },
                        {
                            key: 'isValidNumber',
                            value: function () {
                                var a = this._6().trim(),
                                    b = this.d.nationalMode ? this.s.iso2 : '';
                                return window.intlTelInputUtils
                                    ? intlTelInputUtils.isValidNumber(a, b)
                                    : null;
                            },
                        },
                        {
                            key: 'setCountry',
                            value: function (a) {
                                var b = a.toLowerCase();
                                this.l.classList.contains('iti__'.concat(b)) ||
                                    (this._z(b),
                                    this._4(this.s.dialCode, !1),
                                    this._m2CountryChange());
                            },
                        },
                        {
                            key: 'setNumber',
                            value: function (a) {
                                var b = this._v(a);
                                this._u(a), b && this._m2CountryChange();
                            },
                        },
                        {
                            key: 'setPlaceholderNumberType',
                            value: function (a) {
                                (this.d.placeholderNumberType = a), this._0();
                            },
                        },
                    ]),
                    c
                );
            })();
        h.getCountryData = function () {
            return e;
        };
        var o = function (a, b, c) {
            var d = document.createElement('script');
            (d.onload = function () {
                m('handleUtils'), b && b();
            }),
                (d.onerror = function () {
                    m('rejectUtilsScriptPromise'), c && c();
                }),
                (d.className = 'iti-load-utils'),
                (d.async = !0),
                (d.src = a),
                document.body.appendChild(d);
        };
        return (
            (h.loadUtils = function (a) {
                if (
                    !window.intlTelInputUtils &&
                    !window.intlTelInputGlobals.startedLoadingUtilsScript
                ) {
                    if (
                        ((window.intlTelInputGlobals.startedLoadingUtilsScript =
                            !0),
                        'undefined' != typeof Promise)
                    )
                        return new Promise(function (b, c) {
                            return o(a, b, c);
                        });
                    o(a);
                }
                return null;
            }),
            (h.defaults = j),
            (h.version = '17.0.19'),
            function (a, b) {
                var c = new n(a, b);
                return (
                    c._init(),
                    a.setAttribute('data-intl-tel-input-id', c.id),
                    (window.intlTelInputGlobals.instances[c.id] = c),
                    c
                );
            }
        );
    })();
});

/* END select country phone code */

/* START horizontal calendar */

!(function (e, a) {
    'object' == typeof exports && 'undefined' != typeof module
        ? (module.exports = a())
        : 'function' == typeof define && define.amd
        ? define(a)
        : (e.moment = a());
})(this, function () {
    'use strict';
    var e, n;
    function l() {
        return e.apply(null, arguments);
    }
    function _(e) {
        return (
            e instanceof Array ||
            '[object Array]' === Object.prototype.toString.call(e)
        );
    }
    function i(e) {
        return (
            null != e && '[object Object]' === Object.prototype.toString.call(e)
        );
    }
    function o(e) {
        return void 0 === e;
    }
    function m(e) {
        return (
            'number' == typeof e ||
            '[object Number]' === Object.prototype.toString.call(e)
        );
    }
    function u(e) {
        return (
            e instanceof Date ||
            '[object Date]' === Object.prototype.toString.call(e)
        );
    }
    function M(e, a) {
        var t,
            s = [];
        for (t = 0; t < e.length; ++t) s.push(a(e[t], t));
        return s;
    }
    function h(e, a) {
        return Object.prototype.hasOwnProperty.call(e, a);
    }
    function L(e, a) {
        for (var t in a) h(a, t) && (e[t] = a[t]);
        return (
            h(a, 'toString') && (e.toString = a.toString),
            h(a, 'valueOf') && (e.valueOf = a.valueOf),
            e
        );
    }
    function c(e, a, t, s) {
        return Sa(e, a, t, s, !0).utc();
    }
    function Y(e) {
        return (
            null == e._pf &&
                (e._pf = {
                    empty: !1,
                    unusedTokens: [],
                    unusedInput: [],
                    overflow: -2,
                    charsLeftOver: 0,
                    nullInput: !1,
                    invalidMonth: null,
                    invalidFormat: !1,
                    userInvalidated: !1,
                    iso: !1,
                    parsedDateParts: [],
                    meridiem: null,
                    rfc2822: !1,
                    weekdayMismatch: !1,
                }),
            e._pf
        );
    }
    function y(e) {
        if (null == e._isValid) {
            var a = Y(e),
                t = n.call(a.parsedDateParts, function (e) {
                    return null != e;
                }),
                s =
                    !isNaN(e._d.getTime()) &&
                    a.overflow < 0 &&
                    !a.empty &&
                    !a.invalidMonth &&
                    !a.invalidWeekday &&
                    !a.weekdayMismatch &&
                    !a.nullInput &&
                    !a.invalidFormat &&
                    !a.userInvalidated &&
                    (!a.meridiem || (a.meridiem && t));
            if (
                (e._strict &&
                    (s =
                        s &&
                        0 === a.charsLeftOver &&
                        0 === a.unusedTokens.length &&
                        void 0 === a.bigHour),
                null != Object.isFrozen && Object.isFrozen(e))
            )
                return s;
            e._isValid = s;
        }
        return e._isValid;
    }
    function f(e) {
        var a = c(NaN);
        return null != e ? L(Y(a), e) : (Y(a).userInvalidated = !0), a;
    }
    n = Array.prototype.some
        ? Array.prototype.some
        : function (e) {
              for (var a = Object(this), t = a.length >>> 0, s = 0; s < t; s++)
                  if (s in a && e.call(this, a[s], s, a)) return !0;
              return !1;
          };
    var d = (l.momentProperties = []);
    function k(e, a) {
        var t, s, n;
        if (
            (o(a._isAMomentObject) || (e._isAMomentObject = a._isAMomentObject),
            o(a._i) || (e._i = a._i),
            o(a._f) || (e._f = a._f),
            o(a._l) || (e._l = a._l),
            o(a._strict) || (e._strict = a._strict),
            o(a._tzm) || (e._tzm = a._tzm),
            o(a._isUTC) || (e._isUTC = a._isUTC),
            o(a._offset) || (e._offset = a._offset),
            o(a._pf) || (e._pf = Y(a)),
            o(a._locale) || (e._locale = a._locale),
            0 < d.length)
        )
            for (t = 0; t < d.length; t++) o((n = a[(s = d[t])])) || (e[s] = n);
        return e;
    }
    var a = !1;
    function p(e) {
        k(this, e),
            (this._d = new Date(null != e._d ? e._d.getTime() : NaN)),
            this.isValid() || (this._d = new Date(NaN)),
            !1 === a && ((a = !0), l.updateOffset(this), (a = !1));
    }
    function D(e) {
        return e instanceof p || (null != e && null != e._isAMomentObject);
    }
    function T(e) {
        return e < 0 ? Math.ceil(e) || 0 : Math.floor(e);
    }
    function g(e) {
        var a = +e,
            t = 0;
        return 0 !== a && isFinite(a) && (t = T(a)), t;
    }
    function r(e, a, t) {
        var s,
            n = Math.min(e.length, a.length),
            d = Math.abs(e.length - a.length),
            r = 0;
        for (s = 0; s < n; s++)
            ((t && e[s] !== a[s]) || (!t && g(e[s]) !== g(a[s]))) && r++;
        return r + d;
    }
    function w(e) {
        !1 === l.suppressDeprecationWarnings &&
            'undefined' != typeof console &&
            console.warn &&
            console.warn('Deprecation warning: ' + e);
    }
    function t(n, d) {
        var r = !0;
        return L(function () {
            if (
                (null != l.deprecationHandler && l.deprecationHandler(null, n),
                r)
            ) {
                for (var e, a = [], t = 0; t < arguments.length; t++) {
                    if (((e = ''), 'object' == typeof arguments[t])) {
                        for (var s in ((e += '\n[' + t + '] '), arguments[0]))
                            e += s + ': ' + arguments[0][s] + ', ';
                        e = e.slice(0, -2);
                    } else e = arguments[t];
                    a.push(e);
                }
                w(
                    n +
                        '\nArguments: ' +
                        Array.prototype.slice.call(a).join('') +
                        '\n' +
                        new Error().stack
                ),
                    (r = !1);
            }
            return d.apply(this, arguments);
        }, d);
    }
    var s,
        v = {};
    function S(e, a) {
        null != l.deprecationHandler && l.deprecationHandler(e, a),
            v[e] || (w(a), (v[e] = !0));
    }
    function H(e) {
        return (
            e instanceof Function ||
            '[object Function]' === Object.prototype.toString.call(e)
        );
    }
    function b(e, a) {
        var t,
            s = L({}, e);
        for (t in a)
            h(a, t) &&
                (i(e[t]) && i(a[t])
                    ? ((s[t] = {}), L(s[t], e[t]), L(s[t], a[t]))
                    : null != a[t]
                    ? (s[t] = a[t])
                    : delete s[t]);
        for (t in e) h(e, t) && !h(a, t) && i(e[t]) && (s[t] = L({}, s[t]));
        return s;
    }
    function j(e) {
        null != e && this.set(e);
    }
    (l.suppressDeprecationWarnings = !1),
        (l.deprecationHandler = null),
        (s = Object.keys
            ? Object.keys
            : function (e) {
                  var a,
                      t = [];
                  for (a in e) h(e, a) && t.push(a);
                  return t;
              });
    var x = {};
    function O(e, a) {
        var t = e.toLowerCase();
        x[t] = x[t + 's'] = x[a] = e;
    }
    function P(e) {
        return 'string' == typeof e ? x[e] || x[e.toLowerCase()] : void 0;
    }
    function W(e) {
        var a,
            t,
            s = {};
        for (t in e) h(e, t) && (a = P(t)) && (s[a] = e[t]);
        return s;
    }
    var A = {};
    function E(e, a) {
        A[e] = a;
    }
    function F(e, a, t) {
        var s = '' + Math.abs(e),
            n = a - s.length;
        return (
            (0 <= e ? (t ? '+' : '') : '-') +
            Math.pow(10, Math.max(0, n)).toString().substr(1) +
            s
        );
    }
    var z =
            /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g,
        J = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,
        N = {},
        R = {};
    function C(e, a, t, s) {
        var n = s;
        'string' == typeof s &&
            (n = function () {
                return this[s]();
            }),
            e && (R[e] = n),
            a &&
                (R[a[0]] = function () {
                    return F(n.apply(this, arguments), a[1], a[2]);
                }),
            t &&
                (R[t] = function () {
                    return this.localeData().ordinal(
                        n.apply(this, arguments),
                        e
                    );
                });
    }
    function I(e, a) {
        return e.isValid()
            ? ((a = U(a, e.localeData())),
              (N[a] =
                  N[a] ||
                  (function (s) {
                      var e,
                          n,
                          a,
                          d = s.match(z);
                      for (e = 0, n = d.length; e < n; e++)
                          R[d[e]]
                              ? (d[e] = R[d[e]])
                              : (d[e] = (a = d[e]).match(/\[[\s\S]/)
                                    ? a.replace(/^\[|\]$/g, '')
                                    : a.replace(/\\/g, ''));
                      return function (e) {
                          var a,
                              t = '';
                          for (a = 0; a < n; a++)
                              t += H(d[a]) ? d[a].call(e, s) : d[a];
                          return t;
                      };
                  })(a)),
              N[a](e))
            : e.localeData().invalidDate();
    }
    function U(e, a) {
        var t = 5;
        function s(e) {
            return a.longDateFormat(e) || e;
        }
        for (J.lastIndex = 0; 0 <= t && J.test(e); )
            (e = e.replace(J, s)), (J.lastIndex = 0), (t -= 1);
        return e;
    }
    var G = /\d/,
        V = /\d\d/,
        K = /\d{3}/,
        Z = /\d{4}/,
        $ = /[+-]?\d{6}/,
        B = /\d\d?/,
        q = /\d\d\d\d?/,
        Q = /\d\d\d\d\d\d?/,
        X = /\d{1,3}/,
        ee = /\d{1,4}/,
        ae = /[+-]?\d{1,6}/,
        te = /\d+/,
        se = /[+-]?\d+/,
        ne = /Z|[+-]\d\d:?\d\d/gi,
        de = /Z|[+-]\d\d(?::?\d\d)?/gi,
        re =
            /[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i,
        _e = {};
    function ie(e, t, s) {
        _e[e] = H(t)
            ? t
            : function (e, a) {
                  return e && s ? s : t;
              };
    }
    function oe(e, a) {
        return h(_e, e)
            ? _e[e](a._strict, a._locale)
            : new RegExp(
                  me(
                      e
                          .replace('\\', '')
                          .replace(
                              /\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g,
                              function (e, a, t, s, n) {
                                  return a || t || s || n;
                              }
                          )
                  )
              );
    }
    function me(e) {
        return e.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }
    var ue = {};
    function le(e, t) {
        var a,
            s = t;
        for (
            'string' == typeof e && (e = [e]),
                m(t) &&
                    (s = function (e, a) {
                        a[t] = g(e);
                    }),
                a = 0;
            a < e.length;
            a++
        )
            ue[e[a]] = s;
    }
    function Me(e, n) {
        le(e, function (e, a, t, s) {
            (t._w = t._w || {}), n(e, t._w, t, s);
        });
    }
    var he = 0,
        Le = 1,
        ce = 2,
        Ye = 3,
        ye = 4,
        fe = 5,
        ke = 6,
        pe = 7,
        De = 8;
    function Te(e) {
        return ge(e) ? 366 : 365;
    }
    function ge(e) {
        return (e % 4 == 0 && e % 100 != 0) || e % 400 == 0;
    }
    C('Y', 0, 0, function () {
        var e = this.year();
        return e <= 9999 ? '' + e : '+' + e;
    }),
        C(0, ['YY', 2], 0, function () {
            return this.year() % 100;
        }),
        C(0, ['YYYY', 4], 0, 'year'),
        C(0, ['YYYYY', 5], 0, 'year'),
        C(0, ['YYYYYY', 6, !0], 0, 'year'),
        O('year', 'y'),
        E('year', 1),
        ie('Y', se),
        ie('YY', B, V),
        ie('YYYY', ee, Z),
        ie('YYYYY', ae, $),
        ie('YYYYYY', ae, $),
        le(['YYYYY', 'YYYYYY'], he),
        le('YYYY', function (e, a) {
            a[he] = 2 === e.length ? l.parseTwoDigitYear(e) : g(e);
        }),
        le('YY', function (e, a) {
            a[he] = l.parseTwoDigitYear(e);
        }),
        le('Y', function (e, a) {
            a[he] = parseInt(e, 10);
        }),
        (l.parseTwoDigitYear = function (e) {
            return g(e) + (68 < g(e) ? 1900 : 2e3);
        });
    var we,
        ve = Se('FullYear', !0);
    function Se(a, t) {
        return function (e) {
            return null != e
                ? (be(this, a, e), l.updateOffset(this, t), this)
                : He(this, a);
        };
    }
    function He(e, a) {
        return e.isValid() ? e._d['get' + (e._isUTC ? 'UTC' : '') + a]() : NaN;
    }
    function be(e, a, t) {
        e.isValid() &&
            !isNaN(t) &&
            ('FullYear' === a &&
            ge(e.year()) &&
            1 === e.month() &&
            29 === e.date()
                ? e._d['set' + (e._isUTC ? 'UTC' : '') + a](
                      t,
                      e.month(),
                      je(t, e.month())
                  )
                : e._d['set' + (e._isUTC ? 'UTC' : '') + a](t));
    }
    function je(e, a) {
        if (isNaN(e) || isNaN(a)) return NaN;
        var t,
            s = ((a % (t = 12)) + t) % t;
        return (
            (e += (a - s) / 12),
            1 === s ? (ge(e) ? 29 : 28) : 31 - ((s % 7) % 2)
        );
    }
    (we = Array.prototype.indexOf
        ? Array.prototype.indexOf
        : function (e) {
              var a;
              for (a = 0; a < this.length; ++a) if (this[a] === e) return a;
              return -1;
          }),
        C('M', ['MM', 2], 'Mo', function () {
            return this.month() + 1;
        }),
        C('MMM', 0, 0, function (e) {
            return this.localeData().monthsShort(this, e);
        }),
        C('MMMM', 0, 0, function (e) {
            return this.localeData().months(this, e);
        }),
        O('month', 'M'),
        E('month', 8),
        ie('M', B),
        ie('MM', B, V),
        ie('MMM', function (e, a) {
            return a.monthsShortRegex(e);
        }),
        ie('MMMM', function (e, a) {
            return a.monthsRegex(e);
        }),
        le(['M', 'MM'], function (e, a) {
            a[Le] = g(e) - 1;
        }),
        le(['MMM', 'MMMM'], function (e, a, t, s) {
            var n = t._locale.monthsParse(e, s, t._strict);
            null != n ? (a[Le] = n) : (Y(t).invalidMonth = e);
        });
    var xe = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/,
        Oe =
            'January_February_March_April_May_June_July_August_September_October_November_December'.split(
                '_'
            );
    var Pe = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_');
    function We(e, a) {
        var t;
        if (!e.isValid()) return e;
        if ('string' == typeof a)
            if (/^\d+$/.test(a)) a = g(a);
            else if (!m((a = e.localeData().monthsParse(a)))) return e;
        return (
            (t = Math.min(e.date(), je(e.year(), a))),
            e._d['set' + (e._isUTC ? 'UTC' : '') + 'Month'](a, t),
            e
        );
    }
    function Ae(e) {
        return null != e
            ? (We(this, e), l.updateOffset(this, !0), this)
            : He(this, 'Month');
    }
    var Ee = re;
    var Fe = re;
    function ze() {
        function e(e, a) {
            return a.length - e.length;
        }
        var a,
            t,
            s = [],
            n = [],
            d = [];
        for (a = 0; a < 12; a++)
            (t = c([2e3, a])),
                s.push(this.monthsShort(t, '')),
                n.push(this.months(t, '')),
                d.push(this.months(t, '')),
                d.push(this.monthsShort(t, ''));
        for (s.sort(e), n.sort(e), d.sort(e), a = 0; a < 12; a++)
            (s[a] = me(s[a])), (n[a] = me(n[a]));
        for (a = 0; a < 24; a++) d[a] = me(d[a]);
        (this._monthsRegex = new RegExp('^(' + d.join('|') + ')', 'i')),
            (this._monthsShortRegex = this._monthsRegex),
            (this._monthsStrictRegex = new RegExp(
                '^(' + n.join('|') + ')',
                'i'
            )),
            (this._monthsShortStrictRegex = new RegExp(
                '^(' + s.join('|') + ')',
                'i'
            ));
    }
    function Je(e) {
        var a;
        if (e < 100 && 0 <= e) {
            var t = Array.prototype.slice.call(arguments);
            (t[0] = e + 400),
                (a = new Date(Date.UTC.apply(null, t))),
                isFinite(a.getUTCFullYear()) && a.setUTCFullYear(e);
        } else a = new Date(Date.UTC.apply(null, arguments));
        return a;
    }
    function Ne(e, a, t) {
        var s = 7 + a - t;
        return -((7 + Je(e, 0, s).getUTCDay() - a) % 7) + s - 1;
    }
    function Re(e, a, t, s, n) {
        var d,
            r,
            _ = 1 + 7 * (a - 1) + ((7 + t - s) % 7) + Ne(e, s, n);
        return (
            (r =
                _ <= 0
                    ? Te((d = e - 1)) + _
                    : _ > Te(e)
                    ? ((d = e + 1), _ - Te(e))
                    : ((d = e), _)),
            { year: d, dayOfYear: r }
        );
    }
    function Ce(e, a, t) {
        var s,
            n,
            d = Ne(e.year(), a, t),
            r = Math.floor((e.dayOfYear() - d - 1) / 7) + 1;
        return (
            r < 1
                ? (s = r + Ie((n = e.year() - 1), a, t))
                : r > Ie(e.year(), a, t)
                ? ((s = r - Ie(e.year(), a, t)), (n = e.year() + 1))
                : ((n = e.year()), (s = r)),
            { week: s, year: n }
        );
    }
    function Ie(e, a, t) {
        var s = Ne(e, a, t),
            n = Ne(e + 1, a, t);
        return (Te(e) - s + n) / 7;
    }
    C('w', ['ww', 2], 'wo', 'week'),
        C('W', ['WW', 2], 'Wo', 'isoWeek'),
        O('week', 'w'),
        O('isoWeek', 'W'),
        E('week', 5),
        E('isoWeek', 5),
        ie('w', B),
        ie('ww', B, V),
        ie('W', B),
        ie('WW', B, V),
        Me(['w', 'ww', 'W', 'WW'], function (e, a, t, s) {
            a[s.substr(0, 1)] = g(e);
        });
    function Ue(e, a) {
        return e.slice(a, 7).concat(e.slice(0, a));
    }
    C('d', 0, 'do', 'day'),
        C('dd', 0, 0, function (e) {
            return this.localeData().weekdaysMin(this, e);
        }),
        C('ddd', 0, 0, function (e) {
            return this.localeData().weekdaysShort(this, e);
        }),
        C('dddd', 0, 0, function (e) {
            return this.localeData().weekdays(this, e);
        }),
        C('e', 0, 0, 'weekday'),
        C('E', 0, 0, 'isoWeekday'),
        O('day', 'd'),
        O('weekday', 'e'),
        O('isoWeekday', 'E'),
        E('day', 11),
        E('weekday', 11),
        E('isoWeekday', 11),
        ie('d', B),
        ie('e', B),
        ie('E', B),
        ie('dd', function (e, a) {
            return a.weekdaysMinRegex(e);
        }),
        ie('ddd', function (e, a) {
            return a.weekdaysShortRegex(e);
        }),
        ie('dddd', function (e, a) {
            return a.weekdaysRegex(e);
        }),
        Me(['dd', 'ddd', 'dddd'], function (e, a, t, s) {
            var n = t._locale.weekdaysParse(e, s, t._strict);
            null != n ? (a.d = n) : (Y(t).invalidWeekday = e);
        }),
        Me(['d', 'e', 'E'], function (e, a, t, s) {
            a[s] = g(e);
        });
    var Ge = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split(
        '_'
    );
    var Ve = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_');
    var Ke = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_');
    var Ze = re;
    var $e = re;
    var Be = re;
    function qe() {
        function e(e, a) {
            return a.length - e.length;
        }
        var a,
            t,
            s,
            n,
            d,
            r = [],
            _ = [],
            i = [],
            o = [];
        for (a = 0; a < 7; a++)
            (t = c([2e3, 1]).day(a)),
                (s = this.weekdaysMin(t, '')),
                (n = this.weekdaysShort(t, '')),
                (d = this.weekdays(t, '')),
                r.push(s),
                _.push(n),
                i.push(d),
                o.push(s),
                o.push(n),
                o.push(d);
        for (r.sort(e), _.sort(e), i.sort(e), o.sort(e), a = 0; a < 7; a++)
            (_[a] = me(_[a])), (i[a] = me(i[a])), (o[a] = me(o[a]));
        (this._weekdaysRegex = new RegExp('^(' + o.join('|') + ')', 'i')),
            (this._weekdaysShortRegex = this._weekdaysRegex),
            (this._weekdaysMinRegex = this._weekdaysRegex),
            (this._weekdaysStrictRegex = new RegExp(
                '^(' + i.join('|') + ')',
                'i'
            )),
            (this._weekdaysShortStrictRegex = new RegExp(
                '^(' + _.join('|') + ')',
                'i'
            )),
            (this._weekdaysMinStrictRegex = new RegExp(
                '^(' + r.join('|') + ')',
                'i'
            ));
    }
    function Qe() {
        return this.hours() % 12 || 12;
    }
    function Xe(e, a) {
        C(e, 0, 0, function () {
            return this.localeData().meridiem(this.hours(), this.minutes(), a);
        });
    }
    function ea(e, a) {
        return a._meridiemParse;
    }
    C('H', ['HH', 2], 0, 'hour'),
        C('h', ['hh', 2], 0, Qe),
        C('k', ['kk', 2], 0, function () {
            return this.hours() || 24;
        }),
        C('hmm', 0, 0, function () {
            return '' + Qe.apply(this) + F(this.minutes(), 2);
        }),
        C('hmmss', 0, 0, function () {
            return (
                '' +
                Qe.apply(this) +
                F(this.minutes(), 2) +
                F(this.seconds(), 2)
            );
        }),
        C('Hmm', 0, 0, function () {
            return '' + this.hours() + F(this.minutes(), 2);
        }),
        C('Hmmss', 0, 0, function () {
            return (
                '' + this.hours() + F(this.minutes(), 2) + F(this.seconds(), 2)
            );
        }),
        Xe('a', !0),
        Xe('A', !1),
        O('hour', 'h'),
        E('hour', 13),
        ie('a', ea),
        ie('A', ea),
        ie('H', B),
        ie('h', B),
        ie('k', B),
        ie('HH', B, V),
        ie('hh', B, V),
        ie('kk', B, V),
        ie('hmm', q),
        ie('hmmss', Q),
        ie('Hmm', q),
        ie('Hmmss', Q),
        le(['H', 'HH'], Ye),
        le(['k', 'kk'], function (e, a, t) {
            var s = g(e);
            a[Ye] = 24 === s ? 0 : s;
        }),
        le(['a', 'A'], function (e, a, t) {
            (t._isPm = t._locale.isPM(e)), (t._meridiem = e);
        }),
        le(['h', 'hh'], function (e, a, t) {
            (a[Ye] = g(e)), (Y(t).bigHour = !0);
        }),
        le('hmm', function (e, a, t) {
            var s = e.length - 2;
            (a[Ye] = g(e.substr(0, s))),
                (a[ye] = g(e.substr(s))),
                (Y(t).bigHour = !0);
        }),
        le('hmmss', function (e, a, t) {
            var s = e.length - 4,
                n = e.length - 2;
            (a[Ye] = g(e.substr(0, s))),
                (a[ye] = g(e.substr(s, 2))),
                (a[fe] = g(e.substr(n))),
                (Y(t).bigHour = !0);
        }),
        le('Hmm', function (e, a, t) {
            var s = e.length - 2;
            (a[Ye] = g(e.substr(0, s))), (a[ye] = g(e.substr(s)));
        }),
        le('Hmmss', function (e, a, t) {
            var s = e.length - 4,
                n = e.length - 2;
            (a[Ye] = g(e.substr(0, s))),
                (a[ye] = g(e.substr(s, 2))),
                (a[fe] = g(e.substr(n)));
        });
    var aa,
        ta = Se('Hours', !0),
        sa = {
            calendar: {
                sameDay: '[Today at] LT',
                nextDay: '[Tomorrow at] LT',
                nextWeek: 'dddd [at] LT',
                lastDay: '[Yesterday at] LT',
                lastWeek: '[Last] dddd [at] LT',
                sameElse: 'L',
            },
            longDateFormat: {
                LTS: 'h:mm:ss A',
                LT: 'h:mm A',
                L: 'MM/DD/YYYY',
                LL: 'MMMM D, YYYY',
                LLL: 'MMMM D, YYYY h:mm A',
                LLLL: 'dddd, MMMM D, YYYY h:mm A',
            },
            invalidDate: 'Invalid date',
            ordinal: '%d',
            dayOfMonthOrdinalParse: /\d{1,2}/,
            relativeTime: {
                future: 'in %s',
                past: '%s ago',
                s: 'a few seconds',
                ss: '%d seconds',
                m: 'a minute',
                mm: '%d minutes',
                h: 'an hour',
                hh: '%d hours',
                d: 'a day',
                dd: '%d days',
                M: 'a month',
                MM: '%d months',
                y: 'a year',
                yy: '%d years',
            },
            months: Oe,
            monthsShort: Pe,
            week: { dow: 0, doy: 6 },
            weekdays: Ge,
            weekdaysMin: Ke,
            weekdaysShort: Ve,
            meridiemParse: /[ap]\.?m?\.?/i,
        },
        na = {},
        da = {};
    function ra(e) {
        return e ? e.toLowerCase().replace('_', '-') : e;
    }
    function _a(e) {
        var a = null;
        if (!na[e] && 'undefined' != typeof module && module && module.exports)
            try {
                (a = aa._abbr), require('./locale/' + e), ia(a);
            } catch (e) {}
        return na[e];
    }
    function ia(e, a) {
        var t;
        return (
            e &&
                ((t = o(a) ? ma(e) : oa(e, a))
                    ? (aa = t)
                    : 'undefined' != typeof console &&
                      console.warn &&
                      console.warn(
                          'Locale ' +
                              e +
                              ' not found. Did you forget to load it?'
                      )),
            aa._abbr
        );
    }
    function oa(e, a) {
        if (null === a) return delete na[e], null;
        var t,
            s = sa;
        if (((a.abbr = e), null != na[e]))
            S(
                'defineLocaleOverride',
                'use moment.updateLocale(localeName, config) to change an existing locale. moment.defineLocale(localeName, config) should only be used for creating a new locale See http://momentjs.com/guides/#/warnings/define-locale/ for more info.'
            ),
                (s = na[e]._config);
        else if (null != a.parentLocale)
            if (null != na[a.parentLocale]) s = na[a.parentLocale]._config;
            else {
                if (null == (t = _a(a.parentLocale)))
                    return (
                        da[a.parentLocale] || (da[a.parentLocale] = []),
                        da[a.parentLocale].push({ name: e, config: a }),
                        null
                    );
                s = t._config;
            }
        return (
            (na[e] = new j(b(s, a))),
            da[e] &&
                da[e].forEach(function (e) {
                    oa(e.name, e.config);
                }),
            ia(e),
            na[e]
        );
    }
    function ma(e) {
        var a;
        if ((e && e._locale && e._locale._abbr && (e = e._locale._abbr), !e))
            return aa;
        if (!_(e)) {
            if ((a = _a(e))) return a;
            e = [e];
        }
        return (function (e) {
            for (var a, t, s, n, d = 0; d < e.length; ) {
                for (
                    a = (n = ra(e[d]).split('-')).length,
                        t = (t = ra(e[d + 1])) ? t.split('-') : null;
                    0 < a;

                ) {
                    if ((s = _a(n.slice(0, a).join('-')))) return s;
                    if (t && t.length >= a && r(n, t, !0) >= a - 1) break;
                    a--;
                }
                d++;
            }
            return aa;
        })(e);
    }
    function ua(e) {
        var a,
            t = e._a;
        return (
            t &&
                -2 === Y(e).overflow &&
                ((a =
                    t[Le] < 0 || 11 < t[Le]
                        ? Le
                        : t[ce] < 1 || t[ce] > je(t[he], t[Le])
                        ? ce
                        : t[Ye] < 0 ||
                          24 < t[Ye] ||
                          (24 === t[Ye] &&
                              (0 !== t[ye] || 0 !== t[fe] || 0 !== t[ke]))
                        ? Ye
                        : t[ye] < 0 || 59 < t[ye]
                        ? ye
                        : t[fe] < 0 || 59 < t[fe]
                        ? fe
                        : t[ke] < 0 || 999 < t[ke]
                        ? ke
                        : -1),
                Y(e)._overflowDayOfYear && (a < he || ce < a) && (a = ce),
                Y(e)._overflowWeeks && -1 === a && (a = pe),
                Y(e)._overflowWeekday && -1 === a && (a = De),
                (Y(e).overflow = a)),
            e
        );
    }
    function la(e, a, t) {
        return null != e ? e : null != a ? a : t;
    }
    function Ma(e) {
        var a,
            t,
            s,
            n,
            d,
            r = [];
        if (!e._d) {
            var _, i;
            for (
                _ = e,
                    i = new Date(l.now()),
                    s = _._useUTC
                        ? [i.getUTCFullYear(), i.getUTCMonth(), i.getUTCDate()]
                        : [i.getFullYear(), i.getMonth(), i.getDate()],
                    e._w &&
                        null == e._a[ce] &&
                        null == e._a[Le] &&
                        (function (e) {
                            var a, t, s, n, d, r, _, i;
                            if (
                                null != (a = e._w).GG ||
                                null != a.W ||
                                null != a.E
                            )
                                (d = 1),
                                    (r = 4),
                                    (t = la(
                                        a.GG,
                                        e._a[he],
                                        Ce(Ha(), 1, 4).year
                                    )),
                                    (s = la(a.W, 1)),
                                    ((n = la(a.E, 1)) < 1 || 7 < n) && (i = !0);
                            else {
                                (d = e._locale._week.dow),
                                    (r = e._locale._week.doy);
                                var o = Ce(Ha(), d, r);
                                (t = la(a.gg, e._a[he], o.year)),
                                    (s = la(a.w, o.week)),
                                    null != a.d
                                        ? ((n = a.d) < 0 || 6 < n) && (i = !0)
                                        : null != a.e
                                        ? ((n = a.e + d),
                                          (a.e < 0 || 6 < a.e) && (i = !0))
                                        : (n = d);
                            }
                            s < 1 || s > Ie(t, d, r)
                                ? (Y(e)._overflowWeeks = !0)
                                : null != i
                                ? (Y(e)._overflowWeekday = !0)
                                : ((_ = Re(t, s, n, d, r)),
                                  (e._a[he] = _.year),
                                  (e._dayOfYear = _.dayOfYear));
                        })(e),
                    null != e._dayOfYear &&
                        ((d = la(e._a[he], s[he])),
                        (e._dayOfYear > Te(d) || 0 === e._dayOfYear) &&
                            (Y(e)._overflowDayOfYear = !0),
                        (t = Je(d, 0, e._dayOfYear)),
                        (e._a[Le] = t.getUTCMonth()),
                        (e._a[ce] = t.getUTCDate())),
                    a = 0;
                a < 3 && null == e._a[a];
                ++a
            )
                e._a[a] = r[a] = s[a];
            for (; a < 7; a++)
                e._a[a] = r[a] = null == e._a[a] ? (2 === a ? 1 : 0) : e._a[a];
            24 === e._a[Ye] &&
                0 === e._a[ye] &&
                0 === e._a[fe] &&
                0 === e._a[ke] &&
                ((e._nextDay = !0), (e._a[Ye] = 0)),
                (e._d = (
                    e._useUTC
                        ? Je
                        : function (e, a, t, s, n, d, r) {
                              var _;
                              return (
                                  e < 100 && 0 <= e
                                      ? ((_ = new Date(
                                            e + 400,
                                            a,
                                            t,
                                            s,
                                            n,
                                            d,
                                            r
                                        )),
                                        isFinite(_.getFullYear()) &&
                                            _.setFullYear(e))
                                      : (_ = new Date(e, a, t, s, n, d, r)),
                                  _
                              );
                          }
                ).apply(null, r)),
                (n = e._useUTC ? e._d.getUTCDay() : e._d.getDay()),
                null != e._tzm &&
                    e._d.setUTCMinutes(e._d.getUTCMinutes() - e._tzm),
                e._nextDay && (e._a[Ye] = 24),
                e._w &&
                    void 0 !== e._w.d &&
                    e._w.d !== n &&
                    (Y(e).weekdayMismatch = !0);
        }
    }
    var ha =
            /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
        La =
            /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
        ca = /Z|[+-]\d\d(?::?\d\d)?/,
        Ya = [
            ['YYYYYY-MM-DD', /[+-]\d{6}-\d\d-\d\d/],
            ['YYYY-MM-DD', /\d{4}-\d\d-\d\d/],
            ['GGGG-[W]WW-E', /\d{4}-W\d\d-\d/],
            ['GGGG-[W]WW', /\d{4}-W\d\d/, !1],
            ['YYYY-DDD', /\d{4}-\d{3}/],
            ['YYYY-MM', /\d{4}-\d\d/, !1],
            ['YYYYYYMMDD', /[+-]\d{10}/],
            ['YYYYMMDD', /\d{8}/],
            ['GGGG[W]WWE', /\d{4}W\d{3}/],
            ['GGGG[W]WW', /\d{4}W\d{2}/, !1],
            ['YYYYDDD', /\d{7}/],
        ],
        ya = [
            ['HH:mm:ss.SSSS', /\d\d:\d\d:\d\d\.\d+/],
            ['HH:mm:ss,SSSS', /\d\d:\d\d:\d\d,\d+/],
            ['HH:mm:ss', /\d\d:\d\d:\d\d/],
            ['HH:mm', /\d\d:\d\d/],
            ['HHmmss.SSSS', /\d\d\d\d\d\d\.\d+/],
            ['HHmmss,SSSS', /\d\d\d\d\d\d,\d+/],
            ['HHmmss', /\d\d\d\d\d\d/],
            ['HHmm', /\d\d\d\d/],
            ['HH', /\d\d/],
        ],
        fa = /^\/?Date\((\-?\d+)/i;
    function ka(e) {
        var a,
            t,
            s,
            n,
            d,
            r,
            _ = e._i,
            i = ha.exec(_) || La.exec(_);
        if (i) {
            for (Y(e).iso = !0, a = 0, t = Ya.length; a < t; a++)
                if (Ya[a][1].exec(i[1])) {
                    (n = Ya[a][0]), (s = !1 !== Ya[a][2]);
                    break;
                }
            if (null == n) return void (e._isValid = !1);
            if (i[3]) {
                for (a = 0, t = ya.length; a < t; a++)
                    if (ya[a][1].exec(i[3])) {
                        d = (i[2] || ' ') + ya[a][0];
                        break;
                    }
                if (null == d) return void (e._isValid = !1);
            }
            if (!s && null != d) return void (e._isValid = !1);
            if (i[4]) {
                if (!ca.exec(i[4])) return void (e._isValid = !1);
                r = 'Z';
            }
            (e._f = n + (d || '') + (r || '')), wa(e);
        } else e._isValid = !1;
    }
    var pa =
        /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/;
    function Da(e, a, t, s, n, d) {
        var r = [
            (function (e) {
                var a = parseInt(e, 10);
                {
                    if (a <= 49) return 2e3 + a;
                    if (a <= 999) return 1900 + a;
                }
                return a;
            })(e),
            Pe.indexOf(a),
            parseInt(t, 10),
            parseInt(s, 10),
            parseInt(n, 10),
        ];
        return d && r.push(parseInt(d, 10)), r;
    }
    var Ta = {
        UT: 0,
        GMT: 0,
        EDT: -240,
        EST: -300,
        CDT: -300,
        CST: -360,
        MDT: -360,
        MST: -420,
        PDT: -420,
        PST: -480,
    };
    function ga(e) {
        var a,
            t,
            s,
            n = pa.exec(
                e._i
                    .replace(/\([^)]*\)|[\n\t]/g, ' ')
                    .replace(/(\s\s+)/g, ' ')
                    .replace(/^\s\s*/, '')
                    .replace(/\s\s*$/, '')
            );
        if (n) {
            var d = Da(n[4], n[3], n[2], n[5], n[6], n[7]);
            if (
                ((a = n[1]),
                (t = d),
                (s = e),
                a &&
                    Ve.indexOf(a) !== new Date(t[0], t[1], t[2]).getDay() &&
                    ((Y(s).weekdayMismatch = !0), !(s._isValid = !1)))
            )
                return;
            (e._a = d),
                (e._tzm = (function (e, a, t) {
                    if (e) return Ta[e];
                    if (a) return 0;
                    var s = parseInt(t, 10),
                        n = s % 100;
                    return ((s - n) / 100) * 60 + n;
                })(n[8], n[9], n[10])),
                (e._d = Je.apply(null, e._a)),
                e._d.setUTCMinutes(e._d.getUTCMinutes() - e._tzm),
                (Y(e).rfc2822 = !0);
        } else e._isValid = !1;
    }
    function wa(e) {
        if (e._f !== l.ISO_8601)
            if (e._f !== l.RFC_2822) {
                (e._a = []), (Y(e).empty = !0);
                var a,
                    t,
                    s,
                    n,
                    d,
                    r,
                    _,
                    i,
                    o = '' + e._i,
                    m = o.length,
                    u = 0;
                for (
                    s = U(e._f, e._locale).match(z) || [], a = 0;
                    a < s.length;
                    a++
                )
                    (n = s[a]),
                        (t = (o.match(oe(n, e)) || [])[0]) &&
                            (0 < (d = o.substr(0, o.indexOf(t))).length &&
                                Y(e).unusedInput.push(d),
                            (o = o.slice(o.indexOf(t) + t.length)),
                            (u += t.length)),
                        R[n]
                            ? (t
                                  ? (Y(e).empty = !1)
                                  : Y(e).unusedTokens.push(n),
                              (r = n),
                              (i = e),
                              null != (_ = t) &&
                                  h(ue, r) &&
                                  ue[r](_, i._a, i, r))
                            : e._strict && !t && Y(e).unusedTokens.push(n);
                (Y(e).charsLeftOver = m - u),
                    0 < o.length && Y(e).unusedInput.push(o),
                    e._a[Ye] <= 12 &&
                        !0 === Y(e).bigHour &&
                        0 < e._a[Ye] &&
                        (Y(e).bigHour = void 0),
                    (Y(e).parsedDateParts = e._a.slice(0)),
                    (Y(e).meridiem = e._meridiem),
                    (e._a[Ye] = (function (e, a, t) {
                        var s;
                        if (null == t) return a;
                        return null != e.meridiemHour
                            ? e.meridiemHour(a, t)
                            : (null != e.isPM &&
                                  ((s = e.isPM(t)) && a < 12 && (a += 12),
                                  s || 12 !== a || (a = 0)),
                              a);
                    })(e._locale, e._a[Ye], e._meridiem)),
                    Ma(e),
                    ua(e);
            } else ga(e);
        else ka(e);
    }
    function va(e) {
        var a,
            t,
            s,
            n,
            d = e._i,
            r = e._f;
        return (
            (e._locale = e._locale || ma(e._l)),
            null === d || (void 0 === r && '' === d)
                ? f({ nullInput: !0 })
                : ('string' == typeof d && (e._i = d = e._locale.preparse(d)),
                  D(d)
                      ? new p(ua(d))
                      : (u(d)
                            ? (e._d = d)
                            : _(r)
                            ? (function (e) {
                                  var a, t, s, n, d;
                                  if (0 === e._f.length)
                                      return (
                                          (Y(e).invalidFormat = !0),
                                          (e._d = new Date(NaN))
                                      );
                                  for (n = 0; n < e._f.length; n++)
                                      (d = 0),
                                          (a = k({}, e)),
                                          null != e._useUTC &&
                                              (a._useUTC = e._useUTC),
                                          (a._f = e._f[n]),
                                          wa(a),
                                          y(a) &&
                                              ((d += Y(a).charsLeftOver),
                                              (d +=
                                                  10 *
                                                  Y(a).unusedTokens.length),
                                              (Y(a).score = d),
                                              (null == s || d < s) &&
                                                  ((s = d), (t = a)));
                                  L(e, t || a);
                              })(e)
                            : r
                            ? wa(e)
                            : o((t = (a = e)._i))
                            ? (a._d = new Date(l.now()))
                            : u(t)
                            ? (a._d = new Date(t.valueOf()))
                            : 'string' == typeof t
                            ? ((s = a),
                              null === (n = fa.exec(s._i))
                                  ? (ka(s),
                                    !1 === s._isValid &&
                                        (delete s._isValid,
                                        ga(s),
                                        !1 === s._isValid &&
                                            (delete s._isValid,
                                            l.createFromInputFallback(s))))
                                  : (s._d = new Date(+n[1])))
                            : _(t)
                            ? ((a._a = M(t.slice(0), function (e) {
                                  return parseInt(e, 10);
                              })),
                              Ma(a))
                            : i(t)
                            ? (function (e) {
                                  if (!e._d) {
                                      var a = W(e._i);
                                      (e._a = M(
                                          [
                                              a.year,
                                              a.month,
                                              a.day || a.date,
                                              a.hour,
                                              a.minute,
                                              a.second,
                                              a.millisecond,
                                          ],
                                          function (e) {
                                              return e && parseInt(e, 10);
                                          }
                                      )),
                                          Ma(e);
                                  }
                              })(a)
                            : m(t)
                            ? (a._d = new Date(t))
                            : l.createFromInputFallback(a),
                        y(e) || (e._d = null),
                        e))
        );
    }
    function Sa(e, a, t, s, n) {
        var d,
            r = {};
        return (
            (!0 !== t && !1 !== t) || ((s = t), (t = void 0)),
            ((i(e) &&
                (function (e) {
                    if (Object.getOwnPropertyNames)
                        return 0 === Object.getOwnPropertyNames(e).length;
                    var a;
                    for (a in e) if (e.hasOwnProperty(a)) return !1;
                    return !0;
                })(e)) ||
                (_(e) && 0 === e.length)) &&
                (e = void 0),
            (r._isAMomentObject = !0),
            (r._useUTC = r._isUTC = n),
            (r._l = t),
            (r._i = e),
            (r._f = a),
            (r._strict = s),
            (d = new p(ua(va(r))))._nextDay &&
                (d.add(1, 'd'), (d._nextDay = void 0)),
            d
        );
    }
    function Ha(e, a, t, s) {
        return Sa(e, a, t, s, !1);
    }
    (l.createFromInputFallback = t(
        'value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are discouraged and will be removed in an upcoming major release. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.',
        function (e) {
            e._d = new Date(e._i + (e._useUTC ? ' UTC' : ''));
        }
    )),
        (l.ISO_8601 = function () {}),
        (l.RFC_2822 = function () {});
    var ba = t(
            'moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/',
            function () {
                var e = Ha.apply(null, arguments);
                return this.isValid() && e.isValid()
                    ? e < this
                        ? this
                        : e
                    : f();
            }
        ),
        ja = t(
            'moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/',
            function () {
                var e = Ha.apply(null, arguments);
                return this.isValid() && e.isValid()
                    ? this < e
                        ? this
                        : e
                    : f();
            }
        );
    function xa(e, a) {
        var t, s;
        if ((1 === a.length && _(a[0]) && (a = a[0]), !a.length)) return Ha();
        for (t = a[0], s = 1; s < a.length; ++s)
            (a[s].isValid() && !a[s][e](t)) || (t = a[s]);
        return t;
    }
    var Oa = [
        'year',
        'quarter',
        'month',
        'week',
        'day',
        'hour',
        'minute',
        'second',
        'millisecond',
    ];
    function Pa(e) {
        var a = W(e),
            t = a.year || 0,
            s = a.quarter || 0,
            n = a.month || 0,
            d = a.week || a.isoWeek || 0,
            r = a.day || 0,
            _ = a.hour || 0,
            i = a.minute || 0,
            o = a.second || 0,
            m = a.millisecond || 0;
        (this._isValid = (function (e) {
            for (var a in e)
                if (-1 === we.call(Oa, a) || (null != e[a] && isNaN(e[a])))
                    return !1;
            for (var t = !1, s = 0; s < Oa.length; ++s)
                if (e[Oa[s]]) {
                    if (t) return !1;
                    parseFloat(e[Oa[s]]) !== g(e[Oa[s]]) && (t = !0);
                }
            return !0;
        })(a)),
            (this._milliseconds = +m + 1e3 * o + 6e4 * i + 1e3 * _ * 60 * 60),
            (this._days = +r + 7 * d),
            (this._months = +n + 3 * s + 12 * t),
            (this._data = {}),
            (this._locale = ma()),
            this._bubble();
    }
    function Wa(e) {
        return e instanceof Pa;
    }
    function Aa(e) {
        return e < 0 ? -1 * Math.round(-1 * e) : Math.round(e);
    }
    function Ea(e, t) {
        C(e, 0, 0, function () {
            var e = this.utcOffset(),
                a = '+';
            return (
                e < 0 && ((e = -e), (a = '-')),
                a + F(~~(e / 60), 2) + t + F(~~e % 60, 2)
            );
        });
    }
    Ea('Z', ':'),
        Ea('ZZ', ''),
        ie('Z', de),
        ie('ZZ', de),
        le(['Z', 'ZZ'], function (e, a, t) {
            (t._useUTC = !0), (t._tzm = za(de, e));
        });
    var Fa = /([\+\-]|\d\d)/gi;
    function za(e, a) {
        var t = (a || '').match(e);
        if (null === t) return null;
        var s = ((t[t.length - 1] || []) + '').match(Fa) || ['-', 0, 0],
            n = 60 * s[1] + g(s[2]);
        return 0 === n ? 0 : '+' === s[0] ? n : -n;
    }
    function Ja(e, a) {
        var t, s;
        return a._isUTC
            ? ((t = a.clone()),
              (s =
                  (D(e) || u(e) ? e.valueOf() : Ha(e).valueOf()) - t.valueOf()),
              t._d.setTime(t._d.valueOf() + s),
              l.updateOffset(t, !1),
              t)
            : Ha(e).local();
    }
    function Na(e) {
        return 15 * -Math.round(e._d.getTimezoneOffset() / 15);
    }
    function Ra() {
        return !!this.isValid() && this._isUTC && 0 === this._offset;
    }
    l.updateOffset = function () {};
    var Ca = /^(\-|\+)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)(\.\d*)?)?$/,
        Ia =
            /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;
    function Ua(e, a) {
        var t,
            s,
            n,
            d = e,
            r = null;
        return (
            Wa(e)
                ? (d = { ms: e._milliseconds, d: e._days, M: e._months })
                : m(e)
                ? ((d = {}), a ? (d[a] = e) : (d.milliseconds = e))
                : (r = Ca.exec(e))
                ? ((t = '-' === r[1] ? -1 : 1),
                  (d = {
                      y: 0,
                      d: g(r[ce]) * t,
                      h: g(r[Ye]) * t,
                      m: g(r[ye]) * t,
                      s: g(r[fe]) * t,
                      ms: g(Aa(1e3 * r[ke])) * t,
                  }))
                : (r = Ia.exec(e))
                ? ((t = '-' === r[1] ? -1 : 1),
                  (d = {
                      y: Ga(r[2], t),
                      M: Ga(r[3], t),
                      w: Ga(r[4], t),
                      d: Ga(r[5], t),
                      h: Ga(r[6], t),
                      m: Ga(r[7], t),
                      s: Ga(r[8], t),
                  }))
                : null == d
                ? (d = {})
                : 'object' == typeof d &&
                  ('from' in d || 'to' in d) &&
                  ((n = (function (e, a) {
                      var t;
                      if (!e.isValid() || !a.isValid())
                          return { milliseconds: 0, months: 0 };
                      (a = Ja(a, e)),
                          e.isBefore(a)
                              ? (t = Va(e, a))
                              : (((t = Va(a, e)).milliseconds =
                                    -t.milliseconds),
                                (t.months = -t.months));
                      return t;
                  })(Ha(d.from), Ha(d.to))),
                  ((d = {}).ms = n.milliseconds),
                  (d.M = n.months)),
            (s = new Pa(d)),
            Wa(e) && h(e, '_locale') && (s._locale = e._locale),
            s
        );
    }
    function Ga(e, a) {
        var t = e && parseFloat(e.replace(',', '.'));
        return (isNaN(t) ? 0 : t) * a;
    }
    function Va(e, a) {
        var t = {};
        return (
            (t.months = a.month() - e.month() + 12 * (a.year() - e.year())),
            e.clone().add(t.months, 'M').isAfter(a) && --t.months,
            (t.milliseconds = +a - +e.clone().add(t.months, 'M')),
            t
        );
    }
    function Ka(s, n) {
        return function (e, a) {
            var t;
            return (
                null === a ||
                    isNaN(+a) ||
                    (S(
                        n,
                        'moment().' +
                            n +
                            '(period, number) is deprecated. Please use moment().' +
                            n +
                            '(number, period). See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info.'
                    ),
                    (t = e),
                    (e = a),
                    (a = t)),
                Za(this, Ua((e = 'string' == typeof e ? +e : e), a), s),
                this
            );
        };
    }
    function Za(e, a, t, s) {
        var n = a._milliseconds,
            d = Aa(a._days),
            r = Aa(a._months);
        e.isValid() &&
            ((s = null == s || s),
            r && We(e, He(e, 'Month') + r * t),
            d && be(e, 'Date', He(e, 'Date') + d * t),
            n && e._d.setTime(e._d.valueOf() + n * t),
            s && l.updateOffset(e, d || r));
    }
    (Ua.fn = Pa.prototype),
        (Ua.invalid = function () {
            return Ua(NaN);
        });
    var $a = Ka(1, 'add'),
        Ba = Ka(-1, 'subtract');
    function qa(e, a) {
        var t = 12 * (a.year() - e.year()) + (a.month() - e.month()),
            s = e.clone().add(t, 'months');
        return (
            -(
                t +
                (a - s < 0
                    ? (a - s) / (s - e.clone().add(t - 1, 'months'))
                    : (a - s) / (e.clone().add(t + 1, 'months') - s))
            ) || 0
        );
    }
    function Qa(e) {
        var a;
        return void 0 === e
            ? this._locale._abbr
            : (null != (a = ma(e)) && (this._locale = a), this);
    }
    (l.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ'),
        (l.defaultFormatUtc = 'YYYY-MM-DDTHH:mm:ss[Z]');
    var Xa = t(
        'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
        function (e) {
            return void 0 === e ? this.localeData() : this.locale(e);
        }
    );
    function et() {
        return this._locale;
    }
    var at = 126227808e5;
    function tt(e, a) {
        return ((e % a) + a) % a;
    }
    function st(e, a, t) {
        return e < 100 && 0 <= e
            ? new Date(e + 400, a, t) - at
            : new Date(e, a, t).valueOf();
    }
    function nt(e, a, t) {
        return e < 100 && 0 <= e
            ? Date.UTC(e + 400, a, t) - at
            : Date.UTC(e, a, t);
    }
    function dt(e, a) {
        C(0, [e, e.length], 0, a);
    }
    function rt(e, a, t, s, n) {
        var d;
        return null == e
            ? Ce(this, s, n).year
            : ((d = Ie(e, s, n)) < a && (a = d),
              function (e, a, t, s, n) {
                  var d = Re(e, a, t, s, n),
                      r = Je(d.year, 0, d.dayOfYear);
                  return (
                      this.year(r.getUTCFullYear()),
                      this.month(r.getUTCMonth()),
                      this.date(r.getUTCDate()),
                      this
                  );
              }.call(this, e, a, t, s, n));
    }
    C(0, ['gg', 2], 0, function () {
        return this.weekYear() % 100;
    }),
        C(0, ['GG', 2], 0, function () {
            return this.isoWeekYear() % 100;
        }),
        dt('gggg', 'weekYear'),
        dt('ggggg', 'weekYear'),
        dt('GGGG', 'isoWeekYear'),
        dt('GGGGG', 'isoWeekYear'),
        O('weekYear', 'gg'),
        O('isoWeekYear', 'GG'),
        E('weekYear', 1),
        E('isoWeekYear', 1),
        ie('G', se),
        ie('g', se),
        ie('GG', B, V),
        ie('gg', B, V),
        ie('GGGG', ee, Z),
        ie('gggg', ee, Z),
        ie('GGGGG', ae, $),
        ie('ggggg', ae, $),
        Me(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (e, a, t, s) {
            a[s.substr(0, 2)] = g(e);
        }),
        Me(['gg', 'GG'], function (e, a, t, s) {
            a[s] = l.parseTwoDigitYear(e);
        }),
        C('Q', 0, 'Qo', 'quarter'),
        O('quarter', 'Q'),
        E('quarter', 7),
        ie('Q', G),
        le('Q', function (e, a) {
            a[Le] = 3 * (g(e) - 1);
        }),
        C('D', ['DD', 2], 'Do', 'date'),
        O('date', 'D'),
        E('date', 9),
        ie('D', B),
        ie('DD', B, V),
        ie('Do', function (e, a) {
            return e
                ? a._dayOfMonthOrdinalParse || a._ordinalParse
                : a._dayOfMonthOrdinalParseLenient;
        }),
        le(['D', 'DD'], ce),
        le('Do', function (e, a) {
            a[ce] = g(e.match(B)[0]);
        });
    var _t = Se('Date', !0);
    C('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear'),
        O('dayOfYear', 'DDD'),
        E('dayOfYear', 4),
        ie('DDD', X),
        ie('DDDD', K),
        le(['DDD', 'DDDD'], function (e, a, t) {
            t._dayOfYear = g(e);
        }),
        C('m', ['mm', 2], 0, 'minute'),
        O('minute', 'm'),
        E('minute', 14),
        ie('m', B),
        ie('mm', B, V),
        le(['m', 'mm'], ye);
    var it = Se('Minutes', !1);
    C('s', ['ss', 2], 0, 'second'),
        O('second', 's'),
        E('second', 15),
        ie('s', B),
        ie('ss', B, V),
        le(['s', 'ss'], fe);
    var ot,
        mt = Se('Seconds', !1);
    for (
        C('S', 0, 0, function () {
            return ~~(this.millisecond() / 100);
        }),
            C(0, ['SS', 2], 0, function () {
                return ~~(this.millisecond() / 10);
            }),
            C(0, ['SSS', 3], 0, 'millisecond'),
            C(0, ['SSSS', 4], 0, function () {
                return 10 * this.millisecond();
            }),
            C(0, ['SSSSS', 5], 0, function () {
                return 100 * this.millisecond();
            }),
            C(0, ['SSSSSS', 6], 0, function () {
                return 1e3 * this.millisecond();
            }),
            C(0, ['SSSSSSS', 7], 0, function () {
                return 1e4 * this.millisecond();
            }),
            C(0, ['SSSSSSSS', 8], 0, function () {
                return 1e5 * this.millisecond();
            }),
            C(0, ['SSSSSSSSS', 9], 0, function () {
                return 1e6 * this.millisecond();
            }),
            O('millisecond', 'ms'),
            E('millisecond', 16),
            ie('S', X, G),
            ie('SS', X, V),
            ie('SSS', X, K),
            ot = 'SSSS';
        ot.length <= 9;
        ot += 'S'
    )
        ie(ot, te);
    function ut(e, a) {
        a[ke] = g(1e3 * ('0.' + e));
    }
    for (ot = 'S'; ot.length <= 9; ot += 'S') le(ot, ut);
    var lt = Se('Milliseconds', !1);
    C('z', 0, 0, 'zoneAbbr'), C('zz', 0, 0, 'zoneName');
    var Mt = p.prototype;
    function ht(e) {
        return e;
    }
    (Mt.add = $a),
        (Mt.calendar = function (e, a) {
            var t = e || Ha(),
                s = Ja(t, this).startOf('day'),
                n = l.calendarFormat(this, s) || 'sameElse',
                d = a && (H(a[n]) ? a[n].call(this, t) : a[n]);
            return this.format(d || this.localeData().calendar(n, this, Ha(t)));
        }),
        (Mt.clone = function () {
            return new p(this);
        }),
        (Mt.diff = function (e, a, t) {
            var s, n, d;
            if (!this.isValid()) return NaN;
            if (!(s = Ja(e, this)).isValid()) return NaN;
            switch (
                ((n = 6e4 * (s.utcOffset() - this.utcOffset())), (a = P(a)))
            ) {
                case 'year':
                    d = qa(this, s) / 12;
                    break;
                case 'month':
                    d = qa(this, s);
                    break;
                case 'quarter':
                    d = qa(this, s) / 3;
                    break;
                case 'second':
                    d = (this - s) / 1e3;
                    break;
                case 'minute':
                    d = (this - s) / 6e4;
                    break;
                case 'hour':
                    d = (this - s) / 36e5;
                    break;
                case 'day':
                    d = (this - s - n) / 864e5;
                    break;
                case 'week':
                    d = (this - s - n) / 6048e5;
                    break;
                default:
                    d = this - s;
            }
            return t ? d : T(d);
        }),
        (Mt.endOf = function (e) {
            var a;
            if (void 0 === (e = P(e)) || 'millisecond' === e || !this.isValid())
                return this;
            var t = this._isUTC ? nt : st;
            switch (e) {
                case 'year':
                    a = t(this.year() + 1, 0, 1) - 1;
                    break;
                case 'quarter':
                    a =
                        t(
                            this.year(),
                            this.month() - (this.month() % 3) + 3,
                            1
                        ) - 1;
                    break;
                case 'month':
                    a = t(this.year(), this.month() + 1, 1) - 1;
                    break;
                case 'week':
                    a =
                        t(
                            this.year(),
                            this.month(),
                            this.date() - this.weekday() + 7
                        ) - 1;
                    break;
                case 'isoWeek':
                    a =
                        t(
                            this.year(),
                            this.month(),
                            this.date() - (this.isoWeekday() - 1) + 7
                        ) - 1;
                    break;
                case 'day':
                case 'date':
                    a = t(this.year(), this.month(), this.date() + 1) - 1;
                    break;
                case 'hour':
                    (a = this._d.valueOf()),
                        (a +=
                            36e5 -
                            tt(
                                a + (this._isUTC ? 0 : 6e4 * this.utcOffset()),
                                36e5
                            ) -
                            1);
                    break;
                case 'minute':
                    (a = this._d.valueOf()), (a += 6e4 - tt(a, 6e4) - 1);
                    break;
                case 'second':
                    (a = this._d.valueOf()), (a += 1e3 - tt(a, 1e3) - 1);
                    break;
            }
            return this._d.setTime(a), l.updateOffset(this, !0), this;
        }),
        (Mt.format = function (e) {
            e || (e = this.isUtc() ? l.defaultFormatUtc : l.defaultFormat);
            var a = I(this, e);
            return this.localeData().postformat(a);
        }),
        (Mt.from = function (e, a) {
            return this.isValid() && ((D(e) && e.isValid()) || Ha(e).isValid())
                ? Ua({ to: this, from: e }).locale(this.locale()).humanize(!a)
                : this.localeData().invalidDate();
        }),
        (Mt.fromNow = function (e) {
            return this.from(Ha(), e);
        }),
        (Mt.to = function (e, a) {
            return this.isValid() && ((D(e) && e.isValid()) || Ha(e).isValid())
                ? Ua({ from: this, to: e }).locale(this.locale()).humanize(!a)
                : this.localeData().invalidDate();
        }),
        (Mt.toNow = function (e) {
            return this.to(Ha(), e);
        }),
        (Mt.get = function (e) {
            return H(this[(e = P(e))]) ? this[e]() : this;
        }),
        (Mt.invalidAt = function () {
            return Y(this).overflow;
        }),
        (Mt.isAfter = function (e, a) {
            var t = D(e) ? e : Ha(e);
            return (
                !(!this.isValid() || !t.isValid()) &&
                ('millisecond' === (a = P(a) || 'millisecond')
                    ? this.valueOf() > t.valueOf()
                    : t.valueOf() < this.clone().startOf(a).valueOf())
            );
        }),
        (Mt.isBefore = function (e, a) {
            var t = D(e) ? e : Ha(e);
            return (
                !(!this.isValid() || !t.isValid()) &&
                ('millisecond' === (a = P(a) || 'millisecond')
                    ? this.valueOf() < t.valueOf()
                    : this.clone().endOf(a).valueOf() < t.valueOf())
            );
        }),
        (Mt.isBetween = function (e, a, t, s) {
            var n = D(e) ? e : Ha(e),
                d = D(a) ? a : Ha(a);
            return (
                !!(this.isValid() && n.isValid() && d.isValid()) &&
                ('(' === (s = s || '()')[0]
                    ? this.isAfter(n, t)
                    : !this.isBefore(n, t)) &&
                (')' === s[1] ? this.isBefore(d, t) : !this.isAfter(d, t))
            );
        }),
        (Mt.isSame = function (e, a) {
            var t,
                s = D(e) ? e : Ha(e);
            return (
                !(!this.isValid() || !s.isValid()) &&
                ('millisecond' === (a = P(a) || 'millisecond')
                    ? this.valueOf() === s.valueOf()
                    : ((t = s.valueOf()),
                      this.clone().startOf(a).valueOf() <= t &&
                          t <= this.clone().endOf(a).valueOf()))
            );
        }),
        (Mt.isSameOrAfter = function (e, a) {
            return this.isSame(e, a) || this.isAfter(e, a);
        }),
        (Mt.isSameOrBefore = function (e, a) {
            return this.isSame(e, a) || this.isBefore(e, a);
        }),
        (Mt.isValid = function () {
            return y(this);
        }),
        (Mt.lang = Xa),
        (Mt.locale = Qa),
        (Mt.localeData = et),
        (Mt.max = ja),
        (Mt.min = ba),
        (Mt.parsingFlags = function () {
            return L({}, Y(this));
        }),
        (Mt.set = function (e, a) {
            if ('object' == typeof e)
                for (
                    var t = (function (e) {
                            var a = [];
                            for (var t in e)
                                a.push({ unit: t, priority: A[t] });
                            return (
                                a.sort(function (e, a) {
                                    return e.priority - a.priority;
                                }),
                                a
                            );
                        })((e = W(e))),
                        s = 0;
                    s < t.length;
                    s++
                )
                    this[t[s].unit](e[t[s].unit]);
            else if (H(this[(e = P(e))])) return this[e](a);
            return this;
        }),
        (Mt.startOf = function (e) {
            var a;
            if (void 0 === (e = P(e)) || 'millisecond' === e || !this.isValid())
                return this;
            var t = this._isUTC ? nt : st;
            switch (e) {
                case 'year':
                    a = t(this.year(), 0, 1);
                    break;
                case 'quarter':
                    a = t(this.year(), this.month() - (this.month() % 3), 1);
                    break;
                case 'month':
                    a = t(this.year(), this.month(), 1);
                    break;
                case 'week':
                    a = t(
                        this.year(),
                        this.month(),
                        this.date() - this.weekday()
                    );
                    break;
                case 'isoWeek':
                    a = t(
                        this.year(),
                        this.month(),
                        this.date() - (this.isoWeekday() - 1)
                    );
                    break;
                case 'day':
                case 'date':
                    a = t(this.year(), this.month(), this.date());
                    break;
                case 'hour':
                    (a = this._d.valueOf()),
                        (a -= tt(
                            a + (this._isUTC ? 0 : 6e4 * this.utcOffset()),
                            36e5
                        ));
                    break;
                case 'minute':
                    (a = this._d.valueOf()), (a -= tt(a, 6e4));
                    break;
                case 'second':
                    (a = this._d.valueOf()), (a -= tt(a, 1e3));
                    break;
            }
            return this._d.setTime(a), l.updateOffset(this, !0), this;
        }),
        (Mt.subtract = Ba),
        (Mt.toArray = function () {
            var e = this;
            return [
                e.year(),
                e.month(),
                e.date(),
                e.hour(),
                e.minute(),
                e.second(),
                e.millisecond(),
            ];
        }),
        (Mt.toObject = function () {
            var e = this;
            return {
                years: e.year(),
                months: e.month(),
                date: e.date(),
                hours: e.hours(),
                minutes: e.minutes(),
                seconds: e.seconds(),
                milliseconds: e.milliseconds(),
            };
        }),
        (Mt.toDate = function () {
            return new Date(this.valueOf());
        }),
        (Mt.toISOString = function (e) {
            if (!this.isValid()) return null;
            var a = !0 !== e,
                t = a ? this.clone().utc() : this;
            return t.year() < 0 || 9999 < t.year()
                ? I(
                      t,
                      a
                          ? 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]'
                          : 'YYYYYY-MM-DD[T]HH:mm:ss.SSSZ'
                  )
                : H(Date.prototype.toISOString)
                ? a
                    ? this.toDate().toISOString()
                    : new Date(this.valueOf() + 60 * this.utcOffset() * 1e3)
                          .toISOString()
                          .replace('Z', I(t, 'Z'))
                : I(
                      t,
                      a
                          ? 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]'
                          : 'YYYY-MM-DD[T]HH:mm:ss.SSSZ'
                  );
        }),
        (Mt.inspect = function () {
            if (!this.isValid()) return 'moment.invalid(/* ' + this._i + ' */)';
            var e = 'moment',
                a = '';
            this.isLocal() ||
                ((e =
                    0 === this.utcOffset() ? 'moment.utc' : 'moment.parseZone'),
                (a = 'Z'));
            var t = '[' + e + '("]',
                s = 0 <= this.year() && this.year() <= 9999 ? 'YYYY' : 'YYYYYY',
                n = a + '[")]';
            return this.format(t + s + '-MM-DD[T]HH:mm:ss.SSS' + n);
        }),
        (Mt.toJSON = function () {
            return this.isValid() ? this.toISOString() : null;
        }),
        (Mt.toString = function () {
            return this.clone()
                .locale('en')
                .format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
        }),
        (Mt.unix = function () {
            return Math.floor(this.valueOf() / 1e3);
        }),
        (Mt.valueOf = function () {
            return this._d.valueOf() - 6e4 * (this._offset || 0);
        }),
        (Mt.creationData = function () {
            return {
                input: this._i,
                format: this._f,
                locale: this._locale,
                isUTC: this._isUTC,
                strict: this._strict,
            };
        }),
        (Mt.year = ve),
        (Mt.isLeapYear = function () {
            return ge(this.year());
        }),
        (Mt.weekYear = function (e) {
            return rt.call(
                this,
                e,
                this.week(),
                this.weekday(),
                this.localeData()._week.dow,
                this.localeData()._week.doy
            );
        }),
        (Mt.isoWeekYear = function (e) {
            return rt.call(this, e, this.isoWeek(), this.isoWeekday(), 1, 4);
        }),
        (Mt.quarter = Mt.quarters =
            function (e) {
                return null == e
                    ? Math.ceil((this.month() + 1) / 3)
                    : this.month(3 * (e - 1) + (this.month() % 3));
            }),
        (Mt.month = Ae),
        (Mt.daysInMonth = function () {
            return je(this.year(), this.month());
        }),
        (Mt.week = Mt.weeks =
            function (e) {
                var a = this.localeData().week(this);
                return null == e ? a : this.add(7 * (e - a), 'd');
            }),
        (Mt.isoWeek = Mt.isoWeeks =
            function (e) {
                var a = Ce(this, 1, 4).week;
                return null == e ? a : this.add(7 * (e - a), 'd');
            }),
        (Mt.weeksInYear = function () {
            var e = this.localeData()._week;
            return Ie(this.year(), e.dow, e.doy);
        }),
        (Mt.isoWeeksInYear = function () {
            return Ie(this.year(), 1, 4);
        }),
        (Mt.date = _t),
        (Mt.day = Mt.days =
            function (e) {
                if (!this.isValid()) return null != e ? this : NaN;
                var a,
                    t,
                    s = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
                return null != e
                    ? ((a = e),
                      (t = this.localeData()),
                      (e =
                          'string' != typeof a
                              ? a
                              : isNaN(a)
                              ? 'number' == typeof (a = t.weekdaysParse(a))
                                  ? a
                                  : null
                              : parseInt(a, 10)),
                      this.add(e - s, 'd'))
                    : s;
            }),
        (Mt.weekday = function (e) {
            if (!this.isValid()) return null != e ? this : NaN;
            var a = (this.day() + 7 - this.localeData()._week.dow) % 7;
            return null == e ? a : this.add(e - a, 'd');
        }),
        (Mt.isoWeekday = function (e) {
            if (!this.isValid()) return null != e ? this : NaN;
            if (null == e) return this.day() || 7;
            var a,
                t,
                s =
                    ((a = e),
                    (t = this.localeData()),
                    'string' == typeof a
                        ? t.weekdaysParse(a) % 7 || 7
                        : isNaN(a)
                        ? null
                        : a);
            return this.day(this.day() % 7 ? s : s - 7);
        }),
        (Mt.dayOfYear = function (e) {
            var a =
                Math.round(
                    (this.clone().startOf('day') -
                        this.clone().startOf('year')) /
                        864e5
                ) + 1;
            return null == e ? a : this.add(e - a, 'd');
        }),
        (Mt.hour = Mt.hours = ta),
        (Mt.minute = Mt.minutes = it),
        (Mt.second = Mt.seconds = mt),
        (Mt.millisecond = Mt.milliseconds = lt),
        (Mt.utcOffset = function (e, a, t) {
            var s,
                n = this._offset || 0;
            if (!this.isValid()) return null != e ? this : NaN;
            if (null == e) return this._isUTC ? n : Na(this);
            if ('string' == typeof e) {
                if (null === (e = za(de, e))) return this;
            } else Math.abs(e) < 16 && !t && (e *= 60);
            return (
                !this._isUTC && a && (s = Na(this)),
                (this._offset = e),
                (this._isUTC = !0),
                null != s && this.add(s, 'm'),
                n !== e &&
                    (!a || this._changeInProgress
                        ? Za(this, Ua(e - n, 'm'), 1, !1)
                        : this._changeInProgress ||
                          ((this._changeInProgress = !0),
                          l.updateOffset(this, !0),
                          (this._changeInProgress = null))),
                this
            );
        }),
        (Mt.utc = function (e) {
            return this.utcOffset(0, e);
        }),
        (Mt.local = function (e) {
            return (
                this._isUTC &&
                    (this.utcOffset(0, e),
                    (this._isUTC = !1),
                    e && this.subtract(Na(this), 'm')),
                this
            );
        }),
        (Mt.parseZone = function () {
            if (null != this._tzm) this.utcOffset(this._tzm, !1, !0);
            else if ('string' == typeof this._i) {
                var e = za(ne, this._i);
                null != e ? this.utcOffset(e) : this.utcOffset(0, !0);
            }
            return this;
        }),
        (Mt.hasAlignedHourOffset = function (e) {
            return (
                !!this.isValid() &&
                ((e = e ? Ha(e).utcOffset() : 0),
                (this.utcOffset() - e) % 60 == 0)
            );
        }),
        (Mt.isDST = function () {
            return (
                this.utcOffset() > this.clone().month(0).utcOffset() ||
                this.utcOffset() > this.clone().month(5).utcOffset()
            );
        }),
        (Mt.isLocal = function () {
            return !!this.isValid() && !this._isUTC;
        }),
        (Mt.isUtcOffset = function () {
            return !!this.isValid() && this._isUTC;
        }),
        (Mt.isUtc = Ra),
        (Mt.isUTC = Ra),
        (Mt.zoneAbbr = function () {
            return this._isUTC ? 'UTC' : '';
        }),
        (Mt.zoneName = function () {
            return this._isUTC ? 'Coordinated Universal Time' : '';
        }),
        (Mt.dates = t('dates accessor is deprecated. Use date instead.', _t)),
        (Mt.months = t('months accessor is deprecated. Use month instead', Ae)),
        (Mt.years = t('years accessor is deprecated. Use year instead', ve)),
        (Mt.zone = t(
            'moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/',
            function (e, a) {
                return null != e
                    ? ('string' != typeof e && (e = -e),
                      this.utcOffset(e, a),
                      this)
                    : -this.utcOffset();
            }
        )),
        (Mt.isDSTShifted = t(
            'isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information',
            function () {
                if (!o(this._isDSTShifted)) return this._isDSTShifted;
                var e = {};
                if ((k(e, this), (e = va(e))._a)) {
                    var a = e._isUTC ? c(e._a) : Ha(e._a);
                    this._isDSTShifted =
                        this.isValid() && 0 < r(e._a, a.toArray());
                } else this._isDSTShifted = !1;
                return this._isDSTShifted;
            }
        ));
    var Lt = j.prototype;
    function ct(e, a, t, s) {
        var n = ma(),
            d = c().set(s, a);
        return n[t](d, e);
    }
    function Yt(e, a, t) {
        if ((m(e) && ((a = e), (e = void 0)), (e = e || ''), null != a))
            return ct(e, a, t, 'month');
        var s,
            n = [];
        for (s = 0; s < 12; s++) n[s] = ct(e, s, t, 'month');
        return n;
    }
    function yt(e, a, t, s) {
        a =
            ('boolean' == typeof e
                ? m(a) && ((t = a), (a = void 0))
                : ((a = e), (e = !1), m((t = a)) && ((t = a), (a = void 0))),
            a || '');
        var n,
            d = ma(),
            r = e ? d._week.dow : 0;
        if (null != t) return ct(a, (t + r) % 7, s, 'day');
        var _ = [];
        for (n = 0; n < 7; n++) _[n] = ct(a, (n + r) % 7, s, 'day');
        return _;
    }
    (Lt.calendar = function (e, a, t) {
        var s = this._calendar[e] || this._calendar.sameElse;
        return H(s) ? s.call(a, t) : s;
    }),
        (Lt.longDateFormat = function (e) {
            var a = this._longDateFormat[e],
                t = this._longDateFormat[e.toUpperCase()];
            return a || !t
                ? a
                : ((this._longDateFormat[e] = t.replace(
                      /MMMM|MM|DD|dddd/g,
                      function (e) {
                          return e.slice(1);
                      }
                  )),
                  this._longDateFormat[e]);
        }),
        (Lt.invalidDate = function () {
            return this._invalidDate;
        }),
        (Lt.ordinal = function (e) {
            return this._ordinal.replace('%d', e);
        }),
        (Lt.preparse = ht),
        (Lt.postformat = ht),
        (Lt.relativeTime = function (e, a, t, s) {
            var n = this._relativeTime[t];
            return H(n) ? n(e, a, t, s) : n.replace(/%d/i, e);
        }),
        (Lt.pastFuture = function (e, a) {
            var t = this._relativeTime[0 < e ? 'future' : 'past'];
            return H(t) ? t(a) : t.replace(/%s/i, a);
        }),
        (Lt.set = function (e) {
            var a, t;
            for (t in e) H((a = e[t])) ? (this[t] = a) : (this['_' + t] = a);
            (this._config = e),
                (this._dayOfMonthOrdinalParseLenient = new RegExp(
                    (this._dayOfMonthOrdinalParse.source ||
                        this._ordinalParse.source) +
                        '|' +
                        /\d{1,2}/.source
                ));
        }),
        (Lt.months = function (e, a) {
            return e
                ? _(this._months)
                    ? this._months[e.month()]
                    : this._months[
                          (this._months.isFormat || xe).test(a)
                              ? 'format'
                              : 'standalone'
                      ][e.month()]
                : _(this._months)
                ? this._months
                : this._months.standalone;
        }),
        (Lt.monthsShort = function (e, a) {
            return e
                ? _(this._monthsShort)
                    ? this._monthsShort[e.month()]
                    : this._monthsShort[xe.test(a) ? 'format' : 'standalone'][
                          e.month()
                      ]
                : _(this._monthsShort)
                ? this._monthsShort
                : this._monthsShort.standalone;
        }),
        (Lt.monthsParse = function (e, a, t) {
            var s, n, d;
            if (this._monthsParseExact)
                return function (e, a, t) {
                    var s,
                        n,
                        d,
                        r = e.toLocaleLowerCase();
                    if (!this._monthsParse)
                        for (
                            this._monthsParse = [],
                                this._longMonthsParse = [],
                                this._shortMonthsParse = [],
                                s = 0;
                            s < 12;
                            ++s
                        )
                            (d = c([2e3, s])),
                                (this._shortMonthsParse[s] = this.monthsShort(
                                    d,
                                    ''
                                ).toLocaleLowerCase()),
                                (this._longMonthsParse[s] = this.months(
                                    d,
                                    ''
                                ).toLocaleLowerCase());
                    return t
                        ? 'MMM' === a
                            ? -1 !== (n = we.call(this._shortMonthsParse, r))
                                ? n
                                : null
                            : -1 !== (n = we.call(this._longMonthsParse, r))
                            ? n
                            : null
                        : 'MMM' === a
                        ? -1 !== (n = we.call(this._shortMonthsParse, r))
                            ? n
                            : -1 !== (n = we.call(this._longMonthsParse, r))
                            ? n
                            : null
                        : -1 !== (n = we.call(this._longMonthsParse, r))
                        ? n
                        : -1 !== (n = we.call(this._shortMonthsParse, r))
                        ? n
                        : null;
                }.call(this, e, a, t);
            for (
                this._monthsParse ||
                    ((this._monthsParse = []),
                    (this._longMonthsParse = []),
                    (this._shortMonthsParse = [])),
                    s = 0;
                s < 12;
                s++
            ) {
                if (
                    ((n = c([2e3, s])),
                    t &&
                        !this._longMonthsParse[s] &&
                        ((this._longMonthsParse[s] = new RegExp(
                            '^' + this.months(n, '').replace('.', '') + '$',
                            'i'
                        )),
                        (this._shortMonthsParse[s] = new RegExp(
                            '^' +
                                this.monthsShort(n, '').replace('.', '') +
                                '$',
                            'i'
                        ))),
                    t ||
                        this._monthsParse[s] ||
                        ((d =
                            '^' +
                            this.months(n, '') +
                            '|^' +
                            this.monthsShort(n, '')),
                        (this._monthsParse[s] = new RegExp(
                            d.replace('.', ''),
                            'i'
                        ))),
                    t && 'MMMM' === a && this._longMonthsParse[s].test(e))
                )
                    return s;
                if (t && 'MMM' === a && this._shortMonthsParse[s].test(e))
                    return s;
                if (!t && this._monthsParse[s].test(e)) return s;
            }
        }),
        (Lt.monthsRegex = function (e) {
            return this._monthsParseExact
                ? (h(this, '_monthsRegex') || ze.call(this),
                  e ? this._monthsStrictRegex : this._monthsRegex)
                : (h(this, '_monthsRegex') || (this._monthsRegex = Fe),
                  this._monthsStrictRegex && e
                      ? this._monthsStrictRegex
                      : this._monthsRegex);
        }),
        (Lt.monthsShortRegex = function (e) {
            return this._monthsParseExact
                ? (h(this, '_monthsRegex') || ze.call(this),
                  e ? this._monthsShortStrictRegex : this._monthsShortRegex)
                : (h(this, '_monthsShortRegex') ||
                      (this._monthsShortRegex = Ee),
                  this._monthsShortStrictRegex && e
                      ? this._monthsShortStrictRegex
                      : this._monthsShortRegex);
        }),
        (Lt.week = function (e) {
            return Ce(e, this._week.dow, this._week.doy).week;
        }),
        (Lt.firstDayOfYear = function () {
            return this._week.doy;
        }),
        (Lt.firstDayOfWeek = function () {
            return this._week.dow;
        }),
        (Lt.weekdays = function (e, a) {
            var t = _(this._weekdays)
                ? this._weekdays
                : this._weekdays[
                      e && !0 !== e && this._weekdays.isFormat.test(a)
                          ? 'format'
                          : 'standalone'
                  ];
            return !0 === e ? Ue(t, this._week.dow) : e ? t[e.day()] : t;
        }),
        (Lt.weekdaysMin = function (e) {
            return !0 === e
                ? Ue(this._weekdaysMin, this._week.dow)
                : e
                ? this._weekdaysMin[e.day()]
                : this._weekdaysMin;
        }),
        (Lt.weekdaysShort = function (e) {
            return !0 === e
                ? Ue(this._weekdaysShort, this._week.dow)
                : e
                ? this._weekdaysShort[e.day()]
                : this._weekdaysShort;
        }),
        (Lt.weekdaysParse = function (e, a, t) {
            var s, n, d;
            if (this._weekdaysParseExact)
                return function (e, a, t) {
                    var s,
                        n,
                        d,
                        r = e.toLocaleLowerCase();
                    if (!this._weekdaysParse)
                        for (
                            this._weekdaysParse = [],
                                this._shortWeekdaysParse = [],
                                this._minWeekdaysParse = [],
                                s = 0;
                            s < 7;
                            ++s
                        )
                            (d = c([2e3, 1]).day(s)),
                                (this._minWeekdaysParse[s] = this.weekdaysMin(
                                    d,
                                    ''
                                ).toLocaleLowerCase()),
                                (this._shortWeekdaysParse[s] =
                                    this.weekdaysShort(
                                        d,
                                        ''
                                    ).toLocaleLowerCase()),
                                (this._weekdaysParse[s] = this.weekdays(
                                    d,
                                    ''
                                ).toLocaleLowerCase());
                    return t
                        ? 'dddd' === a
                            ? -1 !== (n = we.call(this._weekdaysParse, r))
                                ? n
                                : null
                            : 'ddd' === a
                            ? -1 !== (n = we.call(this._shortWeekdaysParse, r))
                                ? n
                                : null
                            : -1 !== (n = we.call(this._minWeekdaysParse, r))
                            ? n
                            : null
                        : 'dddd' === a
                        ? -1 !== (n = we.call(this._weekdaysParse, r))
                            ? n
                            : -1 !== (n = we.call(this._shortWeekdaysParse, r))
                            ? n
                            : -1 !== (n = we.call(this._minWeekdaysParse, r))
                            ? n
                            : null
                        : 'ddd' === a
                        ? -1 !== (n = we.call(this._shortWeekdaysParse, r))
                            ? n
                            : -1 !== (n = we.call(this._weekdaysParse, r))
                            ? n
                            : -1 !== (n = we.call(this._minWeekdaysParse, r))
                            ? n
                            : null
                        : -1 !== (n = we.call(this._minWeekdaysParse, r))
                        ? n
                        : -1 !== (n = we.call(this._weekdaysParse, r))
                        ? n
                        : -1 !== (n = we.call(this._shortWeekdaysParse, r))
                        ? n
                        : null;
                }.call(this, e, a, t);
            for (
                this._weekdaysParse ||
                    ((this._weekdaysParse = []),
                    (this._minWeekdaysParse = []),
                    (this._shortWeekdaysParse = []),
                    (this._fullWeekdaysParse = [])),
                    s = 0;
                s < 7;
                s++
            ) {
                if (
                    ((n = c([2e3, 1]).day(s)),
                    t &&
                        !this._fullWeekdaysParse[s] &&
                        ((this._fullWeekdaysParse[s] = new RegExp(
                            '^' +
                                this.weekdays(n, '').replace('.', '\\.?') +
                                '$',
                            'i'
                        )),
                        (this._shortWeekdaysParse[s] = new RegExp(
                            '^' +
                                this.weekdaysShort(n, '').replace('.', '\\.?') +
                                '$',
                            'i'
                        )),
                        (this._minWeekdaysParse[s] = new RegExp(
                            '^' +
                                this.weekdaysMin(n, '').replace('.', '\\.?') +
                                '$',
                            'i'
                        ))),
                    this._weekdaysParse[s] ||
                        ((d =
                            '^' +
                            this.weekdays(n, '') +
                            '|^' +
                            this.weekdaysShort(n, '') +
                            '|^' +
                            this.weekdaysMin(n, '')),
                        (this._weekdaysParse[s] = new RegExp(
                            d.replace('.', ''),
                            'i'
                        ))),
                    t && 'dddd' === a && this._fullWeekdaysParse[s].test(e))
                )
                    return s;
                if (t && 'ddd' === a && this._shortWeekdaysParse[s].test(e))
                    return s;
                if (t && 'dd' === a && this._minWeekdaysParse[s].test(e))
                    return s;
                if (!t && this._weekdaysParse[s].test(e)) return s;
            }
        }),
        (Lt.weekdaysRegex = function (e) {
            return this._weekdaysParseExact
                ? (h(this, '_weekdaysRegex') || qe.call(this),
                  e ? this._weekdaysStrictRegex : this._weekdaysRegex)
                : (h(this, '_weekdaysRegex') || (this._weekdaysRegex = Ze),
                  this._weekdaysStrictRegex && e
                      ? this._weekdaysStrictRegex
                      : this._weekdaysRegex);
        }),
        (Lt.weekdaysShortRegex = function (e) {
            return this._weekdaysParseExact
                ? (h(this, '_weekdaysRegex') || qe.call(this),
                  e ? this._weekdaysShortStrictRegex : this._weekdaysShortRegex)
                : (h(this, '_weekdaysShortRegex') ||
                      (this._weekdaysShortRegex = $e),
                  this._weekdaysShortStrictRegex && e
                      ? this._weekdaysShortStrictRegex
                      : this._weekdaysShortRegex);
        }),
        (Lt.weekdaysMinRegex = function (e) {
            return this._weekdaysParseExact
                ? (h(this, '_weekdaysRegex') || qe.call(this),
                  e ? this._weekdaysMinStrictRegex : this._weekdaysMinRegex)
                : (h(this, '_weekdaysMinRegex') ||
                      (this._weekdaysMinRegex = Be),
                  this._weekdaysMinStrictRegex && e
                      ? this._weekdaysMinStrictRegex
                      : this._weekdaysMinRegex);
        }),
        (Lt.isPM = function (e) {
            return 'p' === (e + '').toLowerCase().charAt(0);
        }),
        (Lt.meridiem = function (e, a, t) {
            return 11 < e ? (t ? 'pm' : 'PM') : t ? 'am' : 'AM';
        }),
        ia('en', {
            dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/,
            ordinal: function (e) {
                var a = e % 10;
                return (
                    e +
                    (1 === g((e % 100) / 10)
                        ? 'th'
                        : 1 === a
                        ? 'st'
                        : 2 === a
                        ? 'nd'
                        : 3 === a
                        ? 'rd'
                        : 'th')
                );
            },
        }),
        (l.lang = t(
            'moment.lang is deprecated. Use moment.locale instead.',
            ia
        )),
        (l.langData = t(
            'moment.langData is deprecated. Use moment.localeData instead.',
            ma
        ));
    var ft = Math.abs;
    function kt(e, a, t, s) {
        var n = Ua(a, t);
        return (
            (e._milliseconds += s * n._milliseconds),
            (e._days += s * n._days),
            (e._months += s * n._months),
            e._bubble()
        );
    }
    function pt(e) {
        return e < 0 ? Math.floor(e) : Math.ceil(e);
    }
    function Dt(e) {
        return (4800 * e) / 146097;
    }
    function Tt(e) {
        return (146097 * e) / 4800;
    }
    function gt(e) {
        return function () {
            return this.as(e);
        };
    }
    var wt = gt('ms'),
        vt = gt('s'),
        St = gt('m'),
        Ht = gt('h'),
        bt = gt('d'),
        jt = gt('w'),
        xt = gt('M'),
        Ot = gt('Q'),
        Pt = gt('y');
    function Wt(e) {
        return function () {
            return this.isValid() ? this._data[e] : NaN;
        };
    }
    var At = Wt('milliseconds'),
        Et = Wt('seconds'),
        Ft = Wt('minutes'),
        zt = Wt('hours'),
        Jt = Wt('days'),
        Nt = Wt('months'),
        Rt = Wt('years');
    var Ct = Math.round,
        It = { ss: 44, s: 45, m: 45, h: 22, d: 26, M: 11 };
    var Ut = Math.abs;
    function Gt(e) {
        return (0 < e) - (e < 0) || +e;
    }
    function Vt() {
        if (!this.isValid()) return this.localeData().invalidDate();
        var e,
            a,
            t = Ut(this._milliseconds) / 1e3,
            s = Ut(this._days),
            n = Ut(this._months);
        (a = T((e = T(t / 60)) / 60)), (t %= 60), (e %= 60);
        var d = T(n / 12),
            r = (n %= 12),
            _ = s,
            i = a,
            o = e,
            m = t ? t.toFixed(3).replace(/\.?0+$/, '') : '',
            u = this.asSeconds();
        if (!u) return 'P0D';
        var l = u < 0 ? '-' : '',
            M = Gt(this._months) !== Gt(u) ? '-' : '',
            h = Gt(this._days) !== Gt(u) ? '-' : '',
            L = Gt(this._milliseconds) !== Gt(u) ? '-' : '';
        return (
            l +
            'P' +
            (d ? M + d + 'Y' : '') +
            (r ? M + r + 'M' : '') +
            (_ ? h + _ + 'D' : '') +
            (i || o || m ? 'T' : '') +
            (i ? L + i + 'H' : '') +
            (o ? L + o + 'M' : '') +
            (m ? L + m + 'S' : '')
        );
    }
    var Kt = Pa.prototype;
    (Kt.isValid = function () {
        return this._isValid;
    }),
        (Kt.abs = function () {
            var e = this._data;
            return (
                (this._milliseconds = ft(this._milliseconds)),
                (this._days = ft(this._days)),
                (this._months = ft(this._months)),
                (e.milliseconds = ft(e.milliseconds)),
                (e.seconds = ft(e.seconds)),
                (e.minutes = ft(e.minutes)),
                (e.hours = ft(e.hours)),
                (e.months = ft(e.months)),
                (e.years = ft(e.years)),
                this
            );
        }),
        (Kt.add = function (e, a) {
            return kt(this, e, a, 1);
        }),
        (Kt.subtract = function (e, a) {
            return kt(this, e, a, -1);
        }),
        (Kt.as = function (e) {
            if (!this.isValid()) return NaN;
            var a,
                t,
                s = this._milliseconds;
            if ('month' === (e = P(e)) || 'quarter' === e || 'year' === e)
                switch (
                    ((a = this._days + s / 864e5),
                    (t = this._months + Dt(a)),
                    e)
                ) {
                    case 'month':
                        return t;
                    case 'quarter':
                        return t / 3;
                    case 'year':
                        return t / 12;
                }
            else
                switch (((a = this._days + Math.round(Tt(this._months))), e)) {
                    case 'week':
                        return a / 7 + s / 6048e5;
                    case 'day':
                        return a + s / 864e5;
                    case 'hour':
                        return 24 * a + s / 36e5;
                    case 'minute':
                        return 1440 * a + s / 6e4;
                    case 'second':
                        return 86400 * a + s / 1e3;
                    case 'millisecond':
                        return Math.floor(864e5 * a) + s;
                    default:
                        throw new Error('Unknown unit ' + e);
                }
        }),
        (Kt.asMilliseconds = wt),
        (Kt.asSeconds = vt),
        (Kt.asMinutes = St),
        (Kt.asHours = Ht),
        (Kt.asDays = bt),
        (Kt.asWeeks = jt),
        (Kt.asMonths = xt),
        (Kt.asQuarters = Ot),
        (Kt.asYears = Pt),
        (Kt.valueOf = function () {
            return this.isValid()
                ? this._milliseconds +
                      864e5 * this._days +
                      (this._months % 12) * 2592e6 +
                      31536e6 * g(this._months / 12)
                : NaN;
        }),
        (Kt._bubble = function () {
            var e,
                a,
                t,
                s,
                n,
                d = this._milliseconds,
                r = this._days,
                _ = this._months,
                i = this._data;
            return (
                (0 <= d && 0 <= r && 0 <= _) ||
                    (d <= 0 && r <= 0 && _ <= 0) ||
                    ((d += 864e5 * pt(Tt(_) + r)), (_ = r = 0)),
                (i.milliseconds = d % 1e3),
                (e = T(d / 1e3)),
                (i.seconds = e % 60),
                (a = T(e / 60)),
                (i.minutes = a % 60),
                (t = T(a / 60)),
                (i.hours = t % 24),
                (_ += n = T(Dt((r += T(t / 24))))),
                (r -= pt(Tt(n))),
                (s = T(_ / 12)),
                (_ %= 12),
                (i.days = r),
                (i.months = _),
                (i.years = s),
                this
            );
        }),
        (Kt.clone = function () {
            return Ua(this);
        }),
        (Kt.get = function (e) {
            return (e = P(e)), this.isValid() ? this[e + 's']() : NaN;
        }),
        (Kt.milliseconds = At),
        (Kt.seconds = Et),
        (Kt.minutes = Ft),
        (Kt.hours = zt),
        (Kt.days = Jt),
        (Kt.weeks = function () {
            return T(this.days() / 7);
        }),
        (Kt.months = Nt),
        (Kt.years = Rt),
        (Kt.humanize = function (e) {
            if (!this.isValid()) return this.localeData().invalidDate();
            var a,
                t,
                s,
                n,
                d,
                r,
                _,
                i,
                o,
                m,
                u,
                l = this.localeData(),
                M =
                    ((t = !e),
                    (s = l),
                    (n = Ua((a = this)).abs()),
                    (d = Ct(n.as('s'))),
                    (r = Ct(n.as('m'))),
                    (_ = Ct(n.as('h'))),
                    (i = Ct(n.as('d'))),
                    (o = Ct(n.as('M'))),
                    (m = Ct(n.as('y'))),
                    ((u = (d <= It.ss && ['s', d]) ||
                        (d < It.s && ['ss', d]) ||
                        (r <= 1 && ['m']) ||
                        (r < It.m && ['mm', r]) ||
                        (_ <= 1 && ['h']) ||
                        (_ < It.h && ['hh', _]) ||
                        (i <= 1 && ['d']) ||
                        (i < It.d && ['dd', i]) ||
                        (o <= 1 && ['M']) ||
                        (o < It.M && ['MM', o]) ||
                        (m <= 1 && ['y']) || ['yy', m])[2] = t),
                    (u[3] = 0 < +a),
                    (u[4] = s),
                    function (e, a, t, s, n) {
                        return n.relativeTime(a || 1, !!t, e, s);
                    }.apply(null, u));
            return e && (M = l.pastFuture(+this, M)), l.postformat(M);
        }),
        (Kt.toISOString = Vt),
        (Kt.toString = Vt),
        (Kt.toJSON = Vt),
        (Kt.locale = Qa),
        (Kt.localeData = et),
        (Kt.toIsoString = t(
            'toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)',
            Vt
        )),
        (Kt.lang = Xa),
        C('X', 0, 0, 'unix'),
        C('x', 0, 0, 'valueOf'),
        ie('x', se),
        ie('X', /[+-]?\d+(\.\d{1,3})?/),
        le('X', function (e, a, t) {
            t._d = new Date(1e3 * parseFloat(e, 10));
        }),
        le('x', function (e, a, t) {
            t._d = new Date(g(e));
        }),
        (l.version = '2.24.0'),
        (e = Ha),
        (l.fn = Mt),
        (l.min = function () {
            return xa('isBefore', [].slice.call(arguments, 0));
        }),
        (l.max = function () {
            return xa('isAfter', [].slice.call(arguments, 0));
        }),
        (l.now = function () {
            return Date.now ? Date.now() : +new Date();
        }),
        (l.utc = c),
        (l.unix = function (e) {
            return Ha(1e3 * e);
        }),
        (l.months = function (e, a) {
            return Yt(e, a, 'months');
        }),
        (l.isDate = u),
        (l.locale = ia),
        (l.invalid = f),
        (l.duration = Ua),
        (l.isMoment = D),
        (l.weekdays = function (e, a, t) {
            return yt(e, a, t, 'weekdays');
        }),
        (l.parseZone = function () {
            return Ha.apply(null, arguments).parseZone();
        }),
        (l.localeData = ma),
        (l.isDuration = Wa),
        (l.monthsShort = function (e, a) {
            return Yt(e, a, 'monthsShort');
        }),
        (l.weekdaysMin = function (e, a, t) {
            return yt(e, a, t, 'weekdaysMin');
        }),
        (l.defineLocale = oa),
        (l.updateLocale = function (e, a) {
            if (null != a) {
                var t,
                    s,
                    n = sa;
                null != (s = _a(e)) && (n = s._config),
                    ((t = new j((a = b(n, a)))).parentLocale = na[e]),
                    (na[e] = t),
                    ia(e);
            } else
                null != na[e] &&
                    (null != na[e].parentLocale
                        ? (na[e] = na[e].parentLocale)
                        : null != na[e] && delete na[e]);
            return na[e];
        }),
        (l.locales = function () {
            return s(na);
        }),
        (l.weekdaysShort = function (e, a, t) {
            return yt(e, a, t, 'weekdaysShort');
        }),
        (l.normalizeUnits = P),
        (l.relativeTimeRounding = function (e) {
            return void 0 === e ? Ct : 'function' == typeof e && ((Ct = e), !0);
        }),
        (l.relativeTimeThreshold = function (e, a) {
            return (
                void 0 !== It[e] &&
                (void 0 === a
                    ? It[e]
                    : ((It[e] = a), 's' === e && (It.ss = a - 1), !0))
            );
        }),
        (l.calendarFormat = function (e, a) {
            var t = e.diff(a, 'days', !0);
            return t < -6
                ? 'sameElse'
                : t < -1
                ? 'lastWeek'
                : t < 0
                ? 'lastDay'
                : t < 1
                ? 'sameDay'
                : t < 2
                ? 'nextDay'
                : t < 7
                ? 'nextWeek'
                : 'sameElse';
        }),
        (l.prototype = Mt),
        (l.HTML5_FMT = {
            DATETIME_LOCAL: 'YYYY-MM-DDTHH:mm',
            DATETIME_LOCAL_SECONDS: 'YYYY-MM-DDTHH:mm:ss',
            DATETIME_LOCAL_MS: 'YYYY-MM-DDTHH:mm:ss.SSS',
            DATE: 'YYYY-MM-DD',
            TIME: 'HH:mm',
            TIME_SECONDS: 'HH:mm:ss',
            TIME_MS: 'HH:mm:ss.SSS',
            WEEK: 'GGGG-[W]WW',
            MONTH: 'YYYY-MM',
        }),
        l.defineLocale('af', {
            months: 'Januarie_Februarie_Maart_April_Mei_Junie_Julie_Augustus_September_Oktober_November_Desember'.split(
                '_'
            ),
            monthsShort:
                'Jan_Feb_Mrt_Apr_Mei_Jun_Jul_Aug_Sep_Okt_Nov_Des'.split('_'),
            weekdays:
                'Sondag_Maandag_Dinsdag_Woensdag_Donderdag_Vrydag_Saterdag'.split(
                    '_'
                ),
            weekdaysShort: 'Son_Maa_Din_Woe_Don_Vry_Sat'.split('_'),
            weekdaysMin: 'So_Ma_Di_Wo_Do_Vr_Sa'.split('_'),
            meridiemParse: /vm|nm/i,
            isPM: function (e) {
                return /^nm$/i.test(e);
            },
            meridiem: function (e, a, t) {
                return e < 12 ? (t ? 'vm' : 'VM') : t ? 'nm' : 'NM';
            },
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd, D MMMM YYYY HH:mm',
            },
            calendar: {
                sameDay: '[Vandag om] LT',
                nextDay: '[M\xf4re om] LT',
                nextWeek: 'dddd [om] LT',
                lastDay: '[Gister om] LT',
                lastWeek: '[Laas] dddd [om] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: 'oor %s',
                past: '%s gelede',
                s: "'n paar sekondes",
                ss: '%d sekondes',
                m: "'n minuut",
                mm: '%d minute',
                h: "'n uur",
                hh: '%d ure',
                d: "'n dag",
                dd: '%d dae',
                M: "'n maand",
                MM: '%d maande',
                y: "'n jaar",
                yy: '%d jaar',
            },
            dayOfMonthOrdinalParse: /\d{1,2}(ste|de)/,
            ordinal: function (e) {
                return e + (1 === e || 8 === e || 20 <= e ? 'ste' : 'de');
            },
            week: { dow: 1, doy: 4 },
        }),
        l.defineLocale('ar-dz', {
            months: '\u062c\u0627\u0646\u0641\u064a_\u0641\u064a\u0641\u0631\u064a_\u0645\u0627\u0631\u0633_\u0623\u0641\u0631\u064a\u0644_\u0645\u0627\u064a_\u062c\u0648\u0627\u0646_\u062c\u0648\u064a\u0644\u064a\u0629_\u0623\u0648\u062a_\u0633\u0628\u062a\u0645\u0628\u0631_\u0623\u0643\u062a\u0648\u0628\u0631_\u0646\u0648\u0641\u0645\u0628\u0631_\u062f\u064a\u0633\u0645\u0628\u0631'.split(
                '_'
            ),
            monthsShort:
                '\u062c\u0627\u0646\u0641\u064a_\u0641\u064a\u0641\u0631\u064a_\u0645\u0627\u0631\u0633_\u0623\u0641\u0631\u064a\u0644_\u0645\u0627\u064a_\u062c\u0648\u0627\u0646_\u062c\u0648\u064a\u0644\u064a\u0629_\u0623\u0648\u062a_\u0633\u0628\u062a\u0645\u0628\u0631_\u0623\u0643\u062a\u0648\u0628\u0631_\u0646\u0648\u0641\u0645\u0628\u0631_\u062f\u064a\u0633\u0645\u0628\u0631'.split(
                    '_'
                ),
            weekdays:
                '\u0627\u0644\u0623\u062d\u062f_\u0627\u0644\u0625\u062b\u0646\u064a\u0646_\u0627\u0644\u062b\u0644\u0627\u062b\u0627\u0621_\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621_\u0627\u0644\u062e\u0645\u064a\u0633_\u0627\u0644\u062c\u0645\u0639\u0629_\u0627\u0644\u0633\u0628\u062a'.split(
                    '_'
                ),
            weekdaysShort:
                '\u0627\u062d\u062f_\u0627\u062b\u0646\u064a\u0646_\u062b\u0644\u0627\u062b\u0627\u0621_\u0627\u0631\u0628\u0639\u0627\u0621_\u062e\u0645\u064a\u0633_\u062c\u0645\u0639\u0629_\u0633\u0628\u062a'.split(
                    '_'
                ),
            weekdaysMin:
                '\u0623\u062d_\u0625\u062b_\u062b\u0644\u0627_\u0623\u0631_\u062e\u0645_\u062c\u0645_\u0633\u0628'.split(
                    '_'
                ),
            weekdaysParseExact: !0,
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd D MMMM YYYY HH:mm',
            },
            calendar: {
                sameDay:
                    '[\u0627\u0644\u064a\u0648\u0645 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
                nextDay:
                    '[\u063a\u062f\u0627 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
                nextWeek:
                    'dddd [\u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
                lastDay:
                    '[\u0623\u0645\u0633 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
                lastWeek:
                    'dddd [\u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: '\u0641\u064a %s',
                past: '\u0645\u0646\u0630 %s',
                s: '\u062b\u0648\u0627\u0646',
                ss: '%d \u062b\u0627\u0646\u064a\u0629',
                m: '\u062f\u0642\u064a\u0642\u0629',
                mm: '%d \u062f\u0642\u0627\u0626\u0642',
                h: '\u0633\u0627\u0639\u0629',
                hh: '%d \u0633\u0627\u0639\u0627\u062a',
                d: '\u064a\u0648\u0645',
                dd: '%d \u0623\u064a\u0627\u0645',
                M: '\u0634\u0647\u0631',
                MM: '%d \u0623\u0634\u0647\u0631',
                y: '\u0633\u0646\u0629',
                yy: '%d \u0633\u0646\u0648\u0627\u062a',
            },
            week: { dow: 0, doy: 4 },
        }),
        l.defineLocale('ar-kw', {
            months: '\u064a\u0646\u0627\u064a\u0631_\u0641\u0628\u0631\u0627\u064a\u0631_\u0645\u0627\u0631\u0633_\u0623\u0628\u0631\u064a\u0644_\u0645\u0627\u064a_\u064a\u0648\u0646\u064a\u0648_\u064a\u0648\u0644\u064a\u0648\u0632_\u063a\u0634\u062a_\u0634\u062a\u0646\u0628\u0631_\u0623\u0643\u062a\u0648\u0628\u0631_\u0646\u0648\u0646\u0628\u0631_\u062f\u062c\u0646\u0628\u0631'.split(
                '_'
            ),
            monthsShort:
                '\u064a\u0646\u0627\u064a\u0631_\u0641\u0628\u0631\u0627\u064a\u0631_\u0645\u0627\u0631\u0633_\u0623\u0628\u0631\u064a\u0644_\u0645\u0627\u064a_\u064a\u0648\u0646\u064a\u0648_\u064a\u0648\u0644\u064a\u0648\u0632_\u063a\u0634\u062a_\u0634\u062a\u0646\u0628\u0631_\u0623\u0643\u062a\u0648\u0628\u0631_\u0646\u0648\u0646\u0628\u0631_\u062f\u062c\u0646\u0628\u0631'.split(
                    '_'
                ),
            weekdays:
                '\u0627\u0644\u0623\u062d\u062f_\u0627\u0644\u0625\u062a\u0646\u064a\u0646_\u0627\u0644\u062b\u0644\u0627\u062b\u0627\u0621_\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621_\u0627\u0644\u062e\u0645\u064a\u0633_\u0627\u0644\u062c\u0645\u0639\u0629_\u0627\u0644\u0633\u0628\u062a'.split(
                    '_'
                ),
            weekdaysShort:
                '\u0627\u062d\u062f_\u0627\u062a\u0646\u064a\u0646_\u062b\u0644\u0627\u062b\u0627\u0621_\u0627\u0631\u0628\u0639\u0627\u0621_\u062e\u0645\u064a\u0633_\u062c\u0645\u0639\u0629_\u0633\u0628\u062a'.split(
                    '_'
                ),
            weekdaysMin:
                '\u062d_\u0646_\u062b_\u0631_\u062e_\u062c_\u0633'.split('_'),
            weekdaysParseExact: !0,
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd D MMMM YYYY HH:mm',
            },
            calendar: {
                sameDay:
                    '[\u0627\u0644\u064a\u0648\u0645 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
                nextDay:
                    '[\u063a\u062f\u0627 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
                nextWeek:
                    'dddd [\u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
                lastDay:
                    '[\u0623\u0645\u0633 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
                lastWeek:
                    'dddd [\u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: '\u0641\u064a %s',
                past: '\u0645\u0646\u0630 %s',
                s: '\u062b\u0648\u0627\u0646',
                ss: '%d \u062b\u0627\u0646\u064a\u0629',
                m: '\u062f\u0642\u064a\u0642\u0629',
                mm: '%d \u062f\u0642\u0627\u0626\u0642',
                h: '\u0633\u0627\u0639\u0629',
                hh: '%d \u0633\u0627\u0639\u0627\u062a',
                d: '\u064a\u0648\u0645',
                dd: '%d \u0623\u064a\u0627\u0645',
                M: '\u0634\u0647\u0631',
                MM: '%d \u0623\u0634\u0647\u0631',
                y: '\u0633\u0646\u0629',
                yy: '%d \u0633\u0646\u0648\u0627\u062a',
            },
            week: { dow: 0, doy: 12 },
        });
    var Zt = {
            1: '1',
            2: '2',
            3: '3',
            4: '4',
            5: '5',
            6: '6',
            7: '7',
            8: '8',
            9: '9',
            0: '0',
        },
        $t = function (e) {
            return 0 === e
                ? 0
                : 1 === e
                ? 1
                : 2 === e
                ? 2
                : 3 <= e % 100 && e % 100 <= 10
                ? 3
                : 11 <= e % 100
                ? 4
                : 5;
        },
        Bt = {
            s: [
                '\u0623\u0642\u0644 \u0645\u0646 \u062b\u0627\u0646\u064a\u0629',
                '\u062b\u0627\u0646\u064a\u0629 \u0648\u0627\u062d\u062f\u0629',
                [
                    '\u062b\u0627\u0646\u064a\u062a\u0627\u0646',
                    '\u062b\u0627\u0646\u064a\u062a\u064a\u0646',
                ],
                '%d \u062b\u0648\u0627\u0646',
                '%d \u062b\u0627\u0646\u064a\u0629',
                '%d \u062b\u0627\u0646\u064a\u0629',
            ],
            m: [
                '\u0623\u0642\u0644 \u0645\u0646 \u062f\u0642\u064a\u0642\u0629',
                '\u062f\u0642\u064a\u0642\u0629 \u0648\u0627\u062d\u062f\u0629',
                [
                    '\u062f\u0642\u064a\u0642\u062a\u0627\u0646',
                    '\u062f\u0642\u064a\u0642\u062a\u064a\u0646',
                ],
                '%d \u062f\u0642\u0627\u0626\u0642',
                '%d \u062f\u0642\u064a\u0642\u0629',
                '%d \u062f\u0642\u064a\u0642\u0629',
            ],
            h: [
                '\u0623\u0642\u0644 \u0645\u0646 \u0633\u0627\u0639\u0629',
                '\u0633\u0627\u0639\u0629 \u0648\u0627\u062d\u062f\u0629',
                [
                    '\u0633\u0627\u0639\u062a\u0627\u0646',
                    '\u0633\u0627\u0639\u062a\u064a\u0646',
                ],
                '%d \u0633\u0627\u0639\u0627\u062a',
                '%d \u0633\u0627\u0639\u0629',
                '%d \u0633\u0627\u0639\u0629',
            ],
            d: [
                '\u0623\u0642\u0644 \u0645\u0646 \u064a\u0648\u0645',
                '\u064a\u0648\u0645 \u0648\u0627\u062d\u062f',
                [
                    '\u064a\u0648\u0645\u0627\u0646',
                    '\u064a\u0648\u0645\u064a\u0646',
                ],
                '%d \u0623\u064a\u0627\u0645',
                '%d \u064a\u0648\u0645\u064b\u0627',
                '%d \u064a\u0648\u0645',
            ],
            M: [
                '\u0623\u0642\u0644 \u0645\u0646 \u0634\u0647\u0631',
                '\u0634\u0647\u0631 \u0648\u0627\u062d\u062f',
                [
                    '\u0634\u0647\u0631\u0627\u0646',
                    '\u0634\u0647\u0631\u064a\u0646',
                ],
                '%d \u0623\u0634\u0647\u0631',
                '%d \u0634\u0647\u0631\u0627',
                '%d \u0634\u0647\u0631',
            ],
            y: [
                '\u0623\u0642\u0644 \u0645\u0646 \u0639\u0627\u0645',
                '\u0639\u0627\u0645 \u0648\u0627\u062d\u062f',
                [
                    '\u0639\u0627\u0645\u0627\u0646',
                    '\u0639\u0627\u0645\u064a\u0646',
                ],
                '%d \u0623\u0639\u0648\u0627\u0645',
                '%d \u0639\u0627\u0645\u064b\u0627',
                '%d \u0639\u0627\u0645',
            ],
        },
        qt = function (r) {
            return function (e, a, t, s) {
                var n = $t(e),
                    d = Bt[r][$t(e)];
                return 2 === n && (d = d[a ? 0 : 1]), d.replace(/%d/i, e);
            };
        },
        Qt = [
            '\u064a\u0646\u0627\u064a\u0631',
            '\u0641\u0628\u0631\u0627\u064a\u0631',
            '\u0645\u0627\u0631\u0633',
            '\u0623\u0628\u0631\u064a\u0644',
            '\u0645\u0627\u064a\u0648',
            '\u064a\u0648\u0646\u064a\u0648',
            '\u064a\u0648\u0644\u064a\u0648',
            '\u0623\u063a\u0633\u0637\u0633',
            '\u0633\u0628\u062a\u0645\u0628\u0631',
            '\u0623\u0643\u062a\u0648\u0628\u0631',
            '\u0646\u0648\u0641\u0645\u0628\u0631',
            '\u062f\u064a\u0633\u0645\u0628\u0631',
        ];
    l.defineLocale('ar-ly', {
        months: Qt,
        monthsShort: Qt,
        weekdays:
            '\u0627\u0644\u0623\u062d\u062f_\u0627\u0644\u0625\u062b\u0646\u064a\u0646_\u0627\u0644\u062b\u0644\u0627\u062b\u0627\u0621_\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621_\u0627\u0644\u062e\u0645\u064a\u0633_\u0627\u0644\u062c\u0645\u0639\u0629_\u0627\u0644\u0633\u0628\u062a'.split(
                '_'
            ),
        weekdaysShort:
            '\u0623\u062d\u062f_\u0625\u062b\u0646\u064a\u0646_\u062b\u0644\u0627\u062b\u0627\u0621_\u0623\u0631\u0628\u0639\u0627\u0621_\u062e\u0645\u064a\u0633_\u062c\u0645\u0639\u0629_\u0633\u0628\u062a'.split(
                '_'
            ),
        weekdaysMin: '\u062d_\u0646_\u062b_\u0631_\u062e_\u062c_\u0633'.split(
            '_'
        ),
        weekdaysParseExact: !0,
        longDateFormat: {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L: 'D/\u200fM/\u200fYYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY HH:mm',
            LLLL: 'dddd D MMMM YYYY HH:mm',
        },
        meridiemParse: /\u0635|\u0645/,
        isPM: function (e) {
            return '\u0645' === e;
        },
        meridiem: function (e, a, t) {
            return e < 12 ? '\u0635' : '\u0645';
        },
        calendar: {
            sameDay:
                '[\u0627\u0644\u064a\u0648\u0645 \u0639\u0646\u062f \u0627\u0644\u0633\u0627\u0639\u0629] LT',
            nextDay:
                '[\u063a\u062f\u064b\u0627 \u0639\u0646\u062f \u0627\u0644\u0633\u0627\u0639\u0629] LT',
            nextWeek:
                'dddd [\u0639\u0646\u062f \u0627\u0644\u0633\u0627\u0639\u0629] LT',
            lastDay:
                '[\u0623\u0645\u0633 \u0639\u0646\u062f \u0627\u0644\u0633\u0627\u0639\u0629] LT',
            lastWeek:
                'dddd [\u0639\u0646\u062f \u0627\u0644\u0633\u0627\u0639\u0629] LT',
            sameElse: 'L',
        },
        relativeTime: {
            future: '\u0628\u0639\u062f %s',
            past: '\u0645\u0646\u0630 %s',
            s: qt('s'),
            ss: qt('s'),
            m: qt('m'),
            mm: qt('m'),
            h: qt('h'),
            hh: qt('h'),
            d: qt('d'),
            dd: qt('d'),
            M: qt('M'),
            MM: qt('M'),
            y: qt('y'),
            yy: qt('y'),
        },
        preparse: function (e) {
            return e.replace(/\u060c/g, ',');
        },
        postformat: function (e) {
            return e
                .replace(/\d/g, function (e) {
                    return Zt[e];
                })
                .replace(/,/g, '\u060c');
        },
        week: { dow: 6, doy: 12 },
    }),
        l.defineLocale('ar-ma', {
            months: '\u064a\u0646\u0627\u064a\u0631_\u0641\u0628\u0631\u0627\u064a\u0631_\u0645\u0627\u0631\u0633_\u0623\u0628\u0631\u064a\u0644_\u0645\u0627\u064a_\u064a\u0648\u0646\u064a\u0648_\u064a\u0648\u0644\u064a\u0648\u0632_\u063a\u0634\u062a_\u0634\u062a\u0646\u0628\u0631_\u0623\u0643\u062a\u0648\u0628\u0631_\u0646\u0648\u0646\u0628\u0631_\u062f\u062c\u0646\u0628\u0631'.split(
                '_'
            ),
            monthsShort:
                '\u064a\u0646\u0627\u064a\u0631_\u0641\u0628\u0631\u0627\u064a\u0631_\u0645\u0627\u0631\u0633_\u0623\u0628\u0631\u064a\u0644_\u0645\u0627\u064a_\u064a\u0648\u0646\u064a\u0648_\u064a\u0648\u0644\u064a\u0648\u0632_\u063a\u0634\u062a_\u0634\u062a\u0646\u0628\u0631_\u0623\u0643\u062a\u0648\u0628\u0631_\u0646\u0648\u0646\u0628\u0631_\u062f\u062c\u0646\u0628\u0631'.split(
                    '_'
                ),
            weekdays:
                '\u0627\u0644\u0623\u062d\u062f_\u0627\u0644\u0625\u062a\u0646\u064a\u0646_\u0627\u0644\u062b\u0644\u0627\u062b\u0627\u0621_\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621_\u0627\u0644\u062e\u0645\u064a\u0633_\u0627\u0644\u062c\u0645\u0639\u0629_\u0627\u0644\u0633\u0628\u062a'.split(
                    '_'
                ),
            weekdaysShort:
                '\u0627\u062d\u062f_\u0627\u062a\u0646\u064a\u0646_\u062b\u0644\u0627\u062b\u0627\u0621_\u0627\u0631\u0628\u0639\u0627\u0621_\u062e\u0645\u064a\u0633_\u062c\u0645\u0639\u0629_\u0633\u0628\u062a'.split(
                    '_'
                ),
            weekdaysMin:
                '\u062d_\u0646_\u062b_\u0631_\u062e_\u062c_\u0633'.split('_'),
            weekdaysParseExact: !0,
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd D MMMM YYYY HH:mm',
            },
            calendar: {
                sameDay:
                    '[\u0627\u0644\u064a\u0648\u0645 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
                nextDay:
                    '[\u063a\u062f\u0627 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
                nextWeek:
                    'dddd [\u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
                lastDay:
                    '[\u0623\u0645\u0633 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
                lastWeek:
                    'dddd [\u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: '\u0641\u064a %s',
                past: '\u0645\u0646\u0630 %s',
                s: '\u062b\u0648\u0627\u0646',
                ss: '%d \u062b\u0627\u0646\u064a\u0629',
                m: '\u062f\u0642\u064a\u0642\u0629',
                mm: '%d \u062f\u0642\u0627\u0626\u0642',
                h: '\u0633\u0627\u0639\u0629',
                hh: '%d \u0633\u0627\u0639\u0627\u062a',
                d: '\u064a\u0648\u0645',
                dd: '%d \u0623\u064a\u0627\u0645',
                M: '\u0634\u0647\u0631',
                MM: '%d \u0623\u0634\u0647\u0631',
                y: '\u0633\u0646\u0629',
                yy: '%d \u0633\u0646\u0648\u0627\u062a',
            },
            week: { dow: 6, doy: 12 },
        });
    var Xt = {
            1: '\u0661',
            2: '\u0662',
            3: '\u0663',
            4: '\u0664',
            5: '\u0665',
            6: '\u0666',
            7: '\u0667',
            8: '\u0668',
            9: '\u0669',
            0: '\u0660',
        },
        es = {
            '\u0661': '1',
            '\u0662': '2',
            '\u0663': '3',
            '\u0664': '4',
            '\u0665': '5',
            '\u0666': '6',
            '\u0667': '7',
            '\u0668': '8',
            '\u0669': '9',
            '\u0660': '0',
        };
    l.defineLocale('ar-sa', {
        months: '\u064a\u0646\u0627\u064a\u0631_\u0641\u0628\u0631\u0627\u064a\u0631_\u0645\u0627\u0631\u0633_\u0623\u0628\u0631\u064a\u0644_\u0645\u0627\u064a\u0648_\u064a\u0648\u0646\u064a\u0648_\u064a\u0648\u0644\u064a\u0648_\u0623\u063a\u0633\u0637\u0633_\u0633\u0628\u062a\u0645\u0628\u0631_\u0623\u0643\u062a\u0648\u0628\u0631_\u0646\u0648\u0641\u0645\u0628\u0631_\u062f\u064a\u0633\u0645\u0628\u0631'.split(
            '_'
        ),
        monthsShort:
            '\u064a\u0646\u0627\u064a\u0631_\u0641\u0628\u0631\u0627\u064a\u0631_\u0645\u0627\u0631\u0633_\u0623\u0628\u0631\u064a\u0644_\u0645\u0627\u064a\u0648_\u064a\u0648\u0646\u064a\u0648_\u064a\u0648\u0644\u064a\u0648_\u0623\u063a\u0633\u0637\u0633_\u0633\u0628\u062a\u0645\u0628\u0631_\u0623\u0643\u062a\u0648\u0628\u0631_\u0646\u0648\u0641\u0645\u0628\u0631_\u062f\u064a\u0633\u0645\u0628\u0631'.split(
                '_'
            ),
        weekdays:
            '\u0627\u0644\u0623\u062d\u062f_\u0627\u0644\u0625\u062b\u0646\u064a\u0646_\u0627\u0644\u062b\u0644\u0627\u062b\u0627\u0621_\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621_\u0627\u0644\u062e\u0645\u064a\u0633_\u0627\u0644\u062c\u0645\u0639\u0629_\u0627\u0644\u0633\u0628\u062a'.split(
                '_'
            ),
        weekdaysShort:
            '\u0623\u062d\u062f_\u0625\u062b\u0646\u064a\u0646_\u062b\u0644\u0627\u062b\u0627\u0621_\u0623\u0631\u0628\u0639\u0627\u0621_\u062e\u0645\u064a\u0633_\u062c\u0645\u0639\u0629_\u0633\u0628\u062a'.split(
                '_'
            ),
        weekdaysMin: '\u062d_\u0646_\u062b_\u0631_\u062e_\u062c_\u0633'.split(
            '_'
        ),
        weekdaysParseExact: !0,
        longDateFormat: {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY HH:mm',
            LLLL: 'dddd D MMMM YYYY HH:mm',
        },
        meridiemParse: /\u0635|\u0645/,
        isPM: function (e) {
            return '\u0645' === e;
        },
        meridiem: function (e, a, t) {
            return e < 12 ? '\u0635' : '\u0645';
        },
        calendar: {
            sameDay:
                '[\u0627\u0644\u064a\u0648\u0645 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
            nextDay:
                '[\u063a\u062f\u0627 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
            nextWeek:
                'dddd [\u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
            lastDay:
                '[\u0623\u0645\u0633 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
            lastWeek:
                'dddd [\u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
            sameElse: 'L',
        },
        relativeTime: {
            future: '\u0641\u064a %s',
            past: '\u0645\u0646\u0630 %s',
            s: '\u062b\u0648\u0627\u0646',
            ss: '%d \u062b\u0627\u0646\u064a\u0629',
            m: '\u062f\u0642\u064a\u0642\u0629',
            mm: '%d \u062f\u0642\u0627\u0626\u0642',
            h: '\u0633\u0627\u0639\u0629',
            hh: '%d \u0633\u0627\u0639\u0627\u062a',
            d: '\u064a\u0648\u0645',
            dd: '%d \u0623\u064a\u0627\u0645',
            M: '\u0634\u0647\u0631',
            MM: '%d \u0623\u0634\u0647\u0631',
            y: '\u0633\u0646\u0629',
            yy: '%d \u0633\u0646\u0648\u0627\u062a',
        },
        preparse: function (e) {
            return e
                .replace(
                    /[\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669\u0660]/g,
                    function (e) {
                        return es[e];
                    }
                )
                .replace(/\u060c/g, ',');
        },
        postformat: function (e) {
            return e
                .replace(/\d/g, function (e) {
                    return Xt[e];
                })
                .replace(/,/g, '\u060c');
        },
        week: { dow: 0, doy: 6 },
    }),
        l.defineLocale('ar-tn', {
            months: '\u062c\u0627\u0646\u0641\u064a_\u0641\u064a\u0641\u0631\u064a_\u0645\u0627\u0631\u0633_\u0623\u0641\u0631\u064a\u0644_\u0645\u0627\u064a_\u062c\u0648\u0627\u0646_\u062c\u0648\u064a\u0644\u064a\u0629_\u0623\u0648\u062a_\u0633\u0628\u062a\u0645\u0628\u0631_\u0623\u0643\u062a\u0648\u0628\u0631_\u0646\u0648\u0641\u0645\u0628\u0631_\u062f\u064a\u0633\u0645\u0628\u0631'.split(
                '_'
            ),
            monthsShort:
                '\u062c\u0627\u0646\u0641\u064a_\u0641\u064a\u0641\u0631\u064a_\u0645\u0627\u0631\u0633_\u0623\u0641\u0631\u064a\u0644_\u0645\u0627\u064a_\u062c\u0648\u0627\u0646_\u062c\u0648\u064a\u0644\u064a\u0629_\u0623\u0648\u062a_\u0633\u0628\u062a\u0645\u0628\u0631_\u0623\u0643\u062a\u0648\u0628\u0631_\u0646\u0648\u0641\u0645\u0628\u0631_\u062f\u064a\u0633\u0645\u0628\u0631'.split(
                    '_'
                ),
            weekdays:
                '\u0627\u0644\u0623\u062d\u062f_\u0627\u0644\u0625\u062b\u0646\u064a\u0646_\u0627\u0644\u062b\u0644\u0627\u062b\u0627\u0621_\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621_\u0627\u0644\u062e\u0645\u064a\u0633_\u0627\u0644\u062c\u0645\u0639\u0629_\u0627\u0644\u0633\u0628\u062a'.split(
                    '_'
                ),
            weekdaysShort:
                '\u0623\u062d\u062f_\u0625\u062b\u0646\u064a\u0646_\u062b\u0644\u0627\u062b\u0627\u0621_\u0623\u0631\u0628\u0639\u0627\u0621_\u062e\u0645\u064a\u0633_\u062c\u0645\u0639\u0629_\u0633\u0628\u062a'.split(
                    '_'
                ),
            weekdaysMin:
                '\u062d_\u0646_\u062b_\u0631_\u062e_\u062c_\u0633'.split('_'),
            weekdaysParseExact: !0,
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd D MMMM YYYY HH:mm',
            },
            calendar: {
                sameDay:
                    '[\u0627\u0644\u064a\u0648\u0645 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
                nextDay:
                    '[\u063a\u062f\u0627 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
                nextWeek:
                    'dddd [\u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
                lastDay:
                    '[\u0623\u0645\u0633 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
                lastWeek:
                    'dddd [\u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: '\u0641\u064a %s',
                past: '\u0645\u0646\u0630 %s',
                s: '\u062b\u0648\u0627\u0646',
                ss: '%d \u062b\u0627\u0646\u064a\u0629',
                m: '\u062f\u0642\u064a\u0642\u0629',
                mm: '%d \u062f\u0642\u0627\u0626\u0642',
                h: '\u0633\u0627\u0639\u0629',
                hh: '%d \u0633\u0627\u0639\u0627\u062a',
                d: '\u064a\u0648\u0645',
                dd: '%d \u0623\u064a\u0627\u0645',
                M: '\u0634\u0647\u0631',
                MM: '%d \u0623\u0634\u0647\u0631',
                y: '\u0633\u0646\u0629',
                yy: '%d \u0633\u0646\u0648\u0627\u062a',
            },
            week: { dow: 1, doy: 4 },
        });
    var as = {
            1: '\u0661',
            2: '\u0662',
            3: '\u0663',
            4: '\u0664',
            5: '\u0665',
            6: '\u0666',
            7: '\u0667',
            8: '\u0668',
            9: '\u0669',
            0: '\u0660',
        },
        ts = {
            '\u0661': '1',
            '\u0662': '2',
            '\u0663': '3',
            '\u0664': '4',
            '\u0665': '5',
            '\u0666': '6',
            '\u0667': '7',
            '\u0668': '8',
            '\u0669': '9',
            '\u0660': '0',
        },
        ss = function (e) {
            return 0 === e
                ? 0
                : 1 === e
                ? 1
                : 2 === e
                ? 2
                : 3 <= e % 100 && e % 100 <= 10
                ? 3
                : 11 <= e % 100
                ? 4
                : 5;
        },
        ns = {
            s: [
                '\u0623\u0642\u0644 \u0645\u0646 \u062b\u0627\u0646\u064a\u0629',
                '\u062b\u0627\u0646\u064a\u0629 \u0648\u0627\u062d\u062f\u0629',
                [
                    '\u062b\u0627\u0646\u064a\u062a\u0627\u0646',
                    '\u062b\u0627\u0646\u064a\u062a\u064a\u0646',
                ],
                '%d \u062b\u0648\u0627\u0646',
                '%d \u062b\u0627\u0646\u064a\u0629',
                '%d \u062b\u0627\u0646\u064a\u0629',
            ],
            m: [
                '\u0623\u0642\u0644 \u0645\u0646 \u062f\u0642\u064a\u0642\u0629',
                '\u062f\u0642\u064a\u0642\u0629 \u0648\u0627\u062d\u062f\u0629',
                [
                    '\u062f\u0642\u064a\u0642\u062a\u0627\u0646',
                    '\u062f\u0642\u064a\u0642\u062a\u064a\u0646',
                ],
                '%d \u062f\u0642\u0627\u0626\u0642',
                '%d \u062f\u0642\u064a\u0642\u0629',
                '%d \u062f\u0642\u064a\u0642\u0629',
            ],
            h: [
                '\u0623\u0642\u0644 \u0645\u0646 \u0633\u0627\u0639\u0629',
                '\u0633\u0627\u0639\u0629 \u0648\u0627\u062d\u062f\u0629',
                [
                    '\u0633\u0627\u0639\u062a\u0627\u0646',
                    '\u0633\u0627\u0639\u062a\u064a\u0646',
                ],
                '%d \u0633\u0627\u0639\u0627\u062a',
                '%d \u0633\u0627\u0639\u0629',
                '%d \u0633\u0627\u0639\u0629',
            ],
            d: [
                '\u0623\u0642\u0644 \u0645\u0646 \u064a\u0648\u0645',
                '\u064a\u0648\u0645 \u0648\u0627\u062d\u062f',
                [
                    '\u064a\u0648\u0645\u0627\u0646',
                    '\u064a\u0648\u0645\u064a\u0646',
                ],
                '%d \u0623\u064a\u0627\u0645',
                '%d \u064a\u0648\u0645\u064b\u0627',
                '%d \u064a\u0648\u0645',
            ],
            M: [
                '\u0623\u0642\u0644 \u0645\u0646 \u0634\u0647\u0631',
                '\u0634\u0647\u0631 \u0648\u0627\u062d\u062f',
                [
                    '\u0634\u0647\u0631\u0627\u0646',
                    '\u0634\u0647\u0631\u064a\u0646',
                ],
                '%d \u0623\u0634\u0647\u0631',
                '%d \u0634\u0647\u0631\u0627',
                '%d \u0634\u0647\u0631',
            ],
            y: [
                '\u0623\u0642\u0644 \u0645\u0646 \u0639\u0627\u0645',
                '\u0639\u0627\u0645 \u0648\u0627\u062d\u062f',
                [
                    '\u0639\u0627\u0645\u0627\u0646',
                    '\u0639\u0627\u0645\u064a\u0646',
                ],
                '%d \u0623\u0639\u0648\u0627\u0645',
                '%d \u0639\u0627\u0645\u064b\u0627',
                '%d \u0639\u0627\u0645',
            ],
        },
        ds = function (r) {
            return function (e, a, t, s) {
                var n = ss(e),
                    d = ns[r][ss(e)];
                return 2 === n && (d = d[a ? 0 : 1]), d.replace(/%d/i, e);
            };
        },
        rs = [
            '\u064a\u0646\u0627\u064a\u0631',
            '\u0641\u0628\u0631\u0627\u064a\u0631',
            '\u0645\u0627\u0631\u0633',
            '\u0623\u0628\u0631\u064a\u0644',
            '\u0645\u0627\u064a\u0648',
            '\u064a\u0648\u0646\u064a\u0648',
            '\u064a\u0648\u0644\u064a\u0648',
            '\u0623\u063a\u0633\u0637\u0633',
            '\u0633\u0628\u062a\u0645\u0628\u0631',
            '\u0623\u0643\u062a\u0648\u0628\u0631',
            '\u0646\u0648\u0641\u0645\u0628\u0631',
            '\u062f\u064a\u0633\u0645\u0628\u0631',
        ];
    l.defineLocale('ar', {
        months: rs,
        monthsShort: rs,
        weekdays:
            '\u0627\u0644\u0623\u062d\u062f_\u0627\u0644\u0625\u062b\u0646\u064a\u0646_\u0627\u0644\u062b\u0644\u0627\u062b\u0627\u0621_\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621_\u0627\u0644\u062e\u0645\u064a\u0633_\u0627\u0644\u062c\u0645\u0639\u0629_\u0627\u0644\u0633\u0628\u062a'.split(
                '_'
            ),
        weekdaysShort:
            '\u0623\u062d\u062f_\u0625\u062b\u0646\u064a\u0646_\u062b\u0644\u0627\u062b\u0627\u0621_\u0623\u0631\u0628\u0639\u0627\u0621_\u062e\u0645\u064a\u0633_\u062c\u0645\u0639\u0629_\u0633\u0628\u062a'.split(
                '_'
            ),
        weekdaysMin: '\u062d_\u0646_\u062b_\u0631_\u062e_\u062c_\u0633'.split(
            '_'
        ),
        weekdaysParseExact: !0,
        longDateFormat: {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L: 'D/\u200fM/\u200fYYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY HH:mm',
            LLLL: 'dddd D MMMM YYYY HH:mm',
        },
        meridiemParse: /\u0635|\u0645/,
        isPM: function (e) {
            return '\u0645' === e;
        },
        meridiem: function (e, a, t) {
            return e < 12 ? '\u0635' : '\u0645';
        },
        calendar: {
            sameDay:
                '[\u0627\u0644\u064a\u0648\u0645 \u0639\u0646\u062f \u0627\u0644\u0633\u0627\u0639\u0629] LT',
            nextDay:
                '[\u063a\u062f\u064b\u0627 \u0639\u0646\u062f \u0627\u0644\u0633\u0627\u0639\u0629] LT',
            nextWeek:
                'dddd [\u0639\u0646\u062f \u0627\u0644\u0633\u0627\u0639\u0629] LT',
            lastDay:
                '[\u0623\u0645\u0633 \u0639\u0646\u062f \u0627\u0644\u0633\u0627\u0639\u0629] LT',
            lastWeek:
                'dddd [\u0639\u0646\u062f \u0627\u0644\u0633\u0627\u0639\u0629] LT',
            sameElse: 'L',
        },
        relativeTime: {
            future: '\u0628\u0639\u062f %s',
            past: '\u0645\u0646\u0630 %s',
            s: ds('s'),
            ss: ds('s'),
            m: ds('m'),
            mm: ds('m'),
            h: ds('h'),
            hh: ds('h'),
            d: ds('d'),
            dd: ds('d'),
            M: ds('M'),
            MM: ds('M'),
            y: ds('y'),
            yy: ds('y'),
        },
        preparse: function (e) {
            return e
                .replace(
                    /[\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669\u0660]/g,
                    function (e) {
                        return ts[e];
                    }
                )
                .replace(/\u060c/g, ',');
        },
        postformat: function (e) {
            return e
                .replace(/\d/g, function (e) {
                    return as[e];
                })
                .replace(/,/g, '\u060c');
        },
        week: { dow: 6, doy: 12 },
    });
    var _s = {
        1: '-inci',
        5: '-inci',
        8: '-inci',
        70: '-inci',
        80: '-inci',
        2: '-nci',
        7: '-nci',
        20: '-nci',
        50: '-nci',
        3: '-\xfcnc\xfc',
        4: '-\xfcnc\xfc',
        100: '-\xfcnc\xfc',
        6: '-nc\u0131',
        9: '-uncu',
        10: '-uncu',
        30: '-uncu',
        60: '-\u0131nc\u0131',
        90: '-\u0131nc\u0131',
    };
    function is(e, a, t) {
        var s, n;
        return 'm' === t
            ? a
                ? '\u0445\u0432\u0456\u043b\u0456\u043d\u0430'
                : '\u0445\u0432\u0456\u043b\u0456\u043d\u0443'
            : 'h' === t
            ? a
                ? '\u0433\u0430\u0434\u0437\u0456\u043d\u0430'
                : '\u0433\u0430\u0434\u0437\u0456\u043d\u0443'
            : e +
              ' ' +
              ((s = +e),
              (n = {
                  ss: a
                      ? '\u0441\u0435\u043a\u0443\u043d\u0434\u0430_\u0441\u0435\u043a\u0443\u043d\u0434\u044b_\u0441\u0435\u043a\u0443\u043d\u0434'
                      : '\u0441\u0435\u043a\u0443\u043d\u0434\u0443_\u0441\u0435\u043a\u0443\u043d\u0434\u044b_\u0441\u0435\u043a\u0443\u043d\u0434',
                  mm: a
                      ? '\u0445\u0432\u0456\u043b\u0456\u043d\u0430_\u0445\u0432\u0456\u043b\u0456\u043d\u044b_\u0445\u0432\u0456\u043b\u0456\u043d'
                      : '\u0445\u0432\u0456\u043b\u0456\u043d\u0443_\u0445\u0432\u0456\u043b\u0456\u043d\u044b_\u0445\u0432\u0456\u043b\u0456\u043d',
                  hh: a
                      ? '\u0433\u0430\u0434\u0437\u0456\u043d\u0430_\u0433\u0430\u0434\u0437\u0456\u043d\u044b_\u0433\u0430\u0434\u0437\u0456\u043d'
                      : '\u0433\u0430\u0434\u0437\u0456\u043d\u0443_\u0433\u0430\u0434\u0437\u0456\u043d\u044b_\u0433\u0430\u0434\u0437\u0456\u043d',
                  dd: '\u0434\u0437\u0435\u043d\u044c_\u0434\u043d\u0456_\u0434\u0437\u0451\u043d',
                  MM: '\u043c\u0435\u0441\u044f\u0446_\u043c\u0435\u0441\u044f\u0446\u044b_\u043c\u0435\u0441\u044f\u0446\u0430\u045e',
                  yy: '\u0433\u043e\u0434_\u0433\u0430\u0434\u044b_\u0433\u0430\u0434\u043e\u045e',
              }[t].split('_')),
              s % 10 == 1 && s % 100 != 11
                  ? n[0]
                  : 2 <= s % 10 &&
                    s % 10 <= 4 &&
                    (s % 100 < 10 || 20 <= s % 100)
                  ? n[1]
                  : n[2]);
    }
    l.defineLocale('az', {
        months: 'yanvar_fevral_mart_aprel_may_iyun_iyul_avqust_sentyabr_oktyabr_noyabr_dekabr'.split(
            '_'
        ),
        monthsShort: 'yan_fev_mar_apr_may_iyn_iyl_avq_sen_okt_noy_dek'.split(
            '_'
        ),
        weekdays:
            'Bazar_Bazar ert\u0259si_\xc7\u0259r\u015f\u0259nb\u0259 ax\u015fam\u0131_\xc7\u0259r\u015f\u0259nb\u0259_C\xfcm\u0259 ax\u015fam\u0131_C\xfcm\u0259_\u015e\u0259nb\u0259'.split(
                '_'
            ),
        weekdaysShort:
            'Baz_BzE_\xc7Ax_\xc7\u0259r_CAx_C\xfcm_\u015e\u0259n'.split('_'),
        weekdaysMin: 'Bz_BE_\xc7A_\xc7\u0259_CA_C\xfc_\u015e\u0259'.split('_'),
        weekdaysParseExact: !0,
        longDateFormat: {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L: 'DD.MM.YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY HH:mm',
            LLLL: 'dddd, D MMMM YYYY HH:mm',
        },
        calendar: {
            sameDay: '[bug\xfcn saat] LT',
            nextDay: '[sabah saat] LT',
            nextWeek: '[g\u0259l\u0259n h\u0259ft\u0259] dddd [saat] LT',
            lastDay: '[d\xfcn\u0259n] LT',
            lastWeek: '[ke\xe7\u0259n h\u0259ft\u0259] dddd [saat] LT',
            sameElse: 'L',
        },
        relativeTime: {
            future: '%s sonra',
            past: '%s \u0259vv\u0259l',
            s: 'birne\xe7\u0259 saniy\u0259',
            ss: '%d saniy\u0259',
            m: 'bir d\u0259qiq\u0259',
            mm: '%d d\u0259qiq\u0259',
            h: 'bir saat',
            hh: '%d saat',
            d: 'bir g\xfcn',
            dd: '%d g\xfcn',
            M: 'bir ay',
            MM: '%d ay',
            y: 'bir il',
            yy: '%d il',
        },
        meridiemParse: /gec\u0259|s\u0259h\u0259r|g\xfcnd\xfcz|ax\u015fam/,
        isPM: function (e) {
            return /^(g\xfcnd\xfcz|ax\u015fam)$/.test(e);
        },
        meridiem: function (e, a, t) {
            return e < 4
                ? 'gec\u0259'
                : e < 12
                ? 's\u0259h\u0259r'
                : e < 17
                ? 'g\xfcnd\xfcz'
                : 'ax\u015fam';
        },
        dayOfMonthOrdinalParse:
            /\d{1,2}-(\u0131nc\u0131|inci|nci|\xfcnc\xfc|nc\u0131|uncu)/,
        ordinal: function (e) {
            if (0 === e) return e + '-\u0131nc\u0131';
            var a = e % 10;
            return (
                e + (_s[a] || _s[(e % 100) - a] || _s[100 <= e ? 100 : null])
            );
        },
        week: { dow: 1, doy: 7 },
    }),
        l.defineLocale('be', {
            months: {
                format: '\u0441\u0442\u0443\u0434\u0437\u0435\u043d\u044f_\u043b\u044e\u0442\u0430\u0433\u0430_\u0441\u0430\u043a\u0430\u0432\u0456\u043a\u0430_\u043a\u0440\u0430\u0441\u0430\u0432\u0456\u043a\u0430_\u0442\u0440\u0430\u045e\u043d\u044f_\u0447\u044d\u0440\u0432\u0435\u043d\u044f_\u043b\u0456\u043f\u0435\u043d\u044f_\u0436\u043d\u0456\u045e\u043d\u044f_\u0432\u0435\u0440\u0430\u0441\u043d\u044f_\u043a\u0430\u0441\u0442\u0440\u044b\u0447\u043d\u0456\u043a\u0430_\u043b\u0456\u0441\u0442\u0430\u043f\u0430\u0434\u0430_\u0441\u043d\u0435\u0436\u043d\u044f'.split(
                    '_'
                ),
                standalone:
                    '\u0441\u0442\u0443\u0434\u0437\u0435\u043d\u044c_\u043b\u044e\u0442\u044b_\u0441\u0430\u043a\u0430\u0432\u0456\u043a_\u043a\u0440\u0430\u0441\u0430\u0432\u0456\u043a_\u0442\u0440\u0430\u0432\u0435\u043d\u044c_\u0447\u044d\u0440\u0432\u0435\u043d\u044c_\u043b\u0456\u043f\u0435\u043d\u044c_\u0436\u043d\u0456\u0432\u0435\u043d\u044c_\u0432\u0435\u0440\u0430\u0441\u0435\u043d\u044c_\u043a\u0430\u0441\u0442\u0440\u044b\u0447\u043d\u0456\u043a_\u043b\u0456\u0441\u0442\u0430\u043f\u0430\u0434_\u0441\u043d\u0435\u0436\u0430\u043d\u044c'.split(
                        '_'
                    ),
            },
            monthsShort:
                '\u0441\u0442\u0443\u0434_\u043b\u044e\u0442_\u0441\u0430\u043a_\u043a\u0440\u0430\u0441_\u0442\u0440\u0430\u0432_\u0447\u044d\u0440\u0432_\u043b\u0456\u043f_\u0436\u043d\u0456\u0432_\u0432\u0435\u0440_\u043a\u0430\u0441\u0442_\u043b\u0456\u0441\u0442_\u0441\u043d\u0435\u0436'.split(
                    '_'
                ),
            weekdays: {
                format: '\u043d\u044f\u0434\u0437\u0435\u043b\u044e_\u043f\u0430\u043d\u044f\u0434\u0437\u0435\u043b\u0430\u043a_\u0430\u045e\u0442\u043e\u0440\u0430\u043a_\u0441\u0435\u0440\u0430\u0434\u0443_\u0447\u0430\u0446\u0432\u0435\u0440_\u043f\u044f\u0442\u043d\u0456\u0446\u0443_\u0441\u0443\u0431\u043e\u0442\u0443'.split(
                    '_'
                ),
                standalone:
                    '\u043d\u044f\u0434\u0437\u0435\u043b\u044f_\u043f\u0430\u043d\u044f\u0434\u0437\u0435\u043b\u0430\u043a_\u0430\u045e\u0442\u043e\u0440\u0430\u043a_\u0441\u0435\u0440\u0430\u0434\u0430_\u0447\u0430\u0446\u0432\u0435\u0440_\u043f\u044f\u0442\u043d\u0456\u0446\u0430_\u0441\u0443\u0431\u043e\u0442\u0430'.split(
                        '_'
                    ),
                isFormat:
                    /\[ ?[\u0423\u0443\u045e] ?(?:\u043c\u0456\u043d\u0443\u043b\u0443\u044e|\u043d\u0430\u0441\u0442\u0443\u043f\u043d\u0443\u044e)? ?\] ?dddd/,
            },
            weekdaysShort:
                '\u043d\u0434_\u043f\u043d_\u0430\u0442_\u0441\u0440_\u0447\u0446_\u043f\u0442_\u0441\u0431'.split(
                    '_'
                ),
            weekdaysMin:
                '\u043d\u0434_\u043f\u043d_\u0430\u0442_\u0441\u0440_\u0447\u0446_\u043f\u0442_\u0441\u0431'.split(
                    '_'
                ),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD.MM.YYYY',
                LL: 'D MMMM YYYY \u0433.',
                LLL: 'D MMMM YYYY \u0433., HH:mm',
                LLLL: 'dddd, D MMMM YYYY \u0433., HH:mm',
            },
            calendar: {
                sameDay: '[\u0421\u0451\u043d\u043d\u044f \u045e] LT',
                nextDay: '[\u0417\u0430\u045e\u0442\u0440\u0430 \u045e] LT',
                lastDay: '[\u0423\u0447\u043e\u0440\u0430 \u045e] LT',
                nextWeek: function () {
                    return '[\u0423] dddd [\u045e] LT';
                },
                lastWeek: function () {
                    switch (this.day()) {
                        case 0:
                        case 3:
                        case 5:
                        case 6:
                            return '[\u0423 \u043c\u0456\u043d\u0443\u043b\u0443\u044e] dddd [\u045e] LT';
                        case 1:
                        case 2:
                        case 4:
                            return '[\u0423 \u043c\u0456\u043d\u0443\u043b\u044b] dddd [\u045e] LT';
                    }
                },
                sameElse: 'L',
            },
            relativeTime: {
                future: '\u043f\u0440\u0430\u0437 %s',
                past: '%s \u0442\u0430\u043c\u0443',
                s: '\u043d\u0435\u043a\u0430\u043b\u044c\u043a\u0456 \u0441\u0435\u043a\u0443\u043d\u0434',
                m: is,
                mm: is,
                h: is,
                hh: is,
                d: '\u0434\u0437\u0435\u043d\u044c',
                dd: is,
                M: '\u043c\u0435\u0441\u044f\u0446',
                MM: is,
                y: '\u0433\u043e\u0434',
                yy: is,
            },
            meridiemParse:
                /\u043d\u043e\u0447\u044b|\u0440\u0430\u043d\u0456\u0446\u044b|\u0434\u043d\u044f|\u0432\u0435\u0447\u0430\u0440\u0430/,
            isPM: function (e) {
                return /^(\u0434\u043d\u044f|\u0432\u0435\u0447\u0430\u0440\u0430)$/.test(
                    e
                );
            },
            meridiem: function (e, a, t) {
                return e < 4
                    ? '\u043d\u043e\u0447\u044b'
                    : e < 12
                    ? '\u0440\u0430\u043d\u0456\u0446\u044b'
                    : e < 17
                    ? '\u0434\u043d\u044f'
                    : '\u0432\u0435\u0447\u0430\u0440\u0430';
            },
            dayOfMonthOrdinalParse: /\d{1,2}-(\u0456|\u044b|\u0433\u0430)/,
            ordinal: function (e, a) {
                switch (a) {
                    case 'M':
                    case 'd':
                    case 'DDD':
                    case 'w':
                    case 'W':
                        return (e % 10 != 2 && e % 10 != 3) ||
                            e % 100 == 12 ||
                            e % 100 == 13
                            ? e + '-\u044b'
                            : e + '-\u0456';
                    case 'D':
                        return e + '-\u0433\u0430';
                    default:
                        return e;
                }
            },
            week: { dow: 1, doy: 7 },
        }),
        l.defineLocale('bg', {
            months: '\u044f\u043d\u0443\u0430\u0440\u0438_\u0444\u0435\u0432\u0440\u0443\u0430\u0440\u0438_\u043c\u0430\u0440\u0442_\u0430\u043f\u0440\u0438\u043b_\u043c\u0430\u0439_\u044e\u043d\u0438_\u044e\u043b\u0438_\u0430\u0432\u0433\u0443\u0441\u0442_\u0441\u0435\u043f\u0442\u0435\u043c\u0432\u0440\u0438_\u043e\u043a\u0442\u043e\u043c\u0432\u0440\u0438_\u043d\u043e\u0435\u043c\u0432\u0440\u0438_\u0434\u0435\u043a\u0435\u043c\u0432\u0440\u0438'.split(
                '_'
            ),
            monthsShort:
                '\u044f\u043d\u0440_\u0444\u0435\u0432_\u043c\u0430\u0440_\u0430\u043f\u0440_\u043c\u0430\u0439_\u044e\u043d\u0438_\u044e\u043b\u0438_\u0430\u0432\u0433_\u0441\u0435\u043f_\u043e\u043a\u0442_\u043d\u043e\u0435_\u0434\u0435\u043a'.split(
                    '_'
                ),
            weekdays:
                '\u043d\u0435\u0434\u0435\u043b\u044f_\u043f\u043e\u043d\u0435\u0434\u0435\u043b\u043d\u0438\u043a_\u0432\u0442\u043e\u0440\u043d\u0438\u043a_\u0441\u0440\u044f\u0434\u0430_\u0447\u0435\u0442\u0432\u044a\u0440\u0442\u044a\u043a_\u043f\u0435\u0442\u044a\u043a_\u0441\u044a\u0431\u043e\u0442\u0430'.split(
                    '_'
                ),
            weekdaysShort:
                '\u043d\u0435\u0434_\u043f\u043e\u043d_\u0432\u0442\u043e_\u0441\u0440\u044f_\u0447\u0435\u0442_\u043f\u0435\u0442_\u0441\u044a\u0431'.split(
                    '_'
                ),
            weekdaysMin:
                '\u043d\u0434_\u043f\u043d_\u0432\u0442_\u0441\u0440_\u0447\u0442_\u043f\u0442_\u0441\u0431'.split(
                    '_'
                ),
            longDateFormat: {
                LT: 'H:mm',
                LTS: 'H:mm:ss',
                L: 'D.MM.YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY H:mm',
                LLLL: 'dddd, D MMMM YYYY H:mm',
            },
            calendar: {
                sameDay: '[\u0414\u043d\u0435\u0441 \u0432] LT',
                nextDay: '[\u0423\u0442\u0440\u0435 \u0432] LT',
                nextWeek: 'dddd [\u0432] LT',
                lastDay: '[\u0412\u0447\u0435\u0440\u0430 \u0432] LT',
                lastWeek: function () {
                    switch (this.day()) {
                        case 0:
                        case 3:
                        case 6:
                            return '[\u0412 \u0438\u0437\u043c\u0438\u043d\u0430\u043b\u0430\u0442\u0430] dddd [\u0432] LT';
                        case 1:
                        case 2:
                        case 4:
                        case 5:
                            return '[\u0412 \u0438\u0437\u043c\u0438\u043d\u0430\u043b\u0438\u044f] dddd [\u0432] LT';
                    }
                },
                sameElse: 'L',
            },
            relativeTime: {
                future: '\u0441\u043b\u0435\u0434 %s',
                past: '\u043f\u0440\u0435\u0434\u0438 %s',
                s: '\u043d\u044f\u043a\u043e\u043b\u043a\u043e \u0441\u0435\u043a\u0443\u043d\u0434\u0438',
                ss: '%d \u0441\u0435\u043a\u0443\u043d\u0434\u0438',
                m: '\u043c\u0438\u043d\u0443\u0442\u0430',
                mm: '%d \u043c\u0438\u043d\u0443\u0442\u0438',
                h: '\u0447\u0430\u0441',
                hh: '%d \u0447\u0430\u0441\u0430',
                d: '\u0434\u0435\u043d',
                dd: '%d \u0434\u043d\u0438',
                M: '\u043c\u0435\u0441\u0435\u0446',
                MM: '%d \u043c\u0435\u0441\u0435\u0446\u0430',
                y: '\u0433\u043e\u0434\u0438\u043d\u0430',
                yy: '%d \u0433\u043e\u0434\u0438\u043d\u0438',
            },
            dayOfMonthOrdinalParse:
                /\d{1,2}-(\u0435\u0432|\u0435\u043d|\u0442\u0438|\u0432\u0438|\u0440\u0438|\u043c\u0438)/,
            ordinal: function (e) {
                var a = e % 10,
                    t = e % 100;
                return 0 === e
                    ? e + '-\u0435\u0432'
                    : 0 === t
                    ? e + '-\u0435\u043d'
                    : 10 < t && t < 20
                    ? e + '-\u0442\u0438'
                    : 1 === a
                    ? e + '-\u0432\u0438'
                    : 2 === a
                    ? e + '-\u0440\u0438'
                    : 7 === a || 8 === a
                    ? e + '-\u043c\u0438'
                    : e + '-\u0442\u0438';
            },
            week: { dow: 1, doy: 7 },
        }),
        l.defineLocale('bm', {
            months: 'Zanwuyekalo_Fewuruyekalo_Marisikalo_Awirilikalo_M\u025bkalo_Zuw\u025bnkalo_Zuluyekalo_Utikalo_S\u025btanburukalo_\u0254kut\u0254burukalo_Nowanburukalo_Desanburukalo'.split(
                '_'
            ),
            monthsShort:
                'Zan_Few_Mar_Awi_M\u025b_Zuw_Zul_Uti_S\u025bt_\u0254ku_Now_Des'.split(
                    '_'
                ),
            weekdays:
                'Kari_Nt\u025bn\u025bn_Tarata_Araba_Alamisa_Juma_Sibiri'.split(
                    '_'
                ),
            weekdaysShort: 'Kar_Nt\u025b_Tar_Ara_Ala_Jum_Sib'.split('_'),
            weekdaysMin: 'Ka_Nt_Ta_Ar_Al_Ju_Si'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'MMMM [tile] D [san] YYYY',
                LLL: 'MMMM [tile] D [san] YYYY [l\u025br\u025b] HH:mm',
                LLLL: 'dddd MMMM [tile] D [san] YYYY [l\u025br\u025b] HH:mm',
            },
            calendar: {
                sameDay: '[Bi l\u025br\u025b] LT',
                nextDay: '[Sini l\u025br\u025b] LT',
                nextWeek: 'dddd [don l\u025br\u025b] LT',
                lastDay: '[Kunu l\u025br\u025b] LT',
                lastWeek: 'dddd [t\u025bm\u025bnen l\u025br\u025b] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: '%s k\u0254n\u0254',
                past: 'a b\u025b %s b\u0254',
                s: 'sanga dama dama',
                ss: 'sekondi %d',
                m: 'miniti kelen',
                mm: 'miniti %d',
                h: 'l\u025br\u025b kelen',
                hh: 'l\u025br\u025b %d',
                d: 'tile kelen',
                dd: 'tile %d',
                M: 'kalo kelen',
                MM: 'kalo %d',
                y: 'san kelen',
                yy: 'san %d',
            },
            week: { dow: 1, doy: 4 },
        });
    var os = {
            1: '\u09e7',
            2: '\u09e8',
            3: '\u09e9',
            4: '\u09ea',
            5: '\u09eb',
            6: '\u09ec',
            7: '\u09ed',
            8: '\u09ee',
            9: '\u09ef',
            0: '\u09e6',
        },
        ms = {
            '\u09e7': '1',
            '\u09e8': '2',
            '\u09e9': '3',
            '\u09ea': '4',
            '\u09eb': '5',
            '\u09ec': '6',
            '\u09ed': '7',
            '\u09ee': '8',
            '\u09ef': '9',
            '\u09e6': '0',
        };
    l.defineLocale('bn', {
        months: '\u099c\u09be\u09a8\u09c1\u09df\u09be\u09b0\u09c0_\u09ab\u09c7\u09ac\u09cd\u09b0\u09c1\u09df\u09be\u09b0\u09bf_\u09ae\u09be\u09b0\u09cd\u099a_\u098f\u09aa\u09cd\u09b0\u09bf\u09b2_\u09ae\u09c7_\u099c\u09c1\u09a8_\u099c\u09c1\u09b2\u09be\u0987_\u0986\u0997\u09b8\u09cd\u099f_\u09b8\u09c7\u09aa\u09cd\u099f\u09c7\u09ae\u09cd\u09ac\u09b0_\u0985\u0995\u09cd\u099f\u09cb\u09ac\u09b0_\u09a8\u09ad\u09c7\u09ae\u09cd\u09ac\u09b0_\u09a1\u09bf\u09b8\u09c7\u09ae\u09cd\u09ac\u09b0'.split(
            '_'
        ),
        monthsShort:
            '\u099c\u09be\u09a8\u09c1_\u09ab\u09c7\u09ac_\u09ae\u09be\u09b0\u09cd\u099a_\u098f\u09aa\u09cd\u09b0_\u09ae\u09c7_\u099c\u09c1\u09a8_\u099c\u09c1\u09b2_\u0986\u0997_\u09b8\u09c7\u09aa\u09cd\u099f_\u0985\u0995\u09cd\u099f\u09cb_\u09a8\u09ad\u09c7_\u09a1\u09bf\u09b8\u09c7'.split(
                '_'
            ),
        weekdays:
            '\u09b0\u09ac\u09bf\u09ac\u09be\u09b0_\u09b8\u09cb\u09ae\u09ac\u09be\u09b0_\u09ae\u0999\u09cd\u0997\u09b2\u09ac\u09be\u09b0_\u09ac\u09c1\u09a7\u09ac\u09be\u09b0_\u09ac\u09c3\u09b9\u09b8\u09cd\u09aa\u09a4\u09bf\u09ac\u09be\u09b0_\u09b6\u09c1\u0995\u09cd\u09b0\u09ac\u09be\u09b0_\u09b6\u09a8\u09bf\u09ac\u09be\u09b0'.split(
                '_'
            ),
        weekdaysShort:
            '\u09b0\u09ac\u09bf_\u09b8\u09cb\u09ae_\u09ae\u0999\u09cd\u0997\u09b2_\u09ac\u09c1\u09a7_\u09ac\u09c3\u09b9\u09b8\u09cd\u09aa\u09a4\u09bf_\u09b6\u09c1\u0995\u09cd\u09b0_\u09b6\u09a8\u09bf'.split(
                '_'
            ),
        weekdaysMin:
            '\u09b0\u09ac\u09bf_\u09b8\u09cb\u09ae_\u09ae\u0999\u09cd\u0997_\u09ac\u09c1\u09a7_\u09ac\u09c3\u09b9\u0983_\u09b6\u09c1\u0995\u09cd\u09b0_\u09b6\u09a8\u09bf'.split(
                '_'
            ),
        longDateFormat: {
            LT: 'A h:mm \u09b8\u09ae\u09df',
            LTS: 'A h:mm:ss \u09b8\u09ae\u09df',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY, A h:mm \u09b8\u09ae\u09df',
            LLLL: 'dddd, D MMMM YYYY, A h:mm \u09b8\u09ae\u09df',
        },
        calendar: {
            sameDay: '[\u0986\u099c] LT',
            nextDay: '[\u0986\u0997\u09be\u09ae\u09c0\u0995\u09be\u09b2] LT',
            nextWeek: 'dddd, LT',
            lastDay: '[\u0997\u09a4\u0995\u09be\u09b2] LT',
            lastWeek: '[\u0997\u09a4] dddd, LT',
            sameElse: 'L',
        },
        relativeTime: {
            future: '%s \u09aa\u09b0\u09c7',
            past: '%s \u0986\u0997\u09c7',
            s: '\u0995\u09df\u09c7\u0995 \u09b8\u09c7\u0995\u09c7\u09a8\u09cd\u09a1',
            ss: '%d \u09b8\u09c7\u0995\u09c7\u09a8\u09cd\u09a1',
            m: '\u098f\u0995 \u09ae\u09bf\u09a8\u09bf\u099f',
            mm: '%d \u09ae\u09bf\u09a8\u09bf\u099f',
            h: '\u098f\u0995 \u0998\u09a8\u09cd\u099f\u09be',
            hh: '%d \u0998\u09a8\u09cd\u099f\u09be',
            d: '\u098f\u0995 \u09a6\u09bf\u09a8',
            dd: '%d \u09a6\u09bf\u09a8',
            M: '\u098f\u0995 \u09ae\u09be\u09b8',
            MM: '%d \u09ae\u09be\u09b8',
            y: '\u098f\u0995 \u09ac\u099b\u09b0',
            yy: '%d \u09ac\u099b\u09b0',
        },
        preparse: function (e) {
            return e.replace(
                /[\u09e7\u09e8\u09e9\u09ea\u09eb\u09ec\u09ed\u09ee\u09ef\u09e6]/g,
                function (e) {
                    return ms[e];
                }
            );
        },
        postformat: function (e) {
            return e.replace(/\d/g, function (e) {
                return os[e];
            });
        },
        meridiemParse:
            /\u09b0\u09be\u09a4|\u09b8\u0995\u09be\u09b2|\u09a6\u09c1\u09aa\u09c1\u09b0|\u09ac\u09bf\u0995\u09be\u09b2|\u09b0\u09be\u09a4/,
        meridiemHour: function (e, a) {
            return (
                12 === e && (e = 0),
                ('\u09b0\u09be\u09a4' === a && 4 <= e) ||
                ('\u09a6\u09c1\u09aa\u09c1\u09b0' === a && e < 5) ||
                '\u09ac\u09bf\u0995\u09be\u09b2' === a
                    ? e + 12
                    : e
            );
        },
        meridiem: function (e, a, t) {
            return e < 4
                ? '\u09b0\u09be\u09a4'
                : e < 10
                ? '\u09b8\u0995\u09be\u09b2'
                : e < 17
                ? '\u09a6\u09c1\u09aa\u09c1\u09b0'
                : e < 20
                ? '\u09ac\u09bf\u0995\u09be\u09b2'
                : '\u09b0\u09be\u09a4';
        },
        week: { dow: 0, doy: 6 },
    });
    var us = {
            1: '\u0f21',
            2: '\u0f22',
            3: '\u0f23',
            4: '\u0f24',
            5: '\u0f25',
            6: '\u0f26',
            7: '\u0f27',
            8: '\u0f28',
            9: '\u0f29',
            0: '\u0f20',
        },
        ls = {
            '\u0f21': '1',
            '\u0f22': '2',
            '\u0f23': '3',
            '\u0f24': '4',
            '\u0f25': '5',
            '\u0f26': '6',
            '\u0f27': '7',
            '\u0f28': '8',
            '\u0f29': '9',
            '\u0f20': '0',
        };
    function Ms(e, a, t) {
        var s, n, d;
        return (
            e +
            ' ' +
            ((s = { mm: 'munutenn', MM: 'miz', dd: 'devezh' }[t]),
            2 !== e
                ? s
                : void 0 !== (d = { m: 'v', b: 'v', d: 'z' })[(n = s).charAt(0)]
                ? d[n.charAt(0)] + n.substring(1)
                : n)
        );
    }
    function hs(e, a, t) {
        var s = e + ' ';
        switch (t) {
            case 'ss':
                return (s +=
                    1 === e
                        ? 'sekunda'
                        : 2 === e || 3 === e || 4 === e
                        ? 'sekunde'
                        : 'sekundi');
            case 'm':
                return a ? 'jedna minuta' : 'jedne minute';
            case 'mm':
                return (s +=
                    1 === e
                        ? 'minuta'
                        : 2 === e || 3 === e || 4 === e
                        ? 'minute'
                        : 'minuta');
            case 'h':
                return a ? 'jedan sat' : 'jednog sata';
            case 'hh':
                return (s +=
                    1 === e
                        ? 'sat'
                        : 2 === e || 3 === e || 4 === e
                        ? 'sata'
                        : 'sati');
            case 'dd':
                return (s += 1 === e ? 'dan' : 'dana');
            case 'MM':
                return (s +=
                    1 === e
                        ? 'mjesec'
                        : 2 === e || 3 === e || 4 === e
                        ? 'mjeseca'
                        : 'mjeseci');
            case 'yy':
                return (s +=
                    1 === e
                        ? 'godina'
                        : 2 === e || 3 === e || 4 === e
                        ? 'godine'
                        : 'godina');
        }
    }
    l.defineLocale('bo', {
        months: '\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f51\u0f44\u0f0b\u0f54\u0f7c_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f42\u0f49\u0f72\u0f66\u0f0b\u0f54_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f42\u0f66\u0f74\u0f58\u0f0b\u0f54_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f56\u0f5e\u0f72\u0f0b\u0f54_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f63\u0f94\u0f0b\u0f54_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f51\u0fb2\u0f74\u0f42\u0f0b\u0f54_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f56\u0f51\u0f74\u0f53\u0f0b\u0f54_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f56\u0f62\u0f92\u0fb1\u0f51\u0f0b\u0f54_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f51\u0f42\u0f74\u0f0b\u0f54_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f56\u0f45\u0f74\u0f0b\u0f54_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f56\u0f45\u0f74\u0f0b\u0f42\u0f45\u0f72\u0f42\u0f0b\u0f54_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f56\u0f45\u0f74\u0f0b\u0f42\u0f49\u0f72\u0f66\u0f0b\u0f54'.split(
            '_'
        ),
        monthsShort:
            '\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f51\u0f44\u0f0b\u0f54\u0f7c_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f42\u0f49\u0f72\u0f66\u0f0b\u0f54_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f42\u0f66\u0f74\u0f58\u0f0b\u0f54_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f56\u0f5e\u0f72\u0f0b\u0f54_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f63\u0f94\u0f0b\u0f54_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f51\u0fb2\u0f74\u0f42\u0f0b\u0f54_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f56\u0f51\u0f74\u0f53\u0f0b\u0f54_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f56\u0f62\u0f92\u0fb1\u0f51\u0f0b\u0f54_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f51\u0f42\u0f74\u0f0b\u0f54_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f56\u0f45\u0f74\u0f0b\u0f54_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f56\u0f45\u0f74\u0f0b\u0f42\u0f45\u0f72\u0f42\u0f0b\u0f54_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f56\u0f45\u0f74\u0f0b\u0f42\u0f49\u0f72\u0f66\u0f0b\u0f54'.split(
                '_'
            ),
        weekdays:
            '\u0f42\u0f5f\u0f60\u0f0b\u0f49\u0f72\u0f0b\u0f58\u0f0b_\u0f42\u0f5f\u0f60\u0f0b\u0f5f\u0fb3\u0f0b\u0f56\u0f0b_\u0f42\u0f5f\u0f60\u0f0b\u0f58\u0f72\u0f42\u0f0b\u0f51\u0f58\u0f62\u0f0b_\u0f42\u0f5f\u0f60\u0f0b\u0f63\u0fb7\u0f42\u0f0b\u0f54\u0f0b_\u0f42\u0f5f\u0f60\u0f0b\u0f55\u0f74\u0f62\u0f0b\u0f56\u0f74_\u0f42\u0f5f\u0f60\u0f0b\u0f54\u0f0b\u0f66\u0f44\u0f66\u0f0b_\u0f42\u0f5f\u0f60\u0f0b\u0f66\u0fa4\u0f7a\u0f53\u0f0b\u0f54\u0f0b'.split(
                '_'
            ),
        weekdaysShort:
            '\u0f49\u0f72\u0f0b\u0f58\u0f0b_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b_\u0f58\u0f72\u0f42\u0f0b\u0f51\u0f58\u0f62\u0f0b_\u0f63\u0fb7\u0f42\u0f0b\u0f54\u0f0b_\u0f55\u0f74\u0f62\u0f0b\u0f56\u0f74_\u0f54\u0f0b\u0f66\u0f44\u0f66\u0f0b_\u0f66\u0fa4\u0f7a\u0f53\u0f0b\u0f54\u0f0b'.split(
                '_'
            ),
        weekdaysMin:
            '\u0f49\u0f72\u0f0b\u0f58\u0f0b_\u0f5f\u0fb3\u0f0b\u0f56\u0f0b_\u0f58\u0f72\u0f42\u0f0b\u0f51\u0f58\u0f62\u0f0b_\u0f63\u0fb7\u0f42\u0f0b\u0f54\u0f0b_\u0f55\u0f74\u0f62\u0f0b\u0f56\u0f74_\u0f54\u0f0b\u0f66\u0f44\u0f66\u0f0b_\u0f66\u0fa4\u0f7a\u0f53\u0f0b\u0f54\u0f0b'.split(
                '_'
            ),
        longDateFormat: {
            LT: 'A h:mm',
            LTS: 'A h:mm:ss',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY, A h:mm',
            LLLL: 'dddd, D MMMM YYYY, A h:mm',
        },
        calendar: {
            sameDay: '[\u0f51\u0f72\u0f0b\u0f62\u0f72\u0f44] LT',
            nextDay: '[\u0f66\u0f44\u0f0b\u0f49\u0f72\u0f53] LT',
            nextWeek:
                '[\u0f56\u0f51\u0f74\u0f53\u0f0b\u0f55\u0fb2\u0f42\u0f0b\u0f62\u0f97\u0f7a\u0f66\u0f0b\u0f58], LT',
            lastDay: '[\u0f41\u0f0b\u0f66\u0f44] LT',
            lastWeek:
                '[\u0f56\u0f51\u0f74\u0f53\u0f0b\u0f55\u0fb2\u0f42\u0f0b\u0f58\u0f50\u0f60\u0f0b\u0f58] dddd, LT',
            sameElse: 'L',
        },
        relativeTime: {
            future: '%s \u0f63\u0f0b',
            past: '%s \u0f66\u0f94\u0f53\u0f0b\u0f63',
            s: '\u0f63\u0f58\u0f0b\u0f66\u0f44',
            ss: '%d \u0f66\u0f90\u0f62\u0f0b\u0f46\u0f0d',
            m: '\u0f66\u0f90\u0f62\u0f0b\u0f58\u0f0b\u0f42\u0f45\u0f72\u0f42',
            mm: '%d \u0f66\u0f90\u0f62\u0f0b\u0f58',
            h: '\u0f46\u0f74\u0f0b\u0f5a\u0f7c\u0f51\u0f0b\u0f42\u0f45\u0f72\u0f42',
            hh: '%d \u0f46\u0f74\u0f0b\u0f5a\u0f7c\u0f51',
            d: '\u0f49\u0f72\u0f53\u0f0b\u0f42\u0f45\u0f72\u0f42',
            dd: '%d \u0f49\u0f72\u0f53\u0f0b',
            M: '\u0f5f\u0fb3\u0f0b\u0f56\u0f0b\u0f42\u0f45\u0f72\u0f42',
            MM: '%d \u0f5f\u0fb3\u0f0b\u0f56',
            y: '\u0f63\u0f7c\u0f0b\u0f42\u0f45\u0f72\u0f42',
            yy: '%d \u0f63\u0f7c',
        },
        preparse: function (e) {
            return e.replace(
                /[\u0f21\u0f22\u0f23\u0f24\u0f25\u0f26\u0f27\u0f28\u0f29\u0f20]/g,
                function (e) {
                    return ls[e];
                }
            );
        },
        postformat: function (e) {
            return e.replace(/\d/g, function (e) {
                return us[e];
            });
        },
        meridiemParse:
            /\u0f58\u0f5a\u0f53\u0f0b\u0f58\u0f7c|\u0f5e\u0f7c\u0f42\u0f66\u0f0b\u0f40\u0f66|\u0f49\u0f72\u0f53\u0f0b\u0f42\u0f74\u0f44|\u0f51\u0f42\u0f7c\u0f44\u0f0b\u0f51\u0f42|\u0f58\u0f5a\u0f53\u0f0b\u0f58\u0f7c/,
        meridiemHour: function (e, a) {
            return (
                12 === e && (e = 0),
                ('\u0f58\u0f5a\u0f53\u0f0b\u0f58\u0f7c' === a && 4 <= e) ||
                ('\u0f49\u0f72\u0f53\u0f0b\u0f42\u0f74\u0f44' === a && e < 5) ||
                '\u0f51\u0f42\u0f7c\u0f44\u0f0b\u0f51\u0f42' === a
                    ? e + 12
                    : e
            );
        },
        meridiem: function (e, a, t) {
            return e < 4
                ? '\u0f58\u0f5a\u0f53\u0f0b\u0f58\u0f7c'
                : e < 10
                ? '\u0f5e\u0f7c\u0f42\u0f66\u0f0b\u0f40\u0f66'
                : e < 17
                ? '\u0f49\u0f72\u0f53\u0f0b\u0f42\u0f74\u0f44'
                : e < 20
                ? '\u0f51\u0f42\u0f7c\u0f44\u0f0b\u0f51\u0f42'
                : '\u0f58\u0f5a\u0f53\u0f0b\u0f58\u0f7c';
        },
        week: { dow: 0, doy: 6 },
    }),
        l.defineLocale('br', {
            months: "Genver_C'hwevrer_Meurzh_Ebrel_Mae_Mezheven_Gouere_Eost_Gwengolo_Here_Du_Kerzu".split(
                '_'
            ),
            monthsShort:
                "Gen_C'hwe_Meu_Ebr_Mae_Eve_Gou_Eos_Gwe_Her_Du_Ker".split('_'),
            weekdays: "Sul_Lun_Meurzh_Merc'her_Yaou_Gwener_Sadorn".split('_'),
            weekdaysShort: 'Sul_Lun_Meu_Mer_Yao_Gwe_Sad'.split('_'),
            weekdaysMin: 'Su_Lu_Me_Mer_Ya_Gw_Sa'.split('_'),
            weekdaysParseExact: !0,
            longDateFormat: {
                LT: 'h[e]mm A',
                LTS: 'h[e]mm:ss A',
                L: 'DD/MM/YYYY',
                LL: 'D [a viz] MMMM YYYY',
                LLL: 'D [a viz] MMMM YYYY h[e]mm A',
                LLLL: 'dddd, D [a viz] MMMM YYYY h[e]mm A',
            },
            calendar: {
                sameDay: '[Hiziv da] LT',
                nextDay: "[Warc'hoazh da] LT",
                nextWeek: 'dddd [da] LT',
                lastDay: "[Dec'h da] LT",
                lastWeek: 'dddd [paset da] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: 'a-benn %s',
                past: "%s 'zo",
                s: 'un nebeud segondenno\xf9',
                ss: '%d eilenn',
                m: 'ur vunutenn',
                mm: Ms,
                h: 'un eur',
                hh: '%d eur',
                d: 'un devezh',
                dd: Ms,
                M: 'ur miz',
                MM: Ms,
                y: 'ur bloaz',
                yy: function (e) {
                    switch (
                        (function e(a) {
                            return 9 < a ? e(a % 10) : a;
                        })(e)
                    ) {
                        case 1:
                        case 3:
                        case 4:
                        case 5:
                        case 9:
                            return e + ' bloaz';
                        default:
                            return e + ' vloaz';
                    }
                },
            },
            dayOfMonthOrdinalParse: /\d{1,2}(a\xf1|vet)/,
            ordinal: function (e) {
                return e + (1 === e ? 'a\xf1' : 'vet');
            },
            week: { dow: 1, doy: 4 },
        }),
        l.defineLocale('bs', {
            months: 'januar_februar_mart_april_maj_juni_juli_august_septembar_oktobar_novembar_decembar'.split(
                '_'
            ),
            monthsShort:
                'jan._feb._mar._apr._maj._jun._jul._aug._sep._okt._nov._dec.'.split(
                    '_'
                ),
            monthsParseExact: !0,
            weekdays:
                'nedjelja_ponedjeljak_utorak_srijeda_\u010detvrtak_petak_subota'.split(
                    '_'
                ),
            weekdaysShort: 'ned._pon._uto._sri._\u010det._pet._sub.'.split('_'),
            weekdaysMin: 'ne_po_ut_sr_\u010de_pe_su'.split('_'),
            weekdaysParseExact: !0,
            longDateFormat: {
                LT: 'H:mm',
                LTS: 'H:mm:ss',
                L: 'DD.MM.YYYY',
                LL: 'D. MMMM YYYY',
                LLL: 'D. MMMM YYYY H:mm',
                LLLL: 'dddd, D. MMMM YYYY H:mm',
            },
            calendar: {
                sameDay: '[danas u] LT',
                nextDay: '[sutra u] LT',
                nextWeek: function () {
                    switch (this.day()) {
                        case 0:
                            return '[u] [nedjelju] [u] LT';
                        case 3:
                            return '[u] [srijedu] [u] LT';
                        case 6:
                            return '[u] [subotu] [u] LT';
                        case 1:
                        case 2:
                        case 4:
                        case 5:
                            return '[u] dddd [u] LT';
                    }
                },
                lastDay: '[ju\u010der u] LT',
                lastWeek: function () {
                    switch (this.day()) {
                        case 0:
                        case 3:
                            return '[pro\u0161lu] dddd [u] LT';
                        case 6:
                            return '[pro\u0161le] [subote] [u] LT';
                        case 1:
                        case 2:
                        case 4:
                        case 5:
                            return '[pro\u0161li] dddd [u] LT';
                    }
                },
                sameElse: 'L',
            },
            relativeTime: {
                future: 'za %s',
                past: 'prije %s',
                s: 'par sekundi',
                ss: hs,
                m: hs,
                mm: hs,
                h: hs,
                hh: hs,
                d: 'dan',
                dd: hs,
                M: 'mjesec',
                MM: hs,
                y: 'godinu',
                yy: hs,
            },
            dayOfMonthOrdinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: { dow: 1, doy: 7 },
        }),
        l.defineLocale('ca', {
            months: {
                standalone:
                    'gener_febrer_mar\xe7_abril_maig_juny_juliol_agost_setembre_octubre_novembre_desembre'.split(
                        '_'
                    ),
                format: "de gener_de febrer_de mar\xe7_d'abril_de maig_de juny_de juliol_d'agost_de setembre_d'octubre_de novembre_de desembre".split(
                    '_'
                ),
                isFormat: /D[oD]?(\s)+MMMM/,
            },
            monthsShort:
                'gen._febr._mar\xe7_abr._maig_juny_jul._ag._set._oct._nov._des.'.split(
                    '_'
                ),
            monthsParseExact: !0,
            weekdays:
                'diumenge_dilluns_dimarts_dimecres_dijous_divendres_dissabte'.split(
                    '_'
                ),
            weekdaysShort: 'dg._dl._dt._dc._dj._dv._ds.'.split('_'),
            weekdaysMin: 'dg_dl_dt_dc_dj_dv_ds'.split('_'),
            weekdaysParseExact: !0,
            longDateFormat: {
                LT: 'H:mm',
                LTS: 'H:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM [de] YYYY',
                ll: 'D MMM YYYY',
                LLL: 'D MMMM [de] YYYY [a les] H:mm',
                lll: 'D MMM YYYY, H:mm',
                LLLL: 'dddd D MMMM [de] YYYY [a les] H:mm',
                llll: 'ddd D MMM YYYY, H:mm',
            },
            calendar: {
                sameDay: function () {
                    return (
                        '[avui a ' +
                        (1 !== this.hours() ? 'les' : 'la') +
                        '] LT'
                    );
                },
                nextDay: function () {
                    return (
                        '[dem\xe0 a ' +
                        (1 !== this.hours() ? 'les' : 'la') +
                        '] LT'
                    );
                },
                nextWeek: function () {
                    return (
                        'dddd [a ' +
                        (1 !== this.hours() ? 'les' : 'la') +
                        '] LT'
                    );
                },
                lastDay: function () {
                    return (
                        '[ahir a ' +
                        (1 !== this.hours() ? 'les' : 'la') +
                        '] LT'
                    );
                },
                lastWeek: function () {
                    return (
                        '[el] dddd [passat a ' +
                        (1 !== this.hours() ? 'les' : 'la') +
                        '] LT'
                    );
                },
                sameElse: 'L',
            },
            relativeTime: {
                future: "d'aqu\xed %s",
                past: 'fa %s',
                s: 'uns segons',
                ss: '%d segons',
                m: 'un minut',
                mm: '%d minuts',
                h: 'una hora',
                hh: '%d hores',
                d: 'un dia',
                dd: '%d dies',
                M: 'un mes',
                MM: '%d mesos',
                y: 'un any',
                yy: '%d anys',
            },
            dayOfMonthOrdinalParse: /\d{1,2}(r|n|t|\xe8|a)/,
            ordinal: function (e, a) {
                var t =
                    1 === e
                        ? 'r'
                        : 2 === e
                        ? 'n'
                        : 3 === e
                        ? 'r'
                        : 4 === e
                        ? 't'
                        : '\xe8';
                return ('w' !== a && 'W' !== a) || (t = 'a'), e + t;
            },
            week: { dow: 1, doy: 4 },
        });
    var Ls =
            'leden_\xfanor_b\u0159ezen_duben_kv\u011bten_\u010derven_\u010dervenec_srpen_z\xe1\u0159\xed_\u0159\xedjen_listopad_prosinec'.split(
                '_'
            ),
        cs =
            'led_\xfano_b\u0159e_dub_kv\u011b_\u010dvn_\u010dvc_srp_z\xe1\u0159_\u0159\xedj_lis_pro'.split(
                '_'
            ),
        Ys = [
            /^led/i,
            /^\xfano/i,
            /^b\u0159e/i,
            /^dub/i,
            /^kv\u011b/i,
            /^(\u010dvn|\u010derven$|\u010dervna)/i,
            /^(\u010dvc|\u010dervenec|\u010dervence)/i,
            /^srp/i,
            /^z\xe1\u0159/i,
            /^\u0159\xedj/i,
            /^lis/i,
            /^pro/i,
        ],
        ys =
            /^(leden|\xfanor|b\u0159ezen|duben|kv\u011bten|\u010dervenec|\u010dervence|\u010derven|\u010dervna|srpen|z\xe1\u0159\xed|\u0159\xedjen|listopad|prosinec|led|\xfano|b\u0159e|dub|kv\u011b|\u010dvn|\u010dvc|srp|z\xe1\u0159|\u0159\xedj|lis|pro)/i;
    function fs(e) {
        return 1 < e && e < 5 && 1 != ~~(e / 10);
    }
    function ks(e, a, t, s) {
        var n = e + ' ';
        switch (t) {
            case 's':
                return a || s ? 'p\xe1r sekund' : 'p\xe1r sekundami';
            case 'ss':
                return a || s
                    ? n + (fs(e) ? 'sekundy' : 'sekund')
                    : n + 'sekundami';
                break;
            case 'm':
                return a ? 'minuta' : s ? 'minutu' : 'minutou';
            case 'mm':
                return a || s
                    ? n + (fs(e) ? 'minuty' : 'minut')
                    : n + 'minutami';
                break;
            case 'h':
                return a ? 'hodina' : s ? 'hodinu' : 'hodinou';
            case 'hh':
                return a || s
                    ? n + (fs(e) ? 'hodiny' : 'hodin')
                    : n + 'hodinami';
                break;
            case 'd':
                return a || s ? 'den' : 'dnem';
            case 'dd':
                return a || s ? n + (fs(e) ? 'dny' : 'dn\xed') : n + 'dny';
                break;
            case 'M':
                return a || s ? 'm\u011bs\xedc' : 'm\u011bs\xedcem';
            case 'MM':
                return a || s
                    ? n + (fs(e) ? 'm\u011bs\xedce' : 'm\u011bs\xedc\u016f')
                    : n + 'm\u011bs\xedci';
                break;
            case 'y':
                return a || s ? 'rok' : 'rokem';
            case 'yy':
                return a || s ? n + (fs(e) ? 'roky' : 'let') : n + 'lety';
                break;
        }
    }
    function ps(e, a, t, s) {
        var n = {
            m: ['eine Minute', 'einer Minute'],
            h: ['eine Stunde', 'einer Stunde'],
            d: ['ein Tag', 'einem Tag'],
            dd: [e + ' Tage', e + ' Tagen'],
            M: ['ein Monat', 'einem Monat'],
            MM: [e + ' Monate', e + ' Monaten'],
            y: ['ein Jahr', 'einem Jahr'],
            yy: [e + ' Jahre', e + ' Jahren'],
        };
        return a ? n[t][0] : n[t][1];
    }
    function Ds(e, a, t, s) {
        var n = {
            m: ['eine Minute', 'einer Minute'],
            h: ['eine Stunde', 'einer Stunde'],
            d: ['ein Tag', 'einem Tag'],
            dd: [e + ' Tage', e + ' Tagen'],
            M: ['ein Monat', 'einem Monat'],
            MM: [e + ' Monate', e + ' Monaten'],
            y: ['ein Jahr', 'einem Jahr'],
            yy: [e + ' Jahre', e + ' Jahren'],
        };
        return a ? n[t][0] : n[t][1];
    }
    function Ts(e, a, t, s) {
        var n = {
            m: ['eine Minute', 'einer Minute'],
            h: ['eine Stunde', 'einer Stunde'],
            d: ['ein Tag', 'einem Tag'],
            dd: [e + ' Tage', e + ' Tagen'],
            M: ['ein Monat', 'einem Monat'],
            MM: [e + ' Monate', e + ' Monaten'],
            y: ['ein Jahr', 'einem Jahr'],
            yy: [e + ' Jahre', e + ' Jahren'],
        };
        return a ? n[t][0] : n[t][1];
    }
    l.defineLocale('cs', {
        months: Ls,
        monthsShort: cs,
        monthsRegex: ys,
        monthsShortRegex: ys,
        monthsStrictRegex:
            /^(leden|ledna|\xfanora|\xfanor|b\u0159ezen|b\u0159ezna|duben|dubna|kv\u011bten|kv\u011btna|\u010dervenec|\u010dervence|\u010derven|\u010dervna|srpen|srpna|z\xe1\u0159\xed|\u0159\xedjen|\u0159\xedjna|listopadu|listopad|prosinec|prosince)/i,
        monthsShortStrictRegex:
            /^(led|\xfano|b\u0159e|dub|kv\u011b|\u010dvn|\u010dvc|srp|z\xe1\u0159|\u0159\xedj|lis|pro)/i,
        monthsParse: Ys,
        longMonthsParse: Ys,
        shortMonthsParse: Ys,
        weekdays:
            'ned\u011ble_pond\u011bl\xed_\xfater\xfd_st\u0159eda_\u010dtvrtek_p\xe1tek_sobota'.split(
                '_'
            ),
        weekdaysShort: 'ne_po_\xfat_st_\u010dt_p\xe1_so'.split('_'),
        weekdaysMin: 'ne_po_\xfat_st_\u010dt_p\xe1_so'.split('_'),
        longDateFormat: {
            LT: 'H:mm',
            LTS: 'H:mm:ss',
            L: 'DD.MM.YYYY',
            LL: 'D. MMMM YYYY',
            LLL: 'D. MMMM YYYY H:mm',
            LLLL: 'dddd D. MMMM YYYY H:mm',
            l: 'D. M. YYYY',
        },
        calendar: {
            sameDay: '[dnes v] LT',
            nextDay: '[z\xedtra v] LT',
            nextWeek: function () {
                switch (this.day()) {
                    case 0:
                        return '[v ned\u011bli v] LT';
                    case 1:
                    case 2:
                        return '[v] dddd [v] LT';
                    case 3:
                        return '[ve st\u0159edu v] LT';
                    case 4:
                        return '[ve \u010dtvrtek v] LT';
                    case 5:
                        return '[v p\xe1tek v] LT';
                    case 6:
                        return '[v sobotu v] LT';
                }
            },
            lastDay: '[v\u010dera v] LT',
            lastWeek: function () {
                switch (this.day()) {
                    case 0:
                        return '[minulou ned\u011bli v] LT';
                    case 1:
                    case 2:
                        return '[minul\xe9] dddd [v] LT';
                    case 3:
                        return '[minulou st\u0159edu v] LT';
                    case 4:
                    case 5:
                        return '[minul\xfd] dddd [v] LT';
                    case 6:
                        return '[minulou sobotu v] LT';
                }
            },
            sameElse: 'L',
        },
        relativeTime: {
            future: 'za %s',
            past: 'p\u0159ed %s',
            s: ks,
            ss: ks,
            m: ks,
            mm: ks,
            h: ks,
            hh: ks,
            d: ks,
            dd: ks,
            M: ks,
            MM: ks,
            y: ks,
            yy: ks,
        },
        dayOfMonthOrdinalParse: /\d{1,2}\./,
        ordinal: '%d.',
        week: { dow: 1, doy: 4 },
    }),
        l.defineLocale('cv', {
            months: '\u043a\u04d1\u0440\u043b\u0430\u0447_\u043d\u0430\u0440\u04d1\u0441_\u043f\u0443\u0448_\u0430\u043a\u0430_\u043c\u0430\u0439_\u04ab\u04d7\u0440\u0442\u043c\u0435_\u0443\u0442\u04d1_\u04ab\u0443\u0440\u043b\u0430_\u0430\u0432\u04d1\u043d_\u044e\u043f\u0430_\u0447\u04f3\u043a_\u0440\u0430\u0448\u0442\u0430\u0432'.split(
                '_'
            ),
            monthsShort:
                '\u043a\u04d1\u0440_\u043d\u0430\u0440_\u043f\u0443\u0448_\u0430\u043a\u0430_\u043c\u0430\u0439_\u04ab\u04d7\u0440_\u0443\u0442\u04d1_\u04ab\u0443\u0440_\u0430\u0432\u043d_\u044e\u043f\u0430_\u0447\u04f3\u043a_\u0440\u0430\u0448'.split(
                    '_'
                ),
            weekdays:
                '\u0432\u044b\u0440\u0441\u0430\u0440\u043d\u0438\u043a\u0443\u043d_\u0442\u0443\u043d\u0442\u0438\u043a\u0443\u043d_\u044b\u0442\u043b\u0430\u0440\u0438\u043a\u0443\u043d_\u044e\u043d\u043a\u0443\u043d_\u043a\u04d7\u04ab\u043d\u0435\u0440\u043d\u0438\u043a\u0443\u043d_\u044d\u0440\u043d\u0435\u043a\u0443\u043d_\u0448\u04d1\u043c\u0430\u0442\u043a\u0443\u043d'.split(
                    '_'
                ),
            weekdaysShort:
                '\u0432\u044b\u0440_\u0442\u0443\u043d_\u044b\u0442\u043b_\u044e\u043d_\u043a\u04d7\u04ab_\u044d\u0440\u043d_\u0448\u04d1\u043c'.split(
                    '_'
                ),
            weekdaysMin:
                '\u0432\u0440_\u0442\u043d_\u044b\u0442_\u044e\u043d_\u043a\u04ab_\u044d\u0440_\u0448\u043c'.split(
                    '_'
                ),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD-MM-YYYY',
                LL: 'YYYY [\u04ab\u0443\u043b\u0445\u0438] MMMM [\u0443\u0439\u04d1\u0445\u04d7\u043d] D[-\u043c\u04d7\u0448\u04d7]',
                LLL: 'YYYY [\u04ab\u0443\u043b\u0445\u0438] MMMM [\u0443\u0439\u04d1\u0445\u04d7\u043d] D[-\u043c\u04d7\u0448\u04d7], HH:mm',
                LLLL: 'dddd, YYYY [\u04ab\u0443\u043b\u0445\u0438] MMMM [\u0443\u0439\u04d1\u0445\u04d7\u043d] D[-\u043c\u04d7\u0448\u04d7], HH:mm',
            },
            calendar: {
                sameDay:
                    '[\u041f\u0430\u044f\u043d] LT [\u0441\u0435\u0445\u0435\u0442\u0440\u0435]',
                nextDay:
                    '[\u042b\u0440\u0430\u043d] LT [\u0441\u0435\u0445\u0435\u0442\u0440\u0435]',
                lastDay:
                    '[\u04d6\u043d\u0435\u0440] LT [\u0441\u0435\u0445\u0435\u0442\u0440\u0435]',
                nextWeek:
                    '[\u04aa\u0438\u0442\u0435\u0441] dddd LT [\u0441\u0435\u0445\u0435\u0442\u0440\u0435]',
                lastWeek:
                    '[\u0418\u0440\u0442\u043d\u04d7] dddd LT [\u0441\u0435\u0445\u0435\u0442\u0440\u0435]',
                sameElse: 'L',
            },
            relativeTime: {
                future: function (e) {
                    return (
                        e +
                        (/\u0441\u0435\u0445\u0435\u0442$/i.exec(e)
                            ? '\u0440\u0435\u043d'
                            : /\u04ab\u0443\u043b$/i.exec(e)
                            ? '\u0442\u0430\u043d'
                            : '\u0440\u0430\u043d')
                    );
                },
                past: '%s \u043a\u0430\u044f\u043b\u043b\u0430',
                s: '\u043f\u04d7\u0440-\u0438\u043a \u04ab\u0435\u043a\u043a\u0443\u043d\u0442',
                ss: '%d \u04ab\u0435\u043a\u043a\u0443\u043d\u0442',
                m: '\u043f\u04d7\u0440 \u043c\u0438\u043d\u0443\u0442',
                mm: '%d \u043c\u0438\u043d\u0443\u0442',
                h: '\u043f\u04d7\u0440 \u0441\u0435\u0445\u0435\u0442',
                hh: '%d \u0441\u0435\u0445\u0435\u0442',
                d: '\u043f\u04d7\u0440 \u043a\u0443\u043d',
                dd: '%d \u043a\u0443\u043d',
                M: '\u043f\u04d7\u0440 \u0443\u0439\u04d1\u0445',
                MM: '%d \u0443\u0439\u04d1\u0445',
                y: '\u043f\u04d7\u0440 \u04ab\u0443\u043b',
                yy: '%d \u04ab\u0443\u043b',
            },
            dayOfMonthOrdinalParse: /\d{1,2}-\u043c\u04d7\u0448/,
            ordinal: '%d-\u043c\u04d7\u0448',
            week: { dow: 1, doy: 7 },
        }),
        l.defineLocale('cy', {
            months: 'Ionawr_Chwefror_Mawrth_Ebrill_Mai_Mehefin_Gorffennaf_Awst_Medi_Hydref_Tachwedd_Rhagfyr'.split(
                '_'
            ),
            monthsShort:
                'Ion_Chwe_Maw_Ebr_Mai_Meh_Gor_Aws_Med_Hyd_Tach_Rhag'.split('_'),
            weekdays:
                'Dydd Sul_Dydd Llun_Dydd Mawrth_Dydd Mercher_Dydd Iau_Dydd Gwener_Dydd Sadwrn'.split(
                    '_'
                ),
            weekdaysShort: 'Sul_Llun_Maw_Mer_Iau_Gwe_Sad'.split('_'),
            weekdaysMin: 'Su_Ll_Ma_Me_Ia_Gw_Sa'.split('_'),
            weekdaysParseExact: !0,
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd, D MMMM YYYY HH:mm',
            },
            calendar: {
                sameDay: '[Heddiw am] LT',
                nextDay: '[Yfory am] LT',
                nextWeek: 'dddd [am] LT',
                lastDay: '[Ddoe am] LT',
                lastWeek: 'dddd [diwethaf am] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: 'mewn %s',
                past: '%s yn \xf4l',
                s: 'ychydig eiliadau',
                ss: '%d eiliad',
                m: 'munud',
                mm: '%d munud',
                h: 'awr',
                hh: '%d awr',
                d: 'diwrnod',
                dd: '%d diwrnod',
                M: 'mis',
                MM: '%d mis',
                y: 'blwyddyn',
                yy: '%d flynedd',
            },
            dayOfMonthOrdinalParse: /\d{1,2}(fed|ain|af|il|ydd|ed|eg)/,
            ordinal: function (e) {
                var a = '';
                return (
                    20 < e
                        ? (a =
                              40 === e ||
                              50 === e ||
                              60 === e ||
                              80 === e ||
                              100 === e
                                  ? 'fed'
                                  : 'ain')
                        : 0 < e &&
                          (a = [
                              '',
                              'af',
                              'il',
                              'ydd',
                              'ydd',
                              'ed',
                              'ed',
                              'ed',
                              'fed',
                              'fed',
                              'fed',
                              'eg',
                              'fed',
                              'eg',
                              'eg',
                              'fed',
                              'eg',
                              'eg',
                              'fed',
                              'eg',
                              'fed',
                          ][e]),
                    e + a
                );
            },
            week: { dow: 1, doy: 4 },
        }),
        l.defineLocale('da', {
            months: 'januar_februar_marts_april_maj_juni_juli_august_september_oktober_november_december'.split(
                '_'
            ),
            monthsShort:
                'jan_feb_mar_apr_maj_jun_jul_aug_sep_okt_nov_dec'.split('_'),
            weekdays:
                's\xf8ndag_mandag_tirsdag_onsdag_torsdag_fredag_l\xf8rdag'.split(
                    '_'
                ),
            weekdaysShort: 's\xf8n_man_tir_ons_tor_fre_l\xf8r'.split('_'),
            weekdaysMin: 's\xf8_ma_ti_on_to_fr_l\xf8'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD.MM.YYYY',
                LL: 'D. MMMM YYYY',
                LLL: 'D. MMMM YYYY HH:mm',
                LLLL: 'dddd [d.] D. MMMM YYYY [kl.] HH:mm',
            },
            calendar: {
                sameDay: '[i dag kl.] LT',
                nextDay: '[i morgen kl.] LT',
                nextWeek: 'p\xe5 dddd [kl.] LT',
                lastDay: '[i g\xe5r kl.] LT',
                lastWeek: '[i] dddd[s kl.] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: 'om %s',
                past: '%s siden',
                s: 'f\xe5 sekunder',
                ss: '%d sekunder',
                m: 'et minut',
                mm: '%d minutter',
                h: 'en time',
                hh: '%d timer',
                d: 'en dag',
                dd: '%d dage',
                M: 'en m\xe5ned',
                MM: '%d m\xe5neder',
                y: 'et \xe5r',
                yy: '%d \xe5r',
            },
            dayOfMonthOrdinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: { dow: 1, doy: 4 },
        }),
        l.defineLocale('de-at', {
            months: 'J\xe4nner_Februar_M\xe4rz_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember'.split(
                '_'
            ),
            monthsShort:
                'J\xe4n._Feb._M\xe4rz_Apr._Mai_Juni_Juli_Aug._Sep._Okt._Nov._Dez.'.split(
                    '_'
                ),
            monthsParseExact: !0,
            weekdays:
                'Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag'.split(
                    '_'
                ),
            weekdaysShort: 'So._Mo._Di._Mi._Do._Fr._Sa.'.split('_'),
            weekdaysMin: 'So_Mo_Di_Mi_Do_Fr_Sa'.split('_'),
            weekdaysParseExact: !0,
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD.MM.YYYY',
                LL: 'D. MMMM YYYY',
                LLL: 'D. MMMM YYYY HH:mm',
                LLLL: 'dddd, D. MMMM YYYY HH:mm',
            },
            calendar: {
                sameDay: '[heute um] LT [Uhr]',
                sameElse: 'L',
                nextDay: '[morgen um] LT [Uhr]',
                nextWeek: 'dddd [um] LT [Uhr]',
                lastDay: '[gestern um] LT [Uhr]',
                lastWeek: '[letzten] dddd [um] LT [Uhr]',
            },
            relativeTime: {
                future: 'in %s',
                past: 'vor %s',
                s: 'ein paar Sekunden',
                ss: '%d Sekunden',
                m: ps,
                mm: '%d Minuten',
                h: ps,
                hh: '%d Stunden',
                d: ps,
                dd: ps,
                M: ps,
                MM: ps,
                y: ps,
                yy: ps,
            },
            dayOfMonthOrdinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: { dow: 1, doy: 4 },
        }),
        l.defineLocale('de-ch', {
            months: 'Januar_Februar_M\xe4rz_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember'.split(
                '_'
            ),
            monthsShort:
                'Jan._Feb._M\xe4rz_Apr._Mai_Juni_Juli_Aug._Sep._Okt._Nov._Dez.'.split(
                    '_'
                ),
            monthsParseExact: !0,
            weekdays:
                'Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag'.split(
                    '_'
                ),
            weekdaysShort: 'So_Mo_Di_Mi_Do_Fr_Sa'.split('_'),
            weekdaysMin: 'So_Mo_Di_Mi_Do_Fr_Sa'.split('_'),
            weekdaysParseExact: !0,
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD.MM.YYYY',
                LL: 'D. MMMM YYYY',
                LLL: 'D. MMMM YYYY HH:mm',
                LLLL: 'dddd, D. MMMM YYYY HH:mm',
            },
            calendar: {
                sameDay: '[heute um] LT [Uhr]',
                sameElse: 'L',
                nextDay: '[morgen um] LT [Uhr]',
                nextWeek: 'dddd [um] LT [Uhr]',
                lastDay: '[gestern um] LT [Uhr]',
                lastWeek: '[letzten] dddd [um] LT [Uhr]',
            },
            relativeTime: {
                future: 'in %s',
                past: 'vor %s',
                s: 'ein paar Sekunden',
                ss: '%d Sekunden',
                m: Ds,
                mm: '%d Minuten',
                h: Ds,
                hh: '%d Stunden',
                d: Ds,
                dd: Ds,
                M: Ds,
                MM: Ds,
                y: Ds,
                yy: Ds,
            },
            dayOfMonthOrdinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: { dow: 1, doy: 4 },
        }),
        l.defineLocale('de', {
            months: 'Januar_Februar_M\xe4rz_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember'.split(
                '_'
            ),
            monthsShort:
                'Jan._Feb._M\xe4rz_Apr._Mai_Juni_Juli_Aug._Sep._Okt._Nov._Dez.'.split(
                    '_'
                ),
            monthsParseExact: !0,
            weekdays:
                'Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag'.split(
                    '_'
                ),
            weekdaysShort: 'So._Mo._Di._Mi._Do._Fr._Sa.'.split('_'),
            weekdaysMin: 'So_Mo_Di_Mi_Do_Fr_Sa'.split('_'),
            weekdaysParseExact: !0,
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD.MM.YYYY',
                LL: 'D. MMMM YYYY',
                LLL: 'D. MMMM YYYY HH:mm',
                LLLL: 'dddd, D. MMMM YYYY HH:mm',
            },
            calendar: {
                sameDay: '[heute um] LT [Uhr]',
                sameElse: 'L',
                nextDay: '[morgen um] LT [Uhr]',
                nextWeek: 'dddd [um] LT [Uhr]',
                lastDay: '[gestern um] LT [Uhr]',
                lastWeek: '[letzten] dddd [um] LT [Uhr]',
            },
            relativeTime: {
                future: 'in %s',
                past: 'vor %s',
                s: 'ein paar Sekunden',
                ss: '%d Sekunden',
                m: Ts,
                mm: '%d Minuten',
                h: Ts,
                hh: '%d Stunden',
                d: Ts,
                dd: Ts,
                M: Ts,
                MM: Ts,
                y: Ts,
                yy: Ts,
            },
            dayOfMonthOrdinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: { dow: 1, doy: 4 },
        });
    var gs = [
            '\u0796\u07ac\u0782\u07aa\u0787\u07a6\u0783\u07a9',
            '\u078a\u07ac\u0784\u07b0\u0783\u07aa\u0787\u07a6\u0783\u07a9',
            '\u0789\u07a7\u0783\u07a8\u0797\u07aa',
            '\u0787\u07ad\u0795\u07b0\u0783\u07a9\u078d\u07aa',
            '\u0789\u07ad',
            '\u0796\u07ab\u0782\u07b0',
            '\u0796\u07aa\u078d\u07a6\u0787\u07a8',
            '\u0787\u07af\u078e\u07a6\u0790\u07b0\u0793\u07aa',
            '\u0790\u07ac\u0795\u07b0\u0793\u07ac\u0789\u07b0\u0784\u07a6\u0783\u07aa',
            '\u0787\u07ae\u0786\u07b0\u0793\u07af\u0784\u07a6\u0783\u07aa',
            '\u0782\u07ae\u0788\u07ac\u0789\u07b0\u0784\u07a6\u0783\u07aa',
            '\u0791\u07a8\u0790\u07ac\u0789\u07b0\u0784\u07a6\u0783\u07aa',
        ],
        ws = [
            '\u0787\u07a7\u078b\u07a8\u0787\u07b0\u078c\u07a6',
            '\u0780\u07af\u0789\u07a6',
            '\u0787\u07a6\u0782\u07b0\u078e\u07a7\u0783\u07a6',
            '\u0784\u07aa\u078b\u07a6',
            '\u0784\u07aa\u0783\u07a7\u0790\u07b0\u078a\u07a6\u078c\u07a8',
            '\u0780\u07aa\u0786\u07aa\u0783\u07aa',
            '\u0780\u07ae\u0782\u07a8\u0780\u07a8\u0783\u07aa',
        ];
    l.defineLocale('dv', {
        months: gs,
        monthsShort: gs,
        weekdays: ws,
        weekdaysShort: ws,
        weekdaysMin:
            '\u0787\u07a7\u078b\u07a8_\u0780\u07af\u0789\u07a6_\u0787\u07a6\u0782\u07b0_\u0784\u07aa\u078b\u07a6_\u0784\u07aa\u0783\u07a7_\u0780\u07aa\u0786\u07aa_\u0780\u07ae\u0782\u07a8'.split(
                '_'
            ),
        longDateFormat: {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L: 'D/M/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY HH:mm',
            LLLL: 'dddd D MMMM YYYY HH:mm',
        },
        meridiemParse: /\u0789\u0786|\u0789\u078a/,
        isPM: function (e) {
            return '\u0789\u078a' === e;
        },
        meridiem: function (e, a, t) {
            return e < 12 ? '\u0789\u0786' : '\u0789\u078a';
        },
        calendar: {
            sameDay: '[\u0789\u07a8\u0787\u07a6\u078b\u07aa] LT',
            nextDay: '[\u0789\u07a7\u078b\u07a6\u0789\u07a7] LT',
            nextWeek: 'dddd LT',
            lastDay: '[\u0787\u07a8\u0787\u07b0\u0794\u07ac] LT',
            lastWeek:
                '[\u078a\u07a7\u0787\u07a8\u078c\u07aa\u0788\u07a8] dddd LT',
            sameElse: 'L',
        },
        relativeTime: {
            future: '\u078c\u07ac\u0783\u07ad\u078e\u07a6\u0787\u07a8 %s',
            past: '\u0786\u07aa\u0783\u07a8\u0782\u07b0 %s',
            s: '\u0790\u07a8\u0786\u07aa\u0782\u07b0\u078c\u07aa\u0786\u07ae\u0785\u07ac\u0787\u07b0',
            ss: 'd% \u0790\u07a8\u0786\u07aa\u0782\u07b0\u078c\u07aa',
            m: '\u0789\u07a8\u0782\u07a8\u0793\u07ac\u0787\u07b0',
            mm: '\u0789\u07a8\u0782\u07a8\u0793\u07aa %d',
            h: '\u078e\u07a6\u0791\u07a8\u0787\u07a8\u0783\u07ac\u0787\u07b0',
            hh: '\u078e\u07a6\u0791\u07a8\u0787\u07a8\u0783\u07aa %d',
            d: '\u078b\u07aa\u0788\u07a6\u0780\u07ac\u0787\u07b0',
            dd: '\u078b\u07aa\u0788\u07a6\u0790\u07b0 %d',
            M: '\u0789\u07a6\u0780\u07ac\u0787\u07b0',
            MM: '\u0789\u07a6\u0790\u07b0 %d',
            y: '\u0787\u07a6\u0780\u07a6\u0783\u07ac\u0787\u07b0',
            yy: '\u0787\u07a6\u0780\u07a6\u0783\u07aa %d',
        },
        preparse: function (e) {
            return e.replace(/\u060c/g, ',');
        },
        postformat: function (e) {
            return e.replace(/,/g, '\u060c');
        },
        week: { dow: 7, doy: 12 },
    }),
        l.defineLocale('el', {
            monthsNominativeEl:
                '\u0399\u03b1\u03bd\u03bf\u03c5\u03ac\u03c1\u03b9\u03bf\u03c2_\u03a6\u03b5\u03b2\u03c1\u03bf\u03c5\u03ac\u03c1\u03b9\u03bf\u03c2_\u039c\u03ac\u03c1\u03c4\u03b9\u03bf\u03c2_\u0391\u03c0\u03c1\u03af\u03bb\u03b9\u03bf\u03c2_\u039c\u03ac\u03b9\u03bf\u03c2_\u0399\u03bf\u03cd\u03bd\u03b9\u03bf\u03c2_\u0399\u03bf\u03cd\u03bb\u03b9\u03bf\u03c2_\u0391\u03cd\u03b3\u03bf\u03c5\u03c3\u03c4\u03bf\u03c2_\u03a3\u03b5\u03c0\u03c4\u03ad\u03bc\u03b2\u03c1\u03b9\u03bf\u03c2_\u039f\u03ba\u03c4\u03ce\u03b2\u03c1\u03b9\u03bf\u03c2_\u039d\u03bf\u03ad\u03bc\u03b2\u03c1\u03b9\u03bf\u03c2_\u0394\u03b5\u03ba\u03ad\u03bc\u03b2\u03c1\u03b9\u03bf\u03c2'.split(
                    '_'
                ),
            monthsGenitiveEl:
                '\u0399\u03b1\u03bd\u03bf\u03c5\u03b1\u03c1\u03af\u03bf\u03c5_\u03a6\u03b5\u03b2\u03c1\u03bf\u03c5\u03b1\u03c1\u03af\u03bf\u03c5_\u039c\u03b1\u03c1\u03c4\u03af\u03bf\u03c5_\u0391\u03c0\u03c1\u03b9\u03bb\u03af\u03bf\u03c5_\u039c\u03b1\u0390\u03bf\u03c5_\u0399\u03bf\u03c5\u03bd\u03af\u03bf\u03c5_\u0399\u03bf\u03c5\u03bb\u03af\u03bf\u03c5_\u0391\u03c5\u03b3\u03bf\u03cd\u03c3\u03c4\u03bf\u03c5_\u03a3\u03b5\u03c0\u03c4\u03b5\u03bc\u03b2\u03c1\u03af\u03bf\u03c5_\u039f\u03ba\u03c4\u03c9\u03b2\u03c1\u03af\u03bf\u03c5_\u039d\u03bf\u03b5\u03bc\u03b2\u03c1\u03af\u03bf\u03c5_\u0394\u03b5\u03ba\u03b5\u03bc\u03b2\u03c1\u03af\u03bf\u03c5'.split(
                    '_'
                ),
            months: function (e, a) {
                return e
                    ? 'string' == typeof a &&
                      /D/.test(a.substring(0, a.indexOf('MMMM')))
                        ? this._monthsGenitiveEl[e.month()]
                        : this._monthsNominativeEl[e.month()]
                    : this._monthsNominativeEl;
            },
            monthsShort:
                '\u0399\u03b1\u03bd_\u03a6\u03b5\u03b2_\u039c\u03b1\u03c1_\u0391\u03c0\u03c1_\u039c\u03b1\u03ca_\u0399\u03bf\u03c5\u03bd_\u0399\u03bf\u03c5\u03bb_\u0391\u03c5\u03b3_\u03a3\u03b5\u03c0_\u039f\u03ba\u03c4_\u039d\u03bf\u03b5_\u0394\u03b5\u03ba'.split(
                    '_'
                ),
            weekdays:
                '\u039a\u03c5\u03c1\u03b9\u03b1\u03ba\u03ae_\u0394\u03b5\u03c5\u03c4\u03ad\u03c1\u03b1_\u03a4\u03c1\u03af\u03c4\u03b7_\u03a4\u03b5\u03c4\u03ac\u03c1\u03c4\u03b7_\u03a0\u03ad\u03bc\u03c0\u03c4\u03b7_\u03a0\u03b1\u03c1\u03b1\u03c3\u03ba\u03b5\u03c5\u03ae_\u03a3\u03ac\u03b2\u03b2\u03b1\u03c4\u03bf'.split(
                    '_'
                ),
            weekdaysShort:
                '\u039a\u03c5\u03c1_\u0394\u03b5\u03c5_\u03a4\u03c1\u03b9_\u03a4\u03b5\u03c4_\u03a0\u03b5\u03bc_\u03a0\u03b1\u03c1_\u03a3\u03b1\u03b2'.split(
                    '_'
                ),
            weekdaysMin:
                '\u039a\u03c5_\u0394\u03b5_\u03a4\u03c1_\u03a4\u03b5_\u03a0\u03b5_\u03a0\u03b1_\u03a3\u03b1'.split(
                    '_'
                ),
            meridiem: function (e, a, t) {
                return 11 < e
                    ? t
                        ? '\u03bc\u03bc'
                        : '\u039c\u039c'
                    : t
                    ? '\u03c0\u03bc'
                    : '\u03a0\u039c';
            },
            isPM: function (e) {
                return '\u03bc' === (e + '').toLowerCase()[0];
            },
            meridiemParse: /[\u03a0\u039c]\.?\u039c?\.?/i,
            longDateFormat: {
                LT: 'h:mm A',
                LTS: 'h:mm:ss A',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY h:mm A',
                LLLL: 'dddd, D MMMM YYYY h:mm A',
            },
            calendarEl: {
                sameDay: '[\u03a3\u03ae\u03bc\u03b5\u03c1\u03b1 {}] LT',
                nextDay: '[\u0391\u03cd\u03c1\u03b9\u03bf {}] LT',
                nextWeek: 'dddd [{}] LT',
                lastDay: '[\u03a7\u03b8\u03b5\u03c2 {}] LT',
                lastWeek: function () {
                    switch (this.day()) {
                        case 6:
                            return '[\u03c4\u03bf \u03c0\u03c1\u03bf\u03b7\u03b3\u03bf\u03cd\u03bc\u03b5\u03bd\u03bf] dddd [{}] LT';
                        default:
                            return '[\u03c4\u03b7\u03bd \u03c0\u03c1\u03bf\u03b7\u03b3\u03bf\u03cd\u03bc\u03b5\u03bd\u03b7] dddd [{}] LT';
                    }
                },
                sameElse: 'L',
            },
            calendar: function (e, a) {
                var t = this._calendarEl[e],
                    s = a && a.hours();
                return (
                    H(t) && (t = t.apply(a)),
                    t.replace(
                        '{}',
                        s % 12 == 1
                            ? '\u03c3\u03c4\u03b7'
                            : '\u03c3\u03c4\u03b9\u03c2'
                    )
                );
            },
            relativeTime: {
                future: '\u03c3\u03b5 %s',
                past: '%s \u03c0\u03c1\u03b9\u03bd',
                s: '\u03bb\u03af\u03b3\u03b1 \u03b4\u03b5\u03c5\u03c4\u03b5\u03c1\u03cc\u03bb\u03b5\u03c0\u03c4\u03b1',
                ss: '%d \u03b4\u03b5\u03c5\u03c4\u03b5\u03c1\u03cc\u03bb\u03b5\u03c0\u03c4\u03b1',
                m: '\u03ad\u03bd\u03b1 \u03bb\u03b5\u03c0\u03c4\u03cc',
                mm: '%d \u03bb\u03b5\u03c0\u03c4\u03ac',
                h: '\u03bc\u03af\u03b1 \u03ce\u03c1\u03b1',
                hh: '%d \u03ce\u03c1\u03b5\u03c2',
                d: '\u03bc\u03af\u03b1 \u03bc\u03ad\u03c1\u03b1',
                dd: '%d \u03bc\u03ad\u03c1\u03b5\u03c2',
                M: '\u03ad\u03bd\u03b1\u03c2 \u03bc\u03ae\u03bd\u03b1\u03c2',
                MM: '%d \u03bc\u03ae\u03bd\u03b5\u03c2',
                y: '\u03ad\u03bd\u03b1\u03c2 \u03c7\u03c1\u03cc\u03bd\u03bf\u03c2',
                yy: '%d \u03c7\u03c1\u03cc\u03bd\u03b9\u03b1',
            },
            dayOfMonthOrdinalParse: /\d{1,2}\u03b7/,
            ordinal: '%d\u03b7',
            week: { dow: 1, doy: 4 },
        }),
        l.defineLocale('en-SG', {
            months: 'January_February_March_April_May_June_July_August_September_October_November_December'.split(
                '_'
            ),
            monthsShort:
                'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
            weekdays:
                'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split(
                    '_'
                ),
            weekdaysShort: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
            weekdaysMin: 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd, D MMMM YYYY HH:mm',
            },
            calendar: {
                sameDay: '[Today at] LT',
                nextDay: '[Tomorrow at] LT',
                nextWeek: 'dddd [at] LT',
                lastDay: '[Yesterday at] LT',
                lastWeek: '[Last] dddd [at] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: 'in %s',
                past: '%s ago',
                s: 'a few seconds',
                ss: '%d seconds',
                m: 'a minute',
                mm: '%d minutes',
                h: 'an hour',
                hh: '%d hours',
                d: 'a day',
                dd: '%d days',
                M: 'a month',
                MM: '%d months',
                y: 'a year',
                yy: '%d years',
            },
            dayOfMonthOrdinalParse: /\d{1,2}(st|nd|rd|th)/,
            ordinal: function (e) {
                var a = e % 10;
                return (
                    e +
                    (1 == ~~((e % 100) / 10)
                        ? 'th'
                        : 1 === a
                        ? 'st'
                        : 2 === a
                        ? 'nd'
                        : 3 === a
                        ? 'rd'
                        : 'th')
                );
            },
            week: { dow: 1, doy: 4 },
        }),
        l.defineLocale('en-au', {
            months: 'January_February_March_April_May_June_July_August_September_October_November_December'.split(
                '_'
            ),
            monthsShort:
                'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
            weekdays:
                'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split(
                    '_'
                ),
            weekdaysShort: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
            weekdaysMin: 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
            longDateFormat: {
                LT: 'h:mm A',
                LTS: 'h:mm:ss A',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY h:mm A',
                LLLL: 'dddd, D MMMM YYYY h:mm A',
            },
            calendar: {
                sameDay: '[Today at] LT',
                nextDay: '[Tomorrow at] LT',
                nextWeek: 'dddd [at] LT',
                lastDay: '[Yesterday at] LT',
                lastWeek: '[Last] dddd [at] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: 'in %s',
                past: '%s ago',
                s: 'a few seconds',
                ss: '%d seconds',
                m: 'a minute',
                mm: '%d minutes',
                h: 'an hour',
                hh: '%d hours',
                d: 'a day',
                dd: '%d days',
                M: 'a month',
                MM: '%d months',
                y: 'a year',
                yy: '%d years',
            },
            dayOfMonthOrdinalParse: /\d{1,2}(st|nd|rd|th)/,
            ordinal: function (e) {
                var a = e % 10;
                return (
                    e +
                    (1 == ~~((e % 100) / 10)
                        ? 'th'
                        : 1 === a
                        ? 'st'
                        : 2 === a
                        ? 'nd'
                        : 3 === a
                        ? 'rd'
                        : 'th')
                );
            },
            week: { dow: 1, doy: 4 },
        }),
        l.defineLocale('en-ca', {
            months: 'January_February_March_April_May_June_July_August_September_October_November_December'.split(
                '_'
            ),
            monthsShort:
                'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
            weekdays:
                'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split(
                    '_'
                ),
            weekdaysShort: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
            weekdaysMin: 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
            longDateFormat: {
                LT: 'h:mm A',
                LTS: 'h:mm:ss A',
                L: 'YYYY-MM-DD',
                LL: 'MMMM D, YYYY',
                LLL: 'MMMM D, YYYY h:mm A',
                LLLL: 'dddd, MMMM D, YYYY h:mm A',
            },
            calendar: {
                sameDay: '[Today at] LT',
                nextDay: '[Tomorrow at] LT',
                nextWeek: 'dddd [at] LT',
                lastDay: '[Yesterday at] LT',
                lastWeek: '[Last] dddd [at] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: 'in %s',
                past: '%s ago',
                s: 'a few seconds',
                ss: '%d seconds',
                m: 'a minute',
                mm: '%d minutes',
                h: 'an hour',
                hh: '%d hours',
                d: 'a day',
                dd: '%d days',
                M: 'a month',
                MM: '%d months',
                y: 'a year',
                yy: '%d years',
            },
            dayOfMonthOrdinalParse: /\d{1,2}(st|nd|rd|th)/,
            ordinal: function (e) {
                var a = e % 10;
                return (
                    e +
                    (1 == ~~((e % 100) / 10)
                        ? 'th'
                        : 1 === a
                        ? 'st'
                        : 2 === a
                        ? 'nd'
                        : 3 === a
                        ? 'rd'
                        : 'th')
                );
            },
        }),
        l.defineLocale('en-gb', {
            months: 'January_February_March_April_May_June_July_August_September_October_November_December'.split(
                '_'
            ),
            monthsShort:
                'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
            weekdays:
                'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split(
                    '_'
                ),
            weekdaysShort: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
            weekdaysMin: 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd, D MMMM YYYY HH:mm',
            },
            calendar: {
                sameDay: '[Today at] LT',
                nextDay: '[Tomorrow at] LT',
                nextWeek: 'dddd [at] LT',
                lastDay: '[Yesterday at] LT',
                lastWeek: '[Last] dddd [at] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: 'in %s',
                past: '%s ago',
                s: 'a few seconds',
                ss: '%d seconds',
                m: 'a minute',
                mm: '%d minutes',
                h: 'an hour',
                hh: '%d hours',
                d: 'a day',
                dd: '%d days',
                M: 'a month',
                MM: '%d months',
                y: 'a year',
                yy: '%d years',
            },
            dayOfMonthOrdinalParse: /\d{1,2}(st|nd|rd|th)/,
            ordinal: function (e) {
                var a = e % 10;
                return (
                    e +
                    (1 == ~~((e % 100) / 10)
                        ? 'th'
                        : 1 === a
                        ? 'st'
                        : 2 === a
                        ? 'nd'
                        : 3 === a
                        ? 'rd'
                        : 'th')
                );
            },
            week: { dow: 1, doy: 4 },
        }),
        l.defineLocale('en-ie', {
            months: 'January_February_March_April_May_June_July_August_September_October_November_December'.split(
                '_'
            ),
            monthsShort:
                'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
            weekdays:
                'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split(
                    '_'
                ),
            weekdaysShort: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
            weekdaysMin: 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd D MMMM YYYY HH:mm',
            },
            calendar: {
                sameDay: '[Today at] LT',
                nextDay: '[Tomorrow at] LT',
                nextWeek: 'dddd [at] LT',
                lastDay: '[Yesterday at] LT',
                lastWeek: '[Last] dddd [at] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: 'in %s',
                past: '%s ago',
                s: 'a few seconds',
                ss: '%d seconds',
                m: 'a minute',
                mm: '%d minutes',
                h: 'an hour',
                hh: '%d hours',
                d: 'a day',
                dd: '%d days',
                M: 'a month',
                MM: '%d months',
                y: 'a year',
                yy: '%d years',
            },
            dayOfMonthOrdinalParse: /\d{1,2}(st|nd|rd|th)/,
            ordinal: function (e) {
                var a = e % 10;
                return (
                    e +
                    (1 == ~~((e % 100) / 10)
                        ? 'th'
                        : 1 === a
                        ? 'st'
                        : 2 === a
                        ? 'nd'
                        : 3 === a
                        ? 'rd'
                        : 'th')
                );
            },
            week: { dow: 1, doy: 4 },
        }),
        l.defineLocale('en-il', {
            months: 'January_February_March_April_May_June_July_August_September_October_November_December'.split(
                '_'
            ),
            monthsShort:
                'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
            weekdays:
                'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split(
                    '_'
                ),
            weekdaysShort: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
            weekdaysMin: 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd, D MMMM YYYY HH:mm',
            },
            calendar: {
                sameDay: '[Today at] LT',
                nextDay: '[Tomorrow at] LT',
                nextWeek: 'dddd [at] LT',
                lastDay: '[Yesterday at] LT',
                lastWeek: '[Last] dddd [at] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: 'in %s',
                past: '%s ago',
                s: 'a few seconds',
                m: 'a minute',
                mm: '%d minutes',
                h: 'an hour',
                hh: '%d hours',
                d: 'a day',
                dd: '%d days',
                M: 'a month',
                MM: '%d months',
                y: 'a year',
                yy: '%d years',
            },
            dayOfMonthOrdinalParse: /\d{1,2}(st|nd|rd|th)/,
            ordinal: function (e) {
                var a = e % 10;
                return (
                    e +
                    (1 == ~~((e % 100) / 10)
                        ? 'th'
                        : 1 === a
                        ? 'st'
                        : 2 === a
                        ? 'nd'
                        : 3 === a
                        ? 'rd'
                        : 'th')
                );
            },
        }),
        l.defineLocale('en-nz', {
            months: 'January_February_March_April_May_June_July_August_September_October_November_December'.split(
                '_'
            ),
            monthsShort:
                'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
            weekdays:
                'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split(
                    '_'
                ),
            weekdaysShort: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
            weekdaysMin: 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
            longDateFormat: {
                LT: 'h:mm A',
                LTS: 'h:mm:ss A',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY h:mm A',
                LLLL: 'dddd, D MMMM YYYY h:mm A',
            },
            calendar: {
                sameDay: '[Today at] LT',
                nextDay: '[Tomorrow at] LT',
                nextWeek: 'dddd [at] LT',
                lastDay: '[Yesterday at] LT',
                lastWeek: '[Last] dddd [at] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: 'in %s',
                past: '%s ago',
                s: 'a few seconds',
                ss: '%d seconds',
                m: 'a minute',
                mm: '%d minutes',
                h: 'an hour',
                hh: '%d hours',
                d: 'a day',
                dd: '%d days',
                M: 'a month',
                MM: '%d months',
                y: 'a year',
                yy: '%d years',
            },
            dayOfMonthOrdinalParse: /\d{1,2}(st|nd|rd|th)/,
            ordinal: function (e) {
                var a = e % 10;
                return (
                    e +
                    (1 == ~~((e % 100) / 10)
                        ? 'th'
                        : 1 === a
                        ? 'st'
                        : 2 === a
                        ? 'nd'
                        : 3 === a
                        ? 'rd'
                        : 'th')
                );
            },
            week: { dow: 1, doy: 4 },
        }),
        l.defineLocale('eo', {
            months: 'januaro_februaro_marto_aprilo_majo_junio_julio_a\u016dgusto_septembro_oktobro_novembro_decembro'.split(
                '_'
            ),
            monthsShort:
                'jan_feb_mar_apr_maj_jun_jul_a\u016dg_sep_okt_nov_dec'.split(
                    '_'
                ),
            weekdays:
                'diman\u0109o_lundo_mardo_merkredo_\u0135a\u016ddo_vendredo_sabato'.split(
                    '_'
                ),
            weekdaysShort: 'dim_lun_mard_merk_\u0135a\u016d_ven_sab'.split('_'),
            weekdaysMin: 'di_lu_ma_me_\u0135a_ve_sa'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'YYYY-MM-DD',
                LL: 'D[-a de] MMMM, YYYY',
                LLL: 'D[-a de] MMMM, YYYY HH:mm',
                LLLL: 'dddd, [la] D[-a de] MMMM, YYYY HH:mm',
            },
            meridiemParse: /[ap]\.t\.m/i,
            isPM: function (e) {
                return 'p' === e.charAt(0).toLowerCase();
            },
            meridiem: function (e, a, t) {
                return 11 < e
                    ? t
                        ? 'p.t.m.'
                        : 'P.T.M.'
                    : t
                    ? 'a.t.m.'
                    : 'A.T.M.';
            },
            calendar: {
                sameDay: '[Hodia\u016d je] LT',
                nextDay: '[Morga\u016d je] LT',
                nextWeek: 'dddd [je] LT',
                lastDay: '[Hiera\u016d je] LT',
                lastWeek: '[pasinta] dddd [je] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: 'post %s',
                past: 'anta\u016d %s',
                s: 'sekundoj',
                ss: '%d sekundoj',
                m: 'minuto',
                mm: '%d minutoj',
                h: 'horo',
                hh: '%d horoj',
                d: 'tago',
                dd: '%d tagoj',
                M: 'monato',
                MM: '%d monatoj',
                y: 'jaro',
                yy: '%d jaroj',
            },
            dayOfMonthOrdinalParse: /\d{1,2}a/,
            ordinal: '%da',
            week: { dow: 1, doy: 7 },
        });
    var vs =
            'ene._feb._mar._abr._may._jun._jul._ago._sep._oct._nov._dic.'.split(
                '_'
            ),
        Ss = 'ene_feb_mar_abr_may_jun_jul_ago_sep_oct_nov_dic'.split('_'),
        Hs = [
            /^ene/i,
            /^feb/i,
            /^mar/i,
            /^abr/i,
            /^may/i,
            /^jun/i,
            /^jul/i,
            /^ago/i,
            /^sep/i,
            /^oct/i,
            /^nov/i,
            /^dic/i,
        ],
        bs =
            /^(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre|ene\.?|feb\.?|mar\.?|abr\.?|may\.?|jun\.?|jul\.?|ago\.?|sep\.?|oct\.?|nov\.?|dic\.?)/i;
    l.defineLocale('es-do', {
        months: 'enero_febrero_marzo_abril_mayo_junio_julio_agosto_septiembre_octubre_noviembre_diciembre'.split(
            '_'
        ),
        monthsShort: function (e, a) {
            return e ? (/-MMM-/.test(a) ? Ss[e.month()] : vs[e.month()]) : vs;
        },
        monthsRegex: bs,
        monthsShortRegex: bs,
        monthsStrictRegex:
            /^(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i,
        monthsShortStrictRegex:
            /^(ene\.?|feb\.?|mar\.?|abr\.?|may\.?|jun\.?|jul\.?|ago\.?|sep\.?|oct\.?|nov\.?|dic\.?)/i,
        monthsParse: Hs,
        longMonthsParse: Hs,
        shortMonthsParse: Hs,
        weekdays:
            'domingo_lunes_martes_mi\xe9rcoles_jueves_viernes_s\xe1bado'.split(
                '_'
            ),
        weekdaysShort: 'dom._lun._mar._mi\xe9._jue._vie._s\xe1b.'.split('_'),
        weekdaysMin: 'do_lu_ma_mi_ju_vi_s\xe1'.split('_'),
        weekdaysParseExact: !0,
        longDateFormat: {
            LT: 'h:mm A',
            LTS: 'h:mm:ss A',
            L: 'DD/MM/YYYY',
            LL: 'D [de] MMMM [de] YYYY',
            LLL: 'D [de] MMMM [de] YYYY h:mm A',
            LLLL: 'dddd, D [de] MMMM [de] YYYY h:mm A',
        },
        calendar: {
            sameDay: function () {
                return '[hoy a la' + (1 !== this.hours() ? 's' : '') + '] LT';
            },
            nextDay: function () {
                return (
                    '[ma\xf1ana a la' + (1 !== this.hours() ? 's' : '') + '] LT'
                );
            },
            nextWeek: function () {
                return 'dddd [a la' + (1 !== this.hours() ? 's' : '') + '] LT';
            },
            lastDay: function () {
                return '[ayer a la' + (1 !== this.hours() ? 's' : '') + '] LT';
            },
            lastWeek: function () {
                return (
                    '[el] dddd [pasado a la' +
                    (1 !== this.hours() ? 's' : '') +
                    '] LT'
                );
            },
            sameElse: 'L',
        },
        relativeTime: {
            future: 'en %s',
            past: 'hace %s',
            s: 'unos segundos',
            ss: '%d segundos',
            m: 'un minuto',
            mm: '%d minutos',
            h: 'una hora',
            hh: '%d horas',
            d: 'un d\xeda',
            dd: '%d d\xedas',
            M: 'un mes',
            MM: '%d meses',
            y: 'un a\xf1o',
            yy: '%d a\xf1os',
        },
        dayOfMonthOrdinalParse: /\d{1,2}\xba/,
        ordinal: '%d\xba',
        week: { dow: 1, doy: 4 },
    });
    var js =
            'ene._feb._mar._abr._may._jun._jul._ago._sep._oct._nov._dic.'.split(
                '_'
            ),
        xs = 'ene_feb_mar_abr_may_jun_jul_ago_sep_oct_nov_dic'.split('_'),
        Os = [
            /^ene/i,
            /^feb/i,
            /^mar/i,
            /^abr/i,
            /^may/i,
            /^jun/i,
            /^jul/i,
            /^ago/i,
            /^sep/i,
            /^oct/i,
            /^nov/i,
            /^dic/i,
        ],
        Ps =
            /^(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre|ene\.?|feb\.?|mar\.?|abr\.?|may\.?|jun\.?|jul\.?|ago\.?|sep\.?|oct\.?|nov\.?|dic\.?)/i;
    l.defineLocale('es-us', {
        months: 'enero_febrero_marzo_abril_mayo_junio_julio_agosto_septiembre_octubre_noviembre_diciembre'.split(
            '_'
        ),
        monthsShort: function (e, a) {
            return e ? (/-MMM-/.test(a) ? xs[e.month()] : js[e.month()]) : js;
        },
        monthsRegex: Ps,
        monthsShortRegex: Ps,
        monthsStrictRegex:
            /^(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i,
        monthsShortStrictRegex:
            /^(ene\.?|feb\.?|mar\.?|abr\.?|may\.?|jun\.?|jul\.?|ago\.?|sep\.?|oct\.?|nov\.?|dic\.?)/i,
        monthsParse: Os,
        longMonthsParse: Os,
        shortMonthsParse: Os,
        weekdays:
            'domingo_lunes_martes_mi\xe9rcoles_jueves_viernes_s\xe1bado'.split(
                '_'
            ),
        weekdaysShort: 'dom._lun._mar._mi\xe9._jue._vie._s\xe1b.'.split('_'),
        weekdaysMin: 'do_lu_ma_mi_ju_vi_s\xe1'.split('_'),
        weekdaysParseExact: !0,
        longDateFormat: {
            LT: 'h:mm A',
            LTS: 'h:mm:ss A',
            L: 'MM/DD/YYYY',
            LL: 'D [de] MMMM [de] YYYY',
            LLL: 'D [de] MMMM [de] YYYY h:mm A',
            LLLL: 'dddd, D [de] MMMM [de] YYYY h:mm A',
        },
        calendar: {
            sameDay: function () {
                return '[hoy a la' + (1 !== this.hours() ? 's' : '') + '] LT';
            },
            nextDay: function () {
                return (
                    '[ma\xf1ana a la' + (1 !== this.hours() ? 's' : '') + '] LT'
                );
            },
            nextWeek: function () {
                return 'dddd [a la' + (1 !== this.hours() ? 's' : '') + '] LT';
            },
            lastDay: function () {
                return '[ayer a la' + (1 !== this.hours() ? 's' : '') + '] LT';
            },
            lastWeek: function () {
                return (
                    '[el] dddd [pasado a la' +
                    (1 !== this.hours() ? 's' : '') +
                    '] LT'
                );
            },
            sameElse: 'L',
        },
        relativeTime: {
            future: 'en %s',
            past: 'hace %s',
            s: 'unos segundos',
            ss: '%d segundos',
            m: 'un minuto',
            mm: '%d minutos',
            h: 'una hora',
            hh: '%d horas',
            d: 'un d\xeda',
            dd: '%d d\xedas',
            M: 'un mes',
            MM: '%d meses',
            y: 'un a\xf1o',
            yy: '%d a\xf1os',
        },
        dayOfMonthOrdinalParse: /\d{1,2}\xba/,
        ordinal: '%d\xba',
        week: { dow: 0, doy: 6 },
    });
    var Ws =
            'ene._feb._mar._abr._may._jun._jul._ago._sep._oct._nov._dic.'.split(
                '_'
            ),
        As = 'ene_feb_mar_abr_may_jun_jul_ago_sep_oct_nov_dic'.split('_'),
        Es = [
            /^ene/i,
            /^feb/i,
            /^mar/i,
            /^abr/i,
            /^may/i,
            /^jun/i,
            /^jul/i,
            /^ago/i,
            /^sep/i,
            /^oct/i,
            /^nov/i,
            /^dic/i,
        ],
        Fs =
            /^(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre|ene\.?|feb\.?|mar\.?|abr\.?|may\.?|jun\.?|jul\.?|ago\.?|sep\.?|oct\.?|nov\.?|dic\.?)/i;
    function zs(e, a, t, s) {
        var n = {
            s: ['m\xf5ne sekundi', 'm\xf5ni sekund', 'paar sekundit'],
            ss: [e + 'sekundi', e + 'sekundit'],
            m: ['\xfche minuti', '\xfcks minut'],
            mm: [e + ' minuti', e + ' minutit'],
            h: ['\xfche tunni', 'tund aega', '\xfcks tund'],
            hh: [e + ' tunni', e + ' tundi'],
            d: ['\xfche p\xe4eva', '\xfcks p\xe4ev'],
            M: ['kuu aja', 'kuu aega', '\xfcks kuu'],
            MM: [e + ' kuu', e + ' kuud'],
            y: ['\xfche aasta', 'aasta', '\xfcks aasta'],
            yy: [e + ' aasta', e + ' aastat'],
        };
        return a ? (n[t][2] ? n[t][2] : n[t][1]) : s ? n[t][0] : n[t][1];
    }
    l.defineLocale('es', {
        months: 'enero_febrero_marzo_abril_mayo_junio_julio_agosto_septiembre_octubre_noviembre_diciembre'.split(
            '_'
        ),
        monthsShort: function (e, a) {
            return e ? (/-MMM-/.test(a) ? As[e.month()] : Ws[e.month()]) : Ws;
        },
        monthsRegex: Fs,
        monthsShortRegex: Fs,
        monthsStrictRegex:
            /^(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i,
        monthsShortStrictRegex:
            /^(ene\.?|feb\.?|mar\.?|abr\.?|may\.?|jun\.?|jul\.?|ago\.?|sep\.?|oct\.?|nov\.?|dic\.?)/i,
        monthsParse: Es,
        longMonthsParse: Es,
        shortMonthsParse: Es,
        weekdays:
            'domingo_lunes_martes_mi\xe9rcoles_jueves_viernes_s\xe1bado'.split(
                '_'
            ),
        weekdaysShort: 'dom._lun._mar._mi\xe9._jue._vie._s\xe1b.'.split('_'),
        weekdaysMin: 'do_lu_ma_mi_ju_vi_s\xe1'.split('_'),
        weekdaysParseExact: !0,
        longDateFormat: {
            LT: 'H:mm',
            LTS: 'H:mm:ss',
            L: 'DD/MM/YYYY',
            LL: 'D [de] MMMM [de] YYYY',
            LLL: 'D [de] MMMM [de] YYYY H:mm',
            LLLL: 'dddd, D [de] MMMM [de] YYYY H:mm',
        },
        calendar: {
            sameDay: function () {
                return '[hoy a la' + (1 !== this.hours() ? 's' : '') + '] LT';
            },
            nextDay: function () {
                return (
                    '[ma\xf1ana a la' + (1 !== this.hours() ? 's' : '') + '] LT'
                );
            },
            nextWeek: function () {
                return 'dddd [a la' + (1 !== this.hours() ? 's' : '') + '] LT';
            },
            lastDay: function () {
                return '[ayer a la' + (1 !== this.hours() ? 's' : '') + '] LT';
            },
            lastWeek: function () {
                return (
                    '[el] dddd [pasado a la' +
                    (1 !== this.hours() ? 's' : '') +
                    '] LT'
                );
            },
            sameElse: 'L',
        },
        relativeTime: {
            future: 'en %s',
            past: 'hace %s',
            s: 'unos segundos',
            ss: '%d segundos',
            m: 'un minuto',
            mm: '%d minutos',
            h: 'una hora',
            hh: '%d horas',
            d: 'un d\xeda',
            dd: '%d d\xedas',
            M: 'un mes',
            MM: '%d meses',
            y: 'un a\xf1o',
            yy: '%d a\xf1os',
        },
        dayOfMonthOrdinalParse: /\d{1,2}\xba/,
        ordinal: '%d\xba',
        week: { dow: 1, doy: 4 },
    }),
        l.defineLocale('et', {
            months: 'jaanuar_veebruar_m\xe4rts_aprill_mai_juuni_juuli_august_september_oktoober_november_detsember'.split(
                '_'
            ),
            monthsShort:
                'jaan_veebr_m\xe4rts_apr_mai_juuni_juuli_aug_sept_okt_nov_dets'.split(
                    '_'
                ),
            weekdays:
                'p\xfchap\xe4ev_esmasp\xe4ev_teisip\xe4ev_kolmap\xe4ev_neljap\xe4ev_reede_laup\xe4ev'.split(
                    '_'
                ),
            weekdaysShort: 'P_E_T_K_N_R_L'.split('_'),
            weekdaysMin: 'P_E_T_K_N_R_L'.split('_'),
            longDateFormat: {
                LT: 'H:mm',
                LTS: 'H:mm:ss',
                L: 'DD.MM.YYYY',
                LL: 'D. MMMM YYYY',
                LLL: 'D. MMMM YYYY H:mm',
                LLLL: 'dddd, D. MMMM YYYY H:mm',
            },
            calendar: {
                sameDay: '[T\xe4na,] LT',
                nextDay: '[Homme,] LT',
                nextWeek: '[J\xe4rgmine] dddd LT',
                lastDay: '[Eile,] LT',
                lastWeek: '[Eelmine] dddd LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: '%s p\xe4rast',
                past: '%s tagasi',
                s: zs,
                ss: zs,
                m: zs,
                mm: zs,
                h: zs,
                hh: zs,
                d: zs,
                dd: '%d p\xe4eva',
                M: zs,
                MM: zs,
                y: zs,
                yy: zs,
            },
            dayOfMonthOrdinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: { dow: 1, doy: 4 },
        }),
        l.defineLocale('eu', {
            months: 'urtarrila_otsaila_martxoa_apirila_maiatza_ekaina_uztaila_abuztua_iraila_urria_azaroa_abendua'.split(
                '_'
            ),
            monthsShort:
                'urt._ots._mar._api._mai._eka._uzt._abu._ira._urr._aza._abe.'.split(
                    '_'
                ),
            monthsParseExact: !0,
            weekdays:
                'igandea_astelehena_asteartea_asteazkena_osteguna_ostirala_larunbata'.split(
                    '_'
                ),
            weekdaysShort: 'ig._al._ar._az._og._ol._lr.'.split('_'),
            weekdaysMin: 'ig_al_ar_az_og_ol_lr'.split('_'),
            weekdaysParseExact: !0,
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'YYYY-MM-DD',
                LL: 'YYYY[ko] MMMM[ren] D[a]',
                LLL: 'YYYY[ko] MMMM[ren] D[a] HH:mm',
                LLLL: 'dddd, YYYY[ko] MMMM[ren] D[a] HH:mm',
                l: 'YYYY-M-D',
                ll: 'YYYY[ko] MMM D[a]',
                lll: 'YYYY[ko] MMM D[a] HH:mm',
                llll: 'ddd, YYYY[ko] MMM D[a] HH:mm',
            },
            calendar: {
                sameDay: '[gaur] LT[etan]',
                nextDay: '[bihar] LT[etan]',
                nextWeek: 'dddd LT[etan]',
                lastDay: '[atzo] LT[etan]',
                lastWeek: '[aurreko] dddd LT[etan]',
                sameElse: 'L',
            },
            relativeTime: {
                future: '%s barru',
                past: 'duela %s',
                s: 'segundo batzuk',
                ss: '%d segundo',
                m: 'minutu bat',
                mm: '%d minutu',
                h: 'ordu bat',
                hh: '%d ordu',
                d: 'egun bat',
                dd: '%d egun',
                M: 'hilabete bat',
                MM: '%d hilabete',
                y: 'urte bat',
                yy: '%d urte',
            },
            dayOfMonthOrdinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: { dow: 1, doy: 7 },
        });
    var Js = {
            1: '\u06f1',
            2: '\u06f2',
            3: '\u06f3',
            4: '\u06f4',
            5: '\u06f5',
            6: '\u06f6',
            7: '\u06f7',
            8: '\u06f8',
            9: '\u06f9',
            0: '\u06f0',
        },
        Ns = {
            '\u06f1': '1',
            '\u06f2': '2',
            '\u06f3': '3',
            '\u06f4': '4',
            '\u06f5': '5',
            '\u06f6': '6',
            '\u06f7': '7',
            '\u06f8': '8',
            '\u06f9': '9',
            '\u06f0': '0',
        };
    l.defineLocale('fa', {
        months: '\u0698\u0627\u0646\u0648\u06cc\u0647_\u0641\u0648\u0631\u06cc\u0647_\u0645\u0627\u0631\u0633_\u0622\u0648\u0631\u06cc\u0644_\u0645\u0647_\u0698\u0648\u0626\u0646_\u0698\u0648\u0626\u06cc\u0647_\u0627\u0648\u062a_\u0633\u067e\u062a\u0627\u0645\u0628\u0631_\u0627\u06a9\u062a\u0628\u0631_\u0646\u0648\u0627\u0645\u0628\u0631_\u062f\u0633\u0627\u0645\u0628\u0631'.split(
            '_'
        ),
        monthsShort:
            '\u0698\u0627\u0646\u0648\u06cc\u0647_\u0641\u0648\u0631\u06cc\u0647_\u0645\u0627\u0631\u0633_\u0622\u0648\u0631\u06cc\u0644_\u0645\u0647_\u0698\u0648\u0626\u0646_\u0698\u0648\u0626\u06cc\u0647_\u0627\u0648\u062a_\u0633\u067e\u062a\u0627\u0645\u0628\u0631_\u0627\u06a9\u062a\u0628\u0631_\u0646\u0648\u0627\u0645\u0628\u0631_\u062f\u0633\u0627\u0645\u0628\u0631'.split(
                '_'
            ),
        weekdays:
            '\u06cc\u06a9\u200c\u0634\u0646\u0628\u0647_\u062f\u0648\u0634\u0646\u0628\u0647_\u0633\u0647\u200c\u0634\u0646\u0628\u0647_\u0686\u0647\u0627\u0631\u0634\u0646\u0628\u0647_\u067e\u0646\u062c\u200c\u0634\u0646\u0628\u0647_\u062c\u0645\u0639\u0647_\u0634\u0646\u0628\u0647'.split(
                '_'
            ),
        weekdaysShort:
            '\u06cc\u06a9\u200c\u0634\u0646\u0628\u0647_\u062f\u0648\u0634\u0646\u0628\u0647_\u0633\u0647\u200c\u0634\u0646\u0628\u0647_\u0686\u0647\u0627\u0631\u0634\u0646\u0628\u0647_\u067e\u0646\u062c\u200c\u0634\u0646\u0628\u0647_\u062c\u0645\u0639\u0647_\u0634\u0646\u0628\u0647'.split(
                '_'
            ),
        weekdaysMin: '\u06cc_\u062f_\u0633_\u0686_\u067e_\u062c_\u0634'.split(
            '_'
        ),
        weekdaysParseExact: !0,
        longDateFormat: {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY HH:mm',
            LLLL: 'dddd, D MMMM YYYY HH:mm',
        },
        meridiemParse:
            /\u0642\u0628\u0644 \u0627\u0632 \u0638\u0647\u0631|\u0628\u0639\u062f \u0627\u0632 \u0638\u0647\u0631/,
        isPM: function (e) {
            return /\u0628\u0639\u062f \u0627\u0632 \u0638\u0647\u0631/.test(e);
        },
        meridiem: function (e, a, t) {
            return e < 12
                ? '\u0642\u0628\u0644 \u0627\u0632 \u0638\u0647\u0631'
                : '\u0628\u0639\u062f \u0627\u0632 \u0638\u0647\u0631';
        },
        calendar: {
            sameDay:
                '[\u0627\u0645\u0631\u0648\u0632 \u0633\u0627\u0639\u062a] LT',
            nextDay: '[\u0641\u0631\u062f\u0627 \u0633\u0627\u0639\u062a] LT',
            nextWeek: 'dddd [\u0633\u0627\u0639\u062a] LT',
            lastDay:
                '[\u062f\u06cc\u0631\u0648\u0632 \u0633\u0627\u0639\u062a] LT',
            lastWeek: 'dddd [\u067e\u06cc\u0634] [\u0633\u0627\u0639\u062a] LT',
            sameElse: 'L',
        },
        relativeTime: {
            future: '\u062f\u0631 %s',
            past: '%s \u067e\u06cc\u0634',
            s: '\u0686\u0646\u062f \u062b\u0627\u0646\u06cc\u0647',
            ss: '\u062b\u0627\u0646\u06cc\u0647 d%',
            m: '\u06cc\u06a9 \u062f\u0642\u06cc\u0642\u0647',
            mm: '%d \u062f\u0642\u06cc\u0642\u0647',
            h: '\u06cc\u06a9 \u0633\u0627\u0639\u062a',
            hh: '%d \u0633\u0627\u0639\u062a',
            d: '\u06cc\u06a9 \u0631\u0648\u0632',
            dd: '%d \u0631\u0648\u0632',
            M: '\u06cc\u06a9 \u0645\u0627\u0647',
            MM: '%d \u0645\u0627\u0647',
            y: '\u06cc\u06a9 \u0633\u0627\u0644',
            yy: '%d \u0633\u0627\u0644',
        },
        preparse: function (e) {
            return e
                .replace(/[\u06f0-\u06f9]/g, function (e) {
                    return Ns[e];
                })
                .replace(/\u060c/g, ',');
        },
        postformat: function (e) {
            return e
                .replace(/\d/g, function (e) {
                    return Js[e];
                })
                .replace(/,/g, '\u060c');
        },
        dayOfMonthOrdinalParse: /\d{1,2}\u0645/,
        ordinal: '%d\u0645',
        week: { dow: 6, doy: 12 },
    });
    var Rs =
            'nolla yksi kaksi kolme nelj\xe4 viisi kuusi seitsem\xe4n kahdeksan yhdeks\xe4n'.split(
                ' '
            ),
        Cs = [
            'nolla',
            'yhden',
            'kahden',
            'kolmen',
            'nelj\xe4n',
            'viiden',
            'kuuden',
            Rs[7],
            Rs[8],
            Rs[9],
        ];
    function Is(e, a, t, s) {
        var n,
            d,
            r = '';
        switch (t) {
            case 's':
                return s ? 'muutaman sekunnin' : 'muutama sekunti';
            case 'ss':
                return s ? 'sekunnin' : 'sekuntia';
            case 'm':
                return s ? 'minuutin' : 'minuutti';
            case 'mm':
                r = s ? 'minuutin' : 'minuuttia';
                break;
            case 'h':
                return s ? 'tunnin' : 'tunti';
            case 'hh':
                r = s ? 'tunnin' : 'tuntia';
                break;
            case 'd':
                return s ? 'p\xe4iv\xe4n' : 'p\xe4iv\xe4';
            case 'dd':
                r = s ? 'p\xe4iv\xe4n' : 'p\xe4iv\xe4\xe4';
                break;
            case 'M':
                return s ? 'kuukauden' : 'kuukausi';
            case 'MM':
                r = s ? 'kuukauden' : 'kuukautta';
                break;
            case 'y':
                return s ? 'vuoden' : 'vuosi';
            case 'yy':
                r = s ? 'vuoden' : 'vuotta';
                break;
        }
        return (
            (d = s), (r = ((n = e) < 10 ? (d ? Cs[n] : Rs[n]) : n) + ' ' + r)
        );
    }
    l.defineLocale('fi', {
        months: 'tammikuu_helmikuu_maaliskuu_huhtikuu_toukokuu_kes\xe4kuu_hein\xe4kuu_elokuu_syyskuu_lokakuu_marraskuu_joulukuu'.split(
            '_'
        ),
        monthsShort:
            'tammi_helmi_maalis_huhti_touko_kes\xe4_hein\xe4_elo_syys_loka_marras_joulu'.split(
                '_'
            ),
        weekdays:
            'sunnuntai_maanantai_tiistai_keskiviikko_torstai_perjantai_lauantai'.split(
                '_'
            ),
        weekdaysShort: 'su_ma_ti_ke_to_pe_la'.split('_'),
        weekdaysMin: 'su_ma_ti_ke_to_pe_la'.split('_'),
        longDateFormat: {
            LT: 'HH.mm',
            LTS: 'HH.mm.ss',
            L: 'DD.MM.YYYY',
            LL: 'Do MMMM[ta] YYYY',
            LLL: 'Do MMMM[ta] YYYY, [klo] HH.mm',
            LLLL: 'dddd, Do MMMM[ta] YYYY, [klo] HH.mm',
            l: 'D.M.YYYY',
            ll: 'Do MMM YYYY',
            lll: 'Do MMM YYYY, [klo] HH.mm',
            llll: 'ddd, Do MMM YYYY, [klo] HH.mm',
        },
        calendar: {
            sameDay: '[t\xe4n\xe4\xe4n] [klo] LT',
            nextDay: '[huomenna] [klo] LT',
            nextWeek: 'dddd [klo] LT',
            lastDay: '[eilen] [klo] LT',
            lastWeek: '[viime] dddd[na] [klo] LT',
            sameElse: 'L',
        },
        relativeTime: {
            future: '%s p\xe4\xe4st\xe4',
            past: '%s sitten',
            s: Is,
            ss: Is,
            m: Is,
            mm: Is,
            h: Is,
            hh: Is,
            d: Is,
            dd: Is,
            M: Is,
            MM: Is,
            y: Is,
            yy: Is,
        },
        dayOfMonthOrdinalParse: /\d{1,2}\./,
        ordinal: '%d.',
        week: { dow: 1, doy: 4 },
    }),
        l.defineLocale('fo', {
            months: 'januar_februar_mars_apr\xedl_mai_juni_juli_august_september_oktober_november_desember'.split(
                '_'
            ),
            monthsShort:
                'jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_'),
            weekdays:
                'sunnudagur_m\xe1nadagur_t\xfdsdagur_mikudagur_h\xf3sdagur_fr\xedggjadagur_leygardagur'.split(
                    '_'
                ),
            weekdaysShort: 'sun_m\xe1n_t\xfds_mik_h\xf3s_fr\xed_ley'.split('_'),
            weekdaysMin: 'su_m\xe1_t\xfd_mi_h\xf3_fr_le'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd D. MMMM, YYYY HH:mm',
            },
            calendar: {
                sameDay: '[\xcd dag kl.] LT',
                nextDay: '[\xcd morgin kl.] LT',
                nextWeek: 'dddd [kl.] LT',
                lastDay: '[\xcd gj\xe1r kl.] LT',
                lastWeek: '[s\xed\xf0stu] dddd [kl] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: 'um %s',
                past: '%s s\xed\xf0ani',
                s: 'f\xe1 sekund',
                ss: '%d sekundir',
                m: 'ein minuttur',
                mm: '%d minuttir',
                h: 'ein t\xedmi',
                hh: '%d t\xedmar',
                d: 'ein dagur',
                dd: '%d dagar',
                M: 'ein m\xe1na\xf0ur',
                MM: '%d m\xe1na\xf0ir',
                y: 'eitt \xe1r',
                yy: '%d \xe1r',
            },
            dayOfMonthOrdinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: { dow: 1, doy: 4 },
        }),
        l.defineLocale('fr-ca', {
            months: 'janvier_f\xe9vrier_mars_avril_mai_juin_juillet_ao\xfbt_septembre_octobre_novembre_d\xe9cembre'.split(
                '_'
            ),
            monthsShort:
                'janv._f\xe9vr._mars_avr._mai_juin_juil._ao\xfbt_sept._oct._nov._d\xe9c.'.split(
                    '_'
                ),
            monthsParseExact: !0,
            weekdays:
                'dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi'.split(
                    '_'
                ),
            weekdaysShort: 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
            weekdaysMin: 'di_lu_ma_me_je_ve_sa'.split('_'),
            weekdaysParseExact: !0,
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'YYYY-MM-DD',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd D MMMM YYYY HH:mm',
            },
            calendar: {
                sameDay: '[Aujourd\u2019hui \xe0] LT',
                nextDay: '[Demain \xe0] LT',
                nextWeek: 'dddd [\xe0] LT',
                lastDay: '[Hier \xe0] LT',
                lastWeek: 'dddd [dernier \xe0] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: 'dans %s',
                past: 'il y a %s',
                s: 'quelques secondes',
                ss: '%d secondes',
                m: 'une minute',
                mm: '%d minutes',
                h: 'une heure',
                hh: '%d heures',
                d: 'un jour',
                dd: '%d jours',
                M: 'un mois',
                MM: '%d mois',
                y: 'un an',
                yy: '%d ans',
            },
            dayOfMonthOrdinalParse: /\d{1,2}(er|e)/,
            ordinal: function (e, a) {
                switch (a) {
                    default:
                    case 'M':
                    case 'Q':
                    case 'D':
                    case 'DDD':
                    case 'd':
                        return e + (1 === e ? 'er' : 'e');
                    case 'w':
                    case 'W':
                        return e + (1 === e ? 're' : 'e');
                }
            },
        }),
        l.defineLocale('fr-ch', {
            months: 'janvier_f\xe9vrier_mars_avril_mai_juin_juillet_ao\xfbt_septembre_octobre_novembre_d\xe9cembre'.split(
                '_'
            ),
            monthsShort:
                'janv._f\xe9vr._mars_avr._mai_juin_juil._ao\xfbt_sept._oct._nov._d\xe9c.'.split(
                    '_'
                ),
            monthsParseExact: !0,
            weekdays:
                'dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi'.split(
                    '_'
                ),
            weekdaysShort: 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
            weekdaysMin: 'di_lu_ma_me_je_ve_sa'.split('_'),
            weekdaysParseExact: !0,
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD.MM.YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd D MMMM YYYY HH:mm',
            },
            calendar: {
                sameDay: '[Aujourd\u2019hui \xe0] LT',
                nextDay: '[Demain \xe0] LT',
                nextWeek: 'dddd [\xe0] LT',
                lastDay: '[Hier \xe0] LT',
                lastWeek: 'dddd [dernier \xe0] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: 'dans %s',
                past: 'il y a %s',
                s: 'quelques secondes',
                ss: '%d secondes',
                m: 'une minute',
                mm: '%d minutes',
                h: 'une heure',
                hh: '%d heures',
                d: 'un jour',
                dd: '%d jours',
                M: 'un mois',
                MM: '%d mois',
                y: 'un an',
                yy: '%d ans',
            },
            dayOfMonthOrdinalParse: /\d{1,2}(er|e)/,
            ordinal: function (e, a) {
                switch (a) {
                    default:
                    case 'M':
                    case 'Q':
                    case 'D':
                    case 'DDD':
                    case 'd':
                        return e + (1 === e ? 'er' : 'e');
                    case 'w':
                    case 'W':
                        return e + (1 === e ? 're' : 'e');
                }
            },
            week: { dow: 1, doy: 4 },
        }),
        l.defineLocale('fr', {
            months: 'janvier_f\xe9vrier_mars_avril_mai_juin_juillet_ao\xfbt_septembre_octobre_novembre_d\xe9cembre'.split(
                '_'
            ),
            monthsShort:
                'janv._f\xe9vr._mars_avr._mai_juin_juil._ao\xfbt_sept._oct._nov._d\xe9c.'.split(
                    '_'
                ),
            monthsParseExact: !0,
            weekdays:
                'dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi'.split(
                    '_'
                ),
            weekdaysShort: 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
            weekdaysMin: 'di_lu_ma_me_je_ve_sa'.split('_'),
            weekdaysParseExact: !0,
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd D MMMM YYYY HH:mm',
            },
            calendar: {
                sameDay: '[Aujourd\u2019hui \xe0] LT',
                nextDay: '[Demain \xe0] LT',
                nextWeek: 'dddd [\xe0] LT',
                lastDay: '[Hier \xe0] LT',
                lastWeek: 'dddd [dernier \xe0] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: 'dans %s',
                past: 'il y a %s',
                s: 'quelques secondes',
                ss: '%d secondes',
                m: 'une minute',
                mm: '%d minutes',
                h: 'une heure',
                hh: '%d heures',
                d: 'un jour',
                dd: '%d jours',
                M: 'un mois',
                MM: '%d mois',
                y: 'un an',
                yy: '%d ans',
            },
            dayOfMonthOrdinalParse: /\d{1,2}(er|)/,
            ordinal: function (e, a) {
                switch (a) {
                    case 'D':
                        return e + (1 === e ? 'er' : '');
                    default:
                    case 'M':
                    case 'Q':
                    case 'DDD':
                    case 'd':
                        return e + (1 === e ? 'er' : 'e');
                    case 'w':
                    case 'W':
                        return e + (1 === e ? 're' : 'e');
                }
            },
            week: { dow: 1, doy: 4 },
        });
    var Us = 'jan._feb._mrt._apr._mai_jun._jul._aug._sep._okt._nov._des.'.split(
            '_'
        ),
        Gs = 'jan_feb_mrt_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_');
    l.defineLocale('fy', {
        months: 'jannewaris_febrewaris_maart_april_maaie_juny_july_augustus_septimber_oktober_novimber_desimber'.split(
            '_'
        ),
        monthsShort: function (e, a) {
            return e ? (/-MMM-/.test(a) ? Gs[e.month()] : Us[e.month()]) : Us;
        },
        monthsParseExact: !0,
        weekdays: 'snein_moandei_tiisdei_woansdei_tongersdei_freed_sneon'.split(
            '_'
        ),
        weekdaysShort: 'si._mo._ti._wo._to._fr._so.'.split('_'),
        weekdaysMin: 'Si_Mo_Ti_Wo_To_Fr_So'.split('_'),
        weekdaysParseExact: !0,
        longDateFormat: {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L: 'DD-MM-YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY HH:mm',
            LLLL: 'dddd D MMMM YYYY HH:mm',
        },
        calendar: {
            sameDay: '[hjoed om] LT',
            nextDay: '[moarn om] LT',
            nextWeek: 'dddd [om] LT',
            lastDay: '[juster om] LT',
            lastWeek: '[\xf4fr\xfbne] dddd [om] LT',
            sameElse: 'L',
        },
        relativeTime: {
            future: 'oer %s',
            past: '%s lyn',
            s: 'in pear sekonden',
            ss: '%d sekonden',
            m: 'ien min\xfat',
            mm: '%d minuten',
            h: 'ien oere',
            hh: '%d oeren',
            d: 'ien dei',
            dd: '%d dagen',
            M: 'ien moanne',
            MM: '%d moannen',
            y: 'ien jier',
            yy: '%d jierren',
        },
        dayOfMonthOrdinalParse: /\d{1,2}(ste|de)/,
        ordinal: function (e) {
            return e + (1 === e || 8 === e || 20 <= e ? 'ste' : 'de');
        },
        week: { dow: 1, doy: 4 },
    });
    l.defineLocale('ga', {
        months: [
            'Ean\xe1ir',
            'Feabhra',
            'M\xe1rta',
            'Aibre\xe1n',
            'Bealtaine',
            'M\xe9itheamh',
            'I\xfail',
            'L\xfanasa',
            'Me\xe1n F\xf3mhair',
            'Deaireadh F\xf3mhair',
            'Samhain',
            'Nollaig',
        ],
        monthsShort: [
            'Ean\xe1',
            'Feab',
            'M\xe1rt',
            'Aibr',
            'Beal',
            'M\xe9it',
            'I\xfail',
            'L\xfana',
            'Me\xe1n',
            'Deai',
            'Samh',
            'Noll',
        ],
        monthsParseExact: !0,
        weekdays: [
            'D\xe9 Domhnaigh',
            'D\xe9 Luain',
            'D\xe9 M\xe1irt',
            'D\xe9 C\xe9adaoin',
            'D\xe9ardaoin',
            'D\xe9 hAoine',
            'D\xe9 Satharn',
        ],
        weekdaysShort: [
            'Dom',
            'Lua',
            'M\xe1i',
            'C\xe9a',
            'D\xe9a',
            'hAo',
            'Sat',
        ],
        weekdaysMin: ['Do', 'Lu', 'M\xe1', 'Ce', 'D\xe9', 'hA', 'Sa'],
        longDateFormat: {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY HH:mm',
            LLLL: 'dddd, D MMMM YYYY HH:mm',
        },
        calendar: {
            sameDay: '[Inniu ag] LT',
            nextDay: '[Am\xe1rach ag] LT',
            nextWeek: 'dddd [ag] LT',
            lastDay: '[Inn\xe9 aig] LT',
            lastWeek: 'dddd [seo caite] [ag] LT',
            sameElse: 'L',
        },
        relativeTime: {
            future: 'i %s',
            past: '%s \xf3 shin',
            s: 'c\xfapla soicind',
            ss: '%d soicind',
            m: 'n\xf3im\xe9ad',
            mm: '%d n\xf3im\xe9ad',
            h: 'uair an chloig',
            hh: '%d uair an chloig',
            d: 'l\xe1',
            dd: '%d l\xe1',
            M: 'm\xed',
            MM: '%d m\xed',
            y: 'bliain',
            yy: '%d bliain',
        },
        dayOfMonthOrdinalParse: /\d{1,2}(d|na|mh)/,
        ordinal: function (e) {
            return e + (1 === e ? 'd' : e % 10 == 2 ? 'na' : 'mh');
        },
        week: { dow: 1, doy: 4 },
    });
    function Vs(e, a, t, s) {
        var n = {
            s: ['thodde secondanim', 'thodde second'],
            ss: [e + ' secondanim', e + ' second'],
            m: ['eka mintan', 'ek minute'],
            mm: [e + ' mintanim', e + ' mintam'],
            h: ['eka voran', 'ek vor'],
            hh: [e + ' voranim', e + ' voram'],
            d: ['eka disan', 'ek dis'],
            dd: [e + ' disanim', e + ' dis'],
            M: ['eka mhoinean', 'ek mhoino'],
            MM: [e + ' mhoineanim', e + ' mhoine'],
            y: ['eka vorsan', 'ek voros'],
            yy: [e + ' vorsanim', e + ' vorsam'],
        };
        return a ? n[t][0] : n[t][1];
    }
    l.defineLocale('gd', {
        months: [
            'Am Faoilleach',
            'An Gearran',
            'Am M\xe0rt',
            'An Giblean',
            'An C\xe8itean',
            'An t-\xd2gmhios',
            'An t-Iuchar',
            'An L\xf9nastal',
            'An t-Sultain',
            'An D\xe0mhair',
            'An t-Samhain',
            'An D\xf9bhlachd',
        ],
        monthsShort: [
            'Faoi',
            'Gear',
            'M\xe0rt',
            'Gibl',
            'C\xe8it',
            '\xd2gmh',
            'Iuch',
            'L\xf9n',
            'Sult',
            'D\xe0mh',
            'Samh',
            'D\xf9bh',
        ],
        monthsParseExact: !0,
        weekdays: [
            'Did\xf2mhnaich',
            'Diluain',
            'Dim\xe0irt',
            'Diciadain',
            'Diardaoin',
            'Dihaoine',
            'Disathairne',
        ],
        weekdaysShort: ['Did', 'Dil', 'Dim', 'Dic', 'Dia', 'Dih', 'Dis'],
        weekdaysMin: ['D\xf2', 'Lu', 'M\xe0', 'Ci', 'Ar', 'Ha', 'Sa'],
        longDateFormat: {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY HH:mm',
            LLLL: 'dddd, D MMMM YYYY HH:mm',
        },
        calendar: {
            sameDay: '[An-diugh aig] LT',
            nextDay: '[A-m\xe0ireach aig] LT',
            nextWeek: 'dddd [aig] LT',
            lastDay: '[An-d\xe8 aig] LT',
            lastWeek: 'dddd [seo chaidh] [aig] LT',
            sameElse: 'L',
        },
        relativeTime: {
            future: 'ann an %s',
            past: 'bho chionn %s',
            s: 'beagan diogan',
            ss: '%d diogan',
            m: 'mionaid',
            mm: '%d mionaidean',
            h: 'uair',
            hh: '%d uairean',
            d: 'latha',
            dd: '%d latha',
            M: 'm\xecos',
            MM: '%d m\xecosan',
            y: 'bliadhna',
            yy: '%d bliadhna',
        },
        dayOfMonthOrdinalParse: /\d{1,2}(d|na|mh)/,
        ordinal: function (e) {
            return e + (1 === e ? 'd' : e % 10 == 2 ? 'na' : 'mh');
        },
        week: { dow: 1, doy: 4 },
    }),
        l.defineLocale('gl', {
            months: 'xaneiro_febreiro_marzo_abril_maio_xu\xf1o_xullo_agosto_setembro_outubro_novembro_decembro'.split(
                '_'
            ),
            monthsShort:
                'xan._feb._mar._abr._mai._xu\xf1._xul._ago._set._out._nov._dec.'.split(
                    '_'
                ),
            monthsParseExact: !0,
            weekdays:
                'domingo_luns_martes_m\xe9rcores_xoves_venres_s\xe1bado'.split(
                    '_'
                ),
            weekdaysShort: 'dom._lun._mar._m\xe9r._xov._ven._s\xe1b.'.split(
                '_'
            ),
            weekdaysMin: 'do_lu_ma_m\xe9_xo_ve_s\xe1'.split('_'),
            weekdaysParseExact: !0,
            longDateFormat: {
                LT: 'H:mm',
                LTS: 'H:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D [de] MMMM [de] YYYY',
                LLL: 'D [de] MMMM [de] YYYY H:mm',
                LLLL: 'dddd, D [de] MMMM [de] YYYY H:mm',
            },
            calendar: {
                sameDay: function () {
                    return (
                        '[hoxe ' +
                        (1 !== this.hours() ? '\xe1s' : '\xe1') +
                        '] LT'
                    );
                },
                nextDay: function () {
                    return (
                        '[ma\xf1\xe1 ' +
                        (1 !== this.hours() ? '\xe1s' : '\xe1') +
                        '] LT'
                    );
                },
                nextWeek: function () {
                    return (
                        'dddd [' + (1 !== this.hours() ? '\xe1s' : 'a') + '] LT'
                    );
                },
                lastDay: function () {
                    return (
                        '[onte ' + (1 !== this.hours() ? '\xe1' : 'a') + '] LT'
                    );
                },
                lastWeek: function () {
                    return (
                        '[o] dddd [pasado ' +
                        (1 !== this.hours() ? '\xe1s' : 'a') +
                        '] LT'
                    );
                },
                sameElse: 'L',
            },
            relativeTime: {
                future: function (e) {
                    return 0 === e.indexOf('un') ? 'n' + e : 'en ' + e;
                },
                past: 'hai %s',
                s: 'uns segundos',
                ss: '%d segundos',
                m: 'un minuto',
                mm: '%d minutos',
                h: 'unha hora',
                hh: '%d horas',
                d: 'un d\xeda',
                dd: '%d d\xedas',
                M: 'un mes',
                MM: '%d meses',
                y: 'un ano',
                yy: '%d anos',
            },
            dayOfMonthOrdinalParse: /\d{1,2}\xba/,
            ordinal: '%d\xba',
            week: { dow: 1, doy: 4 },
        }),
        l.defineLocale('gom-latn', {
            months: 'Janer_Febrer_Mars_Abril_Mai_Jun_Julai_Agost_Setembr_Otubr_Novembr_Dezembr'.split(
                '_'
            ),
            monthsShort:
                'Jan._Feb._Mars_Abr._Mai_Jun_Jul._Ago._Set._Otu._Nov._Dez.'.split(
                    '_'
                ),
            monthsParseExact: !0,
            weekdays:
                "Aitar_Somar_Mongllar_Budvar_Brestar_Sukrar_Son'var".split('_'),
            weekdaysShort: 'Ait._Som._Mon._Bud._Bre._Suk._Son.'.split('_'),
            weekdaysMin: 'Ai_Sm_Mo_Bu_Br_Su_Sn'.split('_'),
            weekdaysParseExact: !0,
            longDateFormat: {
                LT: 'A h:mm [vazta]',
                LTS: 'A h:mm:ss [vazta]',
                L: 'DD-MM-YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY A h:mm [vazta]',
                LLLL: 'dddd, MMMM[achea] Do, YYYY, A h:mm [vazta]',
                llll: 'ddd, D MMM YYYY, A h:mm [vazta]',
            },
            calendar: {
                sameDay: '[Aiz] LT',
                nextDay: '[Faleam] LT',
                nextWeek: '[Ieta to] dddd[,] LT',
                lastDay: '[Kal] LT',
                lastWeek: '[Fatlo] dddd[,] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: '%s',
                past: '%s adim',
                s: Vs,
                ss: Vs,
                m: Vs,
                mm: Vs,
                h: Vs,
                hh: Vs,
                d: Vs,
                dd: Vs,
                M: Vs,
                MM: Vs,
                y: Vs,
                yy: Vs,
            },
            dayOfMonthOrdinalParse: /\d{1,2}(er)/,
            ordinal: function (e, a) {
                switch (a) {
                    case 'D':
                        return e + 'er';
                    default:
                    case 'M':
                    case 'Q':
                    case 'DDD':
                    case 'd':
                    case 'w':
                    case 'W':
                        return e;
                }
            },
            week: { dow: 1, doy: 4 },
            meridiemParse: /rati|sokalli|donparam|sanje/,
            meridiemHour: function (e, a) {
                return (
                    12 === e && (e = 0),
                    'rati' === a
                        ? e < 4
                            ? e
                            : e + 12
                        : 'sokalli' === a
                        ? e
                        : 'donparam' === a
                        ? 12 < e
                            ? e
                            : e + 12
                        : 'sanje' === a
                        ? e + 12
                        : void 0
                );
            },
            meridiem: function (e, a, t) {
                return e < 4
                    ? 'rati'
                    : e < 12
                    ? 'sokalli'
                    : e < 16
                    ? 'donparam'
                    : e < 20
                    ? 'sanje'
                    : 'rati';
            },
        });
    var Ks = {
            1: '\u0ae7',
            2: '\u0ae8',
            3: '\u0ae9',
            4: '\u0aea',
            5: '\u0aeb',
            6: '\u0aec',
            7: '\u0aed',
            8: '\u0aee',
            9: '\u0aef',
            0: '\u0ae6',
        },
        Zs = {
            '\u0ae7': '1',
            '\u0ae8': '2',
            '\u0ae9': '3',
            '\u0aea': '4',
            '\u0aeb': '5',
            '\u0aec': '6',
            '\u0aed': '7',
            '\u0aee': '8',
            '\u0aef': '9',
            '\u0ae6': '0',
        };
    l.defineLocale('gu', {
        months: '\u0a9c\u0abe\u0aa8\u0acd\u0aaf\u0ac1\u0a86\u0ab0\u0ac0_\u0aab\u0ac7\u0aac\u0acd\u0ab0\u0ac1\u0a86\u0ab0\u0ac0_\u0aae\u0abe\u0ab0\u0acd\u0a9a_\u0a8f\u0aaa\u0acd\u0ab0\u0abf\u0ab2_\u0aae\u0ac7_\u0a9c\u0ac2\u0aa8_\u0a9c\u0ac1\u0ab2\u0abe\u0a88_\u0a91\u0a97\u0ab8\u0acd\u0a9f_\u0ab8\u0aaa\u0acd\u0a9f\u0ac7\u0aae\u0acd\u0aac\u0ab0_\u0a91\u0a95\u0acd\u0a9f\u0acd\u0aac\u0ab0_\u0aa8\u0ab5\u0ac7\u0aae\u0acd\u0aac\u0ab0_\u0aa1\u0abf\u0ab8\u0ac7\u0aae\u0acd\u0aac\u0ab0'.split(
            '_'
        ),
        monthsShort:
            '\u0a9c\u0abe\u0aa8\u0acd\u0aaf\u0ac1._\u0aab\u0ac7\u0aac\u0acd\u0ab0\u0ac1._\u0aae\u0abe\u0ab0\u0acd\u0a9a_\u0a8f\u0aaa\u0acd\u0ab0\u0abf._\u0aae\u0ac7_\u0a9c\u0ac2\u0aa8_\u0a9c\u0ac1\u0ab2\u0abe._\u0a91\u0a97._\u0ab8\u0aaa\u0acd\u0a9f\u0ac7._\u0a91\u0a95\u0acd\u0a9f\u0acd._\u0aa8\u0ab5\u0ac7._\u0aa1\u0abf\u0ab8\u0ac7.'.split(
                '_'
            ),
        monthsParseExact: !0,
        weekdays:
            '\u0ab0\u0ab5\u0abf\u0ab5\u0abe\u0ab0_\u0ab8\u0acb\u0aae\u0ab5\u0abe\u0ab0_\u0aae\u0a82\u0a97\u0ab3\u0ab5\u0abe\u0ab0_\u0aac\u0ac1\u0aa7\u0acd\u0ab5\u0abe\u0ab0_\u0a97\u0ac1\u0ab0\u0ac1\u0ab5\u0abe\u0ab0_\u0ab6\u0ac1\u0a95\u0acd\u0ab0\u0ab5\u0abe\u0ab0_\u0ab6\u0aa8\u0abf\u0ab5\u0abe\u0ab0'.split(
                '_'
            ),
        weekdaysShort:
            '\u0ab0\u0ab5\u0abf_\u0ab8\u0acb\u0aae_\u0aae\u0a82\u0a97\u0ab3_\u0aac\u0ac1\u0aa7\u0acd_\u0a97\u0ac1\u0ab0\u0ac1_\u0ab6\u0ac1\u0a95\u0acd\u0ab0_\u0ab6\u0aa8\u0abf'.split(
                '_'
            ),
        weekdaysMin:
            '\u0ab0_\u0ab8\u0acb_\u0aae\u0a82_\u0aac\u0ac1_\u0a97\u0ac1_\u0ab6\u0ac1_\u0ab6'.split(
                '_'
            ),
        longDateFormat: {
            LT: 'A h:mm \u0ab5\u0abe\u0a97\u0acd\u0aaf\u0ac7',
            LTS: 'A h:mm:ss \u0ab5\u0abe\u0a97\u0acd\u0aaf\u0ac7',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY, A h:mm \u0ab5\u0abe\u0a97\u0acd\u0aaf\u0ac7',
            LLLL: 'dddd, D MMMM YYYY, A h:mm \u0ab5\u0abe\u0a97\u0acd\u0aaf\u0ac7',
        },
        calendar: {
            sameDay: '[\u0a86\u0a9c] LT',
            nextDay: '[\u0a95\u0abe\u0ab2\u0ac7] LT',
            nextWeek: 'dddd, LT',
            lastDay: '[\u0a97\u0a87\u0a95\u0abe\u0ab2\u0ac7] LT',
            lastWeek: '[\u0aaa\u0abe\u0a9b\u0ab2\u0abe] dddd, LT',
            sameElse: 'L',
        },
        relativeTime: {
            future: '%s \u0aae\u0abe',
            past: '%s \u0aaa\u0ac7\u0ab9\u0ab2\u0abe',
            s: '\u0a85\u0aae\u0ac1\u0a95 \u0aaa\u0ab3\u0acb',
            ss: '%d \u0ab8\u0ac7\u0a95\u0a82\u0aa1',
            m: '\u0a8f\u0a95 \u0aae\u0abf\u0aa8\u0abf\u0a9f',
            mm: '%d \u0aae\u0abf\u0aa8\u0abf\u0a9f',
            h: '\u0a8f\u0a95 \u0a95\u0ab2\u0abe\u0a95',
            hh: '%d \u0a95\u0ab2\u0abe\u0a95',
            d: '\u0a8f\u0a95 \u0aa6\u0abf\u0ab5\u0ab8',
            dd: '%d \u0aa6\u0abf\u0ab5\u0ab8',
            M: '\u0a8f\u0a95 \u0aae\u0ab9\u0abf\u0aa8\u0acb',
            MM: '%d \u0aae\u0ab9\u0abf\u0aa8\u0acb',
            y: '\u0a8f\u0a95 \u0ab5\u0ab0\u0acd\u0ab7',
            yy: '%d \u0ab5\u0ab0\u0acd\u0ab7',
        },
        preparse: function (e) {
            return e.replace(
                /[\u0ae7\u0ae8\u0ae9\u0aea\u0aeb\u0aec\u0aed\u0aee\u0aef\u0ae6]/g,
                function (e) {
                    return Zs[e];
                }
            );
        },
        postformat: function (e) {
            return e.replace(/\d/g, function (e) {
                return Ks[e];
            });
        },
        meridiemParse:
            /\u0ab0\u0abe\u0aa4|\u0aac\u0aaa\u0acb\u0ab0|\u0ab8\u0ab5\u0abe\u0ab0|\u0ab8\u0abe\u0a82\u0a9c/,
        meridiemHour: function (e, a) {
            return (
                12 === e && (e = 0),
                '\u0ab0\u0abe\u0aa4' === a
                    ? e < 4
                        ? e
                        : e + 12
                    : '\u0ab8\u0ab5\u0abe\u0ab0' === a
                    ? e
                    : '\u0aac\u0aaa\u0acb\u0ab0' === a
                    ? 10 <= e
                        ? e
                        : e + 12
                    : '\u0ab8\u0abe\u0a82\u0a9c' === a
                    ? e + 12
                    : void 0
            );
        },
        meridiem: function (e, a, t) {
            return e < 4
                ? '\u0ab0\u0abe\u0aa4'
                : e < 10
                ? '\u0ab8\u0ab5\u0abe\u0ab0'
                : e < 17
                ? '\u0aac\u0aaa\u0acb\u0ab0'
                : e < 20
                ? '\u0ab8\u0abe\u0a82\u0a9c'
                : '\u0ab0\u0abe\u0aa4';
        },
        week: { dow: 0, doy: 6 },
    }),
        l.defineLocale('he', {
            months: '\u05d9\u05e0\u05d5\u05d0\u05e8_\u05e4\u05d1\u05e8\u05d5\u05d0\u05e8_\u05de\u05e8\u05e5_\u05d0\u05e4\u05e8\u05d9\u05dc_\u05de\u05d0\u05d9_\u05d9\u05d5\u05e0\u05d9_\u05d9\u05d5\u05dc\u05d9_\u05d0\u05d5\u05d2\u05d5\u05e1\u05d8_\u05e1\u05e4\u05d8\u05de\u05d1\u05e8_\u05d0\u05d5\u05e7\u05d8\u05d5\u05d1\u05e8_\u05e0\u05d5\u05d1\u05de\u05d1\u05e8_\u05d3\u05e6\u05de\u05d1\u05e8'.split(
                '_'
            ),
            monthsShort:
                '\u05d9\u05e0\u05d5\u05f3_\u05e4\u05d1\u05e8\u05f3_\u05de\u05e8\u05e5_\u05d0\u05e4\u05e8\u05f3_\u05de\u05d0\u05d9_\u05d9\u05d5\u05e0\u05d9_\u05d9\u05d5\u05dc\u05d9_\u05d0\u05d5\u05d2\u05f3_\u05e1\u05e4\u05d8\u05f3_\u05d0\u05d5\u05e7\u05f3_\u05e0\u05d5\u05d1\u05f3_\u05d3\u05e6\u05de\u05f3'.split(
                    '_'
                ),
            weekdays:
                '\u05e8\u05d0\u05e9\u05d5\u05df_\u05e9\u05e0\u05d9_\u05e9\u05dc\u05d9\u05e9\u05d9_\u05e8\u05d1\u05d9\u05e2\u05d9_\u05d7\u05de\u05d9\u05e9\u05d9_\u05e9\u05d9\u05e9\u05d9_\u05e9\u05d1\u05ea'.split(
                    '_'
                ),
            weekdaysShort:
                '\u05d0\u05f3_\u05d1\u05f3_\u05d2\u05f3_\u05d3\u05f3_\u05d4\u05f3_\u05d5\u05f3_\u05e9\u05f3'.split(
                    '_'
                ),
            weekdaysMin:
                '\u05d0_\u05d1_\u05d2_\u05d3_\u05d4_\u05d5_\u05e9'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D [\u05d1]MMMM YYYY',
                LLL: 'D [\u05d1]MMMM YYYY HH:mm',
                LLLL: 'dddd, D [\u05d1]MMMM YYYY HH:mm',
                l: 'D/M/YYYY',
                ll: 'D MMM YYYY',
                lll: 'D MMM YYYY HH:mm',
                llll: 'ddd, D MMM YYYY HH:mm',
            },
            calendar: {
                sameDay: '[\u05d4\u05d9\u05d5\u05dd \u05d1\u05be]LT',
                nextDay: '[\u05de\u05d7\u05e8 \u05d1\u05be]LT',
                nextWeek: 'dddd [\u05d1\u05e9\u05e2\u05d4] LT',
                lastDay: '[\u05d0\u05ea\u05de\u05d5\u05dc \u05d1\u05be]LT',
                lastWeek:
                    '[\u05d1\u05d9\u05d5\u05dd] dddd [\u05d4\u05d0\u05d7\u05e8\u05d5\u05df \u05d1\u05e9\u05e2\u05d4] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: '\u05d1\u05e2\u05d5\u05d3 %s',
                past: '\u05dc\u05e4\u05e0\u05d9 %s',
                s: '\u05de\u05e1\u05e4\u05e8 \u05e9\u05e0\u05d9\u05d5\u05ea',
                ss: '%d \u05e9\u05e0\u05d9\u05d5\u05ea',
                m: '\u05d3\u05e7\u05d4',
                mm: '%d \u05d3\u05e7\u05d5\u05ea',
                h: '\u05e9\u05e2\u05d4',
                hh: function (e) {
                    return 2 === e
                        ? '\u05e9\u05e2\u05ea\u05d9\u05d9\u05dd'
                        : e + ' \u05e9\u05e2\u05d5\u05ea';
                },
                d: '\u05d9\u05d5\u05dd',
                dd: function (e) {
                    return 2 === e
                        ? '\u05d9\u05d5\u05de\u05d9\u05d9\u05dd'
                        : e + ' \u05d9\u05de\u05d9\u05dd';
                },
                M: '\u05d7\u05d5\u05d3\u05e9',
                MM: function (e) {
                    return 2 === e
                        ? '\u05d7\u05d5\u05d3\u05e9\u05d9\u05d9\u05dd'
                        : e + ' \u05d7\u05d5\u05d3\u05e9\u05d9\u05dd';
                },
                y: '\u05e9\u05e0\u05d4',
                yy: function (e) {
                    return 2 === e
                        ? '\u05e9\u05e0\u05ea\u05d9\u05d9\u05dd'
                        : e % 10 == 0 && 10 !== e
                        ? e + ' \u05e9\u05e0\u05d4'
                        : e + ' \u05e9\u05e0\u05d9\u05dd';
                },
            },
            meridiemParse:
                /\u05d0\u05d7\u05d4"\u05e6|\u05dc\u05e4\u05e0\u05d4"\u05e6|\u05d0\u05d7\u05e8\u05d9 \u05d4\u05e6\u05d4\u05e8\u05d9\u05d9\u05dd|\u05dc\u05e4\u05e0\u05d9 \u05d4\u05e6\u05d4\u05e8\u05d9\u05d9\u05dd|\u05dc\u05e4\u05e0\u05d5\u05ea \u05d1\u05d5\u05e7\u05e8|\u05d1\u05d1\u05d5\u05e7\u05e8|\u05d1\u05e2\u05e8\u05d1/i,
            isPM: function (e) {
                return /^(\u05d0\u05d7\u05d4"\u05e6|\u05d0\u05d7\u05e8\u05d9 \u05d4\u05e6\u05d4\u05e8\u05d9\u05d9\u05dd|\u05d1\u05e2\u05e8\u05d1)$/.test(
                    e
                );
            },
            meridiem: function (e, a, t) {
                return e < 5
                    ? '\u05dc\u05e4\u05e0\u05d5\u05ea \u05d1\u05d5\u05e7\u05e8'
                    : e < 10
                    ? '\u05d1\u05d1\u05d5\u05e7\u05e8'
                    : e < 12
                    ? t
                        ? '\u05dc\u05e4\u05e0\u05d4"\u05e6'
                        : '\u05dc\u05e4\u05e0\u05d9 \u05d4\u05e6\u05d4\u05e8\u05d9\u05d9\u05dd'
                    : e < 18
                    ? t
                        ? '\u05d0\u05d7\u05d4"\u05e6'
                        : '\u05d0\u05d7\u05e8\u05d9 \u05d4\u05e6\u05d4\u05e8\u05d9\u05d9\u05dd'
                    : '\u05d1\u05e2\u05e8\u05d1';
            },
        });
    var $s = {
            1: '\u0967',
            2: '\u0968',
            3: '\u0969',
            4: '\u096a',
            5: '\u096b',
            6: '\u096c',
            7: '\u096d',
            8: '\u096e',
            9: '\u096f',
            0: '\u0966',
        },
        Bs = {
            '\u0967': '1',
            '\u0968': '2',
            '\u0969': '3',
            '\u096a': '4',
            '\u096b': '5',
            '\u096c': '6',
            '\u096d': '7',
            '\u096e': '8',
            '\u096f': '9',
            '\u0966': '0',
        };
    function qs(e, a, t) {
        var s = e + ' ';
        switch (t) {
            case 'ss':
                return (s +=
                    1 === e
                        ? 'sekunda'
                        : 2 === e || 3 === e || 4 === e
                        ? 'sekunde'
                        : 'sekundi');
            case 'm':
                return a ? 'jedna minuta' : 'jedne minute';
            case 'mm':
                return (s +=
                    1 === e
                        ? 'minuta'
                        : 2 === e || 3 === e || 4 === e
                        ? 'minute'
                        : 'minuta');
            case 'h':
                return a ? 'jedan sat' : 'jednog sata';
            case 'hh':
                return (s +=
                    1 === e
                        ? 'sat'
                        : 2 === e || 3 === e || 4 === e
                        ? 'sata'
                        : 'sati');
            case 'dd':
                return (s += 1 === e ? 'dan' : 'dana');
            case 'MM':
                return (s +=
                    1 === e
                        ? 'mjesec'
                        : 2 === e || 3 === e || 4 === e
                        ? 'mjeseca'
                        : 'mjeseci');
            case 'yy':
                return (s +=
                    1 === e
                        ? 'godina'
                        : 2 === e || 3 === e || 4 === e
                        ? 'godine'
                        : 'godina');
        }
    }
    l.defineLocale('hi', {
        months: '\u091c\u0928\u0935\u0930\u0940_\u092b\u093c\u0930\u0935\u0930\u0940_\u092e\u093e\u0930\u094d\u091a_\u0905\u092a\u094d\u0930\u0948\u0932_\u092e\u0908_\u091c\u0942\u0928_\u091c\u0941\u0932\u093e\u0908_\u0905\u0917\u0938\u094d\u0924_\u0938\u093f\u0924\u092e\u094d\u092c\u0930_\u0905\u0915\u094d\u091f\u0942\u092c\u0930_\u0928\u0935\u092e\u094d\u092c\u0930_\u0926\u093f\u0938\u092e\u094d\u092c\u0930'.split(
            '_'
        ),
        monthsShort:
            '\u091c\u0928._\u092b\u093c\u0930._\u092e\u093e\u0930\u094d\u091a_\u0905\u092a\u094d\u0930\u0948._\u092e\u0908_\u091c\u0942\u0928_\u091c\u0941\u0932._\u0905\u0917._\u0938\u093f\u0924._\u0905\u0915\u094d\u091f\u0942._\u0928\u0935._\u0926\u093f\u0938.'.split(
                '_'
            ),
        monthsParseExact: !0,
        weekdays:
            '\u0930\u0935\u093f\u0935\u093e\u0930_\u0938\u094b\u092e\u0935\u093e\u0930_\u092e\u0902\u0917\u0932\u0935\u093e\u0930_\u092c\u0941\u0927\u0935\u093e\u0930_\u0917\u0941\u0930\u0942\u0935\u093e\u0930_\u0936\u0941\u0915\u094d\u0930\u0935\u093e\u0930_\u0936\u0928\u093f\u0935\u093e\u0930'.split(
                '_'
            ),
        weekdaysShort:
            '\u0930\u0935\u093f_\u0938\u094b\u092e_\u092e\u0902\u0917\u0932_\u092c\u0941\u0927_\u0917\u0941\u0930\u0942_\u0936\u0941\u0915\u094d\u0930_\u0936\u0928\u093f'.split(
                '_'
            ),
        weekdaysMin:
            '\u0930_\u0938\u094b_\u092e\u0902_\u092c\u0941_\u0917\u0941_\u0936\u0941_\u0936'.split(
                '_'
            ),
        longDateFormat: {
            LT: 'A h:mm \u092c\u091c\u0947',
            LTS: 'A h:mm:ss \u092c\u091c\u0947',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY, A h:mm \u092c\u091c\u0947',
            LLLL: 'dddd, D MMMM YYYY, A h:mm \u092c\u091c\u0947',
        },
        calendar: {
            sameDay: '[\u0906\u091c] LT',
            nextDay: '[\u0915\u0932] LT',
            nextWeek: 'dddd, LT',
            lastDay: '[\u0915\u0932] LT',
            lastWeek: '[\u092a\u093f\u091b\u0932\u0947] dddd, LT',
            sameElse: 'L',
        },
        relativeTime: {
            future: '%s \u092e\u0947\u0902',
            past: '%s \u092a\u0939\u0932\u0947',
            s: '\u0915\u0941\u091b \u0939\u0940 \u0915\u094d\u0937\u0923',
            ss: '%d \u0938\u0947\u0915\u0902\u0921',
            m: '\u090f\u0915 \u092e\u093f\u0928\u091f',
            mm: '%d \u092e\u093f\u0928\u091f',
            h: '\u090f\u0915 \u0918\u0902\u091f\u093e',
            hh: '%d \u0918\u0902\u091f\u0947',
            d: '\u090f\u0915 \u0926\u093f\u0928',
            dd: '%d \u0926\u093f\u0928',
            M: '\u090f\u0915 \u092e\u0939\u0940\u0928\u0947',
            MM: '%d \u092e\u0939\u0940\u0928\u0947',
            y: '\u090f\u0915 \u0935\u0930\u094d\u0937',
            yy: '%d \u0935\u0930\u094d\u0937',
        },
        preparse: function (e) {
            return e.replace(
                /[\u0967\u0968\u0969\u096a\u096b\u096c\u096d\u096e\u096f\u0966]/g,
                function (e) {
                    return Bs[e];
                }
            );
        },
        postformat: function (e) {
            return e.replace(/\d/g, function (e) {
                return $s[e];
            });
        },
        meridiemParse:
            /\u0930\u093e\u0924|\u0938\u0941\u092c\u0939|\u0926\u094b\u092a\u0939\u0930|\u0936\u093e\u092e/,
        meridiemHour: function (e, a) {
            return (
                12 === e && (e = 0),
                '\u0930\u093e\u0924' === a
                    ? e < 4
                        ? e
                        : e + 12
                    : '\u0938\u0941\u092c\u0939' === a
                    ? e
                    : '\u0926\u094b\u092a\u0939\u0930' === a
                    ? 10 <= e
                        ? e
                        : e + 12
                    : '\u0936\u093e\u092e' === a
                    ? e + 12
                    : void 0
            );
        },
        meridiem: function (e, a, t) {
            return e < 4
                ? '\u0930\u093e\u0924'
                : e < 10
                ? '\u0938\u0941\u092c\u0939'
                : e < 17
                ? '\u0926\u094b\u092a\u0939\u0930'
                : e < 20
                ? '\u0936\u093e\u092e'
                : '\u0930\u093e\u0924';
        },
        week: { dow: 0, doy: 6 },
    }),
        l.defineLocale('hr', {
            months: {
                format: 'sije\u010dnja_velja\u010de_o\u017eujka_travnja_svibnja_lipnja_srpnja_kolovoza_rujna_listopada_studenoga_prosinca'.split(
                    '_'
                ),
                standalone:
                    'sije\u010danj_velja\u010da_o\u017eujak_travanj_svibanj_lipanj_srpanj_kolovoz_rujan_listopad_studeni_prosinac'.split(
                        '_'
                    ),
            },
            monthsShort:
                'sij._velj._o\u017eu._tra._svi._lip._srp._kol._ruj._lis._stu._pro.'.split(
                    '_'
                ),
            monthsParseExact: !0,
            weekdays:
                'nedjelja_ponedjeljak_utorak_srijeda_\u010detvrtak_petak_subota'.split(
                    '_'
                ),
            weekdaysShort: 'ned._pon._uto._sri._\u010det._pet._sub.'.split('_'),
            weekdaysMin: 'ne_po_ut_sr_\u010de_pe_su'.split('_'),
            weekdaysParseExact: !0,
            longDateFormat: {
                LT: 'H:mm',
                LTS: 'H:mm:ss',
                L: 'DD.MM.YYYY',
                LL: 'D. MMMM YYYY',
                LLL: 'D. MMMM YYYY H:mm',
                LLLL: 'dddd, D. MMMM YYYY H:mm',
            },
            calendar: {
                sameDay: '[danas u] LT',
                nextDay: '[sutra u] LT',
                nextWeek: function () {
                    switch (this.day()) {
                        case 0:
                            return '[u] [nedjelju] [u] LT';
                        case 3:
                            return '[u] [srijedu] [u] LT';
                        case 6:
                            return '[u] [subotu] [u] LT';
                        case 1:
                        case 2:
                        case 4:
                        case 5:
                            return '[u] dddd [u] LT';
                    }
                },
                lastDay: '[ju\u010der u] LT',
                lastWeek: function () {
                    switch (this.day()) {
                        case 0:
                        case 3:
                            return '[pro\u0161lu] dddd [u] LT';
                        case 6:
                            return '[pro\u0161le] [subote] [u] LT';
                        case 1:
                        case 2:
                        case 4:
                        case 5:
                            return '[pro\u0161li] dddd [u] LT';
                    }
                },
                sameElse: 'L',
            },
            relativeTime: {
                future: 'za %s',
                past: 'prije %s',
                s: 'par sekundi',
                ss: qs,
                m: qs,
                mm: qs,
                h: qs,
                hh: qs,
                d: 'dan',
                dd: qs,
                M: 'mjesec',
                MM: qs,
                y: 'godinu',
                yy: qs,
            },
            dayOfMonthOrdinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: { dow: 1, doy: 7 },
        });
    var Qs =
        'vas\xe1rnap h\xe9tf\u0151n kedden szerd\xe1n cs\xfct\xf6rt\xf6k\xf6n p\xe9nteken szombaton'.split(
            ' '
        );
    function Xs(e, a, t, s) {
        var n = e;
        switch (t) {
            case 's':
                return s || a
                    ? 'n\xe9h\xe1ny m\xe1sodperc'
                    : 'n\xe9h\xe1ny m\xe1sodperce';
            case 'ss':
                return n + (s || a) ? ' m\xe1sodperc' : ' m\xe1sodperce';
            case 'm':
                return 'egy' + (s || a ? ' perc' : ' perce');
            case 'mm':
                return n + (s || a ? ' perc' : ' perce');
            case 'h':
                return 'egy' + (s || a ? ' \xf3ra' : ' \xf3r\xe1ja');
            case 'hh':
                return n + (s || a ? ' \xf3ra' : ' \xf3r\xe1ja');
            case 'd':
                return 'egy' + (s || a ? ' nap' : ' napja');
            case 'dd':
                return n + (s || a ? ' nap' : ' napja');
            case 'M':
                return 'egy' + (s || a ? ' h\xf3nap' : ' h\xf3napja');
            case 'MM':
                return n + (s || a ? ' h\xf3nap' : ' h\xf3napja');
            case 'y':
                return 'egy' + (s || a ? ' \xe9v' : ' \xe9ve');
            case 'yy':
                return n + (s || a ? ' \xe9v' : ' \xe9ve');
        }
        return '';
    }
    function en(e) {
        return (e ? '' : '[m\xfalt] ') + '[' + Qs[this.day()] + '] LT[-kor]';
    }
    function an(e) {
        return e % 100 == 11 || e % 10 != 1;
    }
    function tn(e, a, t, s) {
        var n = e + ' ';
        switch (t) {
            case 's':
                return a || s ? 'nokkrar sek\xfandur' : 'nokkrum sek\xfandum';
            case 'ss':
                return an(e)
                    ? n + (a || s ? 'sek\xfandur' : 'sek\xfandum')
                    : n + 'sek\xfanda';
            case 'm':
                return a ? 'm\xedn\xfata' : 'm\xedn\xfatu';
            case 'mm':
                return an(e)
                    ? n + (a || s ? 'm\xedn\xfatur' : 'm\xedn\xfatum')
                    : a
                    ? n + 'm\xedn\xfata'
                    : n + 'm\xedn\xfatu';
            case 'hh':
                return an(e)
                    ? n + (a || s ? 'klukkustundir' : 'klukkustundum')
                    : n + 'klukkustund';
            case 'd':
                return a ? 'dagur' : s ? 'dag' : 'degi';
            case 'dd':
                return an(e)
                    ? a
                        ? n + 'dagar'
                        : n + (s ? 'daga' : 'd\xf6gum')
                    : a
                    ? n + 'dagur'
                    : n + (s ? 'dag' : 'degi');
            case 'M':
                return a ? 'm\xe1nu\xf0ur' : s ? 'm\xe1nu\xf0' : 'm\xe1nu\xf0i';
            case 'MM':
                return an(e)
                    ? a
                        ? n + 'm\xe1nu\xf0ir'
                        : n + (s ? 'm\xe1nu\xf0i' : 'm\xe1nu\xf0um')
                    : a
                    ? n + 'm\xe1nu\xf0ur'
                    : n + (s ? 'm\xe1nu\xf0' : 'm\xe1nu\xf0i');
            case 'y':
                return a || s ? '\xe1r' : '\xe1ri';
            case 'yy':
                return an(e)
                    ? n + (a || s ? '\xe1r' : '\xe1rum')
                    : n + (a || s ? '\xe1r' : '\xe1ri');
        }
    }
    l.defineLocale('hu', {
        months: 'janu\xe1r_febru\xe1r_m\xe1rcius_\xe1prilis_m\xe1jus_j\xfanius_j\xfalius_augusztus_szeptember_okt\xf3ber_november_december'.split(
            '_'
        ),
        monthsShort:
            'jan_feb_m\xe1rc_\xe1pr_m\xe1j_j\xfan_j\xfal_aug_szept_okt_nov_dec'.split(
                '_'
            ),
        weekdays:
            'vas\xe1rnap_h\xe9tf\u0151_kedd_szerda_cs\xfct\xf6rt\xf6k_p\xe9ntek_szombat'.split(
                '_'
            ),
        weekdaysShort: 'vas_h\xe9t_kedd_sze_cs\xfct_p\xe9n_szo'.split('_'),
        weekdaysMin: 'v_h_k_sze_cs_p_szo'.split('_'),
        longDateFormat: {
            LT: 'H:mm',
            LTS: 'H:mm:ss',
            L: 'YYYY.MM.DD.',
            LL: 'YYYY. MMMM D.',
            LLL: 'YYYY. MMMM D. H:mm',
            LLLL: 'YYYY. MMMM D., dddd H:mm',
        },
        meridiemParse: /de|du/i,
        isPM: function (e) {
            return 'u' === e.charAt(1).toLowerCase();
        },
        meridiem: function (e, a, t) {
            return e < 12 ? (!0 === t ? 'de' : 'DE') : !0 === t ? 'du' : 'DU';
        },
        calendar: {
            sameDay: '[ma] LT[-kor]',
            nextDay: '[holnap] LT[-kor]',
            nextWeek: function () {
                return en.call(this, !0);
            },
            lastDay: '[tegnap] LT[-kor]',
            lastWeek: function () {
                return en.call(this, !1);
            },
            sameElse: 'L',
        },
        relativeTime: {
            future: '%s m\xfalva',
            past: '%s',
            s: Xs,
            ss: Xs,
            m: Xs,
            mm: Xs,
            h: Xs,
            hh: Xs,
            d: Xs,
            dd: Xs,
            M: Xs,
            MM: Xs,
            y: Xs,
            yy: Xs,
        },
        dayOfMonthOrdinalParse: /\d{1,2}\./,
        ordinal: '%d.',
        week: { dow: 1, doy: 4 },
    }),
        l.defineLocale('hy-am', {
            months: {
                format: '\u0570\u0578\u0582\u0576\u057e\u0561\u0580\u056b_\u0583\u0565\u057f\u0580\u057e\u0561\u0580\u056b_\u0574\u0561\u0580\u057f\u056b_\u0561\u057a\u0580\u056b\u056c\u056b_\u0574\u0561\u0575\u056b\u057d\u056b_\u0570\u0578\u0582\u0576\u056b\u057d\u056b_\u0570\u0578\u0582\u056c\u056b\u057d\u056b_\u0585\u0563\u0578\u057d\u057f\u0578\u057d\u056b_\u057d\u0565\u057a\u057f\u0565\u0574\u0562\u0565\u0580\u056b_\u0570\u0578\u056f\u057f\u0565\u0574\u0562\u0565\u0580\u056b_\u0576\u0578\u0575\u0565\u0574\u0562\u0565\u0580\u056b_\u0564\u0565\u056f\u057f\u0565\u0574\u0562\u0565\u0580\u056b'.split(
                    '_'
                ),
                standalone:
                    '\u0570\u0578\u0582\u0576\u057e\u0561\u0580_\u0583\u0565\u057f\u0580\u057e\u0561\u0580_\u0574\u0561\u0580\u057f_\u0561\u057a\u0580\u056b\u056c_\u0574\u0561\u0575\u056b\u057d_\u0570\u0578\u0582\u0576\u056b\u057d_\u0570\u0578\u0582\u056c\u056b\u057d_\u0585\u0563\u0578\u057d\u057f\u0578\u057d_\u057d\u0565\u057a\u057f\u0565\u0574\u0562\u0565\u0580_\u0570\u0578\u056f\u057f\u0565\u0574\u0562\u0565\u0580_\u0576\u0578\u0575\u0565\u0574\u0562\u0565\u0580_\u0564\u0565\u056f\u057f\u0565\u0574\u0562\u0565\u0580'.split(
                        '_'
                    ),
            },
            monthsShort:
                '\u0570\u0576\u057e_\u0583\u057f\u0580_\u0574\u0580\u057f_\u0561\u057a\u0580_\u0574\u0575\u057d_\u0570\u0576\u057d_\u0570\u056c\u057d_\u0585\u0563\u057d_\u057d\u057a\u057f_\u0570\u056f\u057f_\u0576\u0574\u0562_\u0564\u056f\u057f'.split(
                    '_'
                ),
            weekdays:
                '\u056f\u056b\u0580\u0561\u056f\u056b_\u0565\u0580\u056f\u0578\u0582\u0577\u0561\u0562\u0569\u056b_\u0565\u0580\u0565\u0584\u0577\u0561\u0562\u0569\u056b_\u0579\u0578\u0580\u0565\u0584\u0577\u0561\u0562\u0569\u056b_\u0570\u056b\u0576\u0563\u0577\u0561\u0562\u0569\u056b_\u0578\u0582\u0580\u0562\u0561\u0569_\u0577\u0561\u0562\u0561\u0569'.split(
                    '_'
                ),
            weekdaysShort:
                '\u056f\u0580\u056f_\u0565\u0580\u056f_\u0565\u0580\u0584_\u0579\u0580\u0584_\u0570\u0576\u0563_\u0578\u0582\u0580\u0562_\u0577\u0562\u0569'.split(
                    '_'
                ),
            weekdaysMin:
                '\u056f\u0580\u056f_\u0565\u0580\u056f_\u0565\u0580\u0584_\u0579\u0580\u0584_\u0570\u0576\u0563_\u0578\u0582\u0580\u0562_\u0577\u0562\u0569'.split(
                    '_'
                ),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD.MM.YYYY',
                LL: 'D MMMM YYYY \u0569.',
                LLL: 'D MMMM YYYY \u0569., HH:mm',
                LLLL: 'dddd, D MMMM YYYY \u0569., HH:mm',
            },
            calendar: {
                sameDay: '[\u0561\u0575\u057d\u0585\u0580] LT',
                nextDay: '[\u057e\u0561\u0572\u0568] LT',
                lastDay: '[\u0565\u0580\u0565\u056f] LT',
                nextWeek: function () {
                    return 'dddd [\u0585\u0580\u0568 \u056a\u0561\u0574\u0568] LT';
                },
                lastWeek: function () {
                    return '[\u0561\u0576\u0581\u0561\u056e] dddd [\u0585\u0580\u0568 \u056a\u0561\u0574\u0568] LT';
                },
                sameElse: 'L',
            },
            relativeTime: {
                future: '%s \u0570\u0565\u057f\u0578',
                past: '%s \u0561\u057c\u0561\u057b',
                s: '\u0574\u056b \u0584\u0561\u0576\u056b \u057e\u0561\u0575\u0580\u056f\u0575\u0561\u0576',
                ss: '%d \u057e\u0561\u0575\u0580\u056f\u0575\u0561\u0576',
                m: '\u0580\u0578\u057a\u0565',
                mm: '%d \u0580\u0578\u057a\u0565',
                h: '\u056a\u0561\u0574',
                hh: '%d \u056a\u0561\u0574',
                d: '\u0585\u0580',
                dd: '%d \u0585\u0580',
                M: '\u0561\u0574\u056b\u057d',
                MM: '%d \u0561\u0574\u056b\u057d',
                y: '\u057f\u0561\u0580\u056b',
                yy: '%d \u057f\u0561\u0580\u056b',
            },
            meridiemParse:
                /\u0563\u056b\u0577\u0565\u0580\u057e\u0561|\u0561\u057c\u0561\u057e\u0578\u057f\u057e\u0561|\u0581\u0565\u0580\u0565\u056f\u057e\u0561|\u0565\u0580\u0565\u056f\u0578\u0575\u0561\u0576/,
            isPM: function (e) {
                return /^(\u0581\u0565\u0580\u0565\u056f\u057e\u0561|\u0565\u0580\u0565\u056f\u0578\u0575\u0561\u0576)$/.test(
                    e
                );
            },
            meridiem: function (e) {
                return e < 4
                    ? '\u0563\u056b\u0577\u0565\u0580\u057e\u0561'
                    : e < 12
                    ? '\u0561\u057c\u0561\u057e\u0578\u057f\u057e\u0561'
                    : e < 17
                    ? '\u0581\u0565\u0580\u0565\u056f\u057e\u0561'
                    : '\u0565\u0580\u0565\u056f\u0578\u0575\u0561\u0576';
            },
            dayOfMonthOrdinalParse:
                /\d{1,2}|\d{1,2}-(\u056b\u0576|\u0580\u0564)/,
            ordinal: function (e, a) {
                switch (a) {
                    case 'DDD':
                    case 'w':
                    case 'W':
                    case 'DDDo':
                        return 1 === e
                            ? e + '-\u056b\u0576'
                            : e + '-\u0580\u0564';
                    default:
                        return e;
                }
            },
            week: { dow: 1, doy: 7 },
        }),
        l.defineLocale('id', {
            months: 'Januari_Februari_Maret_April_Mei_Juni_Juli_Agustus_September_Oktober_November_Desember'.split(
                '_'
            ),
            monthsShort:
                'Jan_Feb_Mar_Apr_Mei_Jun_Jul_Agt_Sep_Okt_Nov_Des'.split('_'),
            weekdays: 'Minggu_Senin_Selasa_Rabu_Kamis_Jumat_Sabtu'.split('_'),
            weekdaysShort: 'Min_Sen_Sel_Rab_Kam_Jum_Sab'.split('_'),
            weekdaysMin: 'Mg_Sn_Sl_Rb_Km_Jm_Sb'.split('_'),
            longDateFormat: {
                LT: 'HH.mm',
                LTS: 'HH.mm.ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY [pukul] HH.mm',
                LLLL: 'dddd, D MMMM YYYY [pukul] HH.mm',
            },
            meridiemParse: /pagi|siang|sore|malam/,
            meridiemHour: function (e, a) {
                return (
                    12 === e && (e = 0),
                    'pagi' === a
                        ? e
                        : 'siang' === a
                        ? 11 <= e
                            ? e
                            : e + 12
                        : 'sore' === a || 'malam' === a
                        ? e + 12
                        : void 0
                );
            },
            meridiem: function (e, a, t) {
                return e < 11
                    ? 'pagi'
                    : e < 15
                    ? 'siang'
                    : e < 19
                    ? 'sore'
                    : 'malam';
            },
            calendar: {
                sameDay: '[Hari ini pukul] LT',
                nextDay: '[Besok pukul] LT',
                nextWeek: 'dddd [pukul] LT',
                lastDay: '[Kemarin pukul] LT',
                lastWeek: 'dddd [lalu pukul] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: 'dalam %s',
                past: '%s yang lalu',
                s: 'beberapa detik',
                ss: '%d detik',
                m: 'semenit',
                mm: '%d menit',
                h: 'sejam',
                hh: '%d jam',
                d: 'sehari',
                dd: '%d hari',
                M: 'sebulan',
                MM: '%d bulan',
                y: 'setahun',
                yy: '%d tahun',
            },
            week: { dow: 1, doy: 7 },
        }),
        l.defineLocale('is', {
            months: 'jan\xfaar_febr\xfaar_mars_apr\xedl_ma\xed_j\xfan\xed_j\xfal\xed_\xe1g\xfast_september_okt\xf3ber_n\xf3vember_desember'.split(
                '_'
            ),
            monthsShort:
                'jan_feb_mar_apr_ma\xed_j\xfan_j\xfal_\xe1g\xfa_sep_okt_n\xf3v_des'.split(
                    '_'
                ),
            weekdays:
                'sunnudagur_m\xe1nudagur_\xferi\xf0judagur_mi\xf0vikudagur_fimmtudagur_f\xf6studagur_laugardagur'.split(
                    '_'
                ),
            weekdaysShort: 'sun_m\xe1n_\xferi_mi\xf0_fim_f\xf6s_lau'.split('_'),
            weekdaysMin: 'Su_M\xe1_\xder_Mi_Fi_F\xf6_La'.split('_'),
            longDateFormat: {
                LT: 'H:mm',
                LTS: 'H:mm:ss',
                L: 'DD.MM.YYYY',
                LL: 'D. MMMM YYYY',
                LLL: 'D. MMMM YYYY [kl.] H:mm',
                LLLL: 'dddd, D. MMMM YYYY [kl.] H:mm',
            },
            calendar: {
                sameDay: '[\xed dag kl.] LT',
                nextDay: '[\xe1 morgun kl.] LT',
                nextWeek: 'dddd [kl.] LT',
                lastDay: '[\xed g\xe6r kl.] LT',
                lastWeek: '[s\xed\xf0asta] dddd [kl.] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: 'eftir %s',
                past: 'fyrir %s s\xed\xf0an',
                s: tn,
                ss: tn,
                m: tn,
                mm: tn,
                h: 'klukkustund',
                hh: tn,
                d: tn,
                dd: tn,
                M: tn,
                MM: tn,
                y: tn,
                yy: tn,
            },
            dayOfMonthOrdinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: { dow: 1, doy: 4 },
        }),
        l.defineLocale('it-ch', {
            months: 'gennaio_febbraio_marzo_aprile_maggio_giugno_luglio_agosto_settembre_ottobre_novembre_dicembre'.split(
                '_'
            ),
            monthsShort:
                'gen_feb_mar_apr_mag_giu_lug_ago_set_ott_nov_dic'.split('_'),
            weekdays:
                'domenica_luned\xec_marted\xec_mercoled\xec_gioved\xec_venerd\xec_sabato'.split(
                    '_'
                ),
            weekdaysShort: 'dom_lun_mar_mer_gio_ven_sab'.split('_'),
            weekdaysMin: 'do_lu_ma_me_gi_ve_sa'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD.MM.YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd D MMMM YYYY HH:mm',
            },
            calendar: {
                sameDay: '[Oggi alle] LT',
                nextDay: '[Domani alle] LT',
                nextWeek: 'dddd [alle] LT',
                lastDay: '[Ieri alle] LT',
                lastWeek: function () {
                    switch (this.day()) {
                        case 0:
                            return '[la scorsa] dddd [alle] LT';
                        default:
                            return '[lo scorso] dddd [alle] LT';
                    }
                },
                sameElse: 'L',
            },
            relativeTime: {
                future: function (e) {
                    return (/^[0-9].+$/.test(e) ? 'tra' : 'in') + ' ' + e;
                },
                past: '%s fa',
                s: 'alcuni secondi',
                ss: '%d secondi',
                m: 'un minuto',
                mm: '%d minuti',
                h: "un'ora",
                hh: '%d ore',
                d: 'un giorno',
                dd: '%d giorni',
                M: 'un mese',
                MM: '%d mesi',
                y: 'un anno',
                yy: '%d anni',
            },
            dayOfMonthOrdinalParse: /\d{1,2}\xba/,
            ordinal: '%d\xba',
            week: { dow: 1, doy: 4 },
        }),
        l.defineLocale('it', {
            months: 'gennaio_febbraio_marzo_aprile_maggio_giugno_luglio_agosto_settembre_ottobre_novembre_dicembre'.split(
                '_'
            ),
            monthsShort:
                'gen_feb_mar_apr_mag_giu_lug_ago_set_ott_nov_dic'.split('_'),
            weekdays:
                'domenica_luned\xec_marted\xec_mercoled\xec_gioved\xec_venerd\xec_sabato'.split(
                    '_'
                ),
            weekdaysShort: 'dom_lun_mar_mer_gio_ven_sab'.split('_'),
            weekdaysMin: 'do_lu_ma_me_gi_ve_sa'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd D MMMM YYYY HH:mm',
            },
            calendar: {
                sameDay: '[Oggi alle] LT',
                nextDay: '[Domani alle] LT',
                nextWeek: 'dddd [alle] LT',
                lastDay: '[Ieri alle] LT',
                lastWeek: function () {
                    switch (this.day()) {
                        case 0:
                            return '[la scorsa] dddd [alle] LT';
                        default:
                            return '[lo scorso] dddd [alle] LT';
                    }
                },
                sameElse: 'L',
            },
            relativeTime: {
                future: function (e) {
                    return (/^[0-9].+$/.test(e) ? 'tra' : 'in') + ' ' + e;
                },
                past: '%s fa',
                s: 'alcuni secondi',
                ss: '%d secondi',
                m: 'un minuto',
                mm: '%d minuti',
                h: "un'ora",
                hh: '%d ore',
                d: 'un giorno',
                dd: '%d giorni',
                M: 'un mese',
                MM: '%d mesi',
                y: 'un anno',
                yy: '%d anni',
            },
            dayOfMonthOrdinalParse: /\d{1,2}\xba/,
            ordinal: '%d\xba',
            week: { dow: 1, doy: 4 },
        }),
        l.defineLocale('ja', {
            months: '\u4e00\u6708_\u4e8c\u6708_\u4e09\u6708_\u56db\u6708_\u4e94\u6708_\u516d\u6708_\u4e03\u6708_\u516b\u6708_\u4e5d\u6708_\u5341\u6708_\u5341\u4e00\u6708_\u5341\u4e8c\u6708'.split(
                '_'
            ),
            monthsShort:
                '1\u6708_2\u6708_3\u6708_4\u6708_5\u6708_6\u6708_7\u6708_8\u6708_9\u6708_10\u6708_11\u6708_12\u6708'.split(
                    '_'
                ),
            weekdays:
                '\u65e5\u66dc\u65e5_\u6708\u66dc\u65e5_\u706b\u66dc\u65e5_\u6c34\u66dc\u65e5_\u6728\u66dc\u65e5_\u91d1\u66dc\u65e5_\u571f\u66dc\u65e5'.split(
                    '_'
                ),
            weekdaysShort:
                '\u65e5_\u6708_\u706b_\u6c34_\u6728_\u91d1_\u571f'.split('_'),
            weekdaysMin:
                '\u65e5_\u6708_\u706b_\u6c34_\u6728_\u91d1_\u571f'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'YYYY/MM/DD',
                LL: 'YYYY\u5e74M\u6708D\u65e5',
                LLL: 'YYYY\u5e74M\u6708D\u65e5 HH:mm',
                LLLL: 'YYYY\u5e74M\u6708D\u65e5 dddd HH:mm',
                l: 'YYYY/MM/DD',
                ll: 'YYYY\u5e74M\u6708D\u65e5',
                lll: 'YYYY\u5e74M\u6708D\u65e5 HH:mm',
                llll: 'YYYY\u5e74M\u6708D\u65e5(ddd) HH:mm',
            },
            meridiemParse: /\u5348\u524d|\u5348\u5f8c/i,
            isPM: function (e) {
                return '\u5348\u5f8c' === e;
            },
            meridiem: function (e, a, t) {
                return e < 12 ? '\u5348\u524d' : '\u5348\u5f8c';
            },
            calendar: {
                sameDay: '[\u4eca\u65e5] LT',
                nextDay: '[\u660e\u65e5] LT',
                nextWeek: function (e) {
                    return e.week() < this.week()
                        ? '[\u6765\u9031]dddd LT'
                        : 'dddd LT';
                },
                lastDay: '[\u6628\u65e5] LT',
                lastWeek: function (e) {
                    return this.week() < e.week()
                        ? '[\u5148\u9031]dddd LT'
                        : 'dddd LT';
                },
                sameElse: 'L',
            },
            dayOfMonthOrdinalParse: /\d{1,2}\u65e5/,
            ordinal: function (e, a) {
                switch (a) {
                    case 'd':
                    case 'D':
                    case 'DDD':
                        return e + '\u65e5';
                    default:
                        return e;
                }
            },
            relativeTime: {
                future: '%s\u5f8c',
                past: '%s\u524d',
                s: '\u6570\u79d2',
                ss: '%d\u79d2',
                m: '1\u5206',
                mm: '%d\u5206',
                h: '1\u6642\u9593',
                hh: '%d\u6642\u9593',
                d: '1\u65e5',
                dd: '%d\u65e5',
                M: '1\u30f6\u6708',
                MM: '%d\u30f6\u6708',
                y: '1\u5e74',
                yy: '%d\u5e74',
            },
        }),
        l.defineLocale('jv', {
            months: 'Januari_Februari_Maret_April_Mei_Juni_Juli_Agustus_September_Oktober_Nopember_Desember'.split(
                '_'
            ),
            monthsShort:
                'Jan_Feb_Mar_Apr_Mei_Jun_Jul_Ags_Sep_Okt_Nop_Des'.split('_'),
            weekdays: 'Minggu_Senen_Seloso_Rebu_Kemis_Jemuwah_Septu'.split('_'),
            weekdaysShort: 'Min_Sen_Sel_Reb_Kem_Jem_Sep'.split('_'),
            weekdaysMin: 'Mg_Sn_Sl_Rb_Km_Jm_Sp'.split('_'),
            longDateFormat: {
                LT: 'HH.mm',
                LTS: 'HH.mm.ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY [pukul] HH.mm',
                LLLL: 'dddd, D MMMM YYYY [pukul] HH.mm',
            },
            meridiemParse: /enjing|siyang|sonten|ndalu/,
            meridiemHour: function (e, a) {
                return (
                    12 === e && (e = 0),
                    'enjing' === a
                        ? e
                        : 'siyang' === a
                        ? 11 <= e
                            ? e
                            : e + 12
                        : 'sonten' === a || 'ndalu' === a
                        ? e + 12
                        : void 0
                );
            },
            meridiem: function (e, a, t) {
                return e < 11
                    ? 'enjing'
                    : e < 15
                    ? 'siyang'
                    : e < 19
                    ? 'sonten'
                    : 'ndalu';
            },
            calendar: {
                sameDay: '[Dinten puniko pukul] LT',
                nextDay: '[Mbenjang pukul] LT',
                nextWeek: 'dddd [pukul] LT',
                lastDay: '[Kala wingi pukul] LT',
                lastWeek: 'dddd [kepengker pukul] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: 'wonten ing %s',
                past: '%s ingkang kepengker',
                s: 'sawetawis detik',
                ss: '%d detik',
                m: 'setunggal menit',
                mm: '%d menit',
                h: 'setunggal jam',
                hh: '%d jam',
                d: 'sedinten',
                dd: '%d dinten',
                M: 'sewulan',
                MM: '%d wulan',
                y: 'setaun',
                yy: '%d taun',
            },
            week: { dow: 1, doy: 7 },
        }),
        l.defineLocale('ka', {
            months: {
                standalone:
                    '\u10d8\u10d0\u10dc\u10d5\u10d0\u10e0\u10d8_\u10d7\u10d4\u10d1\u10d4\u10e0\u10d5\u10d0\u10da\u10d8_\u10db\u10d0\u10e0\u10e2\u10d8_\u10d0\u10de\u10e0\u10d8\u10da\u10d8_\u10db\u10d0\u10d8\u10e1\u10d8_\u10d8\u10d5\u10dc\u10d8\u10e1\u10d8_\u10d8\u10d5\u10da\u10d8\u10e1\u10d8_\u10d0\u10d2\u10d5\u10d8\u10e1\u10e2\u10dd_\u10e1\u10d4\u10e5\u10e2\u10d4\u10db\u10d1\u10d4\u10e0\u10d8_\u10dd\u10e5\u10e2\u10dd\u10db\u10d1\u10d4\u10e0\u10d8_\u10dc\u10dd\u10d4\u10db\u10d1\u10d4\u10e0\u10d8_\u10d3\u10d4\u10d9\u10d4\u10db\u10d1\u10d4\u10e0\u10d8'.split(
                        '_'
                    ),
                format: '\u10d8\u10d0\u10dc\u10d5\u10d0\u10e0\u10e1_\u10d7\u10d4\u10d1\u10d4\u10e0\u10d5\u10d0\u10da\u10e1_\u10db\u10d0\u10e0\u10e2\u10e1_\u10d0\u10de\u10e0\u10d8\u10da\u10d8\u10e1_\u10db\u10d0\u10d8\u10e1\u10e1_\u10d8\u10d5\u10dc\u10d8\u10e1\u10e1_\u10d8\u10d5\u10da\u10d8\u10e1\u10e1_\u10d0\u10d2\u10d5\u10d8\u10e1\u10e2\u10e1_\u10e1\u10d4\u10e5\u10e2\u10d4\u10db\u10d1\u10d4\u10e0\u10e1_\u10dd\u10e5\u10e2\u10dd\u10db\u10d1\u10d4\u10e0\u10e1_\u10dc\u10dd\u10d4\u10db\u10d1\u10d4\u10e0\u10e1_\u10d3\u10d4\u10d9\u10d4\u10db\u10d1\u10d4\u10e0\u10e1'.split(
                    '_'
                ),
            },
            monthsShort:
                '\u10d8\u10d0\u10dc_\u10d7\u10d4\u10d1_\u10db\u10d0\u10e0_\u10d0\u10de\u10e0_\u10db\u10d0\u10d8_\u10d8\u10d5\u10dc_\u10d8\u10d5\u10da_\u10d0\u10d2\u10d5_\u10e1\u10d4\u10e5_\u10dd\u10e5\u10e2_\u10dc\u10dd\u10d4_\u10d3\u10d4\u10d9'.split(
                    '_'
                ),
            weekdays: {
                standalone:
                    '\u10d9\u10d5\u10d8\u10e0\u10d0_\u10dd\u10e0\u10e8\u10d0\u10d1\u10d0\u10d7\u10d8_\u10e1\u10d0\u10db\u10e8\u10d0\u10d1\u10d0\u10d7\u10d8_\u10dd\u10d7\u10ee\u10e8\u10d0\u10d1\u10d0\u10d7\u10d8_\u10ee\u10e3\u10d7\u10e8\u10d0\u10d1\u10d0\u10d7\u10d8_\u10de\u10d0\u10e0\u10d0\u10e1\u10d9\u10d4\u10d5\u10d8_\u10e8\u10d0\u10d1\u10d0\u10d7\u10d8'.split(
                        '_'
                    ),
                format: '\u10d9\u10d5\u10d8\u10e0\u10d0\u10e1_\u10dd\u10e0\u10e8\u10d0\u10d1\u10d0\u10d7\u10e1_\u10e1\u10d0\u10db\u10e8\u10d0\u10d1\u10d0\u10d7\u10e1_\u10dd\u10d7\u10ee\u10e8\u10d0\u10d1\u10d0\u10d7\u10e1_\u10ee\u10e3\u10d7\u10e8\u10d0\u10d1\u10d0\u10d7\u10e1_\u10de\u10d0\u10e0\u10d0\u10e1\u10d9\u10d4\u10d5\u10e1_\u10e8\u10d0\u10d1\u10d0\u10d7\u10e1'.split(
                    '_'
                ),
                isFormat:
                    /(\u10ec\u10d8\u10dc\u10d0|\u10e8\u10d4\u10db\u10d3\u10d4\u10d2)/,
            },
            weekdaysShort:
                '\u10d9\u10d5\u10d8_\u10dd\u10e0\u10e8_\u10e1\u10d0\u10db_\u10dd\u10d7\u10ee_\u10ee\u10e3\u10d7_\u10de\u10d0\u10e0_\u10e8\u10d0\u10d1'.split(
                    '_'
                ),
            weekdaysMin:
                '\u10d9\u10d5_\u10dd\u10e0_\u10e1\u10d0_\u10dd\u10d7_\u10ee\u10e3_\u10de\u10d0_\u10e8\u10d0'.split(
                    '_'
                ),
            longDateFormat: {
                LT: 'h:mm A',
                LTS: 'h:mm:ss A',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY h:mm A',
                LLLL: 'dddd, D MMMM YYYY h:mm A',
            },
            calendar: {
                sameDay: '[\u10d3\u10e6\u10d4\u10e1] LT[-\u10d6\u10d4]',
                nextDay: '[\u10ee\u10d5\u10d0\u10da] LT[-\u10d6\u10d4]',
                lastDay: '[\u10d2\u10e3\u10e8\u10d8\u10dc] LT[-\u10d6\u10d4]',
                nextWeek:
                    '[\u10e8\u10d4\u10db\u10d3\u10d4\u10d2] dddd LT[-\u10d6\u10d4]',
                lastWeek: '[\u10ec\u10d8\u10dc\u10d0] dddd LT-\u10d6\u10d4',
                sameElse: 'L',
            },
            relativeTime: {
                future: function (e) {
                    return /(\u10ec\u10d0\u10db\u10d8|\u10ec\u10e3\u10d7\u10d8|\u10e1\u10d0\u10d0\u10d7\u10d8|\u10ec\u10d4\u10da\u10d8)/.test(
                        e
                    )
                        ? e.replace(/\u10d8$/, '\u10e8\u10d8')
                        : e + '\u10e8\u10d8';
                },
                past: function (e) {
                    return /(\u10ec\u10d0\u10db\u10d8|\u10ec\u10e3\u10d7\u10d8|\u10e1\u10d0\u10d0\u10d7\u10d8|\u10d3\u10e6\u10d4|\u10d7\u10d5\u10d4)/.test(
                        e
                    )
                        ? e.replace(
                              /(\u10d8|\u10d4)$/,
                              '\u10d8\u10e1 \u10ec\u10d8\u10dc'
                          )
                        : /\u10ec\u10d4\u10da\u10d8/.test(e)
                        ? e.replace(
                              /\u10ec\u10d4\u10da\u10d8$/,
                              '\u10ec\u10da\u10d8\u10e1 \u10ec\u10d8\u10dc'
                          )
                        : void 0;
                },
                s: '\u10e0\u10d0\u10db\u10d3\u10d4\u10dc\u10d8\u10db\u10d4 \u10ec\u10d0\u10db\u10d8',
                ss: '%d \u10ec\u10d0\u10db\u10d8',
                m: '\u10ec\u10e3\u10d7\u10d8',
                mm: '%d \u10ec\u10e3\u10d7\u10d8',
                h: '\u10e1\u10d0\u10d0\u10d7\u10d8',
                hh: '%d \u10e1\u10d0\u10d0\u10d7\u10d8',
                d: '\u10d3\u10e6\u10d4',
                dd: '%d \u10d3\u10e6\u10d4',
                M: '\u10d7\u10d5\u10d4',
                MM: '%d \u10d7\u10d5\u10d4',
                y: '\u10ec\u10d4\u10da\u10d8',
                yy: '%d \u10ec\u10d4\u10da\u10d8',
            },
            dayOfMonthOrdinalParse:
                /0|1-\u10da\u10d8|\u10db\u10d4-\d{1,2}|\d{1,2}-\u10d4/,
            ordinal: function (e) {
                return 0 === e
                    ? e
                    : 1 === e
                    ? e + '-\u10da\u10d8'
                    : e < 20 || (e <= 100 && e % 20 == 0) || e % 100 == 0
                    ? '\u10db\u10d4-' + e
                    : e + '-\u10d4';
            },
            week: { dow: 1, doy: 7 },
        });
    var sn = {
        0: '-\u0448\u0456',
        1: '-\u0448\u0456',
        2: '-\u0448\u0456',
        3: '-\u0448\u0456',
        4: '-\u0448\u0456',
        5: '-\u0448\u0456',
        6: '-\u0448\u044b',
        7: '-\u0448\u0456',
        8: '-\u0448\u0456',
        9: '-\u0448\u044b',
        10: '-\u0448\u044b',
        20: '-\u0448\u044b',
        30: '-\u0448\u044b',
        40: '-\u0448\u044b',
        50: '-\u0448\u0456',
        60: '-\u0448\u044b',
        70: '-\u0448\u0456',
        80: '-\u0448\u0456',
        90: '-\u0448\u044b',
        100: '-\u0448\u0456',
    };
    l.defineLocale('kk', {
        months: '\u049b\u0430\u04a3\u0442\u0430\u0440_\u0430\u049b\u043f\u0430\u043d_\u043d\u0430\u0443\u0440\u044b\u0437_\u0441\u04d9\u0443\u0456\u0440_\u043c\u0430\u043c\u044b\u0440_\u043c\u0430\u0443\u0441\u044b\u043c_\u0448\u0456\u043b\u0434\u0435_\u0442\u0430\u043c\u044b\u0437_\u049b\u044b\u0440\u043a\u04af\u0439\u0435\u043a_\u049b\u0430\u0437\u0430\u043d_\u049b\u0430\u0440\u0430\u0448\u0430_\u0436\u0435\u043b\u0442\u043e\u049b\u0441\u0430\u043d'.split(
            '_'
        ),
        monthsShort:
            '\u049b\u0430\u04a3_\u0430\u049b\u043f_\u043d\u0430\u0443_\u0441\u04d9\u0443_\u043c\u0430\u043c_\u043c\u0430\u0443_\u0448\u0456\u043b_\u0442\u0430\u043c_\u049b\u044b\u0440_\u049b\u0430\u0437_\u049b\u0430\u0440_\u0436\u0435\u043b'.split(
                '_'
            ),
        weekdays:
            '\u0436\u0435\u043a\u0441\u0435\u043d\u0431\u0456_\u0434\u04af\u0439\u0441\u0435\u043d\u0431\u0456_\u0441\u0435\u0439\u0441\u0435\u043d\u0431\u0456_\u0441\u04d9\u0440\u0441\u0435\u043d\u0431\u0456_\u0431\u0435\u0439\u0441\u0435\u043d\u0431\u0456_\u0436\u04b1\u043c\u0430_\u0441\u0435\u043d\u0431\u0456'.split(
                '_'
            ),
        weekdaysShort:
            '\u0436\u0435\u043a_\u0434\u04af\u0439_\u0441\u0435\u0439_\u0441\u04d9\u0440_\u0431\u0435\u0439_\u0436\u04b1\u043c_\u0441\u0435\u043d'.split(
                '_'
            ),
        weekdaysMin:
            '\u0436\u043a_\u0434\u0439_\u0441\u0439_\u0441\u0440_\u0431\u0439_\u0436\u043c_\u0441\u043d'.split(
                '_'
            ),
        longDateFormat: {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L: 'DD.MM.YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY HH:mm',
            LLLL: 'dddd, D MMMM YYYY HH:mm',
        },
        calendar: {
            sameDay:
                '[\u0411\u04af\u0433\u0456\u043d \u0441\u0430\u0493\u0430\u0442] LT',
            nextDay:
                '[\u0415\u0440\u0442\u0435\u04a3 \u0441\u0430\u0493\u0430\u0442] LT',
            nextWeek: 'dddd [\u0441\u0430\u0493\u0430\u0442] LT',
            lastDay:
                '[\u041a\u0435\u0448\u0435 \u0441\u0430\u0493\u0430\u0442] LT',
            lastWeek:
                '[\u04e8\u0442\u043a\u0435\u043d \u0430\u043f\u0442\u0430\u043d\u044b\u04a3] dddd [\u0441\u0430\u0493\u0430\u0442] LT',
            sameElse: 'L',
        },
        relativeTime: {
            future: '%s \u0456\u0448\u0456\u043d\u0434\u0435',
            past: '%s \u0431\u04b1\u0440\u044b\u043d',
            s: '\u0431\u0456\u0440\u043d\u0435\u0448\u0435 \u0441\u0435\u043a\u0443\u043d\u0434',
            ss: '%d \u0441\u0435\u043a\u0443\u043d\u0434',
            m: '\u0431\u0456\u0440 \u043c\u0438\u043d\u0443\u0442',
            mm: '%d \u043c\u0438\u043d\u0443\u0442',
            h: '\u0431\u0456\u0440 \u0441\u0430\u0493\u0430\u0442',
            hh: '%d \u0441\u0430\u0493\u0430\u0442',
            d: '\u0431\u0456\u0440 \u043a\u04af\u043d',
            dd: '%d \u043a\u04af\u043d',
            M: '\u0431\u0456\u0440 \u0430\u0439',
            MM: '%d \u0430\u0439',
            y: '\u0431\u0456\u0440 \u0436\u044b\u043b',
            yy: '%d \u0436\u044b\u043b',
        },
        dayOfMonthOrdinalParse: /\d{1,2}-(\u0448\u0456|\u0448\u044b)/,
        ordinal: function (e) {
            return e + (sn[e] || sn[e % 10] || sn[100 <= e ? 100 : null]);
        },
        week: { dow: 1, doy: 7 },
    });
    var nn = {
            1: '\u17e1',
            2: '\u17e2',
            3: '\u17e3',
            4: '\u17e4',
            5: '\u17e5',
            6: '\u17e6',
            7: '\u17e7',
            8: '\u17e8',
            9: '\u17e9',
            0: '\u17e0',
        },
        dn = {
            '\u17e1': '1',
            '\u17e2': '2',
            '\u17e3': '3',
            '\u17e4': '4',
            '\u17e5': '5',
            '\u17e6': '6',
            '\u17e7': '7',
            '\u17e8': '8',
            '\u17e9': '9',
            '\u17e0': '0',
        };
    l.defineLocale('km', {
        months: '\u1798\u1780\u179a\u17b6_\u1780\u17bb\u1798\u17d2\u1797\u17c8_\u1798\u17b8\u1793\u17b6_\u1798\u17c1\u179f\u17b6_\u17a7\u179f\u1797\u17b6_\u1798\u17b7\u1790\u17bb\u1793\u17b6_\u1780\u1780\u17d2\u1780\u178a\u17b6_\u179f\u17b8\u17a0\u17b6_\u1780\u1789\u17d2\u1789\u17b6_\u178f\u17bb\u179b\u17b6_\u179c\u17b7\u1785\u17d2\u1786\u17b7\u1780\u17b6_\u1792\u17d2\u1793\u17bc'.split(
            '_'
        ),
        monthsShort:
            '\u1798\u1780\u179a\u17b6_\u1780\u17bb\u1798\u17d2\u1797\u17c8_\u1798\u17b8\u1793\u17b6_\u1798\u17c1\u179f\u17b6_\u17a7\u179f\u1797\u17b6_\u1798\u17b7\u1790\u17bb\u1793\u17b6_\u1780\u1780\u17d2\u1780\u178a\u17b6_\u179f\u17b8\u17a0\u17b6_\u1780\u1789\u17d2\u1789\u17b6_\u178f\u17bb\u179b\u17b6_\u179c\u17b7\u1785\u17d2\u1786\u17b7\u1780\u17b6_\u1792\u17d2\u1793\u17bc'.split(
                '_'
            ),
        weekdays:
            '\u17a2\u17b6\u1791\u17b7\u178f\u17d2\u1799_\u1785\u17d0\u1793\u17d2\u1791_\u17a2\u1784\u17d2\u1782\u17b6\u179a_\u1796\u17bb\u1792_\u1796\u17d2\u179a\u17a0\u179f\u17d2\u1794\u178f\u17b7\u17cd_\u179f\u17bb\u1780\u17d2\u179a_\u179f\u17c5\u179a\u17cd'.split(
                '_'
            ),
        weekdaysShort:
            '\u17a2\u17b6_\u1785_\u17a2_\u1796_\u1796\u17d2\u179a_\u179f\u17bb_\u179f'.split(
                '_'
            ),
        weekdaysMin:
            '\u17a2\u17b6_\u1785_\u17a2_\u1796_\u1796\u17d2\u179a_\u179f\u17bb_\u179f'.split(
                '_'
            ),
        weekdaysParseExact: !0,
        longDateFormat: {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY HH:mm',
            LLLL: 'dddd, D MMMM YYYY HH:mm',
        },
        meridiemParse:
            /\u1796\u17d2\u179a\u17b9\u1780|\u179b\u17d2\u1784\u17b6\u1785/,
        isPM: function (e) {
            return '\u179b\u17d2\u1784\u17b6\u1785' === e;
        },
        meridiem: function (e, a, t) {
            return e < 12
                ? '\u1796\u17d2\u179a\u17b9\u1780'
                : '\u179b\u17d2\u1784\u17b6\u1785';
        },
        calendar: {
            sameDay:
                '[\u1790\u17d2\u1784\u17c3\u1793\u17c1\u17c7 \u1798\u17c9\u17c4\u1784] LT',
            nextDay:
                '[\u179f\u17d2\u17a2\u17c2\u1780 \u1798\u17c9\u17c4\u1784] LT',
            nextWeek: 'dddd [\u1798\u17c9\u17c4\u1784] LT',
            lastDay:
                '[\u1798\u17d2\u179f\u17b7\u179b\u1798\u17b7\u1789 \u1798\u17c9\u17c4\u1784] LT',
            lastWeek:
                'dddd [\u179f\u1794\u17d2\u178f\u17b6\u17a0\u17cd\u1798\u17bb\u1793] [\u1798\u17c9\u17c4\u1784] LT',
            sameElse: 'L',
        },
        relativeTime: {
            future: '%s\u1791\u17c0\u178f',
            past: '%s\u1798\u17bb\u1793',
            s: '\u1794\u17c9\u17bb\u1793\u17d2\u1798\u17b6\u1793\u179c\u17b7\u1793\u17b6\u1791\u17b8',
            ss: '%d \u179c\u17b7\u1793\u17b6\u1791\u17b8',
            m: '\u1798\u17bd\u1799\u1793\u17b6\u1791\u17b8',
            mm: '%d \u1793\u17b6\u1791\u17b8',
            h: '\u1798\u17bd\u1799\u1798\u17c9\u17c4\u1784',
            hh: '%d \u1798\u17c9\u17c4\u1784',
            d: '\u1798\u17bd\u1799\u1790\u17d2\u1784\u17c3',
            dd: '%d \u1790\u17d2\u1784\u17c3',
            M: '\u1798\u17bd\u1799\u1781\u17c2',
            MM: '%d \u1781\u17c2',
            y: '\u1798\u17bd\u1799\u1786\u17d2\u1793\u17b6\u17c6',
            yy: '%d \u1786\u17d2\u1793\u17b6\u17c6',
        },
        dayOfMonthOrdinalParse: /\u1791\u17b8\d{1,2}/,
        ordinal: '\u1791\u17b8%d',
        preparse: function (e) {
            return e.replace(
                /[\u17e1\u17e2\u17e3\u17e4\u17e5\u17e6\u17e7\u17e8\u17e9\u17e0]/g,
                function (e) {
                    return dn[e];
                }
            );
        },
        postformat: function (e) {
            return e.replace(/\d/g, function (e) {
                return nn[e];
            });
        },
        week: { dow: 1, doy: 4 },
    });
    var rn = {
            1: '\u0ce7',
            2: '\u0ce8',
            3: '\u0ce9',
            4: '\u0cea',
            5: '\u0ceb',
            6: '\u0cec',
            7: '\u0ced',
            8: '\u0cee',
            9: '\u0cef',
            0: '\u0ce6',
        },
        _n = {
            '\u0ce7': '1',
            '\u0ce8': '2',
            '\u0ce9': '3',
            '\u0cea': '4',
            '\u0ceb': '5',
            '\u0cec': '6',
            '\u0ced': '7',
            '\u0cee': '8',
            '\u0cef': '9',
            '\u0ce6': '0',
        };
    l.defineLocale('kn', {
        months: '\u0c9c\u0ca8\u0cb5\u0cb0\u0cbf_\u0cab\u0cc6\u0cac\u0ccd\u0cb0\u0cb5\u0cb0\u0cbf_\u0cae\u0cbe\u0cb0\u0ccd\u0c9a\u0ccd_\u0c8f\u0caa\u0ccd\u0cb0\u0cbf\u0cb2\u0ccd_\u0cae\u0cc6\u0cd5_\u0c9c\u0cc2\u0ca8\u0ccd_\u0c9c\u0cc1\u0cb2\u0cc6\u0cd6_\u0c86\u0c97\u0cb8\u0ccd\u0c9f\u0ccd_\u0cb8\u0cc6\u0caa\u0ccd\u0c9f\u0cc6\u0c82\u0cac\u0cb0\u0ccd_\u0c85\u0c95\u0ccd\u0c9f\u0cc6\u0cc2\u0cd5\u0cac\u0cb0\u0ccd_\u0ca8\u0cb5\u0cc6\u0c82\u0cac\u0cb0\u0ccd_\u0ca1\u0cbf\u0cb8\u0cc6\u0c82\u0cac\u0cb0\u0ccd'.split(
            '_'
        ),
        monthsShort:
            '\u0c9c\u0ca8_\u0cab\u0cc6\u0cac\u0ccd\u0cb0_\u0cae\u0cbe\u0cb0\u0ccd\u0c9a\u0ccd_\u0c8f\u0caa\u0ccd\u0cb0\u0cbf\u0cb2\u0ccd_\u0cae\u0cc6\u0cd5_\u0c9c\u0cc2\u0ca8\u0ccd_\u0c9c\u0cc1\u0cb2\u0cc6\u0cd6_\u0c86\u0c97\u0cb8\u0ccd\u0c9f\u0ccd_\u0cb8\u0cc6\u0caa\u0ccd\u0c9f\u0cc6\u0c82_\u0c85\u0c95\u0ccd\u0c9f\u0cc6\u0cc2\u0cd5_\u0ca8\u0cb5\u0cc6\u0c82_\u0ca1\u0cbf\u0cb8\u0cc6\u0c82'.split(
                '_'
            ),
        monthsParseExact: !0,
        weekdays:
            '\u0cad\u0cbe\u0ca8\u0cc1\u0cb5\u0cbe\u0cb0_\u0cb8\u0cc6\u0cc2\u0cd5\u0cae\u0cb5\u0cbe\u0cb0_\u0cae\u0c82\u0c97\u0cb3\u0cb5\u0cbe\u0cb0_\u0cac\u0cc1\u0ca7\u0cb5\u0cbe\u0cb0_\u0c97\u0cc1\u0cb0\u0cc1\u0cb5\u0cbe\u0cb0_\u0cb6\u0cc1\u0c95\u0ccd\u0cb0\u0cb5\u0cbe\u0cb0_\u0cb6\u0ca8\u0cbf\u0cb5\u0cbe\u0cb0'.split(
                '_'
            ),
        weekdaysShort:
            '\u0cad\u0cbe\u0ca8\u0cc1_\u0cb8\u0cc6\u0cc2\u0cd5\u0cae_\u0cae\u0c82\u0c97\u0cb3_\u0cac\u0cc1\u0ca7_\u0c97\u0cc1\u0cb0\u0cc1_\u0cb6\u0cc1\u0c95\u0ccd\u0cb0_\u0cb6\u0ca8\u0cbf'.split(
                '_'
            ),
        weekdaysMin:
            '\u0cad\u0cbe_\u0cb8\u0cc6\u0cc2\u0cd5_\u0cae\u0c82_\u0cac\u0cc1_\u0c97\u0cc1_\u0cb6\u0cc1_\u0cb6'.split(
                '_'
            ),
        longDateFormat: {
            LT: 'A h:mm',
            LTS: 'A h:mm:ss',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY, A h:mm',
            LLLL: 'dddd, D MMMM YYYY, A h:mm',
        },
        calendar: {
            sameDay: '[\u0c87\u0c82\u0ca6\u0cc1] LT',
            nextDay: '[\u0ca8\u0cbe\u0cb3\u0cc6] LT',
            nextWeek: 'dddd, LT',
            lastDay: '[\u0ca8\u0cbf\u0ca8\u0ccd\u0ca8\u0cc6] LT',
            lastWeek: '[\u0c95\u0cc6\u0cc2\u0ca8\u0cc6\u0caf] dddd, LT',
            sameElse: 'L',
        },
        relativeTime: {
            future: '%s \u0ca8\u0c82\u0ca4\u0cb0',
            past: '%s \u0cb9\u0cbf\u0c82\u0ca6\u0cc6',
            s: '\u0c95\u0cc6\u0cb2\u0cb5\u0cc1 \u0c95\u0ccd\u0cb7\u0ca3\u0c97\u0cb3\u0cc1',
            ss: '%d \u0cb8\u0cc6\u0c95\u0cc6\u0c82\u0ca1\u0cc1\u0c97\u0cb3\u0cc1',
            m: '\u0c92\u0c82\u0ca6\u0cc1 \u0ca8\u0cbf\u0cae\u0cbf\u0cb7',
            mm: '%d \u0ca8\u0cbf\u0cae\u0cbf\u0cb7',
            h: '\u0c92\u0c82\u0ca6\u0cc1 \u0c97\u0c82\u0c9f\u0cc6',
            hh: '%d \u0c97\u0c82\u0c9f\u0cc6',
            d: '\u0c92\u0c82\u0ca6\u0cc1 \u0ca6\u0cbf\u0ca8',
            dd: '%d \u0ca6\u0cbf\u0ca8',
            M: '\u0c92\u0c82\u0ca6\u0cc1 \u0ca4\u0cbf\u0c82\u0c97\u0cb3\u0cc1',
            MM: '%d \u0ca4\u0cbf\u0c82\u0c97\u0cb3\u0cc1',
            y: '\u0c92\u0c82\u0ca6\u0cc1 \u0cb5\u0cb0\u0ccd\u0cb7',
            yy: '%d \u0cb5\u0cb0\u0ccd\u0cb7',
        },
        preparse: function (e) {
            return e.replace(
                /[\u0ce7\u0ce8\u0ce9\u0cea\u0ceb\u0cec\u0ced\u0cee\u0cef\u0ce6]/g,
                function (e) {
                    return _n[e];
                }
            );
        },
        postformat: function (e) {
            return e.replace(/\d/g, function (e) {
                return rn[e];
            });
        },
        meridiemParse:
            /\u0cb0\u0cbe\u0ca4\u0ccd\u0cb0\u0cbf|\u0cac\u0cc6\u0cb3\u0cbf\u0c97\u0ccd\u0c97\u0cc6|\u0cae\u0ca7\u0ccd\u0caf\u0cbe\u0cb9\u0ccd\u0ca8|\u0cb8\u0c82\u0c9c\u0cc6/,
        meridiemHour: function (e, a) {
            return (
                12 === e && (e = 0),
                '\u0cb0\u0cbe\u0ca4\u0ccd\u0cb0\u0cbf' === a
                    ? e < 4
                        ? e
                        : e + 12
                    : '\u0cac\u0cc6\u0cb3\u0cbf\u0c97\u0ccd\u0c97\u0cc6' === a
                    ? e
                    : '\u0cae\u0ca7\u0ccd\u0caf\u0cbe\u0cb9\u0ccd\u0ca8' === a
                    ? 10 <= e
                        ? e
                        : e + 12
                    : '\u0cb8\u0c82\u0c9c\u0cc6' === a
                    ? e + 12
                    : void 0
            );
        },
        meridiem: function (e, a, t) {
            return e < 4
                ? '\u0cb0\u0cbe\u0ca4\u0ccd\u0cb0\u0cbf'
                : e < 10
                ? '\u0cac\u0cc6\u0cb3\u0cbf\u0c97\u0ccd\u0c97\u0cc6'
                : e < 17
                ? '\u0cae\u0ca7\u0ccd\u0caf\u0cbe\u0cb9\u0ccd\u0ca8'
                : e < 20
                ? '\u0cb8\u0c82\u0c9c\u0cc6'
                : '\u0cb0\u0cbe\u0ca4\u0ccd\u0cb0\u0cbf';
        },
        dayOfMonthOrdinalParse: /\d{1,2}(\u0ca8\u0cc6\u0cd5)/,
        ordinal: function (e) {
            return e + '\u0ca8\u0cc6\u0cd5';
        },
        week: { dow: 0, doy: 6 },
    }),
        l.defineLocale('ko', {
            months: '1\uc6d4_2\uc6d4_3\uc6d4_4\uc6d4_5\uc6d4_6\uc6d4_7\uc6d4_8\uc6d4_9\uc6d4_10\uc6d4_11\uc6d4_12\uc6d4'.split(
                '_'
            ),
            monthsShort:
                '1\uc6d4_2\uc6d4_3\uc6d4_4\uc6d4_5\uc6d4_6\uc6d4_7\uc6d4_8\uc6d4_9\uc6d4_10\uc6d4_11\uc6d4_12\uc6d4'.split(
                    '_'
                ),
            weekdays:
                '\uc77c\uc694\uc77c_\uc6d4\uc694\uc77c_\ud654\uc694\uc77c_\uc218\uc694\uc77c_\ubaa9\uc694\uc77c_\uae08\uc694\uc77c_\ud1a0\uc694\uc77c'.split(
                    '_'
                ),
            weekdaysShort:
                '\uc77c_\uc6d4_\ud654_\uc218_\ubaa9_\uae08_\ud1a0'.split('_'),
            weekdaysMin:
                '\uc77c_\uc6d4_\ud654_\uc218_\ubaa9_\uae08_\ud1a0'.split('_'),
            longDateFormat: {
                LT: 'A h:mm',
                LTS: 'A h:mm:ss',
                L: 'YYYY.MM.DD.',
                LL: 'YYYY\ub144 MMMM D\uc77c',
                LLL: 'YYYY\ub144 MMMM D\uc77c A h:mm',
                LLLL: 'YYYY\ub144 MMMM D\uc77c dddd A h:mm',
                l: 'YYYY.MM.DD.',
                ll: 'YYYY\ub144 MMMM D\uc77c',
                lll: 'YYYY\ub144 MMMM D\uc77c A h:mm',
                llll: 'YYYY\ub144 MMMM D\uc77c dddd A h:mm',
            },
            calendar: {
                sameDay: '\uc624\ub298 LT',
                nextDay: '\ub0b4\uc77c LT',
                nextWeek: 'dddd LT',
                lastDay: '\uc5b4\uc81c LT',
                lastWeek: '\uc9c0\ub09c\uc8fc dddd LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: '%s \ud6c4',
                past: '%s \uc804',
                s: '\uba87 \ucd08',
                ss: '%d\ucd08',
                m: '1\ubd84',
                mm: '%d\ubd84',
                h: '\ud55c \uc2dc\uac04',
                hh: '%d\uc2dc\uac04',
                d: '\ud558\ub8e8',
                dd: '%d\uc77c',
                M: '\ud55c \ub2ec',
                MM: '%d\ub2ec',
                y: '\uc77c \ub144',
                yy: '%d\ub144',
            },
            dayOfMonthOrdinalParse: /\d{1,2}(\uc77c|\uc6d4|\uc8fc)/,
            ordinal: function (e, a) {
                switch (a) {
                    case 'd':
                    case 'D':
                    case 'DDD':
                        return e + '\uc77c';
                    case 'M':
                        return e + '\uc6d4';
                    case 'w':
                    case 'W':
                        return e + '\uc8fc';
                    default:
                        return e;
                }
            },
            meridiemParse: /\uc624\uc804|\uc624\ud6c4/,
            isPM: function (e) {
                return '\uc624\ud6c4' === e;
            },
            meridiem: function (e, a, t) {
                return e < 12 ? '\uc624\uc804' : '\uc624\ud6c4';
            },
        });
    var on = {
            1: '\u0661',
            2: '\u0662',
            3: '\u0663',
            4: '\u0664',
            5: '\u0665',
            6: '\u0666',
            7: '\u0667',
            8: '\u0668',
            9: '\u0669',
            0: '\u0660',
        },
        mn = {
            '\u0661': '1',
            '\u0662': '2',
            '\u0663': '3',
            '\u0664': '4',
            '\u0665': '5',
            '\u0666': '6',
            '\u0667': '7',
            '\u0668': '8',
            '\u0669': '9',
            '\u0660': '0',
        },
        un = [
            '\u06a9\u0627\u0646\u0648\u0646\u06cc \u062f\u0648\u0648\u06d5\u0645',
            '\u0634\u0648\u0628\u0627\u062a',
            '\u0626\u0627\u0632\u0627\u0631',
            '\u0646\u06cc\u0633\u0627\u0646',
            '\u0626\u0627\u06cc\u0627\u0631',
            '\u062d\u0648\u0632\u06d5\u06cc\u0631\u0627\u0646',
            '\u062a\u06d5\u0645\u0645\u0648\u0632',
            '\u0626\u0627\u0628',
            '\u0626\u06d5\u06cc\u0644\u0648\u0648\u0644',
            '\u062a\u0634\u0631\u06cc\u0646\u06cc \u06cc\u06d5\u0643\u06d5\u0645',
            '\u062a\u0634\u0631\u06cc\u0646\u06cc \u062f\u0648\u0648\u06d5\u0645',
            '\u0643\u0627\u0646\u0648\u0646\u06cc \u06cc\u06d5\u06a9\u06d5\u0645',
        ];
    l.defineLocale('ku', {
        months: un,
        monthsShort: un,
        weekdays:
            '\u06cc\u0647\u200c\u0643\u0634\u0647\u200c\u0645\u0645\u0647\u200c_\u062f\u0648\u0648\u0634\u0647\u200c\u0645\u0645\u0647\u200c_\u0633\u06ce\u0634\u0647\u200c\u0645\u0645\u0647\u200c_\u0686\u0648\u0627\u0631\u0634\u0647\u200c\u0645\u0645\u0647\u200c_\u067e\u06ce\u0646\u062c\u0634\u0647\u200c\u0645\u0645\u0647\u200c_\u0647\u0647\u200c\u06cc\u0646\u06cc_\u0634\u0647\u200c\u0645\u0645\u0647\u200c'.split(
                '_'
            ),
        weekdaysShort:
            '\u06cc\u0647\u200c\u0643\u0634\u0647\u200c\u0645_\u062f\u0648\u0648\u0634\u0647\u200c\u0645_\u0633\u06ce\u0634\u0647\u200c\u0645_\u0686\u0648\u0627\u0631\u0634\u0647\u200c\u0645_\u067e\u06ce\u0646\u062c\u0634\u0647\u200c\u0645_\u0647\u0647\u200c\u06cc\u0646\u06cc_\u0634\u0647\u200c\u0645\u0645\u0647\u200c'.split(
                '_'
            ),
        weekdaysMin: '\u06cc_\u062f_\u0633_\u0686_\u067e_\u0647_\u0634'.split(
            '_'
        ),
        weekdaysParseExact: !0,
        longDateFormat: {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY HH:mm',
            LLLL: 'dddd, D MMMM YYYY HH:mm',
        },
        meridiemParse:
            /\u0626\u06ce\u0648\u0627\u0631\u0647\u200c|\u0628\u0647\u200c\u06cc\u0627\u0646\u06cc/,
        isPM: function (e) {
            return /\u0626\u06ce\u0648\u0627\u0631\u0647\u200c/.test(e);
        },
        meridiem: function (e, a, t) {
            return e < 12
                ? '\u0628\u0647\u200c\u06cc\u0627\u0646\u06cc'
                : '\u0626\u06ce\u0648\u0627\u0631\u0647\u200c';
        },
        calendar: {
            sameDay:
                '[\u0626\u0647\u200c\u0645\u0631\u06c6 \u0643\u0627\u062a\u0698\u0645\u06ce\u0631] LT',
            nextDay:
                '[\u0628\u0647\u200c\u06cc\u0627\u0646\u06cc \u0643\u0627\u062a\u0698\u0645\u06ce\u0631] LT',
            nextWeek: 'dddd [\u0643\u0627\u062a\u0698\u0645\u06ce\u0631] LT',
            lastDay:
                '[\u062f\u0648\u06ce\u0646\u06ce \u0643\u0627\u062a\u0698\u0645\u06ce\u0631] LT',
            lastWeek: 'dddd [\u0643\u0627\u062a\u0698\u0645\u06ce\u0631] LT',
            sameElse: 'L',
        },
        relativeTime: {
            future: '\u0644\u0647\u200c %s',
            past: '%s',
            s: '\u0686\u0647\u200c\u0646\u062f \u0686\u0631\u0643\u0647\u200c\u06cc\u0647\u200c\u0643',
            ss: '\u0686\u0631\u0643\u0647\u200c %d',
            m: '\u06cc\u0647\u200c\u0643 \u062e\u0648\u0644\u0647\u200c\u0643',
            mm: '%d \u062e\u0648\u0644\u0647\u200c\u0643',
            h: '\u06cc\u0647\u200c\u0643 \u0643\u0627\u062a\u0698\u0645\u06ce\u0631',
            hh: '%d \u0643\u0627\u062a\u0698\u0645\u06ce\u0631',
            d: '\u06cc\u0647\u200c\u0643 \u0695\u06c6\u0698',
            dd: '%d \u0695\u06c6\u0698',
            M: '\u06cc\u0647\u200c\u0643 \u0645\u0627\u0646\u06af',
            MM: '%d \u0645\u0627\u0646\u06af',
            y: '\u06cc\u0647\u200c\u0643 \u0633\u0627\u06b5',
            yy: '%d \u0633\u0627\u06b5',
        },
        preparse: function (e) {
            return e
                .replace(
                    /[\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669\u0660]/g,
                    function (e) {
                        return mn[e];
                    }
                )
                .replace(/\u060c/g, ',');
        },
        postformat: function (e) {
            return e
                .replace(/\d/g, function (e) {
                    return on[e];
                })
                .replace(/,/g, '\u060c');
        },
        week: { dow: 6, doy: 12 },
    });
    var ln = {
        0: '-\u0447\u04af',
        1: '-\u0447\u0438',
        2: '-\u0447\u0438',
        3: '-\u0447\u04af',
        4: '-\u0447\u04af',
        5: '-\u0447\u0438',
        6: '-\u0447\u044b',
        7: '-\u0447\u0438',
        8: '-\u0447\u0438',
        9: '-\u0447\u0443',
        10: '-\u0447\u0443',
        20: '-\u0447\u044b',
        30: '-\u0447\u0443',
        40: '-\u0447\u044b',
        50: '-\u0447\u04af',
        60: '-\u0447\u044b',
        70: '-\u0447\u0438',
        80: '-\u0447\u0438',
        90: '-\u0447\u0443',
        100: '-\u0447\u04af',
    };
    function Mn(e, a, t, s) {
        var n = {
            m: ['eng Minutt', 'enger Minutt'],
            h: ['eng Stonn', 'enger Stonn'],
            d: ['een Dag', 'engem Dag'],
            M: ['ee Mount', 'engem Mount'],
            y: ['ee Joer', 'engem Joer'],
        };
        return a ? n[t][0] : n[t][1];
    }
    function hn(e) {
        if (((e = parseInt(e, 10)), isNaN(e))) return !1;
        if (e < 0) return !0;
        if (e < 10) return 4 <= e && e <= 7;
        if (e < 100) {
            var a = e % 10;
            return hn(0 === a ? e / 10 : a);
        }
        if (e < 1e4) {
            for (; 10 <= e; ) e /= 10;
            return hn(e);
        }
        return hn((e /= 1e3));
    }
    l.defineLocale('ky', {
        months: '\u044f\u043d\u0432\u0430\u0440\u044c_\u0444\u0435\u0432\u0440\u0430\u043b\u044c_\u043c\u0430\u0440\u0442_\u0430\u043f\u0440\u0435\u043b\u044c_\u043c\u0430\u0439_\u0438\u044e\u043d\u044c_\u0438\u044e\u043b\u044c_\u0430\u0432\u0433\u0443\u0441\u0442_\u0441\u0435\u043d\u0442\u044f\u0431\u0440\u044c_\u043e\u043a\u0442\u044f\u0431\u0440\u044c_\u043d\u043e\u044f\u0431\u0440\u044c_\u0434\u0435\u043a\u0430\u0431\u0440\u044c'.split(
            '_'
        ),
        monthsShort:
            '\u044f\u043d\u0432_\u0444\u0435\u0432_\u043c\u0430\u0440\u0442_\u0430\u043f\u0440_\u043c\u0430\u0439_\u0438\u044e\u043d\u044c_\u0438\u044e\u043b\u044c_\u0430\u0432\u0433_\u0441\u0435\u043d_\u043e\u043a\u0442_\u043d\u043e\u044f_\u0434\u0435\u043a'.split(
                '_'
            ),
        weekdays:
            '\u0416\u0435\u043a\u0448\u0435\u043c\u0431\u0438_\u0414\u04af\u0439\u0448\u04e9\u043c\u0431\u04af_\u0428\u0435\u0439\u0448\u0435\u043c\u0431\u0438_\u0428\u0430\u0440\u0448\u0435\u043c\u0431\u0438_\u0411\u0435\u0439\u0448\u0435\u043c\u0431\u0438_\u0416\u0443\u043c\u0430_\u0418\u0448\u0435\u043c\u0431\u0438'.split(
                '_'
            ),
        weekdaysShort:
            '\u0416\u0435\u043a_\u0414\u04af\u0439_\u0428\u0435\u0439_\u0428\u0430\u0440_\u0411\u0435\u0439_\u0416\u0443\u043c_\u0418\u0448\u0435'.split(
                '_'
            ),
        weekdaysMin:
            '\u0416\u043a_\u0414\u0439_\u0428\u0439_\u0428\u0440_\u0411\u0439_\u0416\u043c_\u0418\u0448'.split(
                '_'
            ),
        longDateFormat: {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L: 'DD.MM.YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY HH:mm',
            LLLL: 'dddd, D MMMM YYYY HH:mm',
        },
        calendar: {
            sameDay:
                '[\u0411\u04af\u0433\u04af\u043d \u0441\u0430\u0430\u0442] LT',
            nextDay:
                '[\u042d\u0440\u0442\u0435\u04a3 \u0441\u0430\u0430\u0442] LT',
            nextWeek: 'dddd [\u0441\u0430\u0430\u0442] LT',
            lastDay:
                '[\u041a\u0435\u0447\u044d\u044d \u0441\u0430\u0430\u0442] LT',
            lastWeek:
                '[\u04e8\u0442\u043a\u04e9\u043d \u0430\u043f\u0442\u0430\u043d\u044b\u043d] dddd [\u043a\u04af\u043d\u04af] [\u0441\u0430\u0430\u0442] LT',
            sameElse: 'L',
        },
        relativeTime: {
            future: '%s \u0438\u0447\u0438\u043d\u0434\u0435',
            past: '%s \u043c\u0443\u0440\u0443\u043d',
            s: '\u0431\u0438\u0440\u043d\u0435\u0447\u0435 \u0441\u0435\u043a\u0443\u043d\u0434',
            ss: '%d \u0441\u0435\u043a\u0443\u043d\u0434',
            m: '\u0431\u0438\u0440 \u043c\u04af\u043d\u04e9\u0442',
            mm: '%d \u043c\u04af\u043d\u04e9\u0442',
            h: '\u0431\u0438\u0440 \u0441\u0430\u0430\u0442',
            hh: '%d \u0441\u0430\u0430\u0442',
            d: '\u0431\u0438\u0440 \u043a\u04af\u043d',
            dd: '%d \u043a\u04af\u043d',
            M: '\u0431\u0438\u0440 \u0430\u0439',
            MM: '%d \u0430\u0439',
            y: '\u0431\u0438\u0440 \u0436\u044b\u043b',
            yy: '%d \u0436\u044b\u043b',
        },
        dayOfMonthOrdinalParse:
            /\d{1,2}-(\u0447\u0438|\u0447\u044b|\u0447\u04af|\u0447\u0443)/,
        ordinal: function (e) {
            return e + (ln[e] || ln[e % 10] || ln[100 <= e ? 100 : null]);
        },
        week: { dow: 1, doy: 7 },
    }),
        l.defineLocale('lb', {
            months: 'Januar_Februar_M\xe4erz_Abr\xebll_Mee_Juni_Juli_August_September_Oktober_November_Dezember'.split(
                '_'
            ),
            monthsShort:
                'Jan._Febr._Mrz._Abr._Mee_Jun._Jul._Aug._Sept._Okt._Nov._Dez.'.split(
                    '_'
                ),
            monthsParseExact: !0,
            weekdays:
                'Sonndeg_M\xe9indeg_D\xebnschdeg_M\xebttwoch_Donneschdeg_Freideg_Samschdeg'.split(
                    '_'
                ),
            weekdaysShort: 'So._M\xe9._D\xeb._M\xeb._Do._Fr._Sa.'.split('_'),
            weekdaysMin: 'So_M\xe9_D\xeb_M\xeb_Do_Fr_Sa'.split('_'),
            weekdaysParseExact: !0,
            longDateFormat: {
                LT: 'H:mm [Auer]',
                LTS: 'H:mm:ss [Auer]',
                L: 'DD.MM.YYYY',
                LL: 'D. MMMM YYYY',
                LLL: 'D. MMMM YYYY H:mm [Auer]',
                LLLL: 'dddd, D. MMMM YYYY H:mm [Auer]',
            },
            calendar: {
                sameDay: '[Haut um] LT',
                sameElse: 'L',
                nextDay: '[Muer um] LT',
                nextWeek: 'dddd [um] LT',
                lastDay: '[G\xebschter um] LT',
                lastWeek: function () {
                    switch (this.day()) {
                        case 2:
                        case 4:
                            return '[Leschten] dddd [um] LT';
                        default:
                            return '[Leschte] dddd [um] LT';
                    }
                },
            },
            relativeTime: {
                future: function (e) {
                    return hn(e.substr(0, e.indexOf(' ')))
                        ? 'a ' + e
                        : 'an ' + e;
                },
                past: function (e) {
                    return hn(e.substr(0, e.indexOf(' ')))
                        ? 'viru ' + e
                        : 'virun ' + e;
                },
                s: 'e puer Sekonnen',
                ss: '%d Sekonnen',
                m: Mn,
                mm: '%d Minutten',
                h: Mn,
                hh: '%d Stonnen',
                d: Mn,
                dd: '%d Deeg',
                M: Mn,
                MM: '%d M\xe9int',
                y: Mn,
                yy: '%d Joer',
            },
            dayOfMonthOrdinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: { dow: 1, doy: 4 },
        }),
        l.defineLocale('lo', {
            months: '\u0ea1\u0eb1\u0e87\u0e81\u0ead\u0e99_\u0e81\u0eb8\u0ea1\u0e9e\u0eb2_\u0ea1\u0eb5\u0e99\u0eb2_\u0ec0\u0ea1\u0eaa\u0eb2_\u0e9e\u0eb6\u0e94\u0eaa\u0eb0\u0e9e\u0eb2_\u0ea1\u0eb4\u0e96\u0eb8\u0e99\u0eb2_\u0e81\u0ecd\u0ea5\u0eb0\u0e81\u0ebb\u0e94_\u0eaa\u0eb4\u0e87\u0eab\u0eb2_\u0e81\u0eb1\u0e99\u0e8d\u0eb2_\u0e95\u0eb8\u0ea5\u0eb2_\u0e9e\u0eb0\u0e88\u0eb4\u0e81_\u0e97\u0eb1\u0e99\u0ea7\u0eb2'.split(
                '_'
            ),
            monthsShort:
                '\u0ea1\u0eb1\u0e87\u0e81\u0ead\u0e99_\u0e81\u0eb8\u0ea1\u0e9e\u0eb2_\u0ea1\u0eb5\u0e99\u0eb2_\u0ec0\u0ea1\u0eaa\u0eb2_\u0e9e\u0eb6\u0e94\u0eaa\u0eb0\u0e9e\u0eb2_\u0ea1\u0eb4\u0e96\u0eb8\u0e99\u0eb2_\u0e81\u0ecd\u0ea5\u0eb0\u0e81\u0ebb\u0e94_\u0eaa\u0eb4\u0e87\u0eab\u0eb2_\u0e81\u0eb1\u0e99\u0e8d\u0eb2_\u0e95\u0eb8\u0ea5\u0eb2_\u0e9e\u0eb0\u0e88\u0eb4\u0e81_\u0e97\u0eb1\u0e99\u0ea7\u0eb2'.split(
                    '_'
                ),
            weekdays:
                '\u0ead\u0eb2\u0e97\u0eb4\u0e94_\u0e88\u0eb1\u0e99_\u0ead\u0eb1\u0e87\u0e84\u0eb2\u0e99_\u0e9e\u0eb8\u0e94_\u0e9e\u0eb0\u0eab\u0eb1\u0e94_\u0eaa\u0eb8\u0e81_\u0ec0\u0eaa\u0ebb\u0eb2'.split(
                    '_'
                ),
            weekdaysShort:
                '\u0e97\u0eb4\u0e94_\u0e88\u0eb1\u0e99_\u0ead\u0eb1\u0e87\u0e84\u0eb2\u0e99_\u0e9e\u0eb8\u0e94_\u0e9e\u0eb0\u0eab\u0eb1\u0e94_\u0eaa\u0eb8\u0e81_\u0ec0\u0eaa\u0ebb\u0eb2'.split(
                    '_'
                ),
            weekdaysMin:
                '\u0e97_\u0e88_\u0ead\u0e84_\u0e9e_\u0e9e\u0eab_\u0eaa\u0e81_\u0eaa'.split(
                    '_'
                ),
            weekdaysParseExact: !0,
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: '\u0ea7\u0eb1\u0e99dddd D MMMM YYYY HH:mm',
            },
            meridiemParse:
                /\u0e95\u0ead\u0e99\u0ec0\u0e8a\u0ebb\u0ec9\u0eb2|\u0e95\u0ead\u0e99\u0ec1\u0ea5\u0e87/,
            isPM: function (e) {
                return '\u0e95\u0ead\u0e99\u0ec1\u0ea5\u0e87' === e;
            },
            meridiem: function (e, a, t) {
                return e < 12
                    ? '\u0e95\u0ead\u0e99\u0ec0\u0e8a\u0ebb\u0ec9\u0eb2'
                    : '\u0e95\u0ead\u0e99\u0ec1\u0ea5\u0e87';
            },
            calendar: {
                sameDay:
                    '[\u0ea1\u0eb7\u0ec9\u0e99\u0eb5\u0ec9\u0ec0\u0ea7\u0ea5\u0eb2] LT',
                nextDay:
                    '[\u0ea1\u0eb7\u0ec9\u0ead\u0eb7\u0ec8\u0e99\u0ec0\u0ea7\u0ea5\u0eb2] LT',
                nextWeek:
                    '[\u0ea7\u0eb1\u0e99]dddd[\u0edc\u0ec9\u0eb2\u0ec0\u0ea7\u0ea5\u0eb2] LT',
                lastDay:
                    '[\u0ea1\u0eb7\u0ec9\u0ea7\u0eb2\u0e99\u0e99\u0eb5\u0ec9\u0ec0\u0ea7\u0ea5\u0eb2] LT',
                lastWeek:
                    '[\u0ea7\u0eb1\u0e99]dddd[\u0ec1\u0ea5\u0ec9\u0ea7\u0e99\u0eb5\u0ec9\u0ec0\u0ea7\u0ea5\u0eb2] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: '\u0ead\u0eb5\u0e81 %s',
                past: '%s\u0e9c\u0ec8\u0eb2\u0e99\u0ea1\u0eb2',
                s: '\u0e9a\u0ecd\u0ec8\u0ec0\u0e97\u0ebb\u0ec8\u0eb2\u0ec3\u0e94\u0ea7\u0eb4\u0e99\u0eb2\u0e97\u0eb5',
                ss: '%d \u0ea7\u0eb4\u0e99\u0eb2\u0e97\u0eb5',
                m: '1 \u0e99\u0eb2\u0e97\u0eb5',
                mm: '%d \u0e99\u0eb2\u0e97\u0eb5',
                h: '1 \u0e8a\u0ebb\u0ec8\u0ea7\u0ec2\u0ea1\u0e87',
                hh: '%d \u0e8a\u0ebb\u0ec8\u0ea7\u0ec2\u0ea1\u0e87',
                d: '1 \u0ea1\u0eb7\u0ec9',
                dd: '%d \u0ea1\u0eb7\u0ec9',
                M: '1 \u0ec0\u0e94\u0eb7\u0ead\u0e99',
                MM: '%d \u0ec0\u0e94\u0eb7\u0ead\u0e99',
                y: '1 \u0e9b\u0eb5',
                yy: '%d \u0e9b\u0eb5',
            },
            dayOfMonthOrdinalParse: /(\u0e97\u0eb5\u0ec8)\d{1,2}/,
            ordinal: function (e) {
                return '\u0e97\u0eb5\u0ec8' + e;
            },
        });
    var Ln = {
        ss: 'sekund\u0117_sekund\u017ei\u0173_sekundes',
        m: 'minut\u0117_minut\u0117s_minut\u0119',
        mm: 'minut\u0117s_minu\u010di\u0173_minutes',
        h: 'valanda_valandos_valand\u0105',
        hh: 'valandos_valand\u0173_valandas',
        d: 'diena_dienos_dien\u0105',
        dd: 'dienos_dien\u0173_dienas',
        M: 'm\u0117nuo_m\u0117nesio_m\u0117nes\u012f',
        MM: 'm\u0117nesiai_m\u0117nesi\u0173_m\u0117nesius',
        y: 'metai_met\u0173_metus',
        yy: 'metai_met\u0173_metus',
    };
    function cn(e, a, t, s) {
        return a ? yn(t)[0] : s ? yn(t)[1] : yn(t)[2];
    }
    function Yn(e) {
        return e % 10 == 0 || (10 < e && e < 20);
    }
    function yn(e) {
        return Ln[e].split('_');
    }
    function fn(e, a, t, s) {
        var n = e + ' ';
        return 1 === e
            ? n + cn(0, a, t[0], s)
            : a
            ? n + (Yn(e) ? yn(t)[1] : yn(t)[0])
            : s
            ? n + yn(t)[1]
            : n + (Yn(e) ? yn(t)[1] : yn(t)[2]);
    }
    l.defineLocale('lt', {
        months: {
            format: 'sausio_vasario_kovo_baland\u017eio_gegu\u017e\u0117s_bir\u017eelio_liepos_rugpj\u016b\u010dio_rugs\u0117jo_spalio_lapkri\u010dio_gruod\u017eio'.split(
                '_'
            ),
            standalone:
                'sausis_vasaris_kovas_balandis_gegu\u017e\u0117_bir\u017eelis_liepa_rugpj\u016btis_rugs\u0117jis_spalis_lapkritis_gruodis'.split(
                    '_'
                ),
            isFormat:
                /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?|MMMM?(\[[^\[\]]*\]|\s)+D[oD]?/,
        },
        monthsShort: 'sau_vas_kov_bal_geg_bir_lie_rgp_rgs_spa_lap_grd'.split(
            '_'
        ),
        weekdays: {
            format: 'sekmadien\u012f_pirmadien\u012f_antradien\u012f_tre\u010diadien\u012f_ketvirtadien\u012f_penktadien\u012f_\u0161e\u0161tadien\u012f'.split(
                '_'
            ),
            standalone:
                'sekmadienis_pirmadienis_antradienis_tre\u010diadienis_ketvirtadienis_penktadienis_\u0161e\u0161tadienis'.split(
                    '_'
                ),
            isFormat: /dddd HH:mm/,
        },
        weekdaysShort: 'Sek_Pir_Ant_Tre_Ket_Pen_\u0160e\u0161'.split('_'),
        weekdaysMin: 'S_P_A_T_K_Pn_\u0160'.split('_'),
        weekdaysParseExact: !0,
        longDateFormat: {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L: 'YYYY-MM-DD',
            LL: 'YYYY [m.] MMMM D [d.]',
            LLL: 'YYYY [m.] MMMM D [d.], HH:mm [val.]',
            LLLL: 'YYYY [m.] MMMM D [d.], dddd, HH:mm [val.]',
            l: 'YYYY-MM-DD',
            ll: 'YYYY [m.] MMMM D [d.]',
            lll: 'YYYY [m.] MMMM D [d.], HH:mm [val.]',
            llll: 'YYYY [m.] MMMM D [d.], ddd, HH:mm [val.]',
        },
        calendar: {
            sameDay: '[\u0160iandien] LT',
            nextDay: '[Rytoj] LT',
            nextWeek: 'dddd LT',
            lastDay: '[Vakar] LT',
            lastWeek: '[Pra\u0117jus\u012f] dddd LT',
            sameElse: 'L',
        },
        relativeTime: {
            future: 'po %s',
            past: 'prie\u0161 %s',
            s: function (e, a, t, s) {
                return a
                    ? 'kelios sekund\u0117s'
                    : s
                    ? 'keli\u0173 sekund\u017ei\u0173'
                    : 'kelias sekundes';
            },
            ss: fn,
            m: cn,
            mm: fn,
            h: cn,
            hh: fn,
            d: cn,
            dd: fn,
            M: cn,
            MM: fn,
            y: cn,
            yy: fn,
        },
        dayOfMonthOrdinalParse: /\d{1,2}-oji/,
        ordinal: function (e) {
            return e + '-oji';
        },
        week: { dow: 1, doy: 4 },
    });
    var kn = {
        ss: 'sekundes_sekund\u0113m_sekunde_sekundes'.split('_'),
        m: 'min\u016btes_min\u016bt\u0113m_min\u016bte_min\u016btes'.split('_'),
        mm: 'min\u016btes_min\u016bt\u0113m_min\u016bte_min\u016btes'.split(
            '_'
        ),
        h: 'stundas_stund\u0101m_stunda_stundas'.split('_'),
        hh: 'stundas_stund\u0101m_stunda_stundas'.split('_'),
        d: 'dienas_dien\u0101m_diena_dienas'.split('_'),
        dd: 'dienas_dien\u0101m_diena_dienas'.split('_'),
        M: 'm\u0113ne\u0161a_m\u0113ne\u0161iem_m\u0113nesis_m\u0113ne\u0161i'.split(
            '_'
        ),
        MM: 'm\u0113ne\u0161a_m\u0113ne\u0161iem_m\u0113nesis_m\u0113ne\u0161i'.split(
            '_'
        ),
        y: 'gada_gadiem_gads_gadi'.split('_'),
        yy: 'gada_gadiem_gads_gadi'.split('_'),
    };
    function pn(e, a, t) {
        return t
            ? a % 10 == 1 && a % 100 != 11
                ? e[2]
                : e[3]
            : a % 10 == 1 && a % 100 != 11
            ? e[0]
            : e[1];
    }
    function Dn(e, a, t) {
        return e + ' ' + pn(kn[t], e, a);
    }
    function Tn(e, a, t) {
        return pn(kn[t], e, a);
    }
    l.defineLocale('lv', {
        months: 'janv\u0101ris_febru\u0101ris_marts_apr\u012blis_maijs_j\u016bnijs_j\u016blijs_augusts_septembris_oktobris_novembris_decembris'.split(
            '_'
        ),
        monthsShort:
            'jan_feb_mar_apr_mai_j\u016bn_j\u016bl_aug_sep_okt_nov_dec'.split(
                '_'
            ),
        weekdays:
            'sv\u0113tdiena_pirmdiena_otrdiena_tre\u0161diena_ceturtdiena_piektdiena_sestdiena'.split(
                '_'
            ),
        weekdaysShort: 'Sv_P_O_T_C_Pk_S'.split('_'),
        weekdaysMin: 'Sv_P_O_T_C_Pk_S'.split('_'),
        weekdaysParseExact: !0,
        longDateFormat: {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L: 'DD.MM.YYYY.',
            LL: 'YYYY. [gada] D. MMMM',
            LLL: 'YYYY. [gada] D. MMMM, HH:mm',
            LLLL: 'YYYY. [gada] D. MMMM, dddd, HH:mm',
        },
        calendar: {
            sameDay: '[\u0160odien pulksten] LT',
            nextDay: '[R\u012bt pulksten] LT',
            nextWeek: 'dddd [pulksten] LT',
            lastDay: '[Vakar pulksten] LT',
            lastWeek: '[Pag\u0101ju\u0161\u0101] dddd [pulksten] LT',
            sameElse: 'L',
        },
        relativeTime: {
            future: 'p\u0113c %s',
            past: 'pirms %s',
            s: function (e, a) {
                return a
                    ? 'da\u017eas sekundes'
                    : 'da\u017e\u0101m sekund\u0113m';
            },
            ss: Dn,
            m: Tn,
            mm: Dn,
            h: Tn,
            hh: Dn,
            d: Tn,
            dd: Dn,
            M: Tn,
            MM: Dn,
            y: Tn,
            yy: Dn,
        },
        dayOfMonthOrdinalParse: /\d{1,2}\./,
        ordinal: '%d.',
        week: { dow: 1, doy: 4 },
    });
    var gn = {
        words: {
            ss: ['sekund', 'sekunda', 'sekundi'],
            m: ['jedan minut', 'jednog minuta'],
            mm: ['minut', 'minuta', 'minuta'],
            h: ['jedan sat', 'jednog sata'],
            hh: ['sat', 'sata', 'sati'],
            dd: ['dan', 'dana', 'dana'],
            MM: ['mjesec', 'mjeseca', 'mjeseci'],
            yy: ['godina', 'godine', 'godina'],
        },
        correctGrammaticalCase: function (e, a) {
            return 1 === e ? a[0] : 2 <= e && e <= 4 ? a[1] : a[2];
        },
        translate: function (e, a, t) {
            var s = gn.words[t];
            return 1 === t.length
                ? a
                    ? s[0]
                    : s[1]
                : e + ' ' + gn.correctGrammaticalCase(e, s);
        },
    };
    function wn(e, a, t, s) {
        switch (t) {
            case 's':
                return a
                    ? '\u0445\u044d\u0434\u0445\u044d\u043d \u0441\u0435\u043a\u0443\u043d\u0434'
                    : '\u0445\u044d\u0434\u0445\u044d\u043d \u0441\u0435\u043a\u0443\u043d\u0434\u044b\u043d';
            case 'ss':
                return (
                    e +
                    (a
                        ? ' \u0441\u0435\u043a\u0443\u043d\u0434'
                        : ' \u0441\u0435\u043a\u0443\u043d\u0434\u044b\u043d')
                );
            case 'm':
            case 'mm':
                return (
                    e +
                    (a
                        ? ' \u043c\u0438\u043d\u0443\u0442'
                        : ' \u043c\u0438\u043d\u0443\u0442\u044b\u043d')
                );
            case 'h':
            case 'hh':
                return (
                    e +
                    (a
                        ? ' \u0446\u0430\u0433'
                        : ' \u0446\u0430\u0433\u0438\u0439\u043d')
                );
            case 'd':
            case 'dd':
                return (
                    e +
                    (a
                        ? ' \u04e9\u0434\u04e9\u0440'
                        : ' \u04e9\u0434\u0440\u0438\u0439\u043d')
                );
            case 'M':
            case 'MM':
                return (
                    e +
                    (a
                        ? ' \u0441\u0430\u0440'
                        : ' \u0441\u0430\u0440\u044b\u043d')
                );
            case 'y':
            case 'yy':
                return (
                    e +
                    (a
                        ? ' \u0436\u0438\u043b'
                        : ' \u0436\u0438\u043b\u0438\u0439\u043d')
                );
            default:
                return e;
        }
    }
    l.defineLocale('me', {
        months: 'januar_februar_mart_april_maj_jun_jul_avgust_septembar_oktobar_novembar_decembar'.split(
            '_'
        ),
        monthsShort:
            'jan._feb._mar._apr._maj_jun_jul_avg._sep._okt._nov._dec.'.split(
                '_'
            ),
        monthsParseExact: !0,
        weekdays:
            'nedjelja_ponedjeljak_utorak_srijeda_\u010detvrtak_petak_subota'.split(
                '_'
            ),
        weekdaysShort: 'ned._pon._uto._sri._\u010det._pet._sub.'.split('_'),
        weekdaysMin: 'ne_po_ut_sr_\u010de_pe_su'.split('_'),
        weekdaysParseExact: !0,
        longDateFormat: {
            LT: 'H:mm',
            LTS: 'H:mm:ss',
            L: 'DD.MM.YYYY',
            LL: 'D. MMMM YYYY',
            LLL: 'D. MMMM YYYY H:mm',
            LLLL: 'dddd, D. MMMM YYYY H:mm',
        },
        calendar: {
            sameDay: '[danas u] LT',
            nextDay: '[sjutra u] LT',
            nextWeek: function () {
                switch (this.day()) {
                    case 0:
                        return '[u] [nedjelju] [u] LT';
                    case 3:
                        return '[u] [srijedu] [u] LT';
                    case 6:
                        return '[u] [subotu] [u] LT';
                    case 1:
                    case 2:
                    case 4:
                    case 5:
                        return '[u] dddd [u] LT';
                }
            },
            lastDay: '[ju\u010de u] LT',
            lastWeek: function () {
                return [
                    '[pro\u0161le] [nedjelje] [u] LT',
                    '[pro\u0161log] [ponedjeljka] [u] LT',
                    '[pro\u0161log] [utorka] [u] LT',
                    '[pro\u0161le] [srijede] [u] LT',
                    '[pro\u0161log] [\u010detvrtka] [u] LT',
                    '[pro\u0161log] [petka] [u] LT',
                    '[pro\u0161le] [subote] [u] LT',
                ][this.day()];
            },
            sameElse: 'L',
        },
        relativeTime: {
            future: 'za %s',
            past: 'prije %s',
            s: 'nekoliko sekundi',
            ss: gn.translate,
            m: gn.translate,
            mm: gn.translate,
            h: gn.translate,
            hh: gn.translate,
            d: 'dan',
            dd: gn.translate,
            M: 'mjesec',
            MM: gn.translate,
            y: 'godinu',
            yy: gn.translate,
        },
        dayOfMonthOrdinalParse: /\d{1,2}\./,
        ordinal: '%d.',
        week: { dow: 1, doy: 7 },
    }),
        l.defineLocale('mi', {
            months: 'Kohi-t\u0101te_Hui-tanguru_Pout\u016b-te-rangi_Paenga-wh\u0101wh\u0101_Haratua_Pipiri_H\u014dngoingoi_Here-turi-k\u014dk\u0101_Mahuru_Whiringa-\u0101-nuku_Whiringa-\u0101-rangi_Hakihea'.split(
                '_'
            ),
            monthsShort:
                'Kohi_Hui_Pou_Pae_Hara_Pipi_H\u014dngoi_Here_Mahu_Whi-nu_Whi-ra_Haki'.split(
                    '_'
                ),
            monthsRegex: /(?:['a-z\u0101\u014D\u016B]+\-?){1,3}/i,
            monthsStrictRegex: /(?:['a-z\u0101\u014D\u016B]+\-?){1,3}/i,
            monthsShortRegex: /(?:['a-z\u0101\u014D\u016B]+\-?){1,3}/i,
            monthsShortStrictRegex: /(?:['a-z\u0101\u014D\u016B]+\-?){1,2}/i,
            weekdays:
                'R\u0101tapu_Mane_T\u016brei_Wenerei_T\u0101ite_Paraire_H\u0101tarei'.split(
                    '_'
                ),
            weekdaysShort: 'Ta_Ma_T\u016b_We_T\u0101i_Pa_H\u0101'.split('_'),
            weekdaysMin: 'Ta_Ma_T\u016b_We_T\u0101i_Pa_H\u0101'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY [i] HH:mm',
                LLLL: 'dddd, D MMMM YYYY [i] HH:mm',
            },
            calendar: {
                sameDay: '[i teie mahana, i] LT',
                nextDay: '[apopo i] LT',
                nextWeek: 'dddd [i] LT',
                lastDay: '[inanahi i] LT',
                lastWeek: 'dddd [whakamutunga i] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: 'i roto i %s',
                past: '%s i mua',
                s: 'te h\u0113kona ruarua',
                ss: '%d h\u0113kona',
                m: 'he meneti',
                mm: '%d meneti',
                h: 'te haora',
                hh: '%d haora',
                d: 'he ra',
                dd: '%d ra',
                M: 'he marama',
                MM: '%d marama',
                y: 'he tau',
                yy: '%d tau',
            },
            dayOfMonthOrdinalParse: /\d{1,2}\xba/,
            ordinal: '%d\xba',
            week: { dow: 1, doy: 4 },
        }),
        l.defineLocale('mk', {
            months: '\u0458\u0430\u043d\u0443\u0430\u0440\u0438_\u0444\u0435\u0432\u0440\u0443\u0430\u0440\u0438_\u043c\u0430\u0440\u0442_\u0430\u043f\u0440\u0438\u043b_\u043c\u0430\u0458_\u0458\u0443\u043d\u0438_\u0458\u0443\u043b\u0438_\u0430\u0432\u0433\u0443\u0441\u0442_\u0441\u0435\u043f\u0442\u0435\u043c\u0432\u0440\u0438_\u043e\u043a\u0442\u043e\u043c\u0432\u0440\u0438_\u043d\u043e\u0435\u043c\u0432\u0440\u0438_\u0434\u0435\u043a\u0435\u043c\u0432\u0440\u0438'.split(
                '_'
            ),
            monthsShort:
                '\u0458\u0430\u043d_\u0444\u0435\u0432_\u043c\u0430\u0440_\u0430\u043f\u0440_\u043c\u0430\u0458_\u0458\u0443\u043d_\u0458\u0443\u043b_\u0430\u0432\u0433_\u0441\u0435\u043f_\u043e\u043a\u0442_\u043d\u043e\u0435_\u0434\u0435\u043a'.split(
                    '_'
                ),
            weekdays:
                '\u043d\u0435\u0434\u0435\u043b\u0430_\u043f\u043e\u043d\u0435\u0434\u0435\u043b\u043d\u0438\u043a_\u0432\u0442\u043e\u0440\u043d\u0438\u043a_\u0441\u0440\u0435\u0434\u0430_\u0447\u0435\u0442\u0432\u0440\u0442\u043e\u043a_\u043f\u0435\u0442\u043e\u043a_\u0441\u0430\u0431\u043e\u0442\u0430'.split(
                    '_'
                ),
            weekdaysShort:
                '\u043d\u0435\u0434_\u043f\u043e\u043d_\u0432\u0442\u043e_\u0441\u0440\u0435_\u0447\u0435\u0442_\u043f\u0435\u0442_\u0441\u0430\u0431'.split(
                    '_'
                ),
            weekdaysMin:
                '\u043de_\u043fo_\u0432\u0442_\u0441\u0440_\u0447\u0435_\u043f\u0435_\u0441a'.split(
                    '_'
                ),
            longDateFormat: {
                LT: 'H:mm',
                LTS: 'H:mm:ss',
                L: 'D.MM.YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY H:mm',
                LLLL: 'dddd, D MMMM YYYY H:mm',
            },
            calendar: {
                sameDay: '[\u0414\u0435\u043d\u0435\u0441 \u0432\u043e] LT',
                nextDay: '[\u0423\u0442\u0440\u0435 \u0432\u043e] LT',
                nextWeek: '[\u0412\u043e] dddd [\u0432\u043e] LT',
                lastDay: '[\u0412\u0447\u0435\u0440\u0430 \u0432\u043e] LT',
                lastWeek: function () {
                    switch (this.day()) {
                        case 0:
                        case 3:
                        case 6:
                            return '[\u0418\u0437\u043c\u0438\u043d\u0430\u0442\u0430\u0442\u0430] dddd [\u0432\u043e] LT';
                        case 1:
                        case 2:
                        case 4:
                        case 5:
                            return '[\u0418\u0437\u043c\u0438\u043d\u0430\u0442\u0438\u043e\u0442] dddd [\u0432\u043e] LT';
                    }
                },
                sameElse: 'L',
            },
            relativeTime: {
                future: '\u043f\u043e\u0441\u043b\u0435 %s',
                past: '\u043f\u0440\u0435\u0434 %s',
                s: '\u043d\u0435\u043a\u043e\u043b\u043a\u0443 \u0441\u0435\u043a\u0443\u043d\u0434\u0438',
                ss: '%d \u0441\u0435\u043a\u0443\u043d\u0434\u0438',
                m: '\u043c\u0438\u043d\u0443\u0442\u0430',
                mm: '%d \u043c\u0438\u043d\u0443\u0442\u0438',
                h: '\u0447\u0430\u0441',
                hh: '%d \u0447\u0430\u0441\u0430',
                d: '\u0434\u0435\u043d',
                dd: '%d \u0434\u0435\u043d\u0430',
                M: '\u043c\u0435\u0441\u0435\u0446',
                MM: '%d \u043c\u0435\u0441\u0435\u0446\u0438',
                y: '\u0433\u043e\u0434\u0438\u043d\u0430',
                yy: '%d \u0433\u043e\u0434\u0438\u043d\u0438',
            },
            dayOfMonthOrdinalParse:
                /\d{1,2}-(\u0435\u0432|\u0435\u043d|\u0442\u0438|\u0432\u0438|\u0440\u0438|\u043c\u0438)/,
            ordinal: function (e) {
                var a = e % 10,
                    t = e % 100;
                return 0 === e
                    ? e + '-\u0435\u0432'
                    : 0 === t
                    ? e + '-\u0435\u043d'
                    : 10 < t && t < 20
                    ? e + '-\u0442\u0438'
                    : 1 === a
                    ? e + '-\u0432\u0438'
                    : 2 === a
                    ? e + '-\u0440\u0438'
                    : 7 === a || 8 === a
                    ? e + '-\u043c\u0438'
                    : e + '-\u0442\u0438';
            },
            week: { dow: 1, doy: 7 },
        }),
        l.defineLocale('ml', {
            months: '\u0d1c\u0d28\u0d41\u0d35\u0d30\u0d3f_\u0d2b\u0d46\u0d2c\u0d4d\u0d30\u0d41\u0d35\u0d30\u0d3f_\u0d2e\u0d3e\u0d7c\u0d1a\u0d4d\u0d1a\u0d4d_\u0d0f\u0d2a\u0d4d\u0d30\u0d3f\u0d7d_\u0d2e\u0d47\u0d2f\u0d4d_\u0d1c\u0d42\u0d7a_\u0d1c\u0d42\u0d32\u0d48_\u0d13\u0d17\u0d38\u0d4d\u0d31\u0d4d\u0d31\u0d4d_\u0d38\u0d46\u0d2a\u0d4d\u0d31\u0d4d\u0d31\u0d02\u0d2c\u0d7c_\u0d12\u0d15\u0d4d\u0d1f\u0d4b\u0d2c\u0d7c_\u0d28\u0d35\u0d02\u0d2c\u0d7c_\u0d21\u0d3f\u0d38\u0d02\u0d2c\u0d7c'.split(
                '_'
            ),
            monthsShort:
                '\u0d1c\u0d28\u0d41._\u0d2b\u0d46\u0d2c\u0d4d\u0d30\u0d41._\u0d2e\u0d3e\u0d7c._\u0d0f\u0d2a\u0d4d\u0d30\u0d3f._\u0d2e\u0d47\u0d2f\u0d4d_\u0d1c\u0d42\u0d7a_\u0d1c\u0d42\u0d32\u0d48._\u0d13\u0d17._\u0d38\u0d46\u0d2a\u0d4d\u0d31\u0d4d\u0d31._\u0d12\u0d15\u0d4d\u0d1f\u0d4b._\u0d28\u0d35\u0d02._\u0d21\u0d3f\u0d38\u0d02.'.split(
                    '_'
                ),
            monthsParseExact: !0,
            weekdays:
                '\u0d1e\u0d3e\u0d2f\u0d31\u0d3e\u0d34\u0d4d\u0d1a_\u0d24\u0d3f\u0d19\u0d4d\u0d15\u0d33\u0d3e\u0d34\u0d4d\u0d1a_\u0d1a\u0d4a\u0d35\u0d4d\u0d35\u0d3e\u0d34\u0d4d\u0d1a_\u0d2c\u0d41\u0d27\u0d28\u0d3e\u0d34\u0d4d\u0d1a_\u0d35\u0d4d\u0d2f\u0d3e\u0d34\u0d3e\u0d34\u0d4d\u0d1a_\u0d35\u0d46\u0d33\u0d4d\u0d33\u0d3f\u0d2f\u0d3e\u0d34\u0d4d\u0d1a_\u0d36\u0d28\u0d3f\u0d2f\u0d3e\u0d34\u0d4d\u0d1a'.split(
                    '_'
                ),
            weekdaysShort:
                '\u0d1e\u0d3e\u0d2f\u0d7c_\u0d24\u0d3f\u0d19\u0d4d\u0d15\u0d7e_\u0d1a\u0d4a\u0d35\u0d4d\u0d35_\u0d2c\u0d41\u0d27\u0d7b_\u0d35\u0d4d\u0d2f\u0d3e\u0d34\u0d02_\u0d35\u0d46\u0d33\u0d4d\u0d33\u0d3f_\u0d36\u0d28\u0d3f'.split(
                    '_'
                ),
            weekdaysMin:
                '\u0d1e\u0d3e_\u0d24\u0d3f_\u0d1a\u0d4a_\u0d2c\u0d41_\u0d35\u0d4d\u0d2f\u0d3e_\u0d35\u0d46_\u0d36'.split(
                    '_'
                ),
            longDateFormat: {
                LT: 'A h:mm -\u0d28\u0d41',
                LTS: 'A h:mm:ss -\u0d28\u0d41',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY, A h:mm -\u0d28\u0d41',
                LLLL: 'dddd, D MMMM YYYY, A h:mm -\u0d28\u0d41',
            },
            calendar: {
                sameDay: '[\u0d07\u0d28\u0d4d\u0d28\u0d4d] LT',
                nextDay: '[\u0d28\u0d3e\u0d33\u0d46] LT',
                nextWeek: 'dddd, LT',
                lastDay: '[\u0d07\u0d28\u0d4d\u0d28\u0d32\u0d46] LT',
                lastWeek: '[\u0d15\u0d34\u0d3f\u0d1e\u0d4d\u0d1e] dddd, LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: '%s \u0d15\u0d34\u0d3f\u0d1e\u0d4d\u0d1e\u0d4d',
                past: '%s \u0d2e\u0d41\u0d7b\u0d2a\u0d4d',
                s: '\u0d05\u0d7d\u0d2a \u0d28\u0d3f\u0d2e\u0d3f\u0d37\u0d19\u0d4d\u0d19\u0d7e',
                ss: '%d \u0d38\u0d46\u0d15\u0d4d\u0d15\u0d7b\u0d21\u0d4d',
                m: '\u0d12\u0d30\u0d41 \u0d2e\u0d3f\u0d28\u0d3f\u0d31\u0d4d\u0d31\u0d4d',
                mm: '%d \u0d2e\u0d3f\u0d28\u0d3f\u0d31\u0d4d\u0d31\u0d4d',
                h: '\u0d12\u0d30\u0d41 \u0d2e\u0d23\u0d3f\u0d15\u0d4d\u0d15\u0d42\u0d7c',
                hh: '%d \u0d2e\u0d23\u0d3f\u0d15\u0d4d\u0d15\u0d42\u0d7c',
                d: '\u0d12\u0d30\u0d41 \u0d26\u0d3f\u0d35\u0d38\u0d02',
                dd: '%d \u0d26\u0d3f\u0d35\u0d38\u0d02',
                M: '\u0d12\u0d30\u0d41 \u0d2e\u0d3e\u0d38\u0d02',
                MM: '%d \u0d2e\u0d3e\u0d38\u0d02',
                y: '\u0d12\u0d30\u0d41 \u0d35\u0d7c\u0d37\u0d02',
                yy: '%d \u0d35\u0d7c\u0d37\u0d02',
            },
            meridiemParse:
                /\u0d30\u0d3e\u0d24\u0d4d\u0d30\u0d3f|\u0d30\u0d3e\u0d35\u0d3f\u0d32\u0d46|\u0d09\u0d1a\u0d4d\u0d1a \u0d15\u0d34\u0d3f\u0d1e\u0d4d\u0d1e\u0d4d|\u0d35\u0d48\u0d15\u0d41\u0d28\u0d4d\u0d28\u0d47\u0d30\u0d02|\u0d30\u0d3e\u0d24\u0d4d\u0d30\u0d3f/i,
            meridiemHour: function (e, a) {
                return (
                    12 === e && (e = 0),
                    ('\u0d30\u0d3e\u0d24\u0d4d\u0d30\u0d3f' === a && 4 <= e) ||
                    '\u0d09\u0d1a\u0d4d\u0d1a \u0d15\u0d34\u0d3f\u0d1e\u0d4d\u0d1e\u0d4d' ===
                        a ||
                    '\u0d35\u0d48\u0d15\u0d41\u0d28\u0d4d\u0d28\u0d47\u0d30\u0d02' ===
                        a
                        ? e + 12
                        : e
                );
            },
            meridiem: function (e, a, t) {
                return e < 4
                    ? '\u0d30\u0d3e\u0d24\u0d4d\u0d30\u0d3f'
                    : e < 12
                    ? '\u0d30\u0d3e\u0d35\u0d3f\u0d32\u0d46'
                    : e < 17
                    ? '\u0d09\u0d1a\u0d4d\u0d1a \u0d15\u0d34\u0d3f\u0d1e\u0d4d\u0d1e\u0d4d'
                    : e < 20
                    ? '\u0d35\u0d48\u0d15\u0d41\u0d28\u0d4d\u0d28\u0d47\u0d30\u0d02'
                    : '\u0d30\u0d3e\u0d24\u0d4d\u0d30\u0d3f';
            },
        }),
        l.defineLocale('mn', {
            months: '\u041d\u044d\u0433\u0434\u04af\u0433\u044d\u044d\u0440 \u0441\u0430\u0440_\u0425\u043e\u0451\u0440\u0434\u0443\u0433\u0430\u0430\u0440 \u0441\u0430\u0440_\u0413\u0443\u0440\u0430\u0432\u0434\u0443\u0433\u0430\u0430\u0440 \u0441\u0430\u0440_\u0414\u04e9\u0440\u04e9\u0432\u0434\u04af\u0433\u044d\u044d\u0440 \u0441\u0430\u0440_\u0422\u0430\u0432\u0434\u0443\u0433\u0430\u0430\u0440 \u0441\u0430\u0440_\u0417\u0443\u0440\u0433\u0430\u0434\u0443\u0433\u0430\u0430\u0440 \u0441\u0430\u0440_\u0414\u043e\u043b\u0434\u0443\u0433\u0430\u0430\u0440 \u0441\u0430\u0440_\u041d\u0430\u0439\u043c\u0434\u0443\u0433\u0430\u0430\u0440 \u0441\u0430\u0440_\u0415\u0441\u0434\u04af\u0433\u044d\u044d\u0440 \u0441\u0430\u0440_\u0410\u0440\u0430\u0432\u0434\u0443\u0433\u0430\u0430\u0440 \u0441\u0430\u0440_\u0410\u0440\u0432\u0430\u043d \u043d\u044d\u0433\u0434\u04af\u0433\u044d\u044d\u0440 \u0441\u0430\u0440_\u0410\u0440\u0432\u0430\u043d \u0445\u043e\u0451\u0440\u0434\u0443\u0433\u0430\u0430\u0440 \u0441\u0430\u0440'.split(
                '_'
            ),
            monthsShort:
                '1 \u0441\u0430\u0440_2 \u0441\u0430\u0440_3 \u0441\u0430\u0440_4 \u0441\u0430\u0440_5 \u0441\u0430\u0440_6 \u0441\u0430\u0440_7 \u0441\u0430\u0440_8 \u0441\u0430\u0440_9 \u0441\u0430\u0440_10 \u0441\u0430\u0440_11 \u0441\u0430\u0440_12 \u0441\u0430\u0440'.split(
                    '_'
                ),
            monthsParseExact: !0,
            weekdays:
                '\u041d\u044f\u043c_\u0414\u0430\u0432\u0430\u0430_\u041c\u044f\u0433\u043c\u0430\u0440_\u041b\u0445\u0430\u0433\u0432\u0430_\u041f\u04af\u0440\u044d\u0432_\u0411\u0430\u0430\u0441\u0430\u043d_\u0411\u044f\u043c\u0431\u0430'.split(
                    '_'
                ),
            weekdaysShort:
                '\u041d\u044f\u043c_\u0414\u0430\u0432_\u041c\u044f\u0433_\u041b\u0445\u0430_\u041f\u04af\u0440_\u0411\u0430\u0430_\u0411\u044f\u043c'.split(
                    '_'
                ),
            weekdaysMin:
                '\u041d\u044f_\u0414\u0430_\u041c\u044f_\u041b\u0445_\u041f\u04af_\u0411\u0430_\u0411\u044f'.split(
                    '_'
                ),
            weekdaysParseExact: !0,
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'YYYY-MM-DD',
                LL: 'YYYY \u043e\u043d\u044b MMMM\u044b\u043d D',
                LLL: 'YYYY \u043e\u043d\u044b MMMM\u044b\u043d D HH:mm',
                LLLL: 'dddd, YYYY \u043e\u043d\u044b MMMM\u044b\u043d D HH:mm',
            },
            meridiemParse: /\u04ae\u04e8|\u04ae\u0425/i,
            isPM: function (e) {
                return '\u04ae\u0425' === e;
            },
            meridiem: function (e, a, t) {
                return e < 12 ? '\u04ae\u04e8' : '\u04ae\u0425';
            },
            calendar: {
                sameDay: '[\u04e8\u043d\u04e9\u04e9\u0434\u04e9\u0440] LT',
                nextDay: '[\u041c\u0430\u0440\u0433\u0430\u0430\u0448] LT',
                nextWeek: '[\u0418\u0440\u044d\u0445] dddd LT',
                lastDay: '[\u04e8\u0447\u0438\u0433\u0434\u04e9\u0440] LT',
                lastWeek:
                    '[\u04e8\u043d\u0433\u04e9\u0440\u0441\u04e9\u043d] dddd LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: '%s \u0434\u0430\u0440\u0430\u0430',
                past: '%s \u04e9\u043c\u043d\u04e9',
                s: wn,
                ss: wn,
                m: wn,
                mm: wn,
                h: wn,
                hh: wn,
                d: wn,
                dd: wn,
                M: wn,
                MM: wn,
                y: wn,
                yy: wn,
            },
            dayOfMonthOrdinalParse: /\d{1,2} \u04e9\u0434\u04e9\u0440/,
            ordinal: function (e, a) {
                switch (a) {
                    case 'd':
                    case 'D':
                    case 'DDD':
                        return e + ' \u04e9\u0434\u04e9\u0440';
                    default:
                        return e;
                }
            },
        });
    var vn = {
            1: '\u0967',
            2: '\u0968',
            3: '\u0969',
            4: '\u096a',
            5: '\u096b',
            6: '\u096c',
            7: '\u096d',
            8: '\u096e',
            9: '\u096f',
            0: '\u0966',
        },
        Sn = {
            '\u0967': '1',
            '\u0968': '2',
            '\u0969': '3',
            '\u096a': '4',
            '\u096b': '5',
            '\u096c': '6',
            '\u096d': '7',
            '\u096e': '8',
            '\u096f': '9',
            '\u0966': '0',
        };
    function Hn(e, a, t, s) {
        var n = '';
        if (a)
            switch (t) {
                case 's':
                    n =
                        '\u0915\u093e\u0939\u0940 \u0938\u0947\u0915\u0902\u0926';
                    break;
                case 'ss':
                    n = '%d \u0938\u0947\u0915\u0902\u0926';
                    break;
                case 'm':
                    n = '\u090f\u0915 \u092e\u093f\u0928\u093f\u091f';
                    break;
                case 'mm':
                    n = '%d \u092e\u093f\u0928\u093f\u091f\u0947';
                    break;
                case 'h':
                    n = '\u090f\u0915 \u0924\u093e\u0938';
                    break;
                case 'hh':
                    n = '%d \u0924\u093e\u0938';
                    break;
                case 'd':
                    n = '\u090f\u0915 \u0926\u093f\u0935\u0938';
                    break;
                case 'dd':
                    n = '%d \u0926\u093f\u0935\u0938';
                    break;
                case 'M':
                    n = '\u090f\u0915 \u092e\u0939\u093f\u0928\u093e';
                    break;
                case 'MM':
                    n = '%d \u092e\u0939\u093f\u0928\u0947';
                    break;
                case 'y':
                    n = '\u090f\u0915 \u0935\u0930\u094d\u0937';
                    break;
                case 'yy':
                    n = '%d \u0935\u0930\u094d\u0937\u0947';
                    break;
            }
        else
            switch (t) {
                case 's':
                    n =
                        '\u0915\u093e\u0939\u0940 \u0938\u0947\u0915\u0902\u0926\u093e\u0902';
                    break;
                case 'ss':
                    n = '%d \u0938\u0947\u0915\u0902\u0926\u093e\u0902';
                    break;
                case 'm':
                    n =
                        '\u090f\u0915\u093e \u092e\u093f\u0928\u093f\u091f\u093e';
                    break;
                case 'mm':
                    n = '%d \u092e\u093f\u0928\u093f\u091f\u093e\u0902';
                    break;
                case 'h':
                    n = '\u090f\u0915\u093e \u0924\u093e\u0938\u093e';
                    break;
                case 'hh':
                    n = '%d \u0924\u093e\u0938\u093e\u0902';
                    break;
                case 'd':
                    n = '\u090f\u0915\u093e \u0926\u093f\u0935\u0938\u093e';
                    break;
                case 'dd':
                    n = '%d \u0926\u093f\u0935\u0938\u093e\u0902';
                    break;
                case 'M':
                    n =
                        '\u090f\u0915\u093e \u092e\u0939\u093f\u0928\u094d\u092f\u093e';
                    break;
                case 'MM':
                    n = '%d \u092e\u0939\u093f\u0928\u094d\u092f\u093e\u0902';
                    break;
                case 'y':
                    n = '\u090f\u0915\u093e \u0935\u0930\u094d\u0937\u093e';
                    break;
                case 'yy':
                    n = '%d \u0935\u0930\u094d\u0937\u093e\u0902';
                    break;
            }
        return n.replace(/%d/i, e);
    }
    l.defineLocale('mr', {
        months: '\u091c\u093e\u0928\u0947\u0935\u093e\u0930\u0940_\u092b\u0947\u092c\u094d\u0930\u0941\u0935\u093e\u0930\u0940_\u092e\u093e\u0930\u094d\u091a_\u090f\u092a\u094d\u0930\u093f\u0932_\u092e\u0947_\u091c\u0942\u0928_\u091c\u0941\u0932\u0948_\u0911\u0917\u0938\u094d\u091f_\u0938\u092a\u094d\u091f\u0947\u0902\u092c\u0930_\u0911\u0915\u094d\u091f\u094b\u092c\u0930_\u0928\u094b\u0935\u094d\u0939\u0947\u0902\u092c\u0930_\u0921\u093f\u0938\u0947\u0902\u092c\u0930'.split(
            '_'
        ),
        monthsShort:
            '\u091c\u093e\u0928\u0947._\u092b\u0947\u092c\u094d\u0930\u0941._\u092e\u093e\u0930\u094d\u091a._\u090f\u092a\u094d\u0930\u093f._\u092e\u0947._\u091c\u0942\u0928._\u091c\u0941\u0932\u0948._\u0911\u0917._\u0938\u092a\u094d\u091f\u0947\u0902._\u0911\u0915\u094d\u091f\u094b._\u0928\u094b\u0935\u094d\u0939\u0947\u0902._\u0921\u093f\u0938\u0947\u0902.'.split(
                '_'
            ),
        monthsParseExact: !0,
        weekdays:
            '\u0930\u0935\u093f\u0935\u093e\u0930_\u0938\u094b\u092e\u0935\u093e\u0930_\u092e\u0902\u0917\u0933\u0935\u093e\u0930_\u092c\u0941\u0927\u0935\u093e\u0930_\u0917\u0941\u0930\u0942\u0935\u093e\u0930_\u0936\u0941\u0915\u094d\u0930\u0935\u093e\u0930_\u0936\u0928\u093f\u0935\u093e\u0930'.split(
                '_'
            ),
        weekdaysShort:
            '\u0930\u0935\u093f_\u0938\u094b\u092e_\u092e\u0902\u0917\u0933_\u092c\u0941\u0927_\u0917\u0941\u0930\u0942_\u0936\u0941\u0915\u094d\u0930_\u0936\u0928\u093f'.split(
                '_'
            ),
        weekdaysMin:
            '\u0930_\u0938\u094b_\u092e\u0902_\u092c\u0941_\u0917\u0941_\u0936\u0941_\u0936'.split(
                '_'
            ),
        longDateFormat: {
            LT: 'A h:mm \u0935\u093e\u091c\u0924\u093e',
            LTS: 'A h:mm:ss \u0935\u093e\u091c\u0924\u093e',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY, A h:mm \u0935\u093e\u091c\u0924\u093e',
            LLLL: 'dddd, D MMMM YYYY, A h:mm \u0935\u093e\u091c\u0924\u093e',
        },
        calendar: {
            sameDay: '[\u0906\u091c] LT',
            nextDay: '[\u0909\u0926\u094d\u092f\u093e] LT',
            nextWeek: 'dddd, LT',
            lastDay: '[\u0915\u093e\u0932] LT',
            lastWeek: '[\u092e\u093e\u0917\u0940\u0932] dddd, LT',
            sameElse: 'L',
        },
        relativeTime: {
            future: '%s\u092e\u0927\u094d\u092f\u0947',
            past: '%s\u092a\u0942\u0930\u094d\u0935\u0940',
            s: Hn,
            ss: Hn,
            m: Hn,
            mm: Hn,
            h: Hn,
            hh: Hn,
            d: Hn,
            dd: Hn,
            M: Hn,
            MM: Hn,
            y: Hn,
            yy: Hn,
        },
        preparse: function (e) {
            return e.replace(
                /[\u0967\u0968\u0969\u096a\u096b\u096c\u096d\u096e\u096f\u0966]/g,
                function (e) {
                    return Sn[e];
                }
            );
        },
        postformat: function (e) {
            return e.replace(/\d/g, function (e) {
                return vn[e];
            });
        },
        meridiemParse:
            /\u0930\u093e\u0924\u094d\u0930\u0940|\u0938\u0915\u093e\u0933\u0940|\u0926\u0941\u092a\u093e\u0930\u0940|\u0938\u093e\u092f\u0902\u0915\u093e\u0933\u0940/,
        meridiemHour: function (e, a) {
            return (
                12 === e && (e = 0),
                '\u0930\u093e\u0924\u094d\u0930\u0940' === a
                    ? e < 4
                        ? e
                        : e + 12
                    : '\u0938\u0915\u093e\u0933\u0940' === a
                    ? e
                    : '\u0926\u0941\u092a\u093e\u0930\u0940' === a
                    ? 10 <= e
                        ? e
                        : e + 12
                    : '\u0938\u093e\u092f\u0902\u0915\u093e\u0933\u0940' === a
                    ? e + 12
                    : void 0
            );
        },
        meridiem: function (e, a, t) {
            return e < 4
                ? '\u0930\u093e\u0924\u094d\u0930\u0940'
                : e < 10
                ? '\u0938\u0915\u093e\u0933\u0940'
                : e < 17
                ? '\u0926\u0941\u092a\u093e\u0930\u0940'
                : e < 20
                ? '\u0938\u093e\u092f\u0902\u0915\u093e\u0933\u0940'
                : '\u0930\u093e\u0924\u094d\u0930\u0940';
        },
        week: { dow: 0, doy: 6 },
    }),
        l.defineLocale('ms-my', {
            months: 'Januari_Februari_Mac_April_Mei_Jun_Julai_Ogos_September_Oktober_November_Disember'.split(
                '_'
            ),
            monthsShort:
                'Jan_Feb_Mac_Apr_Mei_Jun_Jul_Ogs_Sep_Okt_Nov_Dis'.split('_'),
            weekdays: 'Ahad_Isnin_Selasa_Rabu_Khamis_Jumaat_Sabtu'.split('_'),
            weekdaysShort: 'Ahd_Isn_Sel_Rab_Kha_Jum_Sab'.split('_'),
            weekdaysMin: 'Ah_Is_Sl_Rb_Km_Jm_Sb'.split('_'),
            longDateFormat: {
                LT: 'HH.mm',
                LTS: 'HH.mm.ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY [pukul] HH.mm',
                LLLL: 'dddd, D MMMM YYYY [pukul] HH.mm',
            },
            meridiemParse: /pagi|tengahari|petang|malam/,
            meridiemHour: function (e, a) {
                return (
                    12 === e && (e = 0),
                    'pagi' === a
                        ? e
                        : 'tengahari' === a
                        ? 11 <= e
                            ? e
                            : e + 12
                        : 'petang' === a || 'malam' === a
                        ? e + 12
                        : void 0
                );
            },
            meridiem: function (e, a, t) {
                return e < 11
                    ? 'pagi'
                    : e < 15
                    ? 'tengahari'
                    : e < 19
                    ? 'petang'
                    : 'malam';
            },
            calendar: {
                sameDay: '[Hari ini pukul] LT',
                nextDay: '[Esok pukul] LT',
                nextWeek: 'dddd [pukul] LT',
                lastDay: '[Kelmarin pukul] LT',
                lastWeek: 'dddd [lepas pukul] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: 'dalam %s',
                past: '%s yang lepas',
                s: 'beberapa saat',
                ss: '%d saat',
                m: 'seminit',
                mm: '%d minit',
                h: 'sejam',
                hh: '%d jam',
                d: 'sehari',
                dd: '%d hari',
                M: 'sebulan',
                MM: '%d bulan',
                y: 'setahun',
                yy: '%d tahun',
            },
            week: { dow: 1, doy: 7 },
        }),
        l.defineLocale('ms', {
            months: 'Januari_Februari_Mac_April_Mei_Jun_Julai_Ogos_September_Oktober_November_Disember'.split(
                '_'
            ),
            monthsShort:
                'Jan_Feb_Mac_Apr_Mei_Jun_Jul_Ogs_Sep_Okt_Nov_Dis'.split('_'),
            weekdays: 'Ahad_Isnin_Selasa_Rabu_Khamis_Jumaat_Sabtu'.split('_'),
            weekdaysShort: 'Ahd_Isn_Sel_Rab_Kha_Jum_Sab'.split('_'),
            weekdaysMin: 'Ah_Is_Sl_Rb_Km_Jm_Sb'.split('_'),
            longDateFormat: {
                LT: 'HH.mm',
                LTS: 'HH.mm.ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY [pukul] HH.mm',
                LLLL: 'dddd, D MMMM YYYY [pukul] HH.mm',
            },
            meridiemParse: /pagi|tengahari|petang|malam/,
            meridiemHour: function (e, a) {
                return (
                    12 === e && (e = 0),
                    'pagi' === a
                        ? e
                        : 'tengahari' === a
                        ? 11 <= e
                            ? e
                            : e + 12
                        : 'petang' === a || 'malam' === a
                        ? e + 12
                        : void 0
                );
            },
            meridiem: function (e, a, t) {
                return e < 11
                    ? 'pagi'
                    : e < 15
                    ? 'tengahari'
                    : e < 19
                    ? 'petang'
                    : 'malam';
            },
            calendar: {
                sameDay: '[Hari ini pukul] LT',
                nextDay: '[Esok pukul] LT',
                nextWeek: 'dddd [pukul] LT',
                lastDay: '[Kelmarin pukul] LT',
                lastWeek: 'dddd [lepas pukul] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: 'dalam %s',
                past: '%s yang lepas',
                s: 'beberapa saat',
                ss: '%d saat',
                m: 'seminit',
                mm: '%d minit',
                h: 'sejam',
                hh: '%d jam',
                d: 'sehari',
                dd: '%d hari',
                M: 'sebulan',
                MM: '%d bulan',
                y: 'setahun',
                yy: '%d tahun',
            },
            week: { dow: 1, doy: 7 },
        }),
        l.defineLocale('mt', {
            months: 'Jannar_Frar_Marzu_April_Mejju_\u0120unju_Lulju_Awwissu_Settembru_Ottubru_Novembru_Di\u010bembru'.split(
                '_'
            ),
            monthsShort:
                'Jan_Fra_Mar_Apr_Mej_\u0120un_Lul_Aww_Set_Ott_Nov_Di\u010b'.split(
                    '_'
                ),
            weekdays:
                'Il-\u0126add_It-Tnejn_It-Tlieta_L-Erbg\u0127a_Il-\u0126amis_Il-\u0120img\u0127a_Is-Sibt'.split(
                    '_'
                ),
            weekdaysShort: '\u0126ad_Tne_Tli_Erb_\u0126am_\u0120im_Sib'.split(
                '_'
            ),
            weekdaysMin: '\u0126a_Tn_Tl_Er_\u0126a_\u0120i_Si'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd, D MMMM YYYY HH:mm',
            },
            calendar: {
                sameDay: '[Illum fil-]LT',
                nextDay: '[G\u0127ada fil-]LT',
                nextWeek: 'dddd [fil-]LT',
                lastDay: '[Il-biera\u0127 fil-]LT',
                lastWeek: 'dddd [li g\u0127adda] [fil-]LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: 'f\u2019 %s',
                past: '%s ilu',
                s: 'ftit sekondi',
                ss: '%d sekondi',
                m: 'minuta',
                mm: '%d minuti',
                h: 'sieg\u0127a',
                hh: '%d sieg\u0127at',
                d: '\u0121urnata',
                dd: '%d \u0121ranet',
                M: 'xahar',
                MM: '%d xhur',
                y: 'sena',
                yy: '%d sni',
            },
            dayOfMonthOrdinalParse: /\d{1,2}\xba/,
            ordinal: '%d\xba',
            week: { dow: 1, doy: 4 },
        });
    var bn = {
            1: '\u1041',
            2: '\u1042',
            3: '\u1043',
            4: '\u1044',
            5: '\u1045',
            6: '\u1046',
            7: '\u1047',
            8: '\u1048',
            9: '\u1049',
            0: '\u1040',
        },
        jn = {
            '\u1041': '1',
            '\u1042': '2',
            '\u1043': '3',
            '\u1044': '4',
            '\u1045': '5',
            '\u1046': '6',
            '\u1047': '7',
            '\u1048': '8',
            '\u1049': '9',
            '\u1040': '0',
        };
    l.defineLocale('my', {
        months: '\u1007\u1014\u103a\u1014\u101d\u102b\u101b\u102e_\u1016\u1031\u1016\u1031\u102c\u103a\u101d\u102b\u101b\u102e_\u1019\u1010\u103a_\u1027\u1015\u103c\u102e_\u1019\u1031_\u1007\u103d\u1014\u103a_\u1007\u1030\u101c\u102d\u102f\u1004\u103a_\u101e\u103c\u1002\u102f\u1010\u103a_\u1005\u1000\u103a\u1010\u1004\u103a\u1018\u102c_\u1021\u1031\u102c\u1000\u103a\u1010\u102d\u102f\u1018\u102c_\u1014\u102d\u102f\u101d\u1004\u103a\u1018\u102c_\u1012\u102e\u1007\u1004\u103a\u1018\u102c'.split(
            '_'
        ),
        monthsShort:
            '\u1007\u1014\u103a_\u1016\u1031_\u1019\u1010\u103a_\u1015\u103c\u102e_\u1019\u1031_\u1007\u103d\u1014\u103a_\u101c\u102d\u102f\u1004\u103a_\u101e\u103c_\u1005\u1000\u103a_\u1021\u1031\u102c\u1000\u103a_\u1014\u102d\u102f_\u1012\u102e'.split(
                '_'
            ),
        weekdays:
            '\u1010\u1014\u1004\u103a\u1039\u1002\u1014\u103d\u1031_\u1010\u1014\u1004\u103a\u1039\u101c\u102c_\u1021\u1004\u103a\u1039\u1002\u102b_\u1017\u102f\u1012\u1039\u1013\u101f\u1030\u1038_\u1000\u103c\u102c\u101e\u1015\u1010\u1031\u1038_\u101e\u1031\u102c\u1000\u103c\u102c_\u1005\u1014\u1031'.split(
                '_'
            ),
        weekdaysShort:
            '\u1014\u103d\u1031_\u101c\u102c_\u1002\u102b_\u101f\u1030\u1038_\u1000\u103c\u102c_\u101e\u1031\u102c_\u1014\u1031'.split(
                '_'
            ),
        weekdaysMin:
            '\u1014\u103d\u1031_\u101c\u102c_\u1002\u102b_\u101f\u1030\u1038_\u1000\u103c\u102c_\u101e\u1031\u102c_\u1014\u1031'.split(
                '_'
            ),
        longDateFormat: {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY HH:mm',
            LLLL: 'dddd D MMMM YYYY HH:mm',
        },
        calendar: {
            sameDay: '[\u101a\u1014\u1031.] LT [\u1019\u103e\u102c]',
            nextDay:
                '[\u1019\u1014\u1000\u103a\u1016\u103c\u1014\u103a] LT [\u1019\u103e\u102c]',
            nextWeek: 'dddd LT [\u1019\u103e\u102c]',
            lastDay: '[\u1019\u1014\u1031.\u1000] LT [\u1019\u103e\u102c]',
            lastWeek:
                '[\u1015\u103c\u102e\u1038\u1001\u1032\u1037\u101e\u1031\u102c] dddd LT [\u1019\u103e\u102c]',
            sameElse: 'L',
        },
        relativeTime: {
            future: '\u101c\u102c\u1019\u100a\u103a\u1037 %s \u1019\u103e\u102c',
            past: '\u101c\u103d\u1014\u103a\u1001\u1032\u1037\u101e\u1031\u102c %s \u1000',
            s: '\u1005\u1000\u1039\u1000\u1014\u103a.\u1021\u1014\u100a\u103a\u1038\u1004\u101a\u103a',
            ss: '%d \u1005\u1000\u1039\u1000\u1014\u1037\u103a',
            m: '\u1010\u1005\u103a\u1019\u102d\u1014\u1005\u103a',
            mm: '%d \u1019\u102d\u1014\u1005\u103a',
            h: '\u1010\u1005\u103a\u1014\u102c\u101b\u102e',
            hh: '%d \u1014\u102c\u101b\u102e',
            d: '\u1010\u1005\u103a\u101b\u1000\u103a',
            dd: '%d \u101b\u1000\u103a',
            M: '\u1010\u1005\u103a\u101c',
            MM: '%d \u101c',
            y: '\u1010\u1005\u103a\u1014\u103e\u1005\u103a',
            yy: '%d \u1014\u103e\u1005\u103a',
        },
        preparse: function (e) {
            return e.replace(
                /[\u1041\u1042\u1043\u1044\u1045\u1046\u1047\u1048\u1049\u1040]/g,
                function (e) {
                    return jn[e];
                }
            );
        },
        postformat: function (e) {
            return e.replace(/\d/g, function (e) {
                return bn[e];
            });
        },
        week: { dow: 1, doy: 4 },
    }),
        l.defineLocale('nb', {
            months: 'januar_februar_mars_april_mai_juni_juli_august_september_oktober_november_desember'.split(
                '_'
            ),
            monthsShort:
                'jan._feb._mars_april_mai_juni_juli_aug._sep._okt._nov._des.'.split(
                    '_'
                ),
            monthsParseExact: !0,
            weekdays:
                's\xf8ndag_mandag_tirsdag_onsdag_torsdag_fredag_l\xf8rdag'.split(
                    '_'
                ),
            weekdaysShort: 's\xf8._ma._ti._on._to._fr._l\xf8.'.split('_'),
            weekdaysMin: 's\xf8_ma_ti_on_to_fr_l\xf8'.split('_'),
            weekdaysParseExact: !0,
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD.MM.YYYY',
                LL: 'D. MMMM YYYY',
                LLL: 'D. MMMM YYYY [kl.] HH:mm',
                LLLL: 'dddd D. MMMM YYYY [kl.] HH:mm',
            },
            calendar: {
                sameDay: '[i dag kl.] LT',
                nextDay: '[i morgen kl.] LT',
                nextWeek: 'dddd [kl.] LT',
                lastDay: '[i g\xe5r kl.] LT',
                lastWeek: '[forrige] dddd [kl.] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: 'om %s',
                past: '%s siden',
                s: 'noen sekunder',
                ss: '%d sekunder',
                m: 'ett minutt',
                mm: '%d minutter',
                h: 'en time',
                hh: '%d timer',
                d: 'en dag',
                dd: '%d dager',
                M: 'en m\xe5ned',
                MM: '%d m\xe5neder',
                y: 'ett \xe5r',
                yy: '%d \xe5r',
            },
            dayOfMonthOrdinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: { dow: 1, doy: 4 },
        });
    var xn = {
            1: '\u0967',
            2: '\u0968',
            3: '\u0969',
            4: '\u096a',
            5: '\u096b',
            6: '\u096c',
            7: '\u096d',
            8: '\u096e',
            9: '\u096f',
            0: '\u0966',
        },
        On = {
            '\u0967': '1',
            '\u0968': '2',
            '\u0969': '3',
            '\u096a': '4',
            '\u096b': '5',
            '\u096c': '6',
            '\u096d': '7',
            '\u096e': '8',
            '\u096f': '9',
            '\u0966': '0',
        };
    l.defineLocale('ne', {
        months: '\u091c\u0928\u0935\u0930\u0940_\u092b\u0947\u092c\u094d\u0930\u0941\u0935\u0930\u0940_\u092e\u093e\u0930\u094d\u091a_\u0905\u092a\u094d\u0930\u093f\u0932_\u092e\u0908_\u091c\u0941\u0928_\u091c\u0941\u0932\u093e\u0908_\u0905\u0917\u0937\u094d\u091f_\u0938\u0947\u092a\u094d\u091f\u0947\u092e\u094d\u092c\u0930_\u0905\u0915\u094d\u091f\u094b\u092c\u0930_\u0928\u094b\u092d\u0947\u092e\u094d\u092c\u0930_\u0921\u093f\u0938\u0947\u092e\u094d\u092c\u0930'.split(
            '_'
        ),
        monthsShort:
            '\u091c\u0928._\u092b\u0947\u092c\u094d\u0930\u0941._\u092e\u093e\u0930\u094d\u091a_\u0905\u092a\u094d\u0930\u093f._\u092e\u0908_\u091c\u0941\u0928_\u091c\u0941\u0932\u093e\u0908._\u0905\u0917._\u0938\u0947\u092a\u094d\u091f._\u0905\u0915\u094d\u091f\u094b._\u0928\u094b\u092d\u0947._\u0921\u093f\u0938\u0947.'.split(
                '_'
            ),
        monthsParseExact: !0,
        weekdays:
            '\u0906\u0907\u0924\u092c\u093e\u0930_\u0938\u094b\u092e\u092c\u093e\u0930_\u092e\u0919\u094d\u0917\u0932\u092c\u093e\u0930_\u092c\u0941\u0927\u092c\u093e\u0930_\u092c\u093f\u0939\u093f\u092c\u093e\u0930_\u0936\u0941\u0915\u094d\u0930\u092c\u093e\u0930_\u0936\u0928\u093f\u092c\u093e\u0930'.split(
                '_'
            ),
        weekdaysShort:
            '\u0906\u0907\u0924._\u0938\u094b\u092e._\u092e\u0919\u094d\u0917\u0932._\u092c\u0941\u0927._\u092c\u093f\u0939\u093f._\u0936\u0941\u0915\u094d\u0930._\u0936\u0928\u093f.'.split(
                '_'
            ),
        weekdaysMin:
            '\u0906._\u0938\u094b._\u092e\u0902._\u092c\u0941._\u092c\u093f._\u0936\u0941._\u0936.'.split(
                '_'
            ),
        weekdaysParseExact: !0,
        longDateFormat: {
            LT: 'A\u0915\u094b h:mm \u092c\u091c\u0947',
            LTS: 'A\u0915\u094b h:mm:ss \u092c\u091c\u0947',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY, A\u0915\u094b h:mm \u092c\u091c\u0947',
            LLLL: 'dddd, D MMMM YYYY, A\u0915\u094b h:mm \u092c\u091c\u0947',
        },
        preparse: function (e) {
            return e.replace(
                /[\u0967\u0968\u0969\u096a\u096b\u096c\u096d\u096e\u096f\u0966]/g,
                function (e) {
                    return On[e];
                }
            );
        },
        postformat: function (e) {
            return e.replace(/\d/g, function (e) {
                return xn[e];
            });
        },
        meridiemParse:
            /\u0930\u093e\u0924\u093f|\u092c\u093f\u0939\u093e\u0928|\u0926\u093f\u0909\u0901\u0938\u094b|\u0938\u093e\u0901\u091d/,
        meridiemHour: function (e, a) {
            return (
                12 === e && (e = 0),
                '\u0930\u093e\u0924\u093f' === a
                    ? e < 4
                        ? e
                        : e + 12
                    : '\u092c\u093f\u0939\u093e\u0928' === a
                    ? e
                    : '\u0926\u093f\u0909\u0901\u0938\u094b' === a
                    ? 10 <= e
                        ? e
                        : e + 12
                    : '\u0938\u093e\u0901\u091d' === a
                    ? e + 12
                    : void 0
            );
        },
        meridiem: function (e, a, t) {
            return e < 3
                ? '\u0930\u093e\u0924\u093f'
                : e < 12
                ? '\u092c\u093f\u0939\u093e\u0928'
                : e < 16
                ? '\u0926\u093f\u0909\u0901\u0938\u094b'
                : e < 20
                ? '\u0938\u093e\u0901\u091d'
                : '\u0930\u093e\u0924\u093f';
        },
        calendar: {
            sameDay: '[\u0906\u091c] LT',
            nextDay: '[\u092d\u094b\u0932\u093f] LT',
            nextWeek: '[\u0906\u0909\u0901\u0926\u094b] dddd[,] LT',
            lastDay: '[\u0939\u093f\u091c\u094b] LT',
            lastWeek: '[\u0917\u090f\u0915\u094b] dddd[,] LT',
            sameElse: 'L',
        },
        relativeTime: {
            future: '%s\u092e\u093e',
            past: '%s \u0905\u0917\u093e\u0921\u093f',
            s: '\u0915\u0947\u0939\u0940 \u0915\u094d\u0937\u0923',
            ss: '%d \u0938\u0947\u0915\u0947\u0923\u094d\u0921',
            m: '\u090f\u0915 \u092e\u093f\u0928\u0947\u091f',
            mm: '%d \u092e\u093f\u0928\u0947\u091f',
            h: '\u090f\u0915 \u0918\u0923\u094d\u091f\u093e',
            hh: '%d \u0918\u0923\u094d\u091f\u093e',
            d: '\u090f\u0915 \u0926\u093f\u0928',
            dd: '%d \u0926\u093f\u0928',
            M: '\u090f\u0915 \u092e\u0939\u093f\u0928\u093e',
            MM: '%d \u092e\u0939\u093f\u0928\u093e',
            y: '\u090f\u0915 \u092c\u0930\u094d\u0937',
            yy: '%d \u092c\u0930\u094d\u0937',
        },
        week: { dow: 0, doy: 6 },
    });
    var Pn = 'jan._feb._mrt._apr._mei_jun._jul._aug._sep._okt._nov._dec.'.split(
            '_'
        ),
        Wn = 'jan_feb_mrt_apr_mei_jun_jul_aug_sep_okt_nov_dec'.split('_'),
        An = [
            /^jan/i,
            /^feb/i,
            /^maart|mrt.?$/i,
            /^apr/i,
            /^mei$/i,
            /^jun[i.]?$/i,
            /^jul[i.]?$/i,
            /^aug/i,
            /^sep/i,
            /^okt/i,
            /^nov/i,
            /^dec/i,
        ],
        En =
            /^(januari|februari|maart|april|mei|ju[nl]i|augustus|september|oktober|november|december|jan\.?|feb\.?|mrt\.?|apr\.?|ju[nl]\.?|aug\.?|sep\.?|okt\.?|nov\.?|dec\.?)/i;
    l.defineLocale('nl-be', {
        months: 'januari_februari_maart_april_mei_juni_juli_augustus_september_oktober_november_december'.split(
            '_'
        ),
        monthsShort: function (e, a) {
            return e ? (/-MMM-/.test(a) ? Wn[e.month()] : Pn[e.month()]) : Pn;
        },
        monthsRegex: En,
        monthsShortRegex: En,
        monthsStrictRegex:
            /^(januari|februari|maart|april|mei|ju[nl]i|augustus|september|oktober|november|december)/i,
        monthsShortStrictRegex:
            /^(jan\.?|feb\.?|mrt\.?|apr\.?|mei|ju[nl]\.?|aug\.?|sep\.?|okt\.?|nov\.?|dec\.?)/i,
        monthsParse: An,
        longMonthsParse: An,
        shortMonthsParse: An,
        weekdays:
            'zondag_maandag_dinsdag_woensdag_donderdag_vrijdag_zaterdag'.split(
                '_'
            ),
        weekdaysShort: 'zo._ma._di._wo._do._vr._za.'.split('_'),
        weekdaysMin: 'zo_ma_di_wo_do_vr_za'.split('_'),
        weekdaysParseExact: !0,
        longDateFormat: {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY HH:mm',
            LLLL: 'dddd D MMMM YYYY HH:mm',
        },
        calendar: {
            sameDay: '[vandaag om] LT',
            nextDay: '[morgen om] LT',
            nextWeek: 'dddd [om] LT',
            lastDay: '[gisteren om] LT',
            lastWeek: '[afgelopen] dddd [om] LT',
            sameElse: 'L',
        },
        relativeTime: {
            future: 'over %s',
            past: '%s geleden',
            s: 'een paar seconden',
            ss: '%d seconden',
            m: '\xe9\xe9n minuut',
            mm: '%d minuten',
            h: '\xe9\xe9n uur',
            hh: '%d uur',
            d: '\xe9\xe9n dag',
            dd: '%d dagen',
            M: '\xe9\xe9n maand',
            MM: '%d maanden',
            y: '\xe9\xe9n jaar',
            yy: '%d jaar',
        },
        dayOfMonthOrdinalParse: /\d{1,2}(ste|de)/,
        ordinal: function (e) {
            return e + (1 === e || 8 === e || 20 <= e ? 'ste' : 'de');
        },
        week: { dow: 1, doy: 4 },
    });
    var Fn = 'jan._feb._mrt._apr._mei_jun._jul._aug._sep._okt._nov._dec.'.split(
            '_'
        ),
        zn = 'jan_feb_mrt_apr_mei_jun_jul_aug_sep_okt_nov_dec'.split('_'),
        Jn = [
            /^jan/i,
            /^feb/i,
            /^maart|mrt.?$/i,
            /^apr/i,
            /^mei$/i,
            /^jun[i.]?$/i,
            /^jul[i.]?$/i,
            /^aug/i,
            /^sep/i,
            /^okt/i,
            /^nov/i,
            /^dec/i,
        ],
        Nn =
            /^(januari|februari|maart|april|mei|ju[nl]i|augustus|september|oktober|november|december|jan\.?|feb\.?|mrt\.?|apr\.?|ju[nl]\.?|aug\.?|sep\.?|okt\.?|nov\.?|dec\.?)/i;
    l.defineLocale('nl', {
        months: 'januari_februari_maart_april_mei_juni_juli_augustus_september_oktober_november_december'.split(
            '_'
        ),
        monthsShort: function (e, a) {
            return e ? (/-MMM-/.test(a) ? zn[e.month()] : Fn[e.month()]) : Fn;
        },
        monthsRegex: Nn,
        monthsShortRegex: Nn,
        monthsStrictRegex:
            /^(januari|februari|maart|april|mei|ju[nl]i|augustus|september|oktober|november|december)/i,
        monthsShortStrictRegex:
            /^(jan\.?|feb\.?|mrt\.?|apr\.?|mei|ju[nl]\.?|aug\.?|sep\.?|okt\.?|nov\.?|dec\.?)/i,
        monthsParse: Jn,
        longMonthsParse: Jn,
        shortMonthsParse: Jn,
        weekdays:
            'zondag_maandag_dinsdag_woensdag_donderdag_vrijdag_zaterdag'.split(
                '_'
            ),
        weekdaysShort: 'zo._ma._di._wo._do._vr._za.'.split('_'),
        weekdaysMin: 'zo_ma_di_wo_do_vr_za'.split('_'),
        weekdaysParseExact: !0,
        longDateFormat: {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L: 'DD-MM-YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY HH:mm',
            LLLL: 'dddd D MMMM YYYY HH:mm',
        },
        calendar: {
            sameDay: '[vandaag om] LT',
            nextDay: '[morgen om] LT',
            nextWeek: 'dddd [om] LT',
            lastDay: '[gisteren om] LT',
            lastWeek: '[afgelopen] dddd [om] LT',
            sameElse: 'L',
        },
        relativeTime: {
            future: 'over %s',
            past: '%s geleden',
            s: 'een paar seconden',
            ss: '%d seconden',
            m: '\xe9\xe9n minuut',
            mm: '%d minuten',
            h: '\xe9\xe9n uur',
            hh: '%d uur',
            d: '\xe9\xe9n dag',
            dd: '%d dagen',
            M: '\xe9\xe9n maand',
            MM: '%d maanden',
            y: '\xe9\xe9n jaar',
            yy: '%d jaar',
        },
        dayOfMonthOrdinalParse: /\d{1,2}(ste|de)/,
        ordinal: function (e) {
            return e + (1 === e || 8 === e || 20 <= e ? 'ste' : 'de');
        },
        week: { dow: 1, doy: 4 },
    }),
        l.defineLocale('nn', {
            months: 'januar_februar_mars_april_mai_juni_juli_august_september_oktober_november_desember'.split(
                '_'
            ),
            monthsShort:
                'jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_'),
            weekdays:
                'sundag_m\xe5ndag_tysdag_onsdag_torsdag_fredag_laurdag'.split(
                    '_'
                ),
            weekdaysShort: 'sun_m\xe5n_tys_ons_tor_fre_lau'.split('_'),
            weekdaysMin: 'su_m\xe5_ty_on_to_fr_l\xf8'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD.MM.YYYY',
                LL: 'D. MMMM YYYY',
                LLL: 'D. MMMM YYYY [kl.] H:mm',
                LLLL: 'dddd D. MMMM YYYY [kl.] HH:mm',
            },
            calendar: {
                sameDay: '[I dag klokka] LT',
                nextDay: '[I morgon klokka] LT',
                nextWeek: 'dddd [klokka] LT',
                lastDay: '[I g\xe5r klokka] LT',
                lastWeek: '[F\xf8reg\xe5ande] dddd [klokka] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: 'om %s',
                past: '%s sidan',
                s: 'nokre sekund',
                ss: '%d sekund',
                m: 'eit minutt',
                mm: '%d minutt',
                h: 'ein time',
                hh: '%d timar',
                d: 'ein dag',
                dd: '%d dagar',
                M: 'ein m\xe5nad',
                MM: '%d m\xe5nader',
                y: 'eit \xe5r',
                yy: '%d \xe5r',
            },
            dayOfMonthOrdinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: { dow: 1, doy: 4 },
        });
    var Rn = {
            1: '\u0a67',
            2: '\u0a68',
            3: '\u0a69',
            4: '\u0a6a',
            5: '\u0a6b',
            6: '\u0a6c',
            7: '\u0a6d',
            8: '\u0a6e',
            9: '\u0a6f',
            0: '\u0a66',
        },
        Cn = {
            '\u0a67': '1',
            '\u0a68': '2',
            '\u0a69': '3',
            '\u0a6a': '4',
            '\u0a6b': '5',
            '\u0a6c': '6',
            '\u0a6d': '7',
            '\u0a6e': '8',
            '\u0a6f': '9',
            '\u0a66': '0',
        };
    l.defineLocale('pa-in', {
        months: '\u0a1c\u0a28\u0a35\u0a30\u0a40_\u0a2b\u0a3c\u0a30\u0a35\u0a30\u0a40_\u0a2e\u0a3e\u0a30\u0a1a_\u0a05\u0a2a\u0a4d\u0a30\u0a48\u0a32_\u0a2e\u0a08_\u0a1c\u0a42\u0a28_\u0a1c\u0a41\u0a32\u0a3e\u0a08_\u0a05\u0a17\u0a38\u0a24_\u0a38\u0a24\u0a70\u0a2c\u0a30_\u0a05\u0a15\u0a24\u0a42\u0a2c\u0a30_\u0a28\u0a35\u0a70\u0a2c\u0a30_\u0a26\u0a38\u0a70\u0a2c\u0a30'.split(
            '_'
        ),
        monthsShort:
            '\u0a1c\u0a28\u0a35\u0a30\u0a40_\u0a2b\u0a3c\u0a30\u0a35\u0a30\u0a40_\u0a2e\u0a3e\u0a30\u0a1a_\u0a05\u0a2a\u0a4d\u0a30\u0a48\u0a32_\u0a2e\u0a08_\u0a1c\u0a42\u0a28_\u0a1c\u0a41\u0a32\u0a3e\u0a08_\u0a05\u0a17\u0a38\u0a24_\u0a38\u0a24\u0a70\u0a2c\u0a30_\u0a05\u0a15\u0a24\u0a42\u0a2c\u0a30_\u0a28\u0a35\u0a70\u0a2c\u0a30_\u0a26\u0a38\u0a70\u0a2c\u0a30'.split(
                '_'
            ),
        weekdays:
            '\u0a10\u0a24\u0a35\u0a3e\u0a30_\u0a38\u0a4b\u0a2e\u0a35\u0a3e\u0a30_\u0a2e\u0a70\u0a17\u0a32\u0a35\u0a3e\u0a30_\u0a2c\u0a41\u0a27\u0a35\u0a3e\u0a30_\u0a35\u0a40\u0a30\u0a35\u0a3e\u0a30_\u0a38\u0a3c\u0a41\u0a71\u0a15\u0a30\u0a35\u0a3e\u0a30_\u0a38\u0a3c\u0a28\u0a40\u0a1a\u0a30\u0a35\u0a3e\u0a30'.split(
                '_'
            ),
        weekdaysShort:
            '\u0a10\u0a24_\u0a38\u0a4b\u0a2e_\u0a2e\u0a70\u0a17\u0a32_\u0a2c\u0a41\u0a27_\u0a35\u0a40\u0a30_\u0a38\u0a3c\u0a41\u0a15\u0a30_\u0a38\u0a3c\u0a28\u0a40'.split(
                '_'
            ),
        weekdaysMin:
            '\u0a10\u0a24_\u0a38\u0a4b\u0a2e_\u0a2e\u0a70\u0a17\u0a32_\u0a2c\u0a41\u0a27_\u0a35\u0a40\u0a30_\u0a38\u0a3c\u0a41\u0a15\u0a30_\u0a38\u0a3c\u0a28\u0a40'.split(
                '_'
            ),
        longDateFormat: {
            LT: 'A h:mm \u0a35\u0a1c\u0a47',
            LTS: 'A h:mm:ss \u0a35\u0a1c\u0a47',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY, A h:mm \u0a35\u0a1c\u0a47',
            LLLL: 'dddd, D MMMM YYYY, A h:mm \u0a35\u0a1c\u0a47',
        },
        calendar: {
            sameDay: '[\u0a05\u0a1c] LT',
            nextDay: '[\u0a15\u0a32] LT',
            nextWeek: '[\u0a05\u0a17\u0a32\u0a3e] dddd, LT',
            lastDay: '[\u0a15\u0a32] LT',
            lastWeek: '[\u0a2a\u0a3f\u0a1b\u0a32\u0a47] dddd, LT',
            sameElse: 'L',
        },
        relativeTime: {
            future: '%s \u0a35\u0a3f\u0a71\u0a1a',
            past: '%s \u0a2a\u0a3f\u0a1b\u0a32\u0a47',
            s: '\u0a15\u0a41\u0a1d \u0a38\u0a15\u0a3f\u0a70\u0a1f',
            ss: '%d \u0a38\u0a15\u0a3f\u0a70\u0a1f',
            m: '\u0a07\u0a15 \u0a2e\u0a3f\u0a70\u0a1f',
            mm: '%d \u0a2e\u0a3f\u0a70\u0a1f',
            h: '\u0a07\u0a71\u0a15 \u0a18\u0a70\u0a1f\u0a3e',
            hh: '%d \u0a18\u0a70\u0a1f\u0a47',
            d: '\u0a07\u0a71\u0a15 \u0a26\u0a3f\u0a28',
            dd: '%d \u0a26\u0a3f\u0a28',
            M: '\u0a07\u0a71\u0a15 \u0a2e\u0a39\u0a40\u0a28\u0a3e',
            MM: '%d \u0a2e\u0a39\u0a40\u0a28\u0a47',
            y: '\u0a07\u0a71\u0a15 \u0a38\u0a3e\u0a32',
            yy: '%d \u0a38\u0a3e\u0a32',
        },
        preparse: function (e) {
            return e.replace(
                /[\u0a67\u0a68\u0a69\u0a6a\u0a6b\u0a6c\u0a6d\u0a6e\u0a6f\u0a66]/g,
                function (e) {
                    return Cn[e];
                }
            );
        },
        postformat: function (e) {
            return e.replace(/\d/g, function (e) {
                return Rn[e];
            });
        },
        meridiemParse:
            /\u0a30\u0a3e\u0a24|\u0a38\u0a35\u0a47\u0a30|\u0a26\u0a41\u0a2a\u0a39\u0a3f\u0a30|\u0a38\u0a3c\u0a3e\u0a2e/,
        meridiemHour: function (e, a) {
            return (
                12 === e && (e = 0),
                '\u0a30\u0a3e\u0a24' === a
                    ? e < 4
                        ? e
                        : e + 12
                    : '\u0a38\u0a35\u0a47\u0a30' === a
                    ? e
                    : '\u0a26\u0a41\u0a2a\u0a39\u0a3f\u0a30' === a
                    ? 10 <= e
                        ? e
                        : e + 12
                    : '\u0a38\u0a3c\u0a3e\u0a2e' === a
                    ? e + 12
                    : void 0
            );
        },
        meridiem: function (e, a, t) {
            return e < 4
                ? '\u0a30\u0a3e\u0a24'
                : e < 10
                ? '\u0a38\u0a35\u0a47\u0a30'
                : e < 17
                ? '\u0a26\u0a41\u0a2a\u0a39\u0a3f\u0a30'
                : e < 20
                ? '\u0a38\u0a3c\u0a3e\u0a2e'
                : '\u0a30\u0a3e\u0a24';
        },
        week: { dow: 0, doy: 6 },
    });
    var In =
            'stycze\u0144_luty_marzec_kwiecie\u0144_maj_czerwiec_lipiec_sierpie\u0144_wrzesie\u0144_pa\u017adziernik_listopad_grudzie\u0144'.split(
                '_'
            ),
        Un =
            'stycznia_lutego_marca_kwietnia_maja_czerwca_lipca_sierpnia_wrze\u015bnia_pa\u017adziernika_listopada_grudnia'.split(
                '_'
            );
    function Gn(e) {
        return e % 10 < 5 && 1 < e % 10 && ~~(e / 10) % 10 != 1;
    }
    function Vn(e, a, t) {
        var s = e + ' ';
        switch (t) {
            case 'ss':
                return s + (Gn(e) ? 'sekundy' : 'sekund');
            case 'm':
                return a ? 'minuta' : 'minut\u0119';
            case 'mm':
                return s + (Gn(e) ? 'minuty' : 'minut');
            case 'h':
                return a ? 'godzina' : 'godzin\u0119';
            case 'hh':
                return s + (Gn(e) ? 'godziny' : 'godzin');
            case 'MM':
                return s + (Gn(e) ? 'miesi\u0105ce' : 'miesi\u0119cy');
            case 'yy':
                return s + (Gn(e) ? 'lata' : 'lat');
        }
    }
    function Kn(e, a, t) {
        var s = ' ';
        return (
            (20 <= e % 100 || (100 <= e && e % 100 == 0)) && (s = ' de '),
            e +
                s +
                {
                    ss: 'secunde',
                    mm: 'minute',
                    hh: 'ore',
                    dd: 'zile',
                    MM: 'luni',
                    yy: 'ani',
                }[t]
        );
    }
    function Zn(e, a, t) {
        var s, n;
        return 'm' === t
            ? a
                ? '\u043c\u0438\u043d\u0443\u0442\u0430'
                : '\u043c\u0438\u043d\u0443\u0442\u0443'
            : e +
                  ' ' +
                  ((s = +e),
                  (n = {
                      ss: a
                          ? '\u0441\u0435\u043a\u0443\u043d\u0434\u0430_\u0441\u0435\u043a\u0443\u043d\u0434\u044b_\u0441\u0435\u043a\u0443\u043d\u0434'
                          : '\u0441\u0435\u043a\u0443\u043d\u0434\u0443_\u0441\u0435\u043a\u0443\u043d\u0434\u044b_\u0441\u0435\u043a\u0443\u043d\u0434',
                      mm: a
                          ? '\u043c\u0438\u043d\u0443\u0442\u0430_\u043c\u0438\u043d\u0443\u0442\u044b_\u043c\u0438\u043d\u0443\u0442'
                          : '\u043c\u0438\u043d\u0443\u0442\u0443_\u043c\u0438\u043d\u0443\u0442\u044b_\u043c\u0438\u043d\u0443\u0442',
                      hh: '\u0447\u0430\u0441_\u0447\u0430\u0441\u0430_\u0447\u0430\u0441\u043e\u0432',
                      dd: '\u0434\u0435\u043d\u044c_\u0434\u043d\u044f_\u0434\u043d\u0435\u0439',
                      MM: '\u043c\u0435\u0441\u044f\u0446_\u043c\u0435\u0441\u044f\u0446\u0430_\u043c\u0435\u0441\u044f\u0446\u0435\u0432',
                      yy: '\u0433\u043e\u0434_\u0433\u043e\u0434\u0430_\u043b\u0435\u0442',
                  }[t].split('_')),
                  s % 10 == 1 && s % 100 != 11
                      ? n[0]
                      : 2 <= s % 10 &&
                        s % 10 <= 4 &&
                        (s % 100 < 10 || 20 <= s % 100)
                      ? n[1]
                      : n[2]);
    }
    l.defineLocale('pl', {
        months: function (e, a) {
            return e
                ? '' === a
                    ? '(' + Un[e.month()] + '|' + In[e.month()] + ')'
                    : /D MMMM/.test(a)
                    ? Un[e.month()]
                    : In[e.month()]
                : In;
        },
        monthsShort:
            'sty_lut_mar_kwi_maj_cze_lip_sie_wrz_pa\u017a_lis_gru'.split('_'),
        weekdays:
            'niedziela_poniedzia\u0142ek_wtorek_\u015broda_czwartek_pi\u0105tek_sobota'.split(
                '_'
            ),
        weekdaysShort: 'ndz_pon_wt_\u015br_czw_pt_sob'.split('_'),
        weekdaysMin: 'Nd_Pn_Wt_\u015ar_Cz_Pt_So'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L: 'DD.MM.YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY HH:mm',
            LLLL: 'dddd, D MMMM YYYY HH:mm',
        },
        calendar: {
            sameDay: '[Dzi\u015b o] LT',
            nextDay: '[Jutro o] LT',
            nextWeek: function () {
                switch (this.day()) {
                    case 0:
                        return '[W niedziel\u0119 o] LT';
                    case 2:
                        return '[We wtorek o] LT';
                    case 3:
                        return '[W \u015brod\u0119 o] LT';
                    case 6:
                        return '[W sobot\u0119 o] LT';
                    default:
                        return '[W] dddd [o] LT';
                }
            },
            lastDay: '[Wczoraj o] LT',
            lastWeek: function () {
                switch (this.day()) {
                    case 0:
                        return '[W zesz\u0142\u0105 niedziel\u0119 o] LT';
                    case 3:
                        return '[W zesz\u0142\u0105 \u015brod\u0119 o] LT';
                    case 6:
                        return '[W zesz\u0142\u0105 sobot\u0119 o] LT';
                    default:
                        return '[W zesz\u0142y] dddd [o] LT';
                }
            },
            sameElse: 'L',
        },
        relativeTime: {
            future: 'za %s',
            past: '%s temu',
            s: 'kilka sekund',
            ss: Vn,
            m: Vn,
            mm: Vn,
            h: Vn,
            hh: Vn,
            d: '1 dzie\u0144',
            dd: '%d dni',
            M: 'miesi\u0105c',
            MM: Vn,
            y: 'rok',
            yy: Vn,
        },
        dayOfMonthOrdinalParse: /\d{1,2}\./,
        ordinal: '%d.',
        week: { dow: 1, doy: 4 },
    }),
        l.defineLocale('pt-br', {
            months: 'Janeiro_Fevereiro_Mar\xe7o_Abril_Maio_Junho_Julho_Agosto_Setembro_Outubro_Novembro_Dezembro'.split(
                '_'
            ),
            monthsShort:
                'Jan_Fev_Mar_Abr_Mai_Jun_Jul_Ago_Set_Out_Nov_Dez'.split('_'),
            weekdays:
                'Domingo_Segunda-feira_Ter\xe7a-feira_Quarta-feira_Quinta-feira_Sexta-feira_S\xe1bado'.split(
                    '_'
                ),
            weekdaysShort: 'Dom_Seg_Ter_Qua_Qui_Sex_S\xe1b'.split('_'),
            weekdaysMin: 'Do_2\xaa_3\xaa_4\xaa_5\xaa_6\xaa_S\xe1'.split('_'),
            weekdaysParseExact: !0,
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D [de] MMMM [de] YYYY',
                LLL: 'D [de] MMMM [de] YYYY [\xe0s] HH:mm',
                LLLL: 'dddd, D [de] MMMM [de] YYYY [\xe0s] HH:mm',
            },
            calendar: {
                sameDay: '[Hoje \xe0s] LT',
                nextDay: '[Amanh\xe3 \xe0s] LT',
                nextWeek: 'dddd [\xe0s] LT',
                lastDay: '[Ontem \xe0s] LT',
                lastWeek: function () {
                    return 0 === this.day() || 6 === this.day()
                        ? '[\xdaltimo] dddd [\xe0s] LT'
                        : '[\xdaltima] dddd [\xe0s] LT';
                },
                sameElse: 'L',
            },
            relativeTime: {
                future: 'em %s',
                past: 'h\xe1 %s',
                s: 'poucos segundos',
                ss: '%d segundos',
                m: 'um minuto',
                mm: '%d minutos',
                h: 'uma hora',
                hh: '%d horas',
                d: 'um dia',
                dd: '%d dias',
                M: 'um m\xeas',
                MM: '%d meses',
                y: 'um ano',
                yy: '%d anos',
            },
            dayOfMonthOrdinalParse: /\d{1,2}\xba/,
            ordinal: '%d\xba',
        }),
        l.defineLocale('pt', {
            months: 'Janeiro_Fevereiro_Mar\xe7o_Abril_Maio_Junho_Julho_Agosto_Setembro_Outubro_Novembro_Dezembro'.split(
                '_'
            ),
            monthsShort:
                'Jan_Fev_Mar_Abr_Mai_Jun_Jul_Ago_Set_Out_Nov_Dez'.split('_'),
            weekdays:
                'Domingo_Segunda-feira_Ter\xe7a-feira_Quarta-feira_Quinta-feira_Sexta-feira_S\xe1bado'.split(
                    '_'
                ),
            weekdaysShort: 'Dom_Seg_Ter_Qua_Qui_Sex_S\xe1b'.split('_'),
            weekdaysMin: 'Do_2\xaa_3\xaa_4\xaa_5\xaa_6\xaa_S\xe1'.split('_'),
            weekdaysParseExact: !0,
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D [de] MMMM [de] YYYY',
                LLL: 'D [de] MMMM [de] YYYY HH:mm',
                LLLL: 'dddd, D [de] MMMM [de] YYYY HH:mm',
            },
            calendar: {
                sameDay: '[Hoje \xe0s] LT',
                nextDay: '[Amanh\xe3 \xe0s] LT',
                nextWeek: 'dddd [\xe0s] LT',
                lastDay: '[Ontem \xe0s] LT',
                lastWeek: function () {
                    return 0 === this.day() || 6 === this.day()
                        ? '[\xdaltimo] dddd [\xe0s] LT'
                        : '[\xdaltima] dddd [\xe0s] LT';
                },
                sameElse: 'L',
            },
            relativeTime: {
                future: 'em %s',
                past: 'h\xe1 %s',
                s: 'segundos',
                ss: '%d segundos',
                m: 'um minuto',
                mm: '%d minutos',
                h: 'uma hora',
                hh: '%d horas',
                d: 'um dia',
                dd: '%d dias',
                M: 'um m\xeas',
                MM: '%d meses',
                y: 'um ano',
                yy: '%d anos',
            },
            dayOfMonthOrdinalParse: /\d{1,2}\xba/,
            ordinal: '%d\xba',
            week: { dow: 1, doy: 4 },
        }),
        l.defineLocale('ro', {
            months: 'ianuarie_februarie_martie_aprilie_mai_iunie_iulie_august_septembrie_octombrie_noiembrie_decembrie'.split(
                '_'
            ),
            monthsShort:
                'ian._febr._mart._apr._mai_iun._iul._aug._sept._oct._nov._dec.'.split(
                    '_'
                ),
            monthsParseExact: !0,
            weekdays:
                'duminic\u0103_luni_mar\u021bi_miercuri_joi_vineri_s\xe2mb\u0103t\u0103'.split(
                    '_'
                ),
            weekdaysShort: 'Dum_Lun_Mar_Mie_Joi_Vin_S\xe2m'.split('_'),
            weekdaysMin: 'Du_Lu_Ma_Mi_Jo_Vi_S\xe2'.split('_'),
            longDateFormat: {
                LT: 'H:mm',
                LTS: 'H:mm:ss',
                L: 'DD.MM.YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY H:mm',
                LLLL: 'dddd, D MMMM YYYY H:mm',
            },
            calendar: {
                sameDay: '[azi la] LT',
                nextDay: '[m\xe2ine la] LT',
                nextWeek: 'dddd [la] LT',
                lastDay: '[ieri la] LT',
                lastWeek: '[fosta] dddd [la] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: 'peste %s',
                past: '%s \xeen urm\u0103',
                s: 'c\xe2teva secunde',
                ss: Kn,
                m: 'un minut',
                mm: Kn,
                h: 'o or\u0103',
                hh: Kn,
                d: 'o zi',
                dd: Kn,
                M: 'o lun\u0103',
                MM: Kn,
                y: 'un an',
                yy: Kn,
            },
            week: { dow: 1, doy: 7 },
        });
    var $n = [
        /^\u044f\u043d\u0432/i,
        /^\u0444\u0435\u0432/i,
        /^\u043c\u0430\u0440/i,
        /^\u0430\u043f\u0440/i,
        /^\u043c\u0430[\u0439\u044f]/i,
        /^\u0438\u044e\u043d/i,
        /^\u0438\u044e\u043b/i,
        /^\u0430\u0432\u0433/i,
        /^\u0441\u0435\u043d/i,
        /^\u043e\u043a\u0442/i,
        /^\u043d\u043e\u044f/i,
        /^\u0434\u0435\u043a/i,
    ];
    l.defineLocale('ru', {
        months: {
            format: '\u044f\u043d\u0432\u0430\u0440\u044f_\u0444\u0435\u0432\u0440\u0430\u043b\u044f_\u043c\u0430\u0440\u0442\u0430_\u0430\u043f\u0440\u0435\u043b\u044f_\u043c\u0430\u044f_\u0438\u044e\u043d\u044f_\u0438\u044e\u043b\u044f_\u0430\u0432\u0433\u0443\u0441\u0442\u0430_\u0441\u0435\u043d\u0442\u044f\u0431\u0440\u044f_\u043e\u043a\u0442\u044f\u0431\u0440\u044f_\u043d\u043e\u044f\u0431\u0440\u044f_\u0434\u0435\u043a\u0430\u0431\u0440\u044f'.split(
                '_'
            ),
            standalone:
                '\u044f\u043d\u0432\u0430\u0440\u044c_\u0444\u0435\u0432\u0440\u0430\u043b\u044c_\u043c\u0430\u0440\u0442_\u0430\u043f\u0440\u0435\u043b\u044c_\u043c\u0430\u0439_\u0438\u044e\u043d\u044c_\u0438\u044e\u043b\u044c_\u0430\u0432\u0433\u0443\u0441\u0442_\u0441\u0435\u043d\u0442\u044f\u0431\u0440\u044c_\u043e\u043a\u0442\u044f\u0431\u0440\u044c_\u043d\u043e\u044f\u0431\u0440\u044c_\u0434\u0435\u043a\u0430\u0431\u0440\u044c'.split(
                    '_'
                ),
        },
        monthsShort: {
            format: '\u044f\u043d\u0432._\u0444\u0435\u0432\u0440._\u043c\u0430\u0440._\u0430\u043f\u0440._\u043c\u0430\u044f_\u0438\u044e\u043d\u044f_\u0438\u044e\u043b\u044f_\u0430\u0432\u0433._\u0441\u0435\u043d\u0442._\u043e\u043a\u0442._\u043d\u043e\u044f\u0431._\u0434\u0435\u043a.'.split(
                '_'
            ),
            standalone:
                '\u044f\u043d\u0432._\u0444\u0435\u0432\u0440._\u043c\u0430\u0440\u0442_\u0430\u043f\u0440._\u043c\u0430\u0439_\u0438\u044e\u043d\u044c_\u0438\u044e\u043b\u044c_\u0430\u0432\u0433._\u0441\u0435\u043d\u0442._\u043e\u043a\u0442._\u043d\u043e\u044f\u0431._\u0434\u0435\u043a.'.split(
                    '_'
                ),
        },
        weekdays: {
            standalone:
                '\u0432\u043e\u0441\u043a\u0440\u0435\u0441\u0435\u043d\u044c\u0435_\u043f\u043e\u043d\u0435\u0434\u0435\u043b\u044c\u043d\u0438\u043a_\u0432\u0442\u043e\u0440\u043d\u0438\u043a_\u0441\u0440\u0435\u0434\u0430_\u0447\u0435\u0442\u0432\u0435\u0440\u0433_\u043f\u044f\u0442\u043d\u0438\u0446\u0430_\u0441\u0443\u0431\u0431\u043e\u0442\u0430'.split(
                    '_'
                ),
            format: '\u0432\u043e\u0441\u043a\u0440\u0435\u0441\u0435\u043d\u044c\u0435_\u043f\u043e\u043d\u0435\u0434\u0435\u043b\u044c\u043d\u0438\u043a_\u0432\u0442\u043e\u0440\u043d\u0438\u043a_\u0441\u0440\u0435\u0434\u0443_\u0447\u0435\u0442\u0432\u0435\u0440\u0433_\u043f\u044f\u0442\u043d\u0438\u0446\u0443_\u0441\u0443\u0431\u0431\u043e\u0442\u0443'.split(
                '_'
            ),
            isFormat:
                /\[ ?[\u0412\u0432] ?(?:\u043f\u0440\u043e\u0448\u043b\u0443\u044e|\u0441\u043b\u0435\u0434\u0443\u044e\u0449\u0443\u044e|\u044d\u0442\u0443)? ?\] ?dddd/,
        },
        weekdaysShort:
            '\u0432\u0441_\u043f\u043d_\u0432\u0442_\u0441\u0440_\u0447\u0442_\u043f\u0442_\u0441\u0431'.split(
                '_'
            ),
        weekdaysMin:
            '\u0432\u0441_\u043f\u043d_\u0432\u0442_\u0441\u0440_\u0447\u0442_\u043f\u0442_\u0441\u0431'.split(
                '_'
            ),
        monthsParse: $n,
        longMonthsParse: $n,
        shortMonthsParse: $n,
        monthsRegex:
            /^(\u044f\u043d\u0432\u0430\u0440[\u044c\u044f]|\u044f\u043d\u0432\.?|\u0444\u0435\u0432\u0440\u0430\u043b[\u044c\u044f]|\u0444\u0435\u0432\u0440?\.?|\u043c\u0430\u0440\u0442\u0430?|\u043c\u0430\u0440\.?|\u0430\u043f\u0440\u0435\u043b[\u044c\u044f]|\u0430\u043f\u0440\.?|\u043c\u0430[\u0439\u044f]|\u0438\u044e\u043d[\u044c\u044f]|\u0438\u044e\u043d\.?|\u0438\u044e\u043b[\u044c\u044f]|\u0438\u044e\u043b\.?|\u0430\u0432\u0433\u0443\u0441\u0442\u0430?|\u0430\u0432\u0433\.?|\u0441\u0435\u043d\u0442\u044f\u0431\u0440[\u044c\u044f]|\u0441\u0435\u043d\u0442?\.?|\u043e\u043a\u0442\u044f\u0431\u0440[\u044c\u044f]|\u043e\u043a\u0442\.?|\u043d\u043e\u044f\u0431\u0440[\u044c\u044f]|\u043d\u043e\u044f\u0431?\.?|\u0434\u0435\u043a\u0430\u0431\u0440[\u044c\u044f]|\u0434\u0435\u043a\.?)/i,
        monthsShortRegex:
            /^(\u044f\u043d\u0432\u0430\u0440[\u044c\u044f]|\u044f\u043d\u0432\.?|\u0444\u0435\u0432\u0440\u0430\u043b[\u044c\u044f]|\u0444\u0435\u0432\u0440?\.?|\u043c\u0430\u0440\u0442\u0430?|\u043c\u0430\u0440\.?|\u0430\u043f\u0440\u0435\u043b[\u044c\u044f]|\u0430\u043f\u0440\.?|\u043c\u0430[\u0439\u044f]|\u0438\u044e\u043d[\u044c\u044f]|\u0438\u044e\u043d\.?|\u0438\u044e\u043b[\u044c\u044f]|\u0438\u044e\u043b\.?|\u0430\u0432\u0433\u0443\u0441\u0442\u0430?|\u0430\u0432\u0433\.?|\u0441\u0435\u043d\u0442\u044f\u0431\u0440[\u044c\u044f]|\u0441\u0435\u043d\u0442?\.?|\u043e\u043a\u0442\u044f\u0431\u0440[\u044c\u044f]|\u043e\u043a\u0442\.?|\u043d\u043e\u044f\u0431\u0440[\u044c\u044f]|\u043d\u043e\u044f\u0431?\.?|\u0434\u0435\u043a\u0430\u0431\u0440[\u044c\u044f]|\u0434\u0435\u043a\.?)/i,
        monthsStrictRegex:
            /^(\u044f\u043d\u0432\u0430\u0440[\u044f\u044c]|\u0444\u0435\u0432\u0440\u0430\u043b[\u044f\u044c]|\u043c\u0430\u0440\u0442\u0430?|\u0430\u043f\u0440\u0435\u043b[\u044f\u044c]|\u043c\u0430[\u044f\u0439]|\u0438\u044e\u043d[\u044f\u044c]|\u0438\u044e\u043b[\u044f\u044c]|\u0430\u0432\u0433\u0443\u0441\u0442\u0430?|\u0441\u0435\u043d\u0442\u044f\u0431\u0440[\u044f\u044c]|\u043e\u043a\u0442\u044f\u0431\u0440[\u044f\u044c]|\u043d\u043e\u044f\u0431\u0440[\u044f\u044c]|\u0434\u0435\u043a\u0430\u0431\u0440[\u044f\u044c])/i,
        monthsShortStrictRegex:
            /^(\u044f\u043d\u0432\.|\u0444\u0435\u0432\u0440?\.|\u043c\u0430\u0440[\u0442.]|\u0430\u043f\u0440\.|\u043c\u0430[\u044f\u0439]|\u0438\u044e\u043d[\u044c\u044f.]|\u0438\u044e\u043b[\u044c\u044f.]|\u0430\u0432\u0433\.|\u0441\u0435\u043d\u0442?\.|\u043e\u043a\u0442\.|\u043d\u043e\u044f\u0431?\.|\u0434\u0435\u043a\.)/i,
        longDateFormat: {
            LT: 'H:mm',
            LTS: 'H:mm:ss',
            L: 'DD.MM.YYYY',
            LL: 'D MMMM YYYY \u0433.',
            LLL: 'D MMMM YYYY \u0433., H:mm',
            LLLL: 'dddd, D MMMM YYYY \u0433., H:mm',
        },
        calendar: {
            sameDay: '[\u0421\u0435\u0433\u043e\u0434\u043d\u044f, \u0432] LT',
            nextDay: '[\u0417\u0430\u0432\u0442\u0440\u0430, \u0432] LT',
            lastDay: '[\u0412\u0447\u0435\u0440\u0430, \u0432] LT',
            nextWeek: function (e) {
                if (e.week() === this.week())
                    return 2 === this.day()
                        ? '[\u0412\u043e] dddd, [\u0432] LT'
                        : '[\u0412] dddd, [\u0432] LT';
                switch (this.day()) {
                    case 0:
                        return '[\u0412 \u0441\u043b\u0435\u0434\u0443\u044e\u0449\u0435\u0435] dddd, [\u0432] LT';
                    case 1:
                    case 2:
                    case 4:
                        return '[\u0412 \u0441\u043b\u0435\u0434\u0443\u044e\u0449\u0438\u0439] dddd, [\u0432] LT';
                    case 3:
                    case 5:
                    case 6:
                        return '[\u0412 \u0441\u043b\u0435\u0434\u0443\u044e\u0449\u0443\u044e] dddd, [\u0432] LT';
                }
            },
            lastWeek: function (e) {
                if (e.week() === this.week())
                    return 2 === this.day()
                        ? '[\u0412\u043e] dddd, [\u0432] LT'
                        : '[\u0412] dddd, [\u0432] LT';
                switch (this.day()) {
                    case 0:
                        return '[\u0412 \u043f\u0440\u043e\u0448\u043b\u043e\u0435] dddd, [\u0432] LT';
                    case 1:
                    case 2:
                    case 4:
                        return '[\u0412 \u043f\u0440\u043e\u0448\u043b\u044b\u0439] dddd, [\u0432] LT';
                    case 3:
                    case 5:
                    case 6:
                        return '[\u0412 \u043f\u0440\u043e\u0448\u043b\u0443\u044e] dddd, [\u0432] LT';
                }
            },
            sameElse: 'L',
        },
        relativeTime: {
            future: '\u0447\u0435\u0440\u0435\u0437 %s',
            past: '%s \u043d\u0430\u0437\u0430\u0434',
            s: '\u043d\u0435\u0441\u043a\u043e\u043b\u044c\u043a\u043e \u0441\u0435\u043a\u0443\u043d\u0434',
            ss: Zn,
            m: Zn,
            mm: Zn,
            h: '\u0447\u0430\u0441',
            hh: Zn,
            d: '\u0434\u0435\u043d\u044c',
            dd: Zn,
            M: '\u043c\u0435\u0441\u044f\u0446',
            MM: Zn,
            y: '\u0433\u043e\u0434',
            yy: Zn,
        },
        meridiemParse:
            /\u043d\u043e\u0447\u0438|\u0443\u0442\u0440\u0430|\u0434\u043d\u044f|\u0432\u0435\u0447\u0435\u0440\u0430/i,
        isPM: function (e) {
            return /^(\u0434\u043d\u044f|\u0432\u0435\u0447\u0435\u0440\u0430)$/.test(
                e
            );
        },
        meridiem: function (e, a, t) {
            return e < 4
                ? '\u043d\u043e\u0447\u0438'
                : e < 12
                ? '\u0443\u0442\u0440\u0430'
                : e < 17
                ? '\u0434\u043d\u044f'
                : '\u0432\u0435\u0447\u0435\u0440\u0430';
        },
        dayOfMonthOrdinalParse: /\d{1,2}-(\u0439|\u0433\u043e|\u044f)/,
        ordinal: function (e, a) {
            switch (a) {
                case 'M':
                case 'd':
                case 'DDD':
                    return e + '-\u0439';
                case 'D':
                    return e + '-\u0433\u043e';
                case 'w':
                case 'W':
                    return e + '-\u044f';
                default:
                    return e;
            }
        },
        week: { dow: 1, doy: 4 },
    });
    var Bn = [
            '\u062c\u0646\u0648\u0631\u064a',
            '\u0641\u064a\u0628\u0631\u0648\u0631\u064a',
            '\u0645\u0627\u0631\u0686',
            '\u0627\u067e\u0631\u064a\u0644',
            '\u0645\u0626\u064a',
            '\u062c\u0648\u0646',
            '\u062c\u0648\u0644\u0627\u0621\u0650',
            '\u0622\u06af\u0633\u067d',
            '\u0633\u064a\u067e\u067d\u0645\u0628\u0631',
            '\u0622\u06aa\u067d\u0648\u0628\u0631',
            '\u0646\u0648\u0645\u0628\u0631',
            '\u068a\u0633\u0645\u0628\u0631',
        ],
        qn = [
            '\u0622\u0686\u0631',
            '\u0633\u0648\u0645\u0631',
            '\u0627\u06b1\u0627\u0631\u0648',
            '\u0627\u0631\u0628\u0639',
            '\u062e\u0645\u064a\u0633',
            '\u062c\u0645\u0639',
            '\u0687\u0646\u0687\u0631',
        ];
    l.defineLocale('sd', {
        months: Bn,
        monthsShort: Bn,
        weekdays: qn,
        weekdaysShort: qn,
        weekdaysMin: qn,
        longDateFormat: {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY HH:mm',
            LLLL: 'dddd\u060c D MMMM YYYY HH:mm',
        },
        meridiemParse: /\u0635\u0628\u062d|\u0634\u0627\u0645/,
        isPM: function (e) {
            return '\u0634\u0627\u0645' === e;
        },
        meridiem: function (e, a, t) {
            return e < 12 ? '\u0635\u0628\u062d' : '\u0634\u0627\u0645';
        },
        calendar: {
            sameDay: '[\u0627\u0684] LT',
            nextDay: '[\u0633\u0680\u0627\u06bb\u064a] LT',
            nextWeek:
                'dddd [\u0627\u06b3\u064a\u0646 \u0647\u0641\u062a\u064a \u062a\u064a] LT',
            lastDay: '[\u06aa\u0627\u0644\u0647\u0647] LT',
            lastWeek:
                '[\u06af\u0632\u0631\u064a\u0644 \u0647\u0641\u062a\u064a] dddd [\u062a\u064a] LT',
            sameElse: 'L',
        },
        relativeTime: {
            future: '%s \u067e\u0648\u0621',
            past: '%s \u0627\u06b3',
            s: '\u0686\u0646\u062f \u0633\u064a\u06aa\u0646\u068a',
            ss: '%d \u0633\u064a\u06aa\u0646\u068a',
            m: '\u0647\u06aa \u0645\u0646\u067d',
            mm: '%d \u0645\u0646\u067d',
            h: '\u0647\u06aa \u06aa\u0644\u0627\u06aa',
            hh: '%d \u06aa\u0644\u0627\u06aa',
            d: '\u0647\u06aa \u068f\u064a\u0646\u0647\u0646',
            dd: '%d \u068f\u064a\u0646\u0647\u0646',
            M: '\u0647\u06aa \u0645\u0647\u064a\u0646\u0648',
            MM: '%d \u0645\u0647\u064a\u0646\u0627',
            y: '\u0647\u06aa \u0633\u0627\u0644',
            yy: '%d \u0633\u0627\u0644',
        },
        preparse: function (e) {
            return e.replace(/\u060c/g, ',');
        },
        postformat: function (e) {
            return e.replace(/,/g, '\u060c');
        },
        week: { dow: 1, doy: 4 },
    }),
        l.defineLocale('se', {
            months: 'o\u0111\u0111ajagem\xe1nnu_guovvam\xe1nnu_njuk\u010dam\xe1nnu_cuo\u014bom\xe1nnu_miessem\xe1nnu_geassem\xe1nnu_suoidnem\xe1nnu_borgem\xe1nnu_\u010dak\u010dam\xe1nnu_golggotm\xe1nnu_sk\xe1bmam\xe1nnu_juovlam\xe1nnu'.split(
                '_'
            ),
            monthsShort:
                'o\u0111\u0111j_guov_njuk_cuo_mies_geas_suoi_borg_\u010dak\u010d_golg_sk\xe1b_juov'.split(
                    '_'
                ),
            weekdays:
                'sotnabeaivi_vuoss\xe1rga_ma\u014b\u014beb\xe1rga_gaskavahkku_duorastat_bearjadat_l\xe1vvardat'.split(
                    '_'
                ),
            weekdaysShort: 'sotn_vuos_ma\u014b_gask_duor_bear_l\xe1v'.split(
                '_'
            ),
            weekdaysMin: 's_v_m_g_d_b_L'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD.MM.YYYY',
                LL: 'MMMM D. [b.] YYYY',
                LLL: 'MMMM D. [b.] YYYY [ti.] HH:mm',
                LLLL: 'dddd, MMMM D. [b.] YYYY [ti.] HH:mm',
            },
            calendar: {
                sameDay: '[otne ti] LT',
                nextDay: '[ihttin ti] LT',
                nextWeek: 'dddd [ti] LT',
                lastDay: '[ikte ti] LT',
                lastWeek: '[ovddit] dddd [ti] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: '%s gea\u017ees',
                past: 'ma\u014bit %s',
                s: 'moadde sekunddat',
                ss: '%d sekunddat',
                m: 'okta minuhta',
                mm: '%d minuhtat',
                h: 'okta diimmu',
                hh: '%d diimmut',
                d: 'okta beaivi',
                dd: '%d beaivvit',
                M: 'okta m\xe1nnu',
                MM: '%d m\xe1nut',
                y: 'okta jahki',
                yy: '%d jagit',
            },
            dayOfMonthOrdinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: { dow: 1, doy: 4 },
        }),
        l.defineLocale('si', {
            months: '\u0da2\u0db1\u0dc0\u0dcf\u0dbb\u0dd2_\u0db4\u0dd9\u0db6\u0dbb\u0dc0\u0dcf\u0dbb\u0dd2_\u0db8\u0dcf\u0dbb\u0dca\u0dad\u0dd4_\u0d85\u0db4\u0dca\u200d\u0dbb\u0dda\u0dbd\u0dca_\u0db8\u0dd0\u0dba\u0dd2_\u0da2\u0dd6\u0db1\u0dd2_\u0da2\u0dd6\u0dbd\u0dd2_\u0d85\u0d9c\u0ddd\u0dc3\u0dca\u0dad\u0dd4_\u0dc3\u0dd0\u0db4\u0dca\u0dad\u0dd0\u0db8\u0dca\u0db6\u0dbb\u0dca_\u0d94\u0d9a\u0dca\u0dad\u0ddd\u0db6\u0dbb\u0dca_\u0db1\u0ddc\u0dc0\u0dd0\u0db8\u0dca\u0db6\u0dbb\u0dca_\u0daf\u0dd9\u0dc3\u0dd0\u0db8\u0dca\u0db6\u0dbb\u0dca'.split(
                '_'
            ),
            monthsShort:
                '\u0da2\u0db1_\u0db4\u0dd9\u0db6_\u0db8\u0dcf\u0dbb\u0dca_\u0d85\u0db4\u0dca_\u0db8\u0dd0\u0dba\u0dd2_\u0da2\u0dd6\u0db1\u0dd2_\u0da2\u0dd6\u0dbd\u0dd2_\u0d85\u0d9c\u0ddd_\u0dc3\u0dd0\u0db4\u0dca_\u0d94\u0d9a\u0dca_\u0db1\u0ddc\u0dc0\u0dd0_\u0daf\u0dd9\u0dc3\u0dd0'.split(
                    '_'
                ),
            weekdays:
                '\u0d89\u0dbb\u0dd2\u0daf\u0dcf_\u0dc3\u0db3\u0dd4\u0daf\u0dcf_\u0d85\u0d9f\u0dc4\u0dbb\u0dd4\u0dc0\u0dcf\u0daf\u0dcf_\u0db6\u0daf\u0dcf\u0daf\u0dcf_\u0db6\u0dca\u200d\u0dbb\u0dc4\u0dc3\u0dca\u0db4\u0dad\u0dd2\u0db1\u0dca\u0daf\u0dcf_\u0dc3\u0dd2\u0d9a\u0dd4\u0dbb\u0dcf\u0daf\u0dcf_\u0dc3\u0dd9\u0db1\u0dc3\u0dd4\u0dbb\u0dcf\u0daf\u0dcf'.split(
                    '_'
                ),
            weekdaysShort:
                '\u0d89\u0dbb\u0dd2_\u0dc3\u0db3\u0dd4_\u0d85\u0d9f_\u0db6\u0daf\u0dcf_\u0db6\u0dca\u200d\u0dbb\u0dc4_\u0dc3\u0dd2\u0d9a\u0dd4_\u0dc3\u0dd9\u0db1'.split(
                    '_'
                ),
            weekdaysMin:
                '\u0d89_\u0dc3_\u0d85_\u0db6_\u0db6\u0dca\u200d\u0dbb_\u0dc3\u0dd2_\u0dc3\u0dd9'.split(
                    '_'
                ),
            weekdaysParseExact: !0,
            longDateFormat: {
                LT: 'a h:mm',
                LTS: 'a h:mm:ss',
                L: 'YYYY/MM/DD',
                LL: 'YYYY MMMM D',
                LLL: 'YYYY MMMM D, a h:mm',
                LLLL: 'YYYY MMMM D [\u0dc0\u0dd0\u0db1\u0dd2] dddd, a h:mm:ss',
            },
            calendar: {
                sameDay: '[\u0d85\u0daf] LT[\u0da7]',
                nextDay: '[\u0dc4\u0dd9\u0da7] LT[\u0da7]',
                nextWeek: 'dddd LT[\u0da7]',
                lastDay: '[\u0d8a\u0dba\u0dda] LT[\u0da7]',
                lastWeek:
                    '[\u0db4\u0dc3\u0dd4\u0d9c\u0dd2\u0dba] dddd LT[\u0da7]',
                sameElse: 'L',
            },
            relativeTime: {
                future: '%s\u0d9a\u0dd2\u0db1\u0dca',
                past: '%s\u0d9a\u0da7 \u0db4\u0dd9\u0dbb',
                s: '\u0dad\u0dad\u0dca\u0db4\u0dbb \u0d9a\u0dd2\u0dc4\u0dd2\u0db4\u0dba',
                ss: '\u0dad\u0dad\u0dca\u0db4\u0dbb %d',
                m: '\u0db8\u0dd2\u0db1\u0dd2\u0dad\u0dca\u0dad\u0dd4\u0dc0',
                mm: '\u0db8\u0dd2\u0db1\u0dd2\u0dad\u0dca\u0dad\u0dd4 %d',
                h: '\u0db4\u0dd0\u0dba',
                hh: '\u0db4\u0dd0\u0dba %d',
                d: '\u0daf\u0dd2\u0db1\u0dba',
                dd: '\u0daf\u0dd2\u0db1 %d',
                M: '\u0db8\u0dcf\u0dc3\u0dba',
                MM: '\u0db8\u0dcf\u0dc3 %d',
                y: '\u0dc0\u0dc3\u0dbb',
                yy: '\u0dc0\u0dc3\u0dbb %d',
            },
            dayOfMonthOrdinalParse: /\d{1,2} \u0dc0\u0dd0\u0db1\u0dd2/,
            ordinal: function (e) {
                return e + ' \u0dc0\u0dd0\u0db1\u0dd2';
            },
            meridiemParse:
                /\u0db4\u0dd9\u0dbb \u0dc0\u0dbb\u0dd4|\u0db4\u0dc3\u0dca \u0dc0\u0dbb\u0dd4|\u0db4\u0dd9.\u0dc0|\u0db4.\u0dc0./,
            isPM: function (e) {
                return (
                    '\u0db4.\u0dc0.' === e ||
                    '\u0db4\u0dc3\u0dca \u0dc0\u0dbb\u0dd4' === e
                );
            },
            meridiem: function (e, a, t) {
                return 11 < e
                    ? t
                        ? '\u0db4.\u0dc0.'
                        : '\u0db4\u0dc3\u0dca \u0dc0\u0dbb\u0dd4'
                    : t
                    ? '\u0db4\u0dd9.\u0dc0.'
                    : '\u0db4\u0dd9\u0dbb \u0dc0\u0dbb\u0dd4';
            },
        });
    var Qn =
            'janu\xe1r_febru\xe1r_marec_apr\xedl_m\xe1j_j\xfan_j\xfal_august_september_okt\xf3ber_november_december'.split(
                '_'
            ),
        Xn = 'jan_feb_mar_apr_m\xe1j_j\xfan_j\xfal_aug_sep_okt_nov_dec'.split(
            '_'
        );
    function ed(e) {
        return 1 < e && e < 5;
    }
    function ad(e, a, t, s) {
        var n = e + ' ';
        switch (t) {
            case 's':
                return a || s ? 'p\xe1r sek\xfand' : 'p\xe1r sekundami';
            case 'ss':
                return a || s
                    ? n + (ed(e) ? 'sekundy' : 'sek\xfand')
                    : n + 'sekundami';
                break;
            case 'm':
                return a ? 'min\xfata' : s ? 'min\xfatu' : 'min\xfatou';
            case 'mm':
                return a || s
                    ? n + (ed(e) ? 'min\xfaty' : 'min\xfat')
                    : n + 'min\xfatami';
                break;
            case 'h':
                return a ? 'hodina' : s ? 'hodinu' : 'hodinou';
            case 'hh':
                return a || s
                    ? n + (ed(e) ? 'hodiny' : 'hod\xedn')
                    : n + 'hodinami';
                break;
            case 'd':
                return a || s ? 'de\u0148' : 'd\u0148om';
            case 'dd':
                return a || s
                    ? n + (ed(e) ? 'dni' : 'dn\xed')
                    : n + 'd\u0148ami';
                break;
            case 'M':
                return a || s ? 'mesiac' : 'mesiacom';
            case 'MM':
                return a || s
                    ? n + (ed(e) ? 'mesiace' : 'mesiacov')
                    : n + 'mesiacmi';
                break;
            case 'y':
                return a || s ? 'rok' : 'rokom';
            case 'yy':
                return a || s ? n + (ed(e) ? 'roky' : 'rokov') : n + 'rokmi';
                break;
        }
    }
    function td(e, a, t, s) {
        var n = e + ' ';
        switch (t) {
            case 's':
                return a || s ? 'nekaj sekund' : 'nekaj sekundami';
            case 'ss':
                return (n +=
                    1 === e
                        ? a
                            ? 'sekundo'
                            : 'sekundi'
                        : 2 === e
                        ? a || s
                            ? 'sekundi'
                            : 'sekundah'
                        : e < 5
                        ? a || s
                            ? 'sekunde'
                            : 'sekundah'
                        : 'sekund');
            case 'm':
                return a ? 'ena minuta' : 'eno minuto';
            case 'mm':
                return (n +=
                    1 === e
                        ? a
                            ? 'minuta'
                            : 'minuto'
                        : 2 === e
                        ? a || s
                            ? 'minuti'
                            : 'minutama'
                        : e < 5
                        ? a || s
                            ? 'minute'
                            : 'minutami'
                        : a || s
                        ? 'minut'
                        : 'minutami');
            case 'h':
                return a ? 'ena ura' : 'eno uro';
            case 'hh':
                return (n +=
                    1 === e
                        ? a
                            ? 'ura'
                            : 'uro'
                        : 2 === e
                        ? a || s
                            ? 'uri'
                            : 'urama'
                        : e < 5
                        ? a || s
                            ? 'ure'
                            : 'urami'
                        : a || s
                        ? 'ur'
                        : 'urami');
            case 'd':
                return a || s ? 'en dan' : 'enim dnem';
            case 'dd':
                return (n +=
                    1 === e
                        ? a || s
                            ? 'dan'
                            : 'dnem'
                        : 2 === e
                        ? a || s
                            ? 'dni'
                            : 'dnevoma'
                        : a || s
                        ? 'dni'
                        : 'dnevi');
            case 'M':
                return a || s ? 'en mesec' : 'enim mesecem';
            case 'MM':
                return (n +=
                    1 === e
                        ? a || s
                            ? 'mesec'
                            : 'mesecem'
                        : 2 === e
                        ? a || s
                            ? 'meseca'
                            : 'mesecema'
                        : e < 5
                        ? a || s
                            ? 'mesece'
                            : 'meseci'
                        : a || s
                        ? 'mesecev'
                        : 'meseci');
            case 'y':
                return a || s ? 'eno leto' : 'enim letom';
            case 'yy':
                return (n +=
                    1 === e
                        ? a || s
                            ? 'leto'
                            : 'letom'
                        : 2 === e
                        ? a || s
                            ? 'leti'
                            : 'letoma'
                        : e < 5
                        ? a || s
                            ? 'leta'
                            : 'leti'
                        : a || s
                        ? 'let'
                        : 'leti');
        }
    }
    l.defineLocale('sk', {
        months: Qn,
        monthsShort: Xn,
        weekdays:
            'nede\u013ea_pondelok_utorok_streda_\u0161tvrtok_piatok_sobota'.split(
                '_'
            ),
        weekdaysShort: 'ne_po_ut_st_\u0161t_pi_so'.split('_'),
        weekdaysMin: 'ne_po_ut_st_\u0161t_pi_so'.split('_'),
        longDateFormat: {
            LT: 'H:mm',
            LTS: 'H:mm:ss',
            L: 'DD.MM.YYYY',
            LL: 'D. MMMM YYYY',
            LLL: 'D. MMMM YYYY H:mm',
            LLLL: 'dddd D. MMMM YYYY H:mm',
        },
        calendar: {
            sameDay: '[dnes o] LT',
            nextDay: '[zajtra o] LT',
            nextWeek: function () {
                switch (this.day()) {
                    case 0:
                        return '[v nede\u013eu o] LT';
                    case 1:
                    case 2:
                        return '[v] dddd [o] LT';
                    case 3:
                        return '[v stredu o] LT';
                    case 4:
                        return '[vo \u0161tvrtok o] LT';
                    case 5:
                        return '[v piatok o] LT';
                    case 6:
                        return '[v sobotu o] LT';
                }
            },
            lastDay: '[v\u010dera o] LT',
            lastWeek: function () {
                switch (this.day()) {
                    case 0:
                        return '[minul\xfa nede\u013eu o] LT';
                    case 1:
                    case 2:
                        return '[minul\xfd] dddd [o] LT';
                    case 3:
                        return '[minul\xfa stredu o] LT';
                    case 4:
                    case 5:
                        return '[minul\xfd] dddd [o] LT';
                    case 6:
                        return '[minul\xfa sobotu o] LT';
                }
            },
            sameElse: 'L',
        },
        relativeTime: {
            future: 'za %s',
            past: 'pred %s',
            s: ad,
            ss: ad,
            m: ad,
            mm: ad,
            h: ad,
            hh: ad,
            d: ad,
            dd: ad,
            M: ad,
            MM: ad,
            y: ad,
            yy: ad,
        },
        dayOfMonthOrdinalParse: /\d{1,2}\./,
        ordinal: '%d.',
        week: { dow: 1, doy: 4 },
    }),
        l.defineLocale('sl', {
            months: 'januar_februar_marec_april_maj_junij_julij_avgust_september_oktober_november_december'.split(
                '_'
            ),
            monthsShort:
                'jan._feb._mar._apr._maj._jun._jul._avg._sep._okt._nov._dec.'.split(
                    '_'
                ),
            monthsParseExact: !0,
            weekdays:
                'nedelja_ponedeljek_torek_sreda_\u010detrtek_petek_sobota'.split(
                    '_'
                ),
            weekdaysShort: 'ned._pon._tor._sre._\u010det._pet._sob.'.split('_'),
            weekdaysMin: 'ne_po_to_sr_\u010de_pe_so'.split('_'),
            weekdaysParseExact: !0,
            longDateFormat: {
                LT: 'H:mm',
                LTS: 'H:mm:ss',
                L: 'DD.MM.YYYY',
                LL: 'D. MMMM YYYY',
                LLL: 'D. MMMM YYYY H:mm',
                LLLL: 'dddd, D. MMMM YYYY H:mm',
            },
            calendar: {
                sameDay: '[danes ob] LT',
                nextDay: '[jutri ob] LT',
                nextWeek: function () {
                    switch (this.day()) {
                        case 0:
                            return '[v] [nedeljo] [ob] LT';
                        case 3:
                            return '[v] [sredo] [ob] LT';
                        case 6:
                            return '[v] [soboto] [ob] LT';
                        case 1:
                        case 2:
                        case 4:
                        case 5:
                            return '[v] dddd [ob] LT';
                    }
                },
                lastDay: '[v\u010deraj ob] LT',
                lastWeek: function () {
                    switch (this.day()) {
                        case 0:
                            return '[prej\u0161njo] [nedeljo] [ob] LT';
                        case 3:
                            return '[prej\u0161njo] [sredo] [ob] LT';
                        case 6:
                            return '[prej\u0161njo] [soboto] [ob] LT';
                        case 1:
                        case 2:
                        case 4:
                        case 5:
                            return '[prej\u0161nji] dddd [ob] LT';
                    }
                },
                sameElse: 'L',
            },
            relativeTime: {
                future: '\u010dez %s',
                past: 'pred %s',
                s: td,
                ss: td,
                m: td,
                mm: td,
                h: td,
                hh: td,
                d: td,
                dd: td,
                M: td,
                MM: td,
                y: td,
                yy: td,
            },
            dayOfMonthOrdinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: { dow: 1, doy: 7 },
        }),
        l.defineLocale('sq', {
            months: 'Janar_Shkurt_Mars_Prill_Maj_Qershor_Korrik_Gusht_Shtator_Tetor_N\xebntor_Dhjetor'.split(
                '_'
            ),
            monthsShort:
                'Jan_Shk_Mar_Pri_Maj_Qer_Kor_Gus_Sht_Tet_N\xebn_Dhj'.split('_'),
            weekdays:
                'E Diel_E H\xebn\xeb_E Mart\xeb_E M\xebrkur\xeb_E Enjte_E Premte_E Shtun\xeb'.split(
                    '_'
                ),
            weekdaysShort: 'Die_H\xebn_Mar_M\xebr_Enj_Pre_Sht'.split('_'),
            weekdaysMin: 'D_H_Ma_M\xeb_E_P_Sh'.split('_'),
            weekdaysParseExact: !0,
            meridiemParse: /PD|MD/,
            isPM: function (e) {
                return 'M' === e.charAt(0);
            },
            meridiem: function (e, a, t) {
                return e < 12 ? 'PD' : 'MD';
            },
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd, D MMMM YYYY HH:mm',
            },
            calendar: {
                sameDay: '[Sot n\xeb] LT',
                nextDay: '[Nes\xebr n\xeb] LT',
                nextWeek: 'dddd [n\xeb] LT',
                lastDay: '[Dje n\xeb] LT',
                lastWeek: 'dddd [e kaluar n\xeb] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: 'n\xeb %s',
                past: '%s m\xeb par\xeb',
                s: 'disa sekonda',
                ss: '%d sekonda',
                m: 'nj\xeb minut\xeb',
                mm: '%d minuta',
                h: 'nj\xeb or\xeb',
                hh: '%d or\xeb',
                d: 'nj\xeb dit\xeb',
                dd: '%d dit\xeb',
                M: 'nj\xeb muaj',
                MM: '%d muaj',
                y: 'nj\xeb vit',
                yy: '%d vite',
            },
            dayOfMonthOrdinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: { dow: 1, doy: 4 },
        });
    var sd = {
        words: {
            ss: [
                '\u0441\u0435\u043a\u0443\u043d\u0434\u0430',
                '\u0441\u0435\u043a\u0443\u043d\u0434\u0435',
                '\u0441\u0435\u043a\u0443\u043d\u0434\u0438',
            ],
            m: [
                '\u0458\u0435\u0434\u0430\u043d \u043c\u0438\u043d\u0443\u0442',
                '\u0458\u0435\u0434\u043d\u0435 \u043c\u0438\u043d\u0443\u0442\u0435',
            ],
            mm: [
                '\u043c\u0438\u043d\u0443\u0442',
                '\u043c\u0438\u043d\u0443\u0442\u0435',
                '\u043c\u0438\u043d\u0443\u0442\u0430',
            ],
            h: [
                '\u0458\u0435\u0434\u0430\u043d \u0441\u0430\u0442',
                '\u0458\u0435\u0434\u043d\u043e\u0433 \u0441\u0430\u0442\u0430',
            ],
            hh: [
                '\u0441\u0430\u0442',
                '\u0441\u0430\u0442\u0430',
                '\u0441\u0430\u0442\u0438',
            ],
            dd: [
                '\u0434\u0430\u043d',
                '\u0434\u0430\u043d\u0430',
                '\u0434\u0430\u043d\u0430',
            ],
            MM: [
                '\u043c\u0435\u0441\u0435\u0446',
                '\u043c\u0435\u0441\u0435\u0446\u0430',
                '\u043c\u0435\u0441\u0435\u0446\u0438',
            ],
            yy: [
                '\u0433\u043e\u0434\u0438\u043d\u0430',
                '\u0433\u043e\u0434\u0438\u043d\u0435',
                '\u0433\u043e\u0434\u0438\u043d\u0430',
            ],
        },
        correctGrammaticalCase: function (e, a) {
            return 1 === e ? a[0] : 2 <= e && e <= 4 ? a[1] : a[2];
        },
        translate: function (e, a, t) {
            var s = sd.words[t];
            return 1 === t.length
                ? a
                    ? s[0]
                    : s[1]
                : e + ' ' + sd.correctGrammaticalCase(e, s);
        },
    };
    l.defineLocale('sr-cyrl', {
        months: '\u0458\u0430\u043d\u0443\u0430\u0440_\u0444\u0435\u0431\u0440\u0443\u0430\u0440_\u043c\u0430\u0440\u0442_\u0430\u043f\u0440\u0438\u043b_\u043c\u0430\u0458_\u0458\u0443\u043d_\u0458\u0443\u043b_\u0430\u0432\u0433\u0443\u0441\u0442_\u0441\u0435\u043f\u0442\u0435\u043c\u0431\u0430\u0440_\u043e\u043a\u0442\u043e\u0431\u0430\u0440_\u043d\u043e\u0432\u0435\u043c\u0431\u0430\u0440_\u0434\u0435\u0446\u0435\u043c\u0431\u0430\u0440'.split(
            '_'
        ),
        monthsShort:
            '\u0458\u0430\u043d._\u0444\u0435\u0431._\u043c\u0430\u0440._\u0430\u043f\u0440._\u043c\u0430\u0458_\u0458\u0443\u043d_\u0458\u0443\u043b_\u0430\u0432\u0433._\u0441\u0435\u043f._\u043e\u043a\u0442._\u043d\u043e\u0432._\u0434\u0435\u0446.'.split(
                '_'
            ),
        monthsParseExact: !0,
        weekdays:
            '\u043d\u0435\u0434\u0435\u0459\u0430_\u043f\u043e\u043d\u0435\u0434\u0435\u0459\u0430\u043a_\u0443\u0442\u043e\u0440\u0430\u043a_\u0441\u0440\u0435\u0434\u0430_\u0447\u0435\u0442\u0432\u0440\u0442\u0430\u043a_\u043f\u0435\u0442\u0430\u043a_\u0441\u0443\u0431\u043e\u0442\u0430'.split(
                '_'
            ),
        weekdaysShort:
            '\u043d\u0435\u0434._\u043f\u043e\u043d._\u0443\u0442\u043e._\u0441\u0440\u0435._\u0447\u0435\u0442._\u043f\u0435\u0442._\u0441\u0443\u0431.'.split(
                '_'
            ),
        weekdaysMin:
            '\u043d\u0435_\u043f\u043e_\u0443\u0442_\u0441\u0440_\u0447\u0435_\u043f\u0435_\u0441\u0443'.split(
                '_'
            ),
        weekdaysParseExact: !0,
        longDateFormat: {
            LT: 'H:mm',
            LTS: 'H:mm:ss',
            L: 'DD.MM.YYYY',
            LL: 'D. MMMM YYYY',
            LLL: 'D. MMMM YYYY H:mm',
            LLLL: 'dddd, D. MMMM YYYY H:mm',
        },
        calendar: {
            sameDay: '[\u0434\u0430\u043d\u0430\u0441 \u0443] LT',
            nextDay: '[\u0441\u0443\u0442\u0440\u0430 \u0443] LT',
            nextWeek: function () {
                switch (this.day()) {
                    case 0:
                        return '[\u0443] [\u043d\u0435\u0434\u0435\u0459\u0443] [\u0443] LT';
                    case 3:
                        return '[\u0443] [\u0441\u0440\u0435\u0434\u0443] [\u0443] LT';
                    case 6:
                        return '[\u0443] [\u0441\u0443\u0431\u043e\u0442\u0443] [\u0443] LT';
                    case 1:
                    case 2:
                    case 4:
                    case 5:
                        return '[\u0443] dddd [\u0443] LT';
                }
            },
            lastDay: '[\u0458\u0443\u0447\u0435 \u0443] LT',
            lastWeek: function () {
                return [
                    '[\u043f\u0440\u043e\u0448\u043b\u0435] [\u043d\u0435\u0434\u0435\u0459\u0435] [\u0443] LT',
                    '[\u043f\u0440\u043e\u0448\u043b\u043e\u0433] [\u043f\u043e\u043d\u0435\u0434\u0435\u0459\u043a\u0430] [\u0443] LT',
                    '[\u043f\u0440\u043e\u0448\u043b\u043e\u0433] [\u0443\u0442\u043e\u0440\u043a\u0430] [\u0443] LT',
                    '[\u043f\u0440\u043e\u0448\u043b\u0435] [\u0441\u0440\u0435\u0434\u0435] [\u0443] LT',
                    '[\u043f\u0440\u043e\u0448\u043b\u043e\u0433] [\u0447\u0435\u0442\u0432\u0440\u0442\u043a\u0430] [\u0443] LT',
                    '[\u043f\u0440\u043e\u0448\u043b\u043e\u0433] [\u043f\u0435\u0442\u043a\u0430] [\u0443] LT',
                    '[\u043f\u0440\u043e\u0448\u043b\u0435] [\u0441\u0443\u0431\u043e\u0442\u0435] [\u0443] LT',
                ][this.day()];
            },
            sameElse: 'L',
        },
        relativeTime: {
            future: '\u0437\u0430 %s',
            past: '\u043f\u0440\u0435 %s',
            s: '\u043d\u0435\u043a\u043e\u043b\u0438\u043a\u043e \u0441\u0435\u043a\u0443\u043d\u0434\u0438',
            ss: sd.translate,
            m: sd.translate,
            mm: sd.translate,
            h: sd.translate,
            hh: sd.translate,
            d: '\u0434\u0430\u043d',
            dd: sd.translate,
            M: '\u043c\u0435\u0441\u0435\u0446',
            MM: sd.translate,
            y: '\u0433\u043e\u0434\u0438\u043d\u0443',
            yy: sd.translate,
        },
        dayOfMonthOrdinalParse: /\d{1,2}\./,
        ordinal: '%d.',
        week: { dow: 1, doy: 7 },
    });
    var nd = {
        words: {
            ss: ['sekunda', 'sekunde', 'sekundi'],
            m: ['jedan minut', 'jedne minute'],
            mm: ['minut', 'minute', 'minuta'],
            h: ['jedan sat', 'jednog sata'],
            hh: ['sat', 'sata', 'sati'],
            dd: ['dan', 'dana', 'dana'],
            MM: ['mesec', 'meseca', 'meseci'],
            yy: ['godina', 'godine', 'godina'],
        },
        correctGrammaticalCase: function (e, a) {
            return 1 === e ? a[0] : 2 <= e && e <= 4 ? a[1] : a[2];
        },
        translate: function (e, a, t) {
            var s = nd.words[t];
            return 1 === t.length
                ? a
                    ? s[0]
                    : s[1]
                : e + ' ' + nd.correctGrammaticalCase(e, s);
        },
    };
    l.defineLocale('sr', {
        months: 'januar_februar_mart_april_maj_jun_jul_avgust_septembar_oktobar_novembar_decembar'.split(
            '_'
        ),
        monthsShort:
            'jan._feb._mar._apr._maj_jun_jul_avg._sep._okt._nov._dec.'.split(
                '_'
            ),
        monthsParseExact: !0,
        weekdays:
            'nedelja_ponedeljak_utorak_sreda_\u010detvrtak_petak_subota'.split(
                '_'
            ),
        weekdaysShort: 'ned._pon._uto._sre._\u010det._pet._sub.'.split('_'),
        weekdaysMin: 'ne_po_ut_sr_\u010de_pe_su'.split('_'),
        weekdaysParseExact: !0,
        longDateFormat: {
            LT: 'H:mm',
            LTS: 'H:mm:ss',
            L: 'DD.MM.YYYY',
            LL: 'D. MMMM YYYY',
            LLL: 'D. MMMM YYYY H:mm',
            LLLL: 'dddd, D. MMMM YYYY H:mm',
        },
        calendar: {
            sameDay: '[danas u] LT',
            nextDay: '[sutra u] LT',
            nextWeek: function () {
                switch (this.day()) {
                    case 0:
                        return '[u] [nedelju] [u] LT';
                    case 3:
                        return '[u] [sredu] [u] LT';
                    case 6:
                        return '[u] [subotu] [u] LT';
                    case 1:
                    case 2:
                    case 4:
                    case 5:
                        return '[u] dddd [u] LT';
                }
            },
            lastDay: '[ju\u010de u] LT',
            lastWeek: function () {
                return [
                    '[pro\u0161le] [nedelje] [u] LT',
                    '[pro\u0161log] [ponedeljka] [u] LT',
                    '[pro\u0161log] [utorka] [u] LT',
                    '[pro\u0161le] [srede] [u] LT',
                    '[pro\u0161log] [\u010detvrtka] [u] LT',
                    '[pro\u0161log] [petka] [u] LT',
                    '[pro\u0161le] [subote] [u] LT',
                ][this.day()];
            },
            sameElse: 'L',
        },
        relativeTime: {
            future: 'za %s',
            past: 'pre %s',
            s: 'nekoliko sekundi',
            ss: nd.translate,
            m: nd.translate,
            mm: nd.translate,
            h: nd.translate,
            hh: nd.translate,
            d: 'dan',
            dd: nd.translate,
            M: 'mesec',
            MM: nd.translate,
            y: 'godinu',
            yy: nd.translate,
        },
        dayOfMonthOrdinalParse: /\d{1,2}\./,
        ordinal: '%d.',
        week: { dow: 1, doy: 7 },
    }),
        l.defineLocale('ss', {
            months: "Bhimbidvwane_Indlovana_Indlov'lenkhulu_Mabasa_Inkhwekhweti_Inhlaba_Kholwane_Ingci_Inyoni_Imphala_Lweti_Ingongoni".split(
                '_'
            ),
            monthsShort:
                'Bhi_Ina_Inu_Mab_Ink_Inh_Kho_Igc_Iny_Imp_Lwe_Igo'.split('_'),
            weekdays:
                'Lisontfo_Umsombuluko_Lesibili_Lesitsatfu_Lesine_Lesihlanu_Umgcibelo'.split(
                    '_'
                ),
            weekdaysShort: 'Lis_Umb_Lsb_Les_Lsi_Lsh_Umg'.split('_'),
            weekdaysMin: 'Li_Us_Lb_Lt_Ls_Lh_Ug'.split('_'),
            weekdaysParseExact: !0,
            longDateFormat: {
                LT: 'h:mm A',
                LTS: 'h:mm:ss A',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY h:mm A',
                LLLL: 'dddd, D MMMM YYYY h:mm A',
            },
            calendar: {
                sameDay: '[Namuhla nga] LT',
                nextDay: '[Kusasa nga] LT',
                nextWeek: 'dddd [nga] LT',
                lastDay: '[Itolo nga] LT',
                lastWeek: 'dddd [leliphelile] [nga] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: 'nga %s',
                past: 'wenteka nga %s',
                s: 'emizuzwana lomcane',
                ss: '%d mzuzwana',
                m: 'umzuzu',
                mm: '%d emizuzu',
                h: 'lihora',
                hh: '%d emahora',
                d: 'lilanga',
                dd: '%d emalanga',
                M: 'inyanga',
                MM: '%d tinyanga',
                y: 'umnyaka',
                yy: '%d iminyaka',
            },
            meridiemParse: /ekuseni|emini|entsambama|ebusuku/,
            meridiem: function (e, a, t) {
                return e < 11
                    ? 'ekuseni'
                    : e < 15
                    ? 'emini'
                    : e < 19
                    ? 'entsambama'
                    : 'ebusuku';
            },
            meridiemHour: function (e, a) {
                return (
                    12 === e && (e = 0),
                    'ekuseni' === a
                        ? e
                        : 'emini' === a
                        ? 11 <= e
                            ? e
                            : e + 12
                        : 'entsambama' === a || 'ebusuku' === a
                        ? 0 === e
                            ? 0
                            : e + 12
                        : void 0
                );
            },
            dayOfMonthOrdinalParse: /\d{1,2}/,
            ordinal: '%d',
            week: { dow: 1, doy: 4 },
        }),
        l.defineLocale('sv', {
            months: 'januari_februari_mars_april_maj_juni_juli_augusti_september_oktober_november_december'.split(
                '_'
            ),
            monthsShort:
                'jan_feb_mar_apr_maj_jun_jul_aug_sep_okt_nov_dec'.split('_'),
            weekdays:
                's\xf6ndag_m\xe5ndag_tisdag_onsdag_torsdag_fredag_l\xf6rdag'.split(
                    '_'
                ),
            weekdaysShort: 's\xf6n_m\xe5n_tis_ons_tor_fre_l\xf6r'.split('_'),
            weekdaysMin: 's\xf6_m\xe5_ti_on_to_fr_l\xf6'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'YYYY-MM-DD',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY [kl.] HH:mm',
                LLLL: 'dddd D MMMM YYYY [kl.] HH:mm',
                lll: 'D MMM YYYY HH:mm',
                llll: 'ddd D MMM YYYY HH:mm',
            },
            calendar: {
                sameDay: '[Idag] LT',
                nextDay: '[Imorgon] LT',
                lastDay: '[Ig\xe5r] LT',
                nextWeek: '[P\xe5] dddd LT',
                lastWeek: '[I] dddd[s] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: 'om %s',
                past: 'f\xf6r %s sedan',
                s: 'n\xe5gra sekunder',
                ss: '%d sekunder',
                m: 'en minut',
                mm: '%d minuter',
                h: 'en timme',
                hh: '%d timmar',
                d: 'en dag',
                dd: '%d dagar',
                M: 'en m\xe5nad',
                MM: '%d m\xe5nader',
                y: 'ett \xe5r',
                yy: '%d \xe5r',
            },
            dayOfMonthOrdinalParse: /\d{1,2}(e|a)/,
            ordinal: function (e) {
                var a = e % 10;
                return (
                    e +
                    (1 == ~~((e % 100) / 10)
                        ? 'e'
                        : 1 === a
                        ? 'a'
                        : 2 === a
                        ? 'a'
                        : 'e')
                );
            },
            week: { dow: 1, doy: 4 },
        }),
        l.defineLocale('sw', {
            months: 'Januari_Februari_Machi_Aprili_Mei_Juni_Julai_Agosti_Septemba_Oktoba_Novemba_Desemba'.split(
                '_'
            ),
            monthsShort:
                'Jan_Feb_Mac_Apr_Mei_Jun_Jul_Ago_Sep_Okt_Nov_Des'.split('_'),
            weekdays:
                'Jumapili_Jumatatu_Jumanne_Jumatano_Alhamisi_Ijumaa_Jumamosi'.split(
                    '_'
                ),
            weekdaysShort: 'Jpl_Jtat_Jnne_Jtan_Alh_Ijm_Jmos'.split('_'),
            weekdaysMin: 'J2_J3_J4_J5_Al_Ij_J1'.split('_'),
            weekdaysParseExact: !0,
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD.MM.YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd, D MMMM YYYY HH:mm',
            },
            calendar: {
                sameDay: '[leo saa] LT',
                nextDay: '[kesho saa] LT',
                nextWeek: '[wiki ijayo] dddd [saat] LT',
                lastDay: '[jana] LT',
                lastWeek: '[wiki iliyopita] dddd [saat] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: '%s baadaye',
                past: 'tokea %s',
                s: 'hivi punde',
                ss: 'sekunde %d',
                m: 'dakika moja',
                mm: 'dakika %d',
                h: 'saa limoja',
                hh: 'masaa %d',
                d: 'siku moja',
                dd: 'masiku %d',
                M: 'mwezi mmoja',
                MM: 'miezi %d',
                y: 'mwaka mmoja',
                yy: 'miaka %d',
            },
            week: { dow: 1, doy: 7 },
        });
    var dd = {
            1: '\u0be7',
            2: '\u0be8',
            3: '\u0be9',
            4: '\u0bea',
            5: '\u0beb',
            6: '\u0bec',
            7: '\u0bed',
            8: '\u0bee',
            9: '\u0bef',
            0: '\u0be6',
        },
        rd = {
            '\u0be7': '1',
            '\u0be8': '2',
            '\u0be9': '3',
            '\u0bea': '4',
            '\u0beb': '5',
            '\u0bec': '6',
            '\u0bed': '7',
            '\u0bee': '8',
            '\u0bef': '9',
            '\u0be6': '0',
        };
    l.defineLocale('ta', {
        months: '\u0b9c\u0ba9\u0bb5\u0bb0\u0bbf_\u0baa\u0bbf\u0baa\u0bcd\u0bb0\u0bb5\u0bb0\u0bbf_\u0bae\u0bbe\u0bb0\u0bcd\u0b9a\u0bcd_\u0b8f\u0baa\u0bcd\u0bb0\u0bb2\u0bcd_\u0bae\u0bc7_\u0b9c\u0bc2\u0ba9\u0bcd_\u0b9c\u0bc2\u0bb2\u0bc8_\u0b86\u0b95\u0bb8\u0bcd\u0b9f\u0bcd_\u0b9a\u0bc6\u0baa\u0bcd\u0b9f\u0bc6\u0bae\u0bcd\u0baa\u0bb0\u0bcd_\u0b85\u0b95\u0bcd\u0b9f\u0bc7\u0bbe\u0baa\u0bb0\u0bcd_\u0ba8\u0bb5\u0bae\u0bcd\u0baa\u0bb0\u0bcd_\u0b9f\u0bbf\u0b9a\u0bae\u0bcd\u0baa\u0bb0\u0bcd'.split(
            '_'
        ),
        monthsShort:
            '\u0b9c\u0ba9\u0bb5\u0bb0\u0bbf_\u0baa\u0bbf\u0baa\u0bcd\u0bb0\u0bb5\u0bb0\u0bbf_\u0bae\u0bbe\u0bb0\u0bcd\u0b9a\u0bcd_\u0b8f\u0baa\u0bcd\u0bb0\u0bb2\u0bcd_\u0bae\u0bc7_\u0b9c\u0bc2\u0ba9\u0bcd_\u0b9c\u0bc2\u0bb2\u0bc8_\u0b86\u0b95\u0bb8\u0bcd\u0b9f\u0bcd_\u0b9a\u0bc6\u0baa\u0bcd\u0b9f\u0bc6\u0bae\u0bcd\u0baa\u0bb0\u0bcd_\u0b85\u0b95\u0bcd\u0b9f\u0bc7\u0bbe\u0baa\u0bb0\u0bcd_\u0ba8\u0bb5\u0bae\u0bcd\u0baa\u0bb0\u0bcd_\u0b9f\u0bbf\u0b9a\u0bae\u0bcd\u0baa\u0bb0\u0bcd'.split(
                '_'
            ),
        weekdays:
            '\u0b9e\u0bbe\u0baf\u0bbf\u0bb1\u0bcd\u0bb1\u0bc1\u0b95\u0bcd\u0b95\u0bbf\u0bb4\u0bae\u0bc8_\u0ba4\u0bbf\u0b99\u0bcd\u0b95\u0b9f\u0bcd\u0b95\u0bbf\u0bb4\u0bae\u0bc8_\u0b9a\u0bc6\u0bb5\u0bcd\u0bb5\u0bbe\u0baf\u0bcd\u0b95\u0bbf\u0bb4\u0bae\u0bc8_\u0baa\u0bc1\u0ba4\u0ba9\u0bcd\u0b95\u0bbf\u0bb4\u0bae\u0bc8_\u0bb5\u0bbf\u0baf\u0bbe\u0bb4\u0b95\u0bcd\u0b95\u0bbf\u0bb4\u0bae\u0bc8_\u0bb5\u0bc6\u0bb3\u0bcd\u0bb3\u0bbf\u0b95\u0bcd\u0b95\u0bbf\u0bb4\u0bae\u0bc8_\u0b9a\u0ba9\u0bbf\u0b95\u0bcd\u0b95\u0bbf\u0bb4\u0bae\u0bc8'.split(
                '_'
            ),
        weekdaysShort:
            '\u0b9e\u0bbe\u0baf\u0bbf\u0bb1\u0bc1_\u0ba4\u0bbf\u0b99\u0bcd\u0b95\u0bb3\u0bcd_\u0b9a\u0bc6\u0bb5\u0bcd\u0bb5\u0bbe\u0baf\u0bcd_\u0baa\u0bc1\u0ba4\u0ba9\u0bcd_\u0bb5\u0bbf\u0baf\u0bbe\u0bb4\u0ba9\u0bcd_\u0bb5\u0bc6\u0bb3\u0bcd\u0bb3\u0bbf_\u0b9a\u0ba9\u0bbf'.split(
                '_'
            ),
        weekdaysMin:
            '\u0b9e\u0bbe_\u0ba4\u0bbf_\u0b9a\u0bc6_\u0baa\u0bc1_\u0bb5\u0bbf_\u0bb5\u0bc6_\u0b9a'.split(
                '_'
            ),
        longDateFormat: {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY, HH:mm',
            LLLL: 'dddd, D MMMM YYYY, HH:mm',
        },
        calendar: {
            sameDay: '[\u0b87\u0ba9\u0bcd\u0bb1\u0bc1] LT',
            nextDay: '[\u0ba8\u0bbe\u0bb3\u0bc8] LT',
            nextWeek: 'dddd, LT',
            lastDay: '[\u0ba8\u0bc7\u0bb1\u0bcd\u0bb1\u0bc1] LT',
            lastWeek:
                '[\u0b95\u0b9f\u0ba8\u0bcd\u0ba4 \u0bb5\u0bbe\u0bb0\u0bae\u0bcd] dddd, LT',
            sameElse: 'L',
        },
        relativeTime: {
            future: '%s \u0b87\u0bb2\u0bcd',
            past: '%s \u0bae\u0bc1\u0ba9\u0bcd',
            s: '\u0b92\u0bb0\u0bc1 \u0b9a\u0bbf\u0bb2 \u0bb5\u0bbf\u0ba8\u0bbe\u0b9f\u0bbf\u0b95\u0bb3\u0bcd',
            ss: '%d \u0bb5\u0bbf\u0ba8\u0bbe\u0b9f\u0bbf\u0b95\u0bb3\u0bcd',
            m: '\u0b92\u0bb0\u0bc1 \u0ba8\u0bbf\u0bae\u0bbf\u0b9f\u0bae\u0bcd',
            mm: '%d \u0ba8\u0bbf\u0bae\u0bbf\u0b9f\u0b99\u0bcd\u0b95\u0bb3\u0bcd',
            h: '\u0b92\u0bb0\u0bc1 \u0bae\u0ba3\u0bbf \u0ba8\u0bc7\u0bb0\u0bae\u0bcd',
            hh: '%d \u0bae\u0ba3\u0bbf \u0ba8\u0bc7\u0bb0\u0bae\u0bcd',
            d: '\u0b92\u0bb0\u0bc1 \u0ba8\u0bbe\u0bb3\u0bcd',
            dd: '%d \u0ba8\u0bbe\u0b9f\u0bcd\u0b95\u0bb3\u0bcd',
            M: '\u0b92\u0bb0\u0bc1 \u0bae\u0bbe\u0ba4\u0bae\u0bcd',
            MM: '%d \u0bae\u0bbe\u0ba4\u0b99\u0bcd\u0b95\u0bb3\u0bcd',
            y: '\u0b92\u0bb0\u0bc1 \u0bb5\u0bb0\u0bc1\u0b9f\u0bae\u0bcd',
            yy: '%d \u0b86\u0ba3\u0bcd\u0b9f\u0bc1\u0b95\u0bb3\u0bcd',
        },
        dayOfMonthOrdinalParse: /\d{1,2}\u0bb5\u0ba4\u0bc1/,
        ordinal: function (e) {
            return e + '\u0bb5\u0ba4\u0bc1';
        },
        preparse: function (e) {
            return e.replace(
                /[\u0be7\u0be8\u0be9\u0bea\u0beb\u0bec\u0bed\u0bee\u0bef\u0be6]/g,
                function (e) {
                    return rd[e];
                }
            );
        },
        postformat: function (e) {
            return e.replace(/\d/g, function (e) {
                return dd[e];
            });
        },
        meridiemParse:
            /\u0baf\u0bbe\u0bae\u0bae\u0bcd|\u0bb5\u0bc8\u0b95\u0bb1\u0bc8|\u0b95\u0bbe\u0bb2\u0bc8|\u0ba8\u0ba3\u0bcd\u0baa\u0b95\u0bb2\u0bcd|\u0b8e\u0bb1\u0bcd\u0baa\u0bbe\u0b9f\u0bc1|\u0bae\u0bbe\u0bb2\u0bc8/,
        meridiem: function (e, a, t) {
            return e < 2
                ? ' \u0baf\u0bbe\u0bae\u0bae\u0bcd'
                : e < 6
                ? ' \u0bb5\u0bc8\u0b95\u0bb1\u0bc8'
                : e < 10
                ? ' \u0b95\u0bbe\u0bb2\u0bc8'
                : e < 14
                ? ' \u0ba8\u0ba3\u0bcd\u0baa\u0b95\u0bb2\u0bcd'
                : e < 18
                ? ' \u0b8e\u0bb1\u0bcd\u0baa\u0bbe\u0b9f\u0bc1'
                : e < 22
                ? ' \u0bae\u0bbe\u0bb2\u0bc8'
                : ' \u0baf\u0bbe\u0bae\u0bae\u0bcd';
        },
        meridiemHour: function (e, a) {
            return (
                12 === e && (e = 0),
                '\u0baf\u0bbe\u0bae\u0bae\u0bcd' === a
                    ? e < 2
                        ? e
                        : e + 12
                    : '\u0bb5\u0bc8\u0b95\u0bb1\u0bc8' === a ||
                      '\u0b95\u0bbe\u0bb2\u0bc8' === a
                    ? e
                    : '\u0ba8\u0ba3\u0bcd\u0baa\u0b95\u0bb2\u0bcd' === a &&
                      10 <= e
                    ? e
                    : e + 12
            );
        },
        week: { dow: 0, doy: 6 },
    }),
        l.defineLocale('te', {
            months: '\u0c1c\u0c28\u0c35\u0c30\u0c3f_\u0c2b\u0c3f\u0c2c\u0c4d\u0c30\u0c35\u0c30\u0c3f_\u0c2e\u0c3e\u0c30\u0c4d\u0c1a\u0c3f_\u0c0f\u0c2a\u0c4d\u0c30\u0c3f\u0c32\u0c4d_\u0c2e\u0c47_\u0c1c\u0c42\u0c28\u0c4d_\u0c1c\u0c41\u0c32\u0c48_\u0c06\u0c17\u0c38\u0c4d\u0c1f\u0c41_\u0c38\u0c46\u0c2a\u0c4d\u0c1f\u0c46\u0c02\u0c2c\u0c30\u0c4d_\u0c05\u0c15\u0c4d\u0c1f\u0c4b\u0c2c\u0c30\u0c4d_\u0c28\u0c35\u0c02\u0c2c\u0c30\u0c4d_\u0c21\u0c3f\u0c38\u0c46\u0c02\u0c2c\u0c30\u0c4d'.split(
                '_'
            ),
            monthsShort:
                '\u0c1c\u0c28._\u0c2b\u0c3f\u0c2c\u0c4d\u0c30._\u0c2e\u0c3e\u0c30\u0c4d\u0c1a\u0c3f_\u0c0f\u0c2a\u0c4d\u0c30\u0c3f._\u0c2e\u0c47_\u0c1c\u0c42\u0c28\u0c4d_\u0c1c\u0c41\u0c32\u0c48_\u0c06\u0c17._\u0c38\u0c46\u0c2a\u0c4d._\u0c05\u0c15\u0c4d\u0c1f\u0c4b._\u0c28\u0c35._\u0c21\u0c3f\u0c38\u0c46.'.split(
                    '_'
                ),
            monthsParseExact: !0,
            weekdays:
                '\u0c06\u0c26\u0c3f\u0c35\u0c3e\u0c30\u0c02_\u0c38\u0c4b\u0c2e\u0c35\u0c3e\u0c30\u0c02_\u0c2e\u0c02\u0c17\u0c33\u0c35\u0c3e\u0c30\u0c02_\u0c2c\u0c41\u0c27\u0c35\u0c3e\u0c30\u0c02_\u0c17\u0c41\u0c30\u0c41\u0c35\u0c3e\u0c30\u0c02_\u0c36\u0c41\u0c15\u0c4d\u0c30\u0c35\u0c3e\u0c30\u0c02_\u0c36\u0c28\u0c3f\u0c35\u0c3e\u0c30\u0c02'.split(
                    '_'
                ),
            weekdaysShort:
                '\u0c06\u0c26\u0c3f_\u0c38\u0c4b\u0c2e_\u0c2e\u0c02\u0c17\u0c33_\u0c2c\u0c41\u0c27_\u0c17\u0c41\u0c30\u0c41_\u0c36\u0c41\u0c15\u0c4d\u0c30_\u0c36\u0c28\u0c3f'.split(
                    '_'
                ),
            weekdaysMin:
                '\u0c06_\u0c38\u0c4b_\u0c2e\u0c02_\u0c2c\u0c41_\u0c17\u0c41_\u0c36\u0c41_\u0c36'.split(
                    '_'
                ),
            longDateFormat: {
                LT: 'A h:mm',
                LTS: 'A h:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY, A h:mm',
                LLLL: 'dddd, D MMMM YYYY, A h:mm',
            },
            calendar: {
                sameDay: '[\u0c28\u0c47\u0c21\u0c41] LT',
                nextDay: '[\u0c30\u0c47\u0c2a\u0c41] LT',
                nextWeek: 'dddd, LT',
                lastDay: '[\u0c28\u0c3f\u0c28\u0c4d\u0c28] LT',
                lastWeek: '[\u0c17\u0c24] dddd, LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: '%s \u0c32\u0c4b',
                past: '%s \u0c15\u0c4d\u0c30\u0c3f\u0c24\u0c02',
                s: '\u0c15\u0c4a\u0c28\u0c4d\u0c28\u0c3f \u0c15\u0c4d\u0c37\u0c23\u0c3e\u0c32\u0c41',
                ss: '%d \u0c38\u0c46\u0c15\u0c28\u0c4d\u0c32\u0c41',
                m: '\u0c12\u0c15 \u0c28\u0c3f\u0c2e\u0c3f\u0c37\u0c02',
                mm: '%d \u0c28\u0c3f\u0c2e\u0c3f\u0c37\u0c3e\u0c32\u0c41',
                h: '\u0c12\u0c15 \u0c17\u0c02\u0c1f',
                hh: '%d \u0c17\u0c02\u0c1f\u0c32\u0c41',
                d: '\u0c12\u0c15 \u0c30\u0c4b\u0c1c\u0c41',
                dd: '%d \u0c30\u0c4b\u0c1c\u0c41\u0c32\u0c41',
                M: '\u0c12\u0c15 \u0c28\u0c46\u0c32',
                MM: '%d \u0c28\u0c46\u0c32\u0c32\u0c41',
                y: '\u0c12\u0c15 \u0c38\u0c02\u0c35\u0c24\u0c4d\u0c38\u0c30\u0c02',
                yy: '%d \u0c38\u0c02\u0c35\u0c24\u0c4d\u0c38\u0c30\u0c3e\u0c32\u0c41',
            },
            dayOfMonthOrdinalParse: /\d{1,2}\u0c35/,
            ordinal: '%d\u0c35',
            meridiemParse:
                /\u0c30\u0c3e\u0c24\u0c4d\u0c30\u0c3f|\u0c09\u0c26\u0c2f\u0c02|\u0c2e\u0c27\u0c4d\u0c2f\u0c3e\u0c39\u0c4d\u0c28\u0c02|\u0c38\u0c3e\u0c2f\u0c02\u0c24\u0c4d\u0c30\u0c02/,
            meridiemHour: function (e, a) {
                return (
                    12 === e && (e = 0),
                    '\u0c30\u0c3e\u0c24\u0c4d\u0c30\u0c3f' === a
                        ? e < 4
                            ? e
                            : e + 12
                        : '\u0c09\u0c26\u0c2f\u0c02' === a
                        ? e
                        : '\u0c2e\u0c27\u0c4d\u0c2f\u0c3e\u0c39\u0c4d\u0c28\u0c02' ===
                          a
                        ? 10 <= e
                            ? e
                            : e + 12
                        : '\u0c38\u0c3e\u0c2f\u0c02\u0c24\u0c4d\u0c30\u0c02' ===
                          a
                        ? e + 12
                        : void 0
                );
            },
            meridiem: function (e, a, t) {
                return e < 4
                    ? '\u0c30\u0c3e\u0c24\u0c4d\u0c30\u0c3f'
                    : e < 10
                    ? '\u0c09\u0c26\u0c2f\u0c02'
                    : e < 17
                    ? '\u0c2e\u0c27\u0c4d\u0c2f\u0c3e\u0c39\u0c4d\u0c28\u0c02'
                    : e < 20
                    ? '\u0c38\u0c3e\u0c2f\u0c02\u0c24\u0c4d\u0c30\u0c02'
                    : '\u0c30\u0c3e\u0c24\u0c4d\u0c30\u0c3f';
            },
            week: { dow: 0, doy: 6 },
        }),
        l.defineLocale('tet', {
            months: 'Janeiru_Fevereiru_Marsu_Abril_Maiu_Ju\xf1u_Jullu_Agustu_Setembru_Outubru_Novembru_Dezembru'.split(
                '_'
            ),
            monthsShort:
                'Jan_Fev_Mar_Abr_Mai_Jun_Jul_Ago_Set_Out_Nov_Dez'.split('_'),
            weekdays: 'Domingu_Segunda_Tersa_Kuarta_Kinta_Sesta_Sabadu'.split(
                '_'
            ),
            weekdaysShort: 'Dom_Seg_Ters_Kua_Kint_Sest_Sab'.split('_'),
            weekdaysMin: 'Do_Seg_Te_Ku_Ki_Ses_Sa'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd, D MMMM YYYY HH:mm',
            },
            calendar: {
                sameDay: '[Ohin iha] LT',
                nextDay: '[Aban iha] LT',
                nextWeek: 'dddd [iha] LT',
                lastDay: '[Horiseik iha] LT',
                lastWeek: 'dddd [semana kotuk] [iha] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: 'iha %s',
                past: '%s liuba',
                s: 'minutu balun',
                ss: 'minutu %d',
                m: 'minutu ida',
                mm: 'minutu %d',
                h: 'oras ida',
                hh: 'oras %d',
                d: 'loron ida',
                dd: 'loron %d',
                M: 'fulan ida',
                MM: 'fulan %d',
                y: 'tinan ida',
                yy: 'tinan %d',
            },
            dayOfMonthOrdinalParse: /\d{1,2}(st|nd|rd|th)/,
            ordinal: function (e) {
                var a = e % 10;
                return (
                    e +
                    (1 == ~~((e % 100) / 10)
                        ? 'th'
                        : 1 === a
                        ? 'st'
                        : 2 === a
                        ? 'nd'
                        : 3 === a
                        ? 'rd'
                        : 'th')
                );
            },
            week: { dow: 1, doy: 4 },
        });
    var _d = {
        0: '-\u0443\u043c',
        1: '-\u0443\u043c',
        2: '-\u044e\u043c',
        3: '-\u044e\u043c',
        4: '-\u0443\u043c',
        5: '-\u0443\u043c',
        6: '-\u0443\u043c',
        7: '-\u0443\u043c',
        8: '-\u0443\u043c',
        9: '-\u0443\u043c',
        10: '-\u0443\u043c',
        12: '-\u0443\u043c',
        13: '-\u0443\u043c',
        20: '-\u0443\u043c',
        30: '-\u044e\u043c',
        40: '-\u0443\u043c',
        50: '-\u0443\u043c',
        60: '-\u0443\u043c',
        70: '-\u0443\u043c',
        80: '-\u0443\u043c',
        90: '-\u0443\u043c',
        100: '-\u0443\u043c',
    };
    l.defineLocale('tg', {
        months: '\u044f\u043d\u0432\u0430\u0440_\u0444\u0435\u0432\u0440\u0430\u043b_\u043c\u0430\u0440\u0442_\u0430\u043f\u0440\u0435\u043b_\u043c\u0430\u0439_\u0438\u044e\u043d_\u0438\u044e\u043b_\u0430\u0432\u0433\u0443\u0441\u0442_\u0441\u0435\u043d\u0442\u044f\u0431\u0440_\u043e\u043a\u0442\u044f\u0431\u0440_\u043d\u043e\u044f\u0431\u0440_\u0434\u0435\u043a\u0430\u0431\u0440'.split(
            '_'
        ),
        monthsShort:
            '\u044f\u043d\u0432_\u0444\u0435\u0432_\u043c\u0430\u0440_\u0430\u043f\u0440_\u043c\u0430\u0439_\u0438\u044e\u043d_\u0438\u044e\u043b_\u0430\u0432\u0433_\u0441\u0435\u043d_\u043e\u043a\u0442_\u043d\u043e\u044f_\u0434\u0435\u043a'.split(
                '_'
            ),
        weekdays:
            '\u044f\u043a\u0448\u0430\u043d\u0431\u0435_\u0434\u0443\u0448\u0430\u043d\u0431\u0435_\u0441\u0435\u0448\u0430\u043d\u0431\u0435_\u0447\u043e\u0440\u0448\u0430\u043d\u0431\u0435_\u043f\u0430\u043d\u04b7\u0448\u0430\u043d\u0431\u0435_\u04b7\u0443\u043c\u044a\u0430_\u0448\u0430\u043d\u0431\u0435'.split(
                '_'
            ),
        weekdaysShort:
            '\u044f\u0448\u0431_\u0434\u0448\u0431_\u0441\u0448\u0431_\u0447\u0448\u0431_\u043f\u0448\u0431_\u04b7\u0443\u043c_\u0448\u043d\u0431'.split(
                '_'
            ),
        weekdaysMin:
            '\u044f\u0448_\u0434\u0448_\u0441\u0448_\u0447\u0448_\u043f\u0448_\u04b7\u043c_\u0448\u0431'.split(
                '_'
            ),
        longDateFormat: {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY HH:mm',
            LLLL: 'dddd, D MMMM YYYY HH:mm',
        },
        calendar: {
            sameDay:
                '[\u0418\u043c\u0440\u04ef\u0437 \u0441\u043e\u0430\u0442\u0438] LT',
            nextDay:
                '[\u041f\u0430\u0433\u043e\u04b3 \u0441\u043e\u0430\u0442\u0438] LT',
            lastDay:
                '[\u0414\u0438\u0440\u04ef\u0437 \u0441\u043e\u0430\u0442\u0438] LT',
            nextWeek:
                'dddd[\u0438] [\u04b3\u0430\u0444\u0442\u0430\u0438 \u043e\u044f\u043d\u0434\u0430 \u0441\u043e\u0430\u0442\u0438] LT',
            lastWeek:
                'dddd[\u0438] [\u04b3\u0430\u0444\u0442\u0430\u0438 \u0433\u0443\u0437\u0430\u0448\u0442\u0430 \u0441\u043e\u0430\u0442\u0438] LT',
            sameElse: 'L',
        },
        relativeTime: {
            future: '\u0431\u0430\u044a\u0434\u0438 %s',
            past: '%s \u043f\u0435\u0448',
            s: '\u044f\u043a\u0447\u0430\u043d\u0434 \u0441\u043e\u043d\u0438\u044f',
            m: '\u044f\u043a \u0434\u0430\u049b\u0438\u049b\u0430',
            mm: '%d \u0434\u0430\u049b\u0438\u049b\u0430',
            h: '\u044f\u043a \u0441\u043e\u0430\u0442',
            hh: '%d \u0441\u043e\u0430\u0442',
            d: '\u044f\u043a \u0440\u04ef\u0437',
            dd: '%d \u0440\u04ef\u0437',
            M: '\u044f\u043a \u043c\u043e\u04b3',
            MM: '%d \u043c\u043e\u04b3',
            y: '\u044f\u043a \u0441\u043e\u043b',
            yy: '%d \u0441\u043e\u043b',
        },
        meridiemParse:
            /\u0448\u0430\u0431|\u0441\u0443\u0431\u04b3|\u0440\u04ef\u0437|\u0431\u0435\u0433\u043e\u04b3/,
        meridiemHour: function (e, a) {
            return (
                12 === e && (e = 0),
                '\u0448\u0430\u0431' === a
                    ? e < 4
                        ? e
                        : e + 12
                    : '\u0441\u0443\u0431\u04b3' === a
                    ? e
                    : '\u0440\u04ef\u0437' === a
                    ? 11 <= e
                        ? e
                        : e + 12
                    : '\u0431\u0435\u0433\u043e\u04b3' === a
                    ? e + 12
                    : void 0
            );
        },
        meridiem: function (e, a, t) {
            return e < 4
                ? '\u0448\u0430\u0431'
                : e < 11
                ? '\u0441\u0443\u0431\u04b3'
                : e < 16
                ? '\u0440\u04ef\u0437'
                : e < 19
                ? '\u0431\u0435\u0433\u043e\u04b3'
                : '\u0448\u0430\u0431';
        },
        dayOfMonthOrdinalParse: /\d{1,2}-(\u0443\u043c|\u044e\u043c)/,
        ordinal: function (e) {
            return e + (_d[e] || _d[e % 10] || _d[100 <= e ? 100 : null]);
        },
        week: { dow: 1, doy: 7 },
    }),
        l.defineLocale('th', {
            months: '\u0e21\u0e01\u0e23\u0e32\u0e04\u0e21_\u0e01\u0e38\u0e21\u0e20\u0e32\u0e1e\u0e31\u0e19\u0e18\u0e4c_\u0e21\u0e35\u0e19\u0e32\u0e04\u0e21_\u0e40\u0e21\u0e29\u0e32\u0e22\u0e19_\u0e1e\u0e24\u0e29\u0e20\u0e32\u0e04\u0e21_\u0e21\u0e34\u0e16\u0e38\u0e19\u0e32\u0e22\u0e19_\u0e01\u0e23\u0e01\u0e0e\u0e32\u0e04\u0e21_\u0e2a\u0e34\u0e07\u0e2b\u0e32\u0e04\u0e21_\u0e01\u0e31\u0e19\u0e22\u0e32\u0e22\u0e19_\u0e15\u0e38\u0e25\u0e32\u0e04\u0e21_\u0e1e\u0e24\u0e28\u0e08\u0e34\u0e01\u0e32\u0e22\u0e19_\u0e18\u0e31\u0e19\u0e27\u0e32\u0e04\u0e21'.split(
                '_'
            ),
            monthsShort:
                '\u0e21.\u0e04._\u0e01.\u0e1e._\u0e21\u0e35.\u0e04._\u0e40\u0e21.\u0e22._\u0e1e.\u0e04._\u0e21\u0e34.\u0e22._\u0e01.\u0e04._\u0e2a.\u0e04._\u0e01.\u0e22._\u0e15.\u0e04._\u0e1e.\u0e22._\u0e18.\u0e04.'.split(
                    '_'
                ),
            monthsParseExact: !0,
            weekdays:
                '\u0e2d\u0e32\u0e17\u0e34\u0e15\u0e22\u0e4c_\u0e08\u0e31\u0e19\u0e17\u0e23\u0e4c_\u0e2d\u0e31\u0e07\u0e04\u0e32\u0e23_\u0e1e\u0e38\u0e18_\u0e1e\u0e24\u0e2b\u0e31\u0e2a\u0e1a\u0e14\u0e35_\u0e28\u0e38\u0e01\u0e23\u0e4c_\u0e40\u0e2a\u0e32\u0e23\u0e4c'.split(
                    '_'
                ),
            weekdaysShort:
                '\u0e2d\u0e32\u0e17\u0e34\u0e15\u0e22\u0e4c_\u0e08\u0e31\u0e19\u0e17\u0e23\u0e4c_\u0e2d\u0e31\u0e07\u0e04\u0e32\u0e23_\u0e1e\u0e38\u0e18_\u0e1e\u0e24\u0e2b\u0e31\u0e2a_\u0e28\u0e38\u0e01\u0e23\u0e4c_\u0e40\u0e2a\u0e32\u0e23\u0e4c'.split(
                    '_'
                ),
            weekdaysMin:
                '\u0e2d\u0e32._\u0e08._\u0e2d._\u0e1e._\u0e1e\u0e24._\u0e28._\u0e2a.'.split(
                    '_'
                ),
            weekdaysParseExact: !0,
            longDateFormat: {
                LT: 'H:mm',
                LTS: 'H:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY \u0e40\u0e27\u0e25\u0e32 H:mm',
                LLLL: '\u0e27\u0e31\u0e19dddd\u0e17\u0e35\u0e48 D MMMM YYYY \u0e40\u0e27\u0e25\u0e32 H:mm',
            },
            meridiemParse:
                /\u0e01\u0e48\u0e2d\u0e19\u0e40\u0e17\u0e35\u0e48\u0e22\u0e07|\u0e2b\u0e25\u0e31\u0e07\u0e40\u0e17\u0e35\u0e48\u0e22\u0e07/,
            isPM: function (e) {
                return (
                    '\u0e2b\u0e25\u0e31\u0e07\u0e40\u0e17\u0e35\u0e48\u0e22\u0e07' ===
                    e
                );
            },
            meridiem: function (e, a, t) {
                return e < 12
                    ? '\u0e01\u0e48\u0e2d\u0e19\u0e40\u0e17\u0e35\u0e48\u0e22\u0e07'
                    : '\u0e2b\u0e25\u0e31\u0e07\u0e40\u0e17\u0e35\u0e48\u0e22\u0e07';
            },
            calendar: {
                sameDay:
                    '[\u0e27\u0e31\u0e19\u0e19\u0e35\u0e49 \u0e40\u0e27\u0e25\u0e32] LT',
                nextDay:
                    '[\u0e1e\u0e23\u0e38\u0e48\u0e07\u0e19\u0e35\u0e49 \u0e40\u0e27\u0e25\u0e32] LT',
                nextWeek:
                    'dddd[\u0e2b\u0e19\u0e49\u0e32 \u0e40\u0e27\u0e25\u0e32] LT',
                lastDay:
                    '[\u0e40\u0e21\u0e37\u0e48\u0e2d\u0e27\u0e32\u0e19\u0e19\u0e35\u0e49 \u0e40\u0e27\u0e25\u0e32] LT',
                lastWeek:
                    '[\u0e27\u0e31\u0e19]dddd[\u0e17\u0e35\u0e48\u0e41\u0e25\u0e49\u0e27 \u0e40\u0e27\u0e25\u0e32] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: '\u0e2d\u0e35\u0e01 %s',
                past: '%s\u0e17\u0e35\u0e48\u0e41\u0e25\u0e49\u0e27',
                s: '\u0e44\u0e21\u0e48\u0e01\u0e35\u0e48\u0e27\u0e34\u0e19\u0e32\u0e17\u0e35',
                ss: '%d \u0e27\u0e34\u0e19\u0e32\u0e17\u0e35',
                m: '1 \u0e19\u0e32\u0e17\u0e35',
                mm: '%d \u0e19\u0e32\u0e17\u0e35',
                h: '1 \u0e0a\u0e31\u0e48\u0e27\u0e42\u0e21\u0e07',
                hh: '%d \u0e0a\u0e31\u0e48\u0e27\u0e42\u0e21\u0e07',
                d: '1 \u0e27\u0e31\u0e19',
                dd: '%d \u0e27\u0e31\u0e19',
                M: '1 \u0e40\u0e14\u0e37\u0e2d\u0e19',
                MM: '%d \u0e40\u0e14\u0e37\u0e2d\u0e19',
                y: '1 \u0e1b\u0e35',
                yy: '%d \u0e1b\u0e35',
            },
        }),
        l.defineLocale('tl-ph', {
            months: 'Enero_Pebrero_Marso_Abril_Mayo_Hunyo_Hulyo_Agosto_Setyembre_Oktubre_Nobyembre_Disyembre'.split(
                '_'
            ),
            monthsShort:
                'Ene_Peb_Mar_Abr_May_Hun_Hul_Ago_Set_Okt_Nob_Dis'.split('_'),
            weekdays:
                'Linggo_Lunes_Martes_Miyerkules_Huwebes_Biyernes_Sabado'.split(
                    '_'
                ),
            weekdaysShort: 'Lin_Lun_Mar_Miy_Huw_Biy_Sab'.split('_'),
            weekdaysMin: 'Li_Lu_Ma_Mi_Hu_Bi_Sab'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'MM/D/YYYY',
                LL: 'MMMM D, YYYY',
                LLL: 'MMMM D, YYYY HH:mm',
                LLLL: 'dddd, MMMM DD, YYYY HH:mm',
            },
            calendar: {
                sameDay: 'LT [ngayong araw]',
                nextDay: '[Bukas ng] LT',
                nextWeek: 'LT [sa susunod na] dddd',
                lastDay: 'LT [kahapon]',
                lastWeek: 'LT [noong nakaraang] dddd',
                sameElse: 'L',
            },
            relativeTime: {
                future: 'sa loob ng %s',
                past: '%s ang nakalipas',
                s: 'ilang segundo',
                ss: '%d segundo',
                m: 'isang minuto',
                mm: '%d minuto',
                h: 'isang oras',
                hh: '%d oras',
                d: 'isang araw',
                dd: '%d araw',
                M: 'isang buwan',
                MM: '%d buwan',
                y: 'isang taon',
                yy: '%d taon',
            },
            dayOfMonthOrdinalParse: /\d{1,2}/,
            ordinal: function (e) {
                return e;
            },
            week: { dow: 1, doy: 4 },
        });
    var id = 'pagh_wa\u2019_cha\u2019_wej_loS_vagh_jav_Soch_chorgh_Hut'.split(
        '_'
    );
    function od(e, a, t, s) {
        var n = (function (e) {
            var a = Math.floor((e % 1e3) / 100),
                t = Math.floor((e % 100) / 10),
                s = e % 10,
                n = '';
            0 < a && (n += id[a] + 'vatlh');
            0 < t && (n += ('' !== n ? ' ' : '') + id[t] + 'maH');
            0 < s && (n += ('' !== n ? ' ' : '') + id[s]);
            return '' === n ? 'pagh' : n;
        })(e);
        switch (t) {
            case 'ss':
                return n + ' lup';
            case 'mm':
                return n + ' tup';
            case 'hh':
                return n + ' rep';
            case 'dd':
                return n + ' jaj';
            case 'MM':
                return n + ' jar';
            case 'yy':
                return n + ' DIS';
        }
    }
    l.defineLocale('tlh', {
        months: 'tera\u2019 jar wa\u2019_tera\u2019 jar cha\u2019_tera\u2019 jar wej_tera\u2019 jar loS_tera\u2019 jar vagh_tera\u2019 jar jav_tera\u2019 jar Soch_tera\u2019 jar chorgh_tera\u2019 jar Hut_tera\u2019 jar wa\u2019maH_tera\u2019 jar wa\u2019maH wa\u2019_tera\u2019 jar wa\u2019maH cha\u2019'.split(
            '_'
        ),
        monthsShort:
            'jar wa\u2019_jar cha\u2019_jar wej_jar loS_jar vagh_jar jav_jar Soch_jar chorgh_jar Hut_jar wa\u2019maH_jar wa\u2019maH wa\u2019_jar wa\u2019maH cha\u2019'.split(
                '_'
            ),
        monthsParseExact: !0,
        weekdays:
            'lojmItjaj_DaSjaj_povjaj_ghItlhjaj_loghjaj_buqjaj_ghInjaj'.split(
                '_'
            ),
        weekdaysShort:
            'lojmItjaj_DaSjaj_povjaj_ghItlhjaj_loghjaj_buqjaj_ghInjaj'.split(
                '_'
            ),
        weekdaysMin:
            'lojmItjaj_DaSjaj_povjaj_ghItlhjaj_loghjaj_buqjaj_ghInjaj'.split(
                '_'
            ),
        longDateFormat: {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L: 'DD.MM.YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY HH:mm',
            LLLL: 'dddd, D MMMM YYYY HH:mm',
        },
        calendar: {
            sameDay: '[DaHjaj] LT',
            nextDay: '[wa\u2019leS] LT',
            nextWeek: 'LLL',
            lastDay: '[wa\u2019Hu\u2019] LT',
            lastWeek: 'LLL',
            sameElse: 'L',
        },
        relativeTime: {
            future: function (e) {
                var a = e;
                return (a =
                    -1 !== e.indexOf('jaj')
                        ? a.slice(0, -3) + 'leS'
                        : -1 !== e.indexOf('jar')
                        ? a.slice(0, -3) + 'waQ'
                        : -1 !== e.indexOf('DIS')
                        ? a.slice(0, -3) + 'nem'
                        : a + ' pIq');
            },
            past: function (e) {
                var a = e;
                return (a =
                    -1 !== e.indexOf('jaj')
                        ? a.slice(0, -3) + 'Hu\u2019'
                        : -1 !== e.indexOf('jar')
                        ? a.slice(0, -3) + 'wen'
                        : -1 !== e.indexOf('DIS')
                        ? a.slice(0, -3) + 'ben'
                        : a + ' ret');
            },
            s: 'puS lup',
            ss: od,
            m: 'wa\u2019 tup',
            mm: od,
            h: 'wa\u2019 rep',
            hh: od,
            d: 'wa\u2019 jaj',
            dd: od,
            M: 'wa\u2019 jar',
            MM: od,
            y: 'wa\u2019 DIS',
            yy: od,
        },
        dayOfMonthOrdinalParse: /\d{1,2}\./,
        ordinal: '%d.',
        week: { dow: 1, doy: 4 },
    });
    var md = {
        1: "'inci",
        5: "'inci",
        8: "'inci",
        70: "'inci",
        80: "'inci",
        2: "'nci",
        7: "'nci",
        20: "'nci",
        50: "'nci",
        3: "'\xfcnc\xfc",
        4: "'\xfcnc\xfc",
        100: "'\xfcnc\xfc",
        6: "'nc\u0131",
        9: "'uncu",
        10: "'uncu",
        30: "'uncu",
        60: "'\u0131nc\u0131",
        90: "'\u0131nc\u0131",
    };
    function ud(e, a, t, s) {
        var n = {
            s: ['viensas secunds', "'iensas secunds"],
            ss: [e + ' secunds', e + ' secunds'],
            m: ["'n m\xedut", "'iens m\xedut"],
            mm: [e + ' m\xeduts', e + ' m\xeduts'],
            h: ["'n \xfeora", "'iensa \xfeora"],
            hh: [e + ' \xfeoras', e + ' \xfeoras'],
            d: ["'n ziua", "'iensa ziua"],
            dd: [e + ' ziuas', e + ' ziuas'],
            M: ["'n mes", "'iens mes"],
            MM: [e + ' mesen', e + ' mesen'],
            y: ["'n ar", "'iens ar"],
            yy: [e + ' ars', e + ' ars'],
        };
        return s ? n[t][0] : a ? n[t][0] : n[t][1];
    }
    function ld(e, a, t) {
        var s, n;
        return 'm' === t
            ? a
                ? '\u0445\u0432\u0438\u043b\u0438\u043d\u0430'
                : '\u0445\u0432\u0438\u043b\u0438\u043d\u0443'
            : 'h' === t
            ? a
                ? '\u0433\u043e\u0434\u0438\u043d\u0430'
                : '\u0433\u043e\u0434\u0438\u043d\u0443'
            : e +
              ' ' +
              ((s = +e),
              (n = {
                  ss: a
                      ? '\u0441\u0435\u043a\u0443\u043d\u0434\u0430_\u0441\u0435\u043a\u0443\u043d\u0434\u0438_\u0441\u0435\u043a\u0443\u043d\u0434'
                      : '\u0441\u0435\u043a\u0443\u043d\u0434\u0443_\u0441\u0435\u043a\u0443\u043d\u0434\u0438_\u0441\u0435\u043a\u0443\u043d\u0434',
                  mm: a
                      ? '\u0445\u0432\u0438\u043b\u0438\u043d\u0430_\u0445\u0432\u0438\u043b\u0438\u043d\u0438_\u0445\u0432\u0438\u043b\u0438\u043d'
                      : '\u0445\u0432\u0438\u043b\u0438\u043d\u0443_\u0445\u0432\u0438\u043b\u0438\u043d\u0438_\u0445\u0432\u0438\u043b\u0438\u043d',
                  hh: a
                      ? '\u0433\u043e\u0434\u0438\u043d\u0430_\u0433\u043e\u0434\u0438\u043d\u0438_\u0433\u043e\u0434\u0438\u043d'
                      : '\u0433\u043e\u0434\u0438\u043d\u0443_\u0433\u043e\u0434\u0438\u043d\u0438_\u0433\u043e\u0434\u0438\u043d',
                  dd: '\u0434\u0435\u043d\u044c_\u0434\u043d\u0456_\u0434\u043d\u0456\u0432',
                  MM: '\u043c\u0456\u0441\u044f\u0446\u044c_\u043c\u0456\u0441\u044f\u0446\u0456_\u043c\u0456\u0441\u044f\u0446\u0456\u0432',
                  yy: '\u0440\u0456\u043a_\u0440\u043e\u043a\u0438_\u0440\u043e\u043a\u0456\u0432',
              }[t].split('_')),
              s % 10 == 1 && s % 100 != 11
                  ? n[0]
                  : 2 <= s % 10 &&
                    s % 10 <= 4 &&
                    (s % 100 < 10 || 20 <= s % 100)
                  ? n[1]
                  : n[2]);
    }
    function Md(e) {
        return function () {
            return (
                e + '\u043e' + (11 === this.hours() ? '\u0431' : '') + '] LT'
            );
        };
    }
    l.defineLocale('tr', {
        months: 'Ocak_\u015eubat_Mart_Nisan_May\u0131s_Haziran_Temmuz_A\u011fustos_Eyl\xfcl_Ekim_Kas\u0131m_Aral\u0131k'.split(
            '_'
        ),
        monthsShort:
            'Oca_\u015eub_Mar_Nis_May_Haz_Tem_A\u011fu_Eyl_Eki_Kas_Ara'.split(
                '_'
            ),
        weekdays:
            'Pazar_Pazartesi_Sal\u0131_\xc7ar\u015famba_Per\u015fembe_Cuma_Cumartesi'.split(
                '_'
            ),
        weekdaysShort: 'Paz_Pts_Sal_\xc7ar_Per_Cum_Cts'.split('_'),
        weekdaysMin: 'Pz_Pt_Sa_\xc7a_Pe_Cu_Ct'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L: 'DD.MM.YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY HH:mm',
            LLLL: 'dddd, D MMMM YYYY HH:mm',
        },
        calendar: {
            sameDay: '[bug\xfcn saat] LT',
            nextDay: '[yar\u0131n saat] LT',
            nextWeek: '[gelecek] dddd [saat] LT',
            lastDay: '[d\xfcn] LT',
            lastWeek: '[ge\xe7en] dddd [saat] LT',
            sameElse: 'L',
        },
        relativeTime: {
            future: '%s sonra',
            past: '%s \xf6nce',
            s: 'birka\xe7 saniye',
            ss: '%d saniye',
            m: 'bir dakika',
            mm: '%d dakika',
            h: 'bir saat',
            hh: '%d saat',
            d: 'bir g\xfcn',
            dd: '%d g\xfcn',
            M: 'bir ay',
            MM: '%d ay',
            y: 'bir y\u0131l',
            yy: '%d y\u0131l',
        },
        ordinal: function (e, a) {
            switch (a) {
                case 'd':
                case 'D':
                case 'Do':
                case 'DD':
                    return e;
                default:
                    if (0 === e) return e + "'\u0131nc\u0131";
                    var t = e % 10;
                    return (
                        e +
                        (md[t] ||
                            md[(e % 100) - t] ||
                            md[100 <= e ? 100 : null])
                    );
            }
        },
        week: { dow: 1, doy: 7 },
    }),
        l.defineLocale('tzl', {
            months: 'Januar_Fevraglh_Mar\xe7_Avr\xefu_Mai_G\xfcn_Julia_Guscht_Setemvar_Listop\xe4ts_Noemvar_Zecemvar'.split(
                '_'
            ),
            monthsShort:
                'Jan_Fev_Mar_Avr_Mai_G\xfcn_Jul_Gus_Set_Lis_Noe_Zec'.split('_'),
            weekdays:
                'S\xfaladi_L\xfane\xe7i_Maitzi_M\xe1rcuri_Xh\xfaadi_Vi\xe9ner\xe7i_S\xe1turi'.split(
                    '_'
                ),
            weekdaysShort:
                'S\xfal_L\xfan_Mai_M\xe1r_Xh\xfa_Vi\xe9_S\xe1t'.split('_'),
            weekdaysMin: 'S\xfa_L\xfa_Ma_M\xe1_Xh_Vi_S\xe1'.split('_'),
            longDateFormat: {
                LT: 'HH.mm',
                LTS: 'HH.mm.ss',
                L: 'DD.MM.YYYY',
                LL: 'D. MMMM [dallas] YYYY',
                LLL: 'D. MMMM [dallas] YYYY HH.mm',
                LLLL: 'dddd, [li] D. MMMM [dallas] YYYY HH.mm',
            },
            meridiemParse: /d\'o|d\'a/i,
            isPM: function (e) {
                return "d'o" === e.toLowerCase();
            },
            meridiem: function (e, a, t) {
                return 11 < e ? (t ? "d'o" : "D'O") : t ? "d'a" : "D'A";
            },
            calendar: {
                sameDay: '[oxhi \xe0] LT',
                nextDay: '[dem\xe0 \xe0] LT',
                nextWeek: 'dddd [\xe0] LT',
                lastDay: '[ieiri \xe0] LT',
                lastWeek: '[s\xfcr el] dddd [lasteu \xe0] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: 'osprei %s',
                past: 'ja%s',
                s: ud,
                ss: ud,
                m: ud,
                mm: ud,
                h: ud,
                hh: ud,
                d: ud,
                dd: ud,
                M: ud,
                MM: ud,
                y: ud,
                yy: ud,
            },
            dayOfMonthOrdinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: { dow: 1, doy: 4 },
        }),
        l.defineLocale('tzm-latn', {
            months: 'innayr_br\u02e4ayr\u02e4_mar\u02e4s\u02e4_ibrir_mayyw_ywnyw_ywlywz_\u0263w\u0161t_\u0161wtanbir_kt\u02e4wbr\u02e4_nwwanbir_dwjnbir'.split(
                '_'
            ),
            monthsShort:
                'innayr_br\u02e4ayr\u02e4_mar\u02e4s\u02e4_ibrir_mayyw_ywnyw_ywlywz_\u0263w\u0161t_\u0161wtanbir_kt\u02e4wbr\u02e4_nwwanbir_dwjnbir'.split(
                    '_'
                ),
            weekdays:
                'asamas_aynas_asinas_akras_akwas_asimwas_asi\u1e0dyas'.split(
                    '_'
                ),
            weekdaysShort:
                'asamas_aynas_asinas_akras_akwas_asimwas_asi\u1e0dyas'.split(
                    '_'
                ),
            weekdaysMin:
                'asamas_aynas_asinas_akras_akwas_asimwas_asi\u1e0dyas'.split(
                    '_'
                ),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd D MMMM YYYY HH:mm',
            },
            calendar: {
                sameDay: '[asdkh g] LT',
                nextDay: '[aska g] LT',
                nextWeek: 'dddd [g] LT',
                lastDay: '[assant g] LT',
                lastWeek: 'dddd [g] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: 'dadkh s yan %s',
                past: 'yan %s',
                s: 'imik',
                ss: '%d imik',
                m: 'minu\u1e0d',
                mm: '%d minu\u1e0d',
                h: 'sa\u025ba',
                hh: '%d tassa\u025bin',
                d: 'ass',
                dd: '%d ossan',
                M: 'ayowr',
                MM: '%d iyyirn',
                y: 'asgas',
                yy: '%d isgasn',
            },
            week: { dow: 6, doy: 12 },
        }),
        l.defineLocale('tzm', {
            months: '\u2d49\u2d4f\u2d4f\u2d30\u2d62\u2d54_\u2d31\u2d55\u2d30\u2d62\u2d55_\u2d4e\u2d30\u2d55\u2d5a_\u2d49\u2d31\u2d54\u2d49\u2d54_\u2d4e\u2d30\u2d62\u2d62\u2d53_\u2d62\u2d53\u2d4f\u2d62\u2d53_\u2d62\u2d53\u2d4d\u2d62\u2d53\u2d63_\u2d56\u2d53\u2d5b\u2d5c_\u2d5b\u2d53\u2d5c\u2d30\u2d4f\u2d31\u2d49\u2d54_\u2d3d\u2d5f\u2d53\u2d31\u2d55_\u2d4f\u2d53\u2d61\u2d30\u2d4f\u2d31\u2d49\u2d54_\u2d37\u2d53\u2d4a\u2d4f\u2d31\u2d49\u2d54'.split(
                '_'
            ),
            monthsShort:
                '\u2d49\u2d4f\u2d4f\u2d30\u2d62\u2d54_\u2d31\u2d55\u2d30\u2d62\u2d55_\u2d4e\u2d30\u2d55\u2d5a_\u2d49\u2d31\u2d54\u2d49\u2d54_\u2d4e\u2d30\u2d62\u2d62\u2d53_\u2d62\u2d53\u2d4f\u2d62\u2d53_\u2d62\u2d53\u2d4d\u2d62\u2d53\u2d63_\u2d56\u2d53\u2d5b\u2d5c_\u2d5b\u2d53\u2d5c\u2d30\u2d4f\u2d31\u2d49\u2d54_\u2d3d\u2d5f\u2d53\u2d31\u2d55_\u2d4f\u2d53\u2d61\u2d30\u2d4f\u2d31\u2d49\u2d54_\u2d37\u2d53\u2d4a\u2d4f\u2d31\u2d49\u2d54'.split(
                    '_'
                ),
            weekdays:
                '\u2d30\u2d59\u2d30\u2d4e\u2d30\u2d59_\u2d30\u2d62\u2d4f\u2d30\u2d59_\u2d30\u2d59\u2d49\u2d4f\u2d30\u2d59_\u2d30\u2d3d\u2d54\u2d30\u2d59_\u2d30\u2d3d\u2d61\u2d30\u2d59_\u2d30\u2d59\u2d49\u2d4e\u2d61\u2d30\u2d59_\u2d30\u2d59\u2d49\u2d39\u2d62\u2d30\u2d59'.split(
                    '_'
                ),
            weekdaysShort:
                '\u2d30\u2d59\u2d30\u2d4e\u2d30\u2d59_\u2d30\u2d62\u2d4f\u2d30\u2d59_\u2d30\u2d59\u2d49\u2d4f\u2d30\u2d59_\u2d30\u2d3d\u2d54\u2d30\u2d59_\u2d30\u2d3d\u2d61\u2d30\u2d59_\u2d30\u2d59\u2d49\u2d4e\u2d61\u2d30\u2d59_\u2d30\u2d59\u2d49\u2d39\u2d62\u2d30\u2d59'.split(
                    '_'
                ),
            weekdaysMin:
                '\u2d30\u2d59\u2d30\u2d4e\u2d30\u2d59_\u2d30\u2d62\u2d4f\u2d30\u2d59_\u2d30\u2d59\u2d49\u2d4f\u2d30\u2d59_\u2d30\u2d3d\u2d54\u2d30\u2d59_\u2d30\u2d3d\u2d61\u2d30\u2d59_\u2d30\u2d59\u2d49\u2d4e\u2d61\u2d30\u2d59_\u2d30\u2d59\u2d49\u2d39\u2d62\u2d30\u2d59'.split(
                    '_'
                ),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd D MMMM YYYY HH:mm',
            },
            calendar: {
                sameDay: '[\u2d30\u2d59\u2d37\u2d45 \u2d34] LT',
                nextDay: '[\u2d30\u2d59\u2d3d\u2d30 \u2d34] LT',
                nextWeek: 'dddd [\u2d34] LT',
                lastDay: '[\u2d30\u2d5a\u2d30\u2d4f\u2d5c \u2d34] LT',
                lastWeek: 'dddd [\u2d34] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: '\u2d37\u2d30\u2d37\u2d45 \u2d59 \u2d62\u2d30\u2d4f %s',
                past: '\u2d62\u2d30\u2d4f %s',
                s: '\u2d49\u2d4e\u2d49\u2d3d',
                ss: '%d \u2d49\u2d4e\u2d49\u2d3d',
                m: '\u2d4e\u2d49\u2d4f\u2d53\u2d3a',
                mm: '%d \u2d4e\u2d49\u2d4f\u2d53\u2d3a',
                h: '\u2d59\u2d30\u2d44\u2d30',
                hh: '%d \u2d5c\u2d30\u2d59\u2d59\u2d30\u2d44\u2d49\u2d4f',
                d: '\u2d30\u2d59\u2d59',
                dd: '%d o\u2d59\u2d59\u2d30\u2d4f',
                M: '\u2d30\u2d62o\u2d53\u2d54',
                MM: '%d \u2d49\u2d62\u2d62\u2d49\u2d54\u2d4f',
                y: '\u2d30\u2d59\u2d33\u2d30\u2d59',
                yy: '%d \u2d49\u2d59\u2d33\u2d30\u2d59\u2d4f',
            },
            week: { dow: 6, doy: 12 },
        }),
        l.defineLocale('ug-cn', {
            months: '\u064a\u0627\u0646\u06cb\u0627\u0631_\u0641\u06d0\u06cb\u0631\u0627\u0644_\u0645\u0627\u0631\u062a_\u0626\u0627\u067e\u0631\u06d0\u0644_\u0645\u0627\u064a_\u0626\u0649\u064a\u06c7\u0646_\u0626\u0649\u064a\u06c7\u0644_\u0626\u0627\u06cb\u063a\u06c7\u0633\u062a_\u0633\u06d0\u0646\u062a\u06d5\u0628\u0649\u0631_\u0626\u06c6\u0643\u062a\u06d5\u0628\u0649\u0631_\u0646\u0648\u064a\u0627\u0628\u0649\u0631_\u062f\u06d0\u0643\u0627\u0628\u0649\u0631'.split(
                '_'
            ),
            monthsShort:
                '\u064a\u0627\u0646\u06cb\u0627\u0631_\u0641\u06d0\u06cb\u0631\u0627\u0644_\u0645\u0627\u0631\u062a_\u0626\u0627\u067e\u0631\u06d0\u0644_\u0645\u0627\u064a_\u0626\u0649\u064a\u06c7\u0646_\u0626\u0649\u064a\u06c7\u0644_\u0626\u0627\u06cb\u063a\u06c7\u0633\u062a_\u0633\u06d0\u0646\u062a\u06d5\u0628\u0649\u0631_\u0626\u06c6\u0643\u062a\u06d5\u0628\u0649\u0631_\u0646\u0648\u064a\u0627\u0628\u0649\u0631_\u062f\u06d0\u0643\u0627\u0628\u0649\u0631'.split(
                    '_'
                ),
            weekdays:
                '\u064a\u06d5\u0643\u0634\u06d5\u0646\u0628\u06d5_\u062f\u06c8\u0634\u06d5\u0646\u0628\u06d5_\u0633\u06d5\u064a\u0634\u06d5\u0646\u0628\u06d5_\u0686\u0627\u0631\u0634\u06d5\u0646\u0628\u06d5_\u067e\u06d5\u064a\u0634\u06d5\u0646\u0628\u06d5_\u062c\u06c8\u0645\u06d5_\u0634\u06d5\u0646\u0628\u06d5'.split(
                    '_'
                ),
            weekdaysShort:
                '\u064a\u06d5_\u062f\u06c8_\u0633\u06d5_\u0686\u0627_\u067e\u06d5_\u062c\u06c8_\u0634\u06d5'.split(
                    '_'
                ),
            weekdaysMin:
                '\u064a\u06d5_\u062f\u06c8_\u0633\u06d5_\u0686\u0627_\u067e\u06d5_\u062c\u06c8_\u0634\u06d5'.split(
                    '_'
                ),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'YYYY-MM-DD',
                LL: 'YYYY-\u064a\u0649\u0644\u0649M-\u0626\u0627\u064a\u0646\u0649\u06adD-\u0643\u06c8\u0646\u0649',
                LLL: 'YYYY-\u064a\u0649\u0644\u0649M-\u0626\u0627\u064a\u0646\u0649\u06adD-\u0643\u06c8\u0646\u0649\u060c HH:mm',
                LLLL: 'dddd\u060c YYYY-\u064a\u0649\u0644\u0649M-\u0626\u0627\u064a\u0646\u0649\u06adD-\u0643\u06c8\u0646\u0649\u060c HH:mm',
            },
            meridiemParse:
                /\u064a\u06d0\u0631\u0649\u0645 \u0643\u06d0\u0686\u06d5|\u0633\u06d5\u06be\u06d5\u0631|\u0686\u06c8\u0634\u062a\u0649\u0646 \u0628\u06c7\u0631\u06c7\u0646|\u0686\u06c8\u0634|\u0686\u06c8\u0634\u062a\u0649\u0646 \u0643\u06d0\u064a\u0649\u0646|\u0643\u06d5\u0686/,
            meridiemHour: function (e, a) {
                return (
                    12 === e && (e = 0),
                    '\u064a\u06d0\u0631\u0649\u0645 \u0643\u06d0\u0686\u06d5' ===
                        a ||
                    '\u0633\u06d5\u06be\u06d5\u0631' === a ||
                    '\u0686\u06c8\u0634\u062a\u0649\u0646 \u0628\u06c7\u0631\u06c7\u0646' ===
                        a
                        ? e
                        : '\u0686\u06c8\u0634\u062a\u0649\u0646 \u0643\u06d0\u064a\u0649\u0646' ===
                              a || '\u0643\u06d5\u0686' === a
                        ? e + 12
                        : 11 <= e
                        ? e
                        : e + 12
                );
            },
            meridiem: function (e, a, t) {
                var s = 100 * e + a;
                return s < 600
                    ? '\u064a\u06d0\u0631\u0649\u0645 \u0643\u06d0\u0686\u06d5'
                    : s < 900
                    ? '\u0633\u06d5\u06be\u06d5\u0631'
                    : s < 1130
                    ? '\u0686\u06c8\u0634\u062a\u0649\u0646 \u0628\u06c7\u0631\u06c7\u0646'
                    : s < 1230
                    ? '\u0686\u06c8\u0634'
                    : s < 1800
                    ? '\u0686\u06c8\u0634\u062a\u0649\u0646 \u0643\u06d0\u064a\u0649\u0646'
                    : '\u0643\u06d5\u0686';
            },
            calendar: {
                sameDay:
                    '[\u0628\u06c8\u06af\u06c8\u0646 \u0633\u0627\u0626\u06d5\u062a] LT',
                nextDay:
                    '[\u0626\u06d5\u062a\u06d5 \u0633\u0627\u0626\u06d5\u062a] LT',
                nextWeek:
                    '[\u0643\u06d0\u0644\u06d5\u0631\u0643\u0649] dddd [\u0633\u0627\u0626\u06d5\u062a] LT',
                lastDay: '[\u062a\u06c6\u0646\u06c8\u06af\u06c8\u0646] LT',
                lastWeek:
                    '[\u0626\u0627\u0644\u062f\u0649\u0646\u0642\u0649] dddd [\u0633\u0627\u0626\u06d5\u062a] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: '%s \u0643\u06d0\u064a\u0649\u0646',
                past: '%s \u0628\u06c7\u0631\u06c7\u0646',
                s: '\u0646\u06d5\u0686\u0686\u06d5 \u0633\u06d0\u0643\u0648\u0646\u062a',
                ss: '%d \u0633\u06d0\u0643\u0648\u0646\u062a',
                m: '\u0628\u0649\u0631 \u0645\u0649\u0646\u06c7\u062a',
                mm: '%d \u0645\u0649\u0646\u06c7\u062a',
                h: '\u0628\u0649\u0631 \u0633\u0627\u0626\u06d5\u062a',
                hh: '%d \u0633\u0627\u0626\u06d5\u062a',
                d: '\u0628\u0649\u0631 \u0643\u06c8\u0646',
                dd: '%d \u0643\u06c8\u0646',
                M: '\u0628\u0649\u0631 \u0626\u0627\u064a',
                MM: '%d \u0626\u0627\u064a',
                y: '\u0628\u0649\u0631 \u064a\u0649\u0644',
                yy: '%d \u064a\u0649\u0644',
            },
            dayOfMonthOrdinalParse:
                /\d{1,2}(-\u0643\u06c8\u0646\u0649|-\u0626\u0627\u064a|-\u06be\u06d5\u067e\u062a\u06d5)/,
            ordinal: function (e, a) {
                switch (a) {
                    case 'd':
                    case 'D':
                    case 'DDD':
                        return e + '-\u0643\u06c8\u0646\u0649';
                    case 'w':
                    case 'W':
                        return e + '-\u06be\u06d5\u067e\u062a\u06d5';
                    default:
                        return e;
                }
            },
            preparse: function (e) {
                return e.replace(/\u060c/g, ',');
            },
            postformat: function (e) {
                return e.replace(/,/g, '\u060c');
            },
            week: { dow: 1, doy: 7 },
        }),
        l.defineLocale('uk', {
            months: {
                format: '\u0441\u0456\u0447\u043d\u044f_\u043b\u044e\u0442\u043e\u0433\u043e_\u0431\u0435\u0440\u0435\u0437\u043d\u044f_\u043a\u0432\u0456\u0442\u043d\u044f_\u0442\u0440\u0430\u0432\u043d\u044f_\u0447\u0435\u0440\u0432\u043d\u044f_\u043b\u0438\u043f\u043d\u044f_\u0441\u0435\u0440\u043f\u043d\u044f_\u0432\u0435\u0440\u0435\u0441\u043d\u044f_\u0436\u043e\u0432\u0442\u043d\u044f_\u043b\u0438\u0441\u0442\u043e\u043f\u0430\u0434\u0430_\u0433\u0440\u0443\u0434\u043d\u044f'.split(
                    '_'
                ),
                standalone:
                    '\u0441\u0456\u0447\u0435\u043d\u044c_\u043b\u044e\u0442\u0438\u0439_\u0431\u0435\u0440\u0435\u0437\u0435\u043d\u044c_\u043a\u0432\u0456\u0442\u0435\u043d\u044c_\u0442\u0440\u0430\u0432\u0435\u043d\u044c_\u0447\u0435\u0440\u0432\u0435\u043d\u044c_\u043b\u0438\u043f\u0435\u043d\u044c_\u0441\u0435\u0440\u043f\u0435\u043d\u044c_\u0432\u0435\u0440\u0435\u0441\u0435\u043d\u044c_\u0436\u043e\u0432\u0442\u0435\u043d\u044c_\u043b\u0438\u0441\u0442\u043e\u043f\u0430\u0434_\u0433\u0440\u0443\u0434\u0435\u043d\u044c'.split(
                        '_'
                    ),
            },
            monthsShort:
                '\u0441\u0456\u0447_\u043b\u044e\u0442_\u0431\u0435\u0440_\u043a\u0432\u0456\u0442_\u0442\u0440\u0430\u0432_\u0447\u0435\u0440\u0432_\u043b\u0438\u043f_\u0441\u0435\u0440\u043f_\u0432\u0435\u0440_\u0436\u043e\u0432\u0442_\u043b\u0438\u0441\u0442_\u0433\u0440\u0443\u0434'.split(
                    '_'
                ),
            weekdays: function (e, a) {
                var t = {
                    nominative:
                        '\u043d\u0435\u0434\u0456\u043b\u044f_\u043f\u043e\u043d\u0435\u0434\u0456\u043b\u043e\u043a_\u0432\u0456\u0432\u0442\u043e\u0440\u043e\u043a_\u0441\u0435\u0440\u0435\u0434\u0430_\u0447\u0435\u0442\u0432\u0435\u0440_\u043f\u2019\u044f\u0442\u043d\u0438\u0446\u044f_\u0441\u0443\u0431\u043e\u0442\u0430'.split(
                            '_'
                        ),
                    accusative:
                        '\u043d\u0435\u0434\u0456\u043b\u044e_\u043f\u043e\u043d\u0435\u0434\u0456\u043b\u043e\u043a_\u0432\u0456\u0432\u0442\u043e\u0440\u043e\u043a_\u0441\u0435\u0440\u0435\u0434\u0443_\u0447\u0435\u0442\u0432\u0435\u0440_\u043f\u2019\u044f\u0442\u043d\u0438\u0446\u044e_\u0441\u0443\u0431\u043e\u0442\u0443'.split(
                            '_'
                        ),
                    genitive:
                        '\u043d\u0435\u0434\u0456\u043b\u0456_\u043f\u043e\u043d\u0435\u0434\u0456\u043b\u043a\u0430_\u0432\u0456\u0432\u0442\u043e\u0440\u043a\u0430_\u0441\u0435\u0440\u0435\u0434\u0438_\u0447\u0435\u0442\u0432\u0435\u0440\u0433\u0430_\u043f\u2019\u044f\u0442\u043d\u0438\u0446\u0456_\u0441\u0443\u0431\u043e\u0442\u0438'.split(
                            '_'
                        ),
                };
                return !0 === e
                    ? t.nominative.slice(1, 7).concat(t.nominative.slice(0, 1))
                    : e
                    ? t[
                          /(\[[\u0412\u0432\u0423\u0443]\]) ?dddd/.test(a)
                              ? 'accusative'
                              : /\[?(?:\u043c\u0438\u043d\u0443\u043b\u043e\u0457|\u043d\u0430\u0441\u0442\u0443\u043f\u043d\u043e\u0457)? ?\] ?dddd/.test(
                                    a
                                )
                              ? 'genitive'
                              : 'nominative'
                      ][e.day()]
                    : t.nominative;
            },
            weekdaysShort:
                '\u043d\u0434_\u043f\u043d_\u0432\u0442_\u0441\u0440_\u0447\u0442_\u043f\u0442_\u0441\u0431'.split(
                    '_'
                ),
            weekdaysMin:
                '\u043d\u0434_\u043f\u043d_\u0432\u0442_\u0441\u0440_\u0447\u0442_\u043f\u0442_\u0441\u0431'.split(
                    '_'
                ),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD.MM.YYYY',
                LL: 'D MMMM YYYY \u0440.',
                LLL: 'D MMMM YYYY \u0440., HH:mm',
                LLLL: 'dddd, D MMMM YYYY \u0440., HH:mm',
            },
            calendar: {
                sameDay: Md(
                    '[\u0421\u044c\u043e\u0433\u043e\u0434\u043d\u0456 '
                ),
                nextDay: Md('[\u0417\u0430\u0432\u0442\u0440\u0430 '),
                lastDay: Md('[\u0412\u0447\u043e\u0440\u0430 '),
                nextWeek: Md('[\u0423] dddd ['),
                lastWeek: function () {
                    switch (this.day()) {
                        case 0:
                        case 3:
                        case 5:
                        case 6:
                            return Md(
                                '[\u041c\u0438\u043d\u0443\u043b\u043e\u0457] dddd ['
                            ).call(this);
                        case 1:
                        case 2:
                        case 4:
                            return Md(
                                '[\u041c\u0438\u043d\u0443\u043b\u043e\u0433\u043e] dddd ['
                            ).call(this);
                    }
                },
                sameElse: 'L',
            },
            relativeTime: {
                future: '\u0437\u0430 %s',
                past: '%s \u0442\u043e\u043c\u0443',
                s: '\u0434\u0435\u043a\u0456\u043b\u044c\u043a\u0430 \u0441\u0435\u043a\u0443\u043d\u0434',
                ss: ld,
                m: ld,
                mm: ld,
                h: '\u0433\u043e\u0434\u0438\u043d\u0443',
                hh: ld,
                d: '\u0434\u0435\u043d\u044c',
                dd: ld,
                M: '\u043c\u0456\u0441\u044f\u0446\u044c',
                MM: ld,
                y: '\u0440\u0456\u043a',
                yy: ld,
            },
            meridiemParse:
                /\u043d\u043e\u0447\u0456|\u0440\u0430\u043d\u043a\u0443|\u0434\u043d\u044f|\u0432\u0435\u0447\u043e\u0440\u0430/,
            isPM: function (e) {
                return /^(\u0434\u043d\u044f|\u0432\u0435\u0447\u043e\u0440\u0430)$/.test(
                    e
                );
            },
            meridiem: function (e, a, t) {
                return e < 4
                    ? '\u043d\u043e\u0447\u0456'
                    : e < 12
                    ? '\u0440\u0430\u043d\u043a\u0443'
                    : e < 17
                    ? '\u0434\u043d\u044f'
                    : '\u0432\u0435\u0447\u043e\u0440\u0430';
            },
            dayOfMonthOrdinalParse: /\d{1,2}-(\u0439|\u0433\u043e)/,
            ordinal: function (e, a) {
                switch (a) {
                    case 'M':
                    case 'd':
                    case 'DDD':
                    case 'w':
                    case 'W':
                        return e + '-\u0439';
                    case 'D':
                        return e + '-\u0433\u043e';
                    default:
                        return e;
                }
            },
            week: { dow: 1, doy: 7 },
        });
    var hd = [
            '\u062c\u0646\u0648\u0631\u06cc',
            '\u0641\u0631\u0648\u0631\u06cc',
            '\u0645\u0627\u0631\u0686',
            '\u0627\u067e\u0631\u06cc\u0644',
            '\u0645\u0626\u06cc',
            '\u062c\u0648\u0646',
            '\u062c\u0648\u0644\u0627\u0626\u06cc',
            '\u0627\u06af\u0633\u062a',
            '\u0633\u062a\u0645\u0628\u0631',
            '\u0627\u06a9\u062a\u0648\u0628\u0631',
            '\u0646\u0648\u0645\u0628\u0631',
            '\u062f\u0633\u0645\u0628\u0631',
        ],
        Ld = [
            '\u0627\u062a\u0648\u0627\u0631',
            '\u067e\u06cc\u0631',
            '\u0645\u0646\u06af\u0644',
            '\u0628\u062f\u06be',
            '\u062c\u0645\u0639\u0631\u0627\u062a',
            '\u062c\u0645\u0639\u06c1',
            '\u06c1\u0641\u062a\u06c1',
        ];
    return (
        l.defineLocale('ur', {
            months: hd,
            monthsShort: hd,
            weekdays: Ld,
            weekdaysShort: Ld,
            weekdaysMin: Ld,
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd\u060c D MMMM YYYY HH:mm',
            },
            meridiemParse: /\u0635\u0628\u062d|\u0634\u0627\u0645/,
            isPM: function (e) {
                return '\u0634\u0627\u0645' === e;
            },
            meridiem: function (e, a, t) {
                return e < 12 ? '\u0635\u0628\u062d' : '\u0634\u0627\u0645';
            },
            calendar: {
                sameDay: '[\u0622\u062c \u0628\u0648\u0642\u062a] LT',
                nextDay: '[\u06a9\u0644 \u0628\u0648\u0642\u062a] LT',
                nextWeek: 'dddd [\u0628\u0648\u0642\u062a] LT',
                lastDay:
                    '[\u06af\u0630\u0634\u062a\u06c1 \u0631\u0648\u0632 \u0628\u0648\u0642\u062a] LT',
                lastWeek:
                    '[\u06af\u0630\u0634\u062a\u06c1] dddd [\u0628\u0648\u0642\u062a] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: '%s \u0628\u0639\u062f',
                past: '%s \u0642\u0628\u0644',
                s: '\u0686\u0646\u062f \u0633\u06cc\u06a9\u0646\u0688',
                ss: '%d \u0633\u06cc\u06a9\u0646\u0688',
                m: '\u0627\u06cc\u06a9 \u0645\u0646\u0679',
                mm: '%d \u0645\u0646\u0679',
                h: '\u0627\u06cc\u06a9 \u06af\u06be\u0646\u0679\u06c1',
                hh: '%d \u06af\u06be\u0646\u0679\u06d2',
                d: '\u0627\u06cc\u06a9 \u062f\u0646',
                dd: '%d \u062f\u0646',
                M: '\u0627\u06cc\u06a9 \u0645\u0627\u06c1',
                MM: '%d \u0645\u0627\u06c1',
                y: '\u0627\u06cc\u06a9 \u0633\u0627\u0644',
                yy: '%d \u0633\u0627\u0644',
            },
            preparse: function (e) {
                return e.replace(/\u060c/g, ',');
            },
            postformat: function (e) {
                return e.replace(/,/g, '\u060c');
            },
            week: { dow: 1, doy: 4 },
        }),
        l.defineLocale('uz-latn', {
            months: 'Yanvar_Fevral_Mart_Aprel_May_Iyun_Iyul_Avgust_Sentabr_Oktabr_Noyabr_Dekabr'.split(
                '_'
            ),
            monthsShort:
                'Yan_Fev_Mar_Apr_May_Iyun_Iyul_Avg_Sen_Okt_Noy_Dek'.split('_'),
            weekdays:
                'Yakshanba_Dushanba_Seshanba_Chorshanba_Payshanba_Juma_Shanba'.split(
                    '_'
                ),
            weekdaysShort: 'Yak_Dush_Sesh_Chor_Pay_Jum_Shan'.split('_'),
            weekdaysMin: 'Ya_Du_Se_Cho_Pa_Ju_Sha'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'D MMMM YYYY, dddd HH:mm',
            },
            calendar: {
                sameDay: '[Bugun soat] LT [da]',
                nextDay: '[Ertaga] LT [da]',
                nextWeek: 'dddd [kuni soat] LT [da]',
                lastDay: '[Kecha soat] LT [da]',
                lastWeek: "[O'tgan] dddd [kuni soat] LT [da]",
                sameElse: 'L',
            },
            relativeTime: {
                future: 'Yaqin %s ichida',
                past: 'Bir necha %s oldin',
                s: 'soniya',
                ss: '%d soniya',
                m: 'bir daqiqa',
                mm: '%d daqiqa',
                h: 'bir soat',
                hh: '%d soat',
                d: 'bir kun',
                dd: '%d kun',
                M: 'bir oy',
                MM: '%d oy',
                y: 'bir yil',
                yy: '%d yil',
            },
            week: { dow: 1, doy: 7 },
        }),
        l.defineLocale('uz', {
            months: '\u044f\u043d\u0432\u0430\u0440_\u0444\u0435\u0432\u0440\u0430\u043b_\u043c\u0430\u0440\u0442_\u0430\u043f\u0440\u0435\u043b_\u043c\u0430\u0439_\u0438\u044e\u043d_\u0438\u044e\u043b_\u0430\u0432\u0433\u0443\u0441\u0442_\u0441\u0435\u043d\u0442\u044f\u0431\u0440_\u043e\u043a\u0442\u044f\u0431\u0440_\u043d\u043e\u044f\u0431\u0440_\u0434\u0435\u043a\u0430\u0431\u0440'.split(
                '_'
            ),
            monthsShort:
                '\u044f\u043d\u0432_\u0444\u0435\u0432_\u043c\u0430\u0440_\u0430\u043f\u0440_\u043c\u0430\u0439_\u0438\u044e\u043d_\u0438\u044e\u043b_\u0430\u0432\u0433_\u0441\u0435\u043d_\u043e\u043a\u0442_\u043d\u043e\u044f_\u0434\u0435\u043a'.split(
                    '_'
                ),
            weekdays:
                '\u042f\u043a\u0448\u0430\u043d\u0431\u0430_\u0414\u0443\u0448\u0430\u043d\u0431\u0430_\u0421\u0435\u0448\u0430\u043d\u0431\u0430_\u0427\u043e\u0440\u0448\u0430\u043d\u0431\u0430_\u041f\u0430\u0439\u0448\u0430\u043d\u0431\u0430_\u0416\u0443\u043c\u0430_\u0428\u0430\u043d\u0431\u0430'.split(
                    '_'
                ),
            weekdaysShort:
                '\u042f\u043a\u0448_\u0414\u0443\u0448_\u0421\u0435\u0448_\u0427\u043e\u0440_\u041f\u0430\u0439_\u0416\u0443\u043c_\u0428\u0430\u043d'.split(
                    '_'
                ),
            weekdaysMin:
                '\u042f\u043a_\u0414\u0443_\u0421\u0435_\u0427\u043e_\u041f\u0430_\u0416\u0443_\u0428\u0430'.split(
                    '_'
                ),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'D MMMM YYYY, dddd HH:mm',
            },
            calendar: {
                sameDay:
                    '[\u0411\u0443\u0433\u0443\u043d \u0441\u043e\u0430\u0442] LT [\u0434\u0430]',
                nextDay:
                    '[\u042d\u0440\u0442\u0430\u0433\u0430] LT [\u0434\u0430]',
                nextWeek:
                    'dddd [\u043a\u0443\u043d\u0438 \u0441\u043e\u0430\u0442] LT [\u0434\u0430]',
                lastDay:
                    '[\u041a\u0435\u0447\u0430 \u0441\u043e\u0430\u0442] LT [\u0434\u0430]',
                lastWeek:
                    '[\u0423\u0442\u0433\u0430\u043d] dddd [\u043a\u0443\u043d\u0438 \u0441\u043e\u0430\u0442] LT [\u0434\u0430]',
                sameElse: 'L',
            },
            relativeTime: {
                future: '\u042f\u043a\u0438\u043d %s \u0438\u0447\u0438\u0434\u0430',
                past: '\u0411\u0438\u0440 \u043d\u0435\u0447\u0430 %s \u043e\u043b\u0434\u0438\u043d',
                s: '\u0444\u0443\u0440\u0441\u0430\u0442',
                ss: '%d \u0444\u0443\u0440\u0441\u0430\u0442',
                m: '\u0431\u0438\u0440 \u0434\u0430\u043a\u0438\u043a\u0430',
                mm: '%d \u0434\u0430\u043a\u0438\u043a\u0430',
                h: '\u0431\u0438\u0440 \u0441\u043e\u0430\u0442',
                hh: '%d \u0441\u043e\u0430\u0442',
                d: '\u0431\u0438\u0440 \u043a\u0443\u043d',
                dd: '%d \u043a\u0443\u043d',
                M: '\u0431\u0438\u0440 \u043e\u0439',
                MM: '%d \u043e\u0439',
                y: '\u0431\u0438\u0440 \u0439\u0438\u043b',
                yy: '%d \u0439\u0438\u043b',
            },
            week: { dow: 1, doy: 7 },
        }),
        l.defineLocale('vi', {
            months: 'th\xe1ng 1_th\xe1ng 2_th\xe1ng 3_th\xe1ng 4_th\xe1ng 5_th\xe1ng 6_th\xe1ng 7_th\xe1ng 8_th\xe1ng 9_th\xe1ng 10_th\xe1ng 11_th\xe1ng 12'.split(
                '_'
            ),
            monthsShort:
                'Th01_Th02_Th03_Th04_Th05_Th06_Th07_Th08_Th09_Th10_Th11_Th12'.split(
                    '_'
                ),
            monthsParseExact: !0,
            weekdays:
                'ch\u1ee7 nh\u1eadt_th\u1ee9 hai_th\u1ee9 ba_th\u1ee9 t\u01b0_th\u1ee9 n\u0103m_th\u1ee9 s\xe1u_th\u1ee9 b\u1ea3y'.split(
                    '_'
                ),
            weekdaysShort: 'CN_T2_T3_T4_T5_T6_T7'.split('_'),
            weekdaysMin: 'CN_T2_T3_T4_T5_T6_T7'.split('_'),
            weekdaysParseExact: !0,
            meridiemParse: /sa|ch/i,
            isPM: function (e) {
                return /^ch$/i.test(e);
            },
            meridiem: function (e, a, t) {
                return e < 12 ? (t ? 'sa' : 'SA') : t ? 'ch' : 'CH';
            },
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM [n\u0103m] YYYY',
                LLL: 'D MMMM [n\u0103m] YYYY HH:mm',
                LLLL: 'dddd, D MMMM [n\u0103m] YYYY HH:mm',
                l: 'DD/M/YYYY',
                ll: 'D MMM YYYY',
                lll: 'D MMM YYYY HH:mm',
                llll: 'ddd, D MMM YYYY HH:mm',
            },
            calendar: {
                sameDay: '[H\xf4m nay l\xfac] LT',
                nextDay: '[Ng\xe0y mai l\xfac] LT',
                nextWeek: 'dddd [tu\u1ea7n t\u1edbi l\xfac] LT',
                lastDay: '[H\xf4m qua l\xfac] LT',
                lastWeek: 'dddd [tu\u1ea7n r\u1ed3i l\xfac] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: '%s t\u1edbi',
                past: '%s tr\u01b0\u1edbc',
                s: 'v\xe0i gi\xe2y',
                ss: '%d gi\xe2y',
                m: 'm\u1ed9t ph\xfat',
                mm: '%d ph\xfat',
                h: 'm\u1ed9t gi\u1edd',
                hh: '%d gi\u1edd',
                d: 'm\u1ed9t ng\xe0y',
                dd: '%d ng\xe0y',
                M: 'm\u1ed9t th\xe1ng',
                MM: '%d th\xe1ng',
                y: 'm\u1ed9t n\u0103m',
                yy: '%d n\u0103m',
            },
            dayOfMonthOrdinalParse: /\d{1,2}/,
            ordinal: function (e) {
                return e;
            },
            week: { dow: 1, doy: 4 },
        }),
        l.defineLocale('x-pseudo', {
            months: 'J~\xe1\xf1\xfa\xe1~r\xfd_F~\xe9br\xfa~\xe1r\xfd_~M\xe1rc~h_\xc1p~r\xedl_~M\xe1\xfd_~J\xfa\xf1\xe9~_J\xfal~\xfd_\xc1\xfa~g\xfast~_S\xe9p~t\xe9mb~\xe9r_\xd3~ct\xf3b~\xe9r_\xd1~\xf3v\xe9m~b\xe9r_~D\xe9c\xe9~mb\xe9r'.split(
                '_'
            ),
            monthsShort:
                'J~\xe1\xf1_~F\xe9b_~M\xe1r_~\xc1pr_~M\xe1\xfd_~J\xfa\xf1_~J\xfal_~\xc1\xfag_~S\xe9p_~\xd3ct_~\xd1\xf3v_~D\xe9c'.split(
                    '_'
                ),
            monthsParseExact: !0,
            weekdays:
                'S~\xfa\xf1d\xe1~\xfd_M\xf3~\xf1d\xe1\xfd~_T\xfa\xe9~sd\xe1\xfd~_W\xe9d~\xf1\xe9sd~\xe1\xfd_T~h\xfars~d\xe1\xfd_~Fr\xedd~\xe1\xfd_S~\xe1t\xfar~d\xe1\xfd'.split(
                    '_'
                ),
            weekdaysShort:
                'S~\xfa\xf1_~M\xf3\xf1_~T\xfa\xe9_~W\xe9d_~Th\xfa_~Fr\xed_~S\xe1t'.split(
                    '_'
                ),
            weekdaysMin: 'S~\xfa_M\xf3~_T\xfa_~W\xe9_T~h_Fr~_S\xe1'.split('_'),
            weekdaysParseExact: !0,
            longDateFormat: {
                LT: 'HH:mm',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY HH:mm',
                LLLL: 'dddd, D MMMM YYYY HH:mm',
            },
            calendar: {
                sameDay: '[T~\xf3d\xe1~\xfd \xe1t] LT',
                nextDay: '[T~\xf3m\xf3~rr\xf3~w \xe1t] LT',
                nextWeek: 'dddd [\xe1t] LT',
                lastDay: '[\xdd~\xe9st~\xe9rd\xe1~\xfd \xe1t] LT',
                lastWeek: '[L~\xe1st] dddd [\xe1t] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: '\xed~\xf1 %s',
                past: '%s \xe1~g\xf3',
                s: '\xe1 ~f\xe9w ~s\xe9c\xf3~\xf1ds',
                ss: '%d s~\xe9c\xf3\xf1~ds',
                m: '\xe1 ~m\xed\xf1~\xfat\xe9',
                mm: '%d m~\xed\xf1\xfa~t\xe9s',
                h: '\xe1~\xf1 h\xf3~\xfar',
                hh: '%d h~\xf3\xfars',
                d: '\xe1 ~d\xe1\xfd',
                dd: '%d d~\xe1\xfds',
                M: '\xe1 ~m\xf3\xf1~th',
                MM: '%d m~\xf3\xf1t~hs',
                y: '\xe1 ~\xfd\xe9\xe1r',
                yy: '%d \xfd~\xe9\xe1rs',
            },
            dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/,
            ordinal: function (e) {
                var a = e % 10;
                return (
                    e +
                    (1 == ~~((e % 100) / 10)
                        ? 'th'
                        : 1 === a
                        ? 'st'
                        : 2 === a
                        ? 'nd'
                        : 3 === a
                        ? 'rd'
                        : 'th')
                );
            },
            week: { dow: 1, doy: 4 },
        }),
        l.defineLocale('yo', {
            months: 'S\u1eb9\u0301r\u1eb9\u0301_E\u0300re\u0300le\u0300_\u1eb8r\u1eb9\u0300na\u0300_I\u0300gbe\u0301_E\u0300bibi_O\u0300ku\u0300du_Ag\u1eb9mo_O\u0300gu\u0301n_Owewe_\u1ecc\u0300wa\u0300ra\u0300_Be\u0301lu\u0301_\u1ecc\u0300p\u1eb9\u0300\u0300'.split(
                '_'
            ),
            monthsShort:
                'S\u1eb9\u0301r_E\u0300rl_\u1eb8rn_I\u0300gb_E\u0300bi_O\u0300ku\u0300_Ag\u1eb9_O\u0300gu\u0301_Owe_\u1ecc\u0300wa\u0300_Be\u0301l_\u1ecc\u0300p\u1eb9\u0300\u0300'.split(
                    '_'
                ),
            weekdays:
                'A\u0300i\u0300ku\u0301_Aje\u0301_I\u0300s\u1eb9\u0301gun_\u1eccj\u1ecd\u0301ru\u0301_\u1eccj\u1ecd\u0301b\u1ecd_\u1eb8ti\u0300_A\u0300ba\u0301m\u1eb9\u0301ta'.split(
                    '_'
                ),
            weekdaysShort:
                'A\u0300i\u0300k_Aje\u0301_I\u0300s\u1eb9\u0301_\u1eccjr_\u1eccjb_\u1eb8ti\u0300_A\u0300ba\u0301'.split(
                    '_'
                ),
            weekdaysMin:
                'A\u0300i\u0300_Aj_I\u0300s_\u1eccr_\u1eccb_\u1eb8t_A\u0300b'.split(
                    '_'
                ),
            longDateFormat: {
                LT: 'h:mm A',
                LTS: 'h:mm:ss A',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY h:mm A',
                LLLL: 'dddd, D MMMM YYYY h:mm A',
            },
            calendar: {
                sameDay: '[O\u0300ni\u0300 ni] LT',
                nextDay: '[\u1ecc\u0300la ni] LT',
                nextWeek:
                    "dddd [\u1eccs\u1eb9\u0300 to\u0301n'b\u1ecd] [ni] LT",
                lastDay: '[A\u0300na ni] LT',
                lastWeek:
                    'dddd [\u1eccs\u1eb9\u0300 to\u0301l\u1ecd\u0301] [ni] LT',
                sameElse: 'L',
            },
            relativeTime: {
                future: 'ni\u0301 %s',
                past: '%s k\u1ecdja\u0301',
                s: 'i\u0300s\u1eb9ju\u0301 aaya\u0301 die',
                ss: 'aaya\u0301 %d',
                m: 'i\u0300s\u1eb9ju\u0301 kan',
                mm: 'i\u0300s\u1eb9ju\u0301 %d',
                h: 'wa\u0301kati kan',
                hh: 'wa\u0301kati %d',
                d: '\u1ecdj\u1ecd\u0301 kan',
                dd: '\u1ecdj\u1ecd\u0301 %d',
                M: 'osu\u0300 kan',
                MM: 'osu\u0300 %d',
                y: '\u1ecddu\u0301n kan',
                yy: '\u1ecddu\u0301n %d',
            },
            dayOfMonthOrdinalParse: /\u1ecdj\u1ecd\u0301\s\d{1,2}/,
            ordinal: '\u1ecdj\u1ecd\u0301 %d',
            week: { dow: 1, doy: 4 },
        }),
        l.defineLocale('zh-cn', {
            months: '\u4e00\u6708_\u4e8c\u6708_\u4e09\u6708_\u56db\u6708_\u4e94\u6708_\u516d\u6708_\u4e03\u6708_\u516b\u6708_\u4e5d\u6708_\u5341\u6708_\u5341\u4e00\u6708_\u5341\u4e8c\u6708'.split(
                '_'
            ),
            monthsShort:
                '1\u6708_2\u6708_3\u6708_4\u6708_5\u6708_6\u6708_7\u6708_8\u6708_9\u6708_10\u6708_11\u6708_12\u6708'.split(
                    '_'
                ),
            weekdays:
                '\u661f\u671f\u65e5_\u661f\u671f\u4e00_\u661f\u671f\u4e8c_\u661f\u671f\u4e09_\u661f\u671f\u56db_\u661f\u671f\u4e94_\u661f\u671f\u516d'.split(
                    '_'
                ),
            weekdaysShort:
                '\u5468\u65e5_\u5468\u4e00_\u5468\u4e8c_\u5468\u4e09_\u5468\u56db_\u5468\u4e94_\u5468\u516d'.split(
                    '_'
                ),
            weekdaysMin:
                '\u65e5_\u4e00_\u4e8c_\u4e09_\u56db_\u4e94_\u516d'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'YYYY/MM/DD',
                LL: 'YYYY\u5e74M\u6708D\u65e5',
                LLL: 'YYYY\u5e74M\u6708D\u65e5Ah\u70b9mm\u5206',
                LLLL: 'YYYY\u5e74M\u6708D\u65e5ddddAh\u70b9mm\u5206',
                l: 'YYYY/M/D',
                ll: 'YYYY\u5e74M\u6708D\u65e5',
                lll: 'YYYY\u5e74M\u6708D\u65e5 HH:mm',
                llll: 'YYYY\u5e74M\u6708D\u65e5dddd HH:mm',
            },
            meridiemParse:
                /\u51cc\u6668|\u65e9\u4e0a|\u4e0a\u5348|\u4e2d\u5348|\u4e0b\u5348|\u665a\u4e0a/,
            meridiemHour: function (e, a) {
                return (
                    12 === e && (e = 0),
                    '\u51cc\u6668' === a ||
                    '\u65e9\u4e0a' === a ||
                    '\u4e0a\u5348' === a
                        ? e
                        : '\u4e0b\u5348' === a || '\u665a\u4e0a' === a
                        ? e + 12
                        : 11 <= e
                        ? e
                        : e + 12
                );
            },
            meridiem: function (e, a, t) {
                var s = 100 * e + a;
                return s < 600
                    ? '\u51cc\u6668'
                    : s < 900
                    ? '\u65e9\u4e0a'
                    : s < 1130
                    ? '\u4e0a\u5348'
                    : s < 1230
                    ? '\u4e2d\u5348'
                    : s < 1800
                    ? '\u4e0b\u5348'
                    : '\u665a\u4e0a';
            },
            calendar: {
                sameDay: '[\u4eca\u5929]LT',
                nextDay: '[\u660e\u5929]LT',
                nextWeek: '[\u4e0b]ddddLT',
                lastDay: '[\u6628\u5929]LT',
                lastWeek: '[\u4e0a]ddddLT',
                sameElse: 'L',
            },
            dayOfMonthOrdinalParse: /\d{1,2}(\u65e5|\u6708|\u5468)/,
            ordinal: function (e, a) {
                switch (a) {
                    case 'd':
                    case 'D':
                    case 'DDD':
                        return e + '\u65e5';
                    case 'M':
                        return e + '\u6708';
                    case 'w':
                    case 'W':
                        return e + '\u5468';
                    default:
                        return e;
                }
            },
            relativeTime: {
                future: '%s\u5185',
                past: '%s\u524d',
                s: '\u51e0\u79d2',
                ss: '%d \u79d2',
                m: '1 \u5206\u949f',
                mm: '%d \u5206\u949f',
                h: '1 \u5c0f\u65f6',
                hh: '%d \u5c0f\u65f6',
                d: '1 \u5929',
                dd: '%d \u5929',
                M: '1 \u4e2a\u6708',
                MM: '%d \u4e2a\u6708',
                y: '1 \u5e74',
                yy: '%d \u5e74',
            },
            week: { dow: 1, doy: 4 },
        }),
        l.defineLocale('zh-hk', {
            months: '\u4e00\u6708_\u4e8c\u6708_\u4e09\u6708_\u56db\u6708_\u4e94\u6708_\u516d\u6708_\u4e03\u6708_\u516b\u6708_\u4e5d\u6708_\u5341\u6708_\u5341\u4e00\u6708_\u5341\u4e8c\u6708'.split(
                '_'
            ),
            monthsShort:
                '1\u6708_2\u6708_3\u6708_4\u6708_5\u6708_6\u6708_7\u6708_8\u6708_9\u6708_10\u6708_11\u6708_12\u6708'.split(
                    '_'
                ),
            weekdays:
                '\u661f\u671f\u65e5_\u661f\u671f\u4e00_\u661f\u671f\u4e8c_\u661f\u671f\u4e09_\u661f\u671f\u56db_\u661f\u671f\u4e94_\u661f\u671f\u516d'.split(
                    '_'
                ),
            weekdaysShort:
                '\u9031\u65e5_\u9031\u4e00_\u9031\u4e8c_\u9031\u4e09_\u9031\u56db_\u9031\u4e94_\u9031\u516d'.split(
                    '_'
                ),
            weekdaysMin:
                '\u65e5_\u4e00_\u4e8c_\u4e09_\u56db_\u4e94_\u516d'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'YYYY/MM/DD',
                LL: 'YYYY\u5e74M\u6708D\u65e5',
                LLL: 'YYYY\u5e74M\u6708D\u65e5 HH:mm',
                LLLL: 'YYYY\u5e74M\u6708D\u65e5dddd HH:mm',
                l: 'YYYY/M/D',
                ll: 'YYYY\u5e74M\u6708D\u65e5',
                lll: 'YYYY\u5e74M\u6708D\u65e5 HH:mm',
                llll: 'YYYY\u5e74M\u6708D\u65e5dddd HH:mm',
            },
            meridiemParse:
                /\u51cc\u6668|\u65e9\u4e0a|\u4e0a\u5348|\u4e2d\u5348|\u4e0b\u5348|\u665a\u4e0a/,
            meridiemHour: function (e, a) {
                return (
                    12 === e && (e = 0),
                    '\u51cc\u6668' === a ||
                    '\u65e9\u4e0a' === a ||
                    '\u4e0a\u5348' === a
                        ? e
                        : '\u4e2d\u5348' === a
                        ? 11 <= e
                            ? e
                            : e + 12
                        : '\u4e0b\u5348' === a || '\u665a\u4e0a' === a
                        ? e + 12
                        : void 0
                );
            },
            meridiem: function (e, a, t) {
                var s = 100 * e + a;
                return s < 600
                    ? '\u51cc\u6668'
                    : s < 900
                    ? '\u65e9\u4e0a'
                    : s < 1130
                    ? '\u4e0a\u5348'
                    : s < 1230
                    ? '\u4e2d\u5348'
                    : s < 1800
                    ? '\u4e0b\u5348'
                    : '\u665a\u4e0a';
            },
            calendar: {
                sameDay: '[\u4eca\u5929]LT',
                nextDay: '[\u660e\u5929]LT',
                nextWeek: '[\u4e0b]ddddLT',
                lastDay: '[\u6628\u5929]LT',
                lastWeek: '[\u4e0a]ddddLT',
                sameElse: 'L',
            },
            dayOfMonthOrdinalParse: /\d{1,2}(\u65e5|\u6708|\u9031)/,
            ordinal: function (e, a) {
                switch (a) {
                    case 'd':
                    case 'D':
                    case 'DDD':
                        return e + '\u65e5';
                    case 'M':
                        return e + '\u6708';
                    case 'w':
                    case 'W':
                        return e + '\u9031';
                    default:
                        return e;
                }
            },
            relativeTime: {
                future: '%s\u5167',
                past: '%s\u524d',
                s: '\u5e7e\u79d2',
                ss: '%d \u79d2',
                m: '1 \u5206\u9418',
                mm: '%d \u5206\u9418',
                h: '1 \u5c0f\u6642',
                hh: '%d \u5c0f\u6642',
                d: '1 \u5929',
                dd: '%d \u5929',
                M: '1 \u500b\u6708',
                MM: '%d \u500b\u6708',
                y: '1 \u5e74',
                yy: '%d \u5e74',
            },
        }),
        l.defineLocale('zh-tw', {
            months: '\u4e00\u6708_\u4e8c\u6708_\u4e09\u6708_\u56db\u6708_\u4e94\u6708_\u516d\u6708_\u4e03\u6708_\u516b\u6708_\u4e5d\u6708_\u5341\u6708_\u5341\u4e00\u6708_\u5341\u4e8c\u6708'.split(
                '_'
            ),
            monthsShort:
                '1\u6708_2\u6708_3\u6708_4\u6708_5\u6708_6\u6708_7\u6708_8\u6708_9\u6708_10\u6708_11\u6708_12\u6708'.split(
                    '_'
                ),
            weekdays:
                '\u661f\u671f\u65e5_\u661f\u671f\u4e00_\u661f\u671f\u4e8c_\u661f\u671f\u4e09_\u661f\u671f\u56db_\u661f\u671f\u4e94_\u661f\u671f\u516d'.split(
                    '_'
                ),
            weekdaysShort:
                '\u9031\u65e5_\u9031\u4e00_\u9031\u4e8c_\u9031\u4e09_\u9031\u56db_\u9031\u4e94_\u9031\u516d'.split(
                    '_'
                ),
            weekdaysMin:
                '\u65e5_\u4e00_\u4e8c_\u4e09_\u56db_\u4e94_\u516d'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'YYYY/MM/DD',
                LL: 'YYYY\u5e74M\u6708D\u65e5',
                LLL: 'YYYY\u5e74M\u6708D\u65e5 HH:mm',
                LLLL: 'YYYY\u5e74M\u6708D\u65e5dddd HH:mm',
                l: 'YYYY/M/D',
                ll: 'YYYY\u5e74M\u6708D\u65e5',
                lll: 'YYYY\u5e74M\u6708D\u65e5 HH:mm',
                llll: 'YYYY\u5e74M\u6708D\u65e5dddd HH:mm',
            },
            meridiemParse:
                /\u51cc\u6668|\u65e9\u4e0a|\u4e0a\u5348|\u4e2d\u5348|\u4e0b\u5348|\u665a\u4e0a/,
            meridiemHour: function (e, a) {
                return (
                    12 === e && (e = 0),
                    '\u51cc\u6668' === a ||
                    '\u65e9\u4e0a' === a ||
                    '\u4e0a\u5348' === a
                        ? e
                        : '\u4e2d\u5348' === a
                        ? 11 <= e
                            ? e
                            : e + 12
                        : '\u4e0b\u5348' === a || '\u665a\u4e0a' === a
                        ? e + 12
                        : void 0
                );
            },
            meridiem: function (e, a, t) {
                var s = 100 * e + a;
                return s < 600
                    ? '\u51cc\u6668'
                    : s < 900
                    ? '\u65e9\u4e0a'
                    : s < 1130
                    ? '\u4e0a\u5348'
                    : s < 1230
                    ? '\u4e2d\u5348'
                    : s < 1800
                    ? '\u4e0b\u5348'
                    : '\u665a\u4e0a';
            },
            calendar: {
                sameDay: '[\u4eca\u5929] LT',
                nextDay: '[\u660e\u5929] LT',
                nextWeek: '[\u4e0b]dddd LT',
                lastDay: '[\u6628\u5929] LT',
                lastWeek: '[\u4e0a]dddd LT',
                sameElse: 'L',
            },
            dayOfMonthOrdinalParse: /\d{1,2}(\u65e5|\u6708|\u9031)/,
            ordinal: function (e, a) {
                switch (a) {
                    case 'd':
                    case 'D':
                    case 'DDD':
                        return e + '\u65e5';
                    case 'M':
                        return e + '\u6708';
                    case 'w':
                    case 'W':
                        return e + '\u9031';
                    default:
                        return e;
                }
            },
            relativeTime: {
                future: '%s\u5167',
                past: '%s\u524d',
                s: '\u5e7e\u79d2',
                ss: '%d \u79d2',
                m: '1 \u5206\u9418',
                mm: '%d \u5206\u9418',
                h: '1 \u5c0f\u6642',
                hh: '%d \u5c0f\u6642',
                d: '1 \u5929',
                dd: '%d \u5929',
                M: '1 \u500b\u6708',
                MM: '%d \u500b\u6708',
                y: '1 \u5e74',
                yy: '%d \u5e74',
            },
        }),
        l.locale('en'),
        l
    );
});

/*!
Rescalendar.js - https://cesarchas.es/rescalendar
Licensed under the MIT license - http://opensource.org/licenses/MIT

Copyright (c) 2019 César Chas
*/

/*!
Rescalendar.js - https://cesarchas.es/rescalendar
Licensed under the MIT license - http://opensource.org/licenses/MIT

Copyright (c) 2019 César Chas
*/

(function ($) {
    $.fn.rescalendar = function (options) {
        function alert_error(error_message) {
            return [
                '<div class="error_wrapper">',

                '<div class="thumbnail_image vertical-center">',

                '<p>',
                '<span class="error">',
                error_message,
                '</span>',
                '</p>',
                '</div>',

                '</div>',
            ].join('');
        }

        function set_template(targetObj, settings) {
            var template = '',
                id = targetObj.attr('id') || '';

            if (id == '' || settings.dataKeyValues.length == 0) {
                targetObj.html(
                    alert_error(
                        settings.lang.init_error + ': No id or dataKeyValues'
                    )
                );
                return false;
            }

            if (settings.refDate.length != 10) {
                targetObj.html(alert_error(settings.lang.no_ref_date));
                return false;
            }

            template = settings.template_html(targetObj, settings);

            targetObj.html(template);

            return true;
        }

        function dateInRange(date, startDate, endDate) {
            if (date == startDate || date == endDate) {
                return true;
            }

            var date1 = moment(startDate, settings.format),
                date2 = moment(endDate, settings.format),
                date_compare = moment(date, settings.format);

            return date_compare.isBetween(date1, date2, null, '[]');
        }

        function dataInSet(data, name, date) {
            var obj_data = {};

            for (var i = 0; i < data.length; i++) {
                obj_data = data[i];

                if (
                    name == obj_data.name &&
                    dateInRange(date, obj_data.startDate, obj_data.endDate)
                ) {
                    return obj_data;
                }
            }

            return false;
        }

        function setData(targetObj, dataKeyValues, data) {
            var html = '',
                dataKeyValues = settings.dataKeyValues,
                data = settings.data,
                arr_dates = [],
                name = '',
                content = '',
                hasEventClass = '',
                customClass = '',
                classInSet = false,
                obj_data = {};

            targetObj.find('td.day_cell').each(function (index, value) {
                arr_dates.push($(this).attr('data-cellDate'));
            });

            for (var i = 0; i < dataKeyValues.length; i++) {
                content = '';
                date = '';
                name = dataKeyValues[i];

                html += '<tr class="dataRow">';
                html += '<td class="firstColumn">' + name + '</td>';

                for (var j = 0; j < arr_dates.length; j++) {
                    title = '';
                    date = arr_dates[j];
                    obj_data = dataInSet(data, name, date);

                    if (typeof obj_data === 'object') {
                        if (obj_data.title) {
                            title = ' title="' + obj_data.title + '" ';
                        }

                        content = '<a href="#" ' + title + '>&nbsp;</a>';
                        hasEventClass = 'hasEvent';
                        customClass = obj_data.customClass;
                    } else {
                        content = ' ';
                        hasEventClass = '';
                        customClass = '';
                    }

                    html +=
                        '<td data-date="' +
                        date +
                        '" data-name="' +
                        name +
                        '" class="data_cell ' +
                        hasEventClass +
                        ' ' +
                        customClass +
                        '">' +
                        content +
                        '</td>';
                }

                html += '</tr>';
            }

            targetObj.find('.rescalendar_data_rows').html(html);
        }

        function setDayCells(targetObj, refDate) {
            var format = settings.format,
                f_inicio = moment(refDate, format).subtract(
                    settings.jumpSize,
                    'days'
                ),
                f_fin = moment(refDate, format).add(settings.jumpSize, 'days'),
                today = moment().startOf('day'),
                html = '<td class="firstColumn"></td>',
                f_aux = '',
                f_aux_format = '',
                dia = '',
                dia_semana = '',
                num_dia_semana = 0,
                mes = '',
                clase_today = '',
                clase_middleDay = '',
                clase_disabled = '',
                middleDay = targetObj.find('input.refDate').val();

            for (var i = 0; i < settings.calSize + 1; i++) {
                clase_disabled = '';

                f_aux = moment(f_inicio).add(i, 'days');
                f_aux_format = f_aux.format(format);

                dia = f_aux.format('DD');
                mes = f_aux
                    .locale(settings.locale)
                    .format('MMM')
                    .replace('.', '');
                dia_semana = f_aux.locale(settings.locale).format('dd');
                num_dia_semana = f_aux.day();

                f_aux_format == today.format(format)
                    ? (clase_today = 'today')
                    : (clase_today = '');
                f_aux_format == middleDay
                    ? (clase_middleDay = 'middleDay')
                    : (clase_middleDay = '');

                if (
                    settings.disabledDays.indexOf(f_aux_format) > -1 ||
                    settings.disabledWeekDays.indexOf(num_dia_semana) > -1
                ) {
                    clase_disabled = 'disabledDay';
                }

                html += [
                    '<td class="day_cell ' +
                        clase_today +
                        ' ' +
                        clase_middleDay +
                        ' ' +
                        clase_disabled +
                        '" data-cellDate="' +
                        f_aux_format +
                        '"><div class="cell_inner">',
                    /*'<span class="dia_semana">' + dia_semana + '</span>',*/
                    '<span class="mes">' + mes + '</span>',
                    '<span class="dia">' + dia + '</span>',
                    '</div></td>',
                ].join('');
            }

            targetObj.find('.rescalendar_day_cells').html(html);

            addTdClickEvent(targetObj);

            setData(targetObj);
        }

        function addTdClickEvent(targetObj) {
            var day_cell = targetObj.find('td.day_cell');

            day_cell.on('click', function (e) {
                return;
                var cellDate =
                    e.currentTarget.attributes['data-cellDate'].value;

                targetObj.find('input.refDate').val(cellDate);

                setDayCells(targetObj, moment(cellDate, settings.format));
            });
        }

        function change_day(targetObj, action, num_days) {
            var refDate = targetObj.find('input.refDate').val(),
                f_ref = '';

            if (action == 'subtract') {
                f_ref = moment(refDate, settings.format).subtract(
                    num_days,
                    'days'
                );
            } else {
                f_ref = moment(refDate, settings.format).add(num_days, 'days');
            }

            targetObj.find('input.refDate').val(f_ref.format(settings.format));

            setDayCells(targetObj, f_ref);
        }

        // INITIALIZATION
        var settings = $.extend(
            {
                id: 'rescalendar',
                format: 'YYYY-MM-DD',
                refDate: moment().format('YYYY-MM-DD'),
                jumpSize: 15,
                calSize: 30,
                locale: 'en',
                disabledDays: [],
                disabledWeekDays: [],
                dataKeyField: 'name',
                dataKeyValues: [],
                data: {},

                lang: {
                    init_error: 'Error when initializing',
                    no_data_error: 'No data found',
                    no_ref_date: 'No refDate found',
                    today: 'Today',
                },

                template_html: function (targetObj, settings) {
                    var id = targetObj.attr('id'),
                        refDate = settings.refDate;

                    return [
                        '<div class="rescalendar ',
                        id,
                        '_wrapper">',

                        '<div class="rescalendar_controls">',

                        '<button class="move_to_last_month"> << </button>',
                        '<button class="move_to_yesterday"> < </button>',

                        '<input class="refDate" type="text" value="' +
                            refDate +
                            '" />',

                        '<button class="move_to_tomorrow"> > </button>',
                        '<button class="move_to_next_month"> >> </button>',

                        '<br>',
                        '<button class="move_to_today"> ' +
                            settings.lang.today +
                            ' </button>',

                        '</div>',

                        '<div class="rescalendar_table_wrapper"><button class="move_to_yesterday"></button><table class="rescalendar_table">',
                        '<thead>',
                        '<tr class="rescalendar_day_cells"></tr>',
                        '</thead>',
                        '<tbody class="rescalendar_data_rows">',

                        '</tbody>',
                        '</table><button class="move_to_tomorrow"></button></div>',

                        '</div>',
                    ].join('');
                },
            },
            options
        );

        return this.each(function () {
            var targetObj = $(this);

            set_template(targetObj, settings);

            setDayCells(targetObj, settings.refDate);

            // Events
            var move_to_last_month = targetObj.find('.move_to_last_month'),
                move_to_yesterday = targetObj.find('.move_to_yesterday'),
                move_to_tomorrow = targetObj.find('.move_to_tomorrow'),
                move_to_next_month = targetObj.find('.move_to_next_month'),
                move_to_today = targetObj.find('.move_to_today'),
                refDate = targetObj.find('.refDate');

            move_to_last_month.on('click', function (e) {
                change_day(targetObj, 'subtract', settings.jumpSize);
            });

            move_to_yesterday.on('click', function (e) {
                change_day(targetObj, 'subtract', 1);
            });

            move_to_tomorrow.on('click', function (e) {
                change_day(targetObj, 'add', 1);
            });

            move_to_next_month.on('click', function (e) {
                change_day(targetObj, 'add', settings.jumpSize);
            });

            refDate.on('blur', function (e) {
                var refDate = targetObj.find('input.refDate').val();
                setDayCells(targetObj, refDate);
            });

            move_to_today.on('click', function (e) {
                var today = moment().startOf('day').format(settings.format);
                targetObj.find('input.refDate').val(today);

                setDayCells(targetObj, today);
            });

            return this;
        });
    }; // end rescalendar plugin
})(jQuery);

/* END horizontal calendar */

/**
 * jquery.mask.js
 * @version: v1.14.11
 * @author: Igor Escobar
 *
 * Created by Igor Escobar on 2012-03-10. Please report any bug at http://blog.igorescobar.com
 *
 * Copyright (c) 2012 Igor Escobar http://blog.igorescobar.com
 *
 * The MIT License (http://www.opensource.org/licenses/mit-license.php)
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

/* jshint laxbreak: true */
/* jshint maxcomplexity:17 */
/* global define */

('use strict');

// UMD (Universal Module Definition) patterns for JavaScript modules that work everywhere.
// https://github.com/umdjs/umd/blob/master/jqueryPluginCommonjs.js
(function (factory, jQuery, Zepto) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('jquery'));
    } else {
        factory(jQuery || Zepto);
    }
})(
    function ($) {
        var Mask = function (el, mask, options) {
            var p = {
                invalid: [],
                getCaret: function () {
                    try {
                        var sel,
                            pos = 0,
                            ctrl = el.get(0),
                            dSel = document.selection,
                            cSelStart = ctrl.selectionStart;

                        // IE Support
                        if (
                            dSel &&
                            navigator.appVersion.indexOf('MSIE 10') === -1
                        ) {
                            sel = dSel.createRange();
                            sel.moveStart('character', -p.val().length);
                            pos = sel.text.length;
                        }
                        // Firefox support
                        else if (cSelStart || cSelStart === '0') {
                            pos = cSelStart;
                        }

                        return pos;
                    } catch (e) {}
                },
                setCaret: function (pos) {
                    try {
                        if (el.is(':focus')) {
                            var range,
                                ctrl = el.get(0);

                            // Firefox, WebKit, etc..
                            if (ctrl.setSelectionRange) {
                                ctrl.setSelectionRange(pos, pos);
                            } else {
                                // IE
                                range = ctrl.createTextRange();
                                range.collapse(true);
                                range.moveEnd('character', pos);
                                range.moveStart('character', pos);
                                range.select();
                            }
                        }
                    } catch (e) {}
                },
                events: function () {
                    el.on('keydown.mask', function (e) {
                        el.data('mask-keycode', e.keyCode || e.which);
                        el.data('mask-previus-value', el.val());
                        el.data('mask-previus-caret-pos', p.getCaret());
                        p.maskDigitPosMapOld = p.maskDigitPosMap;
                    })
                        .on(
                            $.jMaskGlobals.useInput
                                ? 'input.mask'
                                : 'keyup.mask',
                            p.behaviour
                        )
                        .on('paste.mask drop.mask', function () {
                            setTimeout(function () {
                                el.keydown().keyup();
                            }, 100);
                        })
                        .on('change.mask', function () {
                            el.data('changed', true);
                        })
                        .on('blur.mask', function () {
                            if (oldValue !== p.val() && !el.data('changed')) {
                                el.trigger('change');
                            }
                            el.data('changed', false);
                        })
                        // it's very important that this callback remains in this position
                        // otherwhise oldValue it's going to work buggy
                        .on('blur.mask', function () {
                            oldValue = p.val();
                        })
                        // select all text on focus
                        .on('focus.mask', function (e) {
                            if (options.selectOnFocus === true) {
                                $(e.target).select();
                            }
                        })
                        // clear the value if it not complete the mask
                        .on('focusout.mask', function () {
                            if (
                                options.clearIfNotMatch &&
                                !regexMask.test(p.val())
                            ) {
                                p.val('');
                            }
                        });
                },
                getRegexMask: function () {
                    var maskChunks = [],
                        translation,
                        pattern,
                        optional,
                        recursive,
                        oRecursive,
                        r;

                    for (var i = 0; i < mask.length; i++) {
                        translation = jMask.translation[mask.charAt(i)];

                        if (translation) {
                            pattern = translation.pattern
                                .toString()
                                .replace(/.{1}$|^.{1}/g, '');
                            optional = translation.optional;
                            recursive = translation.recursive;

                            if (recursive) {
                                maskChunks.push(mask.charAt(i));
                                oRecursive = {
                                    digit: mask.charAt(i),
                                    pattern: pattern,
                                };
                            } else {
                                maskChunks.push(
                                    !optional && !recursive
                                        ? pattern
                                        : pattern + '?'
                                );
                            }
                        } else {
                            maskChunks.push(
                                mask
                                    .charAt(i)
                                    .replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
                            );
                        }
                    }

                    r = maskChunks.join('');

                    if (oRecursive) {
                        r = r
                            .replace(
                                new RegExp(
                                    '(' +
                                        oRecursive.digit +
                                        '(.*' +
                                        oRecursive.digit +
                                        ')?)'
                                ),
                                '($1)?'
                            )
                            .replace(
                                new RegExp(oRecursive.digit, 'g'),
                                oRecursive.pattern
                            );
                    }

                    return new RegExp(r);
                },
                destroyEvents: function () {
                    el.off(
                        [
                            'input',
                            'keydown',
                            'keyup',
                            'paste',
                            'drop',
                            'blur',
                            'focusout',
                            '',
                        ].join('.mask ')
                    );
                },
                val: function (v) {
                    var isInput = el.is('input'),
                        method = isInput ? 'val' : 'text',
                        r;

                    if (arguments.length > 0) {
                        if (el[method]() !== v) {
                            el[method](v);
                        }
                        r = el;
                    } else {
                        r = el[method]();
                    }

                    return r;
                },
                calculateCaretPosition: function () {
                    var oldVal = el.data('mask-previus-value') || '',
                        newVal = p.getMasked(),
                        caretPosNew = p.getCaret();
                    if (oldVal !== newVal) {
                        var caretPosOld =
                                el.data('mask-previus-caret-pos') || 0,
                            newValL = newVal.length,
                            oldValL = oldVal.length,
                            maskDigitsBeforeCaret = 0,
                            maskDigitsAfterCaret = 0,
                            maskDigitsBeforeCaretAll = 0,
                            maskDigitsBeforeCaretAllOld = 0,
                            i = 0;

                        for (i = caretPosNew; i < newValL; i++) {
                            if (!p.maskDigitPosMap[i]) {
                                break;
                            }
                            maskDigitsAfterCaret++;
                        }

                        for (i = caretPosNew - 1; i >= 0; i--) {
                            if (!p.maskDigitPosMap[i]) {
                                break;
                            }
                            maskDigitsBeforeCaret++;
                        }

                        for (i = caretPosNew - 1; i >= 0; i--) {
                            if (p.maskDigitPosMap[i]) {
                                maskDigitsBeforeCaretAll++;
                            }
                        }

                        for (i = caretPosOld - 1; i >= 0; i--) {
                            if (p.maskDigitPosMapOld[i]) {
                                maskDigitsBeforeCaretAllOld++;
                            }
                        }

                        if (caretPosNew > oldValL) {
                            // if the cursor is at the end keep it there
                            caretPosNew = newValL;
                        } else if (
                            caretPosOld >= caretPosNew &&
                            caretPosOld !== oldValL
                        ) {
                            if (!p.maskDigitPosMapOld[caretPosNew]) {
                                var caretPos = caretPosNew;
                                caretPosNew -=
                                    maskDigitsBeforeCaretAllOld -
                                    maskDigitsBeforeCaretAll;
                                caretPosNew -= maskDigitsBeforeCaret;
                                if (p.maskDigitPosMap[caretPosNew]) {
                                    caretPosNew = caretPos;
                                }
                            }
                        } else if (caretPosNew > caretPosOld) {
                            caretPosNew +=
                                maskDigitsBeforeCaretAll -
                                maskDigitsBeforeCaretAllOld;
                            caretPosNew += maskDigitsAfterCaret;
                        }
                    }
                    return caretPosNew;
                },
                behaviour: function (e) {
                    e = e || window.event;
                    p.invalid = [];

                    var keyCode = el.data('mask-keycode');

                    if ($.inArray(keyCode, jMask.byPassKeys) === -1) {
                        var newVal = p.getMasked(),
                            caretPos = p.getCaret();

                        setTimeout(function () {
                            p.setCaret(p.calculateCaretPosition());
                        }, 10);

                        p.val(newVal);
                        p.setCaret(caretPos);
                        return p.callbacks(e);
                    }
                },
                getMasked: function (skipMaskChars, val) {
                    var buf = [],
                        value = val === undefined ? p.val() : val + '',
                        m = 0,
                        maskLen = mask.length,
                        v = 0,
                        valLen = value.length,
                        offset = 1,
                        addMethod = 'push',
                        resetPos = -1,
                        maskDigitCount = 0,
                        maskDigitPosArr = [],
                        lastMaskChar,
                        check;

                    if (options.reverse) {
                        addMethod = 'unshift';
                        offset = -1;
                        lastMaskChar = 0;
                        m = maskLen - 1;
                        v = valLen - 1;
                        check = function () {
                            return m > -1 && v > -1;
                        };
                    } else {
                        lastMaskChar = maskLen - 1;
                        check = function () {
                            return m < maskLen && v < valLen;
                        };
                    }

                    var lastUntranslatedMaskChar;
                    while (check()) {
                        var maskDigit = mask.charAt(m),
                            valDigit = value.charAt(v),
                            translation = jMask.translation[maskDigit];

                        if (translation) {
                            if (valDigit.match(translation.pattern)) {
                                buf[addMethod](valDigit);
                                if (translation.recursive) {
                                    if (resetPos === -1) {
                                        resetPos = m;
                                    } else if (m === lastMaskChar) {
                                        m = resetPos - offset;
                                    }

                                    if (lastMaskChar === resetPos) {
                                        m -= offset;
                                    }
                                }
                                m += offset;
                            } else if (valDigit === lastUntranslatedMaskChar) {
                                // matched the last untranslated (raw) mask character that we encountered
                                // likely an insert offset the mask character from the last entry; fall
                                // through and only increment v
                                maskDigitCount--;
                                lastUntranslatedMaskChar = undefined;
                            } else if (translation.optional) {
                                m += offset;
                                v -= offset;
                            } else if (translation.fallback) {
                                buf[addMethod](translation.fallback);
                                m += offset;
                                v -= offset;
                            } else {
                                p.invalid.push({
                                    p: v,
                                    v: valDigit,
                                    e: translation.pattern,
                                });
                            }
                            v += offset;
                        } else {
                            if (!skipMaskChars) {
                                buf[addMethod](maskDigit);
                            }

                            if (valDigit === maskDigit) {
                                maskDigitPosArr.push(v);
                                v += offset;
                            } else {
                                lastUntranslatedMaskChar = maskDigit;
                                maskDigitPosArr.push(v + maskDigitCount);
                                maskDigitCount++;
                            }

                            m += offset;
                        }
                    }

                    var lastMaskCharDigit = mask.charAt(lastMaskChar);
                    if (
                        maskLen === valLen + 1 &&
                        !jMask.translation[lastMaskCharDigit]
                    ) {
                        buf.push(lastMaskCharDigit);
                    }

                    var newVal = buf.join('');
                    p.mapMaskdigitPositions(newVal, maskDigitPosArr, valLen);
                    return newVal;
                },
                mapMaskdigitPositions: function (
                    newVal,
                    maskDigitPosArr,
                    valLen
                ) {
                    var maskDiff = options.reverse ? newVal.length - valLen : 0;
                    p.maskDigitPosMap = {};
                    for (var i = 0; i < maskDigitPosArr.length; i++) {
                        p.maskDigitPosMap[maskDigitPosArr[i] + maskDiff] = 1;
                    }
                },
                callbacks: function (e) {
                    var val = p.val(),
                        changed = val !== oldValue,
                        defaultArgs = [val, e, el, options],
                        callback = function (name, criteria, args) {
                            if (
                                typeof options[name] === 'function' &&
                                criteria
                            ) {
                                options[name].apply(this, args);
                            }
                        };

                    callback('onChange', changed === true, defaultArgs);
                    callback('onKeyPress', changed === true, defaultArgs);
                    callback(
                        'onComplete',
                        val.length === mask.length,
                        defaultArgs
                    );
                    callback('onInvalid', p.invalid.length > 0, [
                        val,
                        e,
                        el,
                        p.invalid,
                        options,
                    ]);
                },
            };

            el = $(el);
            var jMask = this,
                oldValue = p.val(),
                regexMask;

            mask =
                typeof mask === 'function'
                    ? mask(p.val(), undefined, el, options)
                    : mask;

            // public methods
            jMask.mask = mask;
            jMask.options = options;
            jMask.remove = function () {
                var caret = p.getCaret();
                p.destroyEvents();
                p.val(jMask.getCleanVal());
                p.setCaret(caret);
                return el;
            };

            // get value without mask
            jMask.getCleanVal = function () {
                return p.getMasked(true);
            };

            // get masked value without the value being in the input or element
            jMask.getMaskedVal = function (val) {
                return p.getMasked(false, val);
            };

            jMask.init = function (onlyMask) {
                onlyMask = onlyMask || false;
                options = options || {};

                jMask.clearIfNotMatch = $.jMaskGlobals.clearIfNotMatch;
                jMask.byPassKeys = $.jMaskGlobals.byPassKeys;
                jMask.translation = $.extend(
                    {},
                    $.jMaskGlobals.translation,
                    options.translation
                );

                jMask = $.extend(true, {}, jMask, options);

                regexMask = p.getRegexMask();

                if (onlyMask) {
                    p.events();
                    p.val(p.getMasked());
                } else {
                    if (options.placeholder) {
                        el.attr('placeholder', options.placeholder);
                    }

                    // this is necessary, otherwise if the user submit the form
                    // and then press the "back" button, the autocomplete will erase
                    // the data. Works fine on IE9+, FF, Opera, Safari.
                    if (el.data('mask')) {
                        el.attr('autocomplete', 'off');
                    }

                    // detect if is necessary let the user type freely.
                    // for is a lot faster than forEach.
                    for (var i = 0, maxlength = true; i < mask.length; i++) {
                        var translation = jMask.translation[mask.charAt(i)];
                        if (translation && translation.recursive) {
                            maxlength = false;
                            break;
                        }
                    }

                    if (maxlength) {
                        el.attr('maxlength', mask.length);
                    }

                    p.destroyEvents();
                    p.events();

                    var caret = p.getCaret();
                    p.val(p.getMasked());
                    p.setCaret(caret);
                }
            };

            jMask.init(!el.is('input'));
        };

        $.maskWatchers = {};
        var HTMLAttributes = function () {
                var input = $(this),
                    options = {},
                    prefix = 'data-mask-',
                    mask = input.attr('data-mask');

                if (input.attr(prefix + 'reverse')) {
                    options.reverse = true;
                }

                if (input.attr(prefix + 'clearifnotmatch')) {
                    options.clearIfNotMatch = true;
                }

                if (input.attr(prefix + 'selectonfocus') === 'true') {
                    options.selectOnFocus = true;
                }

                if (notSameMaskObject(input, mask, options)) {
                    return input.data('mask', new Mask(this, mask, options));
                }
            },
            notSameMaskObject = function (field, mask, options) {
                options = options || {};
                var maskObject = $(field).data('mask'),
                    stringify = JSON.stringify,
                    value = $(field).val() || $(field).text();
                try {
                    if (typeof mask === 'function') {
                        mask = mask(value);
                    }
                    return (
                        typeof maskObject !== 'object' ||
                        stringify(maskObject.options) !== stringify(options) ||
                        maskObject.mask !== mask
                    );
                } catch (e) {}
            },
            eventSupported = function (eventName) {
                var el = document.createElement('div'),
                    isSupported;

                eventName = 'on' + eventName;
                isSupported = eventName in el;

                if (!isSupported) {
                    el.setAttribute(eventName, 'return;');
                    isSupported = typeof el[eventName] === 'function';
                }
                el = null;

                return isSupported;
            };

        $.fn.mask = function (mask, options) {
            options = options || {};
            var selector = this.selector,
                globals = $.jMaskGlobals,
                interval = globals.watchInterval,
                watchInputs = options.watchInputs || globals.watchInputs,
                maskFunction = function () {
                    if (notSameMaskObject(this, mask, options)) {
                        return $(this).data(
                            'mask',
                            new Mask(this, mask, options)
                        );
                    }
                };

            $(this).each(maskFunction);

            if (selector && selector !== '' && watchInputs) {
                clearInterval($.maskWatchers[selector]);
                $.maskWatchers[selector] = setInterval(function () {
                    $(document).find(selector).each(maskFunction);
                }, interval);
            }
            return this;
        };

        $.fn.masked = function (val) {
            return this.data('mask').getMaskedVal(val);
        };

        $.fn.unmask = function () {
            clearInterval($.maskWatchers[this.selector]);
            delete $.maskWatchers[this.selector];
            return this.each(function () {
                var dataMask = $(this).data('mask');
                if (dataMask) {
                    dataMask.remove().removeData('mask');
                }
            });
        };

        $.fn.cleanVal = function () {
            return this.data('mask').getCleanVal();
        };

        $.applyDataMask = function (selector) {
            selector = selector || $.jMaskGlobals.maskElements;
            var $selector = selector instanceof $ ? selector : $(selector);
            $selector.filter($.jMaskGlobals.dataMaskAttr).each(HTMLAttributes);
        };

        var globals = {
            maskElements: 'input,td,span,div',
            dataMaskAttr: '*[data-mask]',
            dataMask: true,
            watchInterval: 300,
            watchInputs: true,
            // old versions of chrome dont work great with input event
            useInput:
                !/Chrome\/[2-4][0-9]|SamsungBrowser/.test(
                    window.navigator.userAgent
                ) && eventSupported('input'),
            watchDataMask: false,
            byPassKeys: [9, 16, 17, 18, 36, 37, 38, 39, 40, 91],
            translation: {
                0: { pattern: /\d/ },
                9: { pattern: /\d/, optional: true },
                '#': { pattern: /\d/, recursive: true },
                A: { pattern: /[a-zA-Z0-9]/ },
                S: { pattern: /[a-zA-Z]/ },
            },
        };

        $.jMaskGlobals = $.jMaskGlobals || {};
        globals = $.jMaskGlobals = $.extend(true, {}, globals, $.jMaskGlobals);

        // looking for inputs with data-mask attribute
        if (globals.dataMask) {
            $.applyDataMask();
        }

        setInterval(function () {
            if ($.jMaskGlobals.watchDataMask) {
                $.applyDataMask();
            }
        }, globals.watchInterval);
    },
    window.jQuery,
    window.Zepto
);

/* START circle chart */

/**!
 * easy-pie-chart
 * Lightweight plugin to render simple, animated and retina optimized pie charts
 *
 * @license
 * @author Robert Fleischmann <rendro87@gmail.com> (http://robert-fleischmann.de)
 * @version 2.1.7
 **/
!(function (a, b) {
    'function' == typeof define && define.amd
        ? define(['jquery'], function (a) {
              return b(a);
          })
        : 'object' == typeof exports
        ? (module.exports = b(require('jquery')))
        : b(jQuery);
})(this, function (a) {
    var b = function (a, b) {
            var c,
                d = document.createElement('canvas');
            a.appendChild(d),
                'object' == typeof G_vmlCanvasManager &&
                    G_vmlCanvasManager.initElement(d);
            var e = d.getContext('2d');
            d.width = d.height = b.size;
            var f = 1;
            window.devicePixelRatio > 1 &&
                ((f = window.devicePixelRatio),
                (d.style.width = d.style.height = [b.size, 'px'].join('')),
                (d.width = d.height = b.size * f),
                e.scale(f, f)),
                e.translate(b.size / 2, b.size / 2),
                e.rotate((-0.5 + b.rotate / 180) * Math.PI);
            var g = (b.size - b.lineWidth) / 2;
            b.scaleColor && b.scaleLength && (g -= b.scaleLength + 2),
                (Date.now =
                    Date.now ||
                    function () {
                        return +new Date();
                    });
            var h = function (a, b, c) {
                    c = Math.min(Math.max(-1, c || 0), 1);
                    var d = 0 >= c ? !0 : !1;
                    e.beginPath(),
                        e.arc(0, 0, g, 0, 2 * Math.PI * c, d),
                        (e.strokeStyle = a),
                        (e.lineWidth = b),
                        e.stroke();
                },
                i = function () {
                    var a, c;
                    (e.lineWidth = 1), (e.fillStyle = b.scaleColor), e.save();
                    for (var d = 24; d > 0; --d)
                        d % 6 === 0
                            ? ((c = b.scaleLength), (a = 0))
                            : ((c = 0.6 * b.scaleLength),
                              (a = b.scaleLength - c)),
                            e.fillRect(-b.size / 2 + a, 0, c, 1),
                            e.rotate(Math.PI / 12);
                    e.restore();
                },
                j = (function () {
                    return (
                        window.requestAnimationFrame ||
                        window.webkitRequestAnimationFrame ||
                        window.mozRequestAnimationFrame ||
                        function (a) {
                            window.setTimeout(a, 1e3 / 60);
                        }
                    );
                })(),
                k = function () {
                    b.scaleColor && i(),
                        b.trackColor &&
                            h(b.trackColor, b.trackWidth || b.lineWidth, 1);
                };
            (this.getCanvas = function () {
                return d;
            }),
                (this.getCtx = function () {
                    return e;
                }),
                (this.clear = function () {
                    e.clearRect(b.size / -2, b.size / -2, b.size, b.size);
                }),
                (this.draw = function (a) {
                    b.scaleColor || b.trackColor
                        ? e.getImageData && e.putImageData
                            ? c
                                ? e.putImageData(c, 0, 0)
                                : (k(),
                                  (c = e.getImageData(
                                      0,
                                      0,
                                      b.size * f,
                                      b.size * f
                                  )))
                            : (this.clear(), k())
                        : this.clear(),
                        (e.lineCap = b.lineCap);
                    var d;
                    (d =
                        'function' == typeof b.barColor
                            ? b.barColor(a)
                            : b.barColor),
                        h(d, b.lineWidth, a / 100);
                }.bind(this)),
                (this.animate = function (a, c) {
                    var d = Date.now();
                    b.onStart(a, c);
                    var e = function () {
                        var f = Math.min(Date.now() - d, b.animate.duration),
                            g = b.easing(this, f, a, c - a, b.animate.duration);
                        this.draw(g),
                            b.onStep(a, c, g),
                            f >= b.animate.duration ? b.onStop(a, c) : j(e);
                    }.bind(this);
                    j(e);
                }.bind(this));
        },
        c = function (a, c) {
            var d = {
                barColor: '#ef1e25',
                trackColor: '#f9f9f9',
                scaleColor: '#dfe0e0',
                scaleLength: 5,
                lineCap: 'round',
                lineWidth: 3,
                trackWidth: void 0,
                size: 110,
                rotate: 0,
                animate: { duration: 1e3, enabled: !0 },
                easing: function (a, b, c, d, e) {
                    return (
                        (b /= e / 2),
                        1 > b
                            ? (d / 2) * b * b + c
                            : (-d / 2) * (--b * (b - 2) - 1) + c
                    );
                },
                onStart: function (a, b) {},
                onStep: function (a, b, c) {},
                onStop: function (a, b) {},
            };
            if ('undefined' != typeof b) d.renderer = b;
            else {
                if ('undefined' == typeof SVGRenderer)
                    throw new Error(
                        'Please load either the SVG- or the CanvasRenderer'
                    );
                d.renderer = SVGRenderer;
            }
            var e = {},
                f = 0,
                g = function () {
                    (this.el = a), (this.options = e);
                    for (var b in d)
                        d.hasOwnProperty(b) &&
                            ((e[b] =
                                c && 'undefined' != typeof c[b] ? c[b] : d[b]),
                            'function' == typeof e[b] &&
                                (e[b] = e[b].bind(this)));
                    'string' == typeof e.easing &&
                    'undefined' != typeof jQuery &&
                    jQuery.isFunction(jQuery.easing[e.easing])
                        ? (e.easing = jQuery.easing[e.easing])
                        : (e.easing = d.easing),
                        'number' == typeof e.animate &&
                            (e.animate = { duration: e.animate, enabled: !0 }),
                        'boolean' != typeof e.animate ||
                            e.animate ||
                            (e.animate = { duration: 1e3, enabled: e.animate }),
                        (this.renderer = new e.renderer(a, e)),
                        this.renderer.draw(f),
                        a.dataset && a.dataset.percent
                            ? this.update(parseFloat(a.dataset.percent))
                            : a.getAttribute &&
                              a.getAttribute('data-percent') &&
                              this.update(
                                  parseFloat(a.getAttribute('data-percent'))
                              );
                }.bind(this);
            (this.update = function (a) {
                return (
                    (a = parseFloat(a)),
                    e.animate.enabled
                        ? this.renderer.animate(f, a)
                        : this.renderer.draw(a),
                    (f = a),
                    this
                );
            }.bind(this)),
                (this.disableAnimation = function () {
                    return (e.animate.enabled = !1), this;
                }),
                (this.enableAnimation = function () {
                    return (e.animate.enabled = !0), this;
                }),
                g();
        };
    a.fn.easyPieChart = function (b) {
        return this.each(function () {
            var d;
            a.data(this, 'easyPieChart') ||
                ((d = a.extend({}, b, a(this).data())),
                a.data(this, 'easyPieChart', new c(this, d)));
        });
    };
});

/* END circle chart */