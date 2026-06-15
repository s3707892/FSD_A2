// handles user registration, login and profile updates with validation
import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { Person } from "../entity/Person";
import { Vendor } from "../entity/Vendor";
import bcrypt from 'bcrypt';

// regex patterns used to validate email and australian phone numbers
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^(\+?61|0)[2-478](\s?\d){8}$/;

// validate password strength and return an error message or null if valid
const validatePassword = (pw: string): string | null => {
    if (!pw || pw.length < 6) return 'Password must be at least 6 characters.';
    if (!/[A-Z]/.test(pw)) return 'Password must contain an uppercase letter.';
    if (!/[a-z]/.test(pw)) return 'Password must contain a lowercase letter.';
    if (!/[^A-Za-z0-9]/.test(pw)) return 'Password must contain a special character.';
    return null;
};

export class UserController {
    private userRepository = AppDataSource.getRepository(User);

    async findAll(req: Request, res: Response) {
        const users = await this.userRepository.find();
        return res.json(users);
    }

    async findOne(req: Request, res: Response) {
        const user = await this.userRepository.findOne({
            where: { userId: parseInt(req.params.id) },
            relations: ["person", "vendor", "role"],
        });
        return res.json(user);
    }

    async checkLogin(req: Request, res: Response) {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

        try {
            // find user by email only then verify the password against the stored hash
            const user = await this.userRepository.findOne({
                where: { email },
                relations: ["person", "vendor", "role"],
            });
            if (!user) return res.status(401).json({ error: "Invalid email or password" });

            // check bcrypt hash first, then fall back to plain text for legacy users
            let passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch && password === user.password) {
                // plain text match — upgrade to hash silently
                user.password = await bcrypt.hash(password, 10);
                await this.userRepository.save(user);
                passwordMatch = true;
            }
            if (!passwordMatch) return res.status(401).json({ error: "Invalid email or password" });

            // return a structured user object with role and profile fields
            return res.json({
                message: "Login successful",
                user: {
                    userId: user.userId,
                    email: user.email,
                    phone: user.phone,
                    role: user.role?.roleName,
                    firstName: user.person?.firstName,
                    lastName: user.person?.lastName,
                    businessName: user.vendor?.businessName,
                    joinedAt: user.createdAt,
                },
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Server error" });
        }
    }

    async update(req: Request, res: Response) {
        const { firstName, lastName, phone } = req.body;
        const userId = parseInt(req.params.id);
        if (isNaN(userId)) return res.status(400).json({ error: 'Invalid user ID.' });
        if (phone && !phoneRegex.test(phone.replace(/\s/g, '')))
            return res.status(400).json({ error: 'Invalid Australian phone number.' });

        try {
            const user = await this.userRepository.findOne({ where: { userId }, relations: ["person"] });
            if (!user) return res.status(404).json({ error: "User not found" });
            if (phone) { user.phone = phone; await this.userRepository.save(user); }
            if ((firstName || lastName) && user.person) {
                const personRepo = AppDataSource.getRepository(Person);
                if (firstName) user.person.firstName = firstName;
                if (lastName) user.person.lastName = lastName;
                await personRepo.save(user.person);
            }
            return res.json({ message: "User updated" });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to update user" });
        }
    }

    async create(req: Request, res: Response) {
        const { email, password, phone, roleId, firstName, lastName, businessName } = req.body;

        // Backend validation
        if (!email || !emailRegex.test(email))
            return res.status(400).json({ error: 'Valid email is required.' });
        const passErr = validatePassword(password);
        if (passErr) return res.status(400).json({ error: passErr });
        if (!phone) return res.status(400).json({ error: 'Phone is required.' });
        if (!roleId) return res.status(400).json({ error: 'Role is required.' });
        if ((roleId === 1 || roleId === 3) && (!firstName || !lastName))
            return res.status(400).json({ error: 'First and last name are required for hirers.' });
        if (roleId === 2 && !businessName)
            return res.status(400).json({ error: 'Business name is required for vendors.' });

        try {
            // reject if email is already registered to prevent duplicates
            const existing = await this.userRepository.findOne({ where: { email } });
            if (existing) return res.status(409).json({ error: 'Email is already registered.' });

            // hash the password before storing it in the database
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = this.userRepository.create({ email, password: hashedPassword, phone, role: { roleId } });
            await this.userRepository.save(user);

            // save the correct profile type based on the chosen role
            if (roleId === 1 || roleId === 3) {
                const personRepo = AppDataSource.getRepository(Person);
                await personRepo.save(personRepo.create({ userId: user.userId, firstName, lastName }));
            }
            if (roleId === 2) {
                const vendorRepo = AppDataSource.getRepository(Vendor);
                await vendorRepo.save(vendorRepo.create({ userId: user.userId, businessName }));
            }

            return res.status(201).json({ message: "User created", userId: user.userId });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to create user" });
        }
    }
}
