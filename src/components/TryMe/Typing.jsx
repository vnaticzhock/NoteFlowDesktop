class Typing {
  constructor(speed) {
    this.speed = speed
  }

  type = async (text, setText) => {
    let id = 0
    let updatedText = ''

    this.timer = setInterval(() => {
      if (id < text.length) {
        updatedText += text[id]
        setText(updatedText)
        ++id
      }
    }, this.speed)
  }

  close = () => {
    clearInterval(this.timer)
  }
}

export default Typing
