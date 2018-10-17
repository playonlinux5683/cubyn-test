import { Request, Response } from 'express';

import * as _ from 'lodash';
// import * as moment from 'moment';

/**
 * Handles all the APIs for parcelsServices.
 *
 * @export
 * @class ParcelsService
 */
export class ParcelService {

	constructor() { }

	public async wrapCall(request: Request, response: Response, callback: Function) {
		try {

			const result = await callback(request);

			response.status(200).send(result);

		} catch (error) {

			const code = error.httpCode || 500;
			const message = error.message || error;

			response.status(code).send(message);
		}
	}
}

const parcelService = new ParcelService();
export default parcelService;
