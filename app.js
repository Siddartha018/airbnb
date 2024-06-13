const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const Listing=require("./models/listing.js");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"public")));
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const Review=require("./models/review.js");

const MONGO_URL="mongodb://localhost:27017/airbnb";
const {listingSchema}=require("./schema.js");
main().then(()=>console.log("connection succesful"))
.catch(err=>console.log(err));

async function main(){
    await mongoose.connect(MONGO_URL);
}

app.get("/",(req,res)=>{
    res.send("i am root");
})

const validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
}



app.get("/listings",wrapAsync(async (req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings})
}))

app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
});

app.post("/listings",validateListing,wrapAsync(async (req,res,next)=>{
        const newListing=new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
   
}));


app.get("/listings/:id",wrapAsync(async (req,res)=>{
    let {id} = req.params;
    const listing=await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
}))

app.get("/listings/:id/edit",wrapAsync(async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));

app.put("/listings/:id",validateListing,wrapAsync(async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

app.delete("/listings/:id",wrapAsync(async (req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}))

app.post("/listings/:id/reviews",async (req,res)=>{
  let listing=await Listing.findById(req.params.id);
  let newReview=new Review(req.body.review);

  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();

 res.redirect(`/listings/${listing._id}`);
})

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"));
})

app.use((err,req,res,next)=>{
    let {statusCode=500,message="something went wrong"}=err;
   res.status(statusCode).render("error.ejs",{message});    
})


app.listen(8080,()=>{
    console.log("listening on port 8080");
});