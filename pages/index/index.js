//index.js
//获取应用实例

Component({
  pageLifetimes: {
    show() {
      if (typeof this.getTabBar === 'function' &&
        this.getTabBar()) {
        this.getTabBar().setData({
          selected: 0
        })
      }
    }
  },

  created () {
    wx.showShareMenu({
      withShareTicket: true
    })
    this.getImgData()
    this.getDateRange()
  },

  data: {
    imageWidth: wx.getSystemInfoSync().windowWidth / 2,
    images: [[], [], []],
    typeArr: [
      { name: '每日', value: 'daily', index: 0 },
      { name: '每周', value: 'weekly', index: 1 },
      { name: '每月', value: 'monthly', index: 2 }
    ],
    barIndex: 0,
    oldBarIndex: 0,
    barScrollLeft: 0,
    filter: {
      mode: 'daily',
      content: 'illust',
      date: '',
      page: 1,
      limit: 10
    },
    maxPage: 0,
    scrollTopArr: [0, 0, 0, 0],
    disabled: false,
    // 布局方式
    viewType: 1,
    startDate: null,
    endDate: null,
    dateValue: null,
    // 回到顶部
    showTop: false
  },
  methods: {
    getImgData () {
      wx.showLoading({
        title: '玩命加载中...',
      })
      this.setData({
        disabled: true
      })
      var _this = this
      const p = JSON.stringify(this.data.filter)
      const s = this.s(p)
      wx.request({
        url: 'https://img.tanzijun.com/api/ranking',
        data: {..._this.data.filter, p: p, s: s},
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(res) {
          if (res.data && res.data.data.length) {
            _this.setData({
              maxPage: Math.ceil(res.data.total / _this.data.filter.limit)
            })
            const newData = res.data.data.map(item => {
              if (item.illust_tags && item.illust_tags.length) {
                item.illust_tags = item.illust_tags.filter(i => {
                  if (i.indexOf('加入书籤') > -1) {
                    return false
                  } else if (i.indexOf('users入') > -1) {
                    return false
                  } else if (i.indexOf('原创') > -1 && i.indexOf('收藏') > -1) {
                    return false
                  }
                  return true
                })
              }
              return item
            }).sort((i, j) => i.length - j.length)
            let data = []
            if (_this.data.filter.page == 1) {
              data = newData
            } else {
              data = _this.data.images[_this.data.barIndex].concat(newData)
            }

            let images = _this.data.images
            images[_this.data.barIndex] = data
            _this.setData({
              images: images,
              disabled: false
            })
          }
          wx.hideLoading()
        },
        fail () {
          wx.hideLoading()
          _this.setData({
            disabled: false
          })
        }
      })
    },

    getDateRange () {
      const _this = this
      wx.request({
        url: 'https://img.tanzijun.com/api/ranking/date',
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(res) {
          const daterange = res.data.daterange
          const images = _this.data.images
          if (images.length < res.data.typeArr.length) {
            let length = res.data.typeArr.length - images.length
            for (let i = 0; i < length; i++) {
              images.push([])
            }
          }
          _this.setData({
            startDate: daterange[0],
            endDate: daterange[1],
            dateValue: daterange[1],
            typeArr: res.data.typeArr,
            images: images
          })
        }
      })
    },

    dateChange (e) {
      const date = e.detail.value
      const images = this.data.typeArr.map(i => [])
      this.setData({
        'filter.date': date,
        'filter.page': 1,
        images: images,
        scrollTopArr: [0, 0, 0]
      })
      this.getImgData()
    },

    // 切换排行类型
    moveBar (e) {
      const item = e.target.dataset.item
      this.setData({
        oldBarIndex: this.data.barIndex,
        barIndex: item.index
      })
    },

    swipChange (e) {
      const item = this.data.typeArr[e.detail.current]
      if (this.data.barIndex != item.index) {
        this.setData({
          oldBarIndex: this.data.barIndex,
          barIndex: item.index
        })
      }
      
      this.toggle(item)
    },

    toggle (item) {
      this.setData({
        barScrollLeft: (item.index - 2) * wx.getSystemInfoSync().windowWidth / 4
      })
      this.setData({
        'filter.mode': item.value,
        'filter.page': 1,
      })
      const images = this.data.images.map(item => {
        return item.splice(0, 10)
      })
      this.setData({
        images: images
      })
      if (!images[item.index].length) {
        setTimeout(() => {
          this.getImgData()
        }, 300)
      }
      const index = this.data.oldBarIndex
      setTimeout(() => {
        var key = 'scrollTopArr[' + index + ']'
        this.setData({
          [key]: 0
        })
      }, 700)
    },

    // 详情页
    goDetail (e) {
      let item = e.currentTarget.dataset.item
      wx.navigateTo({
        url: '/pages/index/detail?id=' + item.illust_id,
      })
    },

    // 切换布局
    toggleView (e) {
      this.setData({
        scrollTopArr: [0, 0, 0],
        viewType: e.currentTarget.dataset.type - 0
      })
    },

    pullUp () {
      if (this.data.filter.page + 1 <= this.data.maxPage) {
        this.setData({
          'filter.page': this.data.filter.page + 1
        })
        this.getImgData()
      } else {
        wx.showToast({
          title: '没有更多了',
          icon: 'success',
          duration: 1000
        })
      }
    },

    scroll (e) {
      const deviceHeight = wx.getSystemInfoSync().windowHeight
      const showTop = e.detail.scrollTop > deviceHeight
      if (showTop !== this.data.showTop) {
        this.setData({
          showTop: e.detail.scrollTop > deviceHeight
        })
      }
    },

    goTop () {
      var key = 'scrollTopArr[' + this.data.barIndex + ']'
      this.setData({
        [key]: 0
      })
    },

    s(e) {
      function t(e, t) {
        return e << t | e >>> 32 - t
      }
      function n(e, t) {
        var n, r, o, i, a;
        return o = 2147483648 & e,
          i = 2147483648 & t,
          n = 1073741824 & e,
          r = 1073741824 & t,
          a = (1073741823 & e) + (1073741823 & t),
          n & r ? 2147483648 ^ a ^ o ^ i : n | r ? 1073741824 & a ? 3221225472 ^ a ^ o ^ i : 1073741824 ^ a ^ o ^ i : a ^ o ^ i
      }
      function r(e, t, n) {
        return e & t | ~e & n
      }
      function o(e, t, n) {
        return e & n | t & ~n
      }
      function i(e, t, n) {
        return e ^ t ^ n
      }
      function a(e, t, n) {
        return t ^ (e | ~n)
      }
      function l(e, o, i, a, l, s, u) {
        return e = n(e, n(n(r(o, i, a), l), u)),
          n(t(e, s), o)
      }
      function s(e, r, i, a, l, s, u) {
        return e = n(e, n(n(o(r, i, a), l), u)),
          n(t(e, s), r)
      }
      function u(e, r, o, a, l, s, u) {
        return e = n(e, n(n(i(r, o, a), l), u)),
          n(t(e, s), r)
      }
      function c(e, r, o, i, l, s, u) {
        return e = n(e, n(n(a(r, o, i), l), u)),
          n(t(e, s), r)
      }
      function p(e) {
        for (var t, n = e.length, r = n + 8, o = 16 * ((r - r % 64) / 64 + 1), i = new Array(o - 1), a = 0, l = 0; n > l;)
          t = (l - l % 4) / 4,
            a = l % 4 * 8,
            i[t] = i[t] | e.charCodeAt(l) << a,
            l++;
        return t = (l - l % 4) / 4,
          a = l % 4 * 8,
          i[t] = i[t] | 128 << a,
          i[o - 2] = n << 3,
          i[o - 1] = n >>> 29,
          i
      }
      function f(e) {
        var t, n, r = "", o = "";
        for (n = 0; 3 >= n; n++)
          t = e >>> 8 * n & 255,
            o = "0" + t.toString(16),
            r += o.substr(o.length - 2, 2);
        return r
      }
      function d(e) {
        e = e.replace(/\r\n/g, "\n");
        for (var t = "", n = 0; n < e.length; n++) {
          var r = e.charCodeAt(n);
          128 > r ? t += String.fromCharCode(r) : r > 127 && 2048 > r ? (t += String.fromCharCode(r >> 6 | 192),
            t += String.fromCharCode(63 & r | 128)) : (t += String.fromCharCode(r >> 12 | 224),
              t += String.fromCharCode(r >> 6 & 63 | 128),
              t += String.fromCharCode(63 & r | 128))
        }
        return t
      }
      var h, m, y, g, b, v, w, _, x, O = [], T = 7, P = 12, S = 17, E = 22, k = 5, C = 9, j = 14, A = 20, I = 4, N = 11, R = 16, M = 23, L = 6, D = 10, F = 15, B = 21;
      for (e = d(e),
        O = p(e),
        v = 1732584193,
        w = 4023233417,
        _ = 2562383102,
        x = 271733878,
        h = 0; h < O.length; h += 16)
        m = v,
          y = w,
          g = _,
          b = x,
          v = l(v, w, _, x, O[h + 0], T, 3614090360),
          x = l(x, v, w, _, O[h + 1], P, 3905402710),
          _ = l(_, x, v, w, O[h + 2], S, 606105819),
          w = l(w, _, x, v, O[h + 3], E, 3250441966),
          v = l(v, w, _, x, O[h + 4], T, 4118548399),
          x = l(x, v, w, _, O[h + 5], P, 1200080426),
          _ = l(_, x, v, w, O[h + 6], S, 2821735955),
          w = l(w, _, x, v, O[h + 7], E, 4249261313),
          v = l(v, w, _, x, O[h + 8], T, 1770035416),
          x = l(x, v, w, _, O[h + 9], P, 2336552879),
          _ = l(_, x, v, w, O[h + 10], S, 4294925233),
          w = l(w, _, x, v, O[h + 11], E, 2304563134),
          v = l(v, w, _, x, O[h + 12], T, 1804603682),
          x = l(x, v, w, _, O[h + 13], P, 4254626195),
          _ = l(_, x, v, w, O[h + 14], S, 2792965006),
          w = l(w, _, x, v, O[h + 15], E, 1236535329),
          v = s(v, w, _, x, O[h + 1], k, 4129170786),
          x = s(x, v, w, _, O[h + 6], C, 3225465664),
          _ = s(_, x, v, w, O[h + 11], j, 643717713),
          w = s(w, _, x, v, O[h + 0], A, 3921069994),
          v = s(v, w, _, x, O[h + 5], k, 3593408605),
          x = s(x, v, w, _, O[h + 10], C, 38016083),
          _ = s(_, x, v, w, O[h + 15], j, 3634488961),
          w = s(w, _, x, v, O[h + 4], A, 3889429448),
          v = s(v, w, _, x, O[h + 9], k, 568446438),
          x = s(x, v, w, _, O[h + 14], C, 3275163606),
          _ = s(_, x, v, w, O[h + 3], j, 4107603335),
          w = s(w, _, x, v, O[h + 8], A, 1163531501),
          v = s(v, w, _, x, O[h + 13], k, 2850285829),
          x = s(x, v, w, _, O[h + 2], C, 4243563512),
          _ = s(_, x, v, w, O[h + 7], j, 1735328473),
          w = s(w, _, x, v, O[h + 12], A, 2368359562),
          v = u(v, w, _, x, O[h + 5], I, 4294588738),
          x = u(x, v, w, _, O[h + 8], N, 2272392833),
          _ = u(_, x, v, w, O[h + 11], R, 1839030562),
          w = u(w, _, x, v, O[h + 14], M, 4259657740),
          v = u(v, w, _, x, O[h + 1], I, 2763975236),
          x = u(x, v, w, _, O[h + 4], N, 1272893353),
          _ = u(_, x, v, w, O[h + 7], R, 4139469664),
          w = u(w, _, x, v, O[h + 10], M, 3200236656),
          v = u(v, w, _, x, O[h + 13], I, 681279174),
          x = u(x, v, w, _, O[h + 0], N, 3936430074),
          _ = u(_, x, v, w, O[h + 3], R, 3572445317),
          w = u(w, _, x, v, O[h + 6], M, 76029189),
          v = u(v, w, _, x, O[h + 9], I, 3654602809),
          x = u(x, v, w, _, O[h + 12], N, 3873151461),
          _ = u(_, x, v, w, O[h + 15], R, 530742520),
          w = u(w, _, x, v, O[h + 2], M, 3299628645),
          v = c(v, w, _, x, O[h + 0], L, 4096336452),
          x = c(x, v, w, _, O[h + 7], D, 1126891415),
          _ = c(_, x, v, w, O[h + 14], F, 2878612391),
          w = c(w, _, x, v, O[h + 5], B, 4237533241),
          v = c(v, w, _, x, O[h + 12], L, 1700485571),
          x = c(x, v, w, _, O[h + 3], D, 2399980690),
          _ = c(_, x, v, w, O[h + 10], F, 4293915773),
          w = c(w, _, x, v, O[h + 1], B, 2240044497),
          v = c(v, w, _, x, O[h + 8], L, 1873313359),
          x = c(x, v, w, _, O[h + 15], D, 4264355552),
          _ = c(_, x, v, w, O[h + 6], F, 2734768916),
          w = c(w, _, x, v, O[h + 13], B, 1309151649),
          v = c(v, w, _, x, O[h + 4], L, 4149444226),
          x = c(x, v, w, _, O[h + 11], D, 3174756917),
          _ = c(_, x, v, w, O[h + 2], F, 718787259),
          w = c(w, _, x, v, O[h + 9], B, 3951481745),
          v = n(v, m),
          w = n(w, y),
          _ = n(_, g),
          x = n(x, b);
      var H = f(v) + f(w) + f(_) + f(x);
      return H.toLowerCase()
    }
  }
})
