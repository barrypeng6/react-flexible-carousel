import React, { Component, PropTypes } from 'react'
import {
  isFunction,
  isReactElement
} from '../util/validateType'

import Wrapper from './Wrapper/wrapper'
import List from './Wrapper/list'
import Thumbs from './Thumbs/thumbs'
import { ArrowLeft, ArrowRight } from './Arrow/arrow'

class Carousel extends Component {

  constructor(props) {
    super(props);

    this.state = {
      // options: {
      //   listWidth: props.options ? Math.ceil(props.options.listWidth) : 300,
      //   listHeight: props.options ? props.options.listHeight : 400
      // },
      listWidth: this.props.listWidth || 300,
      listHeight: this.props.listHeight || 400,
      wrapperIsHover: false,
      actionID: props.options ? this.props.options.start_actionID : 0
    }
  }

  componentDidMount() {
    this._handleBindAutoPlayTimer()
  }

  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.urls !== this.props.urls ||
      nextProps.auto_play !== this.props.auto_play ||
      nextProps.use_thumbs !== this.props.use_thumbs ||
      nextProps.custom_thumbs !== this.props.custom_thumbs ||
      nextProps.custom_lists !== this.props.custom_lists ||
      nextProps.use_arrow !== this.props.use_arrow ||
      nextProps.thumbsPerPage !== this.props.thumbsPerPage ||
      nextState.actionID !== this.state.actionID ||
      nextState.wrapperIsHover !== this.state.wrapperIsHover ||
      nextState.listWidth !== this.state.listWidth
  }

  _handleAutoPlay() {
    if (this.state.wrapperIsHover || !this.props.auto_play) return
    if (this.state.actionID + 1 >= this.props.urls.length) {
      this.setState({
        actionID: 0
      })
    } else {
      if (this.props.beforeWrapperMouseOver) {
        if (isFunction(this.props.beforeWrapperMouseOver, 'beforeWrapperMouseOver')) {
          this.props.beforeActionIDChange(this.state.actionID)
        }
      }
      this.setState({
        actionID: this.state.actionID + 1
      }, () => {
        if (this.props.afterWrapperMouseOver) {
          if (isFunction(this.props.afterWrapperMouseOver, 'afterWrapperMouseOver')) {
            this.props.afterActionIDChange(this.state.actionID)
          }
        }
      })
    }
  }

  _handleBindAutoPlayTimer() {
    const auto_play_speed = this.props.auto_play_speed || 1000
    this.timer = setInterval(this._handleAutoPlay.bind(this), auto_play_speed)
  }

  _handleWrapperMouseOver() {
    const actionUrl = this.props.urls[this.state.actionID]
    if (this.props.beforeWrapperMouseOver) {
      if (isFunction(this.props.beforeWrapperMouseOver, 'beforeWrapperMouseOver')) {
        this.props.beforeWrapperMouseOver(this.state.actionID, actionUrl)
      }
    }
    this.setState({
      wrapperIsHover: true
    }, () => {
      if (this.props.afterWrapperMouseOver) {
        if (isFunction(this.props.afterWrapperMouseOver, 'afterWrapperMouseOver')) {
          this.props.afterWrapperMouseOver(this.state.actionID, actionUrl)
        }
      }
    })
  }

  _handleWrapperMouseLeave() {
    const actionUrl = this.props.urls[this.state.actionID]
    if (this.props.beforeWrapperMouseLeave) {
      if (isFunction(this.props.beforeWrapperMouseLeave, 'beforeWrapperMouseLeave')) {
        this.props.beforeWrapperMouseLeave(this.state.actionID, actionUrl)
      }
    }
    this.setState({
      wrapperIsHover: false
    }, () => {
      if (this.props.afterWrapperMouseLeave) {
        if (isFunction(this.props.afterWrapperMouseLeave, 'afterWrapperMouseLeave')) {
          this.props.afterWrapperMouseLeave(this.state.actionID, actionUrl)
        }
      }
    })
  }

  _handleArrowLeft() {
    if (this.state.actionID - 1 < 0) {
      this._handleChangeThumbsID(this.props.urls.length - 1)
    } else {
      this._handleChangeThumbsID(this.state.actionID - 1)
    }
  }

  _handleArrowRight() {
    if (this.state.actionID + 1 >= this.props.urls.length) {
      this._handleChangeThumbsID(0)
    } else {
      this._handleChangeThumbsID(this.state.actionID + 1)
    }
  }

  _handleTouchChangeActionID(correctX) {
    correctX > 0 ? this._handleArrowRight() : this._handleArrowLeft()
  }

  _handleChangeThumbsID(id) {
    if (this.timer) {
      clearInterval(this.timer)
      this._handleBindAutoPlayTimer()
    }
    if (this.props.beforeActionIDChange) {
      if (isFunction(this.props.beforeActionIDChange, 'beforeActionIDChange')) {
        this.props.beforeActionIDChange(this.state.actionID)
      }
    }
    this.setState({
      actionID: id
    }, () => {
      if (this.props.afterActionIDChange) {
        if (isFunction(this.props.afterActionIDChange, 'beforeActionIDChange')) {
          this.props.afterActionIDChange(this.state.actionID)
        }
      }
    })
  }

  _renderList(carousel_list_style) {
    const {
      custom_lists
    } = this.props
    const _use_lazy_load = this.props.lazy_load

    if (!custom_lists) {
      return this.props.urls.map((url, idx) =>
        <List
          width={ Math.ceil(this.state.listWidth) }
          height={ this.state.listHeight }
          carousel_list_style={ carousel_list_style }
          key={ `cm-carousel-list-${url}-${idx}` }
          idx={ idx }
          url={ _use_lazy_load ? (idx === (this.state.actionID - 1) || idx === (this.state.actionID + 1) || idx === (this.state.actionID) ? url : '') : url } /> /* eslint no-nested-ternary: 0 */
      )
    }
    if (custom_lists) {
      const reactElement = isReactElement(custom_lists)
      const functionElement = isFunction(custom_lists)
      if (reactElement) {
        return (
          React.createElement(custom_lists, {
            setting: {
              urls: this.props.urls,
              width: Math.ceil(this.state.listWidth),
              height: this.state.listHeight
            }
          })
        )
      }
      if (functionElement) {
        return (
          React.cloneElement(this.props.custom_lists(
            {
              urls: this.props.urls,
              width: Math.ceil(this.state.listWidth),
              height: this.state.listHeight
            }
          ))
        )
      }
      throw new Error('custom thumbs must be react component or function.')
    }
    return false
  }

  _render_thumbs(thumbs_style, thumbs_item_style) {
    const {
      custom_thumbs
    } = this.props

    if (this.props.use_thumbs && !custom_thumbs) {
      return (
        <Thumbs
          thumbsPerPage={ this.props.thumbsPerPage || 5 }
          thumbs_style={ thumbs_style }
          thumbs_item_style={ thumbs_item_style }
          actionID={ this.state.actionID }
          listWidth={ Math.ceil(this.state.listWidth) }
          urls={ this.props.urls }
          handleChangeThumbsID={ this._handleChangeThumbsID.bind(this) } />
      )
    }
    if (custom_thumbs) {
      const reactElement = isReactElement(custom_thumbs)
      const functionElement = isFunction(custom_thumbs)
      if (reactElement) {
        return React.createElement(custom_thumbs, {
          setting: {
            actionID: this.state.actionID,
            urls: this.props.urls
          },
          handler: {
            handleChangeThumbsID: this._handleChangeThumbsID.bind(this)
          }
        })
      }
      if (functionElement) {
        return custom_thumbs(
          {
            actionID: this.state.actionID,
            urls: this.props.urls
          },
          { handleChangeThumbsID: this._handleChangeThumbsID.bind(this) }
        )
      }
      throw new Error('custom thumbs must be react component or function.')
    }
    return false
  }

  _render_arrow() {
    if (this.props.use_arrow) {
      return (
      [
        <ArrowLeft
          key={ 'arrow-left' }
          wrapperIsHover={ this.state.wrapperIsHover }
          handleArrowLeft={ this._handleArrowLeft.bind(this) }
          useLeftArrow={ this.props.use_left_arrow }
          wrapperHeight={ this.state.listHeight } />,
        <ArrowRight
          key={ 'arrow-right' }
          wrapperIsHover={ this.state.wrapperIsHover }
          handleArrowRight={ this._handleArrowRight.bind(this) }
          useRightArrow={ this.props.use_right_arrow }
          wrapperHeight={ this.state.listHeight } />
      ]
      )
    }
    return false
  }

  render() {
    const {
      custom_styles
    } = this.props
    const _wrapper_style = {
      width: Math.ceil(this.state.listWidth),
      position: 'relative'
    }
    const _carousel_wrapper_style = Object.assign({}, custom_styles ? custom_styles.wrapper : {})
    const _carousel_list_style = Object.assign({}, custom_styles ? custom_styles.list : {})
    const _thumbs_style = Object.assign({}, custom_styles ? custom_styles.thumbs : {})
    const _thumbs_item_style = Object.assign({}, custom_styles ? custom_styles.thumbs_item : {})

    return (
      <div
        style={ _wrapper_style }>
        <Wrapper
          ref={ node => this.wrapper = node } /* eslint no-return-assign: 0 */
          listWidth={ Math.ceil(this.state.listWidth) }
          listHeight={ this.state.listHeight }
          actionID={ this.state.actionID }
          carouse_wrapper_style={ _carousel_wrapper_style }
          styleEase={ this.props.styleEase }
          touch_mode={ this.props.touch_mode }
          onWrapperMouseOver={ this._handleWrapperMouseOver.bind(this) }
          onWrapperMouseLeave={ this._handleWrapperMouseLeave.bind(this) }
          handleTouchChangeActionID={ this._handleTouchChangeActionID.bind(this) }>
          { this._renderList.call(this, _carousel_list_style) }
        </Wrapper>
        { this._render_arrow.call(this) }
        { this._render_thumbs.call(this, _thumbs_style, _thumbs_item_style) }
      </div>
    )
  }
}

/* eslint react/forbid-prop-types: 0  */
Carousel.propTypes = {
  urls: PropTypes.array.isRequired,
  options: PropTypes.object,

  use_arrow: PropTypes.bool,
  auto_play: PropTypes.bool,
  use_thumbs: PropTypes.bool,
  touch_mode: PropTypes.bool,
  lazy_load: PropTypes.bool,

  custom_styles: PropTypes.object,
  styleEase: PropTypes.string,

  custom_thumbs: PropTypes.func,
  custom_lists: PropTypes.func,

  use_left_arrow: PropTypes.element,
  use_right_arrow: PropTypes.element,

  beforeWrapperMouseOver: PropTypes.func,
  afterWrapperMouseOver: PropTypes.func,
  beforeWrapperMouseLeave: PropTypes.func,
  afterWrapperMouseLeave: PropTypes.func,
  beforeActionIDChange: PropTypes.func,
  afterActionIDChange: PropTypes.func
}

export default Carousel
