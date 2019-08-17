Component({
  data: {
    selected: 0,
    color: "#787878",
    selectedColor: "#fb7598",
    list: [
      {
        "pagePath": "/pages/index/index",
        "text": "排行",
        "iconPath": "/assets/home.png",
        "selectedIconPath": "/assets/home-active.png"
      },
      {
        "pagePath": "/pages/about/about",
        "text": "关于",
        "iconPath": "/assets/about.png",
        "selectedIconPath": "/assets/about-active.png"
      }
    ]
  },
  onLoad () {},
  attached() {
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({
        url: url
      })
    }
  }
})