// Mock database
const users: Map<string, UserProfile> = new Map();

users.set('pattararnx@gmail.com', {
    email: 'pattararnx@gmail.com',
    firstName: 'ภัทรภร',
    lastName: 'พจนาพิมล',
    registeredAt: new Date('2025-11-19'),
});

export const userDB = {
    exists: (email: string) : boolean => {
        return users.has(email);
    },

    get:(email: string) : UserProfile | undefined =>{
        return users.get(email);
    },

    create: (email: string, firstName: string, lastName: string): UserProfile => {
        if(users.has(email)) {
            throw new Error('User already exists');
        }

        const user: UserProfile = {
            email,
            firstName,
            lastName,
            registeredAt: new Date(),
        };

        users.set(email, user);
        return user;
    }
}