const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/listing.js");

const MONGO_URL="mongodb://localhost:27017/airbnb";
main()
.then(()=>console.log("connected to db"))
.catch(err=>console.log(err));

async function main(){
    await mongoose.connect(MONGO_URL);
}



async function initDB() {
    try {
      await Listing.deleteMany({});
      await Listing.insertMany(initData.data);
      console.log("Data was initialized");
    } catch (err) {
      console.error("Error initializing data:", err);
      throw err; // Re-throw the error to be caught in the outer catch block
    }
  }

initDB();