import { Request, Response } from 'express';
import * as _ from 'lodash';

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

    private findCost(costs, weight, defaultValue) {
        const result = _.find(costs, (cost) => {
            return weight < cost.weight
        });

        return (!_.isUndefined(result)) ? result.cost : defaultValue;
    }

    public estimate(parcel) {
        const matrix = {
            classic: {
                costs: [
                    {
                        weight: 0.5,
                        cost: 6
                    },
                    {
                        weight: 1,
                        cost: 7
                    },
                    {
                        weight: 2,
                        cost: 9
                    }
                ],
                defaultValue: 1
            },
            express: {
                costs: [
                    {
                        weight: 0.5,
                        cost: 10
                    },
                    {
                        weight: 1,
                        cost: 12
                    },
                    {
                        weight: 2,
                        cost: 15
                    }
                ],
                defaultValue: 4
            }
        };

        const unitPrice = this.findCost(matrix[parcel.type].costs, parcel.weight, matrix[parcel.type].defaultValue);
        // TODO: check _.ceil result
        const price = unitPrice * _.ceil(parcel.weight, 1);

        return price;

    }
}

const parcelService = new ParcelService();
export default parcelService;
