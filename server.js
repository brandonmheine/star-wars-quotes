const express = require('express')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient
const app = express()
const PORT = 3000

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static('public'))

MongoClient.connect(
	'mongodb+srv://bob:12345@cluster0.klkqgu9.mongodb.net/?retryWrites=true&w=majority',
	{ useUnifiedTopology: true }
).then((client) => {
	console.log('Connected to Database')
	const db = client.db('star-wars-quotes')
	const quotesCollection = db.collection('quotes')

	app.set('view engine', 'ejs')
	app.get('/', (request, response) => {
		const cursor = db
			.collection('quotes')
			.find()
			.toArray()
			.then((results) => {
				response.render('index.ejs', { quotes: results })
			})
			.catch((error) => console.error(error))
	})

	app.post('/quotes', (request, response) => {
		quotesCollection
			.insertOne(request.body)
			.then((result) => {
				response.redirect('/')
			})
			.catch((error) => console.error(error))
	})

	app.put('/quotes', (request, response) => {
		quotesCollection
			.findOneAndUpdate(
				{ name: 'Yoda' },
				{
					$set: {
						name: request.body.name,
						quote: request.body.quote,
					},
				},
				{
					upsert: true,
				}
			)
			.then((result) => {
				response.json('Success')
			})
			.catch((error) => console.error(error))
	})

	app.delete('/quotes', (req, res) => {
		quotesCollection
			.deleteOne({ name: req.body.name })
			.then((result) => {
				if (result.deletedCount === 0) {
					return res.json('No quote to delete')
				}
				res.json("Deleted Vader's quote")
			})
			.catch((error) => console.error(error))
	})

	app.listen(PORT, function () {
		console.log(`Listening on port: ${PORT}`)
	})
})
