import { verifyToken } from '@/lib/keyauth';
import { cookies } from 'next/headers'
import Balancer from 'react-wrap-balancer';
import { redirect } from "next/navigation";
import ErrorToast from './error-toast';
import { revalidatePath } from 'next/cache'

export default async function LoginPage() {
    async function doLogin(data: FormData) {
        'use server'

        try {
            const userToken = data.get('password')?.toString() || '';
            const { sub } = verifyToken(userToken);
            console.log('Logged in as', sub);
            cookies().set('token', userToken);
            revalidatePath('/');
            redirect('/');
            return { redirect: { destination: '/', permanent: false } };
        } catch (error) {
            redirect('/login?error=wrongtoken');
        }
    }

    return (
        <>
            {/* Render a simple page with a single text field for the password (in the center of the screen) */}
            <div className="z-10 w-full max-w-xl px-5 xl:px-0">
                <h1
                    className="animate-fade-up bg-gradient-to-br from-black to-stone-500 bg-clip-text text-center font-display text-4xl font-bold tracking-[-0.02em] text-transparent opacity-0 drop-shadow-sm md:text-7xl md:leading-[5rem]"
                    style={{ animationDelay: "0.15s", animationFillMode: "forwards" }}
                >
                    <Balancer>Protected Area</Balancer>
                </h1>
                <div className="flex items-center justify-center w-full">
                    <div className="w-full max-w-md space-y-8">
                        <div>
                            <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">
                                Login
                            </h2>
                        </div>
                        <form className="mt-8 space-y-6" action={doLogin}>
                            <input type="hidden" name="remember" defaultValue="true" />
                            <div className="rounded-md shadow-sm -space-y-px">
                                <div>
                                    <label htmlFor="password" className="sr-only">
                                        Password
                                    </label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                                        placeholder="Password"
                                    />
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <ErrorToast />

        </>
    )
}
