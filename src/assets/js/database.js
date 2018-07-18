const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/commodity_circulation');

const Product = mongoose.model('Product', {
    code: { type: String, index: true },
    name: { type: String, index: true },
    unit: String,
    residual: Number,
    purchase_price: Number,
    purchase_price_usd: Number,
    sale_price: Number,
    sale_price_usd: Number
});

const ProductHistory = mongoose.model('ProductHistory', {
    product_code: { type: String, index: true },
    amount: Number,
    purchase_price: Number,
    purchase_price_usd: Number,
    sale_price: Number,
    date: { type: Date, index: true },
    type: String,
    description: String
});

module.exports.add_product = function(product_obj, cb){
    let product = new Product(product_obj);

    product.save(function(error, product){
        if (error) {
            cb && cb(null);
        } else {
            cb && cb(product.toObject());
        }
    });
};

module.exports.get_all_products = function(cb) {
    Product.find({}, function(err, products){
        if (err) {
            cb && cb([]);
        } else {
            cb && cb(products);
        }
    });
};

module.exports.get_product_by_code = function(code, cb) {
    Product.findOne({code: code}, function(error, result){
        cb(error, result);
    });
};

module.exports.get_products_match = function(query, cb) {
    let regex_expression = { $regex: new RegExp(query, "ig") };

    Product.find({$or: [{ name : regex_expression }, { code : regex_expression }] }, function(err, products) {
        if (err) {
            cb && cb([]);
        } else {
            cb && cb(products);
        }
    });
};

module.exports.product_income = function(income, cb) {
    module.exports.get_product_by_code(income.product_code, function(error, product){
        if (error || !product) {
            cb('Немає товару з таким кодом');
        } else {
            if (income.type === 'outcome') {
                if (!product.residual) {
                    product.residual = 0;
                }

                if ((product.residual - income.amount) < 0) {
                    cb('На складі є лише ' + (product.residual || 0) + ' одиниць цього товару');
                    return;
                }
            }

            let updated_product = {
                residual: (income.type === 'outcome' ? -1 : 1) * income.amount + (product.residual || 0)
            };

            if (income.purchase_price) {
                updated_product.purchase_price = income.purchase_price;
            }

            if (income.purchase_price_usd) {
                updated_product.purchase_price_usd = income.purchase_price_usd;
            }

            if (income.sale_price) {
                updated_product.sale_price = income.sale_price;
            }

            update_product(
                product, updated_product,
                function(error) {
                    if (error) {
                        update_product(product, null, function(){
                            cb('Невдалось зберегти прихід');
                        });
                    } else {
                        let product_history_obj = new ProductHistory(income);

                        product_history_obj.save(function(error){
                            if (error) {
                                update_product(product, null, function(){
                                    cb('Невдалось зберегти історію товару');
                                });
                            } else {
                                cb(null, true);
                            }
                        });
                    }
                }
            );
        }
    })
};

/**
 *
 * @param outcomes {Array}
 * @param cb {Function}
 */
module.exports.add_product_outcome_batch = function(outcomes, cb) {
    let product_codes = outcomes.map(function(item){
        return item.product_code;
    });

    Product
        .find({code: {$in: product_codes}})
        .exec(function(error, result) {
            if (result) {
                let not_available_errors = [];

                outcomes.forEach(function (outcome) {
                    result.forEach(function(product){
                        if (product.code === outcome.product_code) {
                            if (product.residual - outcome.amount < 0) {
                                not_available_errors.push('Товару (' + product.name + ') доступно лише ' + product.residual + ' ' + product.unit);
                            }
                        }
                    });
                });

                if (not_available_errors.length > 0) {
                    cb && cb(not_available_errors.join(', '));
                    return;
                }

                outcomes.forEach(function(outcome){
                    result.forEach(function(product){
                        if (product.code === outcome.product_code) {
                            let updated_product = {
                                residual: outcome.amount - (product.residual || 0),
                                sale_price: parseFloat(outcome.sale_price)
                            };

                            update_product(
                                product, updated_product,
                                function () {
                                    let product_history_obj = new ProductHistory(outcome);

                                    product_history_obj.save();
                                }
                            );
                        }
                    });
                });

                cb && cb(null, true);
            } else {
                cb && cb('Невдалось знайти таких товарів');
            }
        });
};

module.exports.get_products_history_period = function(query, cb) {
    let criteria = { },
        sort = query.sort || { };

    if (query.from && query.till) {
        criteria.date = {'$gte': query.from, '$lte': query.till};
    }

    if (query.product_code) {
        criteria.product_code = {'$eq': query.product_code}
    }

    ProductHistory
        .find(criteria)
        .sort(sort)
        .exec(function(error, result) {
            cb(error, result);
        });
};


function update_product(product, new_values, cb) {
    Product.findByIdAndUpdate(
        product.id,
        new_values || product,
        {
            new: true
        },
        function(error, result) {
            cb(error, result);
        }
    )
}