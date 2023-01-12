const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();


const port = process.env.PORT || 5000;


const app = express();


// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}
@cluster0.abfdjrm.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req,res,next){
    // console.log('token inside verifyJWT', req.headers.authorization);
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
        if(err){
            return res.status(403).send({message: 'forbidden access'})
        }
        req.decoded = decoded;
        next();
    })
}


// async await 
async function run(){
    try{
        const  categoriesCollection = client.db('carsResaleMarket').collection('categories');
        const productItemsCollection = client.db ('carsResaleMarket').collection('productItems');
        const carBookingsCollection = client.db ('carsResaleMarket').collection('carBookings');
        const usersCollection = client.db ('carsResaleMarket').collection('users');

        app.get('/categories', async(req, res) => {
            const query = {};
            const options = await categoriesCollection.find(query).toArray();
            res.send(options);
        });

        app.get('/productItems', async(req, res) => {
            const query = {};
            const productItem = await productItemsCollection.find(query).toArray();
            res.send(productItem);
        });
       
        app.get('/carBookings', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;

            if(email !== decodedEmail){
                return res.status(403).send({message: 'forbidden access'});
            }


            // console.log('token', req.headers.authorization);
            const query = { email: email };
            const carBookings = await carBookingsCollection.find(query).toArray();
            res.send(carBookings);
        });


        app.get('/jwt', async(req, res) =>{
            const email = req.query.email;
            const query = {email: email};
            const user = await usersCollection.findOne(query);
            if(user){
                const token = jwt.sign({email}, process.env.ACCESS_TOKEN, {expiresIn : '1h'})
                return res.send({accessToken: token});
            }
            // console.log(user);
            res.status(403).send({accessToken : ''});
        });

        app.get('/users', async(req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({isAdmin: user?.role === 'admin'});
        } )



        app.post('/carBookings', async(req, res) => {
            const carBooking = req.body
            // console.log(carBooking);
            const result = await carBookingsCollection.insertOne(carBooking);
            res.send(result);
        });


        app.post('/users', async(req, res) => {
            const user = req.body;
            // console.log(user);
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        app.put('/users/admin/:id',verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const query = {email: decodedEmail};
            const user = await usersCollection.findOne(query);

            if(user?.role !== 'admin'){
                return res.status(403).send({message: 'forbidden access'})
            }



            const id = req.params.id;
            const filter = {_id: ObjectId(id) }
            const options = { upsert: true};
            const updateDoc = { 
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.send(result);

        })
    } 
    finally{
    
    }


}

run().catch(console.log);


app.get('/', async(req, res) =>{
    res.send('cars resale market server is running')
})

app.listen(port, () => console.log(`cars resale market running on ${port}`));