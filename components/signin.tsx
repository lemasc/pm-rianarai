import { useState } from 'react'
import { useAuth, Provider } from '../shared/authContext'

export default function SignInComponent(): JSX.Element {
  const auth = useAuth()
  const [email, setEmail] = useState(false)
  async function provider(p: Provider): Promise<void> {
    console.log(await auth.signInWithProvider(p))
  }
  return (
    <div className="py-2 px-4 login flex flex-col space-y-4">
      <button
        onClick={() => provider('google.com')}
        className="hover:bg-gradient-to-b focus:bg-gradient-to-b focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-offset-gray-200 text-gray-500 ring-gray-300 bg-white from-white to-gray-100"
      >
        <img
          alt="Google"
          width={20}
          height={20}
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        />
        <span>Sign in with Google</span>
      </button>
      <button
        onClick={() => provider('facebook.com')}
        className="btn text-white  ring-blue-500 bg-blue-500 from-blue-500 to-blue-600"
      >
        <img
          alt="Google"
          width={20}
          height={20}
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/facebook.svg"
        />
        <span>Sign in with Facebook</span>
      </button>
      <button
        onClick={() => setEmail(true)}
        className="btn text-white  ring-red-500 bg-red-500 from-red-500 to-red-600"
      >
        <img
          alt="Google"
          width={20}
          height={20}
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/mail.svg"
        />
        <span>Sign in with email</span>
      </button>
    </div>
  )
}
