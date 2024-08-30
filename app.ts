import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { setupSwagger } from './swagger.config';

//#region App Setup
const app = express();

dotenv.config({ path: './.env' });
const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
let vehicles: {
  id: string;
  licensePlate: string;
  longitude: number;
  latitude: number;
}[] = [];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'));
setupSwagger(app, BASE_URL);

//#endregion App Setup

//#region Code here
// Add or update vehicle location
// app.post('/vehicles/:id/location', (req: Request, res: Response) => {
//   const { id } = req.params;
//   const { longitude, latitude } = req.body; // Expect location as 'latitude,longitude'

//   if (!location) {
//     return res.status(400).json({ message: 'Location is required' });
//   }

//   // Update or add vehicle
//   if (!vehicles[id]) {
//     vehicles[id] = { id, licensePlate: 'Unknown', longitude, latitude };
//   } else {
//     vehicles[id].longitude = longitude;
//     vehicles[id].latitude = latitude;
//   }

//   res.json(vehicles[id]);
// });

// Get all vehicles
app.get('/vehicles', (req: Request, res: Response) => {
  res.json(JSON.stringify(vehicles));
});

// Add a new vehicle
app.post('/vehicles', (req: Request, res: Response) => {
  const { id, licensePlate, longitude, latitude } = req.body;
  if (!id || !licensePlate || !longitude || !latitude) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  const existingVehicle = vehicles.findIndex((currentValue) => {
    return currentValue.id === id;
  });

  if (existingVehicle > -1) {
    vehicles[existingVehicle] = { id, licensePlate, longitude, latitude };
  } else {
    vehicles.push({ id, licensePlate, longitude, latitude });
  }

  res.status(201).send({ message: 'Successful' });
});

// Delete a vehicle
// app.delete('/vehicles/:id', (req: Request, res: Response) => {
//   const { id } = req.params;
//   if (!vehicles[id]) {
//     return res.status(404).json({ message: 'Vehicle not found' });
//   }
//   delete vehicles[id];
//   res.json({ message: 'Vehicle deleted' });
// });

//#endregion

//#region Server Setup

/**
 * @swagger
 * /api:
 *   get:
 *     summary: Call a demo external API (httpbin.org)
 *     description: Returns an object containing demo content
 *     tags: [Default]
 *     responses:
 *       '200':
 *         description: Successful.
 *       '400':
 *         description: Bad request.
 */
app.get('/api', async (req: Request, res: Response) => {
  try {
    const result = await axios.get('https://httpbin.org');
    return res.send({
      message: 'Demo API called (httpbin.org)',
      data: result.status,
    });
  } catch (error: any) {
    console.error('Error calling external API:', error.message);
    return res.status(500).send({ error: 'Failed to call external API' });
  }
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: API Health check
 *     description: Returns an object containing demo content
 *     tags: [Default]
 *     responses:
 *       '200':
 *         description: Successful.
 *       '400':
 *         description: Bad request.
 */
app.get('/', (req: Request, res: Response) => {
  return res.send({ message: 'API is Live!' });
});

/**
 * @swagger
 * /obviously/this/route/cant/exist:
 *   get:
 *     summary: API 404 Response
 *     description: Returns a non-crashing result when you try to run a route that doesn't exist
 *     tags: [Default]
 *     responses:
 *       '404':
 *         description: Route not found
 */
app.use((req: Request, res: Response) => {
  return res
    .status(404)
    .json({ success: false, message: 'API route does not exist' });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // throw Error('This is a sample error');

  console.log(`${'\x1b[31m'}${err.message}${'\x1b][0m]'} `);
  return res
    .status(500)
    .send({ success: false, status: 500, message: err.message });
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
});

function currentValue(
  value: {
    id: string;
    licensePlate: string;
    longitude: number;
    latitude: number;
  },
  index: number,
  array: {
    id: string;
    licensePlate: string;
    longitude: number;
    latitude: number;
  }[]
): unknown {
  throw new Error('Function not implemented.');
}
// (for render services) Keep the API awake by pinging it periodically
// setInterval(pingSelf(BASE_URL), 600000);

//#endregion
