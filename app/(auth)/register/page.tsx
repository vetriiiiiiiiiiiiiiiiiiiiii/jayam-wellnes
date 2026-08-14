"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { registerAction } from "@/lib/actions/auth.actions"

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

export default function RegisterPage() {
  const { register, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema)
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form action={async (formData) => { await registerAction(formData); }} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-black">Register</h1>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-black">Name</label>
          <input {...register("name")} name="name" className="w-full border p-2 rounded text-black" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message as string}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-black">Email</label>
          <input {...register("email")} name="email" type="email" className="w-full border p-2 rounded text-black" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1 text-black">Password</label>
          <input {...register("password")} name="password" type="password" className="w-full border p-2 rounded text-black" />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message as string}</p>}
        </div>

        <button type="submit" className="w-full bg-black text-white p-2 rounded hover:bg-gray-800 transition">
          Create Account
        </button>
      </form>
    </div>
  )
}
