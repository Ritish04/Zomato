
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://127.0.0.1:27017/test";
const PORT = 3001;
const cors = require("cors");
const User=require('./models/auth')
const mongoose = require("mongoose");

// const User=require("./user");
const Product=require("./models/product");
const Restaurant=require("./models/restaurant");

app.post('/register',async(req,res)=>{
  const user=req.body
  console.log(req.body,"akansha")
  const  Email=await User.findOne({email:user.email})
  if(Email){
      res.send('user is already register in  our dataBase')
  } 
  else{
      console.log(req.body.passWord,"rrr")
          user.passWord= await bcrypt.hash(req.body.passWord,10)
          console.log(req.body.passWord,"rrr")
          const dbUser=new User({
              firstName:user.firstName,
              lastName:user.lastName,
              email:user.email.toLowerCase(),
              passWord:user.passWord          
          })
           await dbUser.save()
          res.send({messge:"done"})

  }

})




app.post('/login', async(req,res)=>{
  const userInfo=req.body
  let userData
  try{

       userData= await User.findOne({email:userInfo.email})
  }
  catch(err){
      console.log(err,"err")

  }
  if(!userData){
      res.status(401).send({msg:"signUp kiya tune ???"})
  }
   const validPassword=  await bcrypt.compare(userInfo.passWord,userData.passWord).catch((err)=>{
      console.log(err,"err while matching passoword")
      res.status(500).send({msg:"Internal server err"})
   })
   if(!validPassword){
      res.send({msg:"Invalid password"})
   }
   delete userDataObject.passWord
     const token = generateAuthToken(userData)
     res.status(200).send({                           
      data:{
          token:token,userData:userDataObject
      },
      msg:"sab kuch theek hai done hai"
     })

})

// he "body-parser" middleware is used to extract the entire body portion of an incoming HTTP request
//  and expose it on the "req.body" property of the request object in a 
// more usable format. The "urlencoded" method within the "body-parser" middleware 
// is used to parse incoming request bodies in a URL-encoded format.

// The "extended" option set to "true" indicates that the parser should support parsing
//  of rich objects and arrays that are encoded in the URL-encoded format. 
//  If set to "false", the parser will only parse simple key-value pairs in the URL-encoded format.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// The "json" method within the "body-parser" middleware is used to parse incoming request bodies in JSON format.
// In summary, this code enables the Node.js application to handle incoming HTTP requests with JSON request bodies.
app.use(cors());
// basically it helps to handle cross region requests
// When the "cors" middleware is used, it will automatically set the "Access-Control-Allow-Origin" header in the HTTP
//  response to allow requests from any origin. This means that the Node.js application will be able to receive requests from any domain or origin.


app.get("/clearDB", (req, res) => {
  // .collection("users") specifies the name of the collection within the database that the operation will be performed on.
  c.db
    .collection("users")
    .deleteMany({})
    .then((e) => {
      res.send("Database has been cleared");
    });
});

// ADD NEW RESTAURANT

app.post('/restaurants', (req, res) => {
  const user=req.body
  // this is basically the new instance of new restaurant,where user is being passed as an argument 
  // and has all the info that is needed to create a new restaurant
  const newRestaurant = new Restaurant(user);
  newRestaurant.save()
  .then(restaurant => {
    res.json(restaurant);
  })
  .catch(error => {
    res.status(400).json({ error: error.message });
  });
});


// ADD PRODUCT TO A SPECIFIC RESTAURANT
app.post('/restaurants/:restaurantId/products', (req, res) => {
  const { restaurantId } = req.params
  // req.params give the information about what is given in the url
  // Find the parent restaurant by ID
  Restaurant.findById(restaurantId)
  .then(restaurant => {
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    // Create a new product and add it to the restaurant
    const newProduct = new Product({
      // ... is used to copy all the properties of the object into the new product
      ...req.body,
      restaurant: restaurant._id
      // This creates a reference between the "Product" and "Restaurant" models, allowing the product to be associated with a specific restaurant
    });

    // if no products pass an empty array
    if(!restaurant.products){
        restaurant.products=[]

    }
    // else push the newProduct into the arrray
     restaurant.products.push(newProduct);

      //  promise
    //  ?????
    // Save the new product and updated restaurant
    return Promise.all([newProduct.save(), restaurant.save()])
    .then(([product]) => {
      res.json(product);
    });
  })
  .catch(error => {
    res.status(400).json({ error: error.message });
  });
});

// LISTS ALL THE RESTAURANTS
app.get('/restaurants', (req, res) => {
  // this code basically retrieves all the documents from the restaurant and populates it to the product
  // .populate loads all the "Product "documents for the restaurant
  // for example id is linked and is reference between product and restaurant
  Restaurant.find()
  .populate('products') // Populate the 'products' field with related documents
  .then(restaurants => {
    res.json(restaurants);
  })
  .catch(error => {
    res.status(400).json({ error: error.message });
  });
});

// LISTS ALL PRODUCTS FOR A RESTAURANT
app.get('/restaurants/:restaurantId/products', (req, res) => {
  const { restaurantId } = req.params;

  // Find the parent restaurant by ID and populate the 'products' field with related documents
  Restaurant.findById(restaurantId)
  .populate('products')
  .then(restaurant => {
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    res.json(restaurant.products);
  })
  .catch(error => {
    res.status(400).json({ error: error.message });
  });
});




// Search for restaurants by name or city
app.get('/restaurants/search', (req, res) => {
  console.log(req.query,"bodyyyyyyyyyyyyyy")
    const { q } = req.query; 
    console.log(q,"qqqqqqqqq")// Get the search query from the URL query string
  
    // Find all restaurants that match the search query
    Restaurant.find({
      // The $options property is used to specify that the search should be case-insensitive (using the 'i' option).
      $or: [
        // it takes an array of options from which it has to make a decision
        { name: { $regex: `${q}`, $options: 'i' } }, // Search for restaurants by name
        { city: { $regex: `${q}`, $options: 'i' } } // Search for restaurants by city
      ]
      // $or operator to search for documents in the "Restaurant" collection where either the "name" or "city" field matches a given search query.
    })
    .populate('products') // Populate the 'products' field with related documents
    .then(restaurants => {
      res.json(restaurants);
    })
    .catch(error => {
      res.status(400).json({ error: error.message });
    });
  });

// ----------------------------------------------------------------------------------------------------------------->

//   List of restaurant by id
app.get('/restaurants/:id', async(req,res)=>{
  const {id}=req.params
  
  Restaurant.findById(id).populate('products').then((resId)=>{
     if(!resId){
      console.log(res,'resssssssssss')
    return res.status(404).json({ error: 'Restaurant not found' });

     }
     res.json(resId)

  }).catch((err)=>{
      res.status(400).json({ err: err.message });


  })

})

// Search for products by name or description
app.get('/products/search', (req, res) => {
  const { q } = req.query; // Get the search query from the URL query string

  // Find all products that match the search query
  Product.find({
    $or: [
      { name: { $regex: `${q}`, $options: 'i' } }, // Search for products by name
      { description: { $regex: `${q}`, $options: 'i' } } // Search for products by description
    ]
  })
  .populate('restaurant') // Populate the 'restaurant' field with related documents
  .then(products => {
    res.json(products);
  })
  .catch(error => {
    res.status(400).json({ error: error.message });
  });
});

// Get a list of all the cities where there are restaurants
app.get('/cities', (req, res) => {
  // this already display the unique cities
  Restaurant.distinct('city') // Get a list of all the distinct 'city' values in the 'Restaurant' collection
  .then(cities => {
    res.json(cities);
  })
  .catch(error => {
    res.status(400).json({ error: error.message });
  });
});



// Delete a restaurant by ID
Restaurant.findByIdAndDelete('restaurant_id_here')
.then(deletedRestaurant => {
  if (!deletedRestaurant) {
    console.log('Restaurant not found');
    return;
  }
  console.log('Restaurant deleted successfully');
})
.catch(error => {
  console.log(error.message);
});

// DELETE PRODUCT


app.delete('/restaurant/:restaurantId/products/:productId', async (req, res) => {
  const { restaurantId, productId } = req.params;
  try {
    const restaurant = await Restaurant.findOneAndUpdate(
      { _id: restaurantId },
      // The $pull operator it is used to remove all the occurences of product from the product array 
      // it will ddelete product according to the product id
      { $pull: { products: productId } },
      // y default, the findOneAndUpdate() method returns the document
      //  as it was before the update was applied. If you pass in the { new: true } option, 
      // the method will return the updated document instead.
      { new: true }
    );
    if (!restaurant) {
      return res.status(404).send({ error: 'Restaurant not found' });
    }
    // The deleteOne() method takes a filter object as an argument to specify which document(s) to delete from the collection.
    const product = await Product.deleteOne({ _id: productId });
    if (product.deletedCount === 0) {
      // if deletecount=0 means no product has been found
      return res.status(404).send({ error: 'Product not found' });
    }
    res.send({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Internal server error' });
  }
});
// In this code, we first extract the restaurantId and productId from the req.params object.
//  We then use the findOneAndUpdate() method of the Restaurant model to remove the productId
//  from the products array of the restaurant with the given restaurantId. 
// The new: true option returns the updated restaurant object after the product
//  has been removed from the products array. If the restaurant cannot be found, we return a 404 error.

// Next, we use the deleteOne() method of the Product model to delete the product with the given productId from the database.
//  If the product cannot be found, we return a 404 error.

// Finally, we return a success message to the client. If any errors occur during this process, we return a 500 error.








mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const c = mongoose.connection;
c.on("error", console.error.bind(console, "connection error: "));
c.once("open", function () {
  console.log("Connected successfully");
});

app.listen(PORT, function () {
  console.log(`Server listening on port ${PORT}`);
});


