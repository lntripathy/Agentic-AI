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
            tickets = Ticket.find()
            .populate("assignedTo", ["_id", "email"]).sort({"createdAt": -1})
        } else {
            tickets = Ticket.fin({cretedBy: user._id}).select("title desctiption status createdAt").sort({"cretedAt": -1})
        }

        return res.status(200).json(tickets)
    } catch (error) {
        console.error("Error fetchng tickets")
        return res.status(500).json({message: "Internal server Error"})
    }
}

export const getTicket = async (req, res) => {
    try {
        const user = req.user
        let ticket = []

        if(user.role != "user"){
            ticket = Ticket.findById(req.params.id)
            .populate("assignedTo", ["_id", "email"])
        } else {
            ticket = Ticket.findOne({
                createdBy: user._id,
                _id: req.params.id 
            }).select("title description status createdAt")
        }

        if(!ticket){
            return res.status(404).json("Ticket not found!.")
        }

        return res.status(200).json({ticket})



    } catch (error) {
        console.error("Error fetching ticket", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
    }
}