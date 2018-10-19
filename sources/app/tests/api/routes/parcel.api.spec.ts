import * as _ from 'lodash';

import * as chai from 'chai';
const expect = chai.expect;

import chaiHttp = require('chai-http');
chai.use(chaiHttp);

import Parcel = require('./../../../src/models/parcel.model');

let stub = null;
const hooks = {
    before: () => { },
    beforeEach: () => { },
    afterEach: () => { },
    after: async () => {
        for (const parcel of parcels) {

            const options = {
                method: 'delete',
                uri: '/parcel/' + parcel._id
            };

            await request(options);
        }
    },
};

const parcels = [];

const config = {

    'Parcel CRUD => nominal cases': [
        {
            title: 'Create a parcel',

            perform: async () => {
                const options = {
                    method: 'post',
                    uri: '/parcel',
                    params: {
                        type: 'classic',
                        weight: 1.5,
                        volume: 14,
                        recipient: 'John Doe',
                        address: '1 rue du Maine',
                        city: 'Sartrouville',
                        zipcode: '78500'
                    }
                };

                return await request(options);
            },
            expected: (result) => {
                expect(result).to.have.status(200);
                expect(result).to.be.an('object');
                parcels.push(result.body);
            }
        },
        {
            title: 'Get all parcels',

            before: async () => {
                const options = {
                    method: 'post',
                    uri: '/parcel',
                    params: {
                        type: 'express',
                        weight: 3,
                        volume: 5,
                        recipient: 'Jane Fonda',
                        address: '21 avenue Victor Hugo',
                        city: 'Paris',
                        zipcode: '75016'
                    }
                };

                const result = await request(options);
                expect(result).to.have.status(200);
                parcels.push(result.body);

            },

            perform: async () => {
                const options = {
                    method: 'get',
                    uri: '/parcel'
                };

                return await request(options);
            },
            expected: (result) => {
                expect(result).to.have.status(200);
                expect(result.body.length).to.be.equal(parcels.length);
                // expect(result.body).to.be.equal(parcels);
            }
        },
        {
            title: 'Show a parcel',
            perform: async () => {
                const options = {
                    method: 'get',
                    uri: '/parcel/' + parcels[1]._id
                };

                return await request(options);

            },
            expected: (result) => {
                expect(result).to.have.status(200);

                expect(result.body).to.be.eql(parcels[1]);
            }
        },
        {
            title: 'Estimate parcel cost - 1',

            perform: async () => {
                const options = {
                    method: 'get',
                    uri: '/parcel/' + parcels[0]._id + '/estimate'
                };

                return await request(options);
            },
            expected: (result) => {
                expect(result).to.have.status(200);
                expect(result.body).to.be.eql({ price: 13.5 });
            }
        },
        {
            title: 'Update a parcel',

            perform: async () => {
                const options = {
                    method: 'put',
                    uri: '/parcel/' + parcels[0]._id,
                    params: {
                        type: 'express',
                        weight: 45,
                        volume: 13,
                        recipient: 'James Dean',
                        address: '21 avenue Victor Hugo',
                        city: 'Paris',
                        zipcode: '75016'
                    }
                };

                return await request(options);
            },
            expected: (result) => {
                expect(result).to.have.status(200);

                expect(result.body).to.be.eql({
                    _id: parcels[0]._id,
                    type: 'express',
                    weight: 45,
                    volume: 13,
                    recipient: 'James Dean',
                    address: '21 avenue Victor Hugo',
                    city: 'Paris',
                    zipcode: '75016',
                    __v: 0
                });
            }
        },
        {
            title: 'Estimate parcel cost - 2',

            perform: async () => {
                const options = {
                    method: 'get',
                    uri: '/parcel/' + parcels[0]._id + '/estimate'
                };

                return await request(options);
            },
            expected: (result) => {
                expect(result).to.have.status(200);
                expect(result.body).to.be.eql({ price: 180 });
            }
        },
        {
            title: 'Delete a parcel',
            perform: async () => {
                const options = {
                    method: 'delete',
                    uri: '/parcel/' + parcels[0]._id
                };

                return await request(options);
            },
            expected: (result) => {
                expect(result).to.have.status(200);
            }
        },
        {
            title: 'Check if the parcel has actually been deleted',
            perform: async () => {
                const options = {
                    method: 'get',
                    uri: '/parcel/' + parcels[0]._id
                };

                return await request(options);
            },
            catched: (result) => {
                expect(result).to.have.status(404);
            }
        }
    ]
};


function request(options) {

    const method = options.method;
    const uri = options.uri || '';
    const params = options.params;

    let query = chai.request('http://localhost:7000')[method](uri);

    if (params) {
        query = query.send(params);
    }

    return query;
}

function runTest(config) {
    _.each(config, (values, key) => {
        before(async () => {
            hooks.before && await hooks.before();
        });

        after(async () => {
            hooks.after && await hooks.after();

        });

        beforeEach(async () => {
            hooks.beforeEach && await hooks.beforeEach();
        });

        afterEach(async () => {
            hooks.afterEach && await hooks.afterEach();
        });

        describe(key, () => {

            before(async () => {
                _.get(hooks, [key, 'before']) && await hooks[key].before();
            });

            after(async () => {
                _.get(hooks, [key, 'after']) && await hooks[key].after();

            });

            beforeEach(async () => {
                _.get(hooks, [key, 'beforeEach']) && await hooks[key].beforeEach();
            });

            afterEach(async () => {
                _.get(hooks, [key, 'afterEach']) && await hooks[key].afterEach();
            });

            _.each(values, (value) => {
                it(value.title, async () => {
                    try {
                        value.before && await value.before();

                        const result = await value.perform();
                        value.expected && await value.expected(result);

                        value.after && await value.after();

                    } catch (error) {
                        if (!value.catched) {
                            throw error;
                        }
                        value.catched(error);
                    }
                });
            });
        });
    });
}

runTest(config);
