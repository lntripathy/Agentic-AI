import inngest from "../client"
import User from "../../models/user.model"
import { NonRetriableError } from "inngest"

export const onUserSignUp = inngest.createFunction(
    { id: "on-user-signup", retries: 2 },
    { event: "user/signup" },
    async ({ event, step }) => {
        try {
            const {email} = event.data
            const user = await step.run("get-user-email", async() => {
                const userObject = await User.findOne({email})
                if(!userObject){
                    throw new NonRetriableError("User doesn't exist.")
                }
                return userObject
            })

// the output of user goes as an input to the below function, (user.email)


            await step.run("send-welcome-email", async () => {
                const subject = "Welcome to the app"
                const message = `Hi 
                \n\n
                Thanks for Signing Up. Let's Explore the features.😇`

                await sendMail(user.email, subject, message)
            })

            return {success: true}
        } catch (error) {
            console.error("❌ Error running step.", error.message)
            return {success: false}
        }
    }
)