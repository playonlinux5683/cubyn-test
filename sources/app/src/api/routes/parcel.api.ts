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
    * Estimate a parcel cost. Choice has been made to compute it before saving or updating parce lentry in database.
	* Another choice: compute it when getting a parcel from database.
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

			const price = parcelService.estimate(parcel);

			return { price };
		});
	}

}

const parcelApi = new ParcelApi();
parcelApi.init();
export default parcelApi.router;
