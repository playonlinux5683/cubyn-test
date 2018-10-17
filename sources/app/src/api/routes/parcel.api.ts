import { NextFunction, Request, Response, Router } from 'express';

import * as _ from 'lodash';
import parcelService from '../services/parcel.services';

const Parcel = require('./../../models/parcel.model');
/**
 * Handles all the APIs for parcels.
 *
 * @export
 * @class ParcelApi
 */
export class ParcelApi {

	public router: Router;

	constructor() {
		this.router = Router();
		this.init();
	}

	public init() {
		this.router.get("/", this.index);
		this.router.get("/:uid", this.show);
		this.router.get("/:uid/estimate", this.estimate);
		this.router.post("/", this.create);
		this.router.put("/:uid", this.update);
		this.router.delete("/:uid", this.destroy);
	}

	/**
    * Gets all parcels
    *
    * @param {Request} request
    * @param {Response} response
    * @param {NextFunction} next
	* 
	* @memberof ParcelApi
	*
    */

	private index(request: Request, response: Response, next: NextFunction) {

		parcelService.wrapCall(request, response, async (request) => {
			return await Parcel.find({}).exec();

		});

	}

	/**
    * Gets one parcel of the collection
    *
    * @param {Request} request
    * @param {Response} response
    * @param {NextFunction} next
    * 
	* @memberof ParcelApi
	*
    */
	private show(request: Request, response: Response, next: NextFunction) {
		parcelService.wrapCall(request, response, async (request) => {

			const query = {
				_id: request.params.uid
			};

			const parcel = await Parcel.findOne(query);
			if (_.isEmpty(parcel)) {
				throw { httpCode: 404, message: 'Parcel not found' };
			}
			console.log('parcel = ', parcel);

			return parcel;
		});

	}

	/**
    * Store a parcel
    *
    * @param {Request} request
    * @param {Response} response
    * @param {NextFunction} next
    * 
	* @memberof ParcelApi
	*
    */

	private create(request: Request, response: Response, next: NextFunction) {
		parcelService.wrapCall(request, response, async (request) => {
			const parcel = new Parcel(request.body);
			await parcel.save();

			return parcel;
		});
	}

	/**
    * Update a parcel
    *
    * @param {Request} request
    * @param {Response} response
    * @param {NextFunction} next
	* 
	* @memberof ParcelApi
    */

	private update(request: Request, response: Response, next: NextFunction) {

		parcelService.wrapCall(request, response, async (request) => {

			const query = {
				_id: request.params.uid
			};

			const replacement = {
				$set: request.body
			};

			const options = {
				new: true
			};

			return await Parcel.findOneAndUpdate(query, replacement, options);
		});

	}

	/**
    * Destroy a parcel
    *
    * @param {Request} request
    * @param {Response} response
    * @param {NextFunction} next
	* 
    * @memberof ParcelApi
    */

	private destroy(request: Request, response: Response, next: NextFunction) {

		parcelService.wrapCall(request, response, async (request) => {

			const query = {
				_id: request.params.uid
			};
			return await Parcel.findOneAndDelete(query);
		});

	}

	/**
    * Estimate a parcel cost
    *
    * @param {Request} request
    * @param {Response} response
    * @param {NextFunction} next
	* 
    * @memberof ParcelApi
    */

	public estimate(request: Request, response: Response, next: NextFunction) {

		parcelService.wrapCall(request, response, async (request) => {

			const query = {
				_id: request.params.uid
			};

			const parcel = await Parcel.findOne(query);
			if (_.isEmpty(parcel)) {
				throw { httpCode: 404, message: 'Parcel not found' };
			}

			let unitPrice;
			if (parcel.type === 'classic') {
				if (parcel.weight < 0.5) {
					unitPrice = 6;
				} else if (parcel.weight < 1) {
					unitPrice = 7;
				} else if (parcel.weight < 2) {
					unitPrice = 9;
				} else {
					unitPrice = 1;
				}
			} else if (parcel.type === 'express') {
				if (parcel.weight < 0.5) {
					unitPrice = 10;
				} else if (parcel.weight < 1) {
					unitPrice = 12;
				} else if (parcel.weight < 2) {
					unitPrice = 15;
				} else {
					unitPrice = 4;
				}
			}

			const price = unitPrice * _.ceil(parcel.weight, 1);
			return { price };
		});
	}

}

const parcelApi = new ParcelApi();
parcelApi.init();
export default parcelApi.router;
