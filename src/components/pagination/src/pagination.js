import UtilTools from '../../../tools/utils'
import GlobalEvent from '../../../tools/event'
import XEUtils from 'xe-utils'
import DomTools from '../../../tools/dom'

export default {
  name: 'VxePagination',
  props: {
    size: String,
    // 当前页
    currentPage: { type: Number, default: 1 },
    // 每页大小
    pageSize: { type: Number, default: 10 },
    // 总条数
    total: { type: Number, default: 0 },
    // 显示页码按钮的数量
    pagerCount: { type: Number, default: 7 },
    // 每页大小选项列表
    pageSizes: { type: Array, default: () => [10, 15, 20, 50, 100] },
    // 带背景颜色
    background: Boolean
  },
  data () {
    return {
      showSizes: false
    }
  },
  computed: {
    pageCount () {
      return Math.max(Math.ceil(this.total / this.pageSize), 1)
    },
    numList () {
      return Array.from(new Array(this.pageCount > this.pagerCount ? this.pagerCount - 2 : this.pagerCount))
    },
    offsetNumber () {
      return Math.floor((this.pagerCount - 2) / 2)
    }
  },
  created () {
    GlobalEvent.on(this, 'mousedown', this.handleGlobalMousedownEvent)
  },
  destroyed () {
    GlobalEvent.off(this, 'mousedown')
  },
  render (h) {
    let { size, background, currentPage, pageSize, pageSizes, total, pageCount, showSizes } = this
    return h('div', {
      class: ['vxe-pagination', {
        'p--background': background,
        [`size--${size}`]: size
      }]
    }, [
      h('span', {
        class: ['page--prev-btn', {
          'is--disabled': currentPage <= 1
        }],
        on: {
          click: this.prevPageEvent
        }
      }),
      h('ul', {
        class: 'page--btn-wrapper'
      }, this.renderPageBtn(h)),
      h('span', {
        class: ['page--next-btn', {
          'is--disabled': currentPage >= pageCount
        }],
        on: {
          click: this.nextPageEvent
        }
      }),
      h('span', {
        class: ['page--sizes', {
          'is--show': showSizes
        }],
        ref: 'sizePanel'
      }, [
        h('span', {
          class: 'size--content',
          on: {
            click: this.toggleSizePanel
          }
        }, pageSize),
        h('ul', {
          class: 'size--select'
        }, pageSizes.map(size => {
          return h('li', {
            class: ['size--option', {
              'is--active': size === pageSize
            }],
            on: {
              click: () => this.sizeChangeEvent(size)
            }
          }, size)
        }))
      ]),
      h('span', {
        class: 'page--jump'
      }, [
        h('span', '前往'),
        h('input', {
          class: 'page--goto',
          domProps: {
            value: currentPage
          },
          attrs: {
            type: 'text',
            autocomplete: 'off'
          },
          on: {
            keyup: evnt => {
              if (evnt.keyCode === 13) {
                let value = XEUtils.toNumber(evnt.target.value)
                let current = value <= 0 ? 1 : value >= pageCount ? pageCount : value
                evnt.target.value = current
                this.jumpPageEvent(current)
              }
            }
          }
        }),
        h('span', '页'),
        h('span', {
          class: 'page--total'
        }, `共 ${total} 条`)
      ])
    ])
  },
  methods: {
    renderPageBtn (h) {
      let { numList, currentPage, pageCount, pagerCount, offsetNumber } = this
      let nums = []
      let isOv = pageCount > pagerCount
      let isLt = isOv && currentPage > offsetNumber + 1
      let isGt = isOv && currentPage < pageCount - offsetNumber
      let startNumber = 1
      if (isOv) {
        if (currentPage >= pageCount - offsetNumber) {
          startNumber = Math.max(pageCount - numList.length + 1, 1)
        } else {
          startNumber = Math.max(currentPage - offsetNumber, 1)
        }
      }
      if (isLt) {
        nums.push(
          h('li', {
            class: 'page--num-btn',
            on: {
              click: () => this.jumpPageEvent(1)
            }
          }, 1),
          h('li', {
            class: 'page--jump-prev',
            on: {
              click: () => this.jumpPageEvent(Math.max(currentPage - numList.length, 1))
            }
          })
        )
      }
      numList.forEach((item, index) => {
        let number = startNumber + index
        if (number <= pageCount) {
          nums.push(
            h('li', {
              class: ['page--num-btn', {
                'is--active': currentPage === number
              }],
              on: {
                click: () => this.jumpPageEvent(number)
              }
            }, number)
          )
        }
      })
      if (isGt) {
        nums.push(
          h('li', {
            class: 'page--jump-next',
            on: {
              click: () => this.jumpPageEvent(Math.min(currentPage + numList.length, pageCount))
            }
          }),
          h('li', {
            class: 'page--num-btn',
            on: {
              click: () => this.jumpPageEvent(pageCount)
            }
          }, pageCount)
        )
      }
      return nums
    },
    handleGlobalMousedownEvent (evnt) {
      if (this.showSizes && !DomTools.getEventTargetNode(evnt, this.$refs.sizePanel).flag) {
        this.showSizes = false
      }
    },
    prevPageEvent () {
      let { currentPage } = this
      if (currentPage > 1) {
        this.jumpPageEvent(Math.max(currentPage - 1, 1))
      }
    },
    nextPageEvent () {
      let { currentPage, pageCount } = this
      if (currentPage < pageCount) {
        this.jumpPageEvent(Math.min(currentPage + 1, pageCount))
      }
    },
    jumpPageEvent (currentPage) {
      if (currentPage !== this.currentPage) {
        this.$emit('update:currentPage', currentPage)
        UtilTools.emitEvent(this, 'current-change', [currentPage])
      }
    },
    sizeChangeEvent (pageSize) {
      if (pageSize !== this.pageSize) {
        this.$emit('update:pageSize', pageSize)
        UtilTools.emitEvent(this, 'size-change', [pageSize])
      }
      this.showSizes = false
    },
    toggleSizePanel () {
      this.showSizes = !this.showSizes
    }
  }
}