const express = require('express')
const colors = require('colors')
const dotenv = require('dotenv').config()
const {errorHandler, notFound} = require('./middleware/errorMiddleware')
const PORT = process.env.PORT || 5000
const connectDB = require('./config/db')
const { getFileStream } = require('./utils/s3bucket')
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const asyncHandler = require('express-async-handler');

const app = express();
app.use(express.json())
connectDB();
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true, credentials: true }));
app.use(fileUpload());

app.use(
    '/api/uploads/:key',
    asyncHandler((req, res) => {
      if (req.params.key === 'undefined')
        return res.status(404).json({ message: 'Resourse not found' });
      getFileStream(req.params.key)
        .on('error', (err) => {
          if (!res.headersSent)
            return res.status(404).json({ message: 'Resourse not found' });
        })
        .pipe(res);
    })
  );


app.use('/api', require('./routes/adminRoutes'))
app.use('/api/home', require('./routes/homeRoutes'))

// Error Middleware
app.use(notFound);
app.use(errorHandler);


app.listen(PORT, console.log(`server started on PORT ${PORT}`))
