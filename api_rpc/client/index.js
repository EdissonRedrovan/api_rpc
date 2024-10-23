const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_FILE = './proto/product.proto';

const packageDefinition = protoLoader.loadSync(PROTO_FILE, {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true
});

const productProto = grpc.loadPackageDefinition(packageDefinition).ProductService;

const client = new productProto(
    'localhost:50051',
    grpc.credentials.createInsecure()
);

module.exports = client;