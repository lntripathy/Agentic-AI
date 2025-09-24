import mongoose from "mongoose"


const connectDB = async () => {
    try{
        await mongoose.connect(`${process.env.MONGO_URI}`)
        console.log("DB Connectd!")
    }
    catch(e){
        console.log("DB Connection failed!", e.message)
        throw new Error("DB Connection Failed...................................")
    }
}

export default connectDB