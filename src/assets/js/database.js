const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/commodity_circulation');

const Product = mongoose.model('Product', {
    code: String,
    name: String,
    unit: String
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