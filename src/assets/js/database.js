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
    type: String
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

            update_product(
                product, {
                    residual: (income.type === 'outcome' ? -1 : 1) * income.amount + (product.residual || 0),
                    purchase_price: income.purchase_price,
                    purchase_price_usd: income.purchase_price_usd,
                    sale_price: income.sale_price
                },
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

module.exports.get_products_history_period = function(from, till, cb) {
    ProductHistory
        .find({date: {'$gte': from, '$lte': till}})
        .exec(function(error, result) {
            cb(error, result);
        });
};


function update_product(product, new_values, cb) {
    console.log(product);
    console.log(new_values);

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