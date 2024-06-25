const mysql = require('mysql2/promise');
const config = require('./config');
const { sendOrderConfirmation } = require('./email');

async function executePOS() {
    const items = ['BL0001', 'SP0004'];
    const customerAddress = "45 Princes St, Edinburgh EH10 7TG";
    const customerEmail = "arinadobryden@outlook.com";
    const couponCode = "XYZ123";

    const connection = await mysql.createConnection(config.db);
    await connection.execute('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
    console.log('Isolation level has been set to READ COMMITTED');

    await connection.beginTransaction();
    try {
        await connection.execute('SELECT id, name FROM products WHERE code IN (?, ?) FOR UPDATE', items);
        console.log(`Locked rows for codes ${items.join()}`);
        const [itemsToOrder,] = await connection.execute(
            'SELECT name, stock, price from products WHERE code IN (?, ?) ORDER BY id', items
        );
        console.log('Selected stock quantities for items');

        let orderTotal = 0;
        let orderItems = [];
        for (const itemToOrder of itemsToOrder) {
            if (itemToOrder.stock < 1) {
                throw new Error(`One of the items is out of stock: ${itemToOrder.name}`);
            }
            console.log(`Stock for ${itemToOrder.name} is ${itemToOrder.stock}`);
            orderTotal += parseFloat(itemToOrder.price);
            orderItems.push(itemToOrder.name);
        }
        orderTotal = orderTotal.toFixed(2);

        await connection.execute('INSERT INTO orders (items, total) VALUES (?, ?)', 
            [orderItems.join(), orderTotal]
        );
        console.log(`Order created`);

        await connection.execute('UPDATE products SET stock = stock - 1 WHERE code IN (?, ?)', items);
        console.log(`Deducted stock by 1 for ${items.join()}`);

        await sendOrderConfirmation(customerEmail, `Items: ${orderItems.join()}, Total: ${orderTotal}`);

        await connection.commit();
        const [rows,] = await connection.execute('SELECT LAST_INSERT_ID() as order_id');
        console.log(`Order created with ID ${rows[0].order_id}`);
    } catch (err) {
        console.error(`Error occurred while creating order: ${err.message}`, err);
        await connection.rollback();
        console.info('Rollback successful');
    } finally {
        await connection.end();
    }
}

(async function testTransaction() {
    await executePOS();
    process.exit(0);
})();
