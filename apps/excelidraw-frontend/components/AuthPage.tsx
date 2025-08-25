"use client"
//! Ideally you should have the input boxes as separate. In packages/ui you can have it.
export function AuthPage({isSignin}: {isSignin: boolean}) {
    return <div className="w-screen h-screen flex items-center justify-center">
        <div className="p-6 m-2 bg-white rounded">
            <div className="p-2">
                <input type="text" placeholder="Email"></input>
            </div>
            <div className="p-2">
                <input type="password" placeholder="Password"></input>
            </div>

            <div className="pt-2">
                <button onClick={() => {

                }}>{isSignin ? "Sign in" : "Sign Up"}</button>
            </div>
        </div>
    </div>
}