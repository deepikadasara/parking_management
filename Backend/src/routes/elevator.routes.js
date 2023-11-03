const {CustomRoutes, CustomResponse} = require('../utilities/server');
const {vehicleForLicensePlate, findReservation} = require('../controllers/elevator.controller');
const url = require('url');

const elevatorRouter = new CustomRoutes();
const response = new CustomResponse();

elevatorRouter.post('/api/elevator/scan-license-plate', async (req, res) => {
  try {
    const {licensePlate: licensePlateNumber} = req.body;
    if (!licensePlateNumber) {
      return response.setResponse(res, {message: 'Missing license plate number', error: true}, 400);
    }


    const vehicleID = await vehicleForLicensePlate(licensePlateNumber);

    if (!vehicleID) {
      return response.setResponse(res, {message: 'No reservation found for the provided license plate number.'}, 404);
    }

    const reservations = await findReservation(vehicleID);

    if (reservations) {
      return response.setResponse(res, {message: 'Check-in successfully initiated for the reservation.'}, 200);
    } else {
      return response.setResponse(res, {message: 'No reservation found for the provided license plate number.'}, 404);
    }
  } catch (err) {
    console.error('Error occurred while handling the request to scan license plate: ', err.message);
    return response.setResponse(res, {message: 'Internal Server Error'}, 500);
  }
});

module.exports = elevatorRouter;
