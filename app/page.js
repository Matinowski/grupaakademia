'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [rememberMe, setRememberMe] = useState(false)
	const [error, setError] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const { login, isAuthenticated, passwordResetNeded } = useAuth()
	const [isResettingPassword, setIsResettingPassword] = useState(false)

	const router = useRouter()

	// Sprawdzenie, czy użytkownik jest zalogowany
	useEffect(() => {
		if (isAuthenticated && !isResettingPassword) {
			router.push('/dashboard')
		}
	}, [isAuthenticated, isResettingPassword, router])

	const handleSubmit = async e => {
		e.preventDefault()
		setError('')
		setIsLoading(true)

		const response = await login(email, password)
		if (response.success) {
			if (response.resetPassword) {
				// Jeśli użytkownik musi zresetować hasło, przekierowanie do strony resetowania hasła
				console.log('jestem')
				setIsResettingPassword(true)
				router.push('/reset-password')
			} else {
				router.push('/dashboard')
			}
			// Logowanie udane, przekierowanie do panelu
		} else {
			// Logowanie nieudane, wyświetlenie błędu
			setIsLoading(false)
			setError('Wystąpił błąd podczas logowania. Sprawdź swoje dane.')
		}
	}

	return (
		<div className='min-h-screen flex bg-gray-50'>
			{/* Lewa strona - obraz */}
			<div className='hidden lg:flex lg:w-1/2 relative'>
				<div
					className='absolute inset-0 bg-cover bg-center'
					style={{
						backgroundImage: "url('/ak.jpg')",
						backgroundSize: 'cover',
					}}>
					<div className='absolute inset-0 bg-gradient-to-r from-blue-900/70 to-blue-800/50'></div>
				</div>
				<div className='relative z-10 flex flex-col justify-center items-center w-full p-12 text-white'>
					<div className='max-w-md'>
						<h1 className='text-5xl font-bold mb-6'>GRUPA AKADEMIA</h1>
						<p className='text-xl mb-8'>
							Profesjonalne szkolenia dla kierowców. Dołącz do nas i zdobądź nowe umiejętności.
						</p>
						<div className='space-y-4'>
							<div className='flex items-center'>
								<div className='w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center mr-4'>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										className='h-6 w-6'
										fill='none'
										viewBox='0 0 24 24'
										stroke='currentColor'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
										/>
									</svg>
								</div>
								<p>Doświadczeni instruktorzy</p>
							</div>
							<div className='flex items-center'>
								<div className='w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center mr-4'>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										className='h-6 w-6'
										fill='none'
										viewBox='0 0 24 24'
										stroke='currentColor'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
										/>
									</svg>
								</div>
								<p>Nowoczesna flota pojazdów</p>
							</div>
							<div className='flex items-center'>
								<div className='w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center mr-4'>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										className='h-6 w-6'
										fill='none'
										viewBox='0 0 24 24'
										stroke='currentColor'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
										/>
									</svg>
								</div>
								<p>Wysokie wyniki zdawalności</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Prawa strona - formularz logowania */}
			<div className='w-full lg:w-1/2 flex items-center justify-center p-8'>
				<div className='w-full max-w-md'>
					<div className='text-center mb-10'>
						<h1 className='text-4xl font-bold text-gray-900 mb-2'>Panel Administracyjny</h1>
						<p className='text-gray-600'>Zaloguj się, aby zarządzać systemem</p>
					</div>

					{error && (
						<div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start'>
							<AlertCircle className='w-5 h-5 text-red-500 mr-3 mt-0.5' />
							<span className='text-red-800'>{error}</span>
						</div>
					)}

					<form onSubmit={handleSubmit} className='space-y-6'>
						<div>
							<label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-1'>
								Adres email
							</label>
							<input
								id='email'
								type='email'
								value={email}
								onChange={e => setEmail(e.target.value)}
								className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
								placeholder='twoj@email.pl'
								required
							/>
						</div>

						<div>
							<div className='flex items-center justify-between mb-1'>
								<label htmlFor='password' className='block text-sm font-medium text-gray-700'>
									Hasło
								</label>
								<Link href='/forgot-password' className='text-sm text-blue-600 hover:text-blue-800'>
									Zapomniałeś hasła?
								</Link>
							</div>
							<div className='relative'>
								<input
									id='password'
									type={showPassword ? 'text' : 'password'}
									value={password}
									onChange={e => setPassword(e.target.value)}
									className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
									placeholder='••••••••'
									required
								/>
								<button
									type='button'
									className='absolute right-3 top-3 text-gray-400 hover:text-gray-600'
									onClick={() => setShowPassword(!showPassword)}>
									{showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
								</button>
							</div>
						</div>

						<div className='flex items-center'>
							<input
								id='remember-me'
								type='checkbox'
								checked={rememberMe}
								onChange={e => setRememberMe(e.target.checked)}
								className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
							/>
							<label htmlFor='remember-me' className='ml-2 block text-sm text-gray-700'>
								Zapamiętaj mnie
							</label>
						</div>

						<button
							type='submit'
							className={`w-full flex justify-center items-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
								isLoading ? 'opacity-75 cursor-not-allowed' : ''
							}`}
							disabled={isLoading}>
							{isLoading ? (
								<>
									<svg
										className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
										xmlns='http://www.w3.org/2000/svg'
										fill='none'
										viewBox='0 0 24 24'>
										<circle
											className='opacity-25'
											cx='12'
											cy='12'
											r='10'
											stroke='currentColor'
											strokeWidth='4'></circle>
										<path
											className='opacity-75'
											fill='currentColor'
											d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
									</svg>
									Logowanie...
								</>
							) : (
								<>
									<LogIn className='w-5 h-5 mr-2' />
									Zaloguj się
								</>
							)}
						</button>
					</form>

					<div className='mt-10 text-center'>
						<div className='text-sm text-gray-600'>
							Potrzebujesz pomocy?{' '}
							<a href='#' className='text-blue-600 hover:text-blue-800'>
								Skontaktuj się z administratorem
							</a>
						</div>
					</div>

					<div className='mt-10 pt-6 border-t border-gray-200'>
						<div className='flex items-center justify-center'>
							<img src='/placeholder.svg?height=40&width=150' alt='Logo Grupa Akademia' className='h-10' />
						</div>
						<p className='mt-4 text-xs text-center text-gray-500'>
							&copy; {new Date().getFullYear()} Grupa Akademia. Wszelkie prawa zastrzeżone.
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}
