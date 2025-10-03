import { inngest } from "../inngest/client.js"
import Ticket from "../../models/ticket.model.js"

export const createTicket = async (req, res) => {
    try {
        const { title, description } = req.body;
        if(!title || !description){
            return res.status(400).json({message: "Title and Description are required."})
        }

        const newTicket = Ticket.create(
            {
                title, description, 
                createdBy: req.user._id.toString(),
            }
        )

        await inngest.send({
            name: "ticket/created",
            data: {
                ticketId: (await newTicket)._id.toString(),
                title,
                description,
                createdBy: req.user._id.toString()
            }
        })

        return res.status(201).json({
            message: "Ticket created and processing started.",
            ticket: newTicket
        })

    } catch (error) {
        console.log("Error creating ticket!\n", error.message)
        return res.status(500).json({message: "Internal server error"})
    }
}


export const getTickets = async (req, res) => {
    try {
        const user = req.user
        let tickets = [];
        if(user.role != "user"){
            tickets = Ticket.find().populate("assignedTo", ["_id", "email"]).sort({"createdAt": -1})
        } else {
            tickets = Ticket.fin({cretedBy: user._id}).select("title desctiption status createdAt").sort({"cretedAt": -1})
        }

        return res.status(200).json(tickets)
    } catch (error) {
        console.error("Error fetchng tickets")
        return res.status(500).json({message: "Internal server Error"})
    }
}