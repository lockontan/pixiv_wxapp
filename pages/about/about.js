//about.js
//获取应用实例
// const app = getApp()

Component({
  pageLifetimes: {
    show() {
      if (typeof this.getTabBar === 'function' &&
        this.getTabBar()) {
        this.getTabBar().setData({
          selected: 1
        })
      }
    }
  },

  methods: {
    getDesc () {
      wx.showModal({
        content: '1. pixiv插画排行榜前100名展示，每天11：30更新排行。2. 可进入插画详情页面，点击图片以便查看或保存原图。3. 排行榜数据于2019-08-01开始更新，在此之前的数据暂无。4. 如果您有其他好的建议或想法可点击反馈建议与小程序作者进行联系',
        showCancel: false
      })
    },

    getOther () {
      wx.showModal({
        content: '本小程序插图仅供参考，学习，交流使用，请勿做他用。如有侵权请联系2998011437@qq.com进行删除。',
        showCancel: false
      })
    }
  }
})
