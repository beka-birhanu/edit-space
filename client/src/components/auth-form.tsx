
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Loading from "@/components/ui/loading.tsx";

const formSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  })

interface AuthFormProps {
    onSubmit: (values: z.infer<typeof formSchema>) => void
    submitText?: string
    title?: string
    loading?: boolean
}

function AuthForm(props: AuthFormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
        },
      })
    
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(props.onSubmit)} className="space-y-4 pt-4">
        { props.title ? 
          <h2 className="text-2xl font-bold">
            {props.title}
          </h2> : 
        ""}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="grid place-items-center" type="submit" disabled={props.loading ?? false}>
            {props.loading ? <Loading className="h-1 w-1 bg-white"  /> :
                props.submitText ?? "Submit"}
        </Button>
      </form>
    </Form>
  )
}

export default AuthForm;