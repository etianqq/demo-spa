/**
 * Created by linaqiu on 2016/7/20.
 */
var CleanWebpackPlugin = require('clean-webpack-plugin');
/*------------------------- webpack loader -------------------------*/
var es6_loader = {
    test: /\.js|\.jsx|\.es6$/,
    loader: 'babel',
    exclude: /node_modules/,
    query: {
        presets: ['es2015']
    }
};

var sass_loader = {
    test: /\.scss$/,
    loaders: ["style", "css", "sass"]
};

var image_loader = {
    test: /\.(png|jpg)$/,
    loader: 'url-loader?limit=8192'
};
//可根据不同需要自定义list的值
var loaderList = [es6_loader, sass_loader, image_loader];

/*------------------------- webpack plugin -------------------------*/
var clean_plugin = new CleanWebpackPlugin(['js_online'], {
    verbose: true,
    dry: false
});

var pluginList = [clean_plugin];

/*------------------------- webpack config -------------------------*/
module.exports = [
    {
        entry: {
            accountManager: './src/js_template/accountManager/accountManager.js',
            backlogAudit: './src/js_template/backlogAudit/backlogAudit.js',
            brokerCompany: './src/js_template/brokerCompany/brokerCompany.js',
            merchantManager: './src/js_template/merchantManager/merchantManager.js',
            operationLog: './src/js_template/operationLog/operationLog.js',
            orderManager: './src/js_template/orderManager/orderManager.js',
            productManager: './src/js_template/productManager/productManager.js',
            mainPage: './src/js_template/mainPage/mainPage.js'
        },
        output: {
            path: './src/js_online',
            filename: '[name].js'
        },
        plugins: pluginList,
        module: {
            loaders: loaderList
        }
    }];