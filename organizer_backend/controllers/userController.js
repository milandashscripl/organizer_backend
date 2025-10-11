const registerUser = async (req, res) => {
  try {
    const { name, address, email, contact, password, foodPreference } = req.body;
    const profilePicture = req.file; // multer stores file here

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      address,
      email,
      contact,
      password: hashedPassword,
      foodPreference,
      profilePicture: profilePicture ? profilePicture.buffer : null, // optional
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
