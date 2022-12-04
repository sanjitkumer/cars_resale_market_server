const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
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


// async await 
async function run(){
    try{
        const  categoriesCollection = client.db('carsResaleMarket').collection('categories');

        app.get('/categories', async(req, res) => {
            const query = {};
            const options = await categoriesCollection.find(query).toArray();
            res.send(options);
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