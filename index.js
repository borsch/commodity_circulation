const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const url = require('url');
const path = require('path');
const database = require('./src/assets/js/database');
const config = require('electron-node-config');

let browser_window;
let product_window;
let income_product_window;
let outcome_product_window;
let import_products_window;
let product_history_window;

app.on('ready', () => {
    create_window();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', () => {
  if (browser_window === null) {
      create_window();
  }
});

ipcMain.on('on_add_product', function(event, data) {
    database.add_product(data, function(product){
        if (product) {
            product.old = !!data.id;

            browser_window.webContents.send('on_add_product_add_success', product);
            product_window.close();
        } else {
            product_window.webContents.send('on_add_product_add_fail', null);
        }
    });
});

ipcMain.on('product_history_load', function(event, data){
    if (!product_history_window)
        product_history_window_create();

    setTimeout(function(){
        product_history_window.webContents.send('load_history', data);
    }, 500);
});

ipcMain.on('product_edit', function(event, data){
    if (!product_window)
        add_product_window();

    setTimeout(function(){
        product_window.webContents.send('load_product', data);
    }, 1000);
});

function create_window() {
    browser_window = new BrowserWindow({
        width: 1000,
        height: 600,
        devTools: true
    });

    browser_window.loadURL(url.format ({
        pathname: path.join(__dirname, `src/views/index.html`),
        protocol: 'file:',
        slashes: true
    }));

    if (config.get('dev_tools')) {
        browser_window.webContents.openDevTools();
    }

    browser_window.setMenu(create_menu());

    browser_window.on('closed', () => {
        browser_window = null
    });
}

function create_menu() {
    const menu_template = [
        {
            label: 'Товари',
            submenu: [
                {
                    label: 'Додати товар',
                    click: function() {
                        if (!product_window)
                            add_product_window();
                    }
                }, {
                    label: 'Форма приходу товару',
                    click: function() {
                        if (!income_product_window)
                            income_product_window_create();
                    }
                }, {
                    label: 'Форма розходу товару',
                    click: function() {
                        if (!income_product_window)
                            outcome_product_window_create();
                    }
                }
            ]
        }, {
            label: 'Вигляд',
            submenu: [
                {
                    label: 'Список товарів',
                    click: function() {
                        browser_window.webContents.send('on_menu_product_perspective', {});
                    }
                }, {
                    label: 'Прихід-розхід',
                    click: function() {
                        browser_window.webContents.send('on_menu_income_perspective', {});
                    }
                }
            ]
        }, {
            label: 'Імпорт',
            submenu: [
                {
                    label: 'Імпорт товарів',
                    click: function() {
                        if (!import_products_window)
                            import_products_window_create();
                    }
                }
            ]
        }
    ];

    return Menu.buildFromTemplate(menu_template);
}

function add_product_window() {
    product_window = new BrowserWindow({
        width: 600,
        height: 700,
        devTools: true,
        title: 'Додати товар'
    });

    product_window.loadURL(url.format ({
        pathname: path.join(__dirname, `src/views/add_product_form.html`),
        protocol: 'file:',
        slashes: true
    }));

    if (config.get('dev_tools')) {
        product_window.webContents.openDevTools();
    }

    product_window.on('closed', () => {
        product_window = null
    });

    product_window.show();
    product_window.setMenu(Menu.buildFromTemplate([]));
}

function income_product_window_create() {
    income_product_window = new BrowserWindow({
        width: 600,
        height: 700,
        devTools: true,
        title: 'Прихід товару'
    });

    income_product_window.loadURL(url.format ({
        pathname: path.join(__dirname, `src/views/product_income_form.html`),
        protocol: 'file:',
        slashes: true
    }));

    if (config.get('dev_tools')) {
        income_product_window.webContents.openDevTools();
    }

    income_product_window.on('closed', () => {
        income_product_window = null
    });

    income_product_window.show();
    income_product_window.setMenu(Menu.buildFromTemplate([]));
}

function import_products_window_create() {
    import_products_window = new BrowserWindow({
        width: 600,
        height: 700,
        devTools: true,
        title: 'Розхід товару'
    });

    import_products_window.loadURL(url.format ({
        pathname: path.join(__dirname, `src/views/import_products.html`),
        protocol: 'file:',
        slashes: true
    }));

    if (config.get('dev_tools')) {
        import_products_window.webContents.openDevTools();
    }

    import_products_window.on('closed', () => {
        import_products_window = null
    });

    import_products_window.show();
    import_products_window.setMenu(Menu.buildFromTemplate([]));
}

function outcome_product_window_create() {
  outcome_product_window = new BrowserWindow({
    width: 1100,
    height: 700,
    devTools: true
  });

  outcome_product_window.loadURL(url.format ({
    pathname: path.join(__dirname, `src/views/product_outcome_form.html`),
    protocol: 'file:',
    slashes: true
  }));

  if (config.get('dev_tools')) {
      outcome_product_window.webContents.openDevTools();
  }

  outcome_product_window.on('closed', () => {
    outcome_product_window = null
  });

  outcome_product_window.show();
  outcome_product_window.setMenu(Menu.buildFromTemplate([]));
}

function product_history_window_create() {
    product_history_window = new BrowserWindow({
        width: 600,
        height: 700,
        devTools: true
    });

    product_history_window.loadURL(url.format ({
        pathname: path.join(__dirname, `src/views/product_history.html`),
        protocol: 'file:',
        slashes: true
    }));

    if (config.get('dev_tools')) {
        product_history_window.webContents.openDevTools();
    }

    product_history_window.on('closed', () => {
        product_history_window = null
    });

    product_history_window.show();
    product_history_window.setMenu(Menu.buildFromTemplate([]));
}