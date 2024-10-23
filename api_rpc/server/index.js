const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { Sequelize, DataTypes } = require('sequelize');

const PROTO_FILE = './proto/product.proto';

// Configuración de la conexión a PostgreSQL
const sequelize = new Sequelize('northwind', 'admin', 'admin123', {
    host: 'localhost',
    dialect: 'postgres',
    port: 5432,
    logging: false
});

// Definir el modelo Product
const Product = sequelize.define('Product', {
    product_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        field: 'product_id'
    },
    product_name: {
        type: DataTypes.STRING,
        field: 'product_name'
    },
    supplier_id: {
        type: DataTypes.INTEGER,
        field: 'supplier_id'
    },
    category_id: {
        type: DataTypes.INTEGER,
        field: 'category_id'
    },
    quantity_per_unit: {
        type: DataTypes.STRING,
        field: 'quantity_per_unit'
    },
    unit_price: {
        type: DataTypes.FLOAT,
        field: 'unit_price'
    },
    units_in_stock: {
        type: DataTypes.INTEGER,
        field: 'units_in_stock'
    },
    units_on_order: {
        type: DataTypes.INTEGER,
        field: 'units_on_order'
    },
    reorder_level: {
        type: DataTypes.INTEGER,
        field: 'reorder_level'
    },
    discontinued: {
        type: DataTypes.BOOLEAN,
        field: 'discontinued'
    }
}, {
    tableName: 'products',
    timestamps: false
});

async function main() {
    const packageDefinition = protoLoader.loadSync(PROTO_FILE, {
        keepCase: true,
        longs: String,
        enums: String,
        arrays: true
    });

    const productProto = grpc.loadPackageDefinition(packageDefinition).ProductService;
    const server = new grpc.Server();

    server.addService(productProto.service, {
        getProducts: async (_, callback) => {
            try {
                const products = await Product.findAll();
                callback(null, { products });
            } catch (error) {
                callback({
                    code: grpc.status.INTERNAL,
                    details: 'Error interno al obtener productos'
                });
            }
        },
        getProductById: async (call, callback) => {
            try {
                const product = await Product.findByPk(call.request.product_id);
                if (product) {
                    callback(null, product);
                } else {
                    callback({
                        code: grpc.status.NOT_FOUND,
                        details: 'Producto no encontrado'
                    });
                }
            } catch (error) {
                callback({
                    code: grpc.status.INTERNAL,
                    details: 'Error interno al buscar producto'
                });
            }
        }
    });

    await server.bindAsync(
        '127.0.0.1:50051',
        grpc.ServerCredentials.createInsecure(),
        () => {
            server.start();
            console.log('Server running at http://127.0.0.1:50051');
        }
    );
}

main().catch(console.error);