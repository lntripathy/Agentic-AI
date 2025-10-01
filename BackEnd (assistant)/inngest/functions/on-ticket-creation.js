import inngest from "../client.js"
import Ticket from "../../models/ticket.model.js"
import { NonRetriableError } from "inngest"
import analyzeTicket from "../../utils/ai.js"
import User from "../../models/user.model.js"
import sendMail from "../../utils/mailer.js"

const onTicketCreated = inngest.createFunction(
    {
        id: "on-ticket-created",
        retries: 2,
    },
    {
        even: "ticket/created", // subject (what the event is about)/action  (what happened)
    },

    async ({ event, step }) => {
        try {
            const { ticketId } = event.data


            // fetching ticket from database

            const ticket = await step.run("fetch-ticket", async () => {
                const ticketObject = await Ticket.findById(ticketId)
                if(!ticketObject){
                    throw new NonRetriableError("Ticket not found!")
                }
                return ticketObject

            })

            await step.run("update-ticket-status", async () => {
                await Ticket.findByIdAndUpdate(ticket._id, {status: "TODO"})
            })

            const aiResponse = await analyzeTicket(ticket)


// find a user who is a moderator and has at least one skill matching the pattern

            const moderator = await step.run("assign-moderator", async ()=> {
                let user = await User.findOne({
                    role: "moderator",
                    skills: {
                        $elematch: {
                            $regex: relatedSkills.join("|"),
                            $options: "i",
                        }
                    }
                })

                if(!user){
                    user = await User.finOne({
                        role: "admin",
                    })
                }

                await Ticket.findByIdAndUpdate(
                    ticket._id,
                    {
                        assignedTo: user?._id || null
                    }
                )

                return user;
            })

            await step.run("send-email-notification", async ()=> {
                if(moderator){
                    const finalTicket = await Ticket.findById(ticket._id);
                    await sendMail(
                        moderator.email, 
                        "Ticket Assigned",
                        `A new ticket is assigned to you by ${finalTicket.createdBy}
                        Title : ${finalTicket.title}
                        `
                    )
                }
            })

            return {success: true}

        } catch (error) {
            console.error("❌ Error while running the inngest pipeline: ", err.message)
            return {success: false}
        }
    }
)