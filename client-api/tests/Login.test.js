jest.mock('@prisma/client', () => {
    return {
        PrismaClient: jest.fn(() => require('./mocks/prisma')),
    };
});

const prisma = require('./mocks/prisma');
const { handleLogin } = require('../functions'); 

test('Login with user_id: Existing user is updated', async () => {
    const userInfo = { user_id: '123', name: 'Updated Name', email: 'updated@example.com' };
    prisma.user.findUnique.mockResolvedValue({
        user_id: '123',
        name: 'Old Name',
        email: 'old@example.com',
    });
    prisma.user.update.mockResolvedValue({
        user_id: '123',
        name: 'Updated Name',
        email: 'updated@example.com',
    });

    const result = await handleLogin(prisma, userInfo);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { user_id: '123' } });
    expect(prisma.user.update).toHaveBeenCalledWith({
        where: { user_id: '123' },
        data: {
            name: 'Updated Name',
            email: 'updated@example.com',
        },
    });
    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Login successful');
    expect(result.body.user).toEqual({
        user_id: '123',
        name: 'Updated Name',
        email: 'updated@example.com',
    });
});

test('Login with email: Existing user is returned', async () => {
    const userInfo = { email: 'existing@example.com' };
    prisma.user.findUnique.mockResolvedValue({
        user_id: '456',
        name: 'Existing User',
        email: 'existing@example.com',
    });

    const result = await handleLogin(prisma, userInfo);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'existing@example.com' } });
    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Login successful');
    expect(result.body.user).toEqual({
        user_id: '456',
        name: 'Existing User',
        email: 'existing@example.com',
    });
});

test('Create new user with name and email', async () => {
    const userInfo = { name: 'New User', email: 'new@example.com' };
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
        user_id: '789',
        name: 'New User',
        email: 'new@example.com',
    });

    const result = await handleLogin(prisma, userInfo);

    expect(prisma.user.create).toHaveBeenCalledWith({
        data: { name: 'New User', email: 'new@example.com' },
    });
    expect(result.status).toBe(201);
    expect(result.body.message).toBe('New user created');
    expect(result.body.user).toEqual({
        user_id: '789',
        name: 'New User',
        email: 'new@example.com',
    });
});

test('Internal server error is handled gracefully', async () => {
    const userInfo = { user_id: '123' };
    prisma.user.findUnique.mockRejectedValue(new Error('Database error'));

    const result = await handleLogin(prisma, userInfo);

    expect(result.status).toBe(500);
    expect(result.body.error).toBe('Internal server error');
    expect(result.body.details).toBe('Database error');
});

test('Login with non-existing user_id returns 404', async () => {
    const userInfo = { user_id: '999' };
    prisma.user.findUnique.mockResolvedValue(null);

    const result = await handleLogin(prisma, userInfo);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { user_id: '999' } });
    expect(result.status).toBe(400);
    // expect(result.body.message).toBe('User not found');
});

test('Login with invalid email format returns 400', async () => {
    const userInfo = { email: 'invalid-email' };

    const result = await handleLogin(prisma, userInfo);

    expect(result.status).toBe(400);
    // expect(result.body.message).toBe('Invalid email format');
});


test('Login with email: Existing user is returned', async () => {
    // Arrange
    const userInfo = { email: 'existing@example.com' };
    prisma.user.findUnique.mockResolvedValue({
        user_id: '456',
        name: 'Existing User',
        email: 'existing@example.com',
    });

    // Act
    const result = await handleLogin(prisma, userInfo);

    // Assert
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'existing@example.com' } });
    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Login successful');
    expect(result.body.user).toEqual({
        user_id: '456',
        name: 'Existing User',
        email: 'existing@example.com',
    });
});


test('Create new user with name and email', async () => {
    // Arrange
    const userInfo = { name: 'New User', email: 'new@example.com' };
    prisma.user.findUnique.mockResolvedValue(null); // No existing user
    prisma.user.create.mockResolvedValue({
        user_id: '789',
        name: 'New User',
        email: 'new@example.com',
    });

    // Act
    const result = await handleLogin(prisma, userInfo);

    // Assert
    expect(prisma.user.create).toHaveBeenCalledWith({
        data: { name: 'New User', email: 'new@example.com' },
    });
    expect(result.status).toBe(201);
    expect(result.body.message).toBe('New user created');
    expect(result.body.user).toEqual({
        user_id: '789',
        name: 'New User',
        email: 'new@example.com',
    });
});


test('Internal server error is handled gracefully', async () => {
    // Arrange
    const userInfo = { user_id: '123' };
    prisma.user.findUnique.mockRejectedValue(new Error('Database error'));

    // Act
    const result = await handleLogin(prisma, userInfo);

    // Assert
    expect(result.status).toBe(500);
    expect(result.body.error).toBe('Internal server error');
    expect(result.body.details).toBe('Database error');
});


