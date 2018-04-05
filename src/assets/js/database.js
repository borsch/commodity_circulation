const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/commodity_circulation');

const Product = mongoose.model('Product', {
  code: String,
  name: String,
  unit: String,
  residual: Number,
  purchase_price: Number,
  purchase_price_usd: Number,
  sale_price: Number
});

const ProductIncome = mongoose.model('ProductIncome', {
  product_code: String,
  amount: Number,
  purchase_price: Number,
  purchase_price_usd: Number,
  sale_price: Number,
  income_date: Date
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

module.exports.product_income = function(income, cb) {
  Product.find({code: income.product_code}, function(err, result){
    if (err || !result || !result.length) {
      cb('Немає товару з таким кодом');
    } else {
      let product = result[0];

      update_product(
        product, {
          residual: income.amount + (product.residual || 0),
          purchase_price: income.purchase_price,
          purchase_price_usd: income.purchase_price_usd,
          sale_price: income.sale_price
        },
        function(error) {
          if (error) {
            update_product(product, function(){
              cb('Невдалось зберегти прихід');
            });
          } else {
            let product_income_obj = new ProductIncome(income);

            product_income_obj.save(function(error){
              if (error) {
                update_product(product, function(){
                  cb('Невдалось зберегти прихід');
                });
              } else {
                cb(null, true);
              }
            });
          }
        }
      );
    }
  });
};


function update_product(product, new_values, cb) {
  Product.findByIdAndUpdate(
    product._id,
    new_values || product,
    {
      new: true
    },
    function(error, result) {
      cb(error, result);
    }
  )
}