const prisma = {
    user: {
        findUnique: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
    },
};

module.exports = prisma;
