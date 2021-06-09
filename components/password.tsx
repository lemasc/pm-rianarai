import React, { Component } from 'react'
import zxcvbn, { ZXCVBNResult } from 'zxcvbn'

type PasswordProps = {
  password: string
}

type Label = {
  en: string
  th: string
}

class PasswordStrengthMeter extends Component<PasswordProps> {
  createPasswordLabel = (result: ZXCVBNResult): Label => {
    switch (result.score) {
      case 0:
        return { en: 'Weak', th: 'อ่อน' }
      case 1:
        return { en: 'Weak', th: 'อ่อน' }
      case 2:
        return { en: 'Fair', th: 'ปานกลาง' }
      case 3:
        return { en: 'Good', th: 'ดี' }
      case 4:
        return { en: 'Strong', th: 'ดีมาก' }
      default:
        return { en: 'Weak', th: 'อ่อน' }
    }
  }

  render(): JSX.Element {
    const { password } = this.props
    const testedResult = zxcvbn(password)
    return (
      <div className="password-strength-meter">
        <progress
          className={`password-strength-meter-progress strength-${
            this.createPasswordLabel(testedResult).en
          }`}
          value={testedResult.score}
          max="4"
        />
        <br />
        <label className="password-strength-meter-label">
          <strong>ความแข็งแรงของรหัสผ่าน:</strong> {this.createPasswordLabel(testedResult).th}
        </label>
      </div>
    )
  }
}

export default PasswordStrengthMeter
