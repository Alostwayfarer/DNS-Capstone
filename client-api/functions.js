const handleLogin = async (prisma, userInfo) => {
    const { user_id, name, email } = userInfo;

    try {
        // Case 1: Check by user_id if provided
        if (user_id) {
            const userById = await prisma.user.findUnique({
                where: { user_id: user_id },
            });

            if (userById) {
                // Update existing user if name or email changed
                const updatedUser = await prisma.user.update({
                    where: { user_id: user_id },
                    data: {
                        name: name || userById.name,
                        email: email || userById.email,
                    },
                });

                return {
                    status: 200,
                    body: {
                        message: "Login successful",
                        user: {
                            user_id: updatedUser.user_id,
                            name: updatedUser.name,
                            email: updatedUser.email,
                        },
                    },
                };
            }
        }

        // Case 2: Check by email
        if (email) {
            const userByEmail = await prisma.user.findUnique({
                where: { email: email },
            });

            if (userByEmail) {
                return {
                    status: 200,
                    body: {
                        message: "Login successful",
                        user: {
                            user_id: userByEmail.user_id,
                            name: userByEmail.name,
                            email: userByEmail.email,
                        },
                    },
                };
            }
        }

        // Case 3: Create new user if name and email provided
        if (name && email) {
            const newUser = await prisma.user.create({
                data: {
                    name,
                    email,
                },
            });

            return {
                status: 201,
                body: {
                    message: "New user created",
                    user: {
                        user_id: newUser.user_id,
                        name: newUser.name,
                        email: newUser.email,
                    },
                },
            };
        }

        // No matching cases
        return {
            status: 400,
            body: {
                error: "Insufficient information. Provide either user_id or both name and email",
            },
        };
    } catch (error) {
        console.error("Login error:", error);
        return {
            status: 500,
            body: {
                error: "Internal server error",
                details: error.message,
            },
        };
    }
};


module.exports = { handleLogin };