import mongoose from 'mongoose';

//connecting to mongodb with env to keep private
export async function connectDB(){
    try {
        await mongoose.connect(process.env.MONGODB_URL!);
        console.log(`Successfully connected to mongodb`);
    } catch (error){
        console.log(`Failed to process db`);
        console.error(error);
        process.exit(1);
    }
}